# 滤镜功能设计规格

日期: 2026-04-15
来源: /harness:iterate-feature
状态: active

## 目标

在 PhotoEditor 中新增滤镜功能，支持 6 种预设滤镜（原片、鲜明、暖色、冷色、单色、戏剧效果），参考 iPhone 照片编辑中的滤镜体验。

## 范围

新增文件:
- js/tools/FilterTool.js (滤镜工具类)
- js/utils/filter.js (滤镜像素处理函数)

修改文件:
- index.html (新增滤镜工具栏按钮)
- js/main.js (导入并注册 FilterTool)
- js/state.js (新增 filter 工具选项)
- css/components/_toolbar.css (可选: 滤镜按钮样式)
- css/components/_property-bar.css (滤镜预设按钮样式)

## 用户界面

### 左侧工具栏

在现有 5 个工具按钮（裁剪、画笔、文字、马赛克、形状）之后，分隔线下方，新增滤镜按钮。按钮样式与现有工具一致，图标采用色块/调色板 SVG 图标。

### 顶部属性栏

点击滤镜工具后，属性栏显示 6 个色块预览按钮，排成一排：
- 每个按钮约 48x48px，圆角，带滤镜名称文字
- 色块颜色反映滤镜色调倾向
- 当前选中滤镜有蓝色边框高亮
- 按钮间距紧凑

### 滤镜预设

| 滤镜 | 内部名 | 色块色调 |
|------|-------|---------|
| 原片 | original | 灰色 (#888/#555 渐变) |
| 鲜明 | vivid | 暖红到橙色渐变 |
| 暖色 | warm | 橙到深橙渐变 |
| 冷色 | cool | 天蓝到深蓝渐变 |
| 单色 | mono | 灰到深灰渐变 |
| 戏剧效果 | dramatic | 深灰到黑色渐变 |

## 交互行为

1. 点击左侧"滤镜"按钮 → 激活滤镜工具，属性栏显示滤镜预设列表
2. 点击某个预设 → 立即应用到画布，实时预览
3. 点击「原片」→ 还原为原始图片（无滤镜状态）
4. 切换到其他工具 → 将当前画布状态推入 history 栈
5. 未加载图片时，滤镜按钮显示为禁用状态

## 技术实现

### FilterTool 类

继承 BaseTool，实现:
- activate(): 绑定 canvas 相关事件，显示属性栏
- deactivate(): 将当前画布推入 history 栈，清理事件
- renderPropertyBar(container): 渲染 6 个滤镜色块按钮
- applyPreset(presetName): 应用滤镜预设

核心逻辑:
- 每次应用滤镜前，先从 state.get('image') 重绘原始图片到画布
- 然后调用 filter.js 中的对应滤镜函数处理像素
- 确保滤镜效果不叠加（始终基于原图）

### filter.js 像素处理

纯函数，接收 ImageData 对象，返回修改后的 ImageData:

- applyVivid(imageData): 饱和度 + 对比度提升
- applyWarm(imageData): 暖色调偏移（增加红/绿通道）
- applyCool(imageData): 冷色调偏移（增加蓝色通道）
- applyMono(imageData): 灰度化（亮度加权平均: 0.299R + 0.587G + 0.114B）
- applyDramatic(imageData): 高对比度 + 暗化处理

### 状态管理

state.js toolOptions 新增:
```javascript
filter: { preset: 'original' }
```

### 历史管理

- 切换滤镜时: 不推入 history 栈（用户可自由切换预览）
- 离开滤镜工具时: 将当前画布推入 history 栈
- 「原片」选择: 从原始图片重绘，不推入 history

## 验收标准

1. 左侧工具栏显示滤镜按钮，点击可切换
2. 顶部属性栏显示 6 个滤镜色块按钮
3. 点击任意滤镜立即应用到画布
4. 「原片」可完全还原到加载时的图片
5. 离开滤镜工具后，当前滤镜效果保留在画布中
6. 切换滤镜不产生撤销步骤，离开工具才产生
7. 撤销后可回到上一步状态
8. 未加载图片时，滤镜相关 UI 显示禁用状态
