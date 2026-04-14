# 架构

## 模块结构

```
index.html (入口)
  -> css/main.css (ITCSS 分层样式)
  -> js/main.js (应用入口)
       -> js/state.js (状态管理)
       -> js/canvas.js (Canvas 渲染)
       -> js/history.js (撤销/重做)
       -> js/tools/*.js (工具层)
       -> js/utils/*.js (工具函数)
```

## 模块职责

| 模块 | 职责 |
|------|------|
| state.js | 发布-订阅状态管理，存储当前工具、图片、工具选项 |
| history.js | ImageData 快照栈，支持撤销/重做，最大 50 步 |
| canvas.js | Canvas 初始化、图片加载缩放、overlay 管理、容器访问接口 |
| BaseTool.js | 工具基类，定义 activate/deactivate/mouse 事件生命周期 |
| CropTool.js | 裁剪工具，支持自由/固定比例选区 |
| BrushTool.js | 画笔工具，自由绘制 |
| TextTool.js | 文字工具，浮动输入框 + Canvas 文字渲染 |
| MosaicTool.js | 马赛克工具，区域像素化 |
| ShapeTool.js | 形状工具，箭头/矩形/椭圆绘制（平铺按钮选择） |
| file.js | 文件加载（FileReader）和下载（toDataURL） |
| math.js | 数学工具函数（clamp, distance） |
| main.js | 应用入口，模块组装、事件绑定、工具切换 |

## 跨模块依赖

```
main.js -> state, canvas, history, tools/*, utils/file
canvas.js -> state, history
tools/* -> BaseTool, canvas, state, history
BaseTool -> canvas
utils/ -> 无依赖
```

## 页面布局与模块映射

| UI 区域 | 对应模块/文件 | 职责 |
|---------|-------------|------|
| 顶部属性栏 | index.html + js/main.js | 显示工具选项、旋转、撤销/重做、文件操作 |
| 左侧工具栏 | index.html + js/main.js | 工具切换按钮 |
| 画布区域 | index.html + js/canvas.js | 图片显示和编辑 |

关键设计决策：
- 工具通过 overlay canvas 接收鼠标事件，在 main canvas 上绘制
- 每次绘制操作完成后 push 到 history 栈
- 工具切换时 deactivate 当前工具 -> activate 新工具
