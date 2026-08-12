/**
 * ============================================================
 * 嵌套滚动 Demo 1: WebView(scrollEnabled=false) 嵌套在 ScrollView 中
 * ============================================================
 *
 * 测试场景: WebView 设置 scrollEnabled=false，外层包裹 RN ScrollView
 *
 * 如何测试:
 *   1. 在 WebView 区域上下滑动 → 预期: WebView 内容不可滚动，但外层 ScrollView 应该可以滚动
 *   2. 在 WebView 区域外的 RN 区域上下滑动 → 预期: 外层 ScrollView 正常滚动
 *   3. 切换 scrollEnabled 开关为 true → 预期: WebView 内容可滚动，但外层 ScrollView 可能无法响应触摸
 *   4. 切换 scrollEnabled 回 false → 预期: 外层 ScrollView 恢复可滚动
 *
 * 验证要点:
 *   - scrollEnabled=false 时，WebView 是否正确将触摸事件传递给外层 ScrollView
 *   - scrollEnabled=true 时，WebView 和外层 ScrollView 的滚动是否冲突
 *   - iOS 和 Android 平台行为是否一致
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const LONG_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; }
.item { padding: 20px; margin: 8px 0; background: #e3f2fd; border-radius: 8px; font-size: 16px; }
${INTERACTION_CSS}
</style></head>
<body>
<h2>WebView 长内容 (scrollEnabled=false)</h2>
<p>在 WebView 区域上下滑动，验证外层 ScrollView 是否能滚动</p>
${INTERACTION_HTML}
${Array.from({length: 30}, (_, i) => `<div class="item">WebView Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  scrollEnabled: boolean;
};

export default class DisabledWebViewInScrollView extends Component<Props, State> {
  state: State = {
    scrollEnabled: false,
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controlBar}>
          <Text style={styles.label}>WebView scrollEnabled</Text>
          <Switch
            value={this.state.scrollEnabled}
            onValueChange={v => this.setState({ scrollEnabled: v })}
          />
          <Text style={styles.value}>{this.state.scrollEnabled ? 'true' : 'false'}</Text>
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 顶部 (WebView 上方)</Text>
          </View>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ html: LONG_HTML }}
              scrollEnabled={this.state.scrollEnabled}
              style={styles.webview}
            />
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 底部 (WebView 下方)</Text>
          </View>
          {Array.from({length: 10}, (_, i) => (
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
    backgroundColor: '#fff3e0',
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc80',
  },
  label: { fontSize: 12, fontWeight: 'bold', marginRight: 8 },
  value: { fontSize: 12, color: '#e65100', marginLeft: 4 },
  scrollView: { flex: 1 },
  rnBlock: {
    padding: 16,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
  },
  rnText: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32' },
  webviewWrapper: {
    height: 300,
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  webview: { flex: 1 },
  rnItem: {
    padding: 12,
    margin: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
});
