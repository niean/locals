# AGENTS.md -- PhotoEditor

PhotoEditor -- 本地化图片编辑器，纯 HTML+CSS+JS 实现。由于使用 ES6 Modules，需通过本地服务器访问（如 python3 -m http.server 8888）。支持裁剪、画笔、文字标注、马赛克、形状（箭头/矩形）五种编辑工具。

---

# 一、通用规范（项目无关）

## 流程合规

### 任务执行入口（AI-READONLY）

任务开始时首先进行 任务分类和Skill路由（新 Task 或同一 Task 内的第 2+ 次迭代均需分类），必须立即执行以下步骤，禁止跳过：

1. 任务分类：判断任务类型。优先匹配：用户明确指定已注册 Skill 名称（如"治理代码"等）时，直接路由到对应 Skill，跳过步骤 2-3。否则：功能需求或修改代码 -> `Skill: 迭代功能`，Bug修复或异常行为修复 -> `Skill: 修复Bug`，修改文档需求 -> `Skill: 迭代Harness文档`，其它任务按需路由到已注册 Skill 或直接执行
2. 读取 Skill 定义：立即读取对应的 Skill 文件（如 `.harness/skills/iterate-feature.md`）
3. 遵循 Skill 流程：按 Skill 文件定义的 Phase 顺序执行；特别强调，`[GATE]` 标记的 Phase 必须在消息框展示意图、等待人工确认，否则禁止执行后续 Phase

执行约束：
- 必须先读取 Skill 定义，再开始代码实现
- 必须按 Skill 文件定义的 Phase 顺序完整执行，不跳过、不简化、不改编、不拆分、不合并
- 必须遵守 `[GATE]` 门禁（见下方 GATE 规则），在 GATE 点等待用户确认后再继续
- 必须按 Phase 定义的消息输出格式输出，不简化、不改动
- superpowers 插件（形如 `superpowers:skill-x`）仅在用户明确指令时调用，不主动调起


### Phase 门禁（GATE）规则（AI-READONLY）

- `[GATE]` 标记的 Phase 结束后，必须立即结束当前回复，使用 `AskUserQuestion` 工具向用户请求确认；禁止在同一条回复中继续后续 Phase
- `[GATE]` Phase 收到用户修正时：更新内容后必须重新输出完整摘要并重走 GATE 确认流程；用户修正 ≠ 用户确认，禁止将修正视为确认直接进入后续 Phase
- `[GATE-ENTRY]` 标记的 Phase 开始前，必须执行前置条件检查：(1) 上一条用户消息包含明确确认（如"确认""Yes""ok""继续"等），(2) 前置 GATE Phase 不在当前回复中输出。任一条件不满足则停止并提示用户
- 当前 GATE 点：迭代功能 Phase 2 -> Phase 3, 迭代Harness文档 Phase 2 -> Phase 3
- 非 GATE Phase 禁止使用 `AskUserQuestion` 等待用户确认后再继续后续 Phase；AI 应按 Skill 定义自主推进流程


### 受保护章节规则（AI-READONLY）

- 标记为 `AI-READONLY` 的章节，AI 发现其内容存在问题时只能以消息方式提示用户；AI 不得自动修改，也不得索要用户确认后代为修改（防止误授权）

### 消息输出格式（AI-READONLY）

任务开始时声明类型和架构，每个 Phase 使用标题 + 角色标注 + 正文的三行结构。格式如下：

```
任务类型：功能需求；调度架构：多Agent

## Phase 1: 任务调度
[Agent: Orchestrator]
正文内容...

## Phase 4: 代码审查
[Agent: Reviewer (subagent)]
正文内容...
```

- 同一 Task 内第 2+ 次迭代，声明追加：`同一 Task 内第 N 次迭代`
- Phase 名称严格对齐 Skill 定义
- 约束类术语（"硬性门禁""流程违规"等）不输出到用户消息框


