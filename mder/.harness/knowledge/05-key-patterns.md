<!-- SUMMARY: 核心模式：文件API降级策略、Markdown渲染管线、错误处理链、重新加载多策略回退 -->
# 关键代码模式

项目中反复出现但不易从单个文件推断的模式，供新功能实现时参照。

## 模式一：文件打开的降级策略

优先使用现代API，不支持时自动降级：
1. 检测window.showOpenFilePicker是否存在
2. 存在则调用File System Access API，获取fileHandle
3. 不存在则触发传统input[type=file]的click事件
4. 两种方式最终都通过readFile()函数统一处理

## 模式二：Markdown渲染管线

文件内容到页面展示的完整流程：
1. readFile() -- FileReader.readAsText读取UTF-8文本
2. renderMarkdown() -- 接收内容和文件元信息
3. marked.parse(content) -- Markdown转HTML
4. highlight.js -- 在marked的highlight回调中对代码块着色
5. innerHTML赋值 -- 将HTML插入DOM
6. 更新文件信息栏 -- 显示路径/行数/大小/时间

## 模式三：重新加载的多策略回退

reloadFile()按优先级尝试多种方式：
1. 有fileHandle -> 直接通过handle.getFile()重新读取
2. 有filePath且支持showOpenFilePicker -> 弹出文件选择器
3. 有filePath -> 尝试fetch请求
4. 都失败 -> 提示用户手动重新选择文件

## 模式四：错误处理与用户反馈

统一的错误处理模式：
1. showError(message) 在页面顶部显示红色错误卡片
2. clearError() 在成功操作前清除旧错误
3. AbortError（用户取消）静默处理，不显示错误
4. try-catch包裹所有异步操作和DOM操作
