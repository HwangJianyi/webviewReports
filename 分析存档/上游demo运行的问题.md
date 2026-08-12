# Demo 验证问题汇总

以下为 `ohos/e/examples` 目录下各 Demo 文件中记录的验证问题。

| 文件 | 相关接口/属性 | 问题描述 |
|------|-------------|---------|
| `Alerts.tsx` | `showPrompt` (JS prompt 对话框) | `showPrompt` 不可用，点击按钮后 prompt 弹窗无法正常弹出 |
| `ClearData.tsx` | `webviewDebuggingEnabled` | 未开启调试模式的情况下未测试，不确定 `clearCache` 在非调试模式下是否正常工作 |
| `Downloads.tsx` | `onFileDownload` / 文件下载 | 点击下载链接无反应；对比安卓端会显示 "Downloading" 并将文件下载到手机。原因为缺乏 `WebDownloadDelegate`，参考：https://developer.huawei.com/consumer/cn/doc/harmonyos-faqs/faqs-arkweb-137 |
| `Injection.tsx` | `injectedJavaScriptObject` / `injectedObjectJson` | `injectedObjectJson` 无效，通过 `window.ReactNativeWebView.injectedObjectJson()` 无法获取注入的对象 |
| `OpenWindow.tsx` | `onOpenWindow` | 该属性在文档中已标记为不支持（鸿蒙平台） |
| `Suppress.tsx` | `suppressMenuItems` | 1. 复制菜单项仍然可以出现，未成功抑制；2. `suppressMenuItems` 为 iOS only 属性，文档已标记不支持 |

---

## 问题分类

### 功能不可用
- **`showPrompt`**（Alerts）：JS prompt 弹窗无法弹出
- **`injectedObjectJson`**（Injection）：注入对象无法通过 JS 读取
- **`onOpenWindow`**（OpenWindow）：文档已标记不支持
- **`suppressMenuItems`**（Suppress）：iOS only，鸿蒙不支持

### 功能异常
- **`onFileDownload`**（Downloads）：文件下载无响应，缺乏 `WebDownloadDelegate` 实现

### 未完整验证
- **`webviewDebuggingEnabled`**（ClearData）：未在非调试模式下验证 `clearCache` 功能
