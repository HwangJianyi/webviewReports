/**
 * ============================================================
 * 场景07: 外观与主题
 * ============================================================
 *
 * 测试点1: forceDarkOn (Android 深色模式)
 *   操作: 开启 forceDarkOn 开关
 *   预期: WebView 内容自动应用深色主题，浅色背景变深，文字变亮
 *
 * 测试点2: forceDarkOn 关闭
 *   操作: 关闭 forceDarkOn 开关
 *   预期: WebView 恢复原始浅色主题，尊重系统设置
 *
 * 测试点3: contentMode (iOS)
 *   操作: 切换 contentMode 在 mobile/desktop 之间
 *   预期: mobile 时加载移动版内容；desktop 时加载桌面版内容
 *
 * 测试点4: indicatorStyle (iOS)
 *   操作: 切换 indicatorStyle 在 default/white 之间
 *   预期: 滚动指示器颜色改变，white 模式下指示器为白色
 *
 * 测试点5: textZoom (Android)
 *   操作: 切换 textZoom 在 100/200 之间
 *   预期: 200% 时页面文字明显放大；100% 时为正常大小
 *
 * 测试点6: minimumFontSize (Android)
 *   操作: 切换 minimumFontSize 在 1/8 之间
 *   预期: 1 时允许极小字体；8 时强制最小字体为 8px，小字体会被放大
 *
 * 测试点7: automaticallyAdjustContentInsets
 *   操作: 切换该开关
 *   预期: true 时自动调整内容内边距以避开导航栏/工具栏；false 时不调整
 *
 * 测试点8: contentInset (iOS)
 *   操作: 开启 "Custom contentInset (top: 50)" 开关
 *   预期: WebView 内容顶部出现 50px 的内边距，内容整体下移
 *
 * 测试点9: style 属性
 *   操作: 开启 "Custom style/containerStyle" 开关
 *   预期: WebView 自身样式变为蓝色背景+圆角；外层容器有边距和圆角
 *
 * 测试点10: CSS prefers-color-scheme 响应
 *   操作: 在 forceDarkOn 开启/关闭时观察页面
 *   预期: 页面中的 CSS 媒体查询响应深浅色切换，页面文字和背景色变化
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  forceDarkOn: boolean;
  contentMode: 'recommended' | 'mobile' | 'desktop';
  indicatorStyle: 'default' | 'black' | 'white';
  textZoom: number;
  minimumFontSize: number;
  showCustomStyle: boolean;
  contentInset: { top: number; left: number; bottom: number; right: number };
  autoAdjustContentInsets: boolean;
};

export default class AppearanceScene extends Component<Props, State> {
  state: State = {
    forceDarkOn: true,
    contentMode: 'recommended',
    indicatorStyle: 'default',
    textZoom: 100,
    minimumFontSize: 8,
    showCustomStyle: false,
    contentInset: { top: 0, left: 0, bottom: 0, right: 0 },
    autoAdjustContentInsets: true,
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Dark Mode & Theme</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>forceDarkOn (Android)</Text>
            <Switch value={this.state.forceDarkOn} onValueChange={v => this.setState({ forceDarkOn: v })} />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Content Mode & Display</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>contentMode (iOS)</Text>
            <Switch
              value={this.state.contentMode === 'desktop'}
              onValueChange={v => this.setState({ contentMode: v ? 'desktop' : 'mobile' })}
            />
            <Text style={styles.switchValue}>{this.state.contentMode}</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>indicatorStyle (iOS)</Text>
            <Switch
              value={this.state.indicatorStyle === 'white'}
              onValueChange={v => this.setState({ indicatorStyle: v ? 'white' : 'default' })}
            />
            <Text style={styles.switchValue}>{this.state.indicatorStyle}</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>textZoom (Android): {this.state.textZoom}</Text>
            <Switch
              value={this.state.textZoom === 100}
              onValueChange={v => this.setState({ textZoom: v ? 200 : 100 })}
            />
            <Text style={styles.switchValue}>{this.state.textZoom}%</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>minimumFontSize (Android): {this.state.minimumFontSize}</Text>
            <Switch
              value={this.state.minimumFontSize === 1}
              onValueChange={v => this.setState({ minimumFontSize: v ? 1 : 8 })}
            />
            <Text style={styles.switchValue}>{this.state.minimumFontSize}</Text>
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Insets & Layout</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>automaticallyAdjustContentInsets</Text>
            <Switch value={this.state.autoAdjustContentInsets} onValueChange={v => this.setState({ autoAdjustContentInsets: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Custom contentInset (top: 50)</Text>
            <Switch
              value={this.state.contentInset.top > 0}
              onValueChange={v => this.setState({
                contentInset: v ? { top: 50, left: 0, bottom: 0, right: 0 } : { top: 0, left: 0, bottom: 0, right: 0 }
              })}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Custom style/containerStyle</Text>
            <Switch value={this.state.showCustomStyle} onValueChange={v => this.setState({ showCustomStyle: v })} />
          </View>
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: `${BASE_URL}/dark-mode` }}
            forceDarkOn={this.state.forceDarkOn}
            contentMode={this.state.contentMode as any} // 不支持
            indicatorStyle={this.state.indicatorStyle as any} // 不支持
            textZoom={this.state.textZoom}
            minimumFontSize={this.state.minimumFontSize}
            automaticallyAdjustContentInsets={this.state.autoAdjustContentInsets} // 不支持
            contentInset={this.state.contentInset} // 不支持
            style={this.state.showCustomStyle ? { backgroundColor: '#e3f2fd', borderRadius: 12 } : undefined}
            containerStyle={this.state.showCustomStyle ? { margin: 8, borderRadius: 12, overflow: 'hidden' } : undefined}
            nestedScrollEnabled={true}
            onMessage={(e) => {
              try {
                const data = JSON.parse(e.nativeEvent.data);
                if (data.type === 'theme_changed') {
                  console.log('Theme changed:', data.isDark ? 'dark' : 'light');
                }
              } catch {}
            }}
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
  switchValue: { fontSize: 11, color: '#007AFF', marginLeft: 4 },
  webviewContainer: { height: 400, borderWidth: 1, borderColor: '#ccc' },
});


// forceDarkOn textZoom不支持动态切换
