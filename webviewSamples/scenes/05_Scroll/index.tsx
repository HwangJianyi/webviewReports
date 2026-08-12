/**
 * ============================================================
 * 场景05: 滚动与缩放
 * ============================================================
 *
 * 测试点1: scrollEnabled = true/false
 *   操作: 切换 scrollEnabled 开关
 *   预期: true 时页面可正常滚动；false 时页面完全无法滚动
 *
 * 测试点2: onScroll 事件
 *   操作: 在 WebView 中上下滚动
 *   预期: 底部 "Scroll:" 文本实时更新 contentOffset 坐标值
 *
 * 测试点3: bounces (iOS)
 *   操作: 切换 bounces 开关，在页面顶部/底部继续下拉
 *   预期: true 时有弹性回弹效果；false 时到达边界立即停止
 *
 * 测试点4: showsHorizontalScrollIndicator / showsVerticalScrollIndicator
 *   操作: 分别关闭两个开关
 *   预期: 关闭后滚动时不再显示对应方向的滚动条指示器
 *
 * 测试点5: pagingEnabled (iOS)
 *   操作: 开启 pagingEnabled 开关，滚动页面
 *   预期: 滚动会自动吸附到页面边界倍数位置，类似翻页效果
 *
 * 测试点6: setBuiltInZoomControls (Android)
 *   操作: 切换 setBuiltInZoomControls 开关
 *   预期: true 时可用双指缩放；false 时禁止缩放手势
 *
 * 测试点7: setDisplayZoomControls (Android)
 *   操作: 在 setBuiltInZoomControls=true 时，开启 setDisplayZoomControls
 *   预期: 屏幕上显示 +/- 缩放按钮控件
 *
 * 测试点8: nestedScrollEnabled (Android)
 *   操作: 当 WebView 在 ScrollView 内部时，切换此开关
 *   预期: true 时 WebView 内部滚动不影响外层 ScrollView；false 时滚动冲突
 *
 * 测试点9: overScrollMode (Android)
 *   操作: 切换 overScrollMode 在 always/never 之间
 *   预期: always 时可过度滚动；never 时到达边界立即停止
 *
 * 测试点10: decelerationRate
 *   操作: 切换 decelerationRate 在 normal/fast 之间
 *   预期: fast (0.99) 减速更快，松手后滑动距离更短；normal (0.998) 滑动更远
 *
 * 测试点11: directionalLockEnabled (iOS)
 *   操作: 开启后尝试对角线滚动
 *   预期: true 时锁定为单方向滚动；false 时可同时水平+垂直滚动
 *
 * 测试点12: scalesPageToFit (Android)
 *   操作: 观察 WebView 初始加载
 *   预期: true 时页面自动缩放适配 WebView 宽度；false 时以原始尺寸显示
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  scrollEnabled: boolean;
  bounces: boolean;
  showHorizontalIndicator: boolean;
  showVerticalIndicator: boolean;
  pagingEnabled: boolean;
  setBuiltInZoomControls: boolean;
  setDisplayZoomControls: boolean;
  nestedScrollEnabled: boolean;
  overScrollMode: 'always' | 'content' | 'never';
  decelerationRate: 'normal' | 'fast';
  scrollEvent: string;
  directionalLockEnabled: boolean;
};

export default class ScrollScene extends Component<Props, State> {
  state: State = {
    scrollEnabled: true,
    bounces: true,
    showHorizontalIndicator: true,
    showVerticalIndicator: true,
    pagingEnabled: false,
    setBuiltInZoomControls: true,
    setDisplayZoomControls: false,
    nestedScrollEnabled: false,
    overScrollMode: 'always',
    decelerationRate: 'normal',
    scrollEvent: '',
    directionalLockEnabled: true,
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Scroll & Zoom Controls</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>scrollEnabled</Text>
            <Switch value={this.state.scrollEnabled} onValueChange={v => this.setState({ scrollEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>bounces (iOS)</Text>
            <Switch value={this.state.bounces} onValueChange={v => this.setState({ bounces: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>showsHorizontalScrollIndicator</Text>
            <Switch value={this.state.showHorizontalIndicator} onValueChange={v => this.setState({ showHorizontalIndicator: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>showsVerticalScrollIndicator</Text>
            <Switch value={this.state.showVerticalIndicator} onValueChange={v => this.setState({ showVerticalIndicator: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>pagingEnabled (iOS)</Text>
            <Switch value={this.state.pagingEnabled} onValueChange={v => this.setState({ pagingEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>setBuiltInZoomControls (Android)</Text>
            <Switch value={this.state.setBuiltInZoomControls} onValueChange={v => this.setState({ setBuiltInZoomControls: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>setDisplayZoomControls (Android)</Text>
            <Switch value={this.state.setDisplayZoomControls} onValueChange={v => this.setState({ setDisplayZoomControls: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>nestedScrollEnabled (Android)</Text>
            <Switch value={this.state.nestedScrollEnabled} onValueChange={v => this.setState({ nestedScrollEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>directionalLockEnabled (iOS)</Text>
            <Switch value={this.state.directionalLockEnabled} onValueChange={v => this.setState({ directionalLockEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>decelerationRate</Text>
            <Switch value={this.state.decelerationRate === 'fast'} onValueChange={v => this.setState({ decelerationRate: v ? 'fast' : 'normal' })} />
            <Text style={styles.switchValue}>{this.state.decelerationRate}</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>overScrollMode (Android)</Text>
            <Switch
              value={this.state.overScrollMode === 'never'}
              onValueChange={v => this.setState({ overScrollMode: v ? 'never' : 'always' })}
            />
            <Text style={styles.switchValue}>{this.state.overScrollMode}</Text>
          </View>
        </View>
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: `${BASE_URL}/scroll` }}
            scrollEnabled={this.state.scrollEnabled}
            bounces={this.state.bounces}
            showsHorizontalScrollIndicator={this.state.showHorizontalIndicator}
            showsVerticalScrollIndicator={this.state.showVerticalIndicator}
            pagingEnabled={this.state.pagingEnabled}
            setBuiltInZoomControls={this.state.setBuiltInZoomControls}
            setDisplayZoomControls={this.state.setDisplayZoomControls}
            nestedScrollEnabled={this.state.nestedScrollEnabled}
            overScrollMode={this.state.overScrollMode}
            decelerationRate={this.state.decelerationRate}
            directionalLockEnabled={this.state.directionalLockEnabled}
            onScroll={(e) => {
              this.setState({ scrollEvent: JSON.stringify(e.nativeEvent.contentOffset) });
            }}
            style={styles.webview}
          />
        </View>
        <Text style={styles.scrollInfo}>Scroll: {this.state.scrollEvent}</Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  switchGroup: { padding: 8, backgroundColor: '#f0f0f0' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  switchLabel: { fontSize: 11, flex: 1 },
  switchValue: { fontSize: 11, color: '#007AFF', marginLeft: 4 },
  webviewContainer: { height: 400, borderWidth: 1, borderColor: '#ccc' },
  webview: { flex: 1 },
  scrollInfo: { fontSize: 10, color: '#666', padding: 4 },
});


// showsVerticalScrollIndicator 无法动态切换
// showsHorizontalScrollIndicator 该属性已实现但是无效
