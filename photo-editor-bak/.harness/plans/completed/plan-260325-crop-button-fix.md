# 修复裁剪工具确认/取消按钮无法点击

- 创建时间: 2026-03-25
- 状态: completed
- 关联 spec: 无（小型 Bug 修复）
- Goal: 修复裁剪选区后点击确认/取消按钮无响应的问题
- Architecture: 单文件修改，在 CropTool.onMouseDown 中增加按钮区域命中检测
- Tech Stack: 纯 JS

## Task 1: 修复 onMouseDown 中的按钮命中检测

### 文件变更
- `js/tools/CropTool.js`（修改）

### 步骤
1. 提取按钮区域计算为独立方法 `_getButtonRects()`，供 `_showCropActions` 和 `onMouseDown` 共用
2. 在 `onMouseDown` 开头检测：若 `cropRect` 存在且点击落在确认/取消按钮区域内，执行对应操作并 return
3. 语法验证：`node --check js/tools/CropTool.js`

### 验收标准
- [ ] 选定裁剪范围后，点击确认按钮可执行裁剪
- [ ] 选定裁剪范围后，点击取消按钮可清除选区
- [ ] 正常框选功能不受影响

## 变更记录

| 时间 | 变更 |
|------|------|
| 2026-03-25 | 创建计划 |
