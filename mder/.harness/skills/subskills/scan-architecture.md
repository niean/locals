---
name: scan-architecture
description: Reviewer 或治理代码时扫描架构边界
---

# Subskill: 扫描架构边界

## 任务

扫描源代码检查架构边界约束，逐文件读取，输出违规清单。

## 输入

- {files}：文件路径列表（可选）。未提供时扫描默认范围。

## 默认扫描范围

- index.html
- lib/

## 检查规则

1. 所有自定义HTML/CSS/JS代码必须内联在index.html单文件中，不得新建独立的.js或.css文件
2. CSS必须放在head中的style标签内，JavaScript必须放在body底部的script标签内
3. lib/目录仅存放第三方库的压缩版本（.min.js/.min.css），不得包含自定义代码
4. 不得引入模块打包工具（webpack/vite/rollup等）或构建步骤
5. 不得引入CSS预处理器（sass/less等）
6. 不得引入JavaScript框架（React/Vue/Angular等）
7. 第三方库必须通过script/link标签从lib/目录引入，不得使用ES模块import
8. JavaScript函数定义在全局作用域，不使用模块系统

## 已知例外（不视为违规）

（暂无）

## 输出格式

```
## 架构边界 扫描结果
违规数量：N
| # | 文件 | 行号 | 违规项 | 建议修复 |
|---|------|------|--------|---------|
未发现违规的检查项：...
```
