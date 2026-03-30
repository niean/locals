# 裁剪工具交互简化 Implementation Plan

- 创建时间: 2026-03-30
- 状态: active
- Spec: specs/active/spec-260330-crop-simplify-interaction.md

## Tasks

### Task 1: CropTool.js -- 移除按钮相关代码
- 文件: js/tools/CropTool.js
- 步骤:
  1. 构造函数: 移除 actionButtons / isDraggingButtons / dragOffset / _dragHandlers 属性
  2. 移除方法: _createActionButtons / _positionActionButtons / _setupDragBehavior / _removeActionButtons
  3. onMouseDown: 移除 _removeActionButtons() 调用（保留选区内判断）
  4. onMouseUp: 移除 _createActionButtons() 调用（保留 _drawCropOverlay）
  5. onDeactivate: 移除 _removeActionButtons() 调用
  6. _onDblClick: 移除 _removeActionButtons() 调用

### Task 2: CropTool.js -- 新增 ESC 键取消
- 文件: js/tools/CropTool.js
- 步骤:
  1. 构造函数: 新增 this._boundOnKeyDown = this._onKeyDown.bind(this)
  2. onActivate: 新增 document.addEventListener('keydown', this._boundOnKeyDown)
  3. onDeactivate: 新增 document.removeEventListener('keydown', this._boundOnKeyDown)
  4. 新增 _onKeyDown(e) 方法: e.key === 'Escape' 时，若 cropRect 存在则清除 cropRect + overlay

### Task 3: CSS 清理
- 步骤:
  1. 删除 css/components/_crop-actions.css
  2. css/main.css 移除 @import 'components/_crop-actions.css'

### Task 4: 验证
- 步骤:
  1. node --check 全量语法验证
  2. 对照验收标准逐项检查

## Checklist

- [ ] Task 1: 移除按钮相关代码
- [ ] Task 2: 新增 ESC 键取消
- [ ] Task 3: CSS 清理
- [ ] Task 4: 验证
