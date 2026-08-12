const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send(`
    <h1>WebView Test Server</h1>
    <ul>
      <li><a href="/navigation">Navigation Test</a></li>
      <li><a href="/navigation/page1">Page 1</a></li>
      <li><a href="/navigation/page2">Page 2</a></li>
      <li><a href="/media">Media Playback Test</a></li>
      <li><a href="/dark-mode">Dark Mode Test</a></li>
      <li><a href="/form">Form Test</a></li>
      <li><a href="/geolocation">Geolocation Test</a></li>
      <li><a href="/camera">Camera Test</a></li>
      <li><a href="/download">Download Test</a></li>
      <li><a href="/auth">Basic Auth Test</a></li>
      <li><a href="/post-endpoint">POST Test</a></li>
      <li><a href="/cookies">Cookie Test</a></li>
      <li><a href="/cache">Cache Test</a></li>
      <li><a href="/iframe">Iframe Test</a></li>
      <li><a href="/scroll">Scroll Test</a></li>
      <li><a href="/user-agent">User Agent Test</a></li>
      <li><a href="/error/404">404 Error Test</a></li>
      <li><a href="/error/500">500 Error Test</a></li>
      <li><a href="/schema">Schema Test</a></li>
      <li><a href="/keyboard">Keyboard Test</a></li>
      <li><a href="/injection">Injection Test</a></li>
      <li><a href="/mixed-content">Mixed Content Test</a></li>
      <li><a href="/diff-test">Diff Compare Test (ohos vs Community)</a></li>
    </ul>
  `);
});

app.get('/navigation', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Navigation Home</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        a { display: block; margin: 10px 0; padding: 12px; background: #007AFF; color: white; text-decoration: none; border-radius: 8px; text-align: center; }
        a:hover { background: #0056CC; }
        .schema-link { background: #FF9500; }
        .schema-link:hover { background: #CC7700; }
      </style>
    </head>
    <body>
      <h1>Navigation Test</h1>
      <p>Current URL: <code id="currentUrl">${req.protocol}://${req.get('host')}${req.originalUrl}</code></p>
      <a href="/navigation/page1">Go to Page 1 (same origin)</a>
      <a href="/navigation/page2">Go to Page 2 (same origin)</a>
      <a href="https://example.com" target="_blank">Open example.com (new window)</a>
      <a href="https://reactnative.dev" target="_self">Open reactnative.dev (external)</a>
      <a href="myapp://profile/123" class="schema-link">Custom Schema: myapp://profile/123</a>
      <a href="tel:+1234567890" class="schema-link">Tel Schema: tel://</a>
      <a href="mailto:test@example.com" class="schema-link">Mailto Schema: mailto:</a>
      <a href="sms:+1234567890" class="schema-link">SMS Schema: sms://</a>
      <a href="whatsapp://send?text=hello" class="schema-link">WhatsApp Schema</a>
      <hr>
      <button onclick="window.open('https://example.com')">window.open() via JS</button>
      <button onclick="window.open('https://example.com','_blank')">window.open('_blank')</button>
      <button onclick="window.open('https://example.com','_self')">window.open('_self')</button>
      <button onclick="history.back()">history.back()</button>
      <button onclick="history.forward()">history.forward()</button>
      <button onclick="location.reload()">location.reload()</button>
      <p id="navInfo"></p>
      <script>
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'navigation_loaded', url: window.location.href}));
      </script>
    </body>
    </html>
  `);
});

app.get('/navigation/page1', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page 1</title></head>
    <body style="font-family:sans-serif;padding:20px;background:#e3f2fd;">
      <h1>Page 1</h1>
      <p>This is Page 1. You navigated here successfully.</p>
      <p>Query params: <code>${JSON.stringify(req.query)}</code></p>
      <a href="/navigation/page2">Go to Page 2</a>
      <a href="/navigation">Back to Navigation Home</a>
    </body>
    </html>
  `);
});