## Agents（角色 Agent）

Skill 定义"做什么"，Agent 定义"谁来做"。多 Agent Skill 的每个 Phase 指定执行角色，Phase 间通过"检查点摘要"（不超过 10 行）交接上下文。详细定义见 `.harness/agents/` 目录。

| Agent | 运行形态 | 模板文件 | 职责 |
|-------|---------|---------|------|
| Orchestrator | 主 Agent | .harness/agents/orchestrator.md | 任务路由、流程编排、上下文管理 |
| Designer | 主 Agent | .harness/agents/designer.md | 需求探索、方案设计、spec 产出 |
| Planner | 主 Agent | .harness/agents/planner.md | 计划拆分、plan 产出 |
| Coder | subagent + 主 Agent | .harness/agents/coder.md | 代码实现 |
| Reviewer | subagent + 主 Agent | .harness/agents/reviewer.md | 代码扫描、构建验证、验收 |

## Skills（可复用操作）

触发后读取对应文件、按步骤执行。详细定义见 `.harness/skills/` 目录。

| Skill | 触发 | 文件 |
|-------|------|------|
| 迭代功能 | 人工下发功能需求或修改代码 | .harness/skills/iterate-feature.md |
| 修复Bug | 人工下发Bug修复或异常行为修复需求 | .harness/skills/fix-bug.md |
| 回填知识库 | 人工指令 | .harness/skills/harness-ops/backfill-knowledge.md |
| 从教训回填知识库 | 人工指令 | .harness/skills/harness-ops/backfill-knowledge-from-lessons.md |
| 回填产品文档 | 人工指令 | .harness/skills/harness-ops/backfill-prd.md |
| 迭代Harness文档 | 人工下发修改文档需求 | .harness/skills/iterate-harness-docs.md |
| 治理代码 | 人工指令 | .harness/skills/harness-ops/governance-code.md |
| 验证构建 | 功能迭代完成后自动执行，或人工指令 | .harness/skills/verify-build.md |
| 治理技能 | 人工指令 | .harness/skills/harness-ops/governance-capability.md |
| 提取Harness模板 | 人工指令 | .harness/skills/harness-ops/extract-harness-tpl.md |
| 治理全部 | 人工指令 | .harness/skills/harness-ops/governance-all.md |
| 总结任务 | AI自动触发（任务完成后） | .harness/skills/summarize-task.md |

自动触发：标注"AI自动触发"的 Skill 必须在对应时机自动执行。当前仅 Skill: 总结任务（适用于按迭代功能或修复Bug完整流程执行的任务）。

## Subskills（并行扫描任务）

通过 `use_subagents` 启动，各自独立上下文窗口，由 Reviewer 或 Skill 按需调用。详细定义见 `.harness/skills/subskills/` 目录。

| Subskill | 文件 | 调用方 |
|----------|------|--------|
| (模板示例) scan-example | .harness/skills/subskills/scan-example.md | Reviewer Step 1, 治理代码 Phase 2 |

## 文件与文档

- 禁止主动创建 README；不删除项目文件
- 文件名：小写英文 kebab-case，动词-名词 语序（如 governance-code）；标题和描述使用中文，同样动词-名词 语序
- 命名语言约定：Agent 名称使用英文（Orchestrator、Reviewer）；Skill/Subskill 显示名使用中文（迭代功能、扫描架构边界）、文件名使用英文 kebab-case；消息输出中角色标注使用英文（`[Agent: Orchestrator]`）
- AI 只读目录（修改前必须人工确认）：.harness/agents/、.harness/prd/、.harness/guides/
- prd/ 与 knowledge/ 知识库冲突时，提示用户确认
- 文档禁用 emoji/加粗/斜体，使用普通文字
- 执行计划文件管理详见"执行计划管理"章节
- 引用方向自上而下，下层不反向引用上层具体定义（详见 .harness/guides/00-harness-desc.md 3.4 节）
- .harness/ 下引用项目文件路径时，使用项目根目录相对路径，不使用绝对路径

