# 裁剪工具交互简化 Design Spec

- 创建时间: 2026-03-30
- 状态: active
- 任务来源: 裁剪工具移除确认/取消按钮，改用双击确认 + ESC取消

## Goal

简化裁剪工具的确认/取消交互：双击选区确认裁剪，ESC键取消选区，移除浮动按钮框。

## Architecture

仅修改 CropTool.js 交互逻辑，删除按钮相关代码和 CSS 文件。双击确认已实现，新增 ESC 键监听，清理按钮相关代码。

## Components

### CropTool.js -- 交互逻辑调整
- 移除: actionButtons / isDraggingButtons / dragOffset / _dragHandlers 属性
- 移除: _createActionButtons / _positionActionButtons / _setupDragBehavior / _removeActionButtons 方法
- 新增: _boundOnKeyDown 属性（构造函数中绑定 _onKeyDown）
- 新增: _onKeyDown 方法 -- ESC 键按下时，若 cropRect 存在则清除 cropRect + overlay；无 cropRect 时为 no-op
- 新增: onActivate 中 document.addEventListener('keydown', _boundOnKeyDown)
- 新增: onDeactivate 中 document.removeEventListener('keydown', _boundOnKeyDown)
- 保留: _onDblClick 双击确认逻辑
- 调整: onMouseDown 内选区判断保留（支持双击），移除 _removeActionButtons 调用
- 调整: onMouseUp 移除 _createActionButtons 调用
- 调整: onDeactivate 移除 _removeActionButtons 调用

### CSS 清理
- 删除: css/components/_crop-actions.css
- 修改: css/main.css 移除 @import '_crop-actions.css'

## Acceptance Criteria

- [ ] 选定裁剪区域后，双击选区内确认裁剪
- [ ] 选定裁剪区域后，按 ESC 取消选区（清除遮罩和选框）
- [ ] 无选区时按 ESC 为 no-op
- [ ] 不再显示确认/取消浮动按钮
- [ ] 点击选区外开始新选区（替换当前选区）
- [ ] 切换工具时正确清理状态
- [ ] node --check 语法验证通过
