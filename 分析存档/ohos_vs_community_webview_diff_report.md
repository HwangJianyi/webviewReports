# 鸿蒙版 WebView (ohos) vs 社区版 WebView (react-native-webview) 实现差异分析报告

> 生成时间: 2026-08-12
> ohos版本: @react-native-ohos/react-native-webview@13.15.4-rc.4
> 社区版本: react-native-webview@13.15.0

---

## 目录

1. [关键架构差异](#1-关键架构差异)
2. [完全缺失的功能](#2-完全缺失的功能)
3. [声明但未实现/空壳的Props](#3-声明但未实现空壳的props)
4. [行为差异（已实现但效果不同）](#4-行为差异已实现但效果不同)
5. [JS层差异](#5-js层差异)
6. [原生层实现差异](#6-原生层实现差异)
7. [Switch语句Fall-through Bug](#7-switch语句fall-through-bug)
8. [默认值差异](#8-默认值差异)
9. [事件数据差异](#9-事件数据差异)
10. [测试用例对照表](#10-测试用例对照表)
11. [新增测试场景说明](#11-新增测试场景说明)

---

## 1. 关键架构差异

| 维度 | 社区版 (Android/iOS) | ohos (鸿蒙) |
|------|---------------------|-------------|
| **消息架构** | Android: 每实例`messagingModuleName` + EventEmitter + CallableModule; iOS: 直接原生事件 | 直接原生事件(与iOS类似), 但**无per-instance消息路由**, 多实例可能消息串扰 |
| **URL拦截** | Android: `Object.wait()/notify()`线程同步; iOS: 纯回调无阻塞 | **忙等待自旋循环**(250ms超时), 可能阻塞UI线程 |
| **原生Web组件** | Android: `android.webkit.WebView`; iOS: `WKWebView` | HarmonyOS `Web`组件 (`@ohos.web.webview`) |
| **JS注入-加载前** | Android: `onPageStarted`回调中调用; iOS: `WKUserScript`声明式 | `javaScriptOnDocumentStart`声明式(与iOS类似) |
| **JS注入-运行时** | 社区版: `injectJavaScript`命令直接执行脚本 | ohos: `injectJavaScript`命令**不包裹IIFE**直接执行 |
| **来源白名单** | 仅JS层校验 | **JS层+原生层双重校验**(ohos独有, 传递originWhitelist到原生) |
| **类型定义** | 各平台有独立Props类型 | 用`IOSWebViewProps`拼凑Android属性, 缺少`HarmonyWebViewProps` |

---

## 2. 完全缺失的功能

### 2.1 Basic Auth (HTTP基本认证) ⚠️ 严重

| | 社区版 | ohos |
|---|---|---|
| `basicAuthCredential` | ✅ Android: `onReceivedHttpAuthRequest`自动填充; iOS: `didReceiveAuthenticationChallenge` | ❌ **完全未实现**, 类型定义中不存在此prop |

**测试用例**: `14_DiffCompare` → "1. Basic Auth", 或访问 `http://localhost:3000/auth`

### 2.2 文件上传 ⚠️ 严重

| | 社区版 | ohos |
|---|---|---|
| `isFileUploadSupported()` | Android: 真实检测; iOS: 返回true | **硬编码返回true** |
| `<input type="file">` | ✅ Android: 完整的文件选择器(相机/相册/文档); iOS: 原生支持 | ❌ **无任何文件选择器实现**, 点击无反应 |

**测试用例**: `14_DiffCompare` → "2. File Upload", 或访问 `http://localhost:3000/form` 中的文件上传区域

### 2.3 SSL错误处理 ⚠️ 中等

| | 社区版 | ohos |
|---|---|---|
| SSL错误回调 | ✅ Android: `onReceivedSslError`详细分类(日期无效/过期/主机不匹配等); iOS: `didReceiveAuthenticationChallenge` | ❌ **无任何SSL错误处理** |

**测试用例**: `14_DiffCompare` → "12. SSL Error", 访问 `https://expired.badssl.com/`

### 2.4 onOpenWindow 事件 ⚠️ 中等

| | 社区版 | ohos |
|---|---|---|
| `onOpenWindow` | ✅ Android: `onCreateWindow`; iOS: `createWebViewWithConfiguration` | ❌ JS层声明了`hasOnOpenWindowEvent`, 但**原生层从未发射openWindow事件** |

**测试用例**: `14_DiffCompare` → "9. onOpenWindow", 或访问 `http://localhost:3000/navigation` 中的 `window.open()` 按钮

### 2.5 指定的iOS专有Props (ohos继承了类型但未实现)

以下Props在ohos的`IOSWebViewProps`类型中声明但**原生层完全没有处理**:

| Prop | 社区版iOS | ohos |
|------|----------|------|
| `allowsInlineMediaPlayback` | ✅ | ❌ |
| `allowsPictureInPictureMediaPlayback` | ✅ | ❌ |
| `allowsAirPlayForMediaPlayback` | ✅ | ❌ |
| `allowsBackForwardNavigationGestures` | ✅ | ❌ |
| `allowsLinkPreview` | ✅ | ❌ |
| `hideKeyboardAccessoryView` | ✅ | ❌ |
| `keyboardDisplayRequiresUserAction` | ✅ (运行时swizzling) | ❌ |
| `sharedCookiesEnabled` | ✅ (WKHTTPCookieStore双向同步) | ❌ |
| `dataDetectorTypes` | ✅ | ❌ |
| `contentMode` | ✅ | ❌ |
| `textInteractionEnabled` | ✅ | ❌ |
| `limitsNavigationsToAppBoundDomains` | ✅ | ❌ |
| `enableApplePay` | ✅ | ❌ |
| `decelerationRate` | ✅ | ❌ |
| `directionalLockEnabled` | ✅ | ❌ |
| `contentInset` | ✅ | ❌ |
| `contentInsetAdjustmentBehavior` | ✅ | ❌ |
| `indicatorStyle` | ✅ | ❌ |
| `pagingEnabled` | ✅ | ❌ |
| `allowingReadAccessToURL` | ✅ | ❌ |
| `suppressMenuItems` | ✅ | ❌ |
| `pullToRefreshEnabled` | ✅ | ❌ |
| `refreshControlLightMode` | ✅ | ❌ |
| `automaticallyAdjustContentInsets` | ✅ | ❌ |

### 2.6 指定的Android专有Props (ohos声明但未实现)

| Prop | 社区版Android | ohos |
|------|-------------|------|
| `androidLayerType` | ✅ | ❌ |
| `allowsProtectedMedia` | ✅ | ❌ |
| `saveFormDataDisabled` | ✅ | ❌ |
| `setBuiltInZoomControls` | ✅ | ❌ |
| `setDisplayZoomControls` | ✅ | ❌ |
| `setSupportMultipleWindows` | ✅ | ❌ |
| `downloadingMessage` | ✅ | ❌ |
| `lackPermissionToDownloadMessage` | ✅ | ❌ |

---

## 3. 声明但未实现/空壳的Props

### 3.1 onRenderExited — 空壳实现 ⚠️ 严重

`WebViewBaseOperate.ets`中的`onRenderExited`方法体为**空**:
```typescript
onRenderExited() {
  try {
    // 空的! 没有发射任何事件到JS
  } catch (err) {
    // ...
  }
}
```
`Magic.ets`中定义了`RenderExitReasonMessage`映射表但**从未使用**。

**测试用例**: `14_DiffCompare` → "10. Render Process"

### 3.2 onTitleReceive — 空壳实现

同样, `WebViewBaseOperate.ets`中的`onTitleReceive`方法体为**空**。

### 3.3 isFileUploadSupported — 硬编码返回true

```typescript
isFileUploadSupported() {
  return Promise.resolve(true);  // 永远返回true, 但实际没有文件上传功能
}
```

### 3.4 shouldStartLoadWithRequestEnabled — 声明但从未设置

在`RNCWebViewNativeComponent.ts`中声明为**必需**的boolean prop, 但JS层**从未传递**此值。

### 3.5 renderMode — 声明但不可用

ohos独有prop, 定义为`WithDefault<"SYNC_RENDER" | "ASYNC_RENDER", "SYNC_RENDER">`, 但JS层**未暴露**, 用户无法设置。

### 3.6 onContentSizeChange — 声明但从未发射

在NativeProps中声明了`contentSizeChange`事件, 但原生层**从未发射**此事件。

### 3.7 onOverrideUrlLoading — 部分实现, 始终返回false

`RNCWebView.ets`中的`onOverrideUrlLoading`方法**始终返回false**(允许加载), 只是再次发射了`shouldStartLoadWithRequest`事件。实际的URL拦截完全依赖`onLoadIntercept`。

---

## 4. 行为差异（已实现但效果不同）

### 4.1 navigationType 始终为 "other" ⚠️ 重要

| | 社区版 | ohos |
|---|---|---|
| `onShouldStartLoadWithRequest`中的`navigationType` | ✅ 区分 `click`/`formsubmit`/`backforward`/`reload`/`formresubmit`/`other` | ❌ **始终为 `"other"`** |

**测试用例**: `14_DiffCompare` → "8. Navigation Type"

### 4.2 isTopFrame 始终为 false ⚠️ 重要

| | 社区版 | ohos |
|---|---|---|
| `ShouldStartLoadRequest`中的`isTopFrame` | ✅ 区分主框架和子框架请求 | ❌ **始终为 `false`** |

### 4.3 injectedJavaScriptForMainFrameOnly 不生效 ⚠️ 重要

| | 社区版 | ohos |
|---|---|---|
| `injectedJavaScriptForMainFrameOnly` | ✅ Android: 大部分不支持但声明; iOS: 通过WKUserScript控制 | ❌ **JS总是注入到iframe中**, 无论此prop设为true还是false |

**测试用例**: `14_DiffCompare` → "7. Iframe Injection", 或 `02_Injection`

### 4.4 thirdPartyCookiesEnabled 默认值不同 ⚠️ 中等

| | 社区版Android | ohos |
|---|---|---|
| 默认值 | `true` | **`false`** |

**测试用例**: `14_DiffCompare` → "13. Cookie Sharing", 或 `06_Security`

### 4.5 applicationNameForUserAgent 行为不同 ⚠️ 中等

| | 社区版Android | ohos |
|---|---|---|
| `applicationNameForUserAgent` | 追加到**默认UA** (`WebSettings.getDefaultUserAgent(context) + " " + appName`) | 追加到`getUserAgent()`(可能是已自定义的UA) |

如果同时设置了`userAgent`和`applicationNameForUserAgent`, ohos可能出现双重设置问题。

**测试用例**: `14_DiffCompare` → "4. User Agent", 或 `08_UserAgent`

### 4.6 userAgent 动态设置可能不生效 ⚠️ 中等

社区版Android的`userAgent`可以动态修改。ohos的`controller.setCustomUserAgent()`可能在组件初始化后无法动态生效。

**测试用例**: `08_UserAgent`

### 4.7 forceDarkOn 动态切换可能不生效 ⚠️ 中等

ohos的`forceDarkOn`和`textZoom`在设置后可能不支持动态切换, 需要重新创建WebView才能生效。

**测试用例**: `14_DiffCompare` → "15. Dark Mode", 或 `07_Appearance`

### 4.8 隐私模式(Incognito)实现差异 ⚠️ 中等

| | 社区版iOS | 社区版Android | ohos |
|---|---|---|---|
| 实现 | `WKWebsiteDataStore.nonPersistentDataStore` (OS级, 从不写入磁盘) | 创建时清除数据 + 禁用缓存 | 创建时设置`CacheMode.Online` + 销毁时清除 |
| 可靠性 | ⭐⭐⭐ 最高 | ⭐⭐ 中等 | ⭐⭐ 中等 (App崩溃则数据可能残留) |

**测试用例**: `06_Security`

### 4.9 地理位置权限处理差异 ⚠️ 中等

| | 社区版Android | ohos |
|---|---|---|
| 权限处理 | 显示原生权限对话框, 用户选择 | **基于prop自动授予/拒绝**, 无用户提示 |

**测试用例**: `14_DiffCompare` → "16. Geolocation", 或 `06_Security`

### 4.10 下载处理差异 ⚠️ 低

| | 社区版Android | 社区版iOS | ohos |
|---|---|---|---|
| 下载管理 | ✅ 完整的DownloadManager(自动下载, 权限处理, 通知) | 仅发射`onFileDownload`事件 | 仅发射`onFileDownload`事件(与iOS类似) |

**测试用例**: `14_DiffCompare` → "3. Download", 或 `11_Download`

### 4.11 Cookie管理差异 ⚠️ 中等

| | 社区版iOS | ohos |
|---|---|---|
| 共享Cookie | ✅ `sharedCookiesEnabled` + `WKHTTPCookieStore`双向同步 | ❌ 无共享Cookie支持 |
| Cookie同步 | ✅ `onPageFinished`中flush; iOS: `WKHTTPCookieStoreObserver`实时监听 | ❌ 无主动同步机制 |
| 第三方Cookie | iOS: 不显式处理 | `WebCookieManager.putAcceptThirdPartyCookieEnabled()` |

### 4.12 Scroll相关差异 ⚠️ 低

| Prop | 社区版 | ohos |
|------|--------|------|
| `showsVerticalScrollIndicator` | ✅ 可动态切换 | ❌ 动态切换不生效 |
| `showsHorizontalScrollIndicator` | ✅ 可动态切换 | ❌ 声明但无效 |
| `overScrollMode` | ✅ 支持 `always`/`content`/`never` | ❌ 仅支持 `always`/`never` |
| `bounces` | ✅ iOS: 弹性滚动 | 通过`overScrollMode`模拟, 效果可能不同 |

**测试用例**: `14_DiffCompare` → "14. Scroll Props", 或 `05_Scroll`

### 4.13 Cache Mode映射差异 ⚠️ 低

ohos的`LOAD_CACHE_ELSE_NETWORK`映射到`CacheMode.None`, 这可能不正确——`None`通常意味着"未设置缓存模式"而非"无网络时使用缓存"。

| 社区版 | ohos映射 | 可能的问题 |
|--------|----------|-----------|
| `LOAD_DEFAULT` | `CacheMode.Default` | ✅ |
| `LOAD_CACHE_ELSE_NETWORK` | `CacheMode.None` | ❌ 语义不匹配 |
| `LOAD_NO_CACHE` | `CacheMode.Online` | ❓ |
| `LOAD_CACHE_ONLY` | `CacheMode.Only` | ✅ |

**测试用例**: `06_Security`

---

## 5. JS层差异

### 5.1 无per-instance消息路由

社区版Android使用`messagingModuleName`为每个WebView实例创建唯一的消息通道, 确保多实例消息不串扰。ohos传递`messagingModuleName=""`(空字符串), **没有实例级消息路由**。

**影响**: 如果ohos TurboModule全局分发消息, 多个WebView实例可能收到彼此的消息。

**测试用例**: `14_DiffCompare` → "17. Multi-Instance Msg"

### 5.2 onShouldStartLoadWithRequest回调差异

| | 社区版Android | ohos (与iOS类似) |
|---|---|---|
| 回调逻辑 | 有`lockIdentifier`时调用`shouldStartLoadWithLockIdentifier`; 无时调用`Commands.loadUrl`作为fallback | **仅**调用`shouldStartLoadWithLockIdentifier`, 忽略URL参数 |

### 5.3 onScroll传递方式差异

| | 社区版Android | ohos |
|---|---|---|
| `onScroll` | 传递`hasOnScroll={!!otherProps.onScroll}`(布尔标志) | 传递`onScroll={onScroll}`(直接事件处理器) |

### 5.4 容器View响应器差异

ohos独有: 在容器View上添加了`onStartShouldSetResponder`, `onMoveShouldSetResponderCapture`, `onResponderMove`。社区版Android/iOS的容器View是纯`<View>`。

### 5.5 originWhitelist传递到原生

ohos是**唯一**将`originWhitelist`传递到原生组件的平台。社区版仅在JS层校验。

### 5.6 hasOnShouldStartLoadWithRequestEvent

ohos独有的workaround prop, 通知原生层是否需要设置URL拦截管道。社区版无此prop。

### 5.7 Source验证缺失

社区版Android会警告POST+headers和GET+body的无效组合, ohos**静默允许**这些组合。

---

## 6. 原生层实现差异

### 6.1 URL拦截机制

| | 社区版Android | ohos |
|---|---|---|
| API | `shouldOverrideUrlLoading` | `onLoadIntercept` |
| 同步机制 | `synchronized` + `wait()`/`notify()` | **忙等待自旋循环** (可能阻塞UI线程) |
| 超时 | 250ms | 250ms |
| 性能 | ✅ 线程安全, 不阻塞 | ⚠️ 可能导致UI卡顿 |

### 6.2 JS桥注册

| | 社区版Android | ohos |
|---|---|---|
| 注册方式 | `addJavascriptInterface` / `WebViewCompat.addWebMessageListener` | `controller.registerJavaScriptProxy` |
| 注册后是否需要刷新 | ❌ 不需要 | ✅ **需要调用`controller.loadUrl()`或`controller.refresh()`** |
| 多次注册保护 | 无 | ✅ `hasRegisterJavaScriptProxy`标志 |

### 6.3 JS注入后桥对象再注入

社区版Android在`injectedJavaScript`执行后会**重新注入桥对象** (`injectJavascriptObject()`), ohos**不会**。

### 6.4 全屏视频

| | 社区版Android | ohos |
|---|---|---|
| API | `onShowCustomView` / `onHideCustomView` | `onFullScreenEnter` / `onFullScreenExit` |
| 模态窗口处理 | ✅ 区分不同rootView | ❌ 未考虑Modal组件 |
| 生命周期感知 | ✅ 注册为`LifecycleEventListener` | ❌ 无生命周期感知 |
| 回滚处理 | 无 | ✅ 有状态保护和回滚机制 |

---

## 7. Switch语句Fall-through Bug ⚠️ 严重

`WebViewBaseOperate.ets`中的`registerCommandCallback`方法存在**严重的fall-through bug**:

```typescript
// 当调用 requestFocus 时:
case COMMAND_NAME.REQUESTFOCUS:
  this.requestFocus();    // ✅ 执行requestFocus
  // ❌ 缺少 break! 继续执行下面的case:
case COMMAND_NAME.CLEARCACHE:
  this.clearCache();       // ❌ 也执行了clearCache
  // ❌ 缺少 break! 继续执行下面的case:
case COMMAND_NAME.CLEARHISTORY:
  this.clearHistory();     // ❌ 也执行了clearHistory
  break;
```

**影响**:
- 调用`requestFocus()` → 实际执行了 `requestFocus` + `clearCache` + `clearHistory`
- 调用`clearCache()` → 实际执行了 `clearCache` + `clearHistory`
- 调用`clearHistory()` → 正常, 仅执行 `clearHistory`

**测试用例**: `14_DiffCompare` → "18. Clear Commands"

### 7.1 clearFormData 命令缺失

`registerCommandCallback`的switch语句中**没有`clearFormData`的case**, 即使它在NativeCommands中声明了。调用`clearFormData()`会被静默忽略。

**测试用例**: `14_DiffCompare` → "18. Clear Commands"

---

## 8. 默认值差异

| Prop | 社区版Android默认 | ohos默认 | 影响 |
|------|-----------------|---------|------|
| `thirdPartyCookiesEnabled` | `true` | **`false`** | 第三方Cookie默认被阻止 |
| `mediaPlaybackRequiresUserAction` | 无默认(undefined) | `true` | 行为可能一致, 但类型不同 |
| `scalesPageToFit` | `true` | `true` | 一致 |
| `nestedScrollEnabled` | `false` | `false` | 一致 |

---

## 9. 事件数据差异

### 9.1 loadingError事件

| 字段 | 社区版 | ohos |
|------|--------|------|
| `domain` | ✅ 有值(如"WebKitErrorDomain") | ❌ **始终为空字符串** |

### 9.2 loadingStart/Finish事件

| 字段 | 社区版 | ohos |
|------|--------|------|
| `navigationType` | ✅ 区分click/formsubmit/backforward/reload | ❌ **始终为"other"** |
| `mainDocumentURL` | ✅ iOS提供 | ❌ 不提供 |

### 9.3 shouldStartLoadWithRequest事件

| 字段 | 社区版 | ohos |
|------|--------|------|
| `isTopFrame` | ✅ 区分主框架/子框架 | ❌ **始终为false** |
| `navigationType` | ✅ 区分 | ❌ **始终为"other"** |

---

## 10. 测试用例对照表

以下为每个差异点对应的可运行测试用例:

| # | 差异点 | 严重度 | 测试场景 | 测试页面 | 操作方式 |
|---|--------|--------|----------|----------|----------|
| 1 | Basic Auth缺失 | 🔴严重 | 14_DiffCompare→1 | /auth | 设置basicAuthCredential, 访问需认证页面 |
| 2 | 文件上传缺失 | 🔴严重 | 14_DiffCompare→2 | /form | 点击<input type="file"> |
| 3 | SSL错误无处理 | 🟡中等 | 14_DiffCompare→12 | https://expired.badssl.com | 加载SSL证书过期的页面 |
| 4 | onOpenWindow不发射 | 🟡中等 | 14_DiffCompare→9 | /navigation | 点击window.open()按钮 |
| 5 | onRenderExited空壳 | 🟡中等 | 14_DiffCompare→10 | /navigation | 观察是否收到renderProcessGone事件 |
| 6 | onContentSizeChange不发射 | 🟢低 | 14_DiffCompare→11 | /navigation | 动态注入内容改变高度 |
| 7 | navigationType始终"other" | 🟡中等 | 14_DiffCompare→8 | /navigation | 点击链接/提交表单/后退前进, 检查navType |
| 8 | isTopFrame始终false | 🟡中等 | 14_DiffCompare→7 | /iframe | iframe中导航, 检查isTopFrame |
| 9 | iframe注入不区分mainFrame | 🟡中等 | 14_DiffCompare→7 或 02_Injection | /iframe | 切换mainFrameOnly开关 |
| 10 | thirdPartyCookies默认false | 🟡中等 | 14_DiffCompare→13 或 06_Security | /cookies | 检查第三方Cookie是否被接受 |
| 11 | UA行为差异 | 🟡中等 | 14_DiffCompare→4 或 08_UserAgent | /user-agent | 设置userAgent和appNameUA |
| 12 | forceDarkOn不动态切换 | 🟢低 | 14_DiffCompare→15 或 07_Appearance | /dark-mode | 切换forceDarkOn开关 |
| 13 | 地理位置无用户提示 | 🟡中等 | 14_DiffCompare→16 或 06_Security | /geolocation | 点击获取位置 |
| 14 | Switch fall-through bug | 🔴严重 | 14_DiffCompare→18 | /navigation | 依次调用requestFocus/clearCache/clearHistory |
| 15 | clearFormData无效 | 🟡中等 | 14_DiffCompare→18 | /navigation | 调用clearFormData |
| 16 | 多实例消息串扰 | 🟡中等 | 14_DiffCompare→17 | /navigation | 两个WebView同时加载, 检查消息归属 |
| 17 | 下载无管理器 | 🟢低 | 14_DiffCompare→3 或 11_Download | /download | 点击下载链接 |
| 18 | Scroll indicator不动态切换 | 🟢低 | 14_DiffCompare→14 或 05_Scroll | /scroll | 切换scroll indicator开关 |
| 19 | Cookie共享不支持 | 🟡中等 | 14_DiffCompare→13 或 06_Security | /cookies | 设置sharedCookiesEnabled |
| 20 | 自定义菜单不支持suppressMenuItems | 🟢低 | 14_DiffCompare→19 或 10_CustomMenu | 内联HTML | 长按选择文本 |
| 21 | 全屏视频恢复 | 🟢低 | 14_DiffCompare→20 或 03_Media | /media | 播放视频并进入全屏 |
| 22 | domain字段始终为空 | 🟢低 | 04_Loading | /error/404 | 触发错误事件检查domain |
| 23 | POST+headers无警告 | 🟢低 | 14_DiffCompare→5 | /post-endpoint | 设置POST方法+headers |
| 24 | Cache mode映射错误 | 🟡中等 | 06_Security | /cache | 设置cacheMode=LOAD_CACHE_ELSE_NETWORK |
| 25 | 隐私模式不可靠 | 🟡中等 | 06_Security | 内联HTML | 开启incognito |

---

## 11. 新增测试场景说明

### 14_DiffCompare — 差异对比专用测试

新增场景 `D:\rnDev\e\webviewSamples\scenes\14_DiffCompare\index.tsx`, 包含20个针对性测试:

| 测试编号 | 测试名称 | 对应差异 |
|----------|---------|---------|
| 1 | Basic Auth | 2.1 |
| 2 | File Upload | 2.2 |
| 3 | Download | 4.10 |
| 4 | User Agent | 4.5, 4.6 |
| 5 | POST Request | 5.7 |
| 6 | JS Inject Timing | 6.3 |
| 7 | Iframe Injection | 4.3 |
| 8 | Navigation Type | 4.1 |
| 9 | onOpenWindow | 2.4 |
| 10 | Render Process | 3.1 |
| 11 | ContentSizeChange | 3.6 |
| 12 | SSL Error | 2.3 |
| 13 | Cookie Sharing | 4.11, 4.4 |
| 14 | Scroll Props | 4.12 |
| 15 | Dark Mode | 4.7 |
| 16 | Geolocation | 4.9 |
| 17 | Multi-Instance Msg | 5.1 |
| 18 | Clear Commands | 7, 7.1 |
| 19 | Custom Menu | 2.5(suppressMenuItems) |
| 20 | Fullscreen Video | 4.13(全屏视频) |

### 服务器新增页面

在 `D:\rnDev\e\localServer\server.js` 中新增 `/diff-test` 路由, 提供综合测试HTML页面, 包含文件上传、下载、window.open、导航类型、地理位置、Cookie、注入对象、基本认证、全屏视频、上下文菜单、iframe注入等测试区域。

---

## 附录: 遗留代码

以下文件似乎是遗留代码, 在当前实现中未被使用:
- `ShouldRequestUrl.ts` — 定义了`ShouldRequestUrl`类和`CallbackState`枚举, 但实际使用的是`WebViewTurboModule.ets`中的`ShouldStartParams`和`ShouldOverrideCallbackState`
- `CutomReference.ts` — 为`ShouldRequestUrl`提供的原子引用辅助, 同样未被使用

---

## 总结

ohos版本与社区版本的核心差异集中在以下几个方面:

1. **🔴 功能缺失** (最严重): Basic Auth、文件上传、SSL错误处理、onOpenWindow
2. **🔴 实现Bug** (严重): Switch fall-through导致requestFocus连带执行clearCache和clearHistory; clearFormData命令缺失
3. **🟡 行为偏差** (中等): navigationType/isTopFrame始终为固定值、iframe注入不区分mainFrame、thirdPartyCookies默认值不同、地理位置无用户提示、Cookie共享不支持、UA行为差异
4. **🟡 性能隐患** (中等): URL拦截使用忙等待自旋循环可能阻塞UI线程
5. **🟢 小差异** (低): Scroll indicator不动态切换、forceDarkOn不动态切换、下载无管理器、Cache mode映射可能不正确

建议优先修复🔴严重问题, 然后按优先级处理🟡中等和🟢低级问题。
