# 工具栏 Tooltip 设计 Spec

- 创建时间: 2026-04-14 20:00
- 状态: completed
- 任务来源: 左侧工具栏鼠标悬停时展示工具名称 Tips（裁剪、画笔、文字、马赛克、形状），因仅看图标无法确认操作类型

## Goal

为左侧工具栏按钮添加自定义 CSS Tooltip，鼠标悬停后快速显示工具名称，替代浏览器原生 title tooltip 的慢延迟问题。

## Architecture

采用纯 CSS 方案实现 Tooltip：移除按钮的 `title` 属性，改用 `data-tooltip` 属性存储提示文本，通过 `::after` 伪元素渲染 Tooltip，hover 时以 var(--transition-fast) 过渡动画显示。无需 JS 代码参与。

## Components

### CSS Tooltip 组件
- 职责: 鼠标悬停时在按钮右侧显示工具名称
- 接口: 通过 `data-tooltip` 属性声明提示文本，`::after` 伪元素渲染
- 依赖: 无外部依赖，仅 CSS

## Data Flow

无数据流转。hover 状态由浏览器原生 CSS 伪类 `:hover` 触发，`::after` 伪元素显示/隐藏。

## UI Design

- Tooltip 位于按钮右侧，垂直居中，左侧距按钮 var(--space-sm)
- 背景色新增 CSS 变量 --color-tooltip-bg: #333，文字色 #fff，字号 var(--font-size-md)，padding var(--space-xs) var(--space-sm)，border-radius var(--border-radius)
- 鼠标悬停后 var(--transition-fast) 过渡显示（opacity 0 -> 1），鼠标离开时同速隐藏
- 工具名称：裁剪、画笔、文字、马赛克、形状

## Error Handling

无需特殊错误处理。纯 CSS 实现，无运行时异常场景。

## Constraints

- 零 JS 依赖，纯 CSS 实现
- 不影响工具栏现有交互（工具切换、hover 高亮）
- Tooltip 不超出视口边界（工具栏在左侧，Tooltip 向右弹出，不会溢出）
- 兼容项目已有 CSS 架构（ITCSS），样式写入 components/_toolbar.css

## Acceptance Criteria
- [ ] 鼠标悬停工具栏按钮时，按钮右侧快速显示工具名称 Tooltip（过渡时长 var(--transition-fast)）
- [ ] 鼠标离开按钮后 Tooltip 快速消失
- [ ] 五个工具按钮分别显示：裁剪、画笔、文字、马赛克、形状
- [ ] 移除原有 `title` 属性，避免原生 tooltip 干扰
- [ ] Tooltip 样式使用 CSS 变量，与项目约定一致
