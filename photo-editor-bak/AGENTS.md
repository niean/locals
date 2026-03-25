# AGENTS.md -- PhotoEditor

PhotoEditor -- 本地化图片编辑器，纯 HTML+CSS+JS 实现。由于使用 ES6 Modules，需通过本地服务器访问（如 python3 -m http.server 8888）。支持裁剪、画笔、文字标注、马赛克、形状（箭头/矩形）五种编辑工具。

---

# 一、通用规范（项目无关）

## Agents（角色 Agent）

Skill 定义"做什么"，Agent 定义"谁来做"。多 Agent Skill 的每个 Phase 指定执行角色，Phase 间通过"检查点摘要"（不超过 10 行）交接上下文。详细定义见 `.harness/agents/` 目录。

| Agent | 运行形态 | 模板文件 | 职责 |
|-------|---------|---------|------|
| Orchestrator | 主 Agent | .harness/agents/orchestrator.md | 任务路由、流程编排、上下文管理、代码实现 |
| Reviewer | subagent + 主 Agent | .harness/agents/reviewer.md | 代码扫描、构建验证、验收 |

## Skills（可复用操作）

触发后读取对应文件、按步骤执行。详细定义见 `.harness/skills/` 目录。

| Skill | 触发 | 文件 |
|-------|------|------|
| 迭代功能 | 人工下发功能需求或修改代码 | .harness/skills/iterate-feature.md |
| 回填知识库 | 人工指令 | .harness/skills/backfill-knowledge.md |
| 回填产品文档 | 人工指令 | .harness/skills/harness-ops/backfill-prd.md |
| 治理代码 | 人工指令 | .harness/skills/harness-ops/governance-code.md |
| 验证构建 | 功能迭代完成后自动执行，或人工指令 | .harness/skills/verify-build.md |
| 治理技能 | 人工指令 | .harness/skills/harness-ops/governance-capability.md |
| 提取Harness模板 | 人工指令 | .harness/skills/harness-ops/extract-harness-tpl.md |
| 治理全部 | 人工指令 | .harness/skills/harness-ops/governance-all.md |
| 总结任务 | AI自动触发（任务完成后） | .harness/skills/summarize-task.md |

自动触发：标注"AI自动触发"的 Skill 必须在对应时机自动执行。当前仅 Skill: 总结任务（仅适用于按迭代功能完整流程执行的任务）。

## Subskills（并行扫描任务）

通过 `use_subagents` 启动，各自独立上下文窗口，由 Reviewer 或 Skill 按需调用。详细定义见 `.harness/skills/subskills/` 目录。

| Subskill | 文件 | 调用方 |
|----------|------|--------|
| (模板示例) scan-example | .harness/skills/subskills/scan-example.md | Reviewer Step 2, 治理代码 Phase 2 |

## 流程合规

### 任务执行入口（不可压缩）

任务开始时首先进行 任务分类和Skill路由（新 Task 或同一 Task 内的第 2+ 次迭代均需分类），必须立即执行以下步骤，禁止跳过：

1. 任务分类：判断任务类型。优先匹配：用户明确指定已注册 Skill 名称（如"治理代码"等）时，直接路由到对应 Skill，跳过步骤 2-3。否则：功能需求或修改代码 -> `Skill: 迭代功能`，其它任务按需路由到已注册 Skill 或直接执行
2. 读取 Skill 定义：立即读取对应的 Skill 文件（如 `.harness/skills/iterate-feature.md`）
3. 遵循 Skill 流程：按 Skill 文件定义的 Phase 顺序执行；特别强调，`[GATE]` 标记的 Phase 必须在消息框展示意图、等待人工确认，否则禁止执行后续 Phase

禁止行为：
- 禁止在读取 Skill 定义前直接开始代码实现
- 禁止跳过任何 Phase，禁止简化、改编、拆分或合并 Phase
- 禁止跳过`Phase 门禁[GATE]`（见下方 GATE 规则）
- 禁止跳过、简化、改动 Phase的消息输出格式
- 禁止主动调起 superpowers 插件（形如 `superpowers:skill-x`）；仅在用户明确指令时才可调用


### Phase 门禁（GATE）规则（不可压缩）

- `[GATE]` 标记的 Phase 结束后，必须立即结束当前回复，使用 `ask_followup_question` 工具向用户请求确认；禁止在同一条回复中继续后续 Phase
- `[GATE]` Phase 收到用户修正时：更新内容后必须重新输出完整摘要并重走 GATE 确认流程；用户修正 ≠ 用户确认，禁止将修正视为确认直接进入后续 Phase
- `[GATE-ENTRY]` 标记的 Phase 开始前，必须确认用户已在上一条消息中给出明确回复；若前置 GATE Phase 在当前回复中刚输出，说明 GATE 被违反，必须停止
- 当前 GATE 点：迭代功能 Phase 2 -> Phase 3

### 引用外部步骤的执行约束（不可压缩）

