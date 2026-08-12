import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  onFileDownloadEnabled: boolean;
  downloadingMessage: string;
  lackPermissionToDownloadMessage: string;
  allowFileAccess: boolean;
  allowFileAccessFromFileURLs: boolean;
  allowUniversalAccessFromFileURLs: boolean;
  allowingReadAccessToURL: string;
};

export default class DownloadScene extends Component<Props, State> {
  state: State = {
    onFileDownloadEnabled: true,
    downloadingMessage: '11Downloading...',
    lackPermissionToDownloadMessage: 'No permission to download',
    allowFileAccess: false,
    allowFileAccessFromFileURLs: false,
    allowUniversalAccessFromFileURLs: false,
    allowingReadAccessToURL: '',
  };

  render() {
    const platformProps: any = {};

    if (Platform.OS === 'ios' && this.state.onFileDownloadEnabled) {
      platformProps.onFileDownload = ({ nativeEvent }: any) => {
        Alert.alert('File Download', `URL: ${nativeEvent.downloadUrl}`);
      };
    } else if (Platform.OS === 'android') {
      platformProps.downloadingMessage = this.state.downloadingMessage;
      platformProps.lackPermissionToDownloadMessage = this.state.lackPermissionToDownloadMessage;
    } else {
      platformProps.onFileDownload = ({ nativeEvent }: any) => {
        Alert.alert('File Download', `URL: ${nativeEvent.downloadUrl}`);
      };
      platformProps.downloadingMessage = this.state.downloadingMessage;
      platformProps.lackPermissionToDownloadMessage = this.state.lackPermissionToDownloadMessage;
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Download Settings</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>onFileDownload (iOS)</Text>
            <Switch value={this.state.onFileDownloadEnabled} onValueChange={v => this.setState({ onFileDownloadEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Custom downloadingMessage (Android)</Text>
            <Switch
              value={this.state.downloadingMessage !== 'Downloading...'}
              onValueChange={v => this.setState({
                downloadingMessage: v ? 'Custom download in progress...' : 'Downloading...'
              })}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Custom lackPermissionMsg (Android)</Text>
            <Switch
              value={this.state.lackPermissionToDownloadMessage !== 'No permission to download'}
              onValueChange={v => this.setState({
                lackPermissionToDownloadMessage: v ? 'Custom: Storage permission required' : 'No permission to download'
              })}
            />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>File Access</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowFileAccess (Android)</Text>
            <Switch value={this.state.allowFileAccess} onValueChange={v => this.setState({ allowFileAccess: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowFileAccessFromFileURLs</Text>
            <Switch value={this.state.allowFileAccessFromFileURLs} onValueChange={v => this.setState({ allowFileAccessFromFileURLs: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowUniversalAccessFromFileURLs</Text>
            <Switch value={this.state.allowUniversalAccessFromFileURLs} onValueChange={v => this.setState({ allowUniversalAccessFromFileURLs: v })} />
          </View>
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: `${BASE_URL}/download` }}
            allowFileAccess={this.state.allowFileAccess} // 不支持
            allowFileAccessFromFileURLs={this.state.allowFileAccessFromFileURLs} // 文档未标记
            allowUniversalAccessFromFileURLs={this.state.allowUniversalAccessFromFileURLs} // 不支持
            {...platformProps}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Static HTML Source Test</Text>
          <Text style={styles.infoDesc}>{'Test source={{ html }} with originWhitelist'}</Text>
        </View>
        <View style={styles.webviewContainer}>
          <WebView
            source={{
              html: `
                <html>
                <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
                <body style="font-family:sans-serif;padding:20px;">
                  <h2>Static HTML Source</h2>
                  <p>This WebView was loaded with source={{ html }}.</p>
                  <p>originWhitelist must include "*" for static HTML.</p>
                  <p>Timestamp: ${new Date().toISOString()}</p>
                </body>
                </html>
              `,
              baseUrl: '',
            }}
            originWhitelist={['*']}
            nestedScrollEnabled={true}
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
  webviewContainer: { height: 250, borderWidth: 1, borderColor: '#ccc' },
  infoSection: { padding: 8, backgroundColor: '#e8f5e9' },
  infoTitle: { fontSize: 14, fontWeight: 'bold' },
  infoDesc: { fontSize: 11, color: '#666' },
});
