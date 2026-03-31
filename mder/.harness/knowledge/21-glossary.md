<!-- SUMMARY: mder项目术语表：File System Access API、marked.js、highlight.js、GFM等核心概念 -->
# 术语表

| 术语 | 含义 |
|------|------|
| File System Access API | 浏览器原生API，允许Web应用读取和写入用户本地文件系统，需要用户授权。通过showOpenFilePicker()打开文件选择器，返回FileSystemFileHandle |
| fileHandle | FileSystemFileHandle对象，代表用户选择的文件句柄，可用于后续重新读取同一文件而无需再次选择 |
| marked.js | JavaScript Markdown解析库，将Markdown文本转换为HTML字符串 |
| highlight.js | JavaScript语法高亮库，识别代码语言并添加着色的HTML标签 |
| GFM | GitHub Flavored Markdown，GitHub扩展的Markdown语法，支持表格、任务列表、删除线等 |
| mder | 本项目名称，Markdown Renderer的缩写 |
| 降级/fallback | 当现代浏览器API不可用时，自动切换到兼容性更好的传统方案 |
