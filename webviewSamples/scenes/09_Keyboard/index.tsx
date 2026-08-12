/**
 * ============================================================
 * 场景09: 键盘与输入
 * ============================================================
 *
 * 测试点1: keyboardDisplayRequiresUserAction = true (iOS 默认)
 *   操作: 开关保持打开，页面加载后观察 autofocus 输入框
 *   预期: 即使 HTML 设置了 autofocus，键盘不会自动弹出，必须用户手动点击
 *
 * 测试点2: keyboardDisplayRequiresUserAction = false
 *   操作: 关闭该开关，重新加载页面
 *   预期: autofocus 输入框自动获得焦点并弹出键盘
 *
 * 测试点3: JS 程序化 focus
 *   操作: 点击页面中的 "Focus input via JS" 按钮
 *   预期: keyboardDisplayRequiresUserAction=false 时键盘弹出；
 *         true 时键盘不弹出
 *
 * 测试点4: hideKeyboardAccessoryView (iOS)
 *   操作: 开启该开关，点击输入框弹出键盘
 *   预期: 键盘上方的辅助栏（< > 和 Done 按钮）被隐藏
 *
 * 测试点5: textInteractionEnabled = true (iOS 默认)
 *   操作: 开关保持打开，尝试选择 WebView 中的文本
 *   预期: 可以正常选择文本，出现选择手柄和复制菜单
 *
 * 测试点6: textInteractionEnabled = false
 *   操作: 关闭该开关
 *   预期: 无法选择文本，长按不会出现文本选择手柄
 *
 * 测试点7: saveFormDataDisabled (Android)
 *   操作: 关闭该开关（默认 false，即保存表单数据）
 *   预期: false 时输入表单后系统会记住并自动填充；true 时不保存
 *
 * 测试点8: pullToRefreshEnabled (iOS)
 *   操作: 开启该开关，在 WebView 中下拉
 *   预期: 出现下拉刷新指示器，释放后页面重新加载
 *
 * 测试点9: refreshControlLightMode (iOS)
 *   操作: 开启 pullToRefreshEnabled 后，再开启 refreshControlLightMode
 *   预期: 刷新指示器颜色为白色模式（适合深色背景）
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  keyboardDisplayRequiresUserAction: boolean;
  hideKeyboardAccessoryView: boolean;
  textInteractionEnabled: boolean;
  saveFormDataDisabled: boolean;
  pullToRefreshEnabled: boolean;
  refreshControlLightMode: boolean;
};

export default class KeyboardScene extends Component<Props, State> {
  state: State = {
    keyboardDisplayRequiresUserAction: true,
    hideKeyboardAccessoryView: false,
    textInteractionEnabled: true,
    saveFormDataDisabled: false,
    pullToRefreshEnabled: false,
    refreshControlLightMode: false,
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Keyboard Controls</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>keyboardDisplayRequiresUserAction (iOS)</Text>
            <Switch value={this.state.keyboardDisplayRequiresUserAction} onValueChange={v => this.setState({ keyboardDisplayRequiresUserAction: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>hideKeyboardAccessoryView (iOS)</Text>
            <Switch value={this.state.hideKeyboardAccessoryView} onValueChange={v => this.setState({ hideKeyboardAccessoryView: v })} />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Text & Form</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>textInteractionEnabled (iOS)</Text>
            <Switch value={this.state.textInteractionEnabled} onValueChange={v => this.setState({ textInteractionEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>saveFormDataDisabled (Android)</Text>
            <Switch value={this.state.saveFormDataDisabled} onValueChange={v => this.setState({ saveFormDataDisabled: v })} />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Pull to Refresh</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>pullToRefreshEnabled (iOS)</Text>
            <Switch value={this.state.pullToRefreshEnabled} onValueChange={v => this.setState({ pullToRefreshEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>refreshControlLightMode (iOS)</Text>
            <Switch value={this.state.refreshControlLightMode} onValueChange={v => this.setState({ refreshControlLightMode: v })} />
          </View>
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: `${BASE_URL}/keyboard` }}
            keyboardDisplayRequiresUserAction={this.state.keyboardDisplayRequiresUserAction}
            hideKeyboardAccessoryView={this.state.hideKeyboardAccessoryView}
            textInteractionEnabled={this.state.textInteractionEnabled}
            saveFormDataDisabled={this.state.saveFormDataDisabled}
            pullToRefreshEnabled={this.state.pullToRefreshEnabled}
            refreshControlLightMode={this.state.refreshControlLightMode}
          />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  switchGroup: { padding: 8, backgroundColor: '#f0f0f0', marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  switchLabel: { fontSize: 11, flex: 1 },
  webviewContainer: { height: 400, borderWidth: 1, borderColor: '#ccc' },
});
