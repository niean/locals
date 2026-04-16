# Requirements: mder

**Defined:** 2026-04-15
**Core Value:** 打开本地 Markdown 文件，立即看到渲染预览。

## v1 Requirements

### 文件操作

- [x] **FILE-01**: 通过 File System Access API 打开本地 .md/.markdown/.txt 文件
- [x] **FILE-02**: 不支持现代 API 时自动降级为传统 file input
- [x] **FILE-03**: 文件类型限制为 .md、.markdown、.txt
- [x] **FILE-04**: 保存文件句柄以支持重新加载
- [x] **FILE-05**: 点击空白区域可触发打开文件

### Markdown 渲染

- [x] **REND-01**: 使用 marked.js 解析 Markdown 并渲染为 HTML
- [x] **REND-02**: 启用 GFM（GitHub Flavored Markdown）
- [x] **REND-03**: 代码块使用 highlight.js 进行语法高亮
- [x] **REND-04**: 渲染支持标题、段落、列表、表格、代码块、引用、链接、图片、分隔线
- [x] **REND-05**: GitHub 风格排版

### 文件信息

- [x] **INFO-01**: 渲染后展示文件路径
- [x] **INFO-02**: 渲染后展示文件行数
- [x] **INFO-03**: 渲染后展示文件大小
- [x] **INFO-04**: 渲染后展示最后修改时间

### 交互体验

- [x] **UX-01**: 空状态引导区显示操作提示
- [x] **UX-02**: 空状态引导区点击可触发打开文件
- [x] **UX-03**: 支持重新加载当前文件内容
- [x] **UX-04**: 移动端响应式适配（max-width: 768px）

### 非功能

- [x] **NFR-01**: 纯前端实现，无后端依赖
- [x] **NFR-02**: 单 HTML 文件 + lib/ 目录第三方库
- [x] **NFR-03**: 项目访问地址 http://localhost:8888/mder/

## v2 Requirements

### 代码治理

- **GOV-01**: JS 代码按 Airbnb JavaScript Style Guide 规范改造
- **GOV-02**: CSS 按 ITCSS 架构 + BEM 命名规范改造

### 渲染增强

- **ENH-01**: 改善 Markdown 渲染质量与排版体验

## v1.1 Requirements

### Empty State

- [x] **ES-01**: 仅点击 empty-state 区域触发文件选择器，点击工作区其它区域不触发
- [x] **ES-02**: empty-state 居中显示在工作区中部

## Out of Scope

| Feature | Reason |
|---------|--------|
| Markdown 编辑器 | 产品定位为预览工具，不做编辑 |
| 在线协作 | 本地优先，不引入后端 |
| 文件管理器/目录浏览 | 只做单文件预览 |
| 格式转换（Markdown 转 PDF） | 不在产品定位范围内 |
| 用户注册/登录 | 不需要账户体系 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FILE-01 | Phase 0 (Existing) | Complete |
| FILE-02 | Phase 0 (Existing) | Complete |
| FILE-03 | Phase 0 (Existing) | Complete |
| FILE-04 | Phase 0 (Existing) | Complete |
| FILE-05 | Phase 0 (Existing) | Complete |
| REND-01 | Phase 0 (Existing) | Complete |
| REND-02 | Phase 0 (Existing) | Complete |
| REND-03 | Phase 0 (Existing) | Complete |
| REND-04 | Phase 0 (Existing) | Complete |
| REND-05 | Phase 0 (Existing) | Complete |
| INFO-01 | Phase 0 (Existing) | Complete |
| INFO-02 | Phase 0 (Existing) | Complete |
| INFO-03 | Phase 0 (Existing) | Complete |
| INFO-04 | Phase 0 (Existing) | Complete |
| UX-01 | Phase 0 (Existing) | Complete |
| UX-02 | Phase 0 (Existing) | Complete |
| UX-03 | Phase 0 (Existing) | Complete |
| UX-04 | Phase 0 (Existing) | Complete |
| NFR-01 | Phase 0 (Existing) | Complete |
| NFR-02 | Phase 0 (Existing) | Complete |
| NFR-03 | Phase 0 (Existing) | Complete |
| GOV-01 | Phase 1 | Complete |
| GOV-02 | Phase 1 | Complete |
| ENH-01 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 21 total (all Complete)
- v2 requirements: 3 total (GOV-01, GOV-02 Complete; ENH-01 Pending)
- v1.1 requirements: 2 total (defining)
- Unmapped: 0 (all mapped)

---

*Requirements defined: 2026-04-15*
*Last updated: 2026-04-16 — v1.1 added*
