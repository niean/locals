<!-- SUMMARY: 项目顶级规范：JS遵循Airbnb Style Guide，CSS遵循ITCSS+BEM；编码/UI/质量/安全约定，HTML5+CSS3+原生JS -->
# 约定与约束（实现细节）

本文件是项目规范约定的权威来源，AGENTS.md "二、项目规范"各节为摘要引用，以本文件为准。

---

# 一、UI交互约定

- UI语言：中文
- 配色方案：主色渐变 #667eea -> #764ba2（header和body背景），内容区白色背景
- 交互反馈：按钮hover有过渡动画（transition: all 0.3s），错误信息使用红色左边框卡片
- 空状态：居中显示图标和提示文字，引导用户操作
- 文件信息：渲染完成后在底部右对齐显示文件路径、行数、大小、修改时间

---

# 二、编码约定

## 图片尺寸

不适用（当前项目不涉及图片资源管理）

## HTML/CSS/JS内联约定

- 所有自定义代码写在index.html单文件中
- CSS放在head中的style标签内
- JavaScript放在body底部的script标签内
- 第三方库通过script/link标签从lib/目录引入

## JavaScript风格（Airbnb Style Guide）

- 函数定义使用const箭头函数表达式（`const fn = () => {}`），不使用function声明
- 变量声明使用const/let，禁止var
- 字符串拼接使用模板字面量（反引号），不使用+拼接
- 多行对象/数组添加尾逗号（trailing comma）
- 事件绑定使用addEventListener，禁止HTML内联事件属性（onclick/onchange）
- 魔法数字提取为命名常量（如BYTES_PER_KB）

## CSS架构（ITCSS + BEM）

- CSS按ITCSS分层组织，层间以注释分隔：Generic（重置）-> Elements（基础元素）-> Components（组件）
- 自定义组件类名遵循BEM命名：`.block__element--modifier`
- @media查询紧跟对应组件定义，不集中放在文件末尾
- 例外：.markdown-content内部使用后代标签选择器（marked.js生成的HTML无自定义class）

## 本地化

- 所有用户可见文案使用中文（按钮文字、提示信息、错误消息等）
- 日期时间格式使用zh-CN locale（toLocaleDateString/toLocaleTimeString）
- 文件大小单位使用英文缩写（B/KB/MB）

## 字体

- 正文字体栈：-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif
- 代码字体栈：'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace

## 常量

- 无独立常量文件
- marked.js配置项（highlight函数、breaks、gfm）在script标签顶部通过marked.setOptions()设置

## 禁止 Mock 造假

不适用（无自动化测试框架）

---

# 三、质量约定

## 编译

- 无编译步骤，浏览器直接解析HTML/CSS/JS
- 验证方式：在浏览器中打开index.html，确认控制台零错误零警告

## 错误处理

- 文件读取失败时调用showError()显示用户友好的错误提示
- Markdown渲染失败时try-catch捕获并显示错误信息
- File System Access API不支持时自动降级为传统file input
- 用户取消文件选择时（AbortError）静默处理，不显示错误

## 日志

- 仅在降级场景使用console.log（如"不支持 File System Access API，回退到传统方式"）
- 错误场景使用console.error
- 不使用console.warn或console.info
- 生产代码中不保留调试用console.log

## 线程与并发

- 单线程（浏览器主线程），无Web Worker使用
- 文件读取使用FileReader异步API或File System Access API的async/await
- 无并发文件操作，一次只处理一个文件

## 内存与性能

- 每次渲染新文件时覆盖前一次的DOM内容（innerHTML赋值），无内存泄漏风险
- 不缓存已渲染的文件内容
- 大文件由marked.js和highlight.js库自行处理，无额外性能优化

## 单元测试

- 无自动化测试框架
- 验证方式：在浏览器中手动打开不同格式的Markdown文件，检查渲染结果

## 代码扫描

- 通过Harness Subskills进行安全扫描和代码质量扫描

---

# 四、文件管理约定

- index.html：唯一应用文件，所有修改集中于此
- lib/：第三方库目录，手动管理，不通过包管理工具
- 不创建新的JS/CSS文件，保持单文件架构
- 文件编码统一UTF-8

---

# 五、安全约定

- Markdown渲染依赖marked.js内置安全机制
- 文件操作仅通过用户主动选择触发，不自动访问文件系统
- 禁止使用eval()、Function()构造函数
- innerHTML仅用于插入marked.js渲染后的HTML（已经过库内部处理）
- 不在localStorage/sessionStorage/cookie中存储用户数据
- 不发起网络请求（除非通过fetch重新加载已知路径的文件）