app.get('/navigation/page2', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page 2</title></head>
    <body style="font-family:sans-serif;padding:20px;background:#f3e5f5;">
      <h1>Page 2</h1>
      <p>This is Page 2. Use back navigation to go to Page 1.</p>
      <a href="/navigation">Back to Navigation Home</a>
    </body>
    </html>
  `);
});

app.get('/media', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Media Playback</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        video, audio { width: 100%; margin: 10px 0; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
      </style>
    </head>
    <body>
      <h1>Media Playback Test</h1>
      <div class="section">
        <h2>Inline Video (webkit-playsinline)</h2>
        <video webkit-playsinline playsinline controls
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          poster="https://www.w3schools.com/html/pic_trulli.jpg">
        </video>
      </div>
      <div class="section">
        <h2>Video with autoplay</h2>
        <video webkit-playsinline playsinline autoplay muted controls
          src="https://www.w3schools.com/html/mov_bbb.mp4">
        </video>
      </div>
      <div class="section">
        <h2>Video without playsinline</h2>
        <video controls
          src="https://www.w3schools.com/html/mov_bbb.mp4">
        </video>
      </div>
      <div class="section">
        <h2>Audio</h2>
        <audio controls src="https://www.w3schools.com/html/horse.mp3"></audio>
      </div>
      <div class="section">
        <h2>Audio with autoplay</h2>
        <audio autoplay controls src="https://www.w3schools.com/html/horse.mp3"></audio>
      </div>
      <div class="section">
        <h2>YouTube Embed (iframe)</h2>
        <iframe width="100%" height="200" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>
      </div>
      <div class="section">
        <h2>Programmatic Play</h2>
        <video id="progVideo" webkit-playsinline playsinline
          src="https://www.w3schools.com/html/mov_bbb.mp4"></video>
        <button onclick="document.getElementById('progVideo').play()">Play programmatically</button>
      </div>
    </body>
    </html>
  `);
});

