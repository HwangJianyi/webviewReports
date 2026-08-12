/**
 * ============================================================
 * 嵌套滚动 Demo 4: 多个 WebView 嵌套在同一个 ScrollView 中
 * ============================================================
 *
 * 测试场景: 多个 WebView 依次排列在同一个 ScrollView 中
 *          模拟常见场景: 文章页面中多个 WebView 混合 RN 原生组件
 *
 * 如何测试:
 *   1. 整体上下滑动 → 预期: 外层 ScrollView 能在各 WebView 之间滚动
 *   2. 在第一个 WebView 区域内滑动 → 预期: WebView1 内容滚动
 *   3. 滚动到第一个 WebView 底部后继续向下 → 预期: 外层 ScrollView 接管滚动
 *   4. 切换 scrollEnabled 开关 → 预期: 所有 WebView 同时受影响
 *   5. 切换 nestedScrollEnabled 开关 (Android) → 预期: 开启后边界滚动传递更顺畅
 *   6. 快速在多个 WebView 之间滑动 → 预期: 不应出现滚动卡死或错乱
 *
 * 验证要点:
 *   - 多个 WebView 在同一 ScrollView 中是否互相影响
 *   - 在不同 WebView 之间切换时滚动是否流畅
 *   - scrollEnabled 和 nestedScrollEnabled 的全局效果
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const generateHTML = (title: string, color: string, count: number) => `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; }
.item { padding: 16px; margin: 6px 0; background: ${color}; border-radius: 8px; font-size: 14px; }
${INTERACTION_CSS}
</style></head>
<body>
<h3>${title}</h3>
${INTERACTION_HTML}
${Array.from({length: count}, (_, i) => `<div class="item">${title} - Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  scrollEnabled: boolean;
  nestedScrollEnabled: boolean;
};

export default class MultipleWebViewsInScrollView extends Component<Props, State> {
  state: State = {
    scrollEnabled: true,
    nestedScrollEnabled: false,
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controlBar}>
          <Text style={styles.label}>scrollEnabled</Text>
          <Switch
            value={this.state.scrollEnabled}
            onValueChange={v => this.setState({ scrollEnabled: v })}
          />
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>nestedScroll</Text>
          <Switch
            value={this.state.nestedScrollEnabled}
            onValueChange={v => this.setState({ nestedScrollEnabled: v })}
          />
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 页面顶部</Text>
          </View>
          <Text style={styles.webviewLabel}>WebView 1 (长内容)</Text>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ html: generateHTML('WebView 1', '#e3f2fd', 20) }}
              scrollEnabled={this.state.scrollEnabled}
              nestedScrollEnabled={this.state.nestedScrollEnabled}
              style={styles.webview}
            />
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 中间分隔</Text>
          </View>
          <Text style={styles.webviewLabel}>WebView 2 (短内容)</Text>
          <View style={styles.webviewWrapperShort}>
            <WebView
              source={{ html: generateHTML('WebView 2', '#fce4ec', 3) }}
              scrollEnabled={this.state.scrollEnabled}
              nestedScrollEnabled={this.state.nestedScrollEnabled}
              style={styles.webview}
            />
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 中间分隔</Text>
          </View>
          <Text style={styles.webviewLabel}>WebView 3 (长内容)</Text>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ html: generateHTML('WebView 3', '#e8f5e9', 20) }}
              scrollEnabled={this.state.scrollEnabled}
              nestedScrollEnabled={this.state.nestedScrollEnabled}
              style={styles.webview}
            />
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 页面底部</Text>
          </View>
          {Array.from({length: 5}, (_, i) => (
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
    backgroundColor: '#fff8e1',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe082',
    flexWrap: 'wrap',
  },
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  separator: { fontSize: 14, color: '#ccc', marginHorizontal: 8 },
  scrollView: { flex: 1 },
  rnBlock: {
    padding: 12,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
  },
  rnText: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  webviewLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f57f17',
    padding: 4,
    backgroundColor: '#fffde7',
  },
  webviewWrapper: {
    height: 250,
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  webviewWrapperShort: {
    height: 150,
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
