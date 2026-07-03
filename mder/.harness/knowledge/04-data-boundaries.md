<!-- SUMMARY: 默认前端无磁盘存储，运行时状态3个全局变量+IndexedDB（文件句柄）+sessionStorage（滚动位置/路径兜底），无数据库无配置文件 -->
# 数据与类型边界

## 会话记录

不适用（无会话概念，每次打开页面为全新状态；刷新后通过 IndexedDB + sessionStorage 恢复上次文件）

## 语音与配置

不适用

## 协调器输入输出

不适用

## 磁盘存储结构

无磁盘存储（不写入文件系统）。项目为前端为主应用，使用浏览器存储 API 持久化恢复状态：

- IndexedDB（DB: `mder-db`, Store: `file-state`, Key: `last-file`）：存储 File System Access API 文件句柄及文件元信息，用于刷新后恢复
- sessionStorage：存储滚动位置（`mder-scroll-y`）、文件路径和文件名兜底（`mder-file-path` / `mder-file-name`）

IndexedDB 不可用时降级为仅 sessionStorage 兜底（无法恢复句柄，仅能 fetch 路径）。

文件结构：
```
index.html              -- 主应用
lib/
  marked.min.js        -- Markdown解析库
  highlight.min.js     -- 语法高亮库
  github.min.css       -- 代码高亮样式
  mermaid.min.js       -- Mermaid图表库
```

## 会话历史

不适用（无会话历史功能）

## 配置文件

无配置文件。marked.js配置通过JavaScript代码内联设置：
- highlight: 使用highlight.js进行代码高亮
- breaks: true（换行符转为br标签）
- gfm: true（启用GitHub Flavored Markdown）

## 导出/导入

不适用（仅读取文件，不导出或保存文件）

## UserDefaults

使用 sessionStorage 存储非敏感应用状态（滚动位置、文件路径兜底）；不使用 localStorage 和 cookie。IndexedDB 存储文件句柄（FileSystemFileHandle 对象）。

## 边界约定

- 运行时状态存在于3个JavaScript全局变量中：currentFileHandle、currentFilePath、currentFileName
- 持久化状态存在于 IndexedDB（文件句柄）和 sessionStorage（滚动位置、路径兜底）
- 页面刷新后通过 IndexedDB + sessionStorage 恢复上次文件和滚动位置；标签页关闭后 sessionStorage 清空，IndexedDB 句柄保留但权限可能需重新授权
- 文件内容不缓存，恢复时重新读取文件最新内容
- 默认不与后端服务通信；可选本地辅助后端通信（PRD允许可选增强）
- sessionStorage 禁止存储文件内容、凭据等敏感信息；仅存储滚动位置、文件路径等非敏感应用状态