app.get('/dark-mode', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Dark Mode</title>
      <style>
        :root { --bg: #ffffff; --text: #000000; --card: #f0f0f0; --border: #ddd; }
        @media (prefers-color-scheme: dark) {
          :root { --bg: #1a1a1a; --text: #ffffff; --card: #2a2a2a; --border: #444; }
        }
        body { font-family: sans-serif; padding: 20px; background: var(--bg); color: var(--text); transition: all 0.3s; }
        .card { background: var(--card); border: 1px solid var(--border); padding: 15px; margin: 10px 0; border-radius: 8px; }
        .status { font-size: 14px; color: #888; }
        .theme-indicator { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        .light { background: #fff; color: #000; border: 1px solid #000; }
        .dark { background: #000; color: #fff; }
      </style>
    </head>
    <body>
      <h1>Dark Mode Test</h1>
      <div class="card">
        <p>Current theme: <span id="themeStatus" class="theme-indicator"></span></p>
        <p class="status">This page uses CSS <code>prefers-color-scheme</code> media query.</p>
        <p class="status">If the WebView respects <code>forceDarkOn</code>, the page should change appearance.</p>
      </div>
      <div class="card">
        <h3>Color Palette</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <div style="width:50px;height:50px;background:red;border-radius:4px;"></div>
          <div style="width:50px;height:50px;background:green;border-radius:4px;"></div>
          <div style="width:50px;height:50px;background:blue;border-radius:4px;"></div>
          <div style="width:50px;height:50px;background:var(--card);border:1px solid var(--border);border-radius:4px;"></div>
        </div>
      </div>
      <div class="card">
        <h3>Form Elements</h3>
        <input type="text" placeholder="Text input" style="width:100%;padding:8px;margin:5px 0;">
        <button style="padding:8px 16px;">Button</button>
      </div>
      <script>
        function updateTheme() {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const el = document.getElementById('themeStatus');
          el.textContent = isDark ? 'Dark' : 'Light';
          el.className = 'theme-indicator ' + (isDark ? 'dark' : 'light');
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({type:'theme_changed', isDark}));
          }
        }
        updateTheme();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
      </script>
    </body>
    </html>
  `);
});

app.get('/form', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Form Test</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        form { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        input, select, textarea { width: 100%; padding: 8px; margin: 5px 0; box-sizing: border-box; }
        button { padding: 10px 20px; margin: 5px; }
        .autofocus-input { background: #fffde7; }
      </style>
    </head>
    <body>
      <h1>Form & Input Test</h1>
      <form id="loginForm" action="/form-submit" method="POST">
        <h3>Login Form</h3>
        <input type="text" name="username" placeholder="Username" autocomplete="username">
        <input type="password" name="password" placeholder="Password" autocomplete="current-password">
        <input type="email" name="email" placeholder="Email" autocomplete="email">
        <button type="submit">Submit</button>
      </form>
      <form>
        <h3>Various Input Types</h3>
        <input type="text" placeholder="Text">
        <input type="number" placeholder="Number">
        <input type="tel" placeholder="Telephone">
        <input type="url" placeholder="URL">
        <input type="date">
        <input type="time">
        <input type="datetime-local">
        <input type="range" min="0" max="100">
        <input type="color" value="#ff0000">
        <select><option>Select...</option><option>Option A</option><option>Option B</option></select>
        <textarea placeholder="Textarea" rows="3"></textarea>
      </form>
      <form>
        <h3>Autofocus Input</h3>
        <input class="autofocus-input" type="text" placeholder="This input should autofocus" autofocus>
        <p>Tests <code>keyboardDisplayRequiresUserAction</code></p>
      </form>
      <form>
        <h3>File Upload</h3>
        <input type="file" accept="image/*">
        <input type="file" multiple>
      </form>
      <form>
        <h3>Content Editable</h3>
        <div contenteditable="true" style="border:1px solid #ccc;padding:10px;min-height:50px;">Edit this text...</div>
        <p>Tests <code>textInteractionEnabled</code> and <code>suppressMenuItems</code></p>
      </form>
    </body>
    </html>
  `);
});

app.post('/form-submit', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Form Submitted!</h1>
      <p>POST data received successfully.</p>
      <a href="/form">Back to Form</a>
    </body></html>
  `);
});

app.get('/geolocation', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Geolocation</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Geolocation Test</h1>
      <p>Tests <code>geolocationEnabled</code> prop</p>
      <button onclick="getLocation()">Get Location</button>
      <p id="locationResult">No location yet</p>
      <script>
        function getLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const result = 'Lat: ' + pos.coords.latitude + ', Lon: ' + pos.coords.longitude;
                document.getElementById('locationResult').textContent = result;
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({type:'geolocation', latitude: pos.coords.latitude, longitude: pos.coords.longitude}));
                }
              },
              (err) => {
                document.getElementById('locationResult').textContent = 'Error: ' + err.message;
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({type:'geolocation_error', message: err.message}));
                }
              }
            );
          } else {
            document.getElementById('locationResult').textContent = 'Geolocation not supported';
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/camera', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Camera</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Camera & Microphone Test</h1>
      <p>Tests <code>mediaCapturePermissionGrantType</code> prop</p>
      <button onclick="openCamera()">Open Camera</button>
      <button onclick="openMicrophone()">Open Microphone</button>
      <video id="cameraPreview" autoplay playsinline style="width:100%;max-height:300px;"></video>
      <p id="status">No media captured yet</p>
      <script>
        async function openCamera() {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
            document.getElementById('cameraPreview').srcObject = stream;
            document.getElementById('status').textContent = 'Camera active';
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({type:'camera_granted'}));
            }
          } catch(e) {
            document.getElementById('status').textContent = 'Camera error: ' + e.message;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({type:'camera_denied', message: e.message}));
            }
          }
        }
        async function openMicrophone() {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            document.getElementById('status').textContent = 'Microphone active';
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({type:'microphone_granted'}));
            }
          } catch(e) {
            document.getElementById('status').textContent = 'Microphone error: ' + e.message;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({type:'microphone_denied', message: e.message}));
            }
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/download', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Download</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Download Test</h1>
      <p>Tests <code>onFileDownload</code>, <code>downloadingMessage</code>, <code>lackPermissionToDownloadMessage</code></p>
      <a href="/download/file" download="test-file.txt">Download text file</a><br><br>
      <a href="/download/binary" download="test-file.bin">Download binary file</a><br><br>
      <a href="https://www.w3.org/TR/PNG/iso_8859-1.txt" download>Download external file</a>
    </body>
    </html>
  `);
});

