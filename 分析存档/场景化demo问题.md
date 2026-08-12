# WebView 平台差异对比

## ref.postMessage（RN → WebView）

- Demo 路径：`webviewSamples/scenes/02_Injection/index.tsx`（测试点5: postMessage）

### 差异项

| 项目 | iOS | Android | 鸿蒙 |
|------|-----|---------|------|
| 事件派发目标 | `window` | `document` | `document` |
| `bubbles` 属性 | 不适用（直接在 window 上派发） | `false`（`new MessageEvent` 未指定 bubbles，默认为 false） | `false`（同 Android） |
| 兼容 fallback | 无 | 有（`document.createEvent` + `initMessageEvent`，bubbles 为 true） | 有（同 Android） |
| `window.addEventListener('message')` 能否收到 | ✅ 能 | ❌ 不能（事件在 document 上派发且不冒泡到 window） | ❌ 不能（同 Android） |
| `document.addEventListener('message')` 能否收到 | ❌ 不能（事件在 window 上派发） | ✅ 能 | ✅ 能 |

### 影响

- **iOS**：Web 页面需使用 `window.addEventListener('message', handler)` 监听
- **Android / 鸿蒙**：Web 页面需使用 `document.addEventListener('message', handler)` 监听，`window.addEventListener` 无法收到事件
- **跨平台兼容方案**：同时监听 `window` 和 `document`，或使用 `injectJavaScript` 自行 dispatch

### 源码

#### iOS（`apple/RNCWebViewImpl.m:1111-1119`）

```objc
- (void)postMessage:(NSString *)message
{
  NSDictionary *eventInitDict = @{@"data": message};
  NSString *source = [NSString
                      stringWithFormat:@"window.dispatchEvent(new MessageEvent('message', %@));",
                      RCTJSONStringify(eventInitDict, NULL)
  ];
  [self injectJavaScript: source];
}
```

实际注入的 JS：

```javascript
window.dispatchEvent(new MessageEvent('message', {"data": "hello"}));
```

#### Android（`android/src/main/java/com/reactnativecommunity/webview/RNCWebViewManagerImpl.kt:323-341`）

```kotlin
"postMessage" -> try {
  val eventInitDict = JSONObject()
  eventInitDict.put("data", args.getString(0))
  webView.evaluateJavascriptWithFallback(
    "(function () {" +
      "var event;" +
      "var data = " + eventInitDict.toString() + ";" +
      "try {" +
      "event = new MessageEvent('message', data);" +
      "} catch (e) {" +
      "event = document.createEvent('MessageEvent');" +
      "event.initMessageEvent('message', true, true, data.data, data.origin, data.lastEventId, data.source);" +
      "}" +
      "document.dispatchEvent(event);" +
      "})();"
  )
} catch (e: JSONException) {
  throw RuntimeException(e)
}
```

实际注入的 JS（主路径）：

```javascript
(function () {
  var event;
  var data = {"data": "hello"};
  try {
    event = new MessageEvent('message', data);  // bubbles 默认 false
  } catch (e) {
    event = document.createEvent('MessageEvent');
    event.initMessageEvent('message', true, true, data.data, data.origin, data.lastEventId, data.source);  // bubbles = true
  }
  document.dispatchEvent(event);
})();
```

#### 鸿蒙（`ohos/harmony/rn_webview/src/main/ets/WebViewBaseOperate.ets:289-307`）

```typescript
postMessage(args: string[]) {
  let data = JSON.stringify({ data: args[0] })
  let result: string = "(function () {" +
    "var event;" +
    "var data = " + data.toString() + ";" +
    "try {" +
    "event = new MessageEvent('message', data);" +
    "} catch (e) {" +
    "event = document.createEvent('MessageEvent');" +
    "event.initMessageEvent('message', true, true, data.data, data.origin, data.lastEventId, data.source);" +
    "}" +
    "document.dispatchEvent(event);" +
    "})();"
  try {
    this.controller.runJavaScript(result)
  } catch (error) {
    Logger.error(TAG, `[RNOH] postMessage Errorcode: ${error.code}`);
  }
}
```

实际注入的 JS（与 Android 完全一致）：

```javascript
(function () {
  var event;
  var data = {"data": "hello"};
  try {
    event = new MessageEvent('message', data);  // bubbles 默认 false
  } catch (e) {
    event = document.createEvent('MessageEvent');
    event.initMessageEvent('message', true, true, data.data, data.origin, data.lastEventId, data.source);  // bubbles = true
  }
  document.dispatchEvent(event);
})();
```

### 根因分析

Android 和鸿蒙的 `new MessageEvent('message', data)` 中，`data` 为 `{"data": "..."}` 被当作 `MessageEventInit` 字典，**未设置 `bubbles: true`**，默认值为 `false`。事件在 `document` 上派发且不冒泡，因此 `window.addEventListener('message', handler)` 无法收到。

fallback 路径 `initMessageEvent('message', true, true, ...)` 第二个参数 `bubbles = true`，但现代 WebView 均支持 `new MessageEvent`，不会进入 fallback。

iOS 直接在 `window` 上 `dispatchEvent`，不存在此问题。

---

## onOpenWindow 事件（新窗口拦截）

- Demo 路径：`webviewSamples/scenes/01_Navigation/index.tsx`（测试点5: 新窗口拦截）

### 差异项

