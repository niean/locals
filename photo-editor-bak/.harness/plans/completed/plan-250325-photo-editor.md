# Photo Editor Implementation Plan

- 创建时间: 2026-03-25 16:55
- 状态: completed
- 关联 spec: .harness/specs/active/spec-250325-photo-editor.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/skills/superpowers/subagent-driven-development.md (recommended) or .harness/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现本地图片编辑器，支持裁剪/画笔/文字/马赛克/形状功能，纯 HTML+CSS+JS，浏览器直接打开

**Architecture:** 单页 Canvas 应用，工具基类模式（BaseTool -> 具体工具），事件驱动状态管理，ImageData 快照实现撤销重做。CSS 采用 ITCSS 分层 + BEM 命名。

**Tech Stack:** HTML5 Canvas API, ES6 Modules (via script type=module), CSS Custom Properties, 零外部依赖

---

## File Structure

```
photo-editor/
├── index.html                    # 入口 HTML，引用 main.css + main.js
├── css/
│   ├── settings/
│   │   └── _variables.css        # CSS 变量（颜色、间距、字体）
│   ├── tools/
│   │   └── _mixins.css           # 不使用预处理器，此文件放通用 CSS 片段
│   ├── generic/
│   │   └── _reset.css            # 浏览器重置
│   ├── elements/
│   │   └── _base.css             # HTML 基础元素样式
│   ├── objects/
│   │   └── _layout.css           # 布局模式（flex 容器）
│   ├── components/
│   │   ├── _toolbar.css          # 左侧工具栏
│   │   ├── _property-bar.css     # 顶部属性栏
│   │   ├── _canvas.css           # 画布区域
│   │   └── _modal.css            # Toast 提示
│   ├── utilities/
│   │   └── _utilities.css        # 工具类
│   └── main.css                  # @import 入口
├── js/
│   ├── main.js                   # 应用入口，初始化各模块
│   ├── state.js                  # 全局状态管理
│   ├── canvas.js                 # Canvas 渲染管理
│   ├── history.js                # 撤销/重做
│   ├── tools/
│   │   ├── BaseTool.js           # 工具基类
│   │   ├── CropTool.js           # 裁剪工具
│   │   ├── BrushTool.js          # 画笔工具
│   │   ├── TextTool.js           # 文字工具
│   │   ├── MosaicTool.js         # 马赛克工具
│   │   └── ShapeTool.js          # 形状工具
│   └── utils/
│       ├── file.js               # 文件加载/下载
│       └── math.js               # 数学工具函数
└── assets/
    └── icons/                    # SVG 图标（内联在 HTML 中）
```

---

### Task 1: HTML 骨架 + CSS 基础系统

**Files:**
- Create: `index.html`
- Create: `css/main.css`
- Create: `css/settings/_variables.css`
- Create: `css/tools/_mixins.css`
- Create: `css/generic/_reset.css`
- Create: `css/elements/_base.css`
- Create: `css/objects/_layout.css`
- Create: `css/components/_toolbar.css`
- Create: `css/components/_property-bar.css`
- Create: `css/components/_canvas.css`
- Create: `css/components/_modal.css`
- Create: `css/utilities/_utilities.css`

**验证方式:** 浏览器打开 index.html，可见左侧工具栏 + 顶部属性栏 + 画布区域的三栏布局，工具按钮可点击高亮

- [ ] **Step 1: 创建 CSS 变量文件**

`css/settings/_variables.css`:
```css
:root {
  /* 颜色 */
  --color-bg: #1e1e1e;
  --color-surface: #2d2d2d;
  --color-surface-hover: #3d3d3d;
  --color-border: #404040;
  --color-text: #e0e0e0;
  --color-text-secondary: #999;
  --color-primary: #4a9eff;
  --color-primary-hover: #3a8eef;
  --color-danger: #ff4444;
  --color-canvas-bg: #1a1a1a;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;

  /* 尺寸 */
  --toolbar-width: 48px;
  --property-bar-height: 44px;
  --icon-size: 20px;
  --border-radius: 4px;

  /* 字体 */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-sm: 12px;
  --font-size-md: 13px;

  /* 过渡 */
  --transition-fast: 0.15s ease;
}
```

- [ ] **Step 2: 创建重置 + 基础样式**

`css/generic/_reset.css`:
```css
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

`css/elements/_base.css`:
```css
html,
body {
  height: 100%;
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  color: var(--color-text);
  background-color: var(--color-bg);
  overflow: hidden;
  user-select: none;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
}

input[type="number"],
input[type="text"],
select {
  font: inherit;
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 2px 6px;
  outline: none;
}

input[type="number"] {
  width: 56px;
}

input[type="color"] {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
}
```

- [ ] **Step 3: 创建布局样式**

`css/objects/_layout.css`:
```css
.o-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.o-app__body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.o-app__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-canvas-bg);
  position: relative;
  overflow: hidden;
}
```

- [ ] **Step 4: 创建组件样式**

`css/components/_toolbar.css`:
```css
.c-toolbar {
  width: var(--toolbar-width);
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm) 0;
  gap: var(--space-xs);
}

.c-toolbar__btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  transition: background-color var(--transition-fast);
}

.c-toolbar__btn:hover {
  background-color: var(--color-surface-hover);
}

