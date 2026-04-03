# PROJECT.md -- PhotoEditor

PhotoEditor -- 本地化图片编辑器，纯 HTML+CSS+JS 实现。由于使用 ES6 Modules，需通过本地服务器访问（如 python3 -m http.server 8888）。支持裁剪、画笔、文字标注、马赛克、形状（箭头/矩形）五种编辑工具。

---

# Harness 框架适配

本节为 Harness 框架提供项目级配置，框架文件通过 `.harness/PROJECT.md` 直接引用。

## 知识库目录

首次加载时需建立 SUMMARY 索引的目录：
- `.harness/knowledge/`
- `.harness/prd/`（除 03-prd-specs.md）
- `.harness/lessons/`

## 任务类型加载矩阵

首次加载时，根据任务类型选择性读取知识库文件（所有文件首行 SUMMARY 始终必读）：

| 任务类型 | 必读（完整读取） | 按需读取 |
|---------|----------------|---------|
| 功能需求 | .harness/knowledge/01-overview.md, .harness/knowledge/02-architecture.md, .harness/knowledge/22-file-map.md, .harness/prd/01-prd-sense.md, .harness/prd/02-prd-baseline.md | .harness/knowledge/03-conventions.md, .harness/knowledge/04-data-boundaries.md, .harness/knowledge/05-key-patterns.md, .harness/knowledge/21-glossary.md |
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
- 产品方向调整 -> 提示用户，人工更新 .harness/prd/01-prd-sense.md 或触发 Skill: 回填产品文档

## 教训库加载路径

本项目教训库分布在两个位置：
- `.harness/framework/lessons/general.md`（Harness 通用教训）
- `.harness/lessons/project.md`（项目教训）

## 构建与测试

### 构建
```bash
for f in js/*.js js/tools/*.js js/utils/*.js; do node --check "$f"; done
```

### 单元测试
单元测试执行策略：
- 用户明确要求时：必须执行
- 本项目无构建系统和自动化测试框架，通过浏览器手动测试
- 其他场景：跳过

```bash
# 启动本地服务器（ES6 Modules 要求）
python3 -m http.server 8888
# 浏览器访问 http://localhost:8888
```

## 扫描维度

代码扫描使用的维度及规则来源。下表路径均相对于 `.harness/knowledge/` 目录：

| # | 维度 | 规则来源 |
|---|------|---------|
| 1 | 架构边界 | 02-architecture.md "模块边界" + 05-key-patterns.md |
| 2 | 编码约定 | 03-conventions.md "编码风格" |
| 3 | 安全规范 | 03-conventions.md "安全规范" |

可选（涉及文件删除时）：

| # | 维度 | 规则来源 |
|---|------|---------|
| 4 | 废弃代码 | 通用规则（未使用的类型/函数/变量/文件/导入/过期注释）；语言特定排除见 03-conventions.md |

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

- JavaScript: Airbnb JavaScript Style Guide（const 优先、单引号、尾逗号、2 空格缩进、分号）
- ES6 Modules: import/export，script type=module
- 类名 PascalCase，变量/函数 camelCase，常量 UPPER_SNAKE_CASE
- 零外部依赖

## 架构边界

详见 .harness/knowledge/02-architecture.md "模块边界"。

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
