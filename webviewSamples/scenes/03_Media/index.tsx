/**
 * ============================================================
 * 场景03: 媒体播放
 * ============================================================
 *
 * 测试点1: mediaPlaybackRequiresUserAction = true (默认)
 *   操作: 开关保持打开状态，观察 "Video with autoplay" 和 "Audio with autoplay"
 *   预期: 带 autoplay 的视频/音频不会自动播放，需要用户手动点击播放按钮
 *
 * 测试点2: mediaPlaybackRequiresUserAction = false
 *   操作: 关闭该开关，重新加载页面
 *   预期: 带 autoplay+muted 的视频自动播放，音频也可自动播放
 *
 * 测试点3: allowsFullscreenVideo = true
 *   操作: 开关保持打开，点击视频的全屏按钮
 *   预期: 视频可以进入全屏模式播放
 *
 * 测试点4: allowsFullscreenVideo = false
 *   操作: 关闭该开关，点击视频播放
 *   预期: 视频无法进入全屏模式，只能在内嵌区域播放
 *
 * 测试点5: allowsInlineMediaPlayback = true
 *   操作: 开关保持打开，播放 "Inline Video (webkit-playsinline)"
 *   预期: 视频在页面内嵌播放，不弹出原生全屏控制器
 *
 * 测试点6: allowsInlineMediaPlayback = false
 *   操作: 关闭该开关，播放带 playsinline 属性的视频
 *   预期: 视频使用原生全屏控制器播放，而非内嵌播放
 *
 * 测试点7: allowsPictureInPictureMediaPlayback
 *   操作: 开启该开关，播放视频后尝试退出全屏
 *   预期: 开启时支持画中画模式；关闭时退出全屏直接回到内嵌
 *
 * 测试点8: ignoreSilentHardwareSwitch
 *   操作: 将手机静音开关打开，开启 ignoreSilentHardwareSwitch
 *   预期: 开启后即使手机静音，视频音频仍然有声音
 *
 * 测试点9: allowsProtectedMedia (DRM)
 *   操作: 开启该开关
 *   预期: 允许播放受 DRM 保护的媒体内容；关闭时受保护媒体无法播放
 *
 * 测试点10: 程序化播放 vs 用户触发播放
 *   操作: 点击 "Play programmatically" 按钮
 *   预期: mediaPlaybackRequiresUserAction=false 时可播放；true 时播放被阻止
 */

import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  mediaPlaybackRequiresUserAction: boolean;
  allowsFullscreenVideo: boolean;
  allowsInlineMediaPlayback: boolean;
  allowsPictureInPictureMediaPlayback: boolean;
  ignoreSilentHardwareSwitch: boolean;
  allowsProtectedMedia: boolean;
};

export default class MediaScene extends Component<Props, State> {
  state: State = {
    mediaPlaybackRequiresUserAction: true,
    allowsFullscreenVideo: true,
    allowsInlineMediaPlayback: true,
    allowsPictureInPictureMediaPlayback: false,
    ignoreSilentHardwareSwitch: false,
    allowsProtectedMedia: false,
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Media Playback Controls</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>mediaPlaybackRequiresUserAction</Text>
            <Switch value={this.state.mediaPlaybackRequiresUserAction} onValueChange={v => this.setState({ mediaPlaybackRequiresUserAction: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowsFullscreenVideo</Text>
            <Switch value={this.state.allowsFullscreenVideo} onValueChange={v => this.setState({ allowsFullscreenVideo: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowsInlineMediaPlayback</Text>
            <Switch value={this.state.allowsInlineMediaPlayback} onValueChange={v => this.setState({ allowsInlineMediaPlayback: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowsPictureInPictureMediaPlayback</Text>
            <Switch value={this.state.allowsPictureInPictureMediaPlayback} onValueChange={v => this.setState({ allowsPictureInPictureMediaPlayback: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>ignoreSilentHardwareSwitch</Text>
            <Switch value={this.state.ignoreSilentHardwareSwitch} onValueChange={v => this.setState({ ignoreSilentHardwareSwitch: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowsProtectedMedia</Text>
            <Switch value={this.state.allowsProtectedMedia} onValueChange={v => this.setState({ allowsProtectedMedia: v })} />
          </View>
        </View>
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: `${BASE_URL}/media` }}
            mediaPlaybackRequiresUserAction={this.state.mediaPlaybackRequiresUserAction}
            allowsFullscreenVideo={this.state.allowsFullscreenVideo}
            allowsInlineMediaPlayback={this.state.allowsInlineMediaPlayback}
            allowsPictureInPictureMediaPlayback={this.state.allowsPictureInPictureMediaPlayback}
            ignoreSilentHardwareSwitch={this.state.ignoreSilentHardwareSwitch}
            allowsProtectedMedia={this.state.allowsProtectedMedia}
            style={styles.webview}
            nestedScrollEnabled={true}
          />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  switchGroup: { padding: 8, backgroundColor: '#f0f0f0' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  switchLabel: { fontSize: 11, flex: 1 },
  webviewContainer: { height: 500, borderWidth: 1, borderColor: '#ccc' },
  webview: { flex: 1 },
});