.c-toolbar__btn.is-active {
  background-color: var(--color-primary);
  color: #fff;
}

.c-toolbar__btn svg {
  width: var(--icon-size);
  height: var(--icon-size);
}

.c-toolbar__separator {
  width: 24px;
  height: 1px;
  background-color: var(--color-border);
  margin: var(--space-xs) 0;
}
```

`css/components/_property-bar.css`:
```css
.c-property-bar {
  height: var(--property-bar-height);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 var(--space-lg);
  gap: var(--space-md);
}

.c-property-bar__group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.c-property-bar__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.c-property-bar__spacer {
  flex: 1;
}

.c-property-bar__btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  transition: background-color var(--transition-fast);
}

.c-property-bar__btn:hover {
  background-color: var(--color-surface-hover);
}

.c-property-bar__btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.c-property-bar__btn:disabled:hover {
  background-color: transparent;
}

.c-property-bar__select {
  font: inherit;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 2px 6px;
  outline: none;
}

.c-property-bar__select:disabled {
  opacity: 0.3;
}

.c-property-bar__btn svg {
  width: 16px;
  height: 16px;
}
```

`css/components/_canvas.css`:
```css
.c-canvas-area {
  position: relative;
}

.c-canvas-area__canvas {
  display: block;
  cursor: crosshair;
}

.c-canvas-area__overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.c-canvas-area__placeholder {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  pointer-events: none;
}

.c-canvas-area__placeholder svg {
  width: 48px;
  height: 48px;
  opacity: 0.4;
}
```

`css/components/_modal.css`:
```css
.c-toast {
  position: fixed;
  top: var(--space-xl);
  left: 50%;
  transform: translateX(-50%) translateY(-20px);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-size-sm);
  opacity: 0;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  z-index: 1000;
  pointer-events: none;
}

.c-toast.is-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

- [ ] **Step 5: 创建工具类和入口 CSS**

`css/tools/_mixins.css`:
```css
/* 预留: 纯 CSS 无 mixin，此文件放通用可复用片段 */
```

`css/utilities/_utilities.css`:
```css
.u-hidden {
  display: none !important;
}

.u-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
```

`css/main.css`:
```css
/* Settings */
@import 'settings/_variables.css';

/* Tools */
@import 'tools/_mixins.css';

/* Generic */
@import 'generic/_reset.css';

/* Elements */
@import 'elements/_base.css';

/* Objects */
@import 'objects/_layout.css';

/* Components */
@import 'components/_toolbar.css';
@import 'components/_property-bar.css';
@import 'components/_canvas.css';
@import 'components/_modal.css';

/* Utilities */
@import 'utilities/_utilities.css';
```

- [ ] **Step 6: 创建 index.html**

`index.html`: 完整 HTML 骨架，包含工具栏 SVG 图标、属性栏控件占位、画布区域、Toast 容器。工具栏包含裁剪/画笔/文字/马赛克/形状五个按钮。属性栏包含工具参数区（动态）+ 操作按钮区（撤销/重做/打开/下载）。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Photo Editor</title>
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
  <div class="o-app">
    <!-- 顶部属性栏 -->
    <div class="c-property-bar" id="propertyBar">
      <div class="c-property-bar__group" id="toolOptions">
        <!-- 工具参数由 JS 动态填充 -->
      </div>
      <div class="c-property-bar__spacer"></div>
      <div class="c-property-bar__group">
        <button class="c-property-bar__btn" id="btnUndo" title="撤销 (Ctrl+Z)" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 10h10a5 5 0 0 1 0 10H9"/>
            <path d="M3 10l4-4M3 10l4 4"/>
          </svg>
        </button>
        <button class="c-property-bar__btn" id="btnRedo" title="重做 (Ctrl+Y)" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10H11a5 5 0 0 0 0 10h4"/>
            <path d="M21 10l-4-4M21 10l-4 4"/>
          </svg>
        </button>
        <button class="c-property-bar__btn" id="btnOpen" title="打开图片">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
            <path d="M17 8l-5-5-5 5"/>
            <path d="M12 3v12"/>
          </svg>
        </button>
        <select id="downloadFormat" class="c-property-bar__select" disabled>
          <option value="">原始格式</option>
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPG</option>
          <option value="image/webp">WebP</option>
        </select>
        <button class="c-property-bar__btn" id="btnDownload" title="下载 (Ctrl+S)" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
            <path d="M7 10l5 5 5-5"/>
            <path d="M12 15V3"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="o-app__body">
      <!-- 左侧工具栏 -->
      <div class="c-toolbar" id="toolbar">
        <button class="c-toolbar__btn is-active" data-tool="crop" title="裁剪">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2v14a2 2 0 0 0 2 2h14"/>
            <path d="M18 22V8a2 2 0 0 0-2-2H2"/>
          </svg>
        </button>
        <button class="c-toolbar__btn" data-tool="brush" title="画笔">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
            <path d="M2 2l7.586 7.586"/>
            <circle cx="11" cy="11" r="2"/>
          </svg>
        </button>
        <button class="c-toolbar__btn" data-tool="text" title="文字">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7V4h16v3"/>
            <path d="M12 4v16"/>
            <path d="M8 20h8"/>
          </svg>
        </button>
        <button class="c-toolbar__btn" data-tool="mosaic" title="马赛克">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
          </svg>
        </button>
        <button class="c-toolbar__btn" data-tool="shape" title="形状">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M8 16l4-8 4 8"/>
          </svg>
        </button>
      </div>

      <!-- 画布区域 -->
      <div class="o-app__main" id="canvasWrapper">
        <div class="c-canvas-area" id="canvasArea">
          <canvas id="mainCanvas" class="c-canvas-area__canvas"></canvas>
          <canvas id="overlayCanvas" class="c-canvas-area__overlay"></canvas>
        </div>
        <div class="c-canvas-area__placeholder" id="placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <span>拖拽图片到此处 或 点击"打开"按钮</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <div class="c-toast" id="toast"></div>

  <!-- 隐藏文件输入 -->
  <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp" class="u-visually-hidden">

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 7: 浏览器验证布局**

