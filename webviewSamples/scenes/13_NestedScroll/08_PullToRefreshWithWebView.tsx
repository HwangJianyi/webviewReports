/**
 * ============================================================
 * 嵌套滚动 Demo 8: PullToRefresh + WebView
 * ============================================================
 *
 * 测试场景: 外层 ScrollView 设置 RefreshControl（下拉刷新），
 *          内嵌 WebView，验证下拉刷新手势与 WebView 滚动/弹性回弹冲突
 *
 * 如何测试:
 *   1. 在 RN 区域顶部下拉 → 预期: 触发下拉刷新指示器，显示刷新动画
 *   2. 在 WebView 区域下拉（WebView 内容在顶部） → 预期: 观察是触发刷新还是 WebView 弹性回弹
 *   3. 切换 bounces 开关 (iOS) → 预期: 关闭 bounces 后 WebView 无弹性回弹，下拉可能触发刷新
 *   4. 切换 scrollEnabled 开关 → 预期: scrollEnabled=false 时 WebView 不吞噬触摸，下拉应触发刷新
 *   5. WebView 内容未滚动到顶部时下拉 → 预期: WebView 内容向上滚动，不触发刷新
 *   6. 切换 nestedScrollEnabled (Android) → 预期: 影响下拉刷新行为
 *
 * 验证要点:
 *   - 下拉刷新与 WebView 弹性回弹 (bounces) 的冲突
 *   - scrollEnabled=false 时下拉刷新是否正常
 *   - Android 上 nestedScrollEnabled 对下拉刷新的影响
 *   - iOS 上 bounces 与 RefreshControl 的竞争
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const LONG_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; }
.item { padding: 20px; margin: 8px 0; background: #e8eaf6; border-radius: 8px; font-size: 16px; }
${INTERACTION_CSS}
</style></head>
<body>
<h2>WebView 长内容</h2>
<p>在 WebView 区域下拉，验证是否触发外层下拉刷新</p>
${INTERACTION_HTML}
${Array.from({length: 30}, (_, i) => `<div class="item">WebView Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  refreshing: boolean;
  scrollEnabled: boolean;
  bounces: boolean;
  nestedScrollEnabled: boolean;
};

export default class PullToRefreshWithWebView extends Component<Props, State> {
  state: State = {
    refreshing: false,
    scrollEnabled: true,
    bounces: true,
    nestedScrollEnabled: false,
  };

  onRefresh = () => {
    this.setState({ refreshing: true });
    setTimeout(() => this.setState({ refreshing: false }), 2000);
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controlBar}>
          <Text style={styles.label}>scrollEnabled</Text>
          <Switch value={this.state.scrollEnabled} onValueChange={v => this.setState({ scrollEnabled: v })} />
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>bounces</Text>
          <Switch value={this.state.bounces} onValueChange={v => this.setState({ bounces: v })} />
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>nested</Text>
          <Switch value={this.state.nestedScrollEnabled} onValueChange={v => this.setState({ nestedScrollEnabled: v })} />
        </View>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        >
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 顶部 (在此下拉触发刷新)</Text>
          </View>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ html: LONG_HTML }}
              scrollEnabled={this.state.scrollEnabled}
              bounces={this.state.bounces}
              nestedScrollEnabled={this.state.nestedScrollEnabled}
              style={styles.webview}
            />
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 底部</Text>
          </View>
          {Array.from({length: 8}, (_, i) => (
            <View key={i} style={styles.rnItem}>
              <Text>外层 ScrollView Item {i + 1}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderBottomWidth: 1,
    borderBottomColor: '#90caf9',
    flexWrap: 'wrap',
  },
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  separator: { fontSize: 14, color: '#ccc', marginHorizontal: 4 },
  scrollView: { flex: 1 },
  rnBlock: {
    padding: 14,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
  },
  rnText: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  webviewWrapper: {
    height: 350,
    borderWidth: 2,
    borderColor: '#1565c0',
  },
  webview: { flex: 1 },
  rnItem: {
    padding: 12,
    margin: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
});