| 项目 | iOS | Android | 鸿蒙 |
|------|-----|---------|------|
| 事件定义 | 有 | 有 | 有（`generated/components/RNCWebView.ts:467`） |
| 原生回调注册 | 有（`WKUIDelegate.createWebViewWithConfiguration`） | 有（`WebChromeClient.onCreateWindow`） | ❌ 无（未注册 `onNewWindow`/`onCreateSubWindow` 等回调） |
| 事件能否触发 | ✅ 能 | ✅ 能 | ❌ 不能 |
| 拦截后页面状态 | ✅ 保留在原页面（`decisionHandler(WKNavigationActionPolicyCancel)`） | ✅ 保留在原页面（`shouldOverrideUrlLoading` 返回 `true`） | N/A |
| `setSupportMultipleWindows` | 不适用（iOS 通过 `targetFrame == nil` 判断） | 生效（`settings.setSupportMultipleWindows(true)`） | 声明但未使用（无对应原生实现） |
| 未设置 `onOpenWindow` 时的行为 | 在当前 WebView 中加载目标 URL | 在当前 WebView 中加载目标 URL | N/A |

### 影响

- **iOS**：点击 `target="_blank"` 链接或调用 `window.open()` 时，`onOpenWindow` 回调正常触发，页面保留在原状态；未设置 `onOpenWindow` 时会在当前 WebView 中加载目标 URL
- **Android**：点击 `target="_blank"` 链接或调用 `window.open()` 时，`onOpenWindow` 回调正常触发，可通过 `event.nativeEvent.targetUrl` 获取目标 URL
- **鸿蒙**：`onOpenWindow` 回调永远不会触发，无法拦截新窗口打开行为

### 源码

#### iOS（`apple/RNCWebViewImpl.m:390-404`）

```objc
- (WKWebView *)webView:(WKWebView *)webView createWebViewWithConfiguration:(WKWebViewConfiguration *)configuration forNavigationAction:(WKNavigationAction *)navigationAction windowFeatures:(WKWindowFeatures *)windowFeatures
{
  if (!navigationAction.targetFrame.isMainFrame) {
    NSURL *url = navigationAction.request.URL;

    if (_onOpenWindow) {
      NSMutableDictionary<NSString *, id> *event = [self baseEvent];
      [event addEntriesFromDictionary: @{@"targetUrl": url.absoluteString}];
      _onOpenWindow(event);
    } else {
      [webView loadRequest:navigationAction.request];
    }
  }
  return nil;
}
```

此外，iOS 还在 `decidePolicyForNavigationAction` 中优先处理 `onOpenWindow`（`apple/RNCWebViewImpl.m:1351-1362`）：

```objc
if (_onOpenWindow && !hasTargetFrame) {
  // 阻止导航，防止 WebView ref 被替换为目标 URL
  NSMutableDictionary<NSString *, id> *event = [self baseEvent];
  [event addEntriesFromDictionary: @{@"targetUrl": request.URL.absoluteString}];
  decisionHandler(WKNavigationActionPolicyCancel);
  _onOpenWindow(event);
  return;
}
```

iOS 存在两条触发路径：`decidePolicyForNavigationAction` 中通过 `WKNavigationActionPolicyCancel` 阻止导航并手动触发 `_onOpenWindow`，以及 `createWebViewWithConfiguration` 中触发。由于 `decidePolicyForNavigationAction` 先于 `createWebViewWithConfiguration` 执行，实际生效的是前者。

#### Android（`android/src/main/java/com/reactnativecommunity/webview/RNCWebChromeClient.java:88-115`）

```java
@Override
public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
    final WebView newWebView = new WebView(view.getContext());

    if(mHasOnOpenWindowEvent) {
        newWebView.setWebViewClient(new WebViewClient(){
            @Override
            public boolean shouldOverrideUrlLoading (WebView subview, String url) {
                WritableMap event = Arguments.createMap();
                event.putString("targetUrl", url);
                ((RNCWebView) view).dispatchEvent(
                    view,
                    new TopOpenWindowEvent(RNCWebViewWrapper.getReactTagFromWebView(view), event)
                );
                return true;
            }
        });
    }

    final WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
    transport.setWebView(newWebView);
    resultMsg.sendToTarget();

    return true;
}
```

#### 鸿蒙（`ohos/harmony/rn_webview/src/main/ets/RNCWebView.ets`）

鸿蒙 `RNCWebView.ets` 的 `build()` 方法中注册了大量 Web 组件回调（`.onLoadIntercept`、`.onAlert`、`.onConfirm` 等），但**没有注册任何与新窗口相关的回调**（如 `onNewWindow`、`onCreateSubWindow`），因此 `openWindow` 事件虽然定义了但从未被触发。

事件定义存在但无触发源（`ohos/harmony/rn_webview/src/main/ets/generated/components/RNCWebView.ts:467`）：

```typescript
"openWindow": {targetUrl: string}
```

### 根因分析

鸿蒙端缺少 `onCreateWindow` / `onNewWindow` 的原生回调实现。iOS 通过 `WKUIDelegate.createWebViewWithConfiguration` + `decidePolicyForNavigationAction` 拦截新窗口请求，Android 通过 `WebChromeClient.onCreateWindow` 拦截，鸿蒙端需要补充对应的原生回调注册和事件派发逻辑。

---

## onShouldStartLoadWithRequest 拦截自定义 Schema 后的行为

- Demo 路径：`webviewSamples/scenes/01_Navigation/index.tsx`（测试点3: 自定义 Schema 拦截）

### 差异项

| 项目 | iOS | Android | 鸿蒙 |
|------|-----|---------|------|
| 拦截机制 | `WKNavigationDelegate.decidePolicyForNavigationAction` → `WKNavigationActionPolicyCancel` | `WebViewClient.shouldOverrideUrlLoading` 返回 `true` | `Web.onLoadIntercept` 返回 `true` |
| 自定义 Schema 拦截后页面状态 | ✅ 保留在原页面 | ✅ 保留在原页面 | ❌ 跳转到空白页 |
| 拦截后是否触发后续回调 | 不触发（`Cancel` 后无后续） | 不触发（`shouldOverrideUrlLoading` 返回 `true` 后直接阻止） | 仍触发（`onOverrideUrlLoading` 返回 `false`，但页面已不可逆） |