打开 `index.html`，确认：
- 深色背景三栏布局正确显示
- 左侧工具栏 5 个图标按钮可见
- 顶部属性栏按钮可见
- 画布区域显示占位提示
- 点击工具栏按钮有 hover 效果

---

### Task 2: 状态管理 + 历史记录

**Files:**
- Create: `js/state.js`
- Create: `js/history.js`

**依赖:** 无
**验证方式:** 控制台测试 state 事件和 history 操作

- [ ] **Step 1: 创建 state.js**

`js/state.js`: 发布-订阅模式的状态管理。

```javascript
const listeners = {};

const state = {
  tool: 'crop',
  image: null,
  imageType: 'image/png',
  canvasWidth: 0,
  canvasHeight: 0,
  toolOptions: {
    crop: { ratio: 'free' },
    brush: { size: 5, color: '#ff0000' },
    text: { fontSize: 24, color: '#000000', fontFamily: 'Arial' },
    shape: { type: 'arrow', color: '#ff0000', lineWidth: 2 },
    mosaic: { size: 10 },
  },
};

function get(key) {
  return state[key];
}

function set(key, value) {
  const old = state[key];
  state[key] = value;
  emit(key, value, old);
}

function getToolOption(tool, key) {
  return state.toolOptions[tool]?.[key];
}

function setToolOption(tool, key, value) {
  if (state.toolOptions[tool]) {
    state.toolOptions[tool][key] = value;
    emit('toolOption', { tool, key, value });
  }
}

function on(event, fn) {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(fn);
}

function off(event, fn) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter((f) => f !== fn);
}

function emit(event, ...args) {
  if (!listeners[event]) return;
  listeners[event].forEach((fn) => fn(...args));
}

export { get, set, getToolOption, setToolOption, on, off, emit };
```

- [ ] **Step 2: 创建 history.js**

`js/history.js`: ImageData 快照栈，支持撤销/重做。

```javascript
const MAX_SIZE = 50;
let stack = [];
let index = -1;
let canvas = null;
let ctx = null;

function init(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  stack = [];
  index = -1;
}

let onChangeCallback = null;

function push() {
  if (!canvas || canvas.width === 0 || canvas.height === 0) return;
  // 丢弃 index 之后的记录
  stack = stack.slice(0, index + 1);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  stack.push(data);
  if (stack.length > MAX_SIZE) {
    stack.shift();
  } else {
    index += 1;
  }
  if (index < 0) index = 0;
  if (onChangeCallback) onChangeCallback();
}

function undo() {
  if (!canUndo()) return null;
  index -= 1;
  if (onChangeCallback) onChangeCallback();
  return stack[index];
}

function redo() {
  if (!canRedo()) return null;
  index += 1;
  if (onChangeCallback) onChangeCallback();
  return stack[index];
}

function onChange(fn) {
  onChangeCallback = fn;
}

function canUndo() {
  return index > 0;
}

function canRedo() {
  return index < stack.length - 1;
}

function clear() {
  stack = [];
  index = -1;
}

export { init, push, undo, redo, canUndo, canRedo, clear, onChange };
```

---

### Task 3: Canvas 管理 + 工具函数

**Files:**
- Create: `js/canvas.js`
- Create: `js/utils/file.js`
- Create: `js/utils/math.js`

**依赖:** state.js, history.js
**验证方式:** 加载图片后画布正确显示

- [ ] **Step 1: 创建 math.js**

`js/utils/math.js`:

```javascript
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export { clamp, distance };
```

- [ ] **Step 2: 创建 file.js**

`js/utils/file.js`:

```javascript
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请上传图片文件（jpg/png/webp）'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

function downloadCanvas(canvas, filename, mimeType) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL(mimeType, 0.92);
  link.click();
}

function getMimeType(file) {
  const typeMap = {
    'image/jpeg': 'image/jpeg',
    'image/png': 'image/png',
    'image/webp': 'image/webp',
  };
  return typeMap[file.type] || 'image/png';
}

function getExtension(mimeType) {
  const extMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return extMap[mimeType] || 'png';
}

export { loadImageFromFile, downloadCanvas, getMimeType, getExtension };
```

- [ ] **Step 3: 创建 canvas.js**

`js/canvas.js`: Canvas 渲染管理，处理图片加载后的缩放/居中显示。

