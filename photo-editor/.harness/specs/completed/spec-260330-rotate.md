# 图片逆时针旋转功能

- 创建时间: 2026-03-30
- 状态: active
- 任务来源: 产品规格 03-prd-specs.md 第 29 行

## Goal

实现图片逆时针旋转功能，每次点击旋转 90 度，按钮位于属性栏撤销按钮左侧。

## Architecture

在 canvas.js 中新增旋转函数，通过 Canvas 的 translate + rotate 实现逆时针 90 度旋转。旋转后更新画布尺寸（宽高互换）并推入历史栈。UI 层在属性栏添加旋转按钮和隔离栏。

## Components

### canvas.js
- 职责: 提供 rotateImage 函数，执行逆时针 90 度旋转
- 接口: `rotateImage()` - 读取当前画布数据，旋转后重绘
- 依赖: state, history

### main.js
- 职责: 绑定旋转按钮点击事件
- 接口: 无新增导出
- 依赖: canvas.js, state.js

### index.html
- 职责: 添加旋转按钮和隔离栏 DOM 结构
- 接口: 无
- 依赖: 无

## Data Flow

1. 用户点击旋转按钮
2. main.js 调用 canvas.rotateImage()
3. canvas.js 获取当前 ImageData
4. 创建新画布（宽高互换）
5. 使用 ctx.translate + ctx.rotate(-Math.PI/2) 旋转
6. 绘制原图像到新画布
7. 更新 mainCanvas 尺寸和内容
8. history.push() 记录快照

## UI Design

```
属性栏布局：
[旋转按钮] | [撤销] [重做] [打开] [格式▼] [下载]
           ^
         隔离栏
```

旋转按钮图标：逆时针箭头

## Constraints

- 仅支持 90 度整数倍旋转
- 旋转后画布宽高互换
- 需要重新适应容器
- 未加载图片时按钮禁用

## Acceptance Criteria
- [ ] 点击旋转按钮，图片逆时针旋转 90 度
- [ ] 连续点击可多次旋转（180/270/360 度）
- [ ] 旋转操作可通过撤销恢复
- [ ] 未加载图片时按钮禁用
- [ ] 按钮位于撤销按钮左侧，有隔离栏分隔