### 影响

- **iOS**：`onShouldStartLoadWithRequest` 返回 `false` 后，自定义 Schema（如 `myapp://`）被拦截，WebView 停留在原页面，用户体验正常
- **Android**：`onShouldStartLoadWithRequest` 返回 `false` 后，自定义 Schema（如 `myapp://`）被拦截，WebView 停留在原页面，用户体验正常
- **鸿蒙**：`onShouldStartLoadWithRequest` 返回 `false` 后，虽然 RN 侧收到了拦截事件，但 WebView 已加载了空白页，页面内容丢失

### 源码

#### iOS（`apple/RNCWebViewImpl.m:1365-1404`）

```objc
if (_onShouldStartLoadWithRequest) {
    int lockIdentifier = [[RNCWebViewDecisionManager getInstance] setDecisionHandler: ^(BOOL shouldStart){
        dispatch_async(dispatch_get_main_queue(), ^{
            if (!shouldStart) {
                decisionHandler(WKNavigationActionPolicyCancel);  // 阻止加载，页面保留原状态
                return;
            }
            // ...允许加载...
            decisionHandler(WKNavigationActionPolicyAllow);
        });
    }];
    // ...发送事件到 JS 侧...
    _onShouldStartLoadWithRequest(event);
    return;
}
```

iOS 通过 `WKNavigationActionPolicyCancel` 阻止导航，WebView 完全不执行该请求，页面状态不变。与 Android 的 `shouldOverrideUrlLoading` 返回 `true` 效果一致。

#### Android（`android/src/main/java/com/reactnativecommunity/webview/RNCWebViewClient.java:98-151`）

```java
@Override
public boolean shouldOverrideUrlLoading(WebView view, String url) {
    final RNCWebView rncWebView = (RNCWebView) view;
    // ...通过 lockIdentifier 同步等待 JS 侧返回结果...
    final boolean shouldOverride = lockObject.get() == ShouldOverrideCallbackState.SHOULD_OVERRIDE;
    return shouldOverride;  // 返回 true = 阻止加载，页面保留原状态
}
```

Android 的 `shouldOverrideUrlLoading` 在 URL 加载**之前**被调用，返回 `true` 时 WebView 完全不执行该导航请求，页面状态不变。

#### 鸿蒙（`ohos/harmony/rn_webview/src/main/ets/RNCWebView.ets:564-590`）

```typescript
onLoadIntercept(event: OnLoadInterceptEvent): boolean {
    let originWhitelistArr = this.descriptorWrapper.rawProps.originWhitelist;
    let hasOnShouldStartLoadWithRequestEventBool = this.descriptorWrapper.rawProps.hasOnShouldStartLoadWithRequestEvent
    let urlString =
      this.webViewBaseOperate?.verifyURLFormat(event.data.getRequestUrl(), this.source.html, this.source.baseUrl) || "";

    if (this.passesWhitelist(this.compileWhitelist(originWhitelistArr), urlString) &&
      !hasOnShouldStartLoadWithRequestEventBool) {
      return false
    }
    this.webViewBaseOperate?.setLockIdentifier(BaseOperate.generateLockIdentifier())

    const params = new ShouldStartParams();
    params.lockIdentifier = this.webViewBaseOperate?.getLockIdentifier() || -1
    this.ctx.runOnWorkerThread(new WorkerRunnable(), params);
    this.webViewBaseOperate?.emitShouldStartLoadWithRequest(event, this.source.html, this.source.baseUrl)
    const startTime = Date.now();
    while (params.lockState === ShouldOverrideCallbackState.UNDECIDED &&
      Date.now() - startTime < RNCWebView.SHOULD_OVERRIDE_URL_LOADING_TIMEOUT) {
      // 空循环等待
    }

    return params.lockState === ShouldOverrideCallbackState.SHOULD_OVERRIDE;
}
```

同时还有 `onOverrideUrlLoading`（`RNCWebView.ets:592-595`）：

```typescript
onOverrideUrlLoading(event: WebResourceRequest) {
    this.webViewBaseOperate?.emitShouldStartLoadWithRequestOverrideUrlLoading(event)
    return false  // 始终返回 false，不阻止加载
}
```

### 根因分析

#### JS `return false` 的完整链路（三个平台一致）

```
用户代码: onShouldStartLoadWithRequest → return false
  ↓
WebViewShared.tsx:67 → shouldStart = onShouldStartLoadWithRequest(nativeEvent) → shouldStart = false
  ↓
WebViewShared.tsx:70 → loadRequest(false, url, lockIdentifier)
  ↓
onShouldStartLoadWithRequestCallback(false, url, lockIdentifier)
  ↓
RNCWebViewModule.shouldStartLoadWithLockIdentifier(false, lockIdentifier)
  ↓
原生 TurboModule: shouldStart = false → lockState = SHOULD_OVERRIDE
```

**三个平台到这一步完全一致**，`lockState` 都被设为 `SHOULD_OVERRIDE`，问题不在 JS→原生的通信链路。

#### 原生侧如何使用 `lockState`（存在语义反转）

JS 侧 `return false`（不加载）→ 原生侧 `lockState = SHOULD_OVERRIDE` → 原生回调返回 `true`。这里存在一层语义反转：

