<!-- SUMMARY: mder是浏览器端Markdown渲染工具，纯前端单HTML文件架构，使用marked.js+highlight.js，通过File System Access API打开文件 -->
# 项目概览

## 一句话

mder -- 浏览器端Markdown文件渲染工具，打开并渲染.md/.markdown/.txt文件，提供语法高亮和GitHub风格排版。

## 技术栈

- 语言：HTML5 + CSS3 + 原生JavaScript（ES6+）
- Markdown解析：Marked.js（lib/marked.min.js）
- 语法高亮：Highlight.js（lib/highlight.min.js）+ GitHub风格样式（lib/github.min.css）
- 构建工具：无（纯静态文件，浏览器直接打开）
- 包管理：无（第三方库以压缩文件形式引入）

## 入口与根状态

- 入口文件：index.html（唯一应用文件，包含全部HTML/CSS/JS）
- 根状态（JavaScript全局变量）：
  - currentFileHandle -- 当前文件的File System Access API句柄（用于重新加载）
  - currentFilePath -- 当前文件路径
  - currentFileName -- 当前文件名
- 配置：marked.setOptions() 在script标签顶部初始化，启用GFM和breaks

## 核心流程

1. 用户点击"打开文件"按钮
2. 优先使用File System Access API（showOpenFilePicker），不支持时降级为传统file input
3. FileReader读取文件内容为文本（UTF-8）
4. marked.parse()将Markdown转为HTML
5. highlight.js在marked的highlight回调中对代码块着色
6. 渲染结果插入DOM，显示文件元信息（路径、行数、大小、修改时间）
7. 保存文件句柄，支持"重新加载"按钮刷新内容

## 文档与规则

- 操作约束见 AGENTS.md
- 编码/UI/质量/安全约定见 .harness/knowledge/03-conventions.md
- 产品定位见 .harness/prd/01-prd-sense.md
