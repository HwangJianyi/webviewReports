/**
 * ============================================================
 * 嵌套滚动 Demo 10: 动态高度 WebView 在 ScrollView 中
 * ============================================================
 *
 * 测试场景: WebView 高度根据内容自动撑开（常见于文章详情页），
 *          外层 ScrollView 包裹动态高度 WebView，验证高度变化时滚动位置是否跳动
 *
 * 如何测试:
 *   1. 页面加载后观察 WebView 高度 → 预期: WebView 高度根据内容自动撑开
 *   2. 点击 "增加内容" 按钮 → 预期: WebView 高度增加，外层 ScrollView 不跳动
 *   3. 点击 "减少内容" 按钮 → 预期: WebView 高度减少，滚动位置不异常
 *   4. 在 WebView 区域上下滑动 → 预期: 外层 ScrollView 正常滚动
 *   5. 切换 scrollEnabled 开关 → 预期: WebView 内容不可滚动时，外层可滚动
 *   6. 滚动到页面中间位置后，增减内容 → 预期: 滚动位置保持合理，不跳到顶部/底部
 *
 * 验证要点:
 *   - WebView 动态高度变化时外层 ScrollView 是否跳动
 *   - onMessage 传递高度信息的实时性
 *   - 滚动位置在高度变化时的稳定性
 *   - scrollEnabled=false 时 WebView 是否正确撑开高度
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Button } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

type Props = {};
type State = {
  scrollEnabled: boolean;
  contentCount: number;
  webviewHeight: number;
};

const generateDynamicHTML = (count: number) => `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; }
.item { padding: 18px; margin: 6px 0; background: #f3e5f5; border-radius: 8px; font-size: 15px; }
${INTERACTION_CSS}
</style></head>
<body>
<h3>动态内容 WebView (当前 ${count} 项)</h3>
${INTERACTION_HTML}
${Array.from({length: count}, (_, i) => `<div class="item">动态内容 Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
<script>
  function sendHeight() {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', height: document.body.scrollHeight }));
  }
  window.addEventListener('load', sendHeight);
  new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true });
</script>
</body>
</html>
`;

export default class DynamicHeightWebView extends Component<Props, State> {
  webViewRef = React.createRef<WebView>();

  state: State = {
    scrollEnabled: false,
    contentCount: 5,
    webviewHeight: 200,
  };

  handleAddContent = () => {
    this.setState({ contentCount: Math.min(this.state.contentCount + 5, 50) });
  };

  handleRemoveContent = () => {
    this.setState({ contentCount: Math.max(this.state.contentCount - 5, 1) });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controlBar}>
          <Text style={styles.label}>scrollEnabled</Text>
          <Switch value={this.state.scrollEnabled} onValueChange={v => this.setState({ scrollEnabled: v })} />
          <Text style={styles.heightInfo}>WebView高度: {this.state.webviewHeight}</Text>
        </View>
        <View style={styles.buttonBar}>
          <Button title="增加内容" onPress={this.handleAddContent} />
          <Button title="减少内容" onPress={this.handleRemoveContent} />
          <Text style={styles.countText}>当前: {this.state.contentCount} 项</Text>
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 顶部</Text>
          </View>
          <View style={[styles.webviewWrapper, { height: this.state.webviewHeight }]}>
            <WebView
              ref={this.webViewRef}
              source={{ html: generateDynamicHTML(this.state.contentCount) }}
              scrollEnabled={this.state.scrollEnabled}
              nestedScrollEnabled={true}
              onMessage={(e) => {
                try {
                  const data = JSON.parse(e.nativeEvent.data);
                  if (data.type === 'height') {
                    this.setState({ webviewHeight: Math.max(data.height, 100) });
                  }
                } catch {}
              }}
              style={styles.webview}
            />
          </View>
          <View style={styles.rnBlock}>
            <Text style={styles.rnText}>RN 区域 - 底部</Text>
          </View>
          {Array.from({length: 8}, (_, i) => (
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
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 8 },
  heightInfo: { fontSize: 11, color: '#6a1b9a', marginLeft: 12 },
  buttonBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  countText: { fontSize: 11, color: '#6a1b9a', marginLeft: 8 },
  scrollView: { flex: 1 },
  rnBlock: {
    padding: 14,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
  },
  rnText: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  webviewWrapper: {
    borderWidth: 2,
    borderColor: '#7b1fa2',
  },
  webview: { flex: 1 },
  rnItem: {
    padding: 12,
    margin: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
});
