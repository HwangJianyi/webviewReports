/**
 * ============================================================
 * 嵌套滚动 Demo 16: Tab 切换中的 WebView
 * ============================================================
 *
 * 测试场景: 多个 Tab 各含 WebView，切换 Tab 时验证滚动状态保持/丢失，
 *          以及切换后 WebView 是否正常渲染
 *
 * 如何测试:
 *   1. 在 Tab1 的 WebView 中滚动到中间位置 → 预期: WebView 内容正常滚动
 *   2. 切换到 Tab2 → 预期: Tab2 的 WebView 正常渲染
 *   3. 切换回 Tab1 → 预期: 观察 WebView 滚动位置是否保持（可能丢失）
 *   4. 在 Tab2 的 WebView 中滚动 → 预期: 正常滚动
 *   5. 快速在 Tab 之间切换 → 预期: WebView 不应白屏或闪烁
 *   6. 切换 scrollEnabled 开关 → 预期: 所有 Tab 的 WebView 同时受影响
 *   7. 切换 keepAlive 开关 → 预期: 开启后切换 Tab 时 WebView 不销毁重建
 *
 * 验证要点:
 *   - Tab 切换时 WebView 滚动状态是否保持
 *   - Tab 切换后 WebView 是否正常渲染
 *   - 快速切换时 WebView 是否白屏
 *   - keepAlive（不卸载）对 WebView 状态保持的效果
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const generateTabHTML = (tabNum: number, color: string) => `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; background: ${color}; }
.item { padding: 18px; margin: 6px 0; background: rgba(255,255,255,0.8); border-radius: 8px; font-size: 15px; }
${INTERACTION_CSS}
</style></head>
<body>
<h3>Tab ${tabNum} - WebView</h3>
<p>滚动到此位置后切换 Tab，再切回来查看滚动位置是否保持</p>
${INTERACTION_HTML}
${Array.from({length: 25}, (_, i) => `<div class="item">Tab ${tabNum} - Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

const TAB_COLORS = ['#e3f2fd', '#fce4ec', '#e8f5e9'];

type Props = {};
type State = {
  activeTab: number;
  scrollEnabled: boolean;
  keepAlive: boolean;
};

export default class TabSwitchWithWebView extends Component<Props, State> {
  state: State = {
    activeTab: 0,
    scrollEnabled: true,
    keepAlive: false,
  };

  renderTabContent = (tabNum: number) => {
    if (!this.state.keepAlive && this.state.activeTab !== tabNum) {
      return null;
    }
    const isActive = this.state.activeTab === tabNum;
    return (
      <View style={[styles.tabContent, !isActive && styles.tabContentHidden]}>
        <WebView
          source={{ html: generateTabHTML(tabNum + 1, TAB_COLORS[tabNum]) }}
          scrollEnabled={this.state.scrollEnabled}
          nestedScrollEnabled={true}
          style={styles.webview}
        />
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controlBar}>
          <Text style={styles.label}>scrollEnabled</Text>
          <Switch value={this.state.scrollEnabled} onValueChange={v => this.setState({ scrollEnabled: v })} />
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>keepAlive</Text>
          <Switch value={this.state.keepAlive} onValueChange={v => this.setState({ keepAlive: v })} />
        </View>
        <View style={styles.tabBar}>
          {[0, 1, 2].map((i) => (
            <TouchableOpacity
              key={i}
              style={[styles.tab, this.state.activeTab === i && styles.tabActive]}
              onPress={() => this.setState({ activeTab: i })}
            >
              <Text style={[styles.tabText, this.state.activeTab === i && styles.tabTextActive]}>
                Tab {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tabContainer}>
          {this.renderTabContent(0)}
          {this.renderTabContent(1)}
          {this.renderTabContent(2)}
        </View>
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
    backgroundColor: '#f1f8e9',
    borderBottomWidth: 1,
    borderBottomColor: '#aed581',
    flexWrap: 'wrap',
  },
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  separator: { fontSize: 14, color: '#ccc', marginHorizontal: 4 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#558b2f',
  },
  tabText: { fontSize: 12, color: '#666' },
  tabTextActive: { fontSize: 12, color: '#558b2f', fontWeight: 'bold' },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#558b2f',
  },
  tabContentHidden: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
    overflow: 'hidden',
  },
  webview: { flex: 1 },
});
