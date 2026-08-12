/**
 * ============================================================
 * 嵌套滚动 Demo 5: nestedScrollEnabled 综合对比
 * ============================================================
 *
 * 测试场景: 同一个页面中并排展示两个 WebView，分别开启/关闭 nestedScrollEnabled
 *          用于直观对比 nestedScrollEnabled 在 Android 上的效果
 *
 * 如何测试:
 *   1. 在左侧 WebView (nestedScrollEnabled=false) 区域上下滑动
 *      预期 (Android): WebView 内部可滚动，但滚动到边界时外层 ScrollView 不接管
 *      预期 (iOS): 无此属性，行为一致
 *   2. 在右侧 WebView (nestedScrollEnabled=true) 区域上下滑动
 *      预期 (Android): WebView 内部可滚动，滚动到边界时外层 ScrollView 接管滚动
 *   3. 切换 scrollEnabled 开关 → 预期: 两个 WebView 同时受影响
 *   4. 在外层 ScrollView 上下滑动 → 预期: 页面正常滚动
 *
 * 验证要点:
 *   - nestedScrollEnabled 对 Android 滚动嵌套的修复效果
 *   - 左右对比，直观感受差异
 *   - iOS 上 nestedScrollEnabled 是否有任何影响
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const LONG_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 12px; font-family: sans-serif; }
.item { padding: 14px; margin: 4px 0; background: #e0f7fa; border-radius: 6px; font-size: 13px; }
${INTERACTION_CSS}
</style></head>
<body>
${INTERACTION_HTML}
${Array.from({length: 25}, (_, i) => `<div class="item">Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  scrollEnabled: boolean;
};

export default class NestedScrollEnabledToggle extends Component<Props, State> {
  state: State = {
    scrollEnabled: true,
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
          <Text style={styles.value}>{this.state.scrollEnabled ? 'true' : 'false'}</Text>
        </View>
        <View style={styles.legend}>
          <View style={[styles.legendItem, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.legendText}>左侧: nestedScrollEnabled=false</Text>
          </View>
          <View style={[styles.legendItem, { backgroundColor: '#f3e5f5' }]}>
            <Text style={styles.legendText}>右侧: nestedScrollEnabled=true</Text>
          </View>
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 顶部</Text>
          </View>
          <View style={styles.compareRow}>
            <View style={styles.compareCell}>
              <Text style={styles.cellLabel}>nestedScroll=false</Text>
              <View style={styles.webviewWrapper}>
                <WebView
                  source={{ html: LONG_HTML }}
                  scrollEnabled={this.state.scrollEnabled}
                  nestedScrollEnabled={false}
                  style={styles.webview}
                />
              </View>
            </View>
            <View style={styles.compareCell}>
              <Text style={styles.cellLabel}>nestedScroll=true</Text>
              <View style={styles.webviewWrapper}>
                <WebView
                  source={{ html: LONG_HTML }}
                  scrollEnabled={this.state.scrollEnabled}
                  nestedScrollEnabled={true}
                  style={styles.webview}
                />
              </View>
            </View>
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
    backgroundColor: '#f3e5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ce93d8',
  },
  label: { fontSize: 12, fontWeight: 'bold', marginRight: 8 },
  value: { fontSize: 12, color: '#6a1b9a', marginLeft: 4 },
  legend: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#fafafa',
  },
  legendItem: {
    flex: 1,
    padding: 6,
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 4,
  },
  legendText: { fontSize: 10, fontWeight: 'bold' },
  scrollView: { flex: 1 },
  rnBlock: {
    padding: 12,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
  },
  rnText: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  compareRow: {
    flexDirection: 'row',
    height: 300,
  },
  compareCell: {
    flex: 1,
    margin: 2,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6a1b9a',
    padding: 2,
    textAlign: 'center',
  },
  webviewWrapper: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#9c27b0',
  },
  webview: { flex: 1 },
  rnItem: {
    padding: 12,
    margin: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
});
