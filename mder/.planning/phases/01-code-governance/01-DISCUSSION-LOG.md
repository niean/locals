# Phase 1: Code Governance - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-15
**Phase:** 01-code-governance
**Areas discussed:** Refactoring Approach, Emoji Handling, JavaScript Module Structure

---

## Refactoring Approach

| Option | Description | Selected |
|--------|-------------|----------|
| 一次性全部改完 | 所有改动在一个批次中完成，风险高但速度快，适合小代码库 | ✓ |
| 分CSS+JS两批改 (推荐) | 先改CSS（验证无回归），再改JS。分批提交，每批可独立验证 | |
| 按函数逐个改 | 每个函数独立修改和验证，最安全但最慢 | |

**User's choice:** 一次性全部改完
**Notes:** Codebase is small (598 lines), user prefers speed over incremental safety.

## Emoji Handling

| Option | Description | Selected |
|--------|-------------|----------|
| 保留现状 | HTML中的emoji保持不变 | |
| 全部移除 | 用图标或纯文字替代，代码更规范 | ✓ |
| 保留并规范化 | 保留emoji但提取为JS常量统一管理 | |

**User's choice:** 全部移除emoji from HTML and JS
**Notes:** Replace with plain Chinese text labels.

## JavaScript Module Structure

| Option | Description | Selected |
|--------|-------------|----------|
| 保持现状 | 函数和变量都在全局作用域 | |
| 加IIFE包裹 (推荐) | 用立即执行函数包裹全部JS代码，避免全局变量污染 | ✓ |
| 改用ES6 module | 使用 `<script type="module">`，改变文件加载行为 | |

**User's choice:** 加IIFE包裹
**Notes:** Wrap all JS in IIFE, state variables become closure-scoped, event listeners bound inside IIFE.

---

## Claude's Discretion

- Exact trailing comma placement within Airbnb rules
- Whether to add JSDoc comments
- Media query organization

## Deferred Ideas

None.