| | JS 侧含义 | 原生 lockState | 原生回调返回值 | 原生回调返回值含义 |
|---|---|---|---|---|
| `return false` | 不加载 | `SHOULD_OVERRIDE` | `true` | 阻止/覆盖此次导航 |
| `return true` | 允许加载 | `ALLOW_LOADING` | `false` | 不阻止，允许导航 |

三个平台的原生回调都遵循这个语义反转，**这是设计意图，不是 bug**。

#### 真正的差异：原生 API 对自定义 Schema 的拦截能力

| | iOS | Android | 鸿蒙 |
|---|---|---|---|
| 原生回调返回 `true` 后 | `WKNavigationActionPolicyCancel` → 完全阻止导航 | `shouldOverrideUrlLoading` 返回 `true` → 完全阻止导航 | `onLoadIntercept` 返回 `true` → 对自定义 Schema 仍可能触发导航 |
| 页面状态 | ✅ 保留原页面 | ✅ 保留原页面 | ❌ 空白页 |

鸿蒙 `onLoadIntercept` 对自定义 Schema 的处理存在两个问题：

1. **`onLoadIntercept` 的拦截能力不足**：虽然返回 `true` 声明了拦截，但鸿蒙 Web 组件对非标准 Schema（如 `myapp://`）仍会触发页面导航流程，导致页面内容被清空并显示空白页
2. **`onOverrideUrlLoading` 始终返回 `false`**：即使 `onLoadIntercept` 已拦截，`onOverrideUrlLoading` 仍被调用且返回 `false`，这可能导致自定义 Schema 的请求被放行到系统层面处理，而系统无法识别 `myapp://` 导致加载空白页

iOS 的 `WKNavigationActionPolicyCancel` 和 Android 的 `shouldOverrideUrlLoading` 返回 `true` 后，WebView 完全不执行该导航，不存在后续回调。鸿蒙需要在 `onOverrideUrlLoading` 中对自定义 Schema 也返回 `true` 以阻止加载，或确保 `onLoadIntercept` 返回 `true` 后不会继续触发后续导航流程。

---

## 加载生命周期事件（onLoadStart / onLoadEnd / onError / onHttpError）

- Demo 路径：`webviewSamples/scenes/04_Loading/index.tsx`

### 差异项

| 项目 | Android | 鸿蒙 |
|------|---------|------|
| **loadStart 触发时机** | `doUpdateVisitedHistory` 回调（URL 变更时） | `onPageBegin` + `onProgressChange` fallback |
| **loadStart URL 来源** | 回调参数 `url`（准确） | `this.controller.getUrl()`（可能滞后） |
| **loadEnd URL 来源** | 回调参数 `url`（准确） | `this.controller.getUrl()`（可能滞后） |
| **Error URL 来源** | 回调参数 `failingUrl`（准确） | `this.controller.getUrl()`（可能滞后） |
| **onError 时是否先发 loadEnd** | ✅ 是（先发 `loadingFinish` 再发 `loadingError`） | ❌ 否（直接发 `loadingError`） |
| **onError 后是否阻止 loadEnd** | ✅ 是（`mLastLoadFailed` 标志阻止 `onPageFinished`） | ❌ 否（`onLoadFinished`/`onPageEnd` 仍会触发） |
| **onHttpError description** | `getReasonPhrase()`（如 "Not Found"） | `getResponseData()`（HTTP 响应体，可能为空） |
| **onHttpError 主帧检查** | ✅ `request.isForMainFrame()` | ❌ 无检查 |
| **页面内链接跳转是否触发 loadStart** | ✅ 是 | ❌ 可能不触发 |

### 影响

- **鸿蒙**：点击页面内链接（如 gotoPage1）不输出 loadStart
- **鸿蒙**：onHttpError 的 `description` 为空字符串
- **鸿蒙**：Load 404 后无 loadStart，再 Load 500 后 loadStart 显示 404 的 URL，loadEnd 显示 500 的 URL（URL 不匹配）
- **鸿蒙**：Load Valid 后再 Invalid URL，多输出一个 loadStart（显示 Valid 的 URL），且缺少 Invalid URL 的 loadStart

### 源码

#### Android（`android/src/main/java/com/reactnativecommunity/webview/RNCWebViewClient.java`）

**loadStart**（`RNCWebViewClient.java:78-86`）— 由 `doUpdateVisitedHistory` 触发，URL 取回调参数：

```java
@Override
public void doUpdateVisitedHistory (WebView webView, String url, boolean isReload) {
  super.doUpdateVisitedHistory(webView, url, isReload);
  ((RNCWebView) webView).dispatchEvent(
    webView,
    new TopLoadingStartEvent(
      RNCWebViewWrapper.getReactTagFromWebView(webView),
      createWebViewEvent(webView, url)));
}
```

**loadEnd**（`RNCWebViewClient.java:57-75`）— `mLastLoadFailed` 标志阻止错误后的 loadEnd：

```java
@Override
public void onPageFinished(WebView webView, String url) {
    super.onPageFinished(webView, url);
    if (!mLastLoadFailed) {
        // ... emit loadingFinish ...
    }
}
```

**onError**（`RNCWebViewClient.java:222-255`）— 先发 loadEnd 再发 error，URL 取 `failingUrl`：

```java
@Override
public void onReceivedError(WebView webView, int errorCode, String description, String failingUrl) {
    super.onReceivedError(webView, errorCode, description, failingUrl);
    mLastLoadFailed = true;
    emitFinishEvent(webView, failingUrl);  // 先发 loadEnd
    WritableMap eventData = createWebViewEvent(webView, failingUrl);
    eventData.putDouble("code", errorCode);
    eventData.putString("description", description);
    // ... dispatch loadingError ...
}
```

