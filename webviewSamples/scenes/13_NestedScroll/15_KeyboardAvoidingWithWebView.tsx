/**
 * ============================================================
 * 嵌套滚动 Demo 15: KeyboardAvoidingView + WebView
 * ============================================================
 *
 * 测试场景: WebView 内有 input 输入框，键盘弹起时布局偏移，
 *          验证滚动位置是否正确，WebView 是否被正确推高
 *
 * 如何测试:
 *   1. 点击 WebView 内的 input 输入框 → 预期: 键盘弹起，输入框可见不被遮挡
 *   2. 键盘弹起后上下滑动 → 预期: WebView 内容可正常滚动
 *   3. 键盘弹起后在 WebView 区域外滑动 → 预期: 外层 ScrollView 可滚动
 *   4. 切换 scrollEnabled 开关 → 预期: 禁用后 WebView 不吞噬触摸
 *   5. 输入内容后点击完成/收起键盘 → 预期: 布局恢复，滚动位置不跳动
 *   6. 切换 behavior 开关 (iOS) → 预期: padding/height/position 行为差异
 *
 * 验证要点:
 *   - 键盘弹起时 WebView 输入框是否被遮挡
 *   - 键盘弹起后 WebView 滚动是否正常
 *   - 键盘收起后滚动位置是否跳动
 *   - KeyboardAvoidingView behavior 的差异
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import WebView from 'react-native-webview';
import { INTERACTION_CSS, INTERACTION_HTML, INTERACTION_JS } from './interactionTestHtml';

const FORM_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>
body { margin: 0; padding: 16px; font-family: sans-serif; }
.form-group { margin-bottom: 16px; }
label { display: block; font-size: 14px; font-weight: bold; margin-bottom: 6px; }
input, textarea { width: 100%; padding: 12px; font-size: 16px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
textarea { height: 80px; }
.spacer { height: 300px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #999; }
${INTERACTION_CSS}
</style></head>
<body>
<h3>表单 WebView</h3>
${INTERACTION_HTML}
<div class="form-group">
  <label>姓名</label>
  <input type="text" placeholder="点击输入姓名" />
</div>
<div class="spacer">滚动区域 - 上下有输入框</div>
<div class="form-group">
  <label>邮箱</label>
  <input type="email" placeholder="点击输入邮箱" />
</div>
<div class="spacer">滚动区域 - 上下有输入框</div>
<div class="form-group">
  <label>备注</label>
  <textarea placeholder="点击输入备注"></textarea>
</div>
<div class="spacer">滚动区域 - 上下有输入框</div>
<div class="form-group">
  <label>手机号</label>
  <input type="tel" placeholder="点击输入手机号" />
</div>
${INTERACTION_JS}
</body>
</html>
`;

type Props = {};
type State = {
  scrollEnabled: boolean;
  behavior: 'padding' | 'height' | 'position';
};

export default class KeyboardAvoidingWithWebView extends Component<Props, State> {
  state: State = {
    scrollEnabled: true,
    behavior: 'padding',
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.controlBar}>
          <Text style={styles.label}>scrollEnabled</Text>
          <Switch value={this.state.scrollEnabled} onValueChange={v => this.setState({ scrollEnabled: v })} />
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>behavior</Text>
          <Switch
            value={this.state.behavior === 'position'}
            onValueChange={v => this.setState({ behavior: v ? 'position' : 'padding' })}
          />
          <Text style={styles.behaviorValue}>{this.state.behavior}</Text>
        </View>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={this.state.behavior}
          enabled
        >
          <ScrollView style={styles.scrollView}>
            <View style={styles.rnBlock}>
              <Text style={styles.rnText}>RN 区域 - 顶部</Text>
            </View>
            <View style={styles.webviewWrapper}>
              <WebView
                source={{ html: FORM_HTML }}
                scrollEnabled={this.state.scrollEnabled}
                nestedScrollEnabled={true}
                style={styles.webview}
              />
            </View>
            <View style={styles.rnBlock}>
              <Text style={styles.rnText}>RN 区域 - 底部</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: '#fbe9e7',
    borderBottomWidth: 1,
    borderBottomColor: '#ffab91',
    flexWrap: 'wrap',
  },
  label: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  separator: { fontSize: 14, color: '#ccc', marginHorizontal: 4 },
  behaviorValue: { fontSize: 11, color: '#bf360c', marginLeft: 4 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  rnBlock: {
    padding: 14,
    backgroundColor: '#c8e6c9',
    alignItems: 'center',
  },
  rnText: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  webviewWrapper: {
    height: 500,
    borderWidth: 2,
    borderColor: '#d84315',
  },
  webview: { flex: 1 },
});
