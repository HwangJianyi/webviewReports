/**
 * ============================================================
 * 场景13: 嵌套滚动
 * ============================================================
 *
 * 验证 WebView 与 RN 滚动容器的嵌套滚动行为，涵盖以下场景:
 *
 * 基础场景:
 *   Demo 1:  WebView(scrollEnabled=false) 在 ScrollView 中
 *   Demo 2:  WebView(scrollEnabled=true) 在 ScrollView 中
 *   Demo 3:  短内容 WebView 在 ScrollView 中
 *   Demo 4:  多个 WebView 在同一 ScrollView 中
 *   Demo 5:  nestedScrollEnabled 对比
 *   Demo 6:  WebView 在 FlatList 中
 *
 * 方向与容器:
 *   Demo 7:  水平滑动 WebView 在垂直 ScrollView 中
 *   Demo 11: WebView 在 ViewPager 中
 *   Demo 14: WebView 在 SectionList 中
 *
 * 交互冲突:
 *   Demo 8:  PullToRefresh + WebView
 *   Demo 9:  StickyHeader + WebView
 *   Demo 12: CollapsibleHeader + WebView
 *   Demo 13: WebView 在 BottomSheet/Modal 中
 *
 * 动态与特殊:
 *   Demo 10: 动态高度 WebView 在 ScrollView 中
 *   Demo 15: KeyboardAvoidingView + WebView
 *   Demo 16: Tab 切换中的 WebView
 *   Demo 17: FlatList 下拉刷新 + WebView
 */

import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import DisabledWebViewInScrollView from './01_DisabledWebViewInScrollView';
import EnabledWebViewInScrollView from './02_EnabledWebViewInScrollView';
import ShortContentWebViewInScrollView from './03_ShortContentWebViewInScrollView';
import MultipleWebViewsInScrollView from './04_MultipleWebViewsInScrollView';
import NestedScrollEnabledToggle from './05_NestedScrollEnabledToggle';
import WebViewInFlatList from './06_WebViewInFlatList';
import HorizontalScrollWebView from './07_HorizontalScrollWebView';
import PullToRefreshWithWebView from './08_PullToRefreshWithWebView';
import StickyHeaderWithWebView from './09_StickyHeaderWithWebView';
import DynamicHeightWebView from './10_DynamicHeightWebView';
import WebViewInViewPager from './11_WebViewInViewPager';
import CollapsibleHeaderWithWebView from './12_CollapsibleHeaderWithWebView';
import WebViewInBottomSheet from './13_WebViewInBottomSheet';
import WebViewInSectionList from './14_WebViewInSectionList';
import KeyboardAvoidingWithWebView from './15_KeyboardAvoidingWithWebView';
import TabSwitchWithWebView from './16_TabSwitchWithWebView';
import FlatListPullToRefreshWebView from './17_FlatListPullToRefreshWebView';

type DemoItem = {
  key: string;
  title: string;
  description: string;
  category: string;
  component: React.ComponentType<any>;
};