**onHttpError**（`RNCWebViewClient.java:258-273`）— 主帧检查 + `getReasonPhrase()`：

```java
@Override
public void onReceivedHttpError(WebView webView, WebResourceRequest request,
        WebResourceResponse errorResponse) {
    super.onReceivedHttpError(webView, request, errorResponse);
    if (request.isForMainFrame()) {
        WritableMap eventData = createWebViewEvent(webView, request.getUrl().toString());
        eventData.putInt("statusCode", errorResponse.getStatusCode());
        eventData.putString("description", errorResponse.getReasonPhrase());
        // ... dispatch httpError ...
    }
}
```

**createWebViewEvent**（`RNCWebViewClient.java:312-323`）— 使用回调参数 URL，不用 `webView.getUrl()`：

```java
protected WritableMap createWebViewEvent(WebView webView, String url) {
    WritableMap event = Arguments.createMap();
    // Don't use webView.getUrl() here, the URL isn't updated to the new value yet in callbacks
    // like onPageFinished
    event.putString("url", url);
    // ...
}
```

#### 鸿蒙（`ohos/harmony/rn_webview/src/main/ets/RNCWebView.ets` + `WebViewBaseOperate.ets`）

**loadStart**（`RNCWebView.ets:479-490`）— `onPageBegin` 有条件判断，条件反了：

```typescript
onPageBegin() {
  try {
    if (this.controller.getUrl() === this.url) {
      this.onLoadingStart();
    }
    // ...
}
```

`this.url` 仅在 `onDescriptorWrapperChange` 中更新（`RNCWebView.ets:932`），即仅 source prop 变更时更新。页面内链接跳转不会触发 `onDescriptorWrapperChange`，`this.url` 保持旧值。此时 `this.controller.getUrl()` 返回新 URL，`this.url` 为旧 URL，两者不等，`onLoadingStart()` 不被调用。

**loadStart fallback**（`RNCWebView.ets:197-208`）— `onProgressChange` 补偿，但有时序问题：

```typescript
onProgressChange(event: OnProgressChangeEvent) {
  this.progress = event.newProgress
  if (this.controller.getUrl() !== this.url && this.progress < ONE_HUNDRED && this.allowPageStartInProgress) {
    this.allowPageStartInProgress = false;
    this.onLoadingStart();
  }
  // ...
}
```

**emitLoadingStart**（`WebViewBaseOperate.ets:82-97`）— URL 取 `this.controller.getUrl()`，可能滞后：

```typescript
emitLoadingStart(params: ProgressInterface) {
  try {
    this.eventEmitter!.emit('loadingStart', {
      url: this.controller.getUrl(),  // ← 可能是旧 URL
      // ...
    })
  } catch (error) { ... }
}
```

**emitLoadingError**（`WebViewBaseOperate.ets:116-136`）— 无 loadEnd 前置，URL 取 `controller.getUrl()`：

```typescript
emitLoadingError(event: OnErrorReceiveEvent) {
  try {
    if (!event.request.isMainFrame()) {
      return;
    }
    this.eventEmitter!.emit('loadingError', {
      url: this.controller.getUrl(),  // ← 可能是旧 URL
      // ...
      domain: "",
      code: event.error.getErrorCode(),
      description: event.error.getErrorInfo()
    })
  } catch (error) { ... }
}
```

**emitHttpError**（`WebViewBaseOperate.ets:138-153`）— description 取了响应体而非原因短语：

```typescript
emitHttpError(event: OnHttpErrorReceiveEvent) {
  try {
    this.eventEmitter!.emit('httpError', {
      url: this.controller.getUrl(),  // ← 可能是旧 URL
      // ...
      description: event.response.getResponseData(),  // ← 响应体，非 reason phrase
      statusCode: event.response.getResponseCode()
    })
  } catch (error) { ... }
}
```

### 根因分析

#### 问题1：页面内链接跳转不输出 loadStart

`RNCWebView.ets:481` 的条件 `this.controller.getUrl() === this.url` 逻辑错误：

- `this.url` 仅在 source prop 变更时更新，页面内链接跳转不触发 `onDescriptorWrapperChange`
- 跳转后 `this.controller.getUrl()` 返回新 URL，`this.url` 为旧 URL，两者不等
- 条件不满足，`onLoadingStart()` 不被调用

`onProgressChange` fallback 虽然能补偿，但存在时序问题：`onProgressChange` 触发时 `this.controller.getUrl()` 可能仍返回旧 URL，导致 fallback 也无法触发。

Android 的 `doUpdateVisitedHistory` 在 URL 变更时无条件触发，不存在此问题。

#### 问题2：onHttpError description 为空

`WebViewBaseOperate.ets:147` 使用 `event.response.getResponseData()` 获取 description，这返回的是 **HTTP 响应体**（HTML 内容），而非 HTTP 状态原因短语。当服务器返回 404/500 且响应体为空时，`getResponseData()` 返回空字符串。

Android 使用 `errorResponse.getReasonPhrase()`（如 "Not Found"、"Internal Server Error"），始终有值。

#### 问题3：loadStart/loadEnd URL 不匹配

所有事件派发方法都使用 `this.controller.getUrl()` 获取 URL，而 `controller.getUrl()` 返回的是**当前时刻**的 URL，而非触发该事件的 URL。在回调时序上：

1. 点击 Load 404 → `onPageBegin` 触发，但 `controller.getUrl()` 返回旧 URL（因为 404 页面还没开始加载），条件不满足，不输出 loadStart
2. 点击 Load 500 → `onProgressChange` fallback 触发，但 `controller.getUrl()` 返回的是 404 页面的 URL（当前页面），loadStart 显示 404 的 URL
3. 500 页面加载完成 → `onLoadFinished` 触发，`controller.getUrl()` 返回 500 的 URL，loadEnd 显示 500 的 URL

