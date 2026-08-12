import React, { Component } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

type Props = {};
type State = {
  menuItems: { label: string; key: string }[];
  suppressMenuItems: string[];
  dataDetectorTypes: string[];
  allowsLinkPreview: boolean;
};

const HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Custom Menu & Data Detection</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .section { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
    .highlight { background: #fffde7; padding: 10px; }
  </style>
</head>
<body>
  <h1>Custom Menu & Data Detection</h1>

  <div class="section">
    <h2>Long-press to select text</h2>
    <p class="highlight">Select this text to see the custom context menu items. The menuItems and suppressMenuItems props control what appears.</p>
  </div>

  <div class="section">
    <h2>Data Detection</h2>
    <p>Phone: +1 (555) 123-4567</p>
    <p>Link: <a href="https://example.com">https://example.com</a></p>
    <p>Address: 1 Apple Park Way, Cupertino, CA 95014</p>
    <p>Date: January 1, 2025 at 10:00 AM</p>
    <p>Tracking: 1Z999AA10123456784</p>
    <p>Flight: AA123</p>
  </div>

  <div class="section">
    <h2>Content Editable</h2>
    <div contenteditable="true" style="border:1px solid #ccc;padding:10px;min-height:50px;">
      Edit this text. The suppressMenuItems prop controls which menu items appear.
    </div>
  </div>

  <div class="section">
    <h2>Link Preview</h2>
    <p><a href="https://example.com">Long-press this link to test allowsLinkPreview (3D Touch)</a></p>
  </div>
</body>
</html>
`;

export default class CustomMenuScene extends Component<Props, State> {
  state: State = {
    menuItems: [
      { label: 'Copy to Notes', key: 'copyToNotes' },
      { label: 'Search Web', key: 'searchWeb' },
      { label: 'Translate', key: 'translate' },
    ],
    suppressMenuItems: [],
    dataDetectorTypes: ['phoneNumber'],
    allowsLinkPreview: true,
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Custom Menu Items</Text>
          <Text style={styles.desc}>Long-press text to see custom menu items</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Add custom menu items</Text>
            <Switch
              value={this.state.menuItems.length > 0}
              onValueChange={v => this.setState({
                menuItems: v ? [
                  { label: 'Copy to Notes', key: 'copyToNotes' },
                  { label: 'Search Web', key: 'searchWeb' },
                  { label: 'Translate', key: 'translate' },
                ] : []
              })}
            />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Suppress Menu Items</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Suppress copy/paste</Text>
            <Switch
              value={this.state.suppressMenuItems.includes('copy')}
              onValueChange={v => this.setState({
                suppressMenuItems: v ? ['copy', 'paste', 'cut', 'delete'] : []
              })}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Suppress share</Text>
            <Switch
              value={this.state.suppressMenuItems.includes('share')}
              onValueChange={v => {
                const current = this.state.suppressMenuItems.filter(i => i !== 'share');
                this.setState({ suppressMenuItems: v ? [...current, 'share'] : current });
              }}
            />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Data Detection (iOS)</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Detect all types</Text>
            <Switch
              value={this.state.dataDetectorTypes.includes('all')}
              onValueChange={v => this.setState({
                dataDetectorTypes: v ? ['all'] : ['phoneNumber']
              })}
            />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Other</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>allowsLinkPreview (iOS)</Text>
            <Switch value={this.state.allowsLinkPreview} onValueChange={v => this.setState({ allowsLinkPreview: v })} />
          </View>
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            source={{ html: HTML }}
            menuItems={this.state.menuItems}
            onCustomMenuSelection={(e) => {
              const { label, key, selectedText } = e.nativeEvent;
              Alert.alert('Menu Selected', `${label} (${key})\nText: "${selectedText}"`);
            }}
            nestedScrollEnabled={true}
            suppressMenuItems={this.state.suppressMenuItems as any} // 不支持
            dataDetectorTypes={this.state.dataDetectorTypes as any} // 不支持
            allowsLinkPreview={this.state.allowsLinkPreview}
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
  desc: { fontSize: 11, color: '#666', marginBottom: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  switchLabel: { fontSize: 11, flex: 1 },
  webviewContainer: { height: 500, borderWidth: 1, borderColor: '#ccc' },
});