const DEMOS: DemoItem[] = [
  {
    key: '01',
    title: 'WebView(scrollEnabled=false) in ScrollView',
    description: 'WebView 禁止滚动时，外层 ScrollView 是否可滚动',
    category: '基础',
    component: DisabledWebViewInScrollView,
  },
  {
    key: '02',
    title: 'WebView(scrollEnabled=true) in ScrollView',
    description: 'WebView 可滚动时，与外层 ScrollView 的滚动冲突',
    category: '基础',
    component: EnabledWebViewInScrollView,
  },
  {
    key: '03',
    title: '短内容 WebView in ScrollView',
    description: 'WebView 内容不足以滚动时，触摸事件是否传递给外层',
    category: '基础',
    component: ShortContentWebViewInScrollView,
  },
  {
    key: '04',
    title: '多个 WebView in ScrollView',
    description: '多个 WebView 在同一 ScrollView 中的滚动行为',
    category: '基础',
    component: MultipleWebViewsInScrollView,
  },
  {
    key: '05',
    title: 'nestedScrollEnabled 对比',
    description: '左右对比 nestedScrollEnabled 在 Android 上的效果',
    category: '基础',
    component: NestedScrollEnabledToggle,
  },
  {
    key: '06',
    title: 'WebView in FlatList',
    description: 'WebView 作为 FlatList 列表项的滚动行为',
    category: '基础',
    component: WebViewInFlatList,
  },
  {
    key: '07',
    title: '水平滑动 WebView in 垂直 ScrollView',
    description: '水平/垂直方向滑动的手势竞争与方向锁定',
    category: '方向与容器',
    component: HorizontalScrollWebView,
  },
  {
    key: '08',
    title: 'PullToRefresh + WebView',
    description: '下拉刷新手势与 WebView 滚动/弹性回弹冲突',
    category: '交互冲突',
    component: PullToRefreshWithWebView,
  },
  {
    key: '09',
    title: 'StickyHeader + WebView',
    description: '吸顶 Header 下方的 WebView 滚动行为',
    category: '交互冲突',
    component: StickyHeaderWithWebView,
  },
  {
    key: '10',
    title: '动态高度 WebView in ScrollView',
    description: 'WebView 高度自动撑开时，外层 ScrollView 滚动位置是否跳动',
    category: '动态与特殊',
    component: DynamicHeightWebView,
  },
  {
    key: '11',
    title: 'WebView in ViewPager',
    description: '水平分页切换中 WebView 的手势冲突',
    category: '方向与容器',
    component: WebViewInViewPager,
  },
  {
    key: '12',
    title: 'CollapsibleHeader + WebView',
    description: '可折叠头部与 WebView 滚动的协调',
    category: '交互冲突',
    component: CollapsibleHeaderWithWebView,
  },
  {
    key: '13',
    title: 'WebView in BottomSheet/Modal',
    description: '底部弹窗拖拽关闭手势与 WebView 滚动冲突',
    category: '交互冲突',
    component: WebViewInBottomSheet,
  },
  {
    key: '14',
    title: 'WebView in SectionList',
    description: 'WebView 在 SectionList 中的分组头+虚拟化行为',
    category: '方向与容器',
    component: WebViewInSectionList,
  },
  {
    key: '15',
    title: 'KeyboardAvoidingView + WebView',
    description: '键盘弹起时 WebView 输入框是否被遮挡，滚动位置是否跳动',
    category: '动态与特殊',
    component: KeyboardAvoidingWithWebView,
  },
  {
    key: '16',
    title: 'Tab 切换中的 WebView',
    description: 'Tab 切换时 WebView 滚动状态保持/丢失，渲染是否正常',
    category: '动态与特殊',
    component: TabSwitchWithWebView,
  },
  {
    key: '17',
    title: 'FlatList 下拉刷新 + WebView',
    description: 'FlatList 下拉刷新与 WebView 列表项滚动的手势冲突',
    category: '交互冲突',
    component: FlatListPullToRefreshWebView,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  '基础': '#1565c0',
  '方向与容器': '#00897b',
  '交互冲突': '#e65100',
  '动态与特殊': '#6a1b9a',
};

type Props = {};
type State = {
  currentDemo: DemoItem | null;
};

export default class NestedScrollScene extends Component<Props, State> {
  state: State = {
    currentDemo: null,
  };

  render() {
    if (this.state.currentDemo) {
      const DemoComponent = this.state.currentDemo.component;
      return (
        <View style={styles.container}>
          <View style={styles.demoHeader}>
            <TouchableOpacity onPress={() => this.setState({ currentDemo: null })} style={styles.backButton}>
              <Text style={styles.backButtonText}>&lt; Back</Text>
            </TouchableOpacity>
            <View style={styles.demoHeaderInfo}>
              <Text style={styles.demoHeaderTitle} numberOfLines={1}>{this.state.currentDemo.title}</Text>
              <Text style={styles.demoHeaderDesc} numberOfLines={1}>{this.state.currentDemo.description}</Text>
            </View>
          </View>
          <View style={styles.demoContent}>
            <DemoComponent />
          </View>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>嵌套滚动测试</Text>
          <Text style={styles.pageSubtitle}>WebView 与 RN 滚动容器的嵌套滚动行为验证</Text>
        </View>
        {['基础', '方向与容器', '交互冲突', '动态与特殊'].map((category) => {
          const items = DEMOS.filter(d => d.category === category);
          if (items.length === 0) return null;
          return (
            <View key={category} style={styles.categorySection}>
              <View style={[styles.categoryHeader, { borderLeftColor: CATEGORY_COLORS[category] || '#666' }]}>
                <Text style={styles.categoryTitle}>{category}</Text>
              </View>
              {items.map((demo) => (
                <TouchableOpacity
                  key={demo.key}
                  style={styles.demoCard}
                  onPress={() => this.setState({ currentDemo: demo })}
                >
                  <View style={styles.demoCardHeader}>
                    <Text style={[styles.demoCardKey, { color: CATEGORY_COLORS[category] || '#666' }]}>
                      Demo {demo.key}
                    </Text>
                  </View>
                  <Text style={styles.demoCardTitle}>{demo.title}</Text>
                  <Text style={styles.demoCardDesc}>{demo.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  titleSection: {
    padding: 16,
    backgroundColor: '#263238',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#b0bec5',
    marginTop: 4,
  },
  categorySection: {
    marginTop: 8,
  },
  categoryHeader: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  demoCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  demoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoCardKey: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  demoCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  demoCardDesc: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  demoHeaderInfo: {
    flex: 1,
  },
  demoHeaderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  demoHeaderDesc: {
    fontSize: 10,
    color: '#666',
  },
  demoContent: {
    flex: 1,
  },
});