## 命令执行

- 命令行超过 10 行时，必须先将脚本写入 `locals/harness_tmp/` 再执行，防止 Terminal 异常阻塞流程
- `locals/harness_tmp/` 由 AI 自主维护（创建、清理均无需用户确认），已在 `.gitignore` 覆盖范围内

## 上下文管理

- 首次加载（Task 首条消息）分层加载知识库：
  1. 必读：读取 `.harness/knowledge/`、`.harness/prd/`（除 03-prd-specs.md）和 `.harness/lessons/` 每个文件的首行 `<!-- SUMMARY: ... -->` 注释，建立全局索引
  2. 必读：完整读取 `01-overview.md`（项目概览）+ `22-file-map.md`（文件映射）
  3. 按需：根据任务类型完整读取相关文件（见下方"任务类型加载矩阵"）
- 后续迭代（同一 Task 内），按需查阅 `.harness/knowledge/` 和 `.harness/prd/`，不重复加载已知内容，因为每类知识有且只有一个归属文档、不重复维护
- 多步任务：每步完成压缩为检查点摘要（见下方"检查点摘要模板"），后续只携带摘要；每步只加载必需文件
- 所有步骤均为必选项，禁止因上下文压力跳过；上下文紧张时先压缩已有内容再继续
- 委派产出（subagent、跨 Phase 交接）：产出结构化结论（表格、要点），不搬运原文；需要完整内容时直接读取源文件
- 产出超限时：缩小单次任务范围或拆分为多个子任务，不重试相同范围
- 各 Skill 如有更具体的上下文管理要求，以 Skill 文件为准

### 任务类型加载矩阵

首次加载时，根据任务类型选择性读取知识库文件（所有文件首行 SUMMARY 始终必读）：

| 任务类型 | 必读（完整读取） | 按需读取 |
|---------|----------------|---------|
| 功能需求 | 01-overview, 02-architecture, 22-file-map, 01-prd-sense, 02-prd-baseline | 03-conventions, 04-data-boundaries, 05-key-patterns, 21-glossary |
| Bug修复 | 01-overview, 03-conventions, 22-file-map | 02-architecture, 04-data-boundaries, 05-key-patterns, 21-glossary |
| 治理/扫描 | 01-overview, 03-conventions, 22-file-map | 02-architecture, 05-key-patterns |
| 文档维护 | 01-overview, 22-file-map | 按涉及文档内容按需读取 |

### 检查点摘要模板

Phase 间交接使用结构化检查点摘要（不超过 10 行），标准格式：

```
[Phase N: 名称] 目标: {一句话}; 产出: {文件/决策}; 变更: {file1(修改), file2(新增)}; 状态: {完成/部分完成}; 后续依赖: {下一Phase需要的关键信息}
```

各 Skill 可在此模板基础上定义更具体的字段（如 iterate-feature 的 scope/tasks 字段），但必须保持单行格式、不超过 10 行。

## 执行计划管理

AI 通过 `.harness/specs/` 和 `.harness/plans/` 自主管理设计文档和实现计划（目录结构见"仓库结构"）。

### Spec 与 Plan

- Spec 命名：`spec-{YYMMDD}-{desc}.md`，模板见 `.harness/skills/superpowers/brainstorming.md`
- Plan 命名：`plan-{YYMMDD}-{desc}.md`，模板见 `.harness/skills/superpowers/writing-plans.md`
- Spec 触发：用户显式要求，或影响 3+ 模块/涉及新模块创建时建议产出；小型需求可省略 spec 直接创建 plan
- Spec 是一次性产物，实现完成后持久性知识通过 Phase 5 回填 knowledge/
- 同一窗口内第 2+ 次迭代复用同一计划文件

### 生命周期

