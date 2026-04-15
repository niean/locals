# Codebase Concerns

**Analysis Date:** 2026-04-15

## 单文件架构风险

### 可维护性随功能增长急剧下降

- Issue: 全部 HTML/CSS/JS 集中在 `index.html`（597 行，20.3KB），随功能增加文件体积和复杂度线性增长，难以定位和修改特定逻辑
- Files: `index.html`
- Impact: 新增功能时需要在单一文件中同时处理结构、样式、逻辑三部分内容，容易引入回归错误；CSS 选择器命名冲突风险增加；JS 函数间隐式耦合难以识别
- Fix approach: 在功能明显增多（如 1000+ 行）时，考虑将 CSS 和 JS 分离为独立文件，通过 script/link 标签引入，保持单文件应用架构但拆分关注点

### 全局变量污染

- Issue: 当前暴露 3 个全局变量（`currentFileHandle`、`currentFilePath`、`currentFileName`），未来新增功能会继续增加全局变量
- Files: `index.html`（第 385-387 行）
- Impact: 全局命名空间污染，第三方库可能与全局变量名冲突；无法利用模块作用域的封装优势
- Fix approach: 使用 IIFE（立即执行函数表达式）或模块模式将所有代码包裹在闭包中，只暴露必要的公共 API

## 安全关注

### XSS 通过 Markdown 渲染

- Risk: Markdown 内容通过 `marked.parse()` 转换为 HTML 后直接通过 `innerHTML` 插入 DOM（第 436 行），如果 marked.js 的 sanitizer 配置不当或存在漏洞，恶意 Markdown 中的 HTML 标签和 JavaScript 会被执行
- Files: `index.html`（第 435-436 行）
- Current mitigation: 依赖 marked.js 库内置的安全处理；文件仅通过用户主动选择获取，不自动读取任意文件
- Recommendations:
  1. 检查 marked.js 是否默认禁用 raw HTML（`sanitize` 选项）；当前配置中 `marked.setOptions()` 未设置 `sanitize: true`
  2. 考虑使用 `DOMPurify` 对 `marked.parse()` 输出进行二次净化后再插入 DOM
  3. 为 Markdown 中的链接添加 `rel="noopener noreferrer"` 和 `target="_blank"` 属性

### 依赖供应链安全

- Risk: `lib/` 目录下的第三方库（`marked.min.js`、`highlight.min.js`、`github.min.css`）手动管理，没有版本锁定文件或完整性校验
- Files: `lib/marked.min.js`（v12.0.0）、`lib/highlight.min.js`（v11.9.0）、`lib/github.min.css`
- Impact: 无法自动检测依赖更新和已知漏洞；手动替换文件时可能引入不兼容版本或被篡改的版本
- Recommendations:
  1. 在文档中记录当前依赖版本
  2. 定期使用 `npm audit` 或 Snyk 等工具检查已知漏洞
  3. 考虑添加 Subresource Integrity (SRI) 哈希校验

### 无 Content Security Policy

- Risk: HTML 文件未设置 Content Security Policy，缺乏对可执行脚本来源的限制
- Files: `index.html`
- Impact: 如果页面被嵌入恶意 iframe 或通过其他方式注入外部资源，XSS 攻击面更大
- Recommendations: 添加 `<meta http-equiv="Content-Security-Policy" content="...">` 标签，限制脚本和样式来源

## 浏览器兼容性

### File System Access API 支持有限

- Issue: `openFileWithAPI()` 使用 `window.showOpenFilePicker`，该 API 仅在 Chromium 系浏览器中可用，Firefox 和 Safari 不支持
- Files: `index.html`（第 550-577 行）
- Impact: Firefox 和 Safari 用户只能使用传统的 file input 降级方案，无法获得文件句柄，"重新加载"功能在这些浏览器中不可用
- Current mitigation: 有检测逻辑（第 550 行）和 file input 降级路径（第 552 行）
- Fix approach: 在 UI 中明确提示用户当前使用的是降级模式；考虑使用 `caniuse` 数据评估目标用户群的浏览器分布

### FileReader API 仅支持 UTF-8

- Issue: `readFile()` 使用 `readAsText(file, 'UTF-8')` 硬编码 UTF-8 编码（第 481 行）
- Files: `index.html`（第 470-482 行）
- Impact: 打开 GBK/GB2312/Shift-JIS 等编码的中文 Markdown 文件时会出现乱码，用户无法选择正确的编码
- Fix approach: 添加编码选择器，或使用 `TextDecoder` API 支持自动编码检测

## 性能瓶颈

### 大文件渲染无保护

