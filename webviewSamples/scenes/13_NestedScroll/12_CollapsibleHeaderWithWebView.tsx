/**
 * ============================================================
 * 嵌套滚动 Demo 12: CollapsibleHeader + WebView
 * ============================================================
 *
 * 测试场景: 可折叠的头部区域（滚动时逐渐收起），WebView 在下方，
 *          验证折叠动画与 WebView 滚动的协调
 *
 * 如何测试:
 *   1. 向上滚动页面 → 预期: 头部区域逐渐收起，WebView 区域跟随上移
 *   2. 向下滚动页面 → 预期: 头部区域逐渐展开，WebView 区域跟随下移
 *   3. 在 WebView 区域上下滑动 → 预期: WebView 内容可滚动，头部折叠不受影响
 *   4. 切换 scrollEnabled 开关 → 预期: WebView 禁止滚动时，外层滑动可折叠头部
 *   5. 切换 nestedScrollEnabled (Android) → 预期: 影响折叠动画与 WebView 滚动的协调
 *   6. 快速上下滑动 → 预期: 头部折叠/展开动画流畅，不卡顿
 *
 * 验证要点:
 *   - 头部折叠动画与 WebView 滚动的协调
 *   - scrollEnabled=false 时折叠头部是否正常
 *   - nestedScrollEnabled 对折叠+WebView 滚动的影响
 *   - 折叠动画的流畅性
 */

import React, { Component } from 'react';
import { View, Text, Switch, Animated, StyleSheet, ScrollView, Dimensions } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const LONG_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; }
.item { padding: 18px; margin: 6px 0; background: #e0f7fa; border-radius: 8px; font-size: 15px; }
${INTERACTION_CSS}
</style></head>
<body>
<h2>WebView 长内容</h2>
<p>滚动页面使头部折叠，然后在 WebView 区域滑动</p>
${INTERACTION_HTML}
${Array.from({length: 30}, (_, i) => `<div class="item">WebView Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  scrollEnabled: boolean;
  nestedScrollEnabled: boolean;
};

export default class CollapsibleHeaderWithWebView extends Component<Props, State> {
  scrollY = new Animated.Value(0);

  state: State = {
    scrollEnabled: true,
    nestedScrollEnabled: false,
  };

  render() {
    const headerHeight = this.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      extrapolate: 'clamp',
    });

    const headerOpacity = this.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [1, 0.5, 0.3],
      extrapolate: 'clamp',
    });

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
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          <Animated.View style={[styles.collapsibleHeader, { height: headerHeight, opacity: headerOpacity }]}>
            <Text style={styles.headerTitle}>可折叠头部</Text>
            <Text style={styles.headerSubtitle}>向上滚动时头部会折叠</Text>
          </Animated.View>
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
    backgroundColor: '#e0f7fa',
    borderBottomWidth: 1,
    borderBottomColor: '#80deea',
    flexWrap: 'wrap',
  },
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  separator: { fontSize: 14, color: '#ccc', marginHorizontal: 4 },
  scrollView: { flex: 1 },
  collapsibleHeader: {
    backgroundColor: '#00838f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#b2ebf2',
    marginTop: 4,
  },
  webviewWrapper: {
    height: 350,
    borderWidth: 2,
    borderColor: '#00838f',
  },
  webview: { flex: 1 },
  rnBlock: {
    padding: 14,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
  },
  rnText: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  rnItem: {
    padding: 12,
    margin: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
});
