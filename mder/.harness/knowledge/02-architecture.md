<!-- SUMMARY: 单文件架构，index.html包含全部HTML/CSS/JS（JS:Airbnb Style, CSS:ITCSS+BEM），lib/目录存放第三方压缩库 -->
# 架构与模块边界

## 分层

mder采用单文件架构，无传统意义上的分层：

- 视图层（HTML）：index.html中的DOM结构，包括header、文件选择区、渲染输出区、文件信息栏
- 样式层（CSS）：index.html中的style标签，遵循ITCSS架构（Generic/Elements/Components分层）+ BEM命名
- 逻辑层（JS）：index.html中的script标签，遵循Airbnb JavaScript Style Guide，包含文件操作、Markdown渲染、UI交互
- 依赖层（lib/）：第三方压缩库文件（marked.min.js、highlight.min.js、github.min.css）

## 模块边界

- index.html：唯一的应用文件，所有自定义代码均在此文件内
- lib/：只读依赖目录，仅存放第三方库的压缩版本，不修改不添加自定义代码
- 无独立的JavaScript模块文件，所有函数定义在全局作用域

主要函数：
- renderMarkdown(content, filePath, fileName, fileHandle, lastModified) -- 核心渲染函数
- readFile(file, fileHandle) -- 读取文件内容并调用渲染
- openFileWithAPI() -- 通过File System Access API打开文件
- handleFileSelect(event) -- 传统file input的change事件处理
- reloadFile() -- 重新加载当前文件
- showError(message) / clearError() -- 错误提示
- toggleReloadButton(show) -- 控制重新加载按钮显隐

## 关键约束

- 保持单文件架构，不拆分为多个JS/CSS文件
- 不引入模块打包工具（webpack/vite/rollup等）
- 不引入CSS预处理器（sass/less等）
- 不引入JavaScript框架（React/Vue/Angular等）
- lib/目录中的库文件不版本管理更新，如需升级需手动替换
