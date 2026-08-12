/**
 * ============================================================
 * 嵌套滚动 Demo 7: 水平滑动 WebView 在垂直 ScrollView 中
 * ============================================================
 *
 * 测试场景: WebView 内容需要水平滚动（如宽表格、轮播图），
 *          外层是垂直方向的 ScrollView，验证对角线滑动时的方向冲突
 *
 * 如何测试:
 *   1. 在 WebView 区域水平滑动 → 预期: WebView 内容水平滚动
 *   2. 在 WebView 区域垂直滑动 → 预期: 外层 ScrollView 垂直滚动
 *   3. 在 WebView 区域对角线滑动 → 预期: 观察方向锁定行为，是否只响应一个方向
 *   4. 切换 directionalLockEnabled 开关 (iOS) → 预期: 开启后对角线滑动锁定为单方向
 *   5. 在 WebView 水平滚动到边界后继续滑动 → 预期: 观察是否触发外层垂直滚动
 *
 * 验证要点:
 *   - 水平/垂直方向滑动的手势竞争
 *   - 对角线滑动时方向锁定行为
 *   - directionalLockEnabled 的效果
 *   - WebView 水平滚动到边界后事件是否传递
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const WIDE_TABLE_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; }
.scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { border-collapse: collapse; width: 1200px; }
th, td { border: 1px solid #ddd; padding: 10px; font-size: 13px; white-space: nowrap; }
th { background: #1976d2; color: #fff; }
tr:nth-child(even) { background: #f5f5f5; }
${INTERACTION_CSS}
</style></head>
<body>
<h3>宽表格 - 需水平滚动</h3>
${INTERACTION_HTML}
<div class="scroll-container">
<table>
<tr>
  <th>列A</th><th>列B</th><th>列C</th><th>列D</th><th>列E</th>
  <th>列F</th><th>列G</th><th>列H</th><th>列I</th><th>列J</th>
</tr>
${Array.from({length: 20}, (_, i) => `<tr>
  <td>行${i+1}A</td><td>行${i+1}B</td><td>行${i+1}C</td><td>行${i+1}D</td><td>行${i+1}E</td>
  <td>行${i+1}F</td><td>行${i+1}G</td><td>行${i+1}H</td><td>行${i+1}I</td><td>行${i+1}J</td>
</tr>`).join('\n')}
</table>
</div>
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  directionalLockEnabled: boolean;
  scrollEnabled: boolean;
};

export default class HorizontalScrollWebView extends Component<Props, State> {
  state: State = {
    directionalLockEnabled: true,
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
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>directionalLock (iOS)</Text>
          <Switch
            value={this.state.directionalLockEnabled}
            onValueChange={v => this.setState({ directionalLockEnabled: v })}
          />
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 顶部 (垂直滑动)</Text>
          </View>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ html: WIDE_TABLE_HTML }}
              scrollEnabled={this.state.scrollEnabled}
              directionalLockEnabled={this.state.directionalLockEnabled}
              style={styles.webview}
            />
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 中间</Text>
          </View>
          <View style={styles.webviewWrapper}>
            <WebView
              source={{ html: WIDE_TABLE_HTML }}
              scrollEnabled={this.state.scrollEnabled}
              directionalLockEnabled={this.state.directionalLockEnabled}
              nestedScrollEnabled={true}
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
    backgroundColor: '#e0f2f1',
    borderBottomWidth: 1,
    borderBottomColor: '#80cbc4',
    flexWrap: 'wrap',
  },
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  separator: { fontSize: 14, color: '#ccc', marginHorizontal: 8 },
  scrollView: { flex: 1 },
  rnBlock: {
    padding: 14,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
  },
  rnText: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  webviewWrapper: {
    height: 280,
    borderWidth: 2,
    borderColor: '#00897b',
  },
  webview: { flex: 1 },
  rnItem: {
    padding: 12,
    margin: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
});
