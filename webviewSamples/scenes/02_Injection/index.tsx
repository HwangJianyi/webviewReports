/**
 * ============================================================
 * 场景02: JS 注入与通信
 * ============================================================
 *
 * 测试点1: injectedJavaScript (页面加载后注入)
 *   操作: 进入页面，观察底部 Messages Log
 *   预期: 自动出现 type: "injected_after_load" 的消息，包含当前页面 URL 和时间戳
 *
 * 测试点2: injectedJavaScriptBeforeContentLoaded (页面加载前注入)
 *   操作: 进入页面，观察底部 Messages Log
 *   预期: 自动出现 type: "injected_before_load" 的消息，且其时间戳早于 after_load
 *
 * 测试点3: injectedJavaScriptObject (注入对象到 WebView)
 *   操作: 查看 WebView 内页面，页面中应显示 injectedObjectJson 的内容
 *   预期: 页面中显示 {"appName":"WebViewTest","version":"1.0","env":"debug"}
 *
 * 测试点4: injectJavaScript (运行时手动注入)
 *   操作: 点击 "Inject JS" 按钮
 *   预期: Messages Log 中出现 type: "manual_inject" 的消息，包含随机数和时间戳
 *
 * 测试点5: postMessage (RN → WebView 通信)
 *   操作: 点击 "Post Message" 按钮
 *   预期: WebView 内页面接收到消息并显示（页面监听了 message 事件）
 *
 * 测试点6: injectedJavaScriptForMainFrameOnly = true
 *   操作: 将 "MainFrameOnly (after)" 开关打开（默认 true）
 *   预期: Messages Log 中只有主框架的 after_load 消息，没有 iframe_after_load
 *
 * 测试点7: injectedJavaScriptForMainFrameOnly = false
 *   操作: 将 "MainFrameOnly (after)" 开关关闭
 *   预期: Messages Log 中出现 iframe_after_load 消息，表示 JS 也注入到了 iframe
 *
 * 测试点8: injectedJavaScriptBeforeContentLoadedForMainFrameOnly
 *   操作: 同测试点6/7，切换 "MainFrameOnly (before)" 开关
 *   预期: true 时只有主框架 before_load；false 时也有 iframe_before_load
 *
 * 测试点9: onMessage (WebView → RN 通信)
 *   操作: 所有通过 postMessage 发送的消息都会被 onMessage 接收
 *   预期: 底部 Messages Log 实时显示所有来自 WebView 的消息
 */

import React, { Component } from 'react';
import { View, Text, Button, Alert, StyleSheet, ScrollView, Switch } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  messages: string[];
  mainFrameOnly: boolean;
  beforeMainFrameOnly: boolean;
};

const INJECTED_JS = `
(function() {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'injected_after_load',
    url: window.location.href,
    timestamp: Date.now()
  }));
  if (window.self !== window.top) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'iframe_after_load',
      frameName: window.name || 'unnamed'
    }));
  }
  return true;
})();
`;

const INJECTED_JS_BEFORE = `
(function() {
  window.__beforeLoadTime = Date.now();
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'injected_before_load',
    url: window.location.href,
    timestamp: Date.now()
  }));
  if (window.self !== window.top) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'iframe_before_load',
      frameName: window.name || 'unnamed'
    }));
  }
  return true;
})();
`;

export default class InjectionScene extends Component<Props, State> {
  webViewRef = React.createRef<WebView>();

  state: State = {
    messages: [],
    mainFrameOnly: true,
    beforeMainFrameOnly: true,
  };

  addMessage = (msg: string) => {
    this.setState(prev => ({ messages: [...prev.messages, msg].slice(-30) }));
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controlBar}>
          <Button title="Inject JS" onPress={() => {
            this.webViewRef.current?.injectJavaScript(`
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'manual_inject',
                timestamp: Date.now(),
                random: Math.random()
              }));
              true;
            `);
          }} />
          <Button title="Post Message" onPress={() => {
            this.webViewRef.current?.postMessage('Hello from RN at ' + Date.now());
          }} />
          <Button title="Clear Log" onPress={() => this.setState({ messages: [] })} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>MainFrameOnly (after):</Text>
          <Switch value={this.state.mainFrameOnly} onValueChange={v => this.setState({ mainFrameOnly: v })} />
          <Text style={styles.switchLabel}>MainFrameOnly (before):</Text>
          <Switch value={this.state.beforeMainFrameOnly} onValueChange={v => this.setState({ beforeMainFrameOnly: v })} />
        </View>
        <View style={styles.webviewContainer}>
          <WebView
            ref={this.webViewRef}
            source={{ uri: `${BASE_URL}/iframe` }}
            injectedJavaScript={INJECTED_JS}
            injectedJavaScriptBeforeContentLoaded={INJECTED_JS_BEFORE}
            injectedJavaScriptForMainFrameOnly={this.state.mainFrameOnly}
            injectedJavaScriptBeforeContentLoadedForMainFrameOnly={this.state.beforeMainFrameOnly}
            injectedJavaScriptObject={{ appName: 'WebViewTest', version: '1.0', env: 'debug' }}
            onMessage={(e) => {
              this.addMessage(e.nativeEvent.data);
            }}
          />
        </View>
        <ScrollView style={styles.logContainer}>
          <Text style={styles.logTitle}>Messages Log:</Text>
          {this.state.messages.map((msg, i) => (
            <Text key={i} style={styles.logText}>{msg}</Text>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controlBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 8, backgroundColor: '#f0f0f0' },
  switchRow: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#f5f5f5', flexWrap: 'wrap' },
  switchLabel: { fontSize: 11, marginRight: 4 },
  webviewContainer: { flex: 1, borderWidth: 1, borderColor: '#ccc' },
  logContainer: { maxHeight: 150, backgroundColor: '#1a1a1a', padding: 8 },
  logTitle: { color: '#0f0', fontSize: 10, fontWeight: 'bold' },
  logText: { color: '#0f0', fontSize: 9, marginBottom: 2 },
});



// injectedJavaScriptForMainFrameOnly injectedJavaScriptBeforeContentLoadedForMainFrameOnly 不支持，鸿蒙侧会给iframe注入
