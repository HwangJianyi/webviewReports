/**
 * ============================================================
 * 嵌套滚动 Demo 2: WebView(scrollEnabled=true) 嵌套在 ScrollView 中
 * ============================================================
 *
 * 测试场景: WebView 设置 scrollEnabled=true，外层包裹 RN ScrollView
 *          这是典型的滚动冲突场景
 *
 * 如何测试:
 *   1. 在 WebView 区域上下滑动 → 预期: WebView 内部内容滚动，外层 ScrollView 不滚动
 *   2. 滚动到 WebView 内容底部后继续向下 → 预期: 观察外层 ScrollView 是否接管滚动
 *   3. 滚动到 WebView 内容顶部后继续向上 → 预期: 观察外层 ScrollView 是否接管滚动
 *   4. 切换 nestedScrollEnabled 开关 (Android) → 预期: 开启后 WebView 内部滚动到边界时外层可接管
 *   5. 在 WebView 区域外的 RN 区域上下滑动 → 预期: 外层 ScrollView 正常滚动
 *
 * 验证要点:
 *   - scrollEnabled=true 时，WebView 和外层 ScrollView 的滚动冲突如何表现
 *   - 滚动到 WebView 内容边界时，事件是否能传递给外层
 *   - nestedScrollEnabled 对 Android 的修复效果
 *   - iOS 上的行为差异
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
.item { padding: 20px; margin: 8px 0; background: #fce4ec; border-radius: 8px; font-size: 16px; }
${INTERACTION_CSS}
</style></head>
<body>
<h2>WebView 长内容 (scrollEnabled=true)</h2>
<p>在 WebView 区域上下滑动，验证与外层 ScrollView 的滚动冲突</p>
${INTERACTION_HTML}
${Array.from({length: 30}, (_, i) => `<div class="item">WebView Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  nestedScrollEnabled: boolean;
};

export default class EnabledWebViewInScrollView extends Component<Props, State> {
  state: State = {
    nestedScrollEnabled: false,
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controlBar}>
          <Text style={styles.label}>nestedScrollEnabled (Android)</Text>
          <Switch
            value={this.state.nestedScrollEnabled}
            onValueChange={v => this.setState({ nestedScrollEnabled: v })}
          />
          <Text style={styles.value}>{this.state.nestedScrollEnabled ? 'true' : 'false'}</Text>
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 顶部 (WebView 上方)</Text>
          </View>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ html: LONG_HTML }}
              scrollEnabled={true}
              nestedScrollEnabled={this.state.nestedScrollEnabled}
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
    backgroundColor: '#fce4ec',
    borderBottomWidth: 1,
    borderBottomColor: '#f48fb1',
  },
  label: { fontSize: 12, fontWeight: 'bold', marginRight: 8 },
  value: { fontSize: 12, color: '#c62828', marginLeft: 4 },
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
    borderColor: '#e91e63',
  },
  webview: { flex: 1 },
  rnItem: {
    padding: 12,
    margin: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
});