app.get('/download/file', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="test-file.txt"');
  res.setHeader('Content-Type', 'text/plain');
  res.send('This is a test file downloaded from WebView test server.');
});

app.get('/download/binary', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="test-file.bin"');
  res.setHeader('Content-Type', 'application/octet-stream');
  const buf = Buffer.alloc(1024);
  for (let i = 0; i < 1024; i++) buf[i] = i % 256;
  res.send(buf);
});

app.get('/auth', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="WebView Test"');
    res.status(401).send('Authentication required');
    return;
  }
  const creds = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  const [username, password] = creds.split(':');
  if (username === 'admin' && password === 'password') {
    res.send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="font-family:sans-serif;padding:20px;">
        <h1>Authenticated!</h1>
        <p>Username: ${username}</p>
        <p>Tests <code>basicAuthCredential</code> prop</p>
      </body></html>
    `);
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="WebView Test"');
    res.status(401).send('Invalid credentials');
  }
});

app.get('/post-endpoint', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>POST Test</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>POST Request Test</h1>
      <p>This page was loaded via GET. Click the button to send a POST request.</p>
      <button onclick="sendPost()">Send POST via fetch</button>
      <p id="result"></p>
      <script>
        async function sendPost() {
          const response = await fetch('/post-endpoint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: 'data', timestamp: Date.now() })
          });
          const data = await response.text();
          document.getElementById('result').textContent = data;
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/post-endpoint', (req, res) => {
  res.send(`POST received! Body: ${JSON.stringify(req.body)}`);
});

app.get('/cookies', (req, res) => {
  const cookies = req.headers.cookie || 'No cookies';
  res.setHeader('Set-Cookie', [
    'webview_test_cookie=test_value; Path=/; Max-Age=3600',
    'webview_session_cookie=session123; Path=/'
  ]);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Cookies</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Cookie Test</h1>
      <p>Tests <code>sharedCookiesEnabled</code>, <code>thirdPartyCookiesEnabled</code>, <code>incognito</code></p>
      <p>Current cookies: <code>${cookies}</code></p>
      <p>Two cookies have been set by this page.</p>
      <button onclick="document.cookie='js_cookie=from_javascript; path=/'; alert('Cookie set from JS!')">Set Cookie from JS</button>
      <button onclick="alert(document.cookie)">Read All Cookies</button>
      <script>
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({type:'cookies', cookies: document.cookie}));
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/cache', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('ETag', '"cache-test-v1"');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Cache</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Cache Test</h1>
      <p>Tests <code>cacheEnabled</code>, <code>cacheMode</code></p>
      <p>Page loaded at: <strong>${new Date().toISOString()}</strong></p>
      <p>This page has Cache-Control headers set. Reload to test cache behavior.</p>
      <p>Cache-Control: public, max-age=3600</p>
      <button onclick="location.reload()">Reload Page</button>
    </body>
    </html>
  `);
});

