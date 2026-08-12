import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Switch, TextInput, Alert } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  activeTest: string;
  logs: string[];
  jsEnabled: boolean;
  domStorageEnabled: boolean;
  incognito: boolean;
  cacheEnabled: boolean;
  userAgent: string;
  appNameUA: string;
  geolocationEnabled: boolean;
  forceDarkOn: boolean;
  textZoom: number;
  minimumFontSize: number;
  scrollEnabled: boolean;
  bounces: boolean;
  showsHScrollIndicator: boolean;
  showsVScrollIndicator: boolean;
  allowsFullscreenVideo: boolean;
  mediaPlaybackRequiresUserAction: boolean;
  mixedContentMode: string;
  overScrollMode: string;
  nestedScrollEnabled: boolean;
  scalesPageToFit: boolean;
  thirdPartyCookiesEnabled: boolean;
  allowFileAccess: boolean;
  webviewDebuggingEnabled: boolean;
  basicAuthUser: string;
  basicAuthPass: string;
  originWhitelist: string;
  shouldIntercept: boolean;
  interceptLog: string[];
};

const TESTS = [
  { key: 'basic_auth', label: '1. Basic Auth' },
  { key: 'file_upload', label: '2. File Upload' },
  { key: 'download', label: '3. Download' },
  { key: 'user_agent', label: '4. User Agent' },
  { key: 'post_request', label: '5. POST Request' },
  { key: 'js_inject_timing', label: '6. JS Inject Timing' },
  { key: 'iframe_inject', label: '7. Iframe Injection' },
  { key: 'nav_type', label: '8. Navigation Type' },
  { key: 'on_open_window', label: '9. onOpenWindow' },
  { key: 'render_process', label: '10. Render Process' },
  { key: 'content_size', label: '11. ContentSizeChange' },
  { key: 'ssl_error', label: '12. SSL Error' },
  { key: 'cookie_sharing', label: '13. Cookie Sharing' },
  { key: 'scroll_props', label: '14. Scroll Props' },
  { key: 'dark_mode', label: '15. Dark Mode' },
  { key: 'geolocation', label: '16. Geolocation' },
  { key: 'multiple_webview', label: '17. Multi-Instance Msg' },
  { key: 'clear_commands', label: '18. Clear Commands' },
  { key: 'custom_menu', label: '19. Custom Menu' },
  { key: 'fullscreen_video', label: '20. Fullscreen Video' },
];

export default class DiffCompareScene extends Component<Props, State> {
  webViewRef = React.createRef<WebView>();
  webViewRef2 = React.createRef<WebView>();

  state: State = {
    activeTest: '',
    logs: [],
    jsEnabled: true,
    domStorageEnabled: true,
    incognito: false,
    cacheEnabled: true,
    userAgent: '',
    appNameUA: '',
    geolocationEnabled: false,
    forceDarkOn: false,
    textZoom: 100,
    minimumFontSize: 1,
    scrollEnabled: true,
    bounces: true,
    showsHScrollIndicator: true,
    showsVScrollIndicator: true,
    allowsFullscreenVideo: false,
    mediaPlaybackRequiresUserAction: true,
    mixedContentMode: 'never',
    overScrollMode: 'always',
    nestedScrollEnabled: false,
    scalesPageToFit: true,
    thirdPartyCookiesEnabled: true,
    allowFileAccess: false,
    webviewDebuggingEnabled: false,
    basicAuthUser: 'admin',
    basicAuthPass: 'password',
    originWhitelist: '',
    shouldIntercept: false,
    interceptLog: [],
  };

  addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    this.setState(prev => ({ logs: [...prev.logs, `[${ts}] ${msg}`].slice(-50) }));
  };

  clearLogs = () => this.setState({ logs: [] });

  renderTestButtons = () => (
    <ScrollView horizontal style={styles.testBar} contentContainerStyle={styles.testBarContent}>
      {TESTS.map(t => (
        <Button
          key={t.key}
          title={t.label}
          color={this.state.activeTest === t.key ? '#1565c0' : '#666'}
          onPress={() => { this.setState({ activeTest: t.key }); this.clearLogs(); }}
        />
      ))}
    </ScrollView>
  );

  renderTestContent = () => {
    const { activeTest } = this.state;
    switch (activeTest) {
      case 'basic_auth': return this.renderBasicAuthTest();
      case 'file_upload': return this.renderFileUploadTest();
      case 'download': return this.renderDownloadTest();
      case 'user_agent': return this.renderUserAgentTest();
      case 'post_request': return this.renderPostRequestTest();
      case 'js_inject_timing': return this.renderJSInjectTimingTest();
      case 'iframe_inject': return this.renderIframeInjectTest();
      case 'nav_type': return this.renderNavTypeTest();
      case 'on_open_window': return this.renderOpenWindowTest();
      case 'render_process': return this.renderRenderProcessTest();
      case 'content_size': return this.renderContentSizeTest();
      case 'ssl_error': return this.renderSSLErrorTest();
      case 'cookie_sharing': return this.renderCookieSharingTest();
      case 'scroll_props': return this.renderScrollPropsTest();
      case 'dark_mode': return this.renderDarkModeTest();
      case 'geolocation': return this.renderGeolocationTest();
      case 'multiple_webview': return this.renderMultiInstanceTest();
      case 'clear_commands': return this.renderClearCommandsTest();
      case 'custom_menu': return this.renderCustomMenuTest();
      case 'fullscreen_video': return this.renderFullscreenVideoTest();
      default: return <View style={styles.placeholder}><Text style={styles.placeholderText}>Select a test above</Text></View>;
    }
  };

  renderBasicAuthTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Basic Auth Credential Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos has no basicAuthCredential implementation. Community Android/iOS auto-fills HTTP Basic Auth.</Text>
      <View style={styles.row}>
        <Text style={styles.label}>User:</Text>
        <TextInput style={styles.input} value={this.state.basicAuthUser} onChangeText={v => this.setState({ basicAuthUser: v })} />
        <Text style={styles.label}>Pass:</Text>
        <TextInput style={styles.input} value={this.state.basicAuthPass} onChangeText={v => this.setState({ basicAuthPass: v })} />
      </View>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/auth` }}
          basicAuthCredential={{ username: this.state.basicAuthUser, password: this.state.basicAuthPass }}
          onLoadStart={e => this.addLog(`[AUTH] loadStart: ${e.nativeEvent.url}`)}
          onLoadEnd={e => this.addLog(`[AUTH] loadEnd: ${e.nativeEvent.url}`)}
          onError={e => this.addLog(`[AUTH] error: ${e.nativeEvent.description}`)}
          onHttpError={e => this.addLog(`[AUTH] httpError: ${e.nativeEvent.statusCode}`)}
          onNavigationStateChange={e => this.addLog(`[AUTH] nav: ${e.url} loading=${e.loading}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderFileUploadTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>File Upload Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos claims isFileUploadSupported=true but has NO native file picker. Tapping &lt;input type="file"&gt; should do nothing on ohos.</Text>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/form` }}
          onLoadStart={e => this.addLog(`[FILE] loadStart: ${e.nativeEvent.url}`)}
          onMessage={e => this.addLog(`[FILE] msg: ${e.nativeEvent.data}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderDownloadTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Download Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos emits onFileDownload event but has NO native download manager. Android auto-downloads; iOS just emits event like ohos.</Text>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/download` }}
          onFileDownload={(e: any) => this.addLog(`[DL] onFileDownload: ${JSON.stringify(e.nativeEvent)}`)}
          onLoadStart={e => this.addLog(`[DL] loadStart: ${e.nativeEvent.url}`)}
          onNavigationStateChange={e => this.addLog(`[DL] nav: ${e.url}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderUserAgentTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>User Agent Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos applicationNameForUserAgent may append to custom UA instead of default UA. Also userAgent may not take effect dynamically.</Text>
      <View style={styles.row}>
        <Text style={styles.label}>userAgent:</Text>
        <TextInput style={styles.input} value={this.state.userAgent} onChangeText={v => this.setState({ userAgent: v })} placeholder="Custom UA" />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>appNameUA:</Text>
        <TextInput style={styles.input} value={this.state.appNameUA} onChangeText={v => this.setState({ appNameUA: v })} placeholder="App Name Suffix" />
      </View>
      <Button title="Reload" onPress={() => this.webViewRef.current?.reload()} />
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/user-agent` }}
          userAgent={this.state.userAgent || undefined}
          applicationNameForUserAgent={this.state.appNameUA || undefined}
          onMessage={e => this.addLog(`[UA] msg: ${e.nativeEvent.data}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderPostRequestTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>POST Request Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos does not warn about POST+headers or GET+body invalid combinations. Also check if POST body is actually sent.</Text>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{
            uri: `${BASE_URL}/post-endpoint`,
            method: 'POST',
            headers: { 'X-Custom-Header': 'test-value' },
            body: JSON.stringify({ test: 'data', timestamp: Date.now() }),
          }}
          onLoadStart={e => this.addLog(`[POST] loadStart: ${e.nativeEvent.url}`)}
          onLoadEnd={e => this.addLog(`[POST] loadEnd: ${e.nativeEvent.url}`)}
          onMessage={e => this.addLog(`[POST] msg: ${e.nativeEvent.data}`)}
          onError={e => this.addLog(`[POST] error: ${e.nativeEvent.description}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderJSInjectTimingTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>JS Injection Timing Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos injectJavaScript (command) does NOT wrap in IIFE, while community does. Also check if bridge object is re-injected after JS execution.</Text>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/injection` }}
          injectedJavaScriptBeforeContentLoaded={`
            window.__beforeLoadTime = Date.now();
            window.ReactNativeWebView.postMessage(JSON.stringify({type:'before_load', ts: Date.now(), url: window.location.href}));
            true;
          `}
          injectedJavaScript={`
            window.ReactNativeWebView.postMessage(JSON.stringify({type:'after_load', ts: Date.now(), url: window.location.href, beforeLoadDelta: Date.now() - (window.__beforeLoadTime || 0)}));
            true;
          `}
          onMessage={e => this.addLog(`[INJ] ${e.nativeEvent.data}`)}
          onLoadStart={e => this.addLog(`[INJ] loadStart: ${e.nativeEvent.url}`)}
          onLoadEnd={e => this.addLog(`[INJ] loadEnd: ${e.nativeEvent.url}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderIframeInjectTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Iframe Injection Scope Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos ignores injectedJavaScriptForMainFrameOnly - JS is always injected into iframes on ohos.</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>mainFrameOnly (after):</Text>
        <Switch value={this.state.jsEnabled} onValueChange={v => this.setState({ jsEnabled: v })} />
      </View>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/iframe` }}
          injectedJavaScript={`
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'after_load', isIframe: window.self !== window.top, frameName: window.name || 'main'}));
            true;
          `}
          injectedJavaScriptBeforeContentLoaded={`
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'before_load', isIframe: window.self !== window.top, frameName: window.name || 'main'}));
            true;
          `}
          injectedJavaScriptForMainFrameOnly={this.state.jsEnabled}
          injectedJavaScriptBeforeContentLoadedForMainFrameOnly={this.state.jsEnabled}
          onMessage={e => this.addLog(`[IFRAME] ${e.nativeEvent.data}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderNavTypeTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Navigation Type Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos always reports navigationType="other" in onShouldStartLoadWithRequest. Community Android/iOS differentiate click/formsubmit/backforward/reload.</Text>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/navigation` }}
          onShouldStartLoadWithRequest={(e: any) => {
            this.addLog(`[NAVTYPE] url=${e.url} navType=${e.navigationType} isTopFrame=${e.isTopFrame}`);
            return true;
          }}
          onLoadStart={e => this.addLog(`[NAVTYPE] loadStart: url=${e.nativeEvent.url} navType=${e.nativeEvent.navigationType}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderOpenWindowTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>onOpenWindow Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos native side never emits openWindow event. window.open() may silently fail or open in current frame.</Text>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/navigation` }}
          onOpenWindow={(e: any) => this.addLog(`[OPENWIN] targetUrl=${e.nativeEvent.targetUrl}`)}
          javaScriptCanOpenWindowsAutomatically={true}
          setSupportMultipleWindows={true as boolean | undefined}
          onLoadStart={e => this.addLog(`[OPENWIN] loadStart: ${e.nativeEvent.url}`)}
          onNavigationStateChange={e => this.addLog(`[OPENWIN] nav: ${e.url}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderRenderProcessTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Render Process Gone Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos onRenderExited handler is EMPTY (stub). The event will never be emitted to JS even if the render process crashes.</Text>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/navigation` }}
          onRenderProcessGone={(e: any) => this.addLog(`[RENDER] didCrash=${e.nativeEvent.didCrash}`)}
          onContentProcessDidTerminate={(e: any) => this.addLog(`[RENDER] contentProcessTerminated`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderContentSizeTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Content Size Change Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos declares contentSizeChange event but never emits it from native.</Text>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/navigation` }}
          onContentSizeChange={(e: any) => this.addLog(`[CSIZE] ${JSON.stringify(e.nativeEvent)}`)}
          nestedScrollEnabled={true}
        />
      </View>
      <Button title="Inject Dynamic Content" onPress={() => {
        this.webViewRef.current?.injectJavaScript(`
          document.body.innerHTML += '<div style="height:2000px;background:yellow;">Dynamic content</div>';
          true;
        `);
      }} />
    </View>
  );

  renderSSLErrorTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>SSL Error Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos has NO SSL error handling. Community Android classifies SSL errors (date invalid, expired, host mismatch etc).</Text>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: 'https://expired.badssl.com/' }}
          onLoadStart={e => this.addLog(`[SSL] loadStart: ${e.nativeEvent.url}`)}
          onError={e => this.addLog(`[SSL] error: code=${e.nativeEvent.code} desc=${e.nativeEvent.description} domain=${e.nativeEvent.domain}`)}
          onLoadEnd={e => this.addLog(`[SSL] loadEnd: ${e.nativeEvent.url}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderCookieSharingTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Cookie Sharing Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos has no sharedCookiesEnabled. Third-party cookie default is FALSE (Android=TRUE). No cookie sync between WebView and app.</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>thirdPartyCookies:</Text>
        <Switch value={this.state.thirdPartyCookiesEnabled} onValueChange={v => this.setState({ thirdPartyCookiesEnabled: v })} />
        <Text style={styles.switchLabel}>incognito:</Text>
        <Switch value={this.state.incognito} onValueChange={v => this.setState({ incognito: v })} />
      </View>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/cookies` }}
          thirdPartyCookiesEnabled={this.state.thirdPartyCookiesEnabled}
          incognito={this.state.incognito}
          onMessage={e => this.addLog(`[COOKIE] ${e.nativeEvent.data}`)}
          onLoadEnd={e => this.addLog(`[COOKIE] loadEnd: ${e.nativeEvent.url}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderScrollPropsTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Scroll Props Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos showsVerticalScrollIndicator/showsHorizontalScrollIndicator cannot be dynamically toggled. bounces may not work as expected. overScrollMode only supports always/never.</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>scrollEnabled:</Text>
        <Switch value={this.state.scrollEnabled} onValueChange={v => this.setState({ scrollEnabled: v })} />
        <Text style={styles.switchLabel}>bounces:</Text>
        <Switch value={this.state.bounces} onValueChange={v => this.setState({ bounces: v })} />
        <Text style={styles.switchLabel}>hIndicator:</Text>
        <Switch value={this.state.showsHScrollIndicator} onValueChange={v => this.setState({ showsHScrollIndicator: v })} />
        <Text style={styles.switchLabel}>vIndicator:</Text>
        <Switch value={this.state.showsVScrollIndicator} onValueChange={v => this.setState({ showsVScrollIndicator: v })} />
        <Text style={styles.switchLabel}>nestedScroll:</Text>
        <Switch value={this.state.nestedScrollEnabled} onValueChange={v => this.setState({ nestedScrollEnabled: v })} />
        <Text style={styles.switchLabel}>scalesPageToFit:</Text>
        <Switch value={this.state.scalesPageToFit} onValueChange={v => this.setState({ scalesPageToFit: v })} />
      </View>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/scroll` }}
          scrollEnabled={this.state.scrollEnabled}
          bounces={this.state.bounces}
          showsHorizontalScrollIndicator={this.state.showsHScrollIndicator}
          showsVerticalScrollIndicator={this.state.showsVScrollIndicator}
          nestedScrollEnabled={this.state.nestedScrollEnabled}
          scalesPageToFit={this.state.scalesPageToFit}
          overScrollMode={this.state.overScrollMode as 'always' | 'content' | 'never'}
          onScroll={e => this.addLog(`[SCROLL] offset=${JSON.stringify(e.nativeEvent.contentOffset)}`)}
        />
      </View>
    </View>
  );

  renderDarkModeTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Dark Mode Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos forceDarkOn may not toggle dynamically. textZoom may not change dynamically. contentMode/indicatorStyle not supported.</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>forceDarkOn:</Text>
        <Switch value={this.state.forceDarkOn} onValueChange={v => this.setState({ forceDarkOn: v })} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>textZoom:</Text>
        <TextInput style={styles.input} value={String(this.state.textZoom)} onChangeText={v => this.setState({ textZoom: parseInt(v) || 100 })} keyboardType="numeric" />
        <Text style={styles.label}>minFontSize:</Text>
        <TextInput style={styles.input} value={String(this.state.minimumFontSize)} onChangeText={v => this.setState({ minimumFontSize: parseInt(v) || 1 })} keyboardType="numeric" />
      </View>
      <Button title="Reload" onPress={() => this.webViewRef.current?.reload()} />
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/dark-mode` }}
          forceDarkOn={this.state.forceDarkOn}
          textZoom={this.state.textZoom}
          minimumFontSize={this.state.minimumFontSize}
          onMessage={e => this.addLog(`[DARK] ${e.nativeEvent.data}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderGeolocationTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Geolocation Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos auto-grants/denies geolocation based on prop without user prompt. Community Android shows native permission dialog.</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>geolocationEnabled:</Text>
        <Switch value={this.state.geolocationEnabled} onValueChange={v => this.setState({ geolocationEnabled: v })} />
      </View>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/geolocation` }}
          geolocationEnabled={this.state.geolocationEnabled}
          onMessage={e => this.addLog(`[GEO] ${e.nativeEvent.data}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderMultiInstanceTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Multi-Instance Messaging Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos has no per-instance messagingModuleName. If TurboModule dispatches globally, multiple WebViews may receive each other's messages.</Text>
      <View style={[styles.webviewBox, { height: 150 }]}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/navigation` }}
          injectedJavaScript={`
            window.ReactNativeWebView.postMessage('WebView1: loaded at ' + Date.now());
            true;
          `}
          onMessage={e => this.addLog(`[WV1] ${e.nativeEvent.data}`)}
          nestedScrollEnabled={true}
        />
      </View>
      <View style={[styles.webviewBox, { height: 150, marginTop: 8 }]}>
        <WebView
          ref={this.webViewRef2}
          source={{ uri: `${BASE_URL}/navigation/page1` }}
          injectedJavaScript={`
            window.ReactNativeWebView.postMessage('WebView2: loaded at ' + Date.now());
            true;
          `}
          onMessage={e => this.addLog(`[WV2] ${e.nativeEvent.data}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderClearCommandsTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Clear Commands Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos clearFormData has no switch case (command silently ignored). Also switch fall-through bug: requestFocus also triggers clearCache and clearHistory.</Text>
      <View style={styles.controlBar}>
        <Button title="requestFocus" onPress={() => { this.webViewRef.current?.requestFocus(); this.addLog('[CMD] requestFocus called'); }} />
        <Button title="clearCache" onPress={() => { const wv = this.webViewRef.current as any; wv?.clearCache?.(true); this.addLog('[CMD] clearCache called'); }} />
        <Button title="clearHistory" onPress={() => { const wv = this.webViewRef.current as any; wv?.clearHistory?.(); this.addLog('[CMD] clearHistory called'); }} />
        <Button title="clearFormData" onPress={() => { const wv = this.webViewRef.current as any; wv?.clearFormData?.(); this.addLog('[CMD] clearFormData called'); }} />
      </View>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/navigation` }}
          onLoadStart={e => this.addLog(`[CMD] loadStart: ${e.nativeEvent.url}`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderCustomMenuTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Custom Menu Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos does not support suppressMenuItems. Long-press to select text and check if custom menu items appear.</Text>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ html: `
            <html><body style="font-family:sans-serif;padding:20px;">
              <h1>Custom Menu Test</h1>
              <p>Select this text to see custom menu items. On ohos, suppressMenuItems may not work.</p>
              <p>Call +1-234-567-8900 for data detection test.</p>
              <p>Visit https://example.com for link detection.</p>
            </body></html>
          ` }}
          menuItems={[
            { key: 'copy_note', label: 'Copy to Notes' },
            { key: 'search', label: 'Search Web' },
            { key: 'translate', label: 'Translate' },
          ]}
          onCustomMenuSelection={(e: any) => this.addLog(`[MENU] key=${e.nativeEvent.key} label=${e.nativeEvent.label} text="${e.nativeEvent.selectedText}"`)}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  renderFullscreenVideoTest = () => (
    <View style={styles.testSection}>
      <Text style={styles.testTitle}>Fullscreen Video Test</Text>
      <Text style={styles.testDesc}>SUSPECT: ohos allowsFullscreenVideo defaults to false. Check if fullscreen video works when enabled, and if orientation/immersive mode is correctly restored on exit.</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>allowsFullscreenVideo:</Text>
        <Switch value={this.state.allowsFullscreenVideo} onValueChange={v => this.setState({ allowsFullscreenVideo: v })} />
        <Text style={styles.switchLabel}>mediaPlayRequiresUserAction:</Text>
        <Switch value={this.state.mediaPlaybackRequiresUserAction} onValueChange={v => this.setState({ mediaPlaybackRequiresUserAction: v })} />
      </View>
      <View style={styles.webviewBox}>
        <WebView
          ref={this.webViewRef}
          source={{ uri: `${BASE_URL}/media` }}
          allowsFullscreenVideo={this.state.allowsFullscreenVideo}
          mediaPlaybackRequiresUserAction={this.state.mediaPlaybackRequiresUserAction}
          nestedScrollEnabled={true}
        />
      </View>
    </View>
  );

  render() {
    return (
      <View style={styles.container}>
        {this.renderTestButtons()}
        {this.renderTestContent()}
        <ScrollView style={styles.logContainer}>
          <View style={styles.logHeader}>
            <Text style={styles.logTitle}>Diff Compare Log:</Text>
            <Button title="Clear" onPress={this.clearLogs} />
          </View>
          {this.state.logs.map((msg, i) => (
            <Text key={i} style={styles.logText}>{msg}</Text>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  testBar: { maxHeight: 50, backgroundColor: '#e0e0e0' },
  testBarContent: { paddingVertical: 8, paddingHorizontal: 4, gap: 4, alignItems: 'center' },
  testSection: { flex: 1, padding: 8 },
  testTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  testDesc: { fontSize: 11, color: '#c62828', marginBottom: 8, fontStyle: 'italic' },
  webviewBox: { flex: 1, borderWidth: 1, borderColor: '#ccc', minHeight: 200 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  label: { fontSize: 11, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 4, fontSize: 11, flex: 1, minWidth: 60 },
  switchRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4, gap: 4 },
  switchLabel: { fontSize: 11, marginRight: 2 },
  controlBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 4, backgroundColor: '#f0f0f0' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#999', fontSize: 16 },
  logContainer: { maxHeight: 150, backgroundColor: '#1a1a1a', padding: 8 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logTitle: { color: '#0f0', fontSize: 10, fontWeight: 'bold' },
  logText: { color: '#0f0', fontSize: 9, marginBottom: 2 },
});