```javascript
import * as state from './state.js';
import * as history from './history.js';

const MAX_DIM = 4096;

let mainCanvas = null;
let mainCtx = null;
let overlayCanvas = null;
let overlayCtx = null;
let wrapperEl = null;

function init(main, overlay, wrapper) {
  mainCanvas = main;
  mainCtx = main.getContext('2d');
  overlayCanvas = overlay;
  overlayCtx = overlay.getContext('2d');
  wrapperEl = wrapper;
  history.init(mainCanvas);
}

function loadImage(img) {
  let { width, height } = img;

  // 限制最大尺寸
  if (width > MAX_DIM || height > MAX_DIM) {
    const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // 适应容器
  const wrapRect = wrapperEl.getBoundingClientRect();
  const padding = 40;
  const maxW = wrapRect.width - padding * 2;
  const maxH = wrapRect.height - padding * 2;
  let displayW = width;
  let displayH = height;

  if (displayW > maxW || displayH > maxH) {
    const scale = Math.min(maxW / displayW, maxH / displayH);
    displayW = Math.round(displayW * scale);
    displayH = Math.round(displayH * scale);
  }

  mainCanvas.width = displayW;
  mainCanvas.height = displayH;
  overlayCanvas.width = displayW;
  overlayCanvas.height = displayH;

  state.set('canvasWidth', displayW);
  state.set('canvasHeight', displayH);

  mainCtx.drawImage(img, 0, 0, displayW, displayH);
  history.clear();
  history.push();
}

function getMainCanvas() {
  return mainCanvas;
}

function getMainCtx() {
  return mainCtx;
}

function getOverlayCanvas() {
  return overlayCanvas;
}

function getOverlayCtx() {
  return overlayCtx;
}

function clearOverlay() {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

function restoreFromImageData(imageData) {
  mainCanvas.width = imageData.width;
  mainCanvas.height = imageData.height;
  overlayCanvas.width = imageData.width;
  overlayCanvas.height = imageData.height;
  mainCtx.putImageData(imageData, 0, 0);
}

export {
  init,
  loadImage,
  getMainCanvas,
  getMainCtx,
  getOverlayCanvas,
  getOverlayCtx,
  clearOverlay,
  restoreFromImageData,
};
```

---

### Task 4: 工具基类 BaseTool

**Files:**
- Create: `js/tools/BaseTool.js`

**依赖:** canvas.js, state.js, history.js
**验证方式:** 无独立验证，由具体工具继承后验证

- [ ] **Step 1: 创建 BaseTool.js**

`js/tools/BaseTool.js`:

```javascript
import * as canvas from '../canvas.js';

class BaseTool {
  constructor(name) {
    this.name = name;
    this.isActive = false;
    this._bindHandlers();
  }

  _bindHandlers() {
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
  }

  activate() {
    this.isActive = true;
    const overlay = canvas.getOverlayCanvas();
    overlay.addEventListener('mousedown', this._onMouseDown);
    overlay.addEventListener('mousemove', this._onMouseMove);
    overlay.addEventListener('mouseup', this._onMouseUp);
    this.onActivate();
  }

  deactivate() {
    this.isActive = false;
    const overlay = canvas.getOverlayCanvas();
    overlay.removeEventListener('mousedown', this._onMouseDown);
    overlay.removeEventListener('mousemove', this._onMouseMove);
    overlay.removeEventListener('mouseup', this._onMouseUp);
    canvas.clearOverlay();
    this.onDeactivate();
  }

  getCanvasPoint(e) {
    const rect = canvas.getOverlayCanvas().getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  // 子类重写
  onActivate() {}
  onDeactivate() {}
  onMouseDown(e) {}
  onMouseMove(e) {}
  onMouseUp(e) {}
  renderPropertyBar(container) {}
}

export default BaseTool;
```

---

### Task 5: CropTool（裁剪工具）

**Files:**
- Create: `js/tools/CropTool.js`

**依赖:** BaseTool.js, canvas.js, state.js, history.js
**验证方式:** 选择裁剪工具，拖拽选区，属性栏比例切换，确认裁剪

- [ ] **Step 1: 创建 CropTool.js**

`js/tools/CropTool.js`: 支持自由裁剪 + 固定比例，拖拽选区 + 确认/取消按钮。

