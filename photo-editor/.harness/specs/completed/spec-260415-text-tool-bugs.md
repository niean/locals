# Spec: 修复文字工具两个 Bug

- 创建时间: 2026-04-15
- 状态: 已完成 (2026-04-15)

## Goal
修复文字工具（TextTool）的两个交互 Bug：
1. 添加文字框后无法就地输入，需要再点击一下输入框才能获得焦点
2. 完成文字输入后，文字渲染位置与输入框显示位置不一致（下移）

## Scope
- `js/tools/TextTool.js` - 修复 `_createInput` 和 `_commitText` 方法

## 问题分析

### Bug 1: 输入框无法自动获得焦点
**现象**: 点击画布创建文字输入框后，输入框出现但无焦点，需再次点击才能输入。

**根因**: `onMouseDown` 事件在 overlay canvas 上触发，`_createInput` 中虽然调用了 `input.focus()`，但 mousedown 事件流尚未结束。浏览器在 mousedown 事件处理完后，会重新评估焦点归属，导致 focus 被覆盖。

**方案**: 使用 `requestAnimationFrame` 或 `setTimeout(0)` 延迟 `focus()` 调用，确保在事件循环下一帧执行，避开 mousedown 事件流的焦点重置。

### Bug 2: 文字渲染位置下移
**现象**: 输入框显示在位置 A，按 Enter 提交后文字渲染在位置 B（A 的下方），所见非所得。

**根因**: `_createInput` 中使用了 `top: ${cssY - 14}px` 硬编码偏移（TextTool.js:41），使输入框视觉上略高于点击位置。但 `_commitText` 中使用 `ctx.fillText(text, x, y)` 且 `textBaseline = 'top'`，直接在原始 y 坐标渲染，未考虑 `-14px` 偏移。两者不一致导致位置跳变。

**方案**: 去掉 `_createInput` 中的 `-14px` 硬编码偏移，使输入框的 `top` 与 `textBaseline: 'top'` 渲染基线对齐。即 `top: ${cssY}px`。

## 验收标准

1. [ ] 点击画布创建文字输入框后，输入框自动获得焦点，可立即输入文字，无需再次点击
2. [ ] 按 Enter 提交文字后，渲染的文字位置与输入框显示位置一致，无明显位置跳变
3. [ ] 切换工具后再切换回来，文字工具正常工作
4. [ ] 按 Escape 取消输入框，不留下任何渲染内容
5. [ ] 不同字号（8-200px）下，输入框与渲染位置均保持一致