- 当文档引用其它能力的 Step 而未展开描述时，在引用处必须附加约束：`每个 Step 必须实际执行并产出独立结果，禁止跳过或虚报`

### 不可压缩章节保护规则（不可压缩）

- 标记为 `不可压缩` 的章节，AI 发现其内容存在问题时，只能以消息方式提示用户
- AI 禁止自动修改 `不可压缩` 章节的内容
- AI 禁止索要用户确认然后代为修改 `不可压缩` 章节的内容（防止用户误授权）

### 消息输出格式（不可压缩）

- 任务声明：任务开始时声明任务类型和架构（新 Task 或同一 Task 内的第 2+ 次迭代均需声明），标准格式：`任务类型：功能需求；调度架构：多Agent` 或 `任务类型：修改文档；调度架构：单Agent`；同一 Task 内第 2+ 次迭代追加标注：`任务类型：功能需求；调度架构：多Agent。同一 Task 内第 N 次迭代`；非迭代功能类任务标注实际类型即可
- 阶段描述：Skill 流程中的每个 Phase，输出时使用 `## Phase N: 名称` 作为段落标题，名称严格对齐 Skill 定义（如 `## Phase 1: 任务调度`）；Phase 标题必须独占一行，禁止在同一行附加角色标注或其它内容
- 角色标注：每个 Phase/Step 输出标注执行 Agent：`[Agent: 角色名]` 或 `[Agent: 角色名 (subagent)]`，角色名使用英文；角色标注紧跟 Phase 标题下一行，不与标题混合
  - 阶段和角色组合格式示例：`## Phase 1: 任务调度`（标题独占一行）换行后 `[Agent: Orchestrator]`（角色标注独占一行）换行后正文内容
- 术语禁忌：约束类术语（"硬性门禁""流程违规"等）只在规范文档中体现，不输出到用户消息框

## 文件与文档

- 禁止主动创建 README；不删除项目文件
- 文件名：小写英文 kebab-case，动词-名词 语序（如 governance-code）；标题和描述使用中文，同样动词-名词 语序
- AI 只读目录（修改前必须人工确认）：.harness/agents/、.harness/prd/、.harness/guides/
- prd/ 与 knowledge/ 知识库冲突时，提示用户确认
- 文档禁用 emoji/加粗/斜体，使用普通文字
- 执行计划文件落盘到 `.harness/plans/active/plan-{YYMMDD}-{desc}.md`，任务完成后移动到 `completed/`（详见"执行计划管理"章节）

## 命令执行

- 命令行超过 10 行时，必须先将脚本写入 `locals/harness_tmp/` 再执行，防止 Terminal 异常阻塞流程
- `locals/harness_tmp/` 由 AI 自主维护（创建、清理均无需用户确认），已在 `.gitignore` 覆盖范围内

### 文档引用方向

.harness/ 文档体系分为四层，引用方向应自上而下：

| 层级 | 目录 | 职责 |
|------|------|------|
| Layer 0 | AGENTS.md | 顶层入口，注册并索引所有 .harness/ 文件 |
| Layer 1 | .harness/agents/ | Agent 角色定义 -- "谁来做" |
| Layer 2 | .harness/skills/ | Skill 流程定义 -- "怎么做" |
| Layer 3 | .harness/skills/subskills/ | Subskill 任务模板 -- "做什么" |
| 数据层 | .harness/knowledge/ + .harness/prd/ + .harness/guides/ | 知识库、产品文档、方法论，被上层按需读取 |

引用方向规则：
- 向下引用：上层引用下层的具体定义（如 Skills 引用 Agents，Agents 调度 Subskills）
- 同层编排：同层文件可通过编排引用（如 governance-all.md 编排其他 Skills）
- 反向指回（限定）：下层仅允许"指回入口"式引用，不反向引用上层的具体定义

允许的特例：
- AGENTS.md 与 knowledge/03-conventions.md：双向声明摘要-权威源关系（AGENTS.md 项目规范为摘要，03-conventions.md 为权威源）
- knowledge/01-overview.md 指回 AGENTS.md：入口指引（"操作约束见 AGENTS.md"）

路径规则：
- .harness/ 下的文档引用项目文件路径时，使用项目根目录相对路径，不使用绝对路径

## 上下文管理

- 首次加载（Task 首条消息），必须读取 `.harness/knowledge/` 全部文件 + `.harness/prd/`（除 03-prd-specs.md），了解项目全貌
- 后续迭代（同一 Task 内），按需查阅 `.harness/knowledge/` 和 `.harness/prd/`，不重复加载已知内容，因为每类知识有且只有一个归属文档、不重复维护
- 多步任务：每步完成压缩为检查点摘要（不超过 5 行），后续只携带摘要；每步只加载必需文件
- 所有步骤均为必选项，禁止因上下文压力跳过；上下文紧张时先压缩已有内容再继续
- 委派产出（subagent、跨 Phase 交接）：产出结构化结论（表格、要点），不搬运原文；需要完整内容时直接读取源文件
- 产出超限时：缩小单次任务范围或拆分为多个子任务，不重试相同范围
- 各 Skill 如有更具体的上下文管理要求，以 Skill 文件为准

