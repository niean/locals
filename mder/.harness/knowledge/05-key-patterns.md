<!-- SUMMARY: 核心模式：文件API降级策略、Markdown渲染管线、Mermaid二次渲染、错误处理链、重新加载多策略回退、刷新后文件恢复 -->
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
3. marked.parse(content) -- Markdown转HTML，markedRenderer.code识别mermaid代码块并输出图表容器
4. highlight.js -- 对非mermaid代码块着色
5. innerHTML赋值 -- 将HTML插入DOM
6. renderMermaidDiagrams() -- Mermaid库存在时对当前输出区的.mermaid节点二次渲染
7. 更新文件信息栏 -- 显示路径/行数/大小/时间

## 模式三：Mermaid二次渲染

Mermaid图表渲染遵循后处理模式：
1. marked renderer先将```mermaid代码块输出为`<pre class="mermaid">`
2. renderMarkdown()插入HTML后调用renderMermaidDiagrams(markdownOutput)
3. renderMermaidDiagrams()首次运行时初始化window.mermaid，设置startOnLoad: false
4. 对当前渲染区内的.mermaid节点执行window.mermaid.run()
5. Mermaid库缺失时直接跳过，保留源码容器，避免页面崩溃

## 模式四：重新加载的多策略回退

reloadFile()按优先级尝试多种方式：
1. 有fileHandle -> 直接通过handle.getFile()重新读取
2. 有filePath且支持showOpenFilePicker -> 弹出文件选择器
3. 有filePath -> 尝试fetch请求
4. 都失败 -> 提示用户手动重新选择文件

## 模式五：错误处理与用户反馈

统一的错误处理模式：
1. showError(message) 在页面顶部显示红色错误卡片
2. clearError() 在成功操作前清除旧错误
3. AbortError（用户取消）静默处理，不显示错误
4. try-catch包裹所有异步操作和DOM操作

## 模式六：刷新后文件恢复

浏览器刷新后恢复上次打开文件的多层降级模式：
1. 持久化分层：IndexedDB 存 File System Access API 句柄（唯一可行方式），sessionStorage 存滚动位置和文件路径兜底
2. 页面加载时 restoreLastFile() 优先从 IndexedDB 取句柄
3. queryPermission 判断权限状态：
   - granted -> 直接 getFile -> readFile -> 渲染（透传 scrollYToRestore）
   - prompt -> 显示"恢复上次文件"按钮，用户点击后 requestPermission
   - denied -> 清除存储，显示空状态
4. 无句柄降级：从 sessionStorage 取 filePath -> fetch 拉取最新内容
5. 全部失败：清除存储，显示空状态
6. 滚动恢复：renderMarkdown 接收 scrollYToRestore 参数，Mermaid 渲染完成后 window.scrollTo
7. 新打开文件时 clearScrollPosition，避免新文件跳到旧位置
8. 容错：IndexedDB/sessionStorage 不可用时降级为 no-op，不阻塞核心功能
