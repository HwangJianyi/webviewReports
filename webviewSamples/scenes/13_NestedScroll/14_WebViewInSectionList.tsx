/**
 * ============================================================
 * 嵌套滚动 Demo 14: WebView 嵌套在 SectionList 中
 * ============================================================
 *
 * 测试场景: WebView 作为 SectionList 的列表项，SectionList 有分组头和虚拟化
 *          与 FlatList 行为不同，需单独验证
 *
 * 如何测试:
 *   1. 在 SectionList 中上下滑动 → 预期: SectionList 正常滚动
 *   2. 在 WebView 区域上下滑动 → 预期: WebView 内容可滚动
 *   3. 切换 scrollEnabled 开关 → 预期: WebView 内容是否可滚动
 *   4. 切换 nestedScrollEnabled 开关 (Android) → 预期: 影响滚动传递
 *   5. 滚动到分组头时观察 → 预期: 分组头正常显示
 *   6. 快速滑动 → 预期: WebView 不应白屏或闪烁
 *   7. 切换到不同分组 → 预期: WebView 正常渲染
 *
 * 验证要点:
 *   - SectionList 的分组头+虚拟化是否影响 WebView 渲染
 *   - WebView 在 SectionList 中的滚动行为
 *   - 快速滚动时 WebView 是否白屏
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, SectionList } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const generateHTML = (id: number, count: number) => `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 12px; font-family: sans-serif; }
.item { padding: 12px; margin: 4px 0; background: #e0f2f1; border-radius: 6px; font-size: 13px; }
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

type SectionData = {
  title: string;
  data: { type: 'rn' | 'webview'; id: number; text: string; itemCount: number }[];
};

const SECTIONS: SectionData[] = [
  {
    title: 'Section A - WebView 长内容',
    data: [
      { type: 'rn', id: 0, text: 'RN Item - A1', itemCount: 0 },
      { type: 'webview', id: 1, text: 'WebView A1 (长内容)', itemCount: 15 },
      { type: 'rn', id: 1, text: 'RN Item - A2', itemCount: 0 },
    ],
  },
  {
    title: 'Section B - WebView 短内容',
    data: [
      { type: 'webview', id: 2, text: 'WebView B1 (短内容)', itemCount: 3 },
      { type: 'rn', id: 2, text: 'RN Item - B1', itemCount: 0 },
      { type: 'webview', id: 3, text: 'WebView B2 (短内容)', itemCount: 2 },
    ],
  },
  {
    title: 'Section C - 混合内容',
    data: [
      { type: 'rn', id: 3, text: 'RN Item - C1', itemCount: 0 },
      { type: 'webview', id: 4, text: 'WebView C1 (长内容)', itemCount: 12 },
      { type: 'rn', id: 4, text: 'RN Item - C2', itemCount: 0 },
      { type: 'rn', id: 5, text: 'RN Item - C3', itemCount: 0 },
    ],
  },
  {
    title: 'Section D - 纯 RN',
    data: Array.from({length: 5}, (_, i) => ({
      type: 'rn' as const,
      id: i + 6,
      text: `RN Item - D${i + 1}`,
      itemCount: 0,
    })),
  },
];

export default class WebViewInSectionList extends Component<Props, State> {
  state: State = {
    scrollEnabled: true,
    nestedScrollEnabled: false,
  };

  renderItem = ({ item }: { item: SectionData['data'][0] }) => {
    if (item.type === 'rn') {
      return (
        <View style={styles.rnItem}>
          <Text style={styles.rnText}>{item.text}</Text>
        </View>
      );
    }
    return (
      <View style={styles.webviewSection}>
        <Text style={styles.webviewLabel}>{item.text}</Text>
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

  renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

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
        <SectionList
          sections={SECTIONS}
          renderItem={this.renderItem}
          renderSectionHeader={this.renderSectionHeader}
          keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled
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
    backgroundColor: '#e0f2f1',
    borderBottomWidth: 1,
    borderBottomColor: '#80cbc4',
    flexWrap: 'wrap',
  },
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  separator: { fontSize: 14, color: '#ccc', marginHorizontal: 4 },
  listContent: { paddingBottom: 20 },
  sectionHeader: {
    padding: 12,
    backgroundColor: '#00695c',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
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
    color: '#00695c',
    padding: 4,
    backgroundColor: '#e0f2f1',
  },
  webviewWrapperTall: {
    height: 250,
    borderWidth: 2,
    borderColor: '#00695c',
  },
  webviewWrapperShort: {
    height: 120,
    borderWidth: 2,
    borderColor: '#00695c',
  },
  webview: { flex: 1 },
});
