---
name: scan-conventions
description: Reviewer 或治理代码时扫描编码约定
---

# Subskill: 扫描编码约定

## 任务

扫描源代码检查编码约定，逐文件读取，输出违规清单。

## 输入

- {files}：文件路径列表（可选）。未提供时扫描默认范围。

## 默认扫描范围

- index.html

## 检查规则

### JavaScript风格（Airbnb Style Guide）

1. 函数定义必须使用const箭头函数表达式（`const fn = () => {}`），不使用function声明
2. 变量声明必须使用const/let，禁止var
3. 字符串拼接必须使用模板字面量（反引号），不使用+拼接
4. 多行对象/数组必须添加尾逗号（trailing comma）
5. 事件绑定必须使用addEventListener，禁止HTML内联事件属性（onclick/onchange）
6. 魔法数字必须提取为命名常量（如BYTES_PER_KB）

### CSS架构（ITCSS + BEM）

7. CSS必须按ITCSS分层组织，层间以注释分隔：Generic（重置）-> Elements（基础元素）-> Components（组件）
8. 自定义组件类名必须遵循BEM命名：`.block__element--modifier`
9. @media查询必须紧跟对应组件定义，不集中放在文件末尾
10. .markdown-content内部允许使用后代标签选择器（marked.js生成的HTML无自定义class）

### 本地化

11. 所有用户可见文案必须使用中文（按钮文字、提示信息、错误消息等）
12. 日期时间格式必须使用zh-CN locale（toLocaleDateString/toLocaleTimeString）
13. 文件大小单位使用英文缩写（B/KB/MB）

### 字体

14. 正文字体栈必须为：-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif
15. 代码字体栈必须为：'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace

## 已知例外（不视为违规）

- .markdown-content内部使用后代标签选择器 -- marked.js生成的HTML无自定义class

## 输出格式

```
## 编码约定 扫描结果
违规数量：N
| # | 文件 | 行号 | 违规项 | 建议修复 |
|---|------|------|--------|---------|
未发现违规的检查项：...
```
