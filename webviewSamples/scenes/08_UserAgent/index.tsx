/**
 * ============================================================
 * 场景08: User Agent 与 HTTP 请求
 * ============================================================
 *
 * 测试点1: 默认 User-Agent
 *   操作: 进入页面，观察 WebView 中显示的 User-Agent
 *   预期: 显示系统默认的 User-Agent 字符串（包含浏览器和系统信息）
 *
 * 测试点2: 自定义 userAgent
 *   操作: 开启 "Custom userAgent" 开关，在输入框中修改 UA 字符串，点击 Reload
 *   预期: 页面中显示的 User-Agent 变为自定义值，完全替换默认 UA
 *
 * 测试点3: applicationNameForUserAgent
 *   操作: 开启 "applicationNameForUserAgent" 开关，点击 Reload
 *   预期: User-Agent 末尾追加 "DemoApp/1.1.0"，原有 UA 保留
 *
 * 测试点4: userAgent 与 applicationNameForUserAgent 优先级
 *   操作: 同时开启两个开关
 *   预期: userAgent 优先，applicationNameForUserAgent 被忽略
 *
 * 测试点5: Custom Headers (source.headers)
 *   操作: 开启 "Custom Headers" 开关，点击 Reload
 *   预期: 页面中显示请求头包含 X-Custom-Header、X-App-Version、Authorization
 *
 * 测试点6: POST Request (source.method + source.body)
 *   操作: 开启 "POST Request" 开关，点击 Reload
 *   预期: 页面以 POST 方式加载，服务端返回 "POST received!" 及请求体内容
 *
 * 测试点7: Basic Auth (basicAuthCredential)
 *   操作: 开启 "Basic Auth" 开关，点击 Reload
 *   预期: 自动携带 username=admin, password=password 的认证信息，
 *         页面显示 "Authenticated!" 而非 401 错误
 *
 * 测试点8: Basic Auth 认证失败
 *   操作: 修改代码中密码为错误值，开启 Basic Auth
 *   预期: 页面显示 401 认证失败
 */

import React, { Component } from 'react';
import { View, Text, TextInput, Button, Switch, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  customUserAgent: string;
  appNameForUserAgent: string;
  currentUrl: string;
  useCustomUA: boolean;
  useAppName: boolean;
  usePostRequest: boolean;
  useCustomHeaders: boolean;
  useBasicAuth: boolean;
};

export default class UserAgentScene extends Component<Props, State> {
  webViewRef = React.createRef<WebView>();

  state: State = {
    customUserAgent: 'MyApp/1.0 (Mobile; React Native)',
    appNameForUserAgent: 'DemoApp/1.1.0',
    currentUrl: '',
    useCustomUA: true,
    useAppName: true,
    usePostRequest: false,
    useCustomHeaders: false,
    useBasicAuth: false,
  };

  getSource = () => {
    if (this.state.useBasicAuth) {
      return {
        uri: `${BASE_URL}/auth`,
      };
    }
    if (this.state.usePostRequest) {
      return {
        uri: `${BASE_URL}/post-endpoint`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'react-native', timestamp: Date.now() }),
      };
    }
    if (this.state.useCustomHeaders) {
      return {
        uri: `${BASE_URL}/headers-test`,
        headers: {
          'X-Custom-Header': 'CustomValue123',
          'X-App-Version': '1.0.0',
          'Authorization': 'Bearer test-token-123',
        },
      };
    }
    return { uri: `${BASE_URL}/user-agent` };
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>User Agent</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Custom userAgent</Text>
            <Switch value={this.state.useCustomUA} onValueChange={v => this.setState({ useCustomUA: v })} />
          </View>
          <TextInput
            style={styles.input}
            value={this.state.customUserAgent}
            onChangeText={v => this.setState({ customUserAgent: v })}
            placeholder="Custom User-Agent string"
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>applicationNameForUserAgent</Text>
            <Switch value={this.state.useAppName} onValueChange={v => this.setState({ useAppName: v })} />
          </View>
          <TextInput
            style={styles.input}
            value={this.state.appNameForUserAgent}
            onChangeText={v => this.setState({ appNameForUserAgent: v })}
            placeholder="App name suffix"
          />
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>HTTP Options</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Custom Headers</Text>
            <Switch value={this.state.useCustomHeaders} onValueChange={v => this.setState({ useCustomHeaders: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>POST Request</Text>
            <Switch value={this.state.usePostRequest} onValueChange={v => this.setState({ usePostRequest: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Basic Auth</Text>
            <Switch value={this.state.useBasicAuth} onValueChange={v => this.setState({ useBasicAuth: v })} />
          </View>
        </View>

        <View style={styles.controlBar}>
          <Button title="Reload" onPress={() => this.webViewRef.current?.reload()} />
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            ref={this.webViewRef}
            source={this.getSource()}
            userAgent={this.state.useCustomUA ? this.state.customUserAgent : undefined}
            applicationNameForUserAgent={this.state.useAppName ? this.state.appNameForUserAgent : undefined}
            basicAuthCredential={this.state.useBasicAuth ? { username: 'admin', password: 'password' } : undefined}
            onNavigationStateChange={(navState) => this.setState({ currentUrl: navState.url })}
            nestedScrollEnabled={true}
            onMessage={(e) => {
              try {
                const data = JSON.parse(e.nativeEvent.data);
                if (data.type === 'user_agent') {
                  console.log('User-Agent from web:', data.userAgent);
                }
              } catch {}
            }}
          />
        </View>
        <Text style={styles.urlText}>URL: {this.state.currentUrl}</Text>
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
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, fontSize: 12, marginVertical: 4 },
  controlBar: { flexDirection: 'row', padding: 4, backgroundColor: '#e8e8e8' },
  webviewContainer: { height: 350, borderWidth: 1, borderColor: '#ccc' },
  urlText: { fontSize: 10, color: '#666', padding: 4 },
});



// userAgent设置无效