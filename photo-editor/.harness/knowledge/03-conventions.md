# 编码约定

本文件是项目编码约定的权威定义。AGENTS.md 中的代码生成、架构边界、质量守护、安全规范各节为本文的快速参考摘要。

## 代码生成

- JavaScript: Airbnb JavaScript Style Guide（const 优先、单引号、尾逗号、2 空格缩进、分号）
- ES6 Modules: import/export，script type=module
- 类名 PascalCase，变量/函数 camelCase，常量 UPPER_SNAKE_CASE
- 零外部依赖

## 架构边界

- 工具层只通过 canvas/state/history 模块访问画布和状态
- main.js 是唯一的模块组装点
- utils/ 应避免 DOM 操作（当前 file.js 有例外，见 DEBT-002）
- CSS 文件按 ITCSS 层级组织，@import 顺序不可变

## UI 约定

- CSS: ITCSS 分层 + BEM 命名
- 组件前缀: c-（组件）、o-（对象/布局）、u-（工具类）
- 状态类: is-active, is-visible
- 所有尺寸/颜色使用 CSS Custom Properties
- 深色主题，颜色定义在 _variables.css

## 质量守护

- 无构建系统，通过 node --check 验证 JS 语法
- 浏览器测试需启动本地服务器：python3 -m http.server 8888，访问 http://localhost:8888

## 安全规范

- innerHTML 使用需确保插入值来自受约束的输入（select/number/color）
- 文件上传仅接受 image/jpeg, image/png, image/webp
- 所有图片通过 FileReader data URL 加载（同源安全）
