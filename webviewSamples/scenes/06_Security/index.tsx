/**
 * ============================================================
 * 场景06: 安全与隐私
 * ============================================================
 *
 * 测试点1: javaScriptEnabled = true/false
 *   操作: 关闭 javaScriptEnabled 开关
 *   预期: 页面中所有 JS 功能失效，按钮点击无响应，动态内容不加载
 *
 * 测试点2: domStorageEnabled (Android)
 *   操作: 关闭 domStorageEnabled 开关
 *   预期: 页面中依赖 localStorage/sessionStorage 的功能失效
 *
 * 测试点3: incognito (无痕模式)
 *   操作: 开启 incognito 开关，浏览页面后关闭
 *   预期: 不存储任何浏览数据（Cookie、缓存、localStorage、表单数据）
 *
 * 测试点4: cacheEnabled / cacheMode
 *   操作: 先访问 Cache Test 页面，然后切换 cacheMode 到 LOAD_CACHE_ONLY
 *   预期: LOAD_CACHE_ONLY 模式下，即使服务器内容更新，仍显示缓存版本
 *
 * 测试点5: sharedCookiesEnabled
 *   操作: 开启 sharedCookiesEnabled，点击 "Cookie Test" 按钮
 *   预期: WebView 与原生端共享 Cookie，服务端设置/读取的 Cookie 可互通
 *
 * 测试点6: thirdPartyCookiesEnabled (Android)
 *   操作: 切换 thirdPartyCookiesEnabled 开关
 *   预期: true 时允许第三方 Cookie；false 时阻止跨域 Cookie
 *
 * 测试点7: allowFileAccess (Android)
 *   操作: 开启 allowFileAccess 开关
 *   预期: 允许通过 file:// URI 访问文件系统
 *
 * 测试点8: allowFileAccessFromFileURLs / allowUniversalAccessFromFileURLs
 *   操作: 分别开启这两个开关
 *   预期: allowFileAccessFromFileURLs 允许 file:// URL 访问其他 file:// 内容；
 *         allowUniversalAccessFromFileURLs 允许 file:// URL 访问任意源内容
 *
 * 测试点9: geolocationEnabled (Android)
 *   操作: 开启 geolocationEnabled，点击 "Geo Test" 按钮
 *   预期: 页面可请求地理定位权限并获取经纬度；未开启时定位请求被拒绝
 *
 * 测试点10: mixedContentMode (Android)
 *   操作: 切换 mixedContentMode 在 never/always 之间
 *   预期: never 时 HTTPS 页面中 HTTP 资源被阻止；always 时允许加载
 *
 * 测试点11: setSupportMultipleWindows
 *   操作: 切换该开关
 *   预期: true 时 window.open() 触发 onOpenWindow；false 时可能在同一窗口打开
 *
 * 测试点12: clearCache / clearHistory
 *   操作: 点击 "Clear Cache" 或 "Clear History" 按钮
 *   预期: 清除缓存后重新加载页面会重新请求资源；清除历史后 goBack/goForward 不可用
 */

