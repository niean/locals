# 裁剪工具确认按钮显示修复

- 创建时间: 2025-03-25
- 状态: completed
- 任务来源: 截图选定范围后未展示确定或取消按钮

## Goal

修复裁剪工具在选区接近画布边界时确认/取消按钮不显示的问题，改用 HTML 浮动层方案实现按钮，并支持用户手动拖动按钮位置。

## Architecture

将 Canvas 绘制的确认/取消按钮改为 HTML 元素浮动层，通过绝对定位跟随选区位置，自动处理边界溢出问题。

## Components

### CropTool.js 修改
- 职责: 管理 HTML 按钮元素的生命周期（创建、定位、销毁、拖动）
- 接口: `_createActionButtons()`, `_positionActionButtons()`, `_removeActionButtons()`, `_setupDragBehavior()`
- 依赖: canvas.js (获取选区坐标和 canvas 尺寸)

### 新增 CSS 样式
- 职责: 定义浮动按钮样式
- 接口: `.c-crop-actions` 容器类
- 依赖: 现有 CSS 变量

## Data Flow

```
用户拖拽选区 -> onMouseUp -> _createActionButtons() 创建按钮
              -> _positionActionButtons() 计算初始位置（含边界检测）
              -> _setupDragBehavior() 绑定拖动事件
              -> 用户拖动按钮 -> 更新按钮位置（限制在 canvas 边界内）
              -> 按钮点击 -> _applyCrop() / 清除选区 -> _removeActionButtons()
              -> 工具切换/deactivate -> _removeActionButtons()
```

## UI Design

**按钮容器**: `.c-crop-actions`
- 绝对定位在 `#canvasArea` 内
- 包含确认/取消两个按钮
- 间距 8px，按钮宽度 60px，高度 24px
- 支持拖动：鼠标按住容器空白区域可拖动整个按钮组

**拖动交互**:
- 拖动手柄：按钮容器顶部或左侧预留拖动区域（cursor: move）
- 拖动限制：按钮组只能在 canvas 边界内移动
- 拖动时样式：添加阴影或边框提示当前状态

**边界处理逻辑**:
1. 默认：按钮在选区下方 8px
2. 底部空间不足（btnY + btnH > canvasHeight）：按钮改到选区上方 8px
3. 顶部也不足：按钮放选区内部底端 4px
4. 水平溢出：按钮右对齐选区右边缘，不超出 canvas 右边界

## Error Handling

- 选区过小时（w/h < 5px）：不显示按钮，直接清除选区
- 按钮创建失败：fallback 到 Canvas 绘制方案

## Constraints

- 保持现有工具切换流程不变
- 按钮样式与现有 property-bar 按钮风格一致
- 不引入外部依赖

## Acceptance Criteria
- [ ] 选区在画布底部时，按钮自动上移至选区上方显示
- [ ] 选区在画布顶部时，按钮显示在选区下方
- [ ] 按钮点击响应正确（确认执行裁剪，取消清除选区）
- [ ] 切换工具或 deactivate 时按钮自动移除
- [ ] 按钮样式与现有 UI 风格一致
- [ ] 支持用户拖动按钮组调整位置
- [ ] 拖动时按钮组限制在 canvas 边界内
