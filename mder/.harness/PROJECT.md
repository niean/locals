# PROJECT.md -- mder

浏览器端Markdown文件渲染工具。纯前端单文件应用，支持打开并渲染.md/.markdown/.txt文件，提供语法高亮和GitHub风格排版。

---

# Harness 框架适配

本节为 Harness 框架提供项目级配置，框架文件通过 `.harness/PROJECT.md` 直接引用。

## 知识库目录

首次加载时需建立 SUMMARY 索引的目录：
- `.harness/knowledge/`
- `.harness/prd/`（除 .harness/prd/03-prd-specs.md）
- `.harness/lessons/`

## 任务类型加载矩阵

首次加载时，根据任务类型选择性读取知识库文件（所有文件首行 SUMMARY 始终必读）：

| 任务类型 | 必读（完整读取） | 按需读取 |
|---------|----------------|---------|
| 功能需求 | .harness/knowledge/01-overview.md, .harness/knowledge/02-architecture.md, .harness/knowledge/22-file-map.md, .harness/prd/01-prd-sense.md, .harness/prd/02-prd-baseline.md | .harness/knowledge/03-conventions.md, .harness/knowledge/04-data-boundaries.md, .harness/knowledge/05-key-patterns.md, .harness/knowledge/21-glossary.md |
| 精调功能 | .harness/knowledge/01-overview.md, .harness/knowledge/22-file-map.md | .harness/knowledge/02-architecture.md, .harness/knowledge/03-conventions.md, .harness/knowledge/04-data-boundaries.md, .harness/knowledge/05-key-patterns.md, .harness/knowledge/21-glossary.md |
| Bug修复 | .harness/knowledge/01-overview.md, .harness/knowledge/03-conventions.md, .harness/knowledge/22-file-map.md | .harness/knowledge/02-architecture.md, .harness/knowledge/04-data-boundaries.md, .harness/knowledge/05-key-patterns.md, .harness/knowledge/21-glossary.md |
| 治理/扫描 | .harness/knowledge/01-overview.md, .harness/knowledge/03-conventions.md, .harness/knowledge/22-file-map.md | .harness/knowledge/02-architecture.md, .harness/knowledge/05-key-patterns.md |
| 文档维护 | .harness/knowledge/01-overview.md, .harness/knowledge/22-file-map.md | 读取目标文件引用链上的 knowledge/ 和 prd/ 文件 |

## 知识回填文件映射

知识回填的回填目标：
- 架构变化 -> .harness/knowledge/02-architecture.md
- 新术语 -> .harness/knowledge/21-glossary.md
- 数据结构/存储变化 -> .harness/knowledge/04-data-boundaries.md
- 新源文件 -> .harness/knowledge/22-file-map.md
- 新跨文件模式 -> .harness/knowledge/05-key-patterns.md
- 产品方向调整 -> 提示用户，人工更新 .harness/prd/01-prd-sense.md

## 教训库加载路径

本项目教训库分布在两个位置：
- `.harness/framework/lessons/general.md`（Harness 通用教训）
- `.harness/lessons/project.md`（项目教训）

## 构建与测试

### 构建
```bash
# 父目录已启动 HTTP 服务（端口 8888），浏览器访问：
# http://localhost:8888/mder/
```

### 单元测试
单元测试执行策略：
- 用户明确要求时：必须执行
- 无自动化测试框架，通过浏览器手动验证
- 其他场景：跳过

```bash
# 无自动化测试命令
```

## 扫描维度

代码扫描使用的维度及规则来源。下表路径均相对于 `.harness/knowledge/` 目录：

| # | 维度 | 规则来源 |
|---|------|---------|
| 1 | 架构边界 | 02-architecture.md 全文 |
| 2 | 编码约定 | 03-conventions.md 全文 |
| 3 | 安全规范 | 03-conventions.md "安全规范"章节 |
| 4 | 代码质量 | 03-conventions.md "质量守护"章节 |

可选（涉及文件删除时）：

| # | 维度 | 规则来源 |
|---|------|---------|

## 项目知识索引