Android 的 `createWebViewEvent` 使用回调参数 URL，并注释说明：**"Don't use webView.getUrl() here, the URL isn't updated to the new value yet in callbacks like onPageFinished"**（`RNCWebViewClient.java:314-315`）。

#### 问题4：Load Valid → Invalid URL 多输出 loadStart 且缺少 Invalid URL 的 loadStart

1. Valid 页面加载成功，输出 loadStart（Valid URL）和 loadEnd（Valid URL）
2. 加载 Invalid URL → `onPageBegin` 触发，`controller.getUrl()` 返回 Valid URL，`this.url` 为 Invalid URL，两者不等，`onLoadingStart()` 不被调用
3. `onProgressChange` fallback 触发，`emitLoadingStart` 使用 `controller.getUrl()` 返回 Valid URL → **多输出一个 loadStart（Valid URL）**
4. `onErrorReceive` 触发，输出 loadingError
5. `onLoadFinished`/`onPageEnd` 可能仍触发，输出 loadEnd（Valid URL）→ loadEnd 显示 Valid URL
6. Invalid URL 本身从未触发 loadStart → **缺少 Invalid URL 的 loadStart**

Android 的 `onReceivedError` 会先发 `loadingFinish` 再发 `loadingError`，且 `mLastLoadFailed` 标志阻止后续 `onPageFinished` 重复触发。鸿蒙缺少这两个机制。

---

## 滚动条指示器属性（showsVerticalScrollIndicator / showsHorizontalScrollIndicator）

- Demo 路径：`webviewSamples/scenes/05_Scroll/index.tsx`（测试点4）

### 差异项

| 项目 | Android | 鸿蒙 |
|------|---------|------|
| `showsVerticalScrollIndicator` 动态切换 | ✅ 支持 | ❌ 不支持动态切换 |
| `showsHorizontalScrollIndicator` 功能 | ✅ 有效 | ❌ 属性已设置但无效 |
| 对应原生 API | `setVerticalScrollBarEnabled()` | `.verticalScrollBarAccess()` |
| 对应原生 API | `setHorizontalScrollBarEnabled()` | `.horizontalScrollBarAccess()` |

### 影响

- **鸿蒙**：`showsVerticalScrollIndicator` 切换后滚动条状态不变，需重新加载页面才能生效
- **鸿蒙**：`showsHorizontalScrollIndicator` 始终无效，无论设置 true/false 都不显示/隐藏水平滚动条

### 源码

#### Android（`android/src/main/java/com/reactnativecommunity/webview/RNCWebViewManagerImpl.kt`）

Android 通过 `ViewManager` 的属性 setter 实现动态更新，每次 prop 变更都会调用 `settings.setVerticalScrollBarEnabled()` / `settings.setHorizontalScrollBarEnabled()`，立即生效。

#### 鸿蒙（`ohos/harmony/rn_webview/src/main/ets/RNCWebView.ets:730-731`）

```typescript
.horizontalScrollBarAccess(this.descriptorWrapper.rawProps.showsHorizontalScrollIndicator)
.verticalScrollBarAccess(this.descriptorWrapper.rawProps.showsVerticalScrollIndicator)
```

鸿蒙在 `build()` 方法中直接读取 `descriptorWrapper.rawProps` 的值，但 `RNCWebView` 组件中只有 `@State` 修饰的属性变化才会触发 UI 重新渲染。`showsHorizontalScrollIndicator` 和 `showsVerticalScrollIndicator` 没有用 `@State` 修饰，而是通过 `descriptorWrapper.rawProps` 读取，prop 变更后不会触发 `build()` 重新执行，导致属性无法动态切换。

### 根因分析

**问题1：`showsVerticalScrollIndicator` 无法动态切换**

鸿蒙 ArkUI 的 `Web` 组件属性（如 `.verticalScrollBarAccess()`）在 `build()` 中声明式设置，只有当组件重新渲染时才会更新。`showsVerticalScrollIndicator` 的值通过 `descriptorWrapper.rawProps` 读取，prop 变更时 `onDescriptorWrapperChange` 会被调用，但 `build()` 中这些属性没有绑定到 `@State` 变量，不会触发重新渲染。

**问题2：`showsHorizontalScrollIndicator` 无效**

鸿蒙 Web 组件的 `horizontalScrollBarAccess` API 可能对水平滚动条的显示/隐藏控制存在限制，或者该属性仅在特定场景（如内容宽度超出视口）下才生效。Android 的 `setHorizontalScrollBarEnabled` 直接控制 View 层面的滚动条绘制，而鸿蒙的 Web 组件可能将水平滚动条交由内核内部管理，`horizontalScrollBarAccess` 对其无实际控制力。

---

## javaScriptEnabled 动态切换无效

- Demo 路径：`webviewSamples/scenes/06_Security/index.tsx`（测试点1）

### 差异项

| 项目 | Android | 鸿蒙 |
|------|---------|------|
| `javaScriptEnabled` 动态切换 | ✅ 支持（`settings.javaScriptEnabled = enabled`） | ❌ 不支持动态切换 |
| 切换后已加载页面 JS 是否立即失效 | ✅ 是 | ❌ 否，JS 仍可执行 |
| 切换后 `injectJavaScript` 是否仍可执行 | ❌ 否（JS 已禁用） | ✅ 是（JS 仍可执行） |

### 影响

- **鸿蒙**：切换 `javaScriptEnabled` 为 `false` 后，页面内 JS 仍可正常执行（如时钟仍走、按钮仍可点击），`injectJavaScript` 也仍可注入脚本

