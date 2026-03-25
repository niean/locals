# 裁剪双击确认 设计 Spec

- 创建时间: 2026-03-25
- 状态: active
- 任务来源: 截图选定范围后，双击选中区域完成确定

## Goal

裁剪工具选定范围后，支持双击选中区域作为额外的确认方式，与现有"确认"按钮并存。

## Architecture

在 CropTool 的 overlay canvas 上监听 dblclick 事件，双击位置在选区内时触发裁剪确认。

## Components

### CropTool.js
- 职责: 新增双击事件监听，判断双击位置是否在选区内
- 接口: 内部方法 `_onDblClick(e)`
- 依赖: canvas.js (getOverlayCanvas)

## Data Flow

```
用户双击 -> overlayCanvas dblclick -> _onDblClick(e) -> 判断位置是否在 cropRect 内 -> _applyCrop()
```

## UI Design

无 UI 变更。交互增强：
- 选区存在时，双击选区内任意位置触发裁剪
- 双击选区外无响应
- 确认/取消按钮保留

## Error Handling

- 无选区时双击无响应
- 选区过小（< 5x5）时不响应双击

## Constraints

- 双击时间间隔由浏览器默认行为决定（约 300ms）
- 移动端触摸设备不支持双击，仅依赖按钮

## Acceptance Criteria
- [ ] 选区存在时，双击选区内触发裁剪
- [ ] 双击选区外无响应
- [ ] 确认/取消按钮仍正常工作
- [ ] 语法验证通过