同一 Task 允许 1 spec + 1 plan；不同 Task 的文件可在 active/ 中并行。

| 阶段 | 操作 | 规则 |
|------|------|------|
| Phase 1 任务调度 | 检测 active/ | 有则复用；completed/ 中有则移回；均无则 Phase 3 创建 |
| Phase 3 意图确认 | 写入 | spec -> `specs/active/`，plan -> `plans/active/` |
| 任务执行中 | 更新 plan | 更新检查清单、记录变更和技术债 |
| Phase 6/7 任务总结 | 归档 | 状态改 completed，移到 `completed/` |

### 技术债管理

- 新引入的技术债必须在本次任务中解决，禁止拖延
- 新发现的技术债必须立即写入 `plans/debt-tracker.md`（获得 ID），再在计划文件中引用该 ID
- 格式：表格（ID/描述/优先级/来源计划/发现时间/状态）

## 维护

修改约束/规范/规则时，检查 AGENTS.md 全局描述确保无矛盾。Agent 因缺少说明出错时：补充到 .harness/knowledge/，普遍性约束摘录到本文件，更新下方知识库索引。

---

# 二、项目规范（项目相关）

## 仓库结构

```
AGENTS.md              -- AI 知识库入口（本文件）
.harness/
  README.md            -- Harness 工程模板说明
  agents/              -- Agent 角色模板（Orchestrator、Designer、Planner、Coder、Reviewer）
  skills/              -- Skill 定义（迭代功能、修复Bug、迭代Harness文档、回填知识库、验证构建、总结任务）
    harness-ops/       -- Harness 运维类 Skill（治理代码、治理技能、治理全部、提取模板、回填产品文档）
    subskills/         -- Subskill 扫描模板
    superpowers/       -- superpowers 方法论技能（开发方法论，本地适配版）
  specs/               -- 设计文档（WHAT：需求、架构、设计决策）
    active/            -- 当前活跃 spec（可多文件并行）
    completed/         -- 已完成 spec 归档
  plans/               -- 实现计划（HOW：具体步骤、代码、验证命令）
    active/            -- 当前活跃计划（可多文件并行）
    completed/         -- 已完成计划归档（不入 git）
    debt-tracker.md    -- 技术债追踪
  guides/              -- 方法论与参考文档（人工维护）
  lessons/             -- 教训库（AI自主维护：general仅Harness相关、project绑定本项目）
  knowledge/           -- AI 知识库（01~05 认知约束类, 21~22 工具索引类）
  prd/                 -- 产品文档（AI只读：01-prd-sense、02-prd-baseline、03-prd-specs）
index.html             -- 入口 HTML
css/                   -- ITCSS 分层样式
  main.css             -- @import 入口
  settings/            -- CSS 变量
  generic/             -- 浏览器重置
  elements/            -- 基础元素样式
  objects/             -- 布局模式
  components/          -- 组件样式（toolbar, property-bar, canvas, modal）
  utilities/           -- 工具类
js/                    -- ES6 模块
  main.js              -- 应用入口
  state.js             -- 状态管理
  canvas.js            -- Canvas 渲染
  history.js           -- 撤销/重做
  tools/               -- 工具层（BaseTool, CropTool, BrushTool, TextTool, MosaicTool, ShapeTool）
  utils/               -- 工具函数（file, math）
locals/                -- 本地敏感配置
```

## 构建与测试

```bash
# 语法验证（无构建系统）
for f in js/*.js js/tools/*.js js/utils/*.js; do node --check "$f"; done
# 启动本地服务器（ES6 Modules 要求）
python3 -m http.server 8888
# 浏览器访问 http://localhost:8888
```

## 知识回填规则

知识回填 Phase（迭代功能 Phase 6）的回填目标：
- 架构变化 -> 02-architecture.md
- 新术语 -> 21-glossary.md
- 数据结构/存储变化 -> 04-data-boundaries.md
- 新源文件 -> 22-file-map.md
- 新跨文件模式 -> 05-key-patterns.md
- 产品方向调整 -> 提示用户，人工更新 prd/01-prd-sense.md 或触发 Skill: 回填产品文档