import React, { Component } from 'react';
import { View, Text, Switch, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

const SECURITY_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: sans-serif; padding: 12px; }
  .section { margin-bottom: 16px; border: 1px solid #ddd; padding: 10px; border-radius: 6px; }
  .section h3 { margin: 0 0 8px; font-size: 14px; }
  button { padding: 8px 14px; margin: 4px; border: none; border-radius: 4px; background: #007AFF; color: #fff; font-size: 13px; }
  button:active { opacity: 0.6; }
  #output { background: #f5f5f5; padding: 8px; min-height: 40px; font-size: 12px; border-radius: 4px; white-space: pre-wrap; word-break: break-all; }
  #clock { font-size: 20px; font-weight: bold; color: #007AFF; }
  .storage-item { font-size: 12px; margin: 2px 0; }
</style>
</head>
<body>
  <div class="section">
    <h3>JS Clock (requires JS)</h3>
    <div id="clock">--:--:--</div>
    <p style="font-size:11px;color:#999;">If JS is disabled, the clock will stay frozen.</p>
  </div>

  <div class="section">
    <h3>JS Button (requires JS)</h3>
    <button onclick="handleClick()">Click Me (JS)</button>
    <button onclick="changeColor()">Change Color</button>
    <div id="output">Output will appear here...</div>
  </div>

  <div class="section">
    <h3>DOM Storage (requires domStorageEnabled)</h3>
    <button onclick="setStorage()">Set localStorage</button>
    <button onclick="getStorage()">Read localStorage</button>
    <button onclick="clearStorage()">Clear localStorage</button>
    <div id="storageOutput" class="storage-item">---</div>
  </div>

  <div class="section">
    <h3>Geolocation (requires geolocationEnabled)</h3>
    <button onclick="requestGeo()">Get Location</button>
    <div id="geoOutput" style="font-size:12px;">---</div>
  </div>

  <div class="section">
    <h3>postMessage to RN</h3>
    <button onclick="postToRN()">Send Message</button>
  </div>

  <script>
    // Clock
    function updateClock() {
      var d = new Date();
      document.getElementById('clock').textContent =
        d.toLocaleTimeString();
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Button handlers
    var clickCount = 0;
    function handleClick() {
      clickCount++;
      document.getElementById('output').textContent = 'Clicked ' + clickCount + ' time(s) at ' + new Date().toLocaleTimeString();
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage('Button clicked: ' + clickCount);
    }

    var colors = ['#007AFF','#FF3B30','#34C759','#FF9500','#AF52DE'];
    var colorIdx = 0;
    function changeColor() {
      colorIdx = (colorIdx + 1) % colors.length;
      document.getElementById('output').style.color = colors[colorIdx];
      document.getElementById('output').textContent = 'Color changed to ' + colors[colorIdx] + ' at ' + new Date().toLocaleTimeString();
    }

    // DOM Storage
    function setStorage() {
      var key = 'test_key_' + Date.now();
      var val = 'value_' + Math.floor(Math.random() * 10000);
      localStorage.setItem(key, val);
      document.getElementById('storageOutput').textContent = 'Set: ' + key + ' = ' + val;
    }
    function getStorage() {
      var items = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        items.push(k + '=' + localStorage.getItem(k));
      }
      document.getElementById('storageOutput').textContent = items.length ? items.join('\\n') : '(empty)';
    }
    function clearStorage() {
      localStorage.clear();
      document.getElementById('storageOutput').textContent = 'Cleared!';
    }

    // Geolocation
    function requestGeo() {
      if (!navigator.geolocation) {
        document.getElementById('geoOutput').textContent = 'Geolocation not supported';
        return;
      }
      document.getElementById('geoOutput').textContent = 'Requesting...';
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          document.getElementById('geoOutput').textContent =
            'Lat: ' + pos.coords.latitude + '\\nLng: ' + pos.coords.longitude;
        },
        function(err) {
          document.getElementById('geoOutput').textContent = 'Error: ' + err.message;
        }
      );
    }

    // postMessage
    function postToRN() {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage('Hello from WebView at ' + new Date().toLocaleTimeString());
    }
  </script>
