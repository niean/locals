# mder

## What This Is

浏览器端的轻量级 Markdown 文件渲染工具 — 零配置、即开即用。用户通过浏览器打开 index.html，选择本地 .md/.markdown/.txt 文件，立即以 GitHub 风格渲染并展示，支持代码语法高亮和文件元信息查看。

## Core Value

打开本地 Markdown 文件，立即看到渲染预览。

## Requirements

### Validated

- ✓ 通过 File System Access API 打开本地文件 — 已实现
- ✓ 不支持现代 API 时自动降级为传统 file input — 已实现
- ✓ 支持 .md、.markdown、.txt 文件类型 — 已实现
- ✓ 使用 marked.js 解析 Markdown 并渲染为 HTML — 已实现
- ✓ 使用 highlight.js 对代码块进行 GitHub 风格语法高亮 — 已实现
- ✓ 渲染结果包含标题、段落、列表、表格、代码块、引用、链接、图片 — 已实现
- ✓ 渲染后展示文件元信息（路径、行数、大小、修改时间）— 已实现
- ✓ 支持重新加载当前文件内容 — 已实现
- ✓ 空状态引导区点击可触发打开文件 — 已实现
- ✓ 移动端响应式适配 — 已实现

### Active

- [ ] 代码治理：按 Airbnb JS 风格 + ITCSS/BEM CSS 规范改造现有代码
- [ ] 渲染增强：改善 Markdown 渲染质量与排版体验

### Out of Scope

- Markdown 编辑器功能 — 产品定位为预览工具，不做编辑
- 在线协作 — 本地优先，不引入后端
- 文件管理器 — 不浏览目录，只做单文件预览
- 格式转换（如 Markdown 转 PDF）— 定位不在这里
- 用户注册/登录 — 不需要

## Context

- 单文件架构：index.html 包含全部 HTML/CSS/JS，无构建工具
- 第三方库：marked.js v12.0.0、highlight.js v11.9.0，存放在 lib/ 目录
- 项目通过父目录 HTTP 服务访问：http://localhost:8888/mder/
- 已完成 codebase map（.planning/codebase/ 7 份文档）
- 项目使用 Harness 框架（.harness/ 目录）进行任务编排
- 最近的改动：滤镜功能（2026-04-15）、位移 Bug 修复、左侧工具栏展开

## Constraints

- **[Tech]**: HTML5 + CSS3 + 原生 JS（ES6+），不使用框架或构建工具 — 保持零依赖、零构建
- **[Architecture]**: 单 HTML 文件架构，第三方库放 lib/ — 保持轻量
- **[Browser]**: 兼容 Chrome/Safari/Firefox/Edge 最新版 — 现代浏览器

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 单文件架构 | 保持零配置、零构建的简单性 | — Pending |
| 本地文件访问 | File System Access API + 传统 file input 降级 | ✓ Good |
| marked.js + highlight.js | 成熟、稳定、满足 GFM 渲染 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-15 after initialization*
