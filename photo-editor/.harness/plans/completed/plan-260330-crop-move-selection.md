# 裁剪选择框移动 Implementation Plan

- 创建时间: 2026-03-30
- 状态: active
- Spec: specs/active/spec-260330-crop-move-selection.md

## Tasks

### Task 1: 新增移动状态属性
- 文件: js/tools/CropTool.js
- 构造函数新增: this.isMoving = false / this.moveOffsetX = 0 / this.moveOffsetY = 0

### Task 2: onMouseDown -- 选区内启动移动
- 文件: js/tools/CropTool.js
- 选区内点击: 设 isMoving = true，记录 moveOffsetX = p.x - cropRect.x, moveOffsetY = p.y - cropRect.y

### Task 3: onMouseMove -- 移动选区
- 文件: js/tools/CropTool.js
- isMoving 时: 计算新 x = p.x - moveOffsetX, y = p.y - moveOffsetY, clamp 到 [0, canvasWidth - w] / [0, canvasHeight - h]，更新 cropRect，调用 _drawCropOverlay

### Task 4: onMouseUp -- 结束移动
- 文件: js/tools/CropTool.js
- isMoving 时: 设 isMoving = false

### Task 5: ESC 兼容
- 文件: js/tools/CropTool.js
- _onKeyDown: ESC 时同时重置 isMoving = false

### Task 6: 验证
- node --check 全量语法验证
- 对照验收标准逐项检查

## Checklist

- [ ] Task 1-5: 代码实现
- [ ] Task 6: 验证
