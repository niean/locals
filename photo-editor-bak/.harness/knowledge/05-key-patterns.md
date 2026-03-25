# 关键模式

## 工具基类模式

所有编辑工具继承 BaseTool，实现统一生命周期：
- `activate()`: 绑定 overlay canvas 鼠标事件
- `deactivate()`: 解绑事件，清除 overlay
- `onMouseDown/Move/Up()`: 子类重写实现具体行为
- `renderPropertyBar(container)`: 渲染工具属性控件到指定容器
- `getCanvasPoint(e)`: 将鼠标事件坐标转换为 canvas 坐标

## 双 Canvas 架构

- mainCanvas: 存储实际图片数据，工具在此绘制
- overlayCanvas: 叠在 mainCanvas 上，用于临时视觉反馈（裁剪选区、预览等）
- 事件绑定在 overlayCanvas 上，绘制结果写入 mainCanvas

## 发布-订阅状态管理

state.js 提供 get/set/on/off/emit，工具通过 getToolOption/setToolOption 访问工具选项。状态变化通过事件通知订阅者。

## ImageData 快照撤销

history.js 在每次操作完成后用 getImageData 保存完整画布快照。undo/redo 通过 putImageData 恢复。onChange 回调通知 UI 更新按钮状态。
