---
name: scan-code-quality
description: Reviewer 或治理代码时扫描代码质量
---

# Subskill: 扫描代码质量

## 任务

扫描源代码检查代码质量约束，逐文件读取，输出违规清单。

## 输入

- {files}：文件路径列表（可选）。未提供时扫描默认范围。

## 默认扫描范围

- index.html

## 检查规则

1. 不得有未使用的变量或函数（死代码）
2. 不得有调试用的console.log残留（降级提示和console.error除外）
3. 所有异步操作（FileReader、File System Access API、fetch）必须有错误处理
4. 不得有重复的CSS选择器定义
5. 不得有重复的JavaScript函数定义
6. HTML中不得有未闭合的标签
7. CSS属性不得有浏览器兼容性问题（针对目标浏览器：Chrome/Safari/Firefox/Edge最新版）
8. JavaScript变量声明应使用const/let，不使用var
9. 不得有硬编码的魔术数字（应提取为有意义的变量名或注释说明用途）
10. 事件监听器应正确清理（如有动态添加的情况）

## 已知例外（不视为违规）

- marked.setOptions中的highlight回调内的空catch块 -- 故意静默处理高亮失败，降级为自动检测
- outputTitleEl变量引用的DOM元素在当前版本HTML中不存在 -- 历史兼容代码，通过条件判断保护

## 输出格式

```
## 代码质量 扫描结果
违规数量：N
| # | 文件 | 行号 | 违规项 | 建议修复 |
|---|------|------|--------|---------|
未发现违规的检查项：...
```