| 文件 | 何时查阅 |
|------|---------|
| .harness/prd/01-prd-sense.md | 功能迭代前，确认产品定位和判断准则 |
| .harness/knowledge/01-overview.md | 任务开始时，了解项目概览（技术栈/入口/核心流程） |
| .harness/knowledge/02-architecture.md | 涉及模块新增、跨层调用时 |
| .harness/knowledge/03-conventions.md | 涉及编码/UI/质量/安全约定细节时 |
| .harness/knowledge/04-data-boundaries.md | 涉及数据结构、存储格式时 |
| .harness/knowledge/05-key-patterns.md | 实现跨模块协作模式时 |
| .harness/knowledge/21-glossary.md | 对术语不清楚时 |
| .harness/knowledge/22-file-map.md | 确定功能对应源文件时 |
| .harness/prd/02-prd-baseline.md | 确认功能需求与产品约束时 |
| .harness/lessons/project.md | 用户指令或当前根因与 SUMMARY 高度相关时按需读取 |

---

# 项目规范

## 代码生成

以下各节（代码生成、架构边界、质量守护、安全规范）为快速参考摘要，权威定义见 .harness/knowledge/03-conventions.md。

- 语言：HTML5 + CSS3 + 原生JavaScript（ES6+），不使用框架或构建工具
- JS规范：遵循 Airbnb JavaScript Style Guide（const箭头函数、模板字面量、addEventListener、trailing comma等）
- CSS规范：遵循 ITCSS 架构（Generic/Elements/Components分层）+ BEM 命名（.block__element--modifier）
- 所有代码内联在单个HTML文件中（index.html），CSS写在style标签内，JS写在script标签内
- 第三方库以min.js/min.css形式放在lib/目录，通过script/link标签引入
- UI文案使用中文
- 保持代码简洁，不引入不必要的抽象层

## 架构边界

- 单文件架构：index.html 是唯一的应用文件，包含HTML结构、CSS样式、JavaScript逻辑
- lib/ 目录仅存放第三方压缩库文件，不放自定义代码
- 浏览器API依赖：File System Access API（现代浏览器）+ 传统file input（降级方案）
- 不引入Node.js、npm或任何构建工具链

## 质量守护

- 浏览器控制台零错误零警告
- 兼容现代浏览器（Chrome、Safari、Firefox、Edge最新版）
- 移动端响应式适配（已有@media查询）
- 文件操作必须有错误处理和用户提示

## 安全规范

- Markdown渲染使用marked.js库，依赖其内置的安全处理
- 文件读取仅通过用户主动选择（File System Access API或file input），不自动读取任意文件
- 不使用eval()或innerHTML注入未经处理的用户输入
- 不在客户端存储敏感信息

---

# 项目附录

## 仓库结构

```
AGENTS.md              -- AI 入口（纯路由）
CLAUDE.md              -- Claude Code 入口
.harness/
  PROJECT.md           -- 项目规范入口（本文件）
  framework/           -- 通用能力（详见 FRAMEWORK.md "Framework 目录结构"）
  knowledge/           -- AI 知识库（01~05 认知约束类, 21~22 工具索引类）
  prd/                 -- 产品文档（AI只读：01-prd-sense、02-prd-baseline、03-prd-specs）
  lessons/
    project.md         -- 项目教训（AI自主维护）
  specs/               -- 设计文档
    active/
    completed/
  plans/               -- 实现计划
    active/
    completed/
    debt-tracker.md    -- 技术债追踪
index.html              -- 主应用文件（单HTML文件，包含全部HTML/CSS/JS）
lib/
  marked.min.js        -- Marked.js Markdown解析库
  highlight.min.js     -- Highlight.js 语法高亮库
  github.min.css       -- GitHub风格代码高亮样式
locals/                -- 本地敏感配置
```

## 知识层级关系

```
Layer 0   AGENTS.md -> FRAMEWORK.md（通用规范+注册表） + PROJECT.md（项目配置+规则摘要）
Layer 1   framework/agents/（5个角色: Orchestrator/Designer/Planner/Coder/Reviewer）
Layer 1.5 framework/workflows/（迭代功能/修复Bug/迭代文档 + harness-ops/治理类）
Layer 2   framework/skills/（harness/ 核心Skill + harness-ops/ 运维Skill + superpowers/ 方法论）
Layer 3   framework/skills/harness/subskills/（扫描模板）
数据层    knowledge/（权威知识） + prd/（产品文档，AI只读） + guides/（方法论） + lessons/（教训）
辅助层    specs/（设计文档） + plans/（执行计划+技术债）
```

引用方向：Layer 0 -> Layer 1/1.5 -> Layer 2 -> Layer 3 -> 数据层。PROJECT.md 摘要引用 knowledge/03-conventions.md（权威源）。
