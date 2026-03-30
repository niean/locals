# 裁剪选择框移动 Design Spec

- 创建时间: 2026-03-30
- 状态: active
- 任务来源: 裁剪选择框定型后支持拖拽移动

## Goal

裁剪选择框绘制完成后，用户可在选区内拖拽移动选择框位置。

## Architecture

仅修改 CropTool.js，新增移动状态管理，复用现有 mouse 事件生命周期。

## Components

### CropTool.js -- 移动逻辑
- 新增属性: isMoving / moveOffsetX / moveOffsetY
- onMouseDown: 选区内点击 -> 记录鼠标相对选区左上角偏移，设 isMoving = true
- onMouseMove: isMoving 时 -> 计算新位置（clamp 到画布边界），更新 cropRect.x/y，重绘 overlay
- onMouseUp: isMoving 时 -> 设 isMoving = false
- 与双击确认共存: dblclick 事件独立于 mousedown/mouseup，不冲突
- 与 ESC 取消共存: ESC 清除 cropRect 时 isMoving 一并重置

## Acceptance Criteria

- [ ] 选区定型后，在选区内按住拖拽可移动选择框
- [ ] 移动不超出画布边界
- [ ] 移动后双击仍可确认裁剪
- [ ] 移动后 ESC 仍可取消
- [ ] 选区外点击仍启动新选区
- [ ] node --check 语法验证通过