app.get('/iframe', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Iframe</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>1Iframe Test</h1>
      <p>Tests <code>injectedJavaScriptForMainFrameOnly</code>, <code>injectedJavaScriptBeforeContentLoadedForMainFrameOnly</code></p>
      <h3>Same-origin iframe</h3>
      <iframe src="/navigation/page1" style="width:100%;height:150px;border:1px solid #ccc;"></iframe>
      <h3>Cross-origin iframe</h3>
      <iframe src="https://example.com" style="width:100%;height:150px;border:1px solid #ccc;"></iframe>
      <h3>Multiple iframes</h3>
      <iframe src="/navigation/page1" name="frame1" style="width:100%;height:80px;border:1px solid #ccc;"></iframe>
      <iframe src="/navigation/page2" name="frame2" style="width:100%;height:80px;border:1px solid #ccc;"></iframe>
    </body>
    <script>
       window.addEventListener('message', function(e) {
        console.log('jjtest window received:', e.data);
        window.ReactNativeWebView.postMessage('win echo:' + e.data);
      });
      document.addEventListener('message', function(e) {
        console.log('jjtest document received:', e.data);
        window.ReactNativeWebView.postMessage('doc echo:' + e.data);
      });
    </script>
    </html>
  `);
});

app.get('/scroll', (req, res) => {
  let content = '';
  for (let i = 0; i < 50; i++) {
    content += `<p style="padding:10px;margin:5px 0;background:${i % 2 ? '#f0f0f0' : '#fff'};">Paragraph ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`;
  }
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Scroll Test</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .wide { width: 200%; background: linear-gradient(to right, red, blue); height: 50px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Scroll Test</h1>
      <p>Tests <code>scrollEnabled</code>, <code>onScroll</code>, <code>bounces</code>, <code>overScrollMode</code>, <code>pagingEnabled</code></p>
      <div class="wide">Horizontal scroll content (200% width)</div>
      ${content}
    </body>
    </html>
  `);
});

app.get('/user-agent', (req, res) => {
  const ua = req.headers['user-agent'];
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>User Agent</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>User Agent Test</h1>
      <p>Tests <code>userAgent</code>, <code>applicationNameForUserAgent</code></p>
      <h3>Server-side User-Agent:</h3>
      <code style="word-break:break-all;">${ua}</code>
      <h3>Client-side User-Agent:</h3>
      <code id="clientUA" style="word-break:break-all;"></code>
      <h3>Client-side Platform:</h3>
      <code id="clientPlatform"></code>
      <script>
        document.getElementById('clientUA').textContent = navigator.userAgent;
        document.getElementById('clientPlatform').textContent = navigator.platform;
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({type:'user_agent', userAgent: navigator.userAgent}));
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/error/404', (req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>404 Not Found</h1>
      <p>Tests <code>onHttpError</code></p>
    </body></html>
  `);
});

app.get('/error/500', (req, res) => {
  res.status(500).send(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>500 Internal Server Error</h1>
      <p>Tests <code>onHttpError</code></p>
    </body></html>
  `);
});

app.get('/schema', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Schema Test</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Custom Schema Test</h1>
      <p>Tests <code>originWhitelist</code> and <code>onShouldStartLoadWithRequest</code></p>
      <h3>Standard Schemes</h3>
      <a href="https://example.com">https://</a><br>
      <a href="http://example.com">http://</a><br>
      <h3>App Schemes</h3>
      <a href="myapp://home">myapp://home</a><br>
      <a href="myapp://profile/123">myapp://profile/123</a><br>
      <a href="myapp://settings">myapp://settings</a><br>
      <h3>System Schemes</h3>
      <a href="tel:+1234567890">tel://</a><br>
      <a href="mailto:test@example.com">mailto:</a><br>
      <a href="sms:+1234567890">sms://</a><br>
      <a href="maps://?q=San+Francisco">maps://</a><br>
      <a href="itms-apps://itunes.apple.com">itms-apps://</a><br>
      <h3>Other Schemes</h3>
      <a href="whatsapp://send?text=hello">whatsapp://</a><br>
      <a href="tg://resolve?domain=test">tg://</a><br>
      <a href="fb://profile/123">fb://</a><br>
      <a href="twitter://user?screen_name=test">twitter://</a><br>
      <a href="intent://example.com#Intent;scheme=https;end">intent://</a><br>
    </body>
    </html>
  `);
});

app.get('/keyboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Keyboard</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Keyboard Test</h1>
      <p>Tests <code>keyboardDisplayRequiresUserAction</code>, <code>hideKeyboardAccessoryView</code></p>
      <input type="text" id="autoFocusInput" placeholder="Auto-focused input" autofocus>
      <br><br>
      <button onclick="document.getElementById('autoFocusInput').focus()">Focus input via JS</button>
      <button onclick="document.getElementById('autoFocusInput').blur()">Blur input</button>
      <br><br>
      <input type="text" placeholder="Normal input (no autofocus)">
      <textarea placeholder="Textarea"></textarea>
    </body>
    </html>
  `);
});

