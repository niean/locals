---
name: scan-logging
description: Reviewer 或治理代码时扫描日志规范
---

# Subskill: 扫描日志规范

## 任务

扫描源代码检查日志使用规范，逐文件读取，输出违规清单。

## 输入

- {files}：文件路径列表（可选）。未提供时扫描默认范围。

## 默认扫描范围

- index.html

## 检查规则

1. 仅在降级场景允许使用console.log（如"不支持 File System Access API，回退到传统方式"）
2. 错误场景必须使用console.error
3. 不得使用console.warn
4. 不得使用console.info
5. 生产代码中不得保留调试用console.log（降级提示除外）

## 已知例外（不视为违规）

- openFileWithAPI()中的console.log('不支持 File System Access API，回退到传统方式') -- 降级场景提示

## 输出格式

```
## 日志规范 扫描结果
违规数量：N
| # | 文件 | 行号 | 违规项 | 建议修复 |
|---|------|------|--------|---------|
未发现违规的检查项：...
```
