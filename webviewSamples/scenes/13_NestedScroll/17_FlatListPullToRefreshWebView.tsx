/**
 * ============================================================
 * 嵌套滚动 Demo 17: FlatList 下拉刷新 + WebView
 * ============================================================
 *
 * 测试场景: FlatList 设置下拉刷新，WebView 作为列表项，
 *          验证下拉刷新手势与 WebView 滚动的冲突
 *
 * 如何测试:
 *   1. 在 RN 列表项顶部下拉 → 预期: 触发下拉刷新指示器
 *   2. 在 WebView 区域下拉 → 预期: 观察是触发刷新还是 WebView 内部滚动
 *   3. WebView 内容未滚动到顶部时下拉 → 预期: WebView 内容向上滚动，不触发刷新
 *   4. 快速下拉再松手 → 预期: 刷新指示器出现并在1秒后消失
 *   5. 点击按钮/拖拽组件 → 预期: 手势关闭不影响页面内事件
 *
 * 验证要点:
 *   - FlatList 下拉刷新与 WebView 滚动的手势冲突
 *   - WebView scrollEnabled=false 时下拉刷新是否正常触发
 *   - 列表回收时 WebView 状态是否保持
 *   - 手势关闭是否影响 WebView 内按钮点击和拖拽
 */

import React, { useState } from 'react';
import { Text, FlatList, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const DATA = [
  { title: 'First Item' },
  { title: 'Second Item' },
  { title: 'Third Item' },
];

const WEBVIEW_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; }
.item { padding: 20px; margin: 8px 0; background: #e8eaf6; border-radius: 8px; font-size: 16px; }
${INTERACTION_CSS}
</style></head>
<body>
<h2>WebView 长内容</h2>
<p>在 WebView 区域下拉，验证是否触发外层下拉刷新</p>
${INTERACTION_HTML}
${Array.from({length: 30}, (_, i) => `<div class="item">WebView Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

export default function FlatListPullToRefreshWebView() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item, index }) => {
          if (index === 0) {
            return <Text style={styles.rnBlock}>RN 列表项 - 顶部占位</Text>;
          } else if (index === 1) {
            return (
              <View style={styles.webviewWrapper}>
                <WebView
                  source={{ html: WEBVIEW_HTML }}
                  style={styles.webview}
                  scrollEnabled={false}
                />
              </View>
            );
          } else {
            return <Text style={styles.rnBlock}>RN 列表项 - 底部占位</Text>;
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  rnBlock: {
    padding: 14,
    backgroundColor: '#c8e6c9',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
  },
  webviewWrapper: {
    height: 300,
    borderWidth: 2,
    borderColor: '#1565c0',
  },
  webview: { flex: 1 },
});