app.get('/injection', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Injection Test</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .result { padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>JavaScript Injection Test</h1>
      <p>Tests <code>injectedJavaScript</code>, <code>injectedJavaScriptBeforeContentLoaded</code>, <code>injectedJavaScriptObject</code></p>
      <div class="result">
        <strong>injectedJavaScriptObject:</strong> <span id="injectedObj">Not available</span>
      </div>
      <div class="result">
        <strong>Before load injection:</strong> <span id="beforeLoad">Not detected</span>
      </div>
      <div class="result">
        <strong>After load injection:</strong> <span id="afterLoad">Not detected</span>
      </div>
      <script>
        if (window.ReactNativeWebView && window.ReactNativeWebView.injectedObjectJson) {
          const obj = window.ReactNativeWebView.injectedObjectJson();
          document.getElementById('injectedObj').textContent = obj;
        }
        window.addEventListener('message', function(event) {
          document.getElementById('afterLoad').textContent = 'Message: ' + event.data;
        });
        document.addEventListener('message', function(event) {
          document.getElementById('afterLoad').textContent = 'Message: ' + event.data;
        });
      </script>
    </body>
    </html>
  `);
});

app.get('/mixed-content', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mixed Content</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Mixed Content Test</h1>
      <p>Tests <code>mixedContentMode</code> prop</p>
      <p>This page is served over HTTP and contains HTTP resources.</p>
      <img src="https://via.placeholder.com/150" alt="HTTPS image">
      <img src="http://via.placeholder.com/150" alt="HTTP image (may be blocked)">
      <p id="status">Loading...</p>
      <script>
        document.getElementById('status').textContent = 'Page loaded. Check if both images are visible.';
      </script>
    </body>
    </html>
  `);
});

app.get('/headers-test', (req, res) => {
  const headers = req.headers;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Headers</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Request Headers Test</h1>
      <p>Tests <code>source.headers</code> prop</p>
      <h3>Received Headers:</h3>
      <pre style="background:#f5f5f5;padding:10px;overflow:auto;max-height:300px;">${JSON.stringify(headers, null, 2)}</pre>
    </body>
    </html>
  `);
});

app.get('/reload-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Reload</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>Reload Test</h1>
      <p>Page loaded at: <strong>${new Date().toISOString()}</strong></p>
      <p>Use <code>reload()</code> method to reload this page.</p>
      <p>Each reload should show a new timestamp.</p>
    </body>
    </html>
  `);
});