### 源码

#### Android（`android/src/main/java/com/reactnativecommunity/webview/RNCWebViewManagerImpl.kt:546-549`）

```kotlin
fun setJavaScriptEnabled(viewWrapper: RNCWebViewWrapper, enabled: Boolean) {
    val view = viewWrapper.webView
    view.settings.javaScriptEnabled = enabled
}
```

Android 通过 `ViewManager` 的属性 setter，每次 prop 变更时直接修改 `WebSettings.javaScriptEnabled`，立即生效。

#### 鸿蒙（`ohos/harmony/rn_webview/src/main/ets/RNCWebView.ets:728`）

```typescript
.javaScriptAccess(this.javaScriptEnable)
```

`javaScriptEnable` 是普通成员变量（`RNCWebView.ets:68`），不是 `@State` 修饰。虽然 `initVariable()` 中会更新 `this.javaScriptEnable`（`RNCWebView.ets:941`），但 `build()` 方法不会因普通变量变更而重新执行，`javaScriptAccess` 的值不会更新。

### 根因分析

与 `showsVerticalScrollIndicator` 同理，`javaScriptEnable` 不是 `@State` 变量，prop 变更不会触发 `build()` 重新渲染。即使 `initVariable()` 中更新了 `this.javaScriptEnable`，`.javaScriptAccess(this.javaScriptEnable)` 使用的仍是旧值。

此外，鸿蒙 Web 组件的 `javaScriptAccess` API 可能仅在页面加载时生效，对已加载的页面可能无法动态切换 JS 能力。Android 的 `WebSettings.javaScriptEnabled` 则可以在运行时动态修改，已加载的页面会立即受到影响。

---

## forceDarkOn / textZoom 不支持动态切换

- Demo 路径：`webviewSamples/scenes/07_Appearance/index.tsx`（测试点1、测试点5）

### 差异项

| 项目 | Android | 鸿蒙 |
|------|---------|------|
| `forceDarkOn` 动态切换 | ✅ 支持（`setForceDark()`） | ❌ 不支持动态切换 |
| `textZoom` 动态切换 | ✅ 支持（`settings.textZoom = value`） | ❌ 不支持动态切换 |
| `forceDarkOn` 对应原生 API | `WebSettings.setForceDark()` | `.darkMode()` + `.forceDarkAccess()` |
| `textZoom` 对应原生 API | `WebSettings.setTextZoom()` | `.textZoomRatio()` |

### 影响

- **鸿蒙**：切换 `forceDarkOn` 开关后，页面深色模式不跟随变化
- **鸿蒙**：切换 `textZoom` 开关后，页面文字大小不跟随变化

### 源码

#### 鸿蒙（`ohos/harmony/rn_webview/src/main/ets/RNCWebView.ets:733-737`）

```typescript
.textZoomRatio(this.descriptorWrapper.rawProps.textZoom)
.backgroundColor(BaseOperate.getColorMode(this.ctx.uiAbilityContext,
    this.descriptorWrapper.rawProps.forceDarkOn) === WebDarkMode.On ? Color.White : Color.Transparent)
.darkMode(BaseOperate.getColorMode(this.ctx.uiAbilityContext, this.descriptorWrapper.rawProps.forceDarkOn))
.forceDarkAccess(this.forceDark)
```

`forceDarkOn` 和 `textZoom` 都直接读取 `descriptorWrapper.rawProps`，与 `showsVerticalScrollIndicator` 问题相同：prop 变更后不会触发 `build()` 重新渲染，属性值不会更新。

### 根因分析

**根本原因一致：鸿蒙端大量属性未使用 `@State` 修饰，导致无法动态切换。**

`RNCWebView` 组件中只有以下属性使用了 `@State`（`RNCWebView.ets:82-91`）：

```typescript
@State nestedScroll: NestedScrollMode = NestedScrollMode.SELF_FIRST;
@State webviewWidth: number = ZERO;
@State webviewHeight: number = ZERO;
@State isRefreshing: boolean = false;
@State isFullScreen: boolean = false;
@State mode: MixedMode = MixedMode.All;
```

而以下属性都是普通成员变量，prop 变更不会触发 `build()` 重新渲染：

| 属性 | 行号 | 问题 |
|------|------|------|
| `javaScriptEnable` | 68 | 动态切换无效 |
| `forceDark` | 70 | 动态切换无效 |
| `minFontSize` | 71 | 动态切换无效 |
| `overScrollMode` | 72 | 动态切换无效 |
| `scrollEnabled` | 81 | 动态切换无效 |
| `showsHorizontalScrollIndicator` | rawProps 读取 | 动态切换无效 |
| `showsVerticalScrollIndicator` | rawProps 读取 | 动态切换无效 |
| `textZoom` | rawProps 读取 | 动态切换无效 |
| `forceDarkOn` | rawProps 读取 | 动态切换无效 |

Android 通过 `ViewManager` 的属性 setter 机制，每次 prop 变更都会调用对应的 setter 方法（如 `setJavaScriptEnabled`、`setForceDark`、`setTextZoom`），直接修改 `WebSettings` 并立即生效。鸿蒙需要将这些属性改为 `@State` 修饰，或在 `onDescriptorWrapperChange` 中手动触发组件更新。

---

## userAgent 设置无效

- Demo 路径：`webviewSamples/scenes/08_UserAgent/index.tsx`（测试点2、测试点3）

### 差异项

