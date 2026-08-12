/**
 * ============================================================
 * 嵌套滚动 Demo 9: StickyHeader + WebView
 * ============================================================
 *
 * 测试场景: WebView 上方有吸顶 Header（stickyHeaderIndices），
 *          滚动时 Header 固定在顶部，验证 WebView 区域滚动是否正常
 *
 * 如何测试:
 *   1. 向上滚动页面 → 预期: Header 吸顶固定，WebView 区域随页面滚动
 *   2. 在 WebView 区域内上下滑动 → 预期: WebView 内容可滚动
 *   3. 吸顶后继续在 WebView 区域滑动 → 预期: WebView 正常滚动，Header 不受影响
 *   4. 切换 scrollEnabled 开关 → 预期: WebView 滚动受控
 *   5. 切换 nestedScrollEnabled (Android) → 预期: 影响嵌套滚动传递
 *   6. 在吸顶状态下快速上下滑动 → 预期: 不应出现 Header 闪烁或 WebView 卡死
 *
 * 验证要点:
 *   - StickyHeader 吸顶后 WebView 区域滚动是否正常
 *   - 吸顶动画与 WebView 滚动是否冲突
 *   - Header 闪烁问题
 *   - nestedScrollEnabled 在吸顶场景下的效果
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
.item { padding: 18px; margin: 6px 0; background: #fff3e0; border-radius: 8px; font-size: 15px; }
${INTERACTION_CSS}
</style></head>
<body>
<h2>WebView 长内容</h2>
<p>滚动页面使 Header 吸顶，然后在 WebView 区域滑动</p>
${INTERACTION_HTML}
${Array.from({length: 25}, (_, i) => `<div class="item">WebView Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  scrollEnabled: boolean;
  nestedScrollEnabled: boolean;
};

export default class StickyHeaderWithWebView extends Component<Props, State> {
  state: State = {
    scrollEnabled: true,
    nestedScrollEnabled: false,
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controlBar}>
          <Text style={styles.label}>scrollEnabled</Text>
          <Switch value={this.state.scrollEnabled} onValueChange={v => this.setState({ scrollEnabled: v })} />
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>nested</Text>
          <Switch value={this.state.nestedScrollEnabled} onValueChange={v => this.setState({ nestedScrollEnabled: v })} />
        </View>
        <ScrollView
          style={styles.scrollView}
          stickyHeaderIndices={[2]}
        >
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 顶部</Text>
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - Header 前</Text>
          </View>
          <View style={styles.stickyHeader}>
            <Text style={styles.stickyHeaderText}>Sticky Header - 吸顶固定</Text>
          </View>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ html: LONG_HTML }}
              scrollEnabled={this.state.scrollEnabled}
              nestedScrollEnabled={this.state.nestedScrollEnabled}
              style={styles.webview}
            />
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 底部</Text>
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
    borderBottomColor: '#ffe0b2',
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
  stickyHeader: {
    padding: 14,
    backgroundColor: '#e65100',
    alignItems: 'center',
  },
  stickyHeaderText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  webviewWrapper: {
    height: 300,
    borderWidth: 2,
    borderColor: '#e65100',
  },
  webview: { flex: 1 },
  rnItem: {
    padding: 12,
    margin: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
});
