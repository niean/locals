---
name: scan-example
description: Reviewer 或治理代码时扫描{{DIMENSION_NAME}}
---

# Subskill: 扫描{{DIMENSION_NAME}}

## 任务

扫描源代码检查{{DIMENSION_NAME}}约束，逐文件读取，输出违规清单。

## 输入

- {files}：文件路径列表（可选）。未提供时扫描默认范围。

## 默认扫描范围

{{DEFAULT_SCAN_PATHS}}

## 检查规则

{{CHECK_RULES}}

## 输出格式

```
## {{DIMENSION_NAME}} 扫描结果
违规数量：N
| # | 文件 | 行号 | 违规项 | 建议修复 |
|---|------|------|--------|---------|
未发现违规的检查项：...
```
