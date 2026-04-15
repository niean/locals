# 左侧工具栏展开/收起 设计 Spec

- 创建时间: 2026-04-15
- 状态: completed
- 任务来源: 用户指令：左侧工具栏支持展开模式，展开后菜单形式为图标+文字

## Goal

为左侧工具栏增加展开/收起切换功能，默认收起状态（仅图标，48px 宽），点击顶部按钮后展开为图标+文字模式（~140px 宽），可再次点击收起。

## Architecture

纯 CSS 实现：通过在 `.c-toolbar` 上切换 `is-expanded` class 控制展开/收起状态，JS 处理按钮点击事件。HTML 为每个工具按钮增加文字 label（默认隐藏，展开时显示）。

## Components

### 1. HTML 结构
- 在 `index.html` 的工具栏顶部增加一个切换按钮 `.c-toolbar__toggle`
- 为每个工具按钮 `.c-toolbar__btn` 内部增加 `<span class="c-toolbar__label">` 文字标签
- 工具顺序：切换按钮在上，5 个工具按钮在下

### 2. CSS 样式（`css/components/_toolbar.css`）
- **收起状态（默认）**：与现状一致，仅显示图标
- **展开状态（`.c-toolbar.is-expanded`）**：
  - 工具栏宽度从 48px 变为 ~140px
  - 按钮宽度撑满，`padding: 0 12px`
  - 文字标签 `.c-toolbar__label` 从 `display: none` 变为 `display: inline`
  - 图标与文字之间有 `gap: 8px`
  - 隐藏 tooltip（展开时不需要）
  - 添加展开/收起过渡动画（`transition: width 0.2s ease`）

### 3. JavaScript（`js/main.js`）
- `setupToolbar()` 中增加切换按钮事件监听
- 点击时切换 `.c-toolbar` 的 `is-expanded` class
- 展开状态持久化到 `localStorage`（可选）

## UI Design

### 收起状态
```
[✂]  <- 切换按钮（箭头图标，指向左）
[✂]  <- 当前激活
[✏]
[T]
[▦]
[▭]
```

### 展开状态
```
[→ 收起]   <- 切换按钮
[✂  裁剪]  <- 当前激活（高亮）
[✏  画笔]
[T  文字]
[▦ 马赛克]
[▭ 形状]
```

切换按钮使用 SVG 箭头图标：收起时箭头指向左，展开时箭头指向右。

## Data Flow

1. 用户点击 `.c-toolbar__toggle` 按钮
2. JS 切换 `.c-toolbar` 的 `is-expanded` class
3. CSS 根据 `.is-expanded` 切换按钮宽度、label 可见性、tooltip 可见性
4. （可选）状态保存到 `localStorage`

## Error Handling

- 无复杂错误场景，纯 UI 交互
- 需确保展开/收起状态下按钮点击区域正确

## Constraints

- 零外部依赖，纯 CSS+JS
- 保持 Airbnb 编码风格
- 展开/收起过渡动画不超过 200ms
- 展开后 tooltip 应禁用（hover 不显示）
- 兼容现有工具切换逻辑（`switchTool` 函数不受影响）

## Acceptance Criteria

- [ ] 默认状态下工具栏仅显示图标，48px 宽（与现状一致）
- [ ] 点击顶部切换按钮后展开，工具栏变宽，显示图标+文字
- [ ] 再次点击切换按钮可收起，恢复 48px 宽
- [ ] 展开/收起切换动画流畅，无明显闪烁
- [ ] 展开状态下 hover 不显示 tooltip（文字已可见）
- [ ] 收起状态下 hover 仍显示 tooltip
- [ ] 工具切换功能正常工作，激活状态正确高亮
- [ ] 切换按钮不影响画布和属性栏的布局
