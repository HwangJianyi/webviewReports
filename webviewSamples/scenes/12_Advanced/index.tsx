import React, { Component } from 'react';
import { View, Text, Switch, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import WebView from 'react-native-webview';

const BASE_URL = 'http://localhost:3000';

const ADVANCED_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: sans-serif; padding: 12px; }
  .section { margin-bottom: 16px; border: 1px solid #ddd; padding: 10px; border-radius: 6px; }
  .section h3 { margin: 0 0 8px; font-size: 14px; }
  button { padding: 8px 14px; margin: 4px; border: none; border-radius: 4px; background: #007AFF; color: #fff; font-size: 13px; }
  button:active { opacity: 0.6; }
  #output { background: #f5f5f5; padding: 8px; min-height: 30px; font-size: 12px; border-radius: 4px; white-space: pre-wrap; word-break: break-all; margin-top: 6px; }
  video { width: 100%; max-height: 200px; background: #000; border-radius: 4px; }
  .note { font-size: 11px; color: #999; margin-top: 4px; }
</style>
</head>
<body>

  <div class="section">
    <h3>Media Capture (mediaCapturePermissionGrantType)</h3>
    <p class="note">Tests camera/microphone permission. grant=auto-allow, prompt=ask user, deny=reject.</p>
    <button onclick="openCamera()">Open Camera</button>
    <button onclick="openMicrophone()">Open Microphone</button>
    <button onclick="stopStream()">Stop Stream</button>
    <video id="videoPreview" autoplay playsinline muted></video>
    <div id="mediaOutput">---</div>
  </div>

  <div class="section">
    <h3>Payment Request (paymentRequestEnabled)</h3>
    <p class="note">Tests Payment Request API. Requires paymentRequestEnabled=true on Android.</p>
    <button onclick="requestPayment()">Pay $1.00</button>
    <div id="paymentOutput">---</div>
  </div>

  <div class="section">
    <h3>Geolocation Permission</h3>
    <button onclick="requestGeo()">Get Location</button>
    <div id="geoOutput">---</div>
  </div>

  <div class="section">
    <h3>Notification Permission</h3>
    <button onclick="requestNotify()">Request Notification</button>
    <div id="notifyOutput">---</div>
  </div>

  <div class="section">
    <h3>Form Auto-fill (clearFormData)</h3>
    <p class="note">Fill in and submit the form. After clearing form data, autofill suggestions should disappear.</p>
    <form onsubmit="document.getElementById('formOutput').textContent='Submitted: ' + this.name.value; return false;">
      <input type="text" name="name" placeholder="Your name" style="padding:6px;width:80%;margin:4px 0;font-size:14px;" autocomplete="name" />
      <input type="email" name="email" placeholder="Your email" style="padding:6px;width:80%;margin:4px 0;font-size:14px;" autocomplete="email" />
      <button type="submit">Submit</button>
    </form>
    <div id="formOutput">---</div>
  </div>

  <div class="section">
    <h3>Debug Info</h3>
    <button onclick="showDebugInfo()">Show Info</button>
    <div id="debugOutput">---</div>
  </div>

  <script>
    var currentStream = null;

    function openCamera() {
      var out = document.getElementById('mediaOutput');
      out.textContent = 'Requesting camera...';
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then(function(stream) {
          currentStream = stream;
          var video = document.getElementById('videoPreview');
          video.srcObject = stream;
          out.textContent = 'Camera opened! Tracks: ' + stream.getTracks().length;
        })
        .catch(function(err) {
          out.textContent = 'Camera error: ' + err.name + ' - ' + err.message;
        });
    }

    function openMicrophone() {
      var out = document.getElementById('mediaOutput');
      out.textContent = 'Requesting microphone...';
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function(stream) {
          currentStream = stream;
          out.textContent = 'Microphone opened! Tracks: ' + stream.getTracks().length;
        })
        .catch(function(err) {
          out.textContent = 'Microphone error: ' + err.name + ' - ' + err.message;
        });
    }

    function stopStream() {
      if (currentStream) {
        currentStream.getTracks().forEach(function(t) { t.stop(); });
        currentStream = null;
        document.getElementById('videoPreview').srcObject = null;
        document.getElementById('mediaOutput').textContent = 'Stream stopped.';
      } else {
        document.getElementById('mediaOutput').textContent = 'No active stream.';
      }
    }

    function requestPayment() {
      var out = document.getElementById('paymentOutput');
      if (!window.PaymentRequest) {
        out.textContent = 'PaymentRequest API not supported in this WebView.';
        return;
      }
      try {
        var methods = [{ supportedMethods: 'https://pay.google.com' }];
        var details = {
          total: { label: 'Total', amount: { currency: 'USD', value: '1.00' } },
          displayItems: [{ label: 'Test Item', amount: { currency: 'USD', value: '1.00' } }]
        };
        var request = new PaymentRequest(methods, details);
        request.show()
          .then(function(response) {
            out.textContent = 'Payment response: ' + JSON.stringify(response.details);
            response.complete('success');
          })
          .catch(function(err) {
            out.textContent = 'Payment error: ' + err.name + ' - ' + err.message;
          });
      } catch(e) {
        out.textContent = 'Payment exception: ' + e.message;
      }
    }

    function requestGeo() {
      var out = document.getElementById('geoOutput');
      if (!navigator.geolocation) { out.textContent = 'Geolocation not supported'; return; }
      out.textContent = 'Requesting location...';
      navigator.geolocation.getCurrentPosition(
        function(pos) { out.textContent = 'Lat: ' + pos.coords.latitude + '\\nLng: ' + pos.coords.longitude; },
        function(err) { out.textContent = 'Error: ' + err.code + ' - ' + err.message; }
      );
    }

    function requestNotify() {
      var out = document.getElementById('notifyOutput');
      if (!('Notification' in window)) { out.textContent = 'Notification API not supported'; return; }
      Notification.requestPermission().then(function(result) {
        out.textContent = 'Permission: ' + result;
        if (result === 'granted') {
          new Notification('Test Notification', { body: 'Hello from WebView!' });
        }
      });
    }

    function showDebugInfo() {
      var info = [];
      info.push('UserAgent: ' + navigator.userAgent);
      info.push('Platform: ' + navigator.platform);
      info.push('Language: ' + navigator.language);
      info.push('CookieEnabled: ' + navigator.cookieEnabled);
      info.push('OnLine: ' + navigator.onLine);
      info.push('Screen: ' + screen.width + 'x' + screen.height);
      info.push('DPR: ' + window.devicePixelRatio);
      info.push('PaymentRequest: ' + !!window.PaymentRequest);
      info.push('MediaDevices: ' + !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
      info.push('Geolocation: ' + !!navigator.geolocation);
      info.push('Notification: ' + ('Notification' in window));
      document.getElementById('debugOutput').textContent = info.join('\\n');
    }
  </script>
</body>
</html>
`;

type Props = {};
type State = {
  webviewDebuggingEnabled: boolean;
  autoManageStatusBarEnabled: boolean;
  androidLayerType: string;
  scalesPageToFit: boolean;
  paymentRequestEnabled: boolean;
  mediaCapturePermissionGrantType: string;
  enablesReturnKeyAutomatically: boolean;
  limitNavToAppBoundDomains: boolean;
  fraudulentWebsiteWarningEnabled: boolean;
};

export default class AdvancedScene extends Component<Props, State> {
  webViewRef = React.createRef<WebView>();

  state: State = {
    webviewDebuggingEnabled: true,
    autoManageStatusBarEnabled: true,
    androidLayerType: 'none',
    scalesPageToFit: true,
    paymentRequestEnabled: false,
    mediaCapturePermissionGrantType: 'prompt',
    enablesReturnKeyAutomatically: false,
    limitNavToAppBoundDomains: false,
    fraudulentWebsiteWarningEnabled: true,
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Debug & Status Bar</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>webviewDebuggingEnabled</Text>
            <Switch value={this.state.webviewDebuggingEnabled} onValueChange={v => this.setState({ webviewDebuggingEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>autoManageStatusBarEnabled (iOS)</Text>
            <Switch value={this.state.autoManageStatusBarEnabled} onValueChange={v => this.setState({ autoManageStatusBarEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>fraudulentWebsiteWarningEnabled (iOS)</Text>
            <Switch value={this.state.fraudulentWebsiteWarningEnabled} onValueChange={v => this.setState({ fraudulentWebsiteWarningEnabled: v })} />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Rendering</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>androidLayerType</Text>
            <Switch
              value={this.state.androidLayerType !== 'none'}
              onValueChange={v => this.setState({ androidLayerType: v ? 'hardware' : 'none' })}
            />
            <Text style={styles.switchValue}>{this.state.androidLayerType}</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>scalesPageToFit (Android)</Text>
            <Switch value={this.state.scalesPageToFit} onValueChange={v => this.setState({ scalesPageToFit: v })} />
          </View>
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.sectionTitle}>Permissions & Payments</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>mediaCapturePermissionGrantType (iOS)</Text>
            <Switch
              value={this.state.mediaCapturePermissionGrantType === 'grant'}
              onValueChange={v => this.setState({ mediaCapturePermissionGrantType: v ? 'grant' : 'prompt' })}
            />
            <Text style={styles.switchValue}>{this.state.mediaCapturePermissionGrantType}</Text>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>paymentRequestEnabled (Android)</Text>
            <Switch value={this.state.paymentRequestEnabled} onValueChange={v => this.setState({ paymentRequestEnabled: v })} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>limitsNavigationsToAppBoundDomains (iOS)</Text>
            <Switch value={this.state.limitNavToAppBoundDomains} onValueChange={v => this.setState({ limitNavToAppBoundDomains: v })} />
          </View>
        </View>

        <View style={styles.controlBar}>
          <Button title="Request Focus" onPress={() => this.webViewRef.current?.requestFocus()} />
          <Button title="Clear Form Data" onPress={() => this.webViewRef.current?.clearFormData()} />
          <Button title="Clear Cache" onPress={() => { this.webViewRef.current?.clearCache(true); }} />
          <Button title="Clear History" onPress={() => this.webViewRef.current?.clearHistory()} />
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            ref={this.webViewRef}
            source={{ html: ADVANCED_HTML }}
            originWhitelist={['*']}
            mediaPlaybackRequiresUserAction={false}
            webviewDebuggingEnabled={this.state.webviewDebuggingEnabled}
            autoManageStatusBarEnabled={this.state.autoManageStatusBarEnabled}
            fraudulentWebsiteWarningEnabled={this.state.fraudulentWebsiteWarningEnabled}
            androidLayerType={this.state.androidLayerType as any}
            scalesPageToFit={this.state.scalesPageToFit}
            mediaCapturePermissionGrantType={this.state.mediaCapturePermissionGrantType as any}
            paymentRequestEnabled={this.state.paymentRequestEnabled}
            limitsNavigationsToAppBoundDomains={this.state.limitNavToAppBoundDomains}
            allowsBackForwardNavigationGestures={true}
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
  switchValue: { fontSize: 11, color: '#007AFF', marginLeft: 4 },
  controlBar: { flexDirection: 'row', flexWrap: 'wrap', padding: 4, backgroundColor: '#e8e8e8' },
  webviewContainer: { height: 400, borderWidth: 1, borderColor: '#ccc' },
});
