/**
 * ============================================================
 * 场景04: 加载与错误处理
 * ============================================================
 *
 * 测试点1: onLoadProgress (加载进度) -- 相同
 *   操作: 点击 "Load Valid" 或首次加载页面
 *   预期: 顶部蓝色进度条从 0% 渐进到 100%，底部日志显示各阶段 Progress 百分比
 *
 * 测试点2: onLoad / onLoadStart / onLoadEnd 生命周期
 *   操作: 触发页面加载
 *   预期: 底部日志依次出现 LoadStart → Load → LoadEnd 事件，状态从 loading → loaded
 *
 * 测试点3: onError (加载失败)
 *   操作: 点击 "Invalid URL" 按钮
 *   预期: 底部日志出现 Error 事件，显示错误描述（如 net::ERR_NAME_NOT_RESOLVED）
 *
 * 测试点4: onHttpError (HTTP 错误)
 *   操作: 点击 "Load 404" 或 "Load 500" 按钮
 *   预期: 底部日志出现 HttpError 事件，显示 404 或 500 状态码
 *
 * 测试点5: renderError (自定义错误视图)
 *   操作: 代码中 showCustomError 切换为 true 后触发加载错误
 *   预期: WebView 区域显示自定义错误视图（红色背景 + 错误名称 + Retry 按钮）
 *
 * 测试点6: renderLoading (自定义加载视图)
 *   操作: 代码中 showCustomLoading 切换为 true 后加载页面
 *   预期: 加载期间显示 "Custom Loading..." 蓝色文字覆盖层
 *
 * 测试点7: startInLoadingState
 *   操作: 页面首次加载时
 *   预期: 因为 startInLoadingState=true，首次加载时显示加载指示器
 *
 * 测试点8: reload() 方法
 *   操作: 点击 "Reload" 按钮
 *   预期: 页面重新加载，进度条重新走一遍，日志出现新的 LoadStart/LoadEnd
 *
 * 测试点9: stopLoading() 方法
 *   操作: 点击 "Load Valid" 后立即点击 "Stop"
 *   预期: 加载被中断，进度条停止，页面可能显示部分加载内容
 *
 * 测试点10: onContentProcessDidTerminate (iOS)
 *   操作: 在 iOS 上内存不足时系统终止 WebView 进程
 *   预期: 日志出现 ContentProcessTerminated 事件，可在此回调中调用 reload() 恢复
 *
 * 测试点11: onRenderProcessGone (Android)
 *   操作: 在 Android 上 WebView 渲染进程崩溃
 *   预期: 日志出现 RenderProcessGone 事件，显示 didCrash 标志
 */

import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  loadProgress: number;
  loadingState: string;
  events: string[];
  showCustomError: boolean;
  showCustomLoading: boolean;
};

export default class LoadingScene extends Component<Props, State> {
  webViewRef = React.createRef<WebView>();

  state: State = {
    loadProgress: 0,
    loadingState: 'idle',
    events: [],
    showCustomError: false,
    showCustomLoading: false,
  };

  addEvent = (msg: string) => {
    this.setState(prev => ({ events: [...prev.events, msg].slice(-20) }));
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${this.state.loadProgress * 100}%` }]} />
        </View>
        <View style={styles.controlBar}>
          <Button title="Load Valid" onPress={() => {
            this.webViewRef.current?.injectJavaScript(`window.location.href = '${BASE_URL}/navigation'; true;`);
          }} />
          <Button title="Load 404" onPress={() => {
            this.webViewRef.current?.injectJavaScript(`window.location.href = '${BASE_URL}/error/404'; true;`);
          }} />
          <Button title="Load 500" onPress={() => {
            this.webViewRef.current?.injectJavaScript(`window.location.href = '${BASE_URL}/error/500'; true;`);
          }} />
          <Button title="Invalid URL" onPress={() => {
            this.webViewRef.current?.injectJavaScript(`window.location.href = 'http://invalid-host-that-does-not-exist.local'; true;`);
          }} />
          <Button title="Reload" onPress={() => this.webViewRef.current?.reload()} />
          <Button title="Stop" onPress={() => this.webViewRef.current?.stopLoading()} />
          <Button title="Clear Log" onPress={() => this.setState({ events: [] })} />
        </View>
        <View style={styles.webviewContainer}>
          <WebView
            ref={this.webViewRef}
            source={{ uri: `${BASE_URL}/navigation` }}
            startInLoadingState={true}
            renderLoading={this.state.showCustomLoading ? () => (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>Custom Loading...</Text>
              </View>
            ) : undefined}
            renderError={this.state.showCustomError ? (errorName) => (
              <View style={styles.errorOverlay}>
                <Text style={styles.errorText}>Custom Error View</Text>
                <Text style={styles.errorText}>{errorName}</Text>
                <Button title="Retry" onPress={() => this.webViewRef.current?.reload()} />
              </View>
            ) : undefined}
            onLoadStart={(e) => {
              this.setState({ loadingState: 'loading' });
              this.addEvent(`LoadStart: ${e.nativeEvent.url}`);
            }}
            onLoadEnd={(e) => {
              this.setState({ loadingState: 'loaded' });
              this.addEvent(`LoadEnd: ${e.nativeEvent.url}`);
            }}
            onLoad={(e) => {
              this.addEvent(`Load: ${e.nativeEvent.url}`);
            }}
            onLoadProgress={({ nativeEvent }) => {
              this.setState({ loadProgress: nativeEvent.progress });
              this.addEvent(`Progress: ${Math.round(nativeEvent.progress * 100)}%`);
            }}
            onError={(e) => {
              this.addEvent(`Error: ${e.nativeEvent.description}`);
            }}
            onHttpError={(e) => {
              this.addEvent(`HttpError: ${e.nativeEvent.statusCode} - ${e.nativeEvent.description}`);
            }}
            onContentProcessDidTerminate={(e) => {
              this.addEvent(`ContentProcessTerminated: ${e.nativeEvent.url}`);
            }}
            onRenderProcessGone={(e) => {
              this.addEvent(`RenderProcessGone: didCrash=${e.nativeEvent.didCrash}`);
            }}
          />
        </View>
        <ScrollView style={styles.logContainer}>
          <Text style={styles.logTitle}>Events (State: {this.state.loadingState}):</Text>
          {this.state.events.map((ev, i) => (
            <Text key={i} style={styles.logText}>{ev}</Text>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressBar: { height: 3, backgroundColor: '#e0e0e0' },
  progressFill: { height: 3, backgroundColor: '#007AFF' },
  controlBar: { flexDirection: 'row', flexWrap: 'wrap', padding: 4, backgroundColor: '#f0f0f0' },
  webviewContainer: { flex: 1, borderWidth: 1, borderColor: '#ccc' },
  loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { fontSize: 16, color: '#007AFF' },
  errorOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff5f5' },
  errorText: { fontSize: 14, color: '#c00', marginBottom: 8 },
  logContainer: { maxHeight: 120, backgroundColor: '#1a1a1a', padding: 8 },
  logTitle: { color: '#0f0', fontSize: 10, fontWeight: 'bold' },
  logText: { color: '#0f0', fontSize: 9 },
});


// 点击gotoPage1 没有输出loadStart
// onHttpError，e.nativeEvent.description为空
// 先点击Load 404， 没有输出loadStart，再点击Load 500，输出loadStart，且loadStart显示的是404的url，loadEnd显示的是500的url
// 先点击Load Valid， 再点击Invaild URL，最开始比安卓多输出loadStart，且loadStart显示的是Valid的url。Error的描述不同，后面load、loadEnd显示的是Valid的url，且缺少一个loadStart