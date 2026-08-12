/**
 * ============================================================
 * 场景01: 导航与路由
 * ============================================================
 *
 * 测试点1: 同源页面导航
 *   操作: 点击 "Go to Page 1" / "Go to Page 2" 链接
 *   预期: WebView 内跳转到对应页面，底部日志显示 LoadStart/LoadEnd，
 *         infoBar 显示 canGoBack=true，点击 Back 按钮可返回
 *
 * 测试点2: Back / Forward / Reload / Stop 按钮
 *   操作: 先导航到 Page1，再点 Back → 回到主页；点 Forward → 回到 Page1；点 Reload → 刷新当前页
 *   预期: Back/Forward 按钮根据 canGoBack/canGoForward 自动启用/禁用；
 *         Reload 后页面时间戳更新；Stop 在加载中点击可中断加载
 *
 * 测试点3: 自定义 Schema 拦截 (onShouldStartLoadWithRequest)
 *   操作: 点击 "myapp://profile/123" 链接
 *   预期: 弹出 Alert 显示 "Custom Schema Intercepted: myapp://profile/123"，
 *         WebView 不跳转，页面停留在当前页
 *
 * 测试点4: 系统 Schema 拦截 (tel / mailto / sms)
 *   操作: 分别点击 tel://、mailto:、sms:// 链接
 *   预期: 每次弹出对应 Alert 提示拦截到的 Schema，WebView 不跳转
 *
 * 测试点5: 新窗口拦截 (onOpenWindow)
 *   操作: 点击 "Open example.com (new window)" 链接或 JS 调用 window.open()
 *   预期: 弹出 Alert 显示 "Open Window Intercepted: https://example.com"，
 *         不会打开新标签页
 *
 * 测试点6: 外部链接跳转
 *   操作: 点击 "Open reactnative.dev (external)" 链接
 *   预期: 在 WebView 内直接加载 reactnative.dev 页面
 *
 * 测试点7: originWhitelist 验证
 *   操作: 观察 originWhitelist 配置了 http/https/myapp/tel/mailto/sms
 *   预期: 以上协议的链接在白名单内，可被 onShouldStartLoadWithRequest 拦截处理；
 *         不在白名单的协议会被系统处理
 *
 * 测试点8: onNavigationStateChange 状态追踪
 *   操作: 在页面间来回导航
 *   预期: infoBar 实时更新当前 URL、canGoBack、canGoForward 状态；
 *         底部日志记录每次 Nav 事件
 *
 * 测试点9: javaScriptCanOpenWindowsAutomatically
 *   操作: 点击页面中的 "window.open()" 按钮
 *   预期: JS 可直接调用 window.open() 而无需用户交互，触发 onOpenWindow
 *
 * 测试点10: setSupportMultipleWindows
 *   操作: 查看属性设置为 true
 *   预期: 支持多窗口模式，window.open() 调用会触发 onOpenWindow 而非在同一窗口打开
 */

import React, { Component } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  canGoBack: boolean;
  canGoForward: boolean;
  currentUrl: string;
  navLog: string[];
};

export default class NavigationScene extends Component<Props, State> {
  webViewRef = React.createRef<WebView>();

  state: State = {
    canGoBack: false,
    canGoForward: false,
    currentUrl: '',
    navLog: [],
  };

  addLog = (msg: string) => {
    this.setState(prev => ({
      navLog: [...prev.navLog, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-20),
    }));
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controlBar}>
          <Button title="Back" disabled={!this.state.canGoBack} onPress={() => this.webViewRef.current?.goBack()} />
          <Button title="Forward" disabled={!this.state.canGoForward} onPress={() => this.webViewRef.current?.goForward()} />
          <Button title="Reload" onPress={() => this.webViewRef.current?.reload()} />
          <Button title="Stop" onPress={() => this.webViewRef.current?.stopLoading()} />
        </View>
        <View style={styles.webviewContainer}>
          <WebView
            ref={this.webViewRef}
            source={{ uri: `${BASE_URL}/navigation` }}
            originWhitelist={['https://*', 'http://*', 'myapp://*', 'tel://*', 'mailto:', 'sms://']}
            onNavigationStateChange={(navState) => {
              this.setState({
                canGoBack: navState.canGoBack,
                canGoForward: navState.canGoForward,
                currentUrl: navState.url,
              });
              this.addLog(`Nav: ${navState.url}`);
            }}
            onShouldStartLoadWithRequest={(request) => {
              this.addLog(`ShouldLoad: ${request.url}`);
              if (request.url.startsWith('myapp://')) {
                Alert.alert('Custom Schema Intercepted', request.url);
                return false;
              }
              if (request.url.startsWith('tel:')) {
                Alert.alert('Tel Schema Intercepted', request.url);
                return false;
              }
              if (request.url.startsWith('mailto:')) {
                Alert.alert('Mailto Schema Intercepted', request.url);
                return false;
              }
              if (request.url.startsWith('sms:')) {
                Alert.alert('SMS Schema Intercepted', request.url);
                return false;
              }
              return true;
            }}
            onOpenWindow={(syntheticEvent) => {
              const { targetUrl } = syntheticEvent.nativeEvent;
              this.addLog(`OpenWindow: ${targetUrl}`);
              Alert.alert('Open Window Intercepted', targetUrl);
            }}
            javaScriptCanOpenWindowsAutomatically={true}
            setSupportMultipleWindows={true}
            onLoadStart={(e) => this.addLog(`LoadStart: ${e.nativeEvent.url}`)}
            onLoadEnd={(e) => this.addLog(`LoadEnd: ${e.nativeEvent.url}`)}
            onMessage={(e) => {
              try {
                const data = JSON.parse(e.nativeEvent.data);
                this.addLog(`Message: ${data.type}`);
              } catch {
                this.addLog(`Message: ${e.nativeEvent.data}`);
              }
            }}
          />
        </View>
        <View style={styles.infoBar}>
          <Text style={styles.urlText} numberOfLines={1}>URL: {this.state.currentUrl}</Text>
          <Text style={styles.navText}>Back: {this.state.canGoBack ? 'Y' : 'N'} | Fwd: {this.state.canGoForward ? 'Y' : 'N'}</Text>
        </View>
        <ScrollView style={styles.logContainer}>
          <Text style={styles.logTitle}>Navigation Log:</Text>
          {this.state.navLog.map((log, i) => (
            <Text key={i} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controlBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 8, backgroundColor: '#f0f0f0' },
  webviewContainer: { flex: 1, borderWidth: 1, borderColor: '#ccc' },
  infoBar: { padding: 8, backgroundColor: '#e8e8e8' },
  urlText: { fontSize: 10, color: '#333' },
  navText: { fontSize: 10, color: '#666' },
  logContainer: { maxHeight: 120, backgroundColor: '#1a1a1a', padding: 8 },
  logTitle: { color: '#0f0', fontSize: 10, fontWeight: 'bold' },
  logText: { color: '#0f0', fontSize: 9 },
});


// onOpenWindow 事件在鸿蒙侧无效
// 'myapp://'场景 onShouldStartLoadWithRequest能成功拦截，但是鸿蒙拦截后会加载到新的页面空白页，安卓会保留再原页面