```javascript
import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';

const RATIOS = {
  free: null,
  original: 'original',
  '1:1': 1,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
};

class CropTool extends BaseTool {
  constructor() {
    super('crop');
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.cropRect = null;
  }

  onActivate() {
    this.cropRect = null;
  }

  onDeactivate() {
    this.cropRect = null;
    canvas.clearOverlay();
  }

  onMouseDown(e) {
    const p = this.getCanvasPoint(e);
    this.isDragging = true;
    this.startX = p.x;
    this.startY = p.y;
    this.cropRect = null;
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    const p = this.getCanvasPoint(e);
    this.cropRect = this._calcRect(this.startX, this.startY, p.x, p.y);
    this._drawCropOverlay();
  }

  onMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.cropRect && this.cropRect.w > 5 && this.cropRect.h > 5) {
      this._drawCropOverlay();
      this._showCropActions();
    }
  }

  _calcRect(x1, y1, x2, y2) {
    let x = Math.min(x1, x2);
    let y = Math.min(y1, y2);
    let w = Math.abs(x2 - x1);
    let h = Math.abs(y2 - y1);

    const ratioKey = state.getToolOption('crop', 'ratio') || 'free';
    const ratioVal = RATIOS[ratioKey];

    if (ratioVal === 'original') {
      const cw = state.get('canvasWidth');
      const ch = state.get('canvasHeight');
      if (cw && ch) {
        const r = cw / ch;
        if (w / h > r) {
          w = h * r;
        } else {
          h = w / r;
        }
      }
    } else if (typeof ratioVal === 'number') {
      if (w / h > ratioVal) {
        w = h * ratioVal;
      } else {
        h = w / ratioVal;
      }
    }

    // 限制在画布内
    const cw = state.get('canvasWidth');
    const ch = state.get('canvasHeight');
    x = Math.max(0, Math.min(x, cw - w));
    y = Math.max(0, Math.min(y, ch - h));

    return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
  }

  _drawCropOverlay() {
    const ctx = canvas.getOverlayCtx();
    const oc = canvas.getOverlayCanvas();
    ctx.clearRect(0, 0, oc.width, oc.height);
    if (!this.cropRect) return;

    const { x, y, w, h } = this.cropRect;

    // 暗色遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, oc.width, oc.height);

    // 清除选区
    ctx.clearRect(x, y, w, h);

    // 选区边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.setLineDash([]);

    // 三等分线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 0.5;
    const thirdW = w / 3;
    const thirdH = h / 3;
    for (let i = 1; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + thirdW * i, y);
      ctx.lineTo(x + thirdW * i, y + h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + thirdH * i);
      ctx.lineTo(x + w, y + thirdH * i);
      ctx.stroke();
    }
  }

  _showCropActions() {
    // 在 overlay 上绘制确认/取消按钮
    const ctx = canvas.getOverlayCtx();
    const { x, y, w, h } = this.cropRect;
    const btnY = y + h + 8;
    const btnW = 60;
    const btnH = 24;

    // 确认按钮
    ctx.fillStyle = '#4a9eff';
    ctx.fillRect(x + w - btnW * 2 - 8, btnY, btnW, btnH);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('确认', x + w - btnW * 2 - 8 + btnW / 2, btnY + btnH / 2);

    // 取消按钮
    ctx.fillStyle = '#666';
    ctx.fillRect(x + w - btnW, btnY, btnW, btnH);
    ctx.fillStyle = '#fff';
    ctx.fillText('取消', x + w - btnW + btnW / 2, btnY + btnH / 2);

    // 监听点击
    const overlay = canvas.getOverlayCanvas();
    const clickHandler = (ev) => {
      const p = this.getCanvasPoint(ev);
      const confirmX = x + w - btnW * 2 - 8;
      const cancelX = x + w - btnW;

      if (p.y >= btnY && p.y <= btnY + btnH) {
        if (p.x >= confirmX && p.x <= confirmX + btnW) {
          this._applyCrop();
          overlay.removeEventListener('click', clickHandler);
        } else if (p.x >= cancelX && p.x <= cancelX + btnW) {
          this.cropRect = null;
          canvas.clearOverlay();
          overlay.removeEventListener('click', clickHandler);
        }
      }
    };
    overlay.addEventListener('click', clickHandler);
  }

  _applyCrop() {
    if (!this.cropRect) return;
    const { x, y, w, h } = this.cropRect;
    const mainCtx = canvas.getMainCtx();
    const imageData = mainCtx.getImageData(x, y, w, h);

    const mainC = canvas.getMainCanvas();
    const overlayC = canvas.getOverlayCanvas();
    mainC.width = w;
    mainC.height = h;
    overlayC.width = w;
    overlayC.height = h;
    mainCtx.putImageData(imageData, 0, 0);
    canvas.clearOverlay();

    state.set('canvasWidth', w);
    state.set('canvasHeight', h);
    history.push();
    this.cropRect = null;
  }

  renderPropertyBar(container) {
    const currentRatio = state.getToolOption('crop', 'ratio') || 'free';
    container.innerHTML = `
      <label class="c-property-bar__label">比例</label>
      <select id="cropRatio">
        ${Object.keys(RATIOS).map((key) => `<option value="${key}" ${key === currentRatio ? 'selected' : ''}>${key}</option>`).join('')}
      </select>
    `;
    container.querySelector('#cropRatio').addEventListener('change', (e) => {
      state.setToolOption('crop', 'ratio', e.target.value);
    });
  }
}

export default CropTool;
```

---

### Task 6: BrushTool（画笔工具）

**Files:**
- Create: `js/tools/BrushTool.js`

**依赖:** BaseTool.js, canvas.js, state.js, history.js
**验证方式:** 选择画笔，在图片上自由绘制，调整大小和颜色

- [ ] **Step 1: 创建 BrushTool.js**

