# Spec: Photo Editor

## Header

| 属性 | 值 |
|------|-----|
| 创建时间 | 2026-03-25 |
| 状态 | completed |
| 任务来源 | PRD 03-prd-specs.md |
| Goal | 实现本地图片编辑器，支持裁剪、文字标注、画笔涂鸦、马赛克、形状功能 |

## Architecture

单页应用，基于原生 Canvas API，零外部依赖。

```
+------------------+
|   index.html     |
+------------------+
         |
    +----+----+
    |         |
    v         v
+-------+ +-------+
|  CSS  | |  JS   |
| ITCSS | | ES6   |
+-------+ +-------+
```

## Components

### 1. UI 层

| 组件 | 职责 | 依赖 |
|------|------|------|
| Toolbar | 左侧工具栏，工具选择 | state.js |
| PropertyBar | 顶部属性栏，参数调整 | state.js |
| CanvasArea | 画布区域，图片展示与编辑 | canvas.js, tools/* |

### 2. 状态层

| 模块 | 职责 | 依赖 |
|------|------|------|
| state.js | 全局状态管理（当前工具、图片、参数） | 无 |
| history.js | 撤销/重做历史栈 | state.js |

### 3. 工具层

| 模块 | 职责 | 依赖 |
|------|------|------|
| BaseTool.js | 工具基类，定义生命周期钩子 | canvas.js |
| CropTool.js | 裁剪工具 | BaseTool.js |
| BrushTool.js | 画笔工具 | BaseTool.js |
| TextTool.js | 文字工具 | BaseTool.js |
| MosaicTool.js | 马赛克工具 | BaseTool.js |
| ShapeTool.js | 形状工具（箭头、矩形） | BaseTool.js |

### 4. 辅助模块

| 模块 | 职责 | 依赖 |
|------|------|------|
| canvas.js | Canvas 渲染管理 | state.js |
| file.js | 文件加载、下载 | 无 |
| math.js | 数学工具函数 | 无 |

## Data Flow

```
用户操作 -> Tool.onEvent() -> state 更新 -> canvas.render() -> 画面更新
                                     |
                                     v
                              history.push() -> 保存快照
```

### 撤销/重做流程

```
撤销: Ctrl+Z -> history.undo() -> state 恢复 -> canvas.render()
重做: Ctrl+Y -> history.redo() -> state 恢复 -> canvas.render()
```

## Data Model

```javascript
// state.js
const state = {
  tool: 'crop',              // 当前工具: crop | brush | text | mosaic | shape
  image: null,               // 原始图片 Image 对象
  canvasWidth: 0,
  canvasHeight: 0,
  toolOptions: {
    brush: { size: 5, color: '#ff0000' },
    text: { fontSize: 24, color: '#000000', fontFamily: 'Arial' },
    shape: { type: 'arrow', color: '#ff0000', lineWidth: 2 },
    mosaic: { size: 10 },
  },
};

// history.js
const history = {
  stack: [],          // ImageData 快照数组
  index: -1,          // 当前位置
  maxSize: 50,        // 最大历史记录数
};
```

## UI Design

### 布局

```
+------------------------------------------------------------------+
|  PropertyBar (顶部属性栏)                                         |
|  [工具参数: 大小/颜色/字体]        [撤销] [重做] [打开] [下载]      |
+--------+---------------------------------------------------------+
|        |                                                         |
| Toolbar|                    CanvasArea                           |
|        |                   (Canvas)                               |
| [裁剪] |                                                         |
| [画笔] |                                                         |
| [文字] |                                                         |
| [马赛克]|                                                         |
| [形状] |                                                         |
|        |                                                         |
+--------+---------------------------------------------------------+
```

### 交互方式

| 操作 | 方式 |
|------|------|
| 打开图片 | 点击"打开"按钮 或 拖拽图片到画布区域 |
| 保存图片 | 点击"下载"按钮 |

### 工具栏工具

| 工具 | 图标 | 功能 |
|------|------|------|
| 裁剪 | crop | 自由裁剪、原始比例、常用比例（4:3, 16:9, 1:1） |
| 画笔 | brush | 自由绘制，可调大小和颜色 |
| 文字 | text | 添加文字标注，可调字体大小和颜色 |
| 马赛克 | mosaic | 区域马赛克处理，可调块大小 |
| 形状 | shape | 箭头、矩形框标注 |

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+Z | 撤销 |
| Ctrl+Y | 重做 |
| Ctrl+S | 下载 |

## Error Handling

| 场景 | 处理方式 |
|------|----------|
| 未加载图片时操作 | 提示"请先打开图片"，禁用工具栏 |
| 图片过大 | 限制最大尺寸 4096x4096，超出时缩放显示 |
| 下载失败 | 捕获异常，提示"下载失败，请重试" |
| 非图片文件拖入 | 提示"请上传图片文件（jpg/png/webp）" |
| 历史记录超限 | 移除最早记录，保持队列长度 |
| 浏览器不支持 Canvas | 提示"浏览器不支持，请使用现代浏览器" |

## Constraints

### 技术约束

- 支持 JPG、PNG、WebP 格式输入
- 输出格式：默认与输入一致，用户可自选（PNG/JPG/WebP）
- 最大历史记录：50 步
- 推荐浏览器：Chrome、Firefox、Safari、Edge 最新版

### 编码规范

| 规范 | 范围 |
|------|------|
| Airbnb JavaScript Style Guide | JavaScript 编码规范 |
| ITCSS | CSS 架构分层 |
| BEM | CSS 命名约定 |

## File Structure

```
photo-editor/
├── index.html                    # 入口 HTML
├── css/
│   ├── settings/
│   │   └── _variables.css        # CSS 变量
│   ├── tools/
│   │   └── _mixins.css           # mixin 函数
│   ├── generic/
│   │   └── _reset.css            # 重置样式
│   ├── elements/
│   │   └── _base.css             # HTML 元素基础样式
│   ├── objects/
│   │   └── _layout.css           # 布局模式
│   ├── components/
│   │   ├── _toolbar.css          # 左侧工具栏
│   │   ├── _property-bar.css     # 顶部属性栏
│   │   ├── _canvas.css           # 画布区域
│   │   └── _modal.css            # 弹窗组件
│   ├── utilities/
│   │   └── _utilities.css        # 工具类
│   └── main.css                  # 入口文件
├── js/
│   ├── main.js                   # 入口、初始化
│   ├── state.js                  # 状态管理
│   ├── canvas.js                 # Canvas 管理
│   ├── history.js                # 撤销/重做
│   ├── tools/
│   │   ├── BaseTool.js           # 工具基类
│   │   ├── CropTool.js           # 裁剪工具
│   │   ├── BrushTool.js          # 画笔工具
│   │   ├── TextTool.js           # 文字工具
│   │   ├── MosaicTool.js         # 马赛克工具
│   │   └── ShapeTool.js          # 形状工具
│   └── utils/
│       ├── file.js               # 文件操作
│       └── math.js               # 数学工具
└── assets/
    └── icons/                    # SVG 图标
```

## Acceptance Criteria

1. 用户可通过"打开"按钮或拖拽加载图片
2. 用户可选择裁剪工具，支持自由裁剪、原始比例、常用比例
3. 用户可选择画笔工具，在图片上自由绘制，可调整大小和颜色
4. 用户可选择文字工具，在图片上添加文字标注
5. 用户可选择马赛克工具，对区域进行马赛克处理
6. 用户可选择形状工具，绘制箭头和矩形框
7. 用户可通过 Ctrl+Z 撤销操作，Ctrl+Y 重做操作
8. 用户可下载编辑后的图片，格式默认与输入一致或自选
9. 界面布局为左侧工具栏 + 顶部属性栏 + 画布区域
10. 代码遵循 Airbnb JS 规范、ITCSS 架构、BEM 命名
