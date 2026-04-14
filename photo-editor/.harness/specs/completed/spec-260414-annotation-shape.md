# 扩展形状工具支持椭圆标注 Design Spec

- 创建时间: 2026-04-14
- 状态: completed
- 任务来源: 标注：在截图下方、新增标注按钮，支持框注、圈注等典型功能

## Goal
扩展现有的形状工具（ShapeTool），增加椭圆（圈注）支持，同时将形状类型选择从下拉菜单改为平铺按钮。

## Architecture
在现有 ShapeTool 基础上扩展：
1. 新增椭圆绘制逻辑，复用现有的快照/绘制/历史记录架构
2. 修改属性栏渲染，将下拉选择改为三个平铺按钮（箭头/矩形/椭圆）
3. 在 state.js 中默认形状类型保持为 'arrow'

## Components

### ShapeTool.js
- 职责: 形状工具核心逻辑，扩展支持椭圆
- 接口: 保持 BaseTool 接口不变
- 依赖: BaseTool, canvas, state, history
- 修改:
  - _drawShape 方法新增 'ellipse' 分支
  - 新增 _drawEllipse 方法绘制椭圆边框
  - renderPropertyBar 方法重写为平铺按钮

### state.js
- 职责: 状态管理
- 接口: 保持不变
- 依赖: 无
- 修改: toolOptions.shape.type 可选值新增 'ellipse'

### index.html
- 职责: 入口 HTML
- 修改: 无需修改

### main.js
- 职责: 应用入口
- 修改: 无需修改

## Data Flow
用户交互流程保持不变：
1. 选择形状工具 -> 点击属性栏类型按钮 -> 在画布拖拽 -> 绘制形状 -> 提交历史记录

## Data Model
state.js 中 toolOptions.shape 修改：
```javascript
shape: {
  type: 'arrow',  // 可选: 'arrow' | 'rect' | 'ellipse'
  color: '#ff0000',
  lineWidth: 2,
}
```

## UI Design
属性栏布局（从左到右）：
1. 标签"类型"
2. 三个平铺按钮（箭头/矩形/椭圆），图标+文字横向排列
3. 标签"颜色"
4. 颜色选择器
5. 标签"线宽"
6. 数字输入框

按钮样式：
- 选中状态：蓝色背景（#4a9eff，使用 var(--color-primary)）
- 未选中：灰色背景（#3d3d3d，使用 var(--color-surface-hover)）
- 图标+文字横向排列，间距 6px
- padding: 6px var(--space-sm)

## Error Handling
无需新增错误处理，复用现有逻辑。

## Constraints
- 椭圆仅绘制边框，不填充
- 颜色、线宽选项复用给所有形状类型
- 保持与现有工具的交互一致性

## Acceptance Criteria
- [ ] 形状工具属性栏显示三个平铺按钮（箭头/矩形/椭圆）
- [ ] 点击按钮可切换形状类型，选中状态高亮
- [ ] 选择"椭圆"可在画布上绘制椭圆边框
- [ ] 颜色、线宽设置对所有形状类型生效
- [ ] 椭圆绘制支持撤销/重做