```javascript
import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';

class BrushTool extends BaseTool {
  constructor() {
    super('brush');
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
  }

  onMouseDown(e) {
    this.isDrawing = true;
    const p = this.getCanvasPoint(e);
    this.lastX = p.x;
    this.lastY = p.y;

    const ctx = canvas.getMainCtx();
    ctx.beginPath();
    ctx.arc(p.x, p.y, state.getToolOption('brush', 'size') / 2, 0, Math.PI * 2);
    ctx.fillStyle = state.getToolOption('brush', 'color');
    ctx.fill();
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    const p = this.getCanvasPoint(e);
    const ctx = canvas.getMainCtx();

    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = state.getToolOption('brush', 'color');
    ctx.lineWidth = state.getToolOption('brush', 'size');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    this.lastX = p.x;
    this.lastY = p.y;
  }

  onMouseUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    history.push();
  }

  renderPropertyBar(container) {
    const size = state.getToolOption('brush', 'size');
    const color = state.getToolOption('brush', 'color');
    container.innerHTML = `
      <label class="c-property-bar__label">大小</label>
      <input type="number" id="brushSize" value="${size}" min="1" max="100">
      <label class="c-property-bar__label">颜色</label>
      <input type="color" id="brushColor" value="${color}">
    `;
    container.querySelector('#brushSize').addEventListener('change', (e) => {
      state.setToolOption('brush', 'size', parseInt(e.target.value, 10));
    });
    container.querySelector('#brushColor').addEventListener('input', (e) => {
      state.setToolOption('brush', 'color', e.target.value);
    });
  }
}

export default BrushTool;
```

---

### Task 7: TextTool（文字工具）

**Files:**
- Create: `js/tools/TextTool.js`

**依赖:** BaseTool.js, canvas.js, state.js, history.js
**验证方式:** 点击画布位置，弹出输入框，输入文字后渲染到画布

- [ ] **Step 1: 创建 TextTool.js**

```javascript
import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';

class TextTool extends BaseTool {
  constructor() {
    super('text');
    this.inputEl = null;
  }

  onMouseDown(e) {
    if (this.inputEl) {
      this._commitText();
      return;
    }
    const p = this.getCanvasPoint(e);
    this._createInput(p.x, p.y);
  }

  onDeactivate() {
    if (this.inputEl) {
      this._commitText();
    }
  }

  _createInput(x, y) {
    const overlay = canvas.getOverlayCanvas();
    const rect = overlay.getBoundingClientRect();

    const container = canvas.getOverlayCanvas().parentElement;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'c-canvas-area__text-input';
    input.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y - 14}px;
      font-size: ${state.getToolOption('text', 'fontSize')}px;
      font-family: ${state.getToolOption('text', 'fontFamily')};
      color: ${state.getToolOption('text', 'color')};
      background: transparent;
      border: 1px dashed rgba(255,255,255,0.5);
      outline: none;
      padding: 2px 4px;
      min-width: 100px;
      z-index: 100;
    `;

    input.dataset.canvasX = x;
    input.dataset.canvasY = y;

    container.appendChild(input);
    input.focus();

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        this._commitText();
      } else if (ev.key === 'Escape') {
        this._removeInput();
      }
    });

    this.inputEl = input;
  }

  _commitText() {
    if (!this.inputEl) return;
    const text = this.inputEl.value.trim();
    if (text) {
      const x = parseFloat(this.inputEl.dataset.canvasX);
      const y = parseFloat(this.inputEl.dataset.canvasY);
      const ctx = canvas.getMainCtx();
      const fontSize = state.getToolOption('text', 'fontSize');
      const fontFamily = state.getToolOption('text', 'fontFamily');
      const color = state.getToolOption('text', 'color');

      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';
      ctx.fillText(text, x, y);
      history.push();
    }
    this._removeInput();
  }

  _removeInput() {
    if (this.inputEl) {
      this.inputEl.remove();
      this.inputEl = null;
    }
  }

  renderPropertyBar(container) {
    const fontSize = state.getToolOption('text', 'fontSize');
    const color = state.getToolOption('text', 'color');
    const fontFamily = state.getToolOption('text', 'fontFamily');
    container.innerHTML = `
      <label class="c-property-bar__label">字号</label>
      <input type="number" id="textFontSize" value="${fontSize}" min="8" max="200">
      <label class="c-property-bar__label">颜色</label>
      <input type="color" id="textColor" value="${color}">
      <label class="c-property-bar__label">字体</label>
      <select id="textFont">
        <option value="Arial" ${fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
        <option value="serif" ${fontFamily === 'serif' ? 'selected' : ''}>Serif</option>
        <option value="monospace" ${fontFamily === 'monospace' ? 'selected' : ''}>Monospace</option>
      </select>
    `;
    container.querySelector('#textFontSize').addEventListener('change', (e) => {
      state.setToolOption('text', 'fontSize', parseInt(e.target.value, 10));
    });
    container.querySelector('#textColor').addEventListener('input', (e) => {
      state.setToolOption('text', 'color', e.target.value);
    });
    container.querySelector('#textFont').addEventListener('change', (e) => {
      state.setToolOption('text', 'fontFamily', e.target.value);
    });
  }
}

export default TextTool;
```

---

### Task 8: MosaicTool（马赛克工具）

**Files:**
- Create: `js/tools/MosaicTool.js`

**依赖:** BaseTool.js, canvas.js, state.js, history.js
**验证方式:** 在图片上拖拽绘制马赛克区域

- [ ] **Step 1: 创建 MosaicTool.js**

```javascript
import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';

class MosaicTool extends BaseTool {
  constructor() {
    super('mosaic');
    this.isDrawing = false;
  }

  onMouseDown(e) {
    this.isDrawing = true;
    const p = this.getCanvasPoint(e);
    this._applyMosaic(p.x, p.y);
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    const p = this.getCanvasPoint(e);
    this._applyMosaic(p.x, p.y);
  }

  onMouseUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    history.push();
  }

  _applyMosaic(cx, cy) {
    const blockSize = state.getToolOption('mosaic', 'size');
    const ctx = canvas.getMainCtx();
    const c = canvas.getMainCanvas();
    const radius = blockSize * 2;

    // 对鼠标周围区域做像素化
    const startX = Math.max(0, Math.floor((cx - radius) / blockSize) * blockSize);
    const startY = Math.max(0, Math.floor((cy - radius) / blockSize) * blockSize);
    const endX = Math.min(c.width, cx + radius);
    const endY = Math.min(c.height, cy + radius);

    for (let x = startX; x < endX; x += blockSize) {
      for (let y = startY; y < endY; y += blockSize) {
        const w = Math.min(blockSize, c.width - x);
        const h = Math.min(blockSize, c.height - y);
        if (w <= 0 || h <= 0) continue;

        const data = ctx.getImageData(x, y, w, h);
        const pixels = data.data;

        // 计算块平均色
        let r = 0;
        let g = 0;
        let b = 0;
        const count = w * h;
        for (let i = 0; i < pixels.length; i += 4) {
          r += pixels[i];
          g += pixels[i + 1];
          b += pixels[i + 2];
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, w, h);
      }
    }
  }

  renderPropertyBar(container) {
    const size = state.getToolOption('mosaic', 'size');
    container.innerHTML = `
      <label class="c-property-bar__label">块大小</label>
      <input type="number" id="mosaicSize" value="${size}" min="3" max="50">
    `;
    container.querySelector('#mosaicSize').addEventListener('change', (e) => {
      state.setToolOption('mosaic', 'size', parseInt(e.target.value, 10));
    });
  }
}

export default MosaicTool;
```

---

### Task 9: ShapeTool（形状工具）

**Files:**
- Create: `js/tools/ShapeTool.js`

**依赖:** BaseTool.js, canvas.js, state.js, history.js
**验证方式:** 绘制箭头和矩形，属性栏切换类型

- [ ] **Step 1: 创建 ShapeTool.js**

```javascript
import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';

class ShapeTool extends BaseTool {
  constructor() {
    super('shape');
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.snapshotData = null;
  }

  onMouseDown(e) {
    this.isDragging = true;
    const p = this.getCanvasPoint(e);
    this.startX = p.x;
    this.startY = p.y;
    // 保存当前画布快照用于预览
    const mainC = canvas.getMainCanvas();
    const mainCtx = canvas.getMainCtx();
    this.snapshotData = mainCtx.getImageData(0, 0, mainC.width, mainC.height);
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    const p = this.getCanvasPoint(e);

    // 恢复快照
    const mainCtx = canvas.getMainCtx();
    mainCtx.putImageData(this.snapshotData, 0, 0);

    // 绘制预览
    this._drawShape(mainCtx, this.startX, this.startY, p.x, p.y);
  }

  onMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const p = this.getCanvasPoint(e);

    // 恢复快照并绘制最终形状
    const mainCtx = canvas.getMainCtx();
    mainCtx.putImageData(this.snapshotData, 0, 0);
    this._drawShape(mainCtx, this.startX, this.startY, p.x, p.y);
    this.snapshotData = null;
    history.push();
  }

  _drawShape(ctx, x1, y1, x2, y2) {
    const shapeType = state.getToolOption('shape', 'type');
    const color = state.getToolOption('shape', 'color');
    const lineWidth = state.getToolOption('shape', 'lineWidth');

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;

    if (shapeType === 'rect') {
      ctx.strokeRect(
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1),
      );
    } else if (shapeType === 'arrow') {
      this._drawArrow(ctx, x1, y1, x2, y2, lineWidth);
    }
  }

  _drawArrow(ctx, x1, y1, x2, y2, lineWidth) {
    const headLen = Math.max(10, lineWidth * 4);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // 线段
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 箭头
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
  }

  renderPropertyBar(container) {
    const shapeType = state.getToolOption('shape', 'type');
    const color = state.getToolOption('shape', 'color');
    const lineWidth = state.getToolOption('shape', 'lineWidth');
    container.innerHTML = `
      <label class="c-property-bar__label">类型</label>
      <select id="shapeType">
        <option value="arrow" ${shapeType === 'arrow' ? 'selected' : ''}>箭头</option>
        <option value="rect" ${shapeType === 'rect' ? 'selected' : ''}>矩形</option>
      </select>
      <label class="c-property-bar__label">颜色</label>
      <input type="color" id="shapeColor" value="${color}">
      <label class="c-property-bar__label">线宽</label>
      <input type="number" id="shapeLineWidth" value="${lineWidth}" min="1" max="20">
    `;
    container.querySelector('#shapeType').addEventListener('change', (e) => {
      state.setToolOption('shape', 'type', e.target.value);
    });
    container.querySelector('#shapeColor').addEventListener('input', (e) => {
      state.setToolOption('shape', 'color', e.target.value);
    });
    container.querySelector('#shapeLineWidth').addEventListener('change', (e) => {
      state.setToolOption('shape', 'lineWidth', parseInt(e.target.value, 10));
    });
  }
}

