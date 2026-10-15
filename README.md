# dsh-refresh

[![npm version](https://img.shields.io/npm/v/dsh-refresh-plugin)](https://www.npmjs.com/package/dsh-refresh-plugin)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

DSH desktop 刷新插件 —— 为 DeepSeek Harness Desktop 增加页面刷新功能。

DSH desktop refresh plugin — adds a page-refresh (reload) feature to the DeepSeek Harness Desktop web UI.

## 背景 / Background

生产版 DeepSeek Harness Desktop 的窗口菜单里没有 "Reload Page" 项（该菜单项仅在 development 构建启用），而应用自带的快捷键系统又拒绝"无修饰键"的绑定，因此 **F5 在默认情况下完全不可用**（Ctrl+R 同样没有绑定）。

In production builds of DeepSeek Harness Desktop, the window menu ships no "Reload Page" item (it is development-gated), and the built-in shortcut system rejects bindings without modifiers — so **F5 does nothing by default** (Ctrl+R is unbound too).

本插件在页面（client 端）注册捕获阶段按键监听，补上刷新快捷键。

This plugin registers a capture-phase key listener on the client side to restore refresh shortcuts.

## 快捷键 / Shortcuts

| 按键 | 行为 |
|---|---|
| `F5` | 软刷新（reload） |
| `F5` + 任意修饰键（Ctrl / Shift / Alt） | 硬刷新（加 `_dsh_refresh` 时间戳参数绕过缓存） |
| `Ctrl+R` | 软刷新 |
| `Ctrl+Shift+R` | 硬刷新（cache-busted） |

## 安装 / Install

npm 包名：**`dsh-refresh-plugin`**（GitHub 仓库同名；npm 上的 `dsh-refresh` 已被其他用户占用）。

**方式一：从 npm registry 安装（推荐）**

```powershell
dsh plugin --profile desktop add dsh-refresh-plugin
```

**方式二：本地路径安装（开发调试时）**

```powershell
dsh plugin --profile desktop add F:\code\dsh-desktop-refresh\dsh-refresh
```

安装后**完全退出并重新打开应用**，按 `F5` 即可刷新（应用运行时会监听 profile 的 bundles 列表变化并自动重组 loader，但当前已加载的页面不会包含新监听器）。

## 卸载 / Uninstall

在应用内"插件"页面移除 `dsh-refresh`。

## 工作原理 / How it works

- 插件是一个标准 DSH bundle（`dsh.bundle.patch` 声明 loader 挂载行，`dsh.client` 声明 client 端），通过官方 `dsh plugin` CLI 安装进 profile。
- Host 端（`lib/index.js`）是一个空 `apply` —— 功能全部在 client 端（`lib/client.js`）。
- client 端使用捕获阶段 `keydown` 监听：原生快捷键系统会先消费它认领的键，未认领的键才到达 DOM，因此不会与现有快捷键冲突（裸 `F5` 也无法通过快捷键系统注册）。

## License

[MIT](LICENSE)