## 教训库维护规则

AI 自主维护 `.harness/lessons/`，人工可通过提示或建议触发新增/修正。
教训是原始素材，knowledge/ 是提炼后的权威知识；教训通过人工触发的回填流程沉淀为知识。

- 写入时机：Bug修复完成后，根因非显而易见时，自动提取教训写入；功能迭代中踩坑时同理
- 分级：仅与 Harness 框架相关、不绑定具体语言/框架/项目的通用经验 -> general.md；绑定本项目的具体经验 -> project.md
- 条目格式：`### L/P{序号}: 标题`，含现象/根因/教训/来源四字段
- 编号：general 用 L001 递增，project 用 P001 递增
- 去重：写入前检查是否已有同类教训，有则更新而非新增
- 加载策略：任务启动只读 SUMMARY 索引，不完整加载；仅用户明确指令或当前根因与 SUMMARY 高度相关时按需读取详情
- 回填：人工触发 `Skill: 回填知识库` 时，将已沉淀的教训抽象为通用规则写入 knowledge/，回填后删除原教训条目
- 提取：`Skill: 提取Harness模板` 时 general.md 随模板带走，project.md 留在项目内

## 代码生成

以下各节（代码生成、架构边界、质量守护、安全规范）为快速参考摘要，权威定义见 .harness/knowledge/03-conventions.md。

- JavaScript: Airbnb JavaScript Style Guide（const 优先、单引号、尾逗号、2 空格缩进、分号）
- ES6 Modules: import/export，script type=module
- 类名 PascalCase，变量/函数 camelCase，常量 UPPER_SNAKE_CASE
- 零外部依赖

## 架构边界

- 工具层只通过 canvas/state/history 模块访问画布和状态
- main.js 是唯一的模块组装点
- utils/ 应避免 DOM 操作
- CSS 文件按 ITCSS 层级组织，@import 顺序不可变

## 质量守护

- 无构建系统，通过 node --check 验证 JS 语法
- 浏览器手动测试

## 安全规范

- innerHTML 使用需确保插入值来自受约束的输入（select/number/color）
- 文件上传仅接受 image/jpeg, image/png, image/webp
- 所有图片通过 FileReader data URL 加载（同源安全）

## 上下文知识库

| 文件 | 何时查阅 |
|------|---------|
| .harness/prd/01-prd-sense.md | 功能迭代前，确认产品定位和判断准则 |
| .harness/knowledge/01-overview.md | 任务开始时，了解项目边界 |
| .harness/knowledge/02-architecture.md | 涉及模块新增、跨层调用时 |
| .harness/knowledge/03-conventions.md | 涉及编码/UI/质量/安全约定细节时 |
| .harness/knowledge/04-data-boundaries.md | 涉及数据结构、存储格式时 |
| .harness/knowledge/05-key-patterns.md | 实现跨模块协作模式时 |
| .harness/knowledge/21-glossary.md | 对术语不清楚时 |
| .harness/knowledge/22-file-map.md | 确定功能对应源文件时 |
| .harness/prd/02-prd-baseline.md | 确认功能需求与产品约束时 |
| .harness/prd/03-prd-specs.md | 了解原始需求规格或历史逻辑时 |
| .harness/guides/00-harness-desc.md | 了解 Harness 体系描述时 |
| .harness/guides/01-harness-ops.md | 了解 Harness 运维操作时 |
| .harness/guides/02-harness-dev.md | 了解 Harness 开发流程时 |
| .harness/lessons/general.md | 用户指令或当前根因与 SUMMARY 高度相关时按需读取 |
| .harness/lessons/project.md | 用户指令或当前根因与 SUMMARY 高度相关时按需读取 |
