/**
 * ============================================================
 * 嵌套滚动 Demo 11: WebView 在 ViewPager 中
 * ============================================================
 *
 * 测试场景: WebView 在水平分页容器中（模拟 ViewPager/TabView），
 *          验证水平翻页手势与 WebView 垂直/水平滚动的冲突
 *
 * 上半部分: 垂直内容 WebView + ViewPager
 *   1. 在非 WebView 区域左右滑动 → 预期: 切换到上一页/下一页
 *   2. 在 WebView 区域垂直滑动 → 预期: WebView 内容垂直滚动
 *   3. 在 WebView 区域水平滑动 → 预期: 观察是 WebView 水平滚动还是翻页
 *   4. 在 WebView 区域对角线滑动 → 预期: 观察手势优先级
 *   5. 切换 scrollEnabled 开关 → 预期: 禁用后 WebView 不吞噬触摸，翻页更顺畅
 *   6. 快速左右翻页 → 预期: WebView 不应白屏或闪烁
 *
 * 下半部分: 宽内容 WebView + ViewPager (水平滚动到边缘后切换 tab)
 *   1. 在 WebView 区域水平滑动 → 预期: WebView 内部宽表格水平滚动
 *   2. 滚动到右边缘后继续向右滑 → 预期: 观察是否能切换到下一页
 *   3. 滚动到左边缘后继续向左滑 → 预期: 观察是否能切换到上一页
 *   4. 切换 scrollEnabled 开关 → 预期: 禁用后 WebView 不吞噬水平触摸，翻页更顺畅
 *   5. 切换 nestedScrollEnabled 开关 → 预期: 影响滚动到边缘后的手势传递
 *
 * 验证要点:
 *   - 水平翻页手势与 WebView 滚动的手势竞争
 *   - scrollEnabled 对翻页手势的影响
 *   - 翻页时 WebView 的渲染状态
 *   - 宽内容 WebView 水平滚动到边缘后，手势是否能传递给外层 ViewPager
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const generatePageHTML = (pageNum: number, color: string) => `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; background: ${color}; }
.item { padding: 16px; margin: 6px 0; background: rgba(255,255,255,0.7); border-radius: 8px; font-size: 14px; }
${INTERACTION_CSS}
</style></head>
<body>
<h3>Page ${pageNum} - WebView</h3>
${INTERACTION_HTML}
${Array.from({length: 20}, (_, i) => `<div class="item">Page ${pageNum} - Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

const generateWidePageHTML = (pageNum: number, color: string) => `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 12px; font-family: sans-serif; background: ${color}; }
.scroll-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { border-collapse: collapse; width: 1200px; }
th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; white-space: nowrap; }
th { background: #1976d2; color: #fff; }
tr:nth-child(even) { background: #f5f5f5; }
.hint { font-size: 13px; color: #e65100; font-weight: bold; margin: 8px 0; }
${INTERACTION_CSS}
</style></head>
<body>
<h3>Page ${pageNum} - 宽表格 WebView</h3>
<p class="hint">水平滚动表格到边缘后继续滑动，验证是否能切换 Tab</p>
${INTERACTION_HTML}
<div class="scroll-container">
<table>
<tr>
  <th>列A</th><th>列B</th><th>列C</th><th>列D</th><th>列E</th>
  <th>列F</th><th>列G</th><th>列H</th><th>列I</th><th>列J</th>
</tr>
${Array.from({length: 15}, (_, i) => `<tr>
  <td>P${pageNum}行${i+1}A</td><td>P${pageNum}行${i+1}B</td><td>P${pageNum}行${i+1}C</td><td>P${pageNum}行${i+1}D</td><td>P${pageNum}行${i+1}E</td>
  <td>P${pageNum}行${i+1}F</td><td>P${pageNum}行${i+1}G</td><td>P${pageNum}行${i+1}H</td><td>P${pageNum}行${i+1}I</td><td>P${pageNum}行${i+1}J</td>
</tr>`).join('\n')}
</table>
</div>
${INTERACTION_JS}
</body>
</html>
`;

const PAGE_COLORS = ['#e3f2fd', '#fce4ec', '#e8f5e9', '#fff3e0'];
const WIDE_PAGE_COLORS = ['#fff3e0', '#e8f5e9', '#fce4ec'];

type Props = {};
type State = {
  currentPage: number;
  currentWidePage: number;
  scrollEnabled: boolean;
  nestedScrollEnabled: boolean;
};

export default class WebViewInViewPager extends Component<Props, State> {
  scrollViewRef = React.createRef<ScrollView>();
  wideScrollViewRef = React.createRef<ScrollView>();

  state: State = {
    currentPage: 0,
    currentWidePage: 0,
    scrollEnabled: true,
    nestedScrollEnabled: false,
  };

  totalPages = 4;
  wideTotalPages = 3;

  scrollToPage = (page: number) => {
    const clamped = Math.max(0, Math.min(page, this.totalPages - 1));
    this.setState({ currentPage: clamped });
    this.scrollViewRef.current?.scrollTo({ x: clamped * SCREEN_WIDTH, animated: true });
  };

  handleScroll = (e: any) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (page !== this.state.currentPage) {
      this.setState({ currentPage: page });
    }
  };

  scrollToWidePage = (page: number) => {
    const clamped = Math.max(0, Math.min(page, this.wideTotalPages - 1));
    this.setState({ currentWidePage: clamped });
    this.wideScrollViewRef.current?.scrollTo({ x: clamped * SCREEN_WIDTH, animated: true });
  };

  handleWideScroll = (e: any) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (page !== this.state.currentWidePage) {
      this.setState({ currentWidePage: page });
    }
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>垂直内容 ViewPager</Text>
            <Text style={styles.sectionInfo}>Page: {this.state.currentPage + 1}/{this.totalPages}</Text>
          </View>
          <View style={styles.tabBar}>
            {Array.from({length: this.totalPages}, (_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.tab, this.state.currentPage === i && styles.tabActive]}
                onPress={() => this.scrollToPage(i)}
              >
                <Text style={[styles.tabText, this.state.currentPage === i && styles.tabTextActive]}>
                  P{i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView
            ref={this.scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={this.handleScroll}
            scrollEventThrottle={16}
            style={styles.pager}
          >
            {Array.from({length: this.totalPages}, (_, i) => (
              <View key={i} style={styles.page}>
                <View style={styles.rnBlock}>
                  <Text style={styles.rnText}>RN 区域 - Page {i + 1} 顶部</Text>
                </View>
                <View style={styles.webviewWrapper}>
                  <WebView
                    source={{ html: generatePageHTML(i + 1, PAGE_COLORS[i]) }}
                    scrollEnabled={this.state.scrollEnabled}
                    nestedScrollEnabled={true}
                    style={styles.webview}
                  />
                </View>
                <View style={styles.rnBlock}>
                  <Text style={styles.rnText}>RN 区域 - Page {i + 1} 底部</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>宽内容 ViewPager (水平滚动到边缘切Tab)</Text>
            <Text style={styles.sectionInfo}>Page: {this.state.currentWidePage + 1}/{this.wideTotalPages}</Text>
          </View>
          <View style={styles.tabBar}>
            {Array.from({length: this.wideTotalPages}, (_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.tab, this.state.currentWidePage === i && styles.wideTabActive]}
                onPress={() => this.scrollToWidePage(i)}
              >
                <Text style={[styles.tabText, this.state.currentWidePage === i && styles.wideTabTextActive]}>
                  W{i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView
            ref={this.wideScrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={this.handleWideScroll}
            scrollEventThrottle={16}
            style={styles.pager}
          >
            {Array.from({length: this.wideTotalPages}, (_, i) => (
              <View key={i} style={styles.page}>
                <View style={styles.rnBlock}>
                  <Text style={styles.rnText}>RN 区域 - Wide Page {i + 1} 顶部</Text>
                </View>
                <View style={styles.webviewWrapper}>
                  <WebView
                    source={{ html: generateWidePageHTML(i + 1, WIDE_PAGE_COLORS[i]) }}
                    scrollEnabled={this.state.scrollEnabled}
                    nestedScrollEnabled={this.state.nestedScrollEnabled}
                    style={styles.webview}
                  />
                </View>
                <View style={styles.rnBlock}>
                  <Text style={styles.rnText}>RN 区域 - Wide Page {i + 1} 底部</Text>
                </View>
              </View>
            ))}
          </ScrollView>
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
    backgroundColor: '#e8eaf6',
    borderBottomWidth: 1,
    borderBottomColor: '#9fa8da',
    flexWrap: 'wrap',
  },
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  separator: { fontSize: 14, color: '#ccc', marginHorizontal: 4 },
  section: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#333' },
  sectionInfo: { fontSize: 10, color: '#666' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3f51b5',
  },
  wideTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#e65100',
  },
  tabText: { fontSize: 11, color: '#666' },
  tabTextActive: { fontSize: 11, color: '#3f51b5', fontWeight: 'bold' },
  wideTabTextActive: { fontSize: 11, color: '#e65100', fontWeight: 'bold' },
  pager: { flex: 1 },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  rnBlock: {
    padding: 8,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
  },
  rnText: { fontSize: 11, fontWeight: 'bold', color: '#2e7d32' },
  webviewWrapper: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#3f51b5',
  },
  divider: {
    height: 2,
    backgroundColor: '#e65100',
  },
  webview: { flex: 1 },
});
