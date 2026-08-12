/**
 * ============================================================
 * 嵌套滚动 Demo 6: WebView 嵌套在 FlatList 中
 * ============================================================
 *
 * 测试场景: WebView 作为 FlatList 的列表项，模拟信息流中嵌入 WebView 的场景
 *          例如: 社交媒体信息流中嵌入富文本/广告 WebView
 *
 * 如何测试:
 *   1. 在 FlatList 中上下滑动 → 预期: FlatList 正常滚动
 *   2. 在 WebView 区域上下滑动 → 预期: 根据 scrollEnabled 和 nestedScrollEnabled 决定行为
 *   3. 切换 scrollEnabled 开关 → 预期: WebView 内容是否可滚动
 *   4. 切换 nestedScrollEnabled 开关 (Android) → 预期: 影响滚动传递
 *   5. 快速滑动 FlatList → 预期: WebView 不应出现白屏或闪烁
 *   6. 滑动到 WebView 位置后停下来，再在 WebView 区域滑动 → 预期: 正常响应
 *
 * 验证要点:
 *   - FlatList 的虚拟化机制是否影响 WebView 渲染
 *   - WebView 在 FlatList 中滚动是否冲突
 *   - 快速滚动时 WebView 是否出现白屏/闪烁
 *   - scrollEnabled 和 nestedScrollEnabled 在 FlatList 中的效果
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, FlatList } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const generateHTML = (id: number, count: number) => `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 12px; font-family: sans-serif; }
.item { padding: 12px; margin: 4px 0; background: #fff9c4; border-radius: 6px; font-size: 13px; }
${INTERACTION_CSS}
</style></head>
<body>
<h4>WebView #${id}</h4>
${INTERACTION_HTML}
${Array.from({length: count}, (_, i) => `<div class="item">WebView ${id} - Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  scrollEnabled: boolean;
  nestedScrollEnabled: boolean;
};

type ListItem = {
  type: 'rn' | 'webview';
  id: number;
  title: string;
  itemCount: number;
};

const DATA: ListItem[] = [
  { type: 'rn', id: 0, title: 'RN Item - 列表顶部', itemCount: 0 },
  { type: 'webview', id: 1, title: 'WebView 1 (长内容)', itemCount: 15 },
  { type: 'rn', id: 1, title: 'RN Item - 分隔', itemCount: 0 },
  { type: 'webview', id: 2, title: 'WebView 2 (短内容)', itemCount: 3 },
  { type: 'rn', id: 2, title: 'RN Item - 分隔', itemCount: 0 },
  { type: 'webview', id: 3, title: 'WebView 3 (长内容)', itemCount: 15 },
  { type: 'rn', id: 3, title: 'RN Item - 分隔', itemCount: 0 },
  { type: 'webview', id: 4, title: 'WebView 4 (短内容)', itemCount: 2 },
  { type: 'rn', id: 4, title: 'RN Item - 列表底部', itemCount: 0 },
  ...Array.from({length: 10}, (_, i) => ({
    type: 'rn' as const,
    id: i + 5,
    title: `RN Item ${i + 1}`,
    itemCount: 0,
  })),
];

export default class WebViewInFlatList extends Component<Props, State> {
  state: State = {
    scrollEnabled: true,
    nestedScrollEnabled: false,
  };

  renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'rn') {
      return (
        <View style={styles.rnItem}>
          <Text style={styles.rnText}>{item.title}</Text>
        </View>
      );
    }
    return (
      <View style={styles.webviewSection}>
        <Text style={styles.webviewLabel}>{item.title}</Text>
        <View style={item.itemCount > 5 ? styles.webviewWrapperTall : styles.webviewWrapperShort}>
          <WebView
            source={{ html: generateHTML(item.id, item.itemCount) }}
            scrollEnabled={this.state.scrollEnabled}
            nestedScrollEnabled={this.state.nestedScrollEnabled}
            style={styles.webview}
          />
        </View>
      </View>
    );
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
        <FlatList
          data={DATA}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
        />
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
    backgroundColor: '#efebe9',
    borderBottomWidth: 1,
    borderBottomColor: '#bcaaa4',
    flexWrap: 'wrap',
  },
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  separator: { fontSize: 14, color: '#ccc', marginHorizontal: 8 },
  listContent: { paddingBottom: 20 },
  rnItem: {
    padding: 14,
    backgroundColor: '#c8e6c9',
    borderBottomWidth: 1,
    borderBottomColor: '#a5d6a7',
  },
  rnText: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  webviewSection: {
    marginVertical: 2,
  },
  webviewLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#795548',
    padding: 4,
    backgroundColor: '#efebe9',
  },
  webviewWrapperTall: {
    height: 250,
    borderWidth: 2,
    borderColor: '#795548',
  },
  webviewWrapperShort: {
    height: 120,
    borderWidth: 2,
    borderColor: '#795548',
  },
  webview: { flex: 1 },
});
