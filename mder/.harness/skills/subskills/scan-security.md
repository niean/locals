---
name: scan-security
description: Reviewer 或治理代码时扫描安全
---

# Subskill: 扫描安全

## 任务

扫描源代码检查安全约束，逐文件读取，输出违规清单。

## 输入

- {files}：文件路径列表（可选）。未提供时扫描默认范围。

## 默认扫描范围

- index.html

## 检查规则

1. 禁止使用eval()、Function()构造函数执行动态代码
2. innerHTML赋值前必须经过marked.js处理，不能直接插入用户输入
3. 不得在localStorage/sessionStorage/cookie中存储用户数据
4. 不得发起未经用户触发的网络请求
5. 文件读取必须通过用户主动选择（File System Access API或file input），不得自动访问文件系统
6. 不得使用document.write()
7. 第三方库引入不得使用外部CDN链接（必须本地lib/目录）
8. 事件处理函数中不得执行字符串拼接的JavaScript代码

## 已知例外（不视为违规）

- marked.parse()返回值通过innerHTML插入DOM -- 已经过marked.js库内部安全处理
- showError()函数中使用innerHTML -- 内容为固定模板字符串拼接错误消息文本

## 输出格式

```
## 安全 扫描结果
违规数量：N
| # | 文件 | 行号 | 违规项 | 建议修复 |
|---|------|------|--------|---------|
未发现违规的检查项：...
```