- Issue: `renderMarkdown()` 对整个文件内容一次性调用 `marked.parse(content)` 然后一次性设置 `innerHTML`（第 435-436 行），无文件大小限制、无流式处理、无虚拟滚动
- Files: `index.html`（第 432-467 行）
- Cause: 对于超大 Markdown 文件（如 10MB+ 的技术文档），marked.js 解析和 DOM 插入都会阻塞主线程，导致浏览器假死
- Improvement path:
  1. 添加文件大小预警（如超过 1MB 时提示用户）
  2. 考虑使用 Web Worker 进行 marked.js 解析，避免阻塞主线程
  3. 考虑实现虚拟滚动，只渲染可见区域的 HTML

### highlight.js 全量加载

- Issue: `lib/highlight.min.js` 118.9KB，加载全部语言支持，但用户可能只使用少量编程语言
- Files: `lib/highlight.min.js`（118.9KB）
- Impact: 首屏加载体积增大，在移动端或慢速网络环境下影响用户体验
- Improvement path: 使用 highlight.js 的按需语言加载版本，只引入常用的编程语言

### 每次重新加载完整解析

- Issue: `reloadFile()` 每次都需要完整重新解析整个 Markdown 文件，无缓存机制
- Files: `index.html`（第 485-546 行）
- Impact: 用户频繁点击"重新加载"时，重复执行解析和渲染，浪费计算资源
- Fix approach: 比较文件修改时间，未变化时跳过解析；或缓存上次解析结果

### 无防抖/节流机制

- Issue: 如果未来添加自动重新加载功能（如监听文件变化），当前代码没有防抖或节流保护
- Files: `index.html`
- Impact: 文件快速连续变化时会导致多次渲染，造成性能问题和 UI 闪烁
- Fix approach: 为可能的高频操作添加 debounce/throttle 工具函数

## 维护风险

### 无构建工具

- Issue: 纯静态文件，无 npm、无构建流程、无代码压缩/混淆
- Impact: 第三方库需要手动下载和替换；无法使用现代 JavaScript 特性（如 import/export 模块语法）；无法进行自动化优化（tree-shaking、代码分割等）
- Current state: 项目刻意选择不引入构建工具（见 PROJECT.md）

### 无自动化测试

- Issue: 没有单元测试、集成测试或 E2E 测试，所有验证依赖人工浏览器操作
- Impact: 回归错误只能在手动测试中发现；重构或修改代码时缺乏安全保障
- Current state: 项目刻意选择不引入测试框架（见 PROJECT.md "单元测试"章节）

### 无 CI/CD

- Issue: 没有 GitHub Actions、CI 流程或自动化部署
- Impact: 代码质量依赖人工检查；无法自动运行 lint、安全检查或兼容性测试
- Fix approach: 至少添加一个 GitHub Actions workflow 用于验证 HTML 文件的有效性和链接检查

### 无 Linting 工具

- Issue: 没有 ESLint、Prettier 或任何代码质量工具
- Impact: 代码风格一致性依赖开发者手动遵守；无法自动捕获潜在的 JavaScript 错误
- Fix approach: 添加 ESLint 配置，即使不引入构建工具也可以在 pre-commit 阶段运行检查

## 脆弱区域

### 重新加载功能的多策略回退

- Files: `index.html`（第 485-546 行 `reloadFile()` 函数）
- Why fragile: 该函数按优先级尝试 4 种重新加载方式（fileHandle -> showOpenFilePicker -> fetch -> 提示用户），逻辑复杂且分支多。其中 fetch 方式（第 526-538 行）依赖 HTTP 服务器能访问到该路径，在非标准部署环境下容易失败
- Safe modification: 修改时保持 try-catch 层级不变，每添加新策略应在最前面插入，不影响现有策略
- Test coverage: 完全依赖人工测试，无自动化覆盖

### marked.js 配置回调

- Files: `index.html`（第 371-382 行 `marked.setOptions()`）
- Why fragile: `highlight` 回调函数内部调用 `hljs.highlightAuto(code).value`（第 378 行），当语言参数存在但 `hljs.getLanguage(lang)` 返回假值时会走自动检测分支，可能导致意外的高亮结果
- Safe modification: 修改高亮逻辑时，确保 fallback 行为明确
- Test coverage: 需要通过不同语言的代码块手动验证

### 文件大小计算使用 TextEncoder

- Files: `index.html`（第 448 行 `new TextEncoder().encode(content).length`）
- Why fragile: `TextEncoder` 在极旧的浏览器中不支持（IE11 等），虽然项目声明兼容现代浏览器，但 TextEncoder 是相对较新的 API
- Safe modification: 如需支持更广泛的浏览器，添加 fallback 计算方式

## 可扩展性限制

### 无主题/样式切换能力

- Issue: 所有样式硬编码在 `index.html` 的 style 标签中，无法切换主题或自定义样式
- Impact: 用户无法选择暗色模式或其他主题
- Scaling path: 将样式抽离为 CSS 变量（CSS Custom Properties），通过 JavaScript 动态切换

### 无插件/扩展机制

- Issue: 渲染管线（readFile -> marked.parse -> innerHTML）是固定的，用户无法添加自定义处理步骤
- Impact: 无法支持 Markdown 扩展语法、自定义渲染器、数学公式等高级功能
- Scaling path: 引入中间件模式，允许在 marked.parse 前后添加处理步骤

