# 文件导航

## 源码文件映射

| 文件 | 职责 |
|------|------|
| index.html | 入口 HTML，包含工具栏/属性栏/画布区域布局和 SVG 图标 |
| css/main.css | CSS 入口，ITCSS 分层 @import |
| css/settings/_variables.css | CSS 自定义属性（颜色、间距、尺寸、字体） |
| css/generic/_reset.css | 浏览器样式重置 |
| css/elements/_base.css | HTML 基础元素样式 |
| css/objects/_layout.css | Flex 布局模式（o-app） |
| css/components/_toolbar.css | 左侧工具栏组件 |
| css/components/_property-bar.css | 顶部属性栏组件 |
| css/components/_canvas.css | 画布区域组件 |
| css/components/_modal.css | Toast 提示组件 |
| css/components/_crop-actions.css | 裁剪工具确认/取消按钮浮动层样式 |
| css/tools/_mixins.css | 预留: 通用可复用 CSS 片段 |
| css/utilities/_utilities.css | 工具类（u-hidden, u-visually-hidden） |
| js/main.js | 应用入口，模块组装、事件绑定 |
| js/state.js | 发布-订阅状态管理 |
| js/canvas.js | Canvas 初始化、图片加载、overlay 管理、容器访问接口 |
| js/history.js | 撤销/重做 ImageData 快照栈 |
| js/tools/BaseTool.js | 工具基类 |
| js/tools/CropTool.js | 裁剪工具 |
| js/tools/BrushTool.js | 画笔工具 |
| js/tools/TextTool.js | 文字工具 |
| js/tools/MosaicTool.js | 马赛克工具 |
| js/tools/ShapeTool.js | 形状工具 |
| js/utils/file.js | 文件加载/下载 |
| js/utils/math.js | 数学工具函数 |
