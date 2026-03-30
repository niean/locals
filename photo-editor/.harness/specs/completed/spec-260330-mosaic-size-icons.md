# 马赛克块大小圆形图标选择器 Design Spec

- 创建时间: 2026-03-30
- 状态: active
- 任务来源: 马赛克工具"块大小"从数字输入改为圆形图标列表，分别代表 1、2、5、10

## Goal

将马赛克工具属性栏的块大小控件从 `<input type="number">` 改为 4 个圆形图标按钮，视觉上用递增的实心圆点表示不同块大小。

## Architecture

仅涉及 MosaicTool 的 renderPropertyBar 方法和属性栏 CSS，无跨模块变更。

## UI Design

属性栏布局：`块大小` 标签 + 4 个圆形按钮（水平排列，间距 var(--space-xs)）

每个按钮：
- 外框: 24x24px 圆角方块，hover 和选中状态有视觉区分
- 内部: 居中实心圆点，直径分别为 4px / 6px / 10px / 14px，对应块大小 1 / 2 / 5 / 10
- 选中态: 背景色 var(--color-primary)，圆点白色
- 未选中态: 透明背景，圆点 var(--color-text)
- Hover: 背景 var(--color-surface-hover)

## Components

### MosaicTool.renderPropertyBar
- 生成 4 个按钮，每个携带 data-size 属性
- 点击按钮调用 state.setToolOption('mosaic', 'size', value)
- 选中按钮添加 is-active class

### CSS: c-property-bar__size-dot
- 新增 `.c-property-bar__size-dot` 按钮样式
- 新增 `.c-property-bar__size-dot.is-active` 选中态

## Bug Fix

MosaicTool.js 第 76 行 parseInt(e.target.value, 5) 的 radix 错误，修复为 10（此行将被替换，附带修复）。

## Acceptance Criteria

- [ ] 属性栏显示"块大小"标签 + 4 个圆形图标按钮
- [ ] 圆点大小从左到右递增，分别代表 1、2、5、10
- [ ] 点击按钮切换选中态并更新 state
- [ ] 默认选中值为 10
- [ ] 视觉风格与现有属性栏一致