</body>
</html>
`;

type Props = {};
type State = {
  javaScriptEnabled: boolean;
  domStorageEnabled: boolean;
  incognito: boolean;
  cacheEnabled: boolean;
  cacheMode: string;
  sharedCookiesEnabled: boolean;
  thirdPartyCookiesEnabled: boolean;
  allowFileAccess: boolean;
  allowFileAccessFromFileURLs: boolean;
  allowUniversalAccessFromFileURLs: boolean;
  geolocationEnabled: boolean;
  mixedContentMode: string;
  setSupportMultipleWindows: boolean;
  messages: string[];
};

export default class SecurityScene extends Component<Props, State> {
  webViewRef = React.createRef<WebView>();

  state: State = {
    javaScriptEnabled: true,
    domStorageEnabled: true,
    incognito: false,
    cacheEnabled: true,
    cacheMode: 'LOAD_DEFAULT',
    sharedCookiesEnabled: false,
    thirdPartyCookiesEnabled: true,
    allowFileAccess: false,
    allowFileAccessFromFileURLs: false,
    allowUniversalAccessFromFileURLs: false,
    geolocationEnabled: false,
    mixedContentMode: 'never',
    setSupportMultipleWindows: true,
    messages: [],
  };

  addMessage = (msg: string) => {
    this.setState(prev => ({ messages: [...prev.messages, msg].slice(-20) }));
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>JavaScript & Storage</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>javaScriptEnabled</Text>
            <Switch value={this.state.javaScriptEnabled} onValueChange={v => this.setState({ javaScriptEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>domStorageEnabled (Android)</Text>
            <Switch value={this.state.domStorageEnabled} onValueChange={v => this.setState({ domStorageEnabled: v })} />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Privacy & Cache</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>incognito</Text>
            <Switch value={this.state.incognito} onValueChange={v => this.setState({ incognito: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>cacheEnabled</Text>
            <Switch value={this.state.cacheEnabled} onValueChange={v => this.setState({ cacheEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>cacheMode</Text>
            <Switch
              value={this.state.cacheMode !== 'LOAD_DEFAULT'}
              onValueChange={v => this.setState({ cacheMode: v ? 'LOAD_CACHE_ONLY' : 'LOAD_DEFAULT' })}
            />
            <Text style={styles.switchValue}>{this.state.cacheMode}</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>sharedCookiesEnabled</Text>
            <Switch value={this.state.sharedCookiesEnabled} onValueChange={v => this.setState({ sharedCookiesEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>thirdPartyCookiesEnabled (Android)</Text>
            <Switch value={this.state.thirdPartyCookiesEnabled} onValueChange={v => this.setState({ thirdPartyCookiesEnabled: v })} />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>File Access</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowFileAccess (Android)</Text>
            <Switch value={this.state.allowFileAccess} onValueChange={v => this.setState({ allowFileAccess: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowFileAccessFromFileURLs</Text>
            <Switch value={this.state.allowFileAccessFromFileURLs} onValueChange={v => this.setState({ allowFileAccessFromFileURLs: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowUniversalAccessFromFileURLs</Text>
            <Switch value={this.state.allowUniversalAccessFromFileURLs} onValueChange={v => this.setState({ allowUniversalAccessFromFileURLs: v })} />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Permissions & Mixed Content</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>geolocationEnabled (Android)</Text>
            <Switch value={this.state.geolocationEnabled} onValueChange={v => this.setState({ geolocationEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>mixedContentMode (Android)</Text>
            <Switch
              value={this.state.mixedContentMode === 'always'}
              onValueChange={v => this.setState({ mixedContentMode: v ? 'always' : 'never' })}
            />
            <Text style={styles.switchValue}>{this.state.mixedContentMode}</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>setSupportMultipleWindows (Android)</Text>
            <Switch value={this.state.setSupportMultipleWindows} onValueChange={v => this.setState({ setSupportMultipleWindows: v })} />
          </View>
        </View>

        <View style={styles.controlBar}>
          <Button title="Cookie Test" onPress={() => this.webViewRef.current?.injectJavaScript(`document.cookie='test_cookie=hello'; window.ReactNativeWebView && window.ReactNativeWebView.postMessage('Cookie set: ' + document.cookie); true;`)} />
          <Button title="Clear Cache" onPress={() => { this.webViewRef.current?.clearCache(true); this.webViewRef.current?.reload(); }} />
          <Button title="Clear History" onPress={() => this.webViewRef.current?.clearHistory()} />
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            ref={this.webViewRef}
            source={{ html: SECURITY_HTML }}
            javaScriptEnabled={this.state.javaScriptEnabled}
            domStorageEnabled={this.state.domStorageEnabled}
            incognito={this.state.incognito}
            cacheEnabled={this.state.cacheEnabled}
            cacheMode={this.state.cacheMode as any}
            sharedCookiesEnabled={this.state.sharedCookiesEnabled}
            thirdPartyCookiesEnabled={this.state.thirdPartyCookiesEnabled}
            allowFileAccess={this.state.allowFileAccess}
            allowFileAccessFromFileURLs={this.state.allowFileAccessFromFileURLs}
            allowUniversalAccessFromFileURLs={this.state.allowUniversalAccessFromFileURLs}
            geolocationEnabled={this.state.geolocationEnabled}
            mixedContentMode={this.state.mixedContentMode as any}
            setSupportMultipleWindows={this.state.setSupportMultipleWindows}
            onMessage={(e) => this.addMessage(e.nativeEvent.data)}
            nestedScrollEnabled={true}
            style={styles.webview}
          />
        </View>

        <ScrollView style={styles.logContainer}>
          <Text style={styles.logTitle}>Messages:</Text>
          {this.state.messages.map((msg, i) => (
            <Text key={i} style={styles.logText}>{msg}</Text>
          ))}
        </ScrollView>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  switchGroup: { padding: 8, backgroundColor: '#f0f0f0', marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  switchLabel: { fontSize: 11, flex: 1 },
  switchValue: { fontSize: 11, color: '#007AFF', marginLeft: 4 },
  controlBar: { flexDirection: 'row', flexWrap: 'wrap', padding: 4, backgroundColor: '#e8e8e8' },
  webviewContainer: { height: 300, borderWidth: 1, borderColor: '#ccc' },
  webview: { flex: 1 },
  logContainer: { maxHeight: 100, backgroundColor: '#1a1a1a', padding: 8 },
  logTitle: { color: '#0f0', fontSize: 10, fontWeight: 'bold' },
  logText: { color: '#0f0', fontSize: 9 },
});


// javaScriptEnabled动态设置无效，切换为false还是可以注入脚本