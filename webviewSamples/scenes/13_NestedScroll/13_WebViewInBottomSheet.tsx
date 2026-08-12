/**
 * ============================================================
 * 嵌套滚动 Demo 13: WebView 在 BottomSheet/Modal 中
 * ============================================================
 *
 * 测试场景: 可拖拽的底部弹窗内嵌 WebView，
 *          验证拖拽关闭手势与 WebView 滚动的冲突
 *
 * 如何测试:
 *   1. 点击 "打开 BottomSheet" 按钮 → 预期: 底部弹窗从底部弹出
 *   2. 在 WebView 区域上下滑动 → 预期: WebView 内容可滚动
 *   3. 在 WebView 区域向下拖拽（WebView 内容在顶部） → 预期: 观察是 WebView 滚动还是弹窗关闭
 *   4. 在 WebView 区域外向下拖拽 → 预期: 弹窗向下拖拽关闭
 *   5. 切换 scrollEnabled 开关 → 预期: 禁用后 WebView 不吞噬触摸，弹窗拖拽更顺畅
 *   6. WebView 内容滚动到底部后继续向下拖拽 → 预期: 观察弹窗是否关闭
 *   7. 点击 "关闭" 按钮 → 预期: 弹窗关闭
 *
 * 验证要点:
 *   - WebView 滚动与弹窗拖拽关闭的手势冲突
 *   - WebView 内容在顶部/底部时，拖拽行为的差异
 *   - scrollEnabled 对弹窗拖拽的影响
 *   - 弹窗的拖拽手势优先级
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, PanResponder, Dimensions } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;

const LONG_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; }
.item { padding: 18px; margin: 6px 0; background: #e8eaf6; border-radius: 8px; font-size: 15px; }
${INTERACTION_CSS}
</style></head>
<body>
<h3>BottomSheet 中的 WebView</h3>
<p>在 WebView 区域滑动，验证与弹窗拖拽的手势冲突</p>
${INTERACTION_HTML}
${Array.from({length: 25}, (_, i) => `<div class="item">WebView Item ${i + 1}</div>`).join('\n')}
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  visible: boolean;
  scrollEnabled: boolean;
  nestedScrollEnabled: boolean;
};

export default class WebViewInBottomSheet extends Component<Props, State> {
  panY = new Animated.Value(0);

  state: State = {
    visible: false,
    scrollEnabled: true,
    nestedScrollEnabled: false,
  };

  openSheet = () => {
    this.panY.setValue(0);
    this.setState({ visible: true });
  };

  closeSheet = () => {
    this.setState({ visible: false });
  };

  panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
    onPanResponderMove: Animated.event([null, { dy: this.panY }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        this.closeSheet();
      } else {
        Animated.spring(this.panY, { toValue: 0, useNativeDriver: false }).start();
      }
    },
  });

  render() {
    const sheetTranslateY = this.panY.interpolate({
      inputRange: [-1, 0, SHEET_HEIGHT],
      outputRange: [0, 0, SHEET_HEIGHT],
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
        <View style={styles.content}>
          <TouchableOpacity style={styles.openButton} onPress={this.openSheet}>
            <Text style={styles.openButtonText}>打开 BottomSheet</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>点击按钮打开底部弹窗，验证 WebView 滚动与弹窗拖拽的冲突</Text>
        </View>
        <Modal visible={this.state.visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
              {...this.panResponder.panHandlers}
            >
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>BottomSheet</Text>
                <TouchableOpacity onPress={this.closeSheet} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>关闭</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.webviewWrapper}>
                <WebView
                  source={{ html: LONG_HTML }}
                  scrollEnabled={this.state.scrollEnabled}
                  nestedScrollEnabled={this.state.nestedScrollEnabled}
                  style={styles.webview}
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
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
    backgroundColor: '#ede7f6',
    borderBottomWidth: 1,
    borderBottomColor: '#b39ddb',
    flexWrap: 'wrap',
  },
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  separator: { fontSize: 14, color: '#ccc', marginHorizontal: 4 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  openButton: {
    backgroundColor: '#5e35b1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  openButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  hint: { fontSize: 12, color: '#666', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sheetTitle: { fontSize: 14, fontWeight: 'bold' },
  closeButton: { padding: 8 },
  closeButtonText: { fontSize: 14, color: '#5e35b1' },
  webviewWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b39ddb',
  },
  webview: { flex: 1 },
});
