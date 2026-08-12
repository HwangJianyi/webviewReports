import NavigationScene from './01_Navigation';
import InjectionScene from './02_Injection';
import MediaScene from './03_Media';
import LoadingScene from './04_Loading';
import ScrollScene from './05_Scroll';
import SecurityScene from './06_Security';
import AppearanceScene from './07_Appearance';
import UserAgentScene from './08_UserAgent';
import KeyboardScene from './09_Keyboard';
import CustomMenuScene from './10_CustomMenu';
import DownloadScene from './11_Download';
import AdvancedScene from './12_Advanced';
import NestedScrollScene from './13_NestedScroll';
import DiffCompareScene from './14_DiffCompare';

export interface SceneItem {
  key: string;
  title: string;
  description: string;
  props: string[];
  component: React.ComponentType<any>;
}

export const SCENES: SceneItem[] = [
  {
    key: '01_navigation',
    title: 'Navigation & Routing',
    description: 'URL navigation, custom schema, route interception, back/forward, open window',
    props: [
      'source', 'originWhitelist', 'onShouldStartLoadWithRequest', 'onNavigationStateChange',
      'onOpenWindow', 'javaScriptCanOpenWindowsAutomatically', 'setSupportMultipleWindows',
      'onLoadStart', 'onLoadEnd', 'onMessage', 'goBack', 'goForward', 'reload', 'stopLoading',
    ],
    component: NavigationScene,
  },
  {
    key: '02_injection',
    title: 'JS Injection & Communication',
    description: 'Inject JS before/after load, injectedObject, postMessage, iframe injection control',
    props: [
      'injectedJavaScript', 'injectedJavaScriptBeforeContentLoaded',
      'injectedJavaScriptForMainFrameOnly', 'injectedJavaScriptBeforeContentLoadedForMainFrameOnly',
      'injectedJavaScriptObject', 'onMessage', 'injectJavaScript', 'postMessage',
    ],
    component: InjectionScene,
  },
  {
    key: '03_media',
    title: 'Media Playback',
    description: 'Video inline/fullscreen, autoplay, PiP, audio, silent switch, DRM media',
    props: [
      'mediaPlaybackRequiresUserAction', 'allowsFullscreenVideo', 'allowsInlineMediaPlayback',
      'allowsPictureInPictureMediaPlayback', 'allowsAirPlayForMediaPlayback',
      'ignoreSilentHardwareSwitch', 'allowsProtectedMedia',
    ],
    component: MediaScene,
  },
  {
    key: '04_loading',
    title: 'Loading & Error Handling',
    description: 'Load progress, custom loading/error views, HTTP errors, render process crash',
    props: [
      'onLoad', 'onLoadStart', 'onLoadEnd', 'onLoadProgress', 'onError', 'onHttpError',
      'onRenderProcessGone', 'onContentProcessDidTerminate', 'renderError', 'renderLoading',
      'startInLoadingState', 'reload', 'stopLoading',
    ],
    component: LoadingScene,
  },
  {
    key: '05_scroll',
    title: 'Scroll & Zoom',
    description: 'Scroll enable/disable, bounce, indicators, zoom controls, paging, over-scroll, deceleration',
    props: [
      'scrollEnabled', 'onScroll', 'bounces', 'overScrollMode', 'pagingEnabled',
      'decelerationRate', 'setBuiltInZoomControls', 'setDisplayZoomControls',
      'nestedScrollEnabled', 'directionalLockEnabled', 'showsHorizontalScrollIndicator',
      'showsVerticalScrollIndicator', 'scalesPageToFit',
    ],
    component: ScrollScene,
  },
  {
    key: '06_security',
    title: 'Security & Privacy',
    description: 'JS enable, DOM storage, incognito, cache, cookies, file access, geolocation, mixed content',
    props: [
      'javaScriptEnabled', 'domStorageEnabled', 'incognito', 'cacheEnabled', 'cacheMode',
      'sharedCookiesEnabled', 'thirdPartyCookiesEnabled', 'allowFileAccess',
      'allowFileAccessFromFileURLs', 'allowUniversalAccessFromFileURLs',
      'geolocationEnabled', 'mixedContentMode', 'setSupportMultipleWindows',
      'clearCache', 'clearHistory',
    ],
    component: SecurityScene,
  },
  {
    key: '07_appearance',
    title: 'Appearance & Theming',
    description: 'Dark mode, content mode, indicator style, text zoom, font size, content inset, style/containerStyle',
    props: [
      'forceDarkOn', 'contentMode', 'indicatorStyle', 'textZoom', 'minimumFontSize',
      'automaticallyAdjustContentInsets', 'automaticallyAdjustsScrollIndicatorInsets',
      'contentInset', 'contentInsetAdjustmentBehavior', 'style', 'containerStyle',
    ],
    component: AppearanceScene,
  },
  {
    key: '08_useragent',
    title: 'User Agent & HTTP',
    description: 'Custom user agent, app name suffix, POST requests, custom headers, basic auth',
    props: [
      'userAgent', 'applicationNameForUserAgent', 'basicAuthCredential',
      'source.method', 'source.headers', 'source.body',
    ],
    component: UserAgentScene,
  },
  {
    key: '09_keyboard',
    title: 'Keyboard & Input',
    description: 'Keyboard display, accessory view, text interaction, form data, pull to refresh',
    props: [
      'keyboardDisplayRequiresUserAction', 'hideKeyboardAccessoryView',
      'textInteractionEnabled', 'saveFormDataDisabled',
      'pullToRefreshEnabled', 'refreshControlLightMode',
    ],
    component: KeyboardScene,
  },
  {
    key: '10_custommenu',
    title: 'Custom Menu & Data Detection',
    description: 'Custom context menu items, suppress menu items, data detection, link preview',
    props: [
      'menuItems', 'onCustomMenuSelection', 'suppressMenuItems',
      'dataDetectorTypes', 'allowsLinkPreview',
    ],
    component: CustomMenuScene,
  },
  {
    key: '11_download',
    title: 'Download & File Access',
    description: 'File download, download messages, file access, static HTML source',
    props: [
      'onFileDownload', 'downloadingMessage', 'lackPermissionToDownloadMessage',
      'allowFileAccess', 'allowFileAccessFromFileURLs', 'allowUniversalAccessFromFileURLs',
      'allowingReadAccessToURL', 'source.html', 'originWhitelist',
    ],
    component: DownloadScene,
  },
  {
    key: '12_advanced',
    title: 'Advanced & Debug',
    description: 'Debug mode, status bar, layer type, payment, capture permission, gestures, clear data',
    props: [
      'webviewDebuggingEnabled', 'autoManageStatusBarEnabled', 'androidLayerType',
      'scalesPageToFit', 'paymentRequestEnabled', 'mediaCapturePermissionGrantType',
      'limitsNavigationsToAppBoundDomains', 'fraudulentWebsiteWarningEnabled',
      'allowsBackForwardNavigationGestures', 'requestFocus', 'clearFormData',
    ],
    component: AdvancedScene,
  },
  {
    key: '13_nested_scroll',
    title: 'Nested Scroll',
    description: 'WebView nested in ScrollView/FlatList/SectionList, scroll conflicts, directional lock, pull-to-refresh, sticky header, collapsible header, bottom sheet, dynamic height, keyboard, tab switch',
    props: [
      'scrollEnabled', 'nestedScrollEnabled', 'bounces', 'directionalLockEnabled',
      'RefreshControl', 'stickyHeaderIndices', 'KeyboardAvoidingView',
      'FlatList', 'SectionList', 'ScrollView', 'Modal', 'Animated',
    ],
    component: NestedScrollScene,
  },
  {
    key: '14_diff_compare',
    title: 'Diff Compare (ohos vs Community)',
    description: 'Targeted tests for known implementation differences between ohos and community versions: basic auth, file upload, download, user agent, nav type, iframe injection, onOpenWindow, SSL error, cookies, scroll, dark mode, geolocation, multi-instance messaging, clear commands, custom menu, fullscreen video',
    props: [
      'basicAuthCredential', 'onFileDownload', 'userAgent', 'applicationNameForUserAgent',
      'injectedJavaScriptForMainFrameOnly', 'navigationType', 'isTopFrame',
      'onOpenWindow', 'onRenderProcessGone', 'onContentSizeChange',
      'sharedCookiesEnabled', 'thirdPartyCookiesEnabled', 'forceDarkOn', 'textZoom',
      'geolocationEnabled', 'allowsFullscreenVideo', 'mediaPlaybackRequiresUserAction',
      'menuItems', 'suppressMenuItems', 'clearCache', 'clearHistory', 'clearFormData',
    ],
    component: DiffCompareScene,
  },
];

export default SCENES;