app.get('/diff-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Diff Compare Test</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .section { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .test-item { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
        button { padding: 8px 16px; margin: 4px; }
        .log { background: #1a1a1a; color: #0f0; padding: 10px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto; }
        input[type="file"] { margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Diff Compare Test Page</h1>

      <div class="section">
        <h2>1. File Upload Test</h2>
        <p>On community Android/iOS, tapping the file input opens a picker. On ohos, it may do nothing.</p>
        <div class="test-item">
          <input type="file" accept="image/*" id="fileInput1">
          <p id="fileResult1">No file selected</p>
        </div>
        <div class="test-item">
          <input type="file" multiple id="fileInput2">
          <p id="fileResult2">No files selected</p>
        </div>
        <div class="test-item">
          <input type="file" accept="camera" capture="environment" id="fileCamera">
          <p>Camera capture test</p>
        </div>
      </div>

      <div class="section">
        <h2>2. Download Test</h2>
        <p>On community Android, downloads are auto-managed. On ohos/iOS, only event is emitted.</p>
        <a href="/download/file" download="test-file.txt" style="display:block;padding:10px;background:#007AFF;color:white;text-align:center;border-radius:8px;margin:5px 0;">Download Text File</a>
        <a href="/download/binary" download="test-file.bin" style="display:block;padding:10px;background:#FF9500;color:white;text-align:center;border-radius:8px;margin:5px 0;">Download Binary File</a>
      </div>

      <div class="section">
        <h2>3. window.open() Test</h2>
        <p>On community, onOpenWindow fires. On ohos, it may silently fail.</p>
        <button onclick="testWindowOpen()">window.open('https://example.com')</button>
        <button onclick="testWindowOpenBlank()">window.open('_blank')</button>
        <button onclick="testWindowOpenSelf()">window.open('_self')</button>
        <p id="openResult">No window.open called yet</p>
      </div>

      <div class="section">
        <h2>4. Navigation Type Detection</h2>
        <p>Click a link vs use JS navigation vs form submit vs back/forward. Community reports navType, ohos always reports "other".</p>
        <a href="/diff-test?type=click">Link Click Navigation</a><br>
        <button onclick="location.href='/diff-test?type=js-nav'">JS Navigation</button>
        <form action="/diff-test" method="GET" style="margin:5px 0;">
          <input type="hidden" name="type" value="form-submit">
          <button type="submit">Form Submit Navigation</button>
        </form>
        <button onclick="history.back()">history.back()</button>
        <button onclick="history.forward()">history.forward()</button>
      </div>

      <div class="section">
        <h2>5. Geolocation Test</h2>
        <p>On community Android, a native permission dialog appears. On ohos, geolocation is auto-granted/denied based on prop.</p>
        <button onclick="getLocation()">Get Location</button>
        <p id="geoResult">No location yet</p>
      </div>

      <div class="section">
        <h2>6. Cookie Test</h2>
        <p>On ohos, thirdPartyCookiesEnabled defaults to FALSE (Android=TRUE). sharedCookiesEnabled is not supported.</p>
        <button onclick="setCookie()">Set Cookie</button>
        <button onclick="readCookies()">Read Cookies</button>
        <button onclick="clearCookies()">Clear Cookies via JS</button>
        <p id="cookieResult">No cookie action yet</p>
      </div>

      <div class="section">
        <h2>7. Injected Object Test</h2>
        <p>Check if injectedJavaScriptObject is available. On ohos, this may not be supported.</p>
        <div id="injectedObjResult">Checking...</div>
      </div>

      <div class="section">
        <h2>8. Basic Auth Test</h2>
        <p>On community, basicAuthCredential auto-fills. On ohos, this is not implemented.</p>
        <a href="/auth" style="display:block;padding:10px;background:#FF3B30;color:white;text-align:center;border-radius:8px;">Open Auth Page</a>
        <p>Check if the page loads without showing a login dialog.</p>
      </div>

      <div class="section">
        <h2>9. Fullscreen Video Test</h2>
        <p>On ohos, allowsFullscreenVideo must be true for fullscreen. Check if orientation/immersive mode is restored on exit.</p>
        <video controls playsinline style="width:100%;" src="https://www.w3schools.com/html/mov_bbb.mp4"></video>
      </div>

      <div class="section">
        <h2>10. Context Menu Test</h2>
        <p>Select text below to test custom menu items. On ohos, suppressMenuItems may not work.</p>
        <p>Selectable text: The quick brown fox jumps over the lazy dog. Call +1-234-567-8900 for data detection.</p>
        <div contenteditable="true" style="border:1px solid #ccc;padding:10px;min-height:50px;">Editable content for menu test...</div>
      </div>

      <div class="section">
        <h2>11. Iframe Injection Test</h2>
        <p>On ohos, JS is always injected into iframes regardless of mainFrameOnly setting.</p>
        <iframe src="/navigation/page1" style="width:100%;height:100px;border:1px solid #ccc;"></iframe>
      </div>

      <div class="section">
        <h2>12. Event Log</h2>
        <div id="eventLog" class="log">Waiting for events...</div>
      </div>

      <script>
        // File upload listeners
        document.getElementById('fileInput1').addEventListener('change', function(e) {
          document.getElementById('fileResult1').textContent = 'File: ' + e.target.files[0]?.name;
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'file_selected', name: e.target.files[0]?.name}));
        });
        document.getElementById('fileInput2').addEventListener('change', function(e) {
          document.getElementById('fileResult2').textContent = 'Files: ' + Array.from(e.target.files).map(f=>f.name).join(', ');
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'files_selected', count: e.target.files.length}));
        });

        // window.open test
        function testWindowOpen() {
          var w = window.open('https://example.com');
          document.getElementById('openResult').textContent = 'window.open returned: ' + (w ? 'window object' : 'null');
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'window_open', result: w ? 'success' : 'null'}));
        }
        function testWindowOpenBlank() {
          var w = window.open('https://example.com', '_blank');
          document.getElementById('openResult').textContent = 'window.open(_blank) returned: ' + (w ? 'window object' : 'null');
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'window_open_blank', result: w ? 'success' : 'null'}));
        }
        function testWindowOpenSelf() {
          window.open('https://example.com', '_self');
        }

        // Geolocation
        function getLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                document.getElementById('geoResult').textContent = 'Lat: ' + pos.coords.latitude + ', Lon: ' + pos.coords.longitude;
                if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'geolocation_success', lat: pos.coords.latitude, lon: pos.coords.longitude}));
              },
              (err) => {
                document.getElementById('geoResult').textContent = 'Error: ' + err.message;
                if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'geolocation_error', message: err.message}));
              }
            );
          } else {
            document.getElementById('geoResult').textContent = 'Geolocation not supported';
          }
        }

        // Cookies
        function setCookie() {
          document.cookie = 'diff_test_cookie=test_value_' + Date.now() + '; path=/';
          document.getElementById('cookieResult').textContent = 'Cookie set: ' + document.cookie;
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'cookie_set', cookies: document.cookie}));
        }
        function readCookies() {
          document.getElementById('cookieResult').textContent = 'Cookies: ' + document.cookie;
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'cookie_read', cookies: document.cookie}));
        }
        function clearCookies() {
          var cookies = document.cookie.split(';');
          cookies.forEach(function(c) {
            var name = c.split('=')[0].trim();
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          });
          document.getElementById('cookieResult').textContent = 'Cookies cleared: ' + document.cookie;
        }

        // Injected object
        setTimeout(function() {
          var el = document.getElementById('injectedObjResult');
          if (window.ReactNativeWebView && window.ReactNativeWebView.injectedObjectJson) {
            el.textContent = 'injectedObjectJson: ' + window.ReactNativeWebView.injectedObjectJson();
            el.style.color = 'green';
          } else if (window.ReactNativeWebView) {
            el.textContent = 'ReactNativeWebView exists but injectedObjectJson is NOT available';
            el.style.color = 'orange';
          } else {
            el.textContent = 'ReactNativeWebView NOT available';
            el.style.color = 'red';
          }
        }, 1000);

        // Event log
        function logEvent(msg) {
          var el = document.getElementById('eventLog');
          el.textContent += '\\n' + new Date().toLocaleTimeString() + ': ' + msg;
          el.scrollTop = el.scrollHeight;
        }

        // Log all navigation events
        window.addEventListener('load', function() { logEvent('Page loaded: ' + window.location.href); });
        window.addEventListener('beforeunload', function() { logEvent('Before unload: ' + window.location.href); });

        // Post message to RN
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({type:'page_loaded', url: window.location.href, timestamp: Date.now()}));
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WebView Test Server running at http://localhost:${PORT}`);
  console.log(`Accessible on local network at http://<your-ip>:${PORT}`);
});