export default ShapeTool;
```

---

### Task 10: 主入口 main.js（组装 + 事件绑定）

**Files:**
- Create: `js/main.js`

**依赖:** 全部模块
**验证方式:** 完整功能测试 -- 打开图片、各工具操作、撤销重做、下载

- [ ] **Step 1: 创建 main.js**

`js/main.js`: 初始化所有模块，绑定工具栏/属性栏/快捷键/拖拽事件。

```javascript
import * as state from './state.js';
import * as canvas from './canvas.js';
import * as history from './history.js';
import { loadImageFromFile, downloadCanvas, getMimeType, getExtension } from './utils/file.js';
import CropTool from './tools/CropTool.js';
import BrushTool from './tools/BrushTool.js';
import TextTool from './tools/TextTool.js';
import MosaicTool from './tools/MosaicTool.js';
import ShapeTool from './tools/ShapeTool.js';

const tools = {
  crop: new CropTool(),
  brush: new BrushTool(),
  text: new TextTool(),
  mosaic: new MosaicTool(),
  shape: new ShapeTool(),
};

let activeTool = null;

function init() {
  const mainCanvas = document.getElementById('mainCanvas');
  const overlayCanvas = document.getElementById('overlayCanvas');
  const wrapper = document.getElementById('canvasWrapper');

  canvas.init(mainCanvas, overlayCanvas, wrapper);

  setupToolbar();
  setupPropertyBar();
  setupFileHandling();
  setupKeyboard();
  setupUndoRedoButtons();

  // 默认激活裁剪工具
  switchTool('crop');
}

function switchTool(toolName) {
  if (activeTool) {
    activeTool.deactivate();
  }

  // 更新工具栏高亮
  document.querySelectorAll('.c-toolbar__btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.tool === toolName);
  });

  state.set('tool', toolName);
  activeTool = tools[toolName];

  if (state.get('image')) {
    activeTool.activate();
  }

  updatePropertyBar();
}

function setupToolbar() {
  document.getElementById('toolbar').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tool]');
    if (!btn) return;
    switchTool(btn.dataset.tool);
  });
}

function updatePropertyBar() {
  const container = document.getElementById('toolOptions');
  container.innerHTML = '';
  if (activeTool && state.get('image')) {
    activeTool.renderPropertyBar(container);
  }
}

function setupPropertyBar() {
  state.on('toolOption', () => {
    // 工具选项变化时不需要重建 UI
  });
}

function setupFileHandling() {
  const fileInput = document.getElementById('fileInput');
  const btnOpen = document.getElementById('btnOpen');
  const wrapper = document.getElementById('canvasWrapper');
  const placeholder = document.getElementById('placeholder');

  btnOpen.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    fileInput.value = '';
  });

  // 拖拽
  wrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  wrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  });

  // 下载
  document.getElementById('btnDownload').addEventListener('click', handleDownload);

  async function handleFile(file) {
    try {
      const img = await loadImageFromFile(file);
      state.set('image', img);
      state.set('imageType', getMimeType(file));
      canvas.loadImage(img);
      placeholder.classList.add('u-hidden');

      // 重新激活当前工具
      if (activeTool) {
        activeTool.deactivate();
        activeTool.activate();
      }
      updatePropertyBar();
      updateUndoRedoButtons();
      document.getElementById('btnDownload').disabled = false;
      document.getElementById('downloadFormat').disabled = false;
    } catch (err) {
      showToast(err.message);
    }
  }

  function handleDownload() {
    const mainC = canvas.getMainCanvas();
    const formatSelect = document.getElementById('downloadFormat');
    const selectedFormat = formatSelect.value;
    const mimeType = selectedFormat || state.get('imageType') || 'image/png';
    const ext = getExtension(mimeType);
    downloadCanvas(mainC, `photo-edit.${ext}`, mimeType);
  }
}

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 's') {
        e.preventDefault();
        document.getElementById('btnDownload').click();
      }
    }
  });
}

function handleUndo() {
  const data = history.undo();
  if (data) {
    canvas.restoreFromImageData(data);
    updateUndoRedoButtons();
  }
}

function handleRedo() {
  const data = history.redo();
  if (data) {
    canvas.restoreFromImageData(data);
    updateUndoRedoButtons();
  }
}

function setupUndoRedoButtons() {
  document.getElementById('btnUndo').addEventListener('click', handleUndo);
  document.getElementById('btnRedo').addEventListener('click', handleRedo);
  history.onChange(updateUndoRedoButtons);
}

function updateUndoRedoButtons() {
  document.getElementById('btnUndo').disabled = !history.canUndo();
  document.getElementById('btnRedo').disabled = !history.canRedo();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('is-visible');
  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2500);
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 2: 完整功能验证**

在浏览器中打开 `index.html`，逐项验证：
1. 拖拽图片加载 + 按钮加载
2. 裁剪工具：自由/固定比例选区，确认/取消
3. 画笔工具：自由绘制，调整大小/颜色
4. 文字工具：点击输入文字，调整字号/颜色/字体
5. 马赛克工具：拖拽区域马赛克
6. 形状工具：箭头/矩形绘制
7. Ctrl+Z/Y 撤销/重做
8. Ctrl+S / 下载按钮导出图片
9. 未加载图片时工具栏不可操作

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|
| 2026-03-25 17:00 | Plan Review 修复: 增加下载格式选择器、history.onChange 替代 monkey-patching、TextTool 输入框改用容器定位 |

## 发现的技术债
- 暂无
