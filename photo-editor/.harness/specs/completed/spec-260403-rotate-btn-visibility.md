# 旋转按钮可见性控制 Design Spec

- 创建时间: 2026-04-03 16:30
- 状态: completed
- 任务来源: 截图：旋转按钮，仅存在于截图页面，去掉其它页面的旋转按钮

## Goal

旋转按钮仅在裁剪工具激活时显示，其他工具时隐藏。

## Architecture

在 `switchTool()` 函数中根据当前工具类型控制旋转按钮的 `u-hidden` 类，实现显示/隐藏切换。

## Components

### main.js

- 职责: 工具切换时控制旋转按钮可见性
- 接口: 修改 `switchTool()` 函数，增加旋转按钮显示逻辑
- 依赖: 无新增依赖

## Data Flow

1. 用户点击工具栏按钮 -> `switchTool(toolName)` 被调用
2. `switchTool()` 判断 `toolName === 'crop'`
3. 若为裁剪工具 -> 移除旋转按钮的 `u-hidden` 类
4. 若为其他工具 -> 添加旋转按钮的 `u-hidden` 类

## Constraints

- 旋转按钮在无图片加载时仍保持 disabled 状态（现有逻辑不变）
- 旋转按钮的 HTML 结构保持不变，仅控制显示/隐藏

## Acceptance Criteria

- [ ] 裁剪工具激活时，旋转按钮可见
- [ ] 切换到其他工具（画笔/文字/马赛克/形状）时，旋转按钮隐藏
- [ ] 旋转按钮的 disabled 状态逻辑不受影响
- [ ] JS 语法验证通过（node --check）
