<!-- SUMMARY: mder文件映射：index.html（全部应用逻辑）、lib/（第三方库），共4个文件 -->
# 功能与文件映射

## 主应用

| 功能 | 文件 | 位置 |
|------|------|------|
| 页面结构（HTML） | index.html | body内的DOM结构 |
| 样式（CSS） | index.html | head > style标签 |
| 业务逻辑（JS） | index.html | body > script标签 |

## 文件操作

| 功能 | 文件 | 函数/位置 |
|------|------|----------|
| 打开文件（现代API） | index.html | openFileWithAPI() |
| 打开文件（传统方式） | index.html | handleFileSelect() |
| 读取文件内容 | index.html | readFile() |
| 重新加载文件 | index.html | reloadFile() |

## Markdown渲染

| 功能 | 文件 | 函数/位置 |
|------|------|----------|
| 渲染Markdown为HTML | index.html | renderMarkdown() |
| Markdown解析 | lib/marked.min.js | marked.parse() |
| 代码语法高亮 | lib/highlight.min.js | hljs.highlight() / hljs.highlightAuto() |
| 代码高亮样式 | lib/github.min.css | CSS样式 |

## UI交互

| 功能 | 文件 | 函数/位置 |
|------|------|----------|
| 错误提示 | index.html | showError() / clearError() |
| 重新加载按钮显隐 | index.html | toggleReloadButton() |
| 文件信息展示 | index.html | renderMarkdown()内部 |
| 字节格式化 | index.html | formatBytes() |
| 日期格式化 | index.html | formatDate() |
| 事件绑定 | index.html | script标签末尾 addEventListener |

## 配置

| 功能 | 文件 | 位置 |
|------|------|------|
| marked.js配置 | index.html | script标签顶部 marked.setOptions() |
| 文件大小常量 | index.html | script标签顶部 BYTES_PER_KB / BYTES_PER_MB |
| 响应式断点 | index.html | style标签内 @media（紧跟对应组件定义） |
