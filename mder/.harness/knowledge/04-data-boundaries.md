<!-- SUMMARY: 纯前端无持久化存储，运行时状态仅3个全局变量（fileHandle/filePath/fileName），无数据库无配置文件 -->
# 数据与类型边界

## 会话记录

不适用（无会话概念，每次打开页面为全新状态）

## 语音与配置

不适用

## 协调器输入输出

不适用

## 磁盘存储结构

无磁盘存储。项目为纯前端应用，不写入任何文件。

文件结构：
```
index.html              -- 主应用（19KB）
lib/
  marked.min.js        -- Markdown解析库（35KB）
  highlight.min.js     -- 语法高亮库（122KB）
  github.min.css       -- 代码高亮样式（1.3KB）
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

不适用（不使用浏览器本地存储）

## 边界约定

- 运行时状态仅存在于3个JavaScript全局变量中：currentFileHandle、currentFilePath、currentFileName
- 页面刷新或关闭后所有状态丢失
- 文件内容不缓存，重新加载时重新读取文件
- 不与任何后端服务通信