| 项目 | Android | 鸿蒙 |
|------|---------|------|
| `userAgent` 动态切换 | ✅ 支持（`setUserAgentString()` 立即生效） | ❌ 不支持动态切换 |
| `applicationNameForUserAgent` 动态切换 | ✅ 支持（拼接到默认 UA 尾部） | ❌ 不支持动态切换 |
| `userAgent` 与 `applicationNameForUserAgent` 优先级 | ✅ `userAgent` 优先，`applicationNameForUserAgent` 被忽略 | ❌ 逻辑错误，`applicationNameForUserAgent` 会覆盖 `userAgent` |
| `applicationNameForUserAgent` 拼接方式 | 默认 UA + 空格 + 应用名 | 当前 UA（已被覆盖）+ 应用名（无空格） |

### 影响

- **鸿蒙**：切换 `userAgent` 或 `applicationNameForUserAgent` 开关后，页面 User-Agent 不变
- **鸿蒙**：同时设置 `userAgent` 和 `applicationNameForUserAgent` 时，`applicationNameForUserAgent` 会覆盖 `userAgent` 的设置，且拼接时缺少空格

### 源码

#### Android（`android/src/main/java/com/reactnativecommunity/webview/RNCWebViewManagerImpl.kt:227-258`）

```kotlin
fun setUserAgent(viewWrapper: RNCWebViewWrapper, userAgent: String?) {
    mUserAgent = userAgent
    setUserAgentString(viewWrapper)
}

fun setApplicationNameForUserAgent(viewWrapper: RNCWebViewWrapper, applicationName: String?) {
    when {
        applicationName != null -> {
            val defaultUserAgent = WebSettings.getDefaultUserAgent(viewWrapper.webView.context)
            mUserAgentWithApplicationName = "$defaultUserAgent $applicationName"
        }
        else -> {
            mUserAgentWithApplicationName = null
        }
    }
    setUserAgentString(viewWrapper)
}

private fun setUserAgentString(viewWrapper: RNCWebViewWrapper) {
    val view = viewWrapper.webView
    when {
        mUserAgent != null -> {
            view.settings.userAgentString = mUserAgent
        }
        mUserAgentWithApplicationName != null -> {
            view.settings.userAgentString = mUserAgentWithApplicationName
        }
        else -> {
            view.settings.userAgentString = WebSettings.getDefaultUserAgent(view.context)
        }
    }
}
```

Android 的实现：
1. 通过 `ViewManager` 属性 setter，prop 变更时立即调用 `setUserAgentString()`
2. **`userAgent` 优先**：`mUserAgent != null` 时直接使用，`applicationNameForUserAgent` 被忽略
3. `applicationNameForUserAgent` 使用 `WebSettings.getDefaultUserAgent()` 获取系统默认 UA，拼接时加空格

#### 鸿蒙（`ohos/harmony/rn_webview/src/main/ets/WebViewBaseOperate.ets:266-279`）

```typescript
setCustomUserAgent(customUserAgent?: string, applicationNameForUserAgent?: string): void {
    try {
      if (customUserAgent) {
        let userAgent: string = customUserAgent;
        this.controller.setCustomUserAgent(userAgent);
      }
      if (applicationNameForUserAgent) {
        this.controller.setCustomUserAgent(`${this.controller.getUserAgent()}${applicationNameForUserAgent}`);
      }
    } catch (error) {
      Logger.debug(TAG,
        `[RNOH] setCustomUserAgent ErrorCode: ${error.code}, userAgent: ${customUserAgent}`);
    }
}
```

调用位置仅在 `controllerAttachedInit()`（`RNCWebView.ets:455-456`）：

```typescript
controllerAttachedInit(): void {
    this.controllerAttached = true;
    this.eventEmitter = new RNC.RNCWebView.EventEmitter(this.ctx.rnInstance, this.tag)
    this.webViewBaseOperate = new BaseOperate(this.eventEmitter, this.controller)
    this.webViewBaseOperate.setCustomUserAgent(this.descriptorWrapper.rawProps.userAgent,
      this.descriptorWrapper.rawProps.applicationNameForUserAgent)
    // ...
}
```

### 根因分析

#### 问题1：`userAgent` 动态切换无效

`setCustomUserAgent` 仅在 `controllerAttachedInit()` 中调用一次（`RNCWebView.ets:455-456`），即 Web 组件控制器附加时。`onDescriptorWrapperChange()` 中没有调用 `setCustomUserAgent()`，prop 变更后不会更新 User-Agent。

#### 问题2：`applicationNameForUserAgent` 会覆盖 `userAgent`

`setCustomUserAgent` 的逻辑是顺序执行两个 `if`，而非互斥：

```typescript
if (customUserAgent) {
    this.controller.setCustomUserAgent(userAgent);           // 第1步：设置自定义 UA
}
if (applicationNameForUserAgent) {
    this.controller.setCustomUserAgent(                      // 第2步：覆盖为默认UA+应用名
        `${this.controller.getUserAgent()}${applicationNameForUserAgent}`
    );
}
```

当同时设置 `userAgent` 和 `applicationNameForUserAgent` 时：
1. 第1步：`controller.setCustomUserAgent(customUserAgent)` — 设置自定义 UA
2. 第2步：`controller.getUserAgent()` 返回刚设置的自定义 UA，然后拼接 `applicationNameForUserAgent`，**覆盖**了第1步的设置

Android 的 `setUserAgentString()` 使用 `when` 互斥判断，`mUserAgent != null` 时直接使用，`applicationNameForUserAgent` 被忽略。

#### 问题3：`applicationNameForUserAgent` 拼接缺少空格

鸿蒙拼接为 `${this.controller.getUserAgent()}${applicationNameForUserAgent}`，UA 和应用名之间没有空格。Android 拼接为 `"$defaultUserAgent $applicationName"`，有空格。