### 无文件对比功能

- Issue: 无法对比两个版本的 Markdown 文件差异
- Impact: 用户编辑后重新加载，只能看到最终结果，无法直观看到变化
- Scaling path: 添加 diff 库（如 diff-match-patch），在重新加载时展示变更区域

### 无导出/保存功能

- Issue: 只能读取和渲染 Markdown，无法导出为 HTML、PDF 等格式
- Impact: 用户无法将渲染结果分享给没有 mder 的人
- Scaling path: 添加导出功能，使用 `html2pdf` 或浏览器打印 API

### 无多文件支持

- Issue: 一次只能打开一个文件，不支持多标签页或目录浏览
- Impact: 无法渲染包含多个 Markdown 文件的文档站点
- Scaling path: 添加标签页管理和目录树浏览功能

## 缺失关键功能

### 无搜索功能

- Problem: 无法在长文档中搜索关键词
- Blocks: 用户在长文档中快速定位信息

### 无目录/大纲导航

- Problem: 没有自动生成文档目录（基于标题层级）的侧边栏
- Blocks: 长文档的快速导航

### 无打印优化

- Problem: 没有 `@media print` 样式，打印时可能包含不必要的 UI 元素
- Blocks: 将渲染结果打印为 PDF

## 依赖风险

### marked.js v12.0.0

- Risk: 当前使用 marked.js v12.0.0（发布于 2023 年底），已不是最新版本
- Impact: 可能缺少最新的安全修复和功能改进
- Migration plan: 定期更新到最新稳定版本，更新后手动验证渲染结果

### highlight.js v11.9.0

- Risk: 当前使用 highlight.js v11.9.0，该版本已接近 v11 系列的末期，v12 已发布
- Impact: 新语言支持和性能改进无法获得
- Migration plan: 评估 v12 的 breaking changes，制定升级计划

### 第三方库无版本管理

- Risk: `lib/` 目录中的文件没有版本标识，替换后无法确认版本
- Impact: 团队成员可能使用不同版本的库文件，导致行为不一致
- Recommendations: 在文件名中加入版本号（如 `marked-12.0.0.min.js`）或在代码注释中标注版本

## 已知问题

### reloadFile 的 fetch 回退路径不可靠

- Symptoms: 在非 HTTP 服务器环境下（如直接打开 file:// 协议），fetch 请求必然失败
- Files: `index.html`（第 526-538 行）
- Trigger: 用户通过 file:// 协议打开页面，使用传统 file input 选择文件后点击"重新加载"
- Workaround: 使用 HTTP 服务器访问（如项目使用的 localhost:8888）
- Fix approach: 检测当前协议是否为 file://，是则跳过 fetch 尝试直接进入提示用户步骤

### 文件类型校验在前端可绕过

- Symptoms: `handleFileSelect()` 通过正则检查文件扩展名（第 583 行），但用户可以修改文件扩展名绕过校验
- Files: `index.html`（第 583 行）
- Impact: 选择非文本文件（如二进制文件）时可能导致 FileReader 行为异常
- Fix approach: 检查文件 MIME type 或尝试读取前几个字节确认文件类型

### empty-state 点击事件可能重复触发

- Symptoms: `.empty-state` 元素绑定 click 事件（第 595 行），但文件选择对话框打开后如果用户取消，empty-state 仍然显示并可再次点击
- Files: `index.html`（第 595 行）
- Impact: 连续快速点击可能导致多个文件选择对话框堆积
- Fix approach: 添加加载状态或按钮禁用逻辑

## 测试覆盖缺口

### 大文件渲染无性能基准

- What's not tested: 超过 1MB 的 Markdown 文件的渲染时间和内存占用
- Files: `index.html`
- Risk: 用户报告"打开大文件时浏览器卡死"但无法复现和定位
- Priority: Medium

### 非 UTF-8 编码文件无覆盖

- What's not tested: GBK、Shift-JIS 等非 UTF-8 编码文件的打开行为
- Files: `index.html`（第 481 行）
- Risk: 中文用户打开旧编码文件时看到乱码，误以为是 bug
- Priority: Medium

### 不同浏览器下的 File System Access API 行为无覆盖

- What's not tested: Chrome/Edge/Opera 等不同 Chromium 浏览器对 File System Access API 的实现差异
- Files: `index.html`（第 549-577 行）
- Risk: 某个 Chromium 版本更新后可能导致 fileHandle 行为变化
- Priority: Low

### XSS 攻击场景无覆盖

- What's not tested: 包含恶意 HTML/JavaScript 的 Markdown 文件的渲染安全性
- Files: `index.html`（第 435-436 行）
- Risk: 用户打开恶意构造的 Markdown 文件时可能执行任意 JavaScript
- Priority: High

---

*Concerns audit: 2026-04-15*
