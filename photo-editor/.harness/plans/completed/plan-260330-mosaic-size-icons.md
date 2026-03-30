# 马赛克块大小圆形图标选择器 Implementation Plan

- 创建时间: 2026-03-30
- 状态: active
- Spec: .harness/specs/active/spec-260330-mosaic-size-icons.md

## Tasks

### Task 1: 新增 CSS 样式
- 文件: css/components/_property-bar.css
- 新增 `.c-property-bar__size-dot` 按钮样式（24x24, 圆角, flex 居中）
- 新增 `.c-property-bar__size-dot.is-active` 选中态（primary 背景 + 白色圆点）
- 新增 `.c-property-bar__size-dot:hover` 悬停态
- 新增 `.c-property-bar__size-dot__circle` 内部圆点样式（圆形, 背景色）

### Task 2: 修改 MosaicTool.renderPropertyBar
- 文件: js/tools/MosaicTool.js
- 替换 input[type=number] 为 4 个按钮 HTML
- 每个按钮: `<button class="c-property-bar__size-dot" data-size="N"><span style="width:Xpx;height:Xpx"></span></button>`
- 绑定 click 事件: 更新 state + 切换 is-active class
- 圆点尺寸映射: 1->4px, 2->6px, 5->10px, 10->14px

## Checklist

- [ ] Task 1: CSS 样式
- [ ] Task 2: MosaicTool 改造
- [ ] 构建验证
