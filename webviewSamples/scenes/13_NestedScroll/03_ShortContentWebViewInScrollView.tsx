/**
 * ============================================================
 * 嵌套滚动 Demo 3: 短内容 WebView 嵌套在 ScrollView 中
 * ============================================================
 *
 * 测试场景: WebView 内容很短不足以滚动，外层包裹 RN ScrollView
 *          重点验证: 当 WebView 内容不需要滚动时，触摸事件是否能正确传递给外层
 *
 * 如何测试:
 *   1. 在 WebView 区域上下滑动 → 预期: WebView 内容无滚动，外层 ScrollView 应该能滚动
 *   2. 在 WebView 区域外的 RN 区域上下滑动 → 预期: 外层 ScrollView 正常滚动
 *   3. 切换 scrollEnabled 开关 → 预期: 无论 scrollEnabled 为 true 还是 false，
 *      短内容 WebView 都不应该吞噬触摸事件
 *   4. 来回滑动验证外层 ScrollView 是否流畅
 *
 * 验证要点:
 *   - 短内容 WebView 是否会吞噬触摸事件导致外层 ScrollView 无法滚动
 *   - scrollEnabled 对短内容 WebView 的影响
 *   - 是否存在"卡死"现象（触摸在 WebView 区域时外层无法滚动）
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const SHORT_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; background: #e8eaf6; }
${INTERACTION_CSS}
</style></head>
<body>
<h3>短内容 WebView</h3>
<p>此 WebView 内容不足以滚动，在 WebView 区域上下滑动应能传递给外层 ScrollView。</p>
${INTERACTION_HTML}
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  scrollEnabled: boolean;
};

export default class ShortContentWebViewInScrollView extends Component<Props, State> {
  state: State = {
    scrollEnabled: true,
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
            <Text style={styles.rnText}>RN 区域 - 顶部</Text>
          </View>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ html: SHORT_HTML }}
              scrollEnabled={this.state.scrollEnabled}
              style={styles.webview}
            />
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 中间</Text>
          </View>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ html: SHORT_HTML }}
              scrollEnabled={this.state.scrollEnabled}
              style={styles.webview}
            />
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 底部</Text>
          </View>
          {Array.from({length: 15}, (_, i) => (
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
    backgroundColor: '#e8eaf6',
    borderBottomWidth: 1,
    borderBottomColor: '#9fa8da',
  },
  label: { fontSize: 12, fontWeight: 'bold', marginRight: 8 },
  value: { fontSize: 12, color: '#283593', marginLeft: 4 },
  scrollView: { flex: 1 },
  rnBlock: {
    padding: 16,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
  },
  rnText: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32' },
  webviewWrapper: {
    height: 120,
    borderWidth: 2,
    borderColor: '#3f51b5',
  },
  webview: { flex: 1 },
  rnItem: {
    padding: 12,
    margin: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
});