## 执行计划管理

AI 通过 `.harness/specs/` 和 `.harness/plans/` 自主管理设计文档和实现计划，跟踪任务进度和技术债。

### 目录结构

```
.harness/
  specs/             -- 设计文档（WHAT：需求、架构、设计决策）
    active/          -- 当前活跃 spec（原则上只有 1 个文件）
    completed/       -- 已完成 spec 归档
  plans/             -- 实现计划（HOW：具体步骤、代码、验证命令）
    active/          -- 当前活跃计划（原则上只有 1 个文件）
    completed/       -- 已完成计划归档
    debt-tracker.md  -- 技术债追踪
```

### Spec 文件（设计文档）

命名：`spec-{YYMMDD}-{desc}.md`（YYMMDD 为创建日期）。

触发条件：用户在 PRD-Specs 中显式要求（如"约束：plan中请先给出PRD设计"），或影响 3+ 模块/涉及新模块创建时建议产出。小型需求可省略 spec，直接创建 plan。

spec 是一次性产物，服务于当前任务的设计确认和实现。实现完成后，持久性架构知识通过 Phase 5 知识回填写入 knowledge/。

模板：权威定义见 `.harness/skills/superpowers/brainstorming.md` 中的 Spec document template 节。关键要素：
- Header：创建时间、状态、任务来源、Goal、Architecture
- Body：Components（职责/接口/依赖）、Data Flow、Data Model、UI Design、Error Handling、Constraints
- Footer：Acceptance Criteria（可验证的验收条件）

### Plan 文件（实现计划）

命名：`plan-{YYMMDD}-{desc}.md`（YYMMDD 为创建日期），每个窗口使用独立计划文件，同一窗口内第 2+ 次迭代复用同一计划文件。

模板：权威定义见 `.harness/skills/superpowers/writing-plans.md` 中的 Plan Document Header / Task Structure / Plan Document Footer 三节。关键要素：
- Header：创建时间、状态、关联 spec、Goal、Architecture、Tech Stack
- Task：File Structure + 逐 task TDD 步骤（failing test -> verify fail -> implement -> verify pass）
- Footer：变更记录表 + 发现的技术债（引用 debt-tracker.md ID）

### 生命周期

同一 Task 只允许有 1 个 spec + 1 个 plan。

1. Phase 1（任务调度）：检测 `specs/active/` 和 `plans/active/` 是否有未完成文件；若有，提示用户上个任务是继续或是删除；若无但 `completed/` 中有当前 Task 的文件，移回 `active/` 复用（状态改回 active）；均无则在后续 Phase 3 创建
2. Phase 3（意图确认）：设计文档写入 `specs/active/spec-{YYMMDD}-{desc}.md`，实现计划写入 `plans/active/plan-{YYMMDD}-{desc}.md`
3. 任务执行中：更新 plan 检查清单状态，记录变更，记录发现的技术债
4. Phase 6（任务总结）：将 spec 和 plan 状态改为 completed，分别移动到对应的 `completed/`

### 技术债管理

- 新引入的技术债必须在本次任务中解决，禁止拖延；
- 新发现但没有及时处理的技术债，记录到 `debt-tracker.md`
- 新发现技术债时必须立即写入 `debt-tracker.md`（获得 ID），然后在计划文件中引用该 ID；禁止仅记录在计划文件中
- 格式：表格（ID/描述/优先级/来源计划/发现时间/状态）
- 在合适时机修复（如任务间隙、治理代码时）

## 维护

修改约束/规范/规则时，检查 AGENTS.md 全局描述确保无矛盾。Agent 因缺少说明出错时：补充到 .harness/knowledge/，普遍性约束摘录到本文件，更新下方知识库索引。

---

# 二、项目规范（项目相关）

## 仓库结构

```
AGENTS.md              -- AI 知识库入口（本文件）
.harness/
  README.md            -- Harness 工程模板说明
  agents/              -- Agent 角色模板（Orchestrator、Reviewer）
  skills/              -- Skill 定义（迭代功能、回填知识库、验证构建、总结任务）
    harness-ops/       -- Harness 运维类 Skill（治理代码、治理技能、治理全部、提取模板、回填产品文档）
    subskills/         -- Subskill 扫描模板
    superpowers/       -- superpowers 方法论技能（开发方法论，本地适配版）
  specs/               -- 设计文档（WHAT：需求、架构、设计决策）
    active/            -- 当前活跃 spec（原则上只有 1 个文件）
    completed/         -- 已完成 spec 归档
  plans/               -- 实现计划（HOW：具体步骤、代码、验证命令）
    active/            -- 当前活跃计划（原则上只有 1 个文件）
    completed/         -- 已完成计划归档（不入 git）
    debt-tracker.md    -- 技术债追踪
  guides/              -- 方法论与参考文档（人工维护）
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
