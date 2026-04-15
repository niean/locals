# 滤镜功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 PhotoEditor 左侧工具栏新增滤镜功能，支持 6 种预设滤镜，滤镜选择显示在顶部属性栏。

**Architecture:** 遵循现有 BaseTool 工具模式，新增 FilterTool 类继承 BaseTool，新增 filter.js 纯函数库处理像素级滤镜算法。滤镜始终基于原始图片应用，不叠加效果。离开滤镜工具时推入 history 栈。

**Tech Stack:** HTML5 Canvas API (ImageData 像素操作), ES6 Modules, CSS Custom Properties

---

### Task 1: 新增 filter.js 像素处理工具库

**Files:**
- Create: `js/utils/filter.js`

- [ ] **Step 1: 创建 filter.js 纯函数库**

```javascript
// js/utils/filter.js

/**
 * 滤镜预设像素处理函数。每个函数接收 ImageData 并就地修改其 data 数组。
 * 所有函数都是纯函数（不依赖外部状态，不产生副作用）。
 */

/**
 * 鲜明: 提高饱和度 + 对比度
 */
export function applyVivid(imageData) {
  const data = imageData.data;
  const contrast = 1.3;
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

  for (let i = 0; i < data.length; i += 4) {
    // 对比度
    data[i] = clamp(factor * (data[i] - 128) + 128);
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);

    // 饱和度提升
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = clamp(gray + 1.2 * (data[i] - gray));
    data[i + 1] = clamp(gray + 1.2 * (data[i + 1] - gray));
    data[i + 2] = clamp(gray + 1.2 * (data[i + 2] - gray));
  }
}

/**
 * 暖色: 增加红/绿色通道，暖色调偏移
 */
export function applyWarm(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + 15);     // R +
    data[i + 1] = clamp(data[i + 1] + 8); // G +
    data[i + 2] = clamp(data[i + 2] - 10); // B -
  }
}

/**
 * 冷色: 增加蓝色通道，冷色调偏移
 */
export function applyCool(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] - 10);     // R -
    data[i + 1] = clamp(data[i + 1] + 5); // G +
    data[i + 2] = clamp(data[i + 2] + 15); // B +
  }
}

/**
 * 单色: 转灰度（亮度加权平均）
 */
export function applyMono(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

/**
 * 戏剧效果: 高对比度 + 暗化中间调
 */
export function applyDramatic(imageData) {
  const data = imageData.data;
  const contrast = 1.6;
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

  for (let i = 0; i < data.length; i += 4) {
    // 高对比度
    let r = factor * (data[i] - 128) + 128;
    let g = factor * (data[i + 1] - 128) + 128;
    let b = factor * (data[i + 2] - 128) + 128;

    // 暗化中间调
    r = r * 0.85;
    g = g * 0.85;
    b = b * 0.85;

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }
}

/** 滤镜预设映射 */
export const FILTERS = {
  original: null,       // 原片: 不处理
  vivid: applyVivid,
  warm: applyWarm,
  cool: applyCool,
  mono: applyMono,
  dramatic: applyDramatic,
};

/** 滤镜显示信息 */
export const FILTER_PRESETS = [
  { id: 'original', label: '原片', gradient: ['#888888', '#555555'] },
  { id: 'vivid', label: '鲜明', gradient: ['#ff5555', '#ff9900'] },
  { id: 'warm', label: '暖色', gradient: ['#ff9900', '#ff6600'] },
  { id: 'cool', label: '冷色', gradient: ['#00aaff', '#0066ff'] },
  { id: 'mono', label: '单色', gradient: ['#888888', '#333333'] },
  { id: 'dramatic', label: '戏剧', gradient: ['#444444', '#000000'] },
];

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}
```

- [ ] **Step 2: 语法检查**

```bash
node --check js/utils/filter.js
```

Expected: no output (syntax OK)

- [ ] **Step 3: 提交**

```bash
git add js/utils/filter.js
git commit -m "feat: 新增滤镜像素处理工具库"
```

---

### Task 2: 新增 FilterTool 工具类

**Files:**
- Create: `js/tools/FilterTool.js`
- Modify: `js/state.js` (新增 filter toolOptions)

- [ ] **Step 1: 在 state.js 中新增 filter 工具选项**

修改 `js/state.js` 的 `toolOptions` 对象，在 mosaic 后新增 filter 配置:

```javascript
// 修改前 (约第 15 行):
    mosaic: { size: 10 },
  },

// 修改后:
    mosaic: { size: 10 },
    filter: { preset: 'original' },
  },
```

- [ ] **Step 2: 创建 FilterTool.js**

```javascript
// js/tools/FilterTool.js
import BaseTool from './BaseTool.js';
import * as canvas from '../canvas.js';
import * as state from '../state.js';
import * as history from '../history.js';
import { FILTERS, FILTER_PRESETS } from '../utils/filter.js';

class FilterTool extends BaseTool {
  constructor() {
    super('filter');
    this._originalImageData = null;
  }

  activate() {
    // 保存原始图片数据，用于切换滤镜时还原
    this._saveOriginal();
    super.activate();
  }

  deactivate() {
    // 离开滤镜工具时，将当前画布推入历史栈
    if (state.get('image')) {
      history.push();
    }
    this._originalImageData = null;
    super.deactivate();
  }

  /**
   * 渲染属性栏：6 个色块预览按钮
   */
  renderPropertyBar(container) {
    const currentPreset = state.getToolOption('filter', 'preset') || 'original';

    const buttonsHtml = FILTER_PRESETS.map((preset) => {
      const isActive = preset.id === currentPreset;
      return `
        <button class="c-property-bar__filter-btn ${isActive ? 'is-active' : ''}" data-preset="${preset.id}" title="${preset.label}">
          <span class="c-property-bar__filter-btn__swatch" style="background: linear-gradient(135deg, ${preset.gradient[0]}, ${preset.gradient[1]});"></span>
          <span class="c-property-bar__filter-btn__label">${preset.label}</span>
        </button>
      `;
    }).join('');

    container.innerHTML = `<div class="c-property-bar__filter-group">${buttonsHtml}</div>`;

    container.querySelectorAll('.c-property-bar__filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        this.applyPreset(preset, container);
      });
    });
  }

  /**
   * 应用滤镜预设
   */
  applyPreset(presetName, container) {
    const img = state.get('image');
    if (!img || !this._originalImageData) return;

    // 先还原原始图片
    const mainCtx = canvas.getMainCtx();
    mainCtx.putImageData(this._originalImageData, 0, 0);

    // 如果不是原片，应用滤镜
    const filterFn = FILTERS[presetName];
    if (filterFn) {
      const imageData = mainCtx.getImageData(0, 0, canvas.getMainCanvas().width, canvas.getMainCanvas().height);
      filterFn(imageData);
      mainCtx.putImageData(imageData, 0, 0);
    }

    // 更新状态
    state.setToolOption('filter', 'preset', presetName);

    // 刷新属性栏高亮
    this.renderPropertyBar(container);
  }

  /**
   * 保存原始图片数据
   */
  _saveOriginal() {
    const img = state.get('image');
    if (!img) return;

    const mainCanvas = canvas.getMainCanvas();
    const mainCtx = canvas.getMainCtx();

    // 从原始 HTMLImageElement 重绘
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);

    this._originalImageData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
  }
}

export default FilterTool;
```

- [ ] **Step 3: 语法检查**

```bash
node --check js/tools/FilterTool.js && node --check js/state.js
```

Expected: no output (syntax OK)

- [ ] **Step 4: 提交**

```bash
git add js/tools/FilterTool.js js/state.js
git commit -m "feat: 新增 FilterTool 工具类及状态配置"
```

---

### Task 3: HTML 新增滤镜工具栏按钮 + main.js 注册

**Files:**
- Modify: `index.html` (新增滤镜按钮)
- Modify: `js/main.js` (导入并注册 FilterTool)

- [ ] **Step 1: 在 index.html 左侧工具栏新增滤镜按钮**

在形状按钮之后、</div> (toolbar 结束标签) 之前，添加分隔线和滤镜按钮:

```html
<!-- 在形状按钮 (data-tool="shape") 之后添加 -->
        <button class="c-toolbar__btn" data-tool="shape" data-tooltip="形状">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M8 16l4-8 4 8"/>
          </svg>
          <span class="c-toolbar__label">形状</span>
        </button>
        <div class="c-toolbar__separator"></div>
        <button class="c-toolbar__btn" data-tool="filter" data-tooltip="滤镜">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2a10 10 0 0 1 0 20"/>
            <path d="M12 2a10 10 0 0 0 0 20"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
          <span class="c-toolbar__label">滤镜</span>
        </button>
```

- [ ] **Step 2: 在 js/main.js 中导入并注册 FilterTool**

在 import 区域（约第 9 行）新增:

```javascript
import FilterTool from './tools/FilterTool.js';
```

在 tools 对象（约第 11-17 行）中新增:

```javascript
const tools = {
  crop: new CropTool(),
  brush: new BrushTool(),
  text: new TextTool(),
  mosaic: new MosaicTool(),
  shape: new ShapeTool(),
  filter: new FilterTool(),
};
```

- [ ] **Step 3: 语法检查**

```bash
node --check js/main.js
```

Expected: no output (syntax OK)

- [ ] **Step 4: 提交**

```bash
git add index.html js/main.js
git commit -m "feat: 在工具栏注册滤镜工具"
```

---

### Task 4: 新增滤镜属性栏 CSS 样式

**Files:**
- Modify: `css/components/_property-bar.css` (新增滤镜按钮样式)

- [ ] **Step 1: 在 _property-bar.css 末尾新增滤镜预设按钮样式**

```css
/* 滤镜预设按钮组 */
.c-property-bar__filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.c-property-bar__filter-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 4px;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-surface);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.c-property-bar__filter-btn:hover {
  border-color: var(--color-text-secondary);
}

.c-property-bar__filter-btn.is-active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.c-property-bar__filter-btn__swatch {
  width: 28px;
  height: 28px;
  border-radius: 3px;
}

.c-property-bar__filter-btn__label {
  font-size: 9px;
  color: var(--color-text-secondary);
  margin-top: 2px;
  line-height: 1;
  white-space: nowrap;
}

.c-property-bar__filter-btn.is-active .c-property-bar__filter-btn__label {
  color: var(--color-primary);
}
```

- [ ] **Step 2: 验证 CSS 语法**

```bash
# CSS 无语法检查器，通过 node --check 验证引用链
for f in css/*.css css/*/*.css; do echo "Checking $f"; done
```

- [ ] **Step 3: 提交**

```bash
git add css/components/_property-bar.css
git commit -m "feat: 新增滤镜预设按钮样式"
```

---

### Task 5: 集成验证与构建检查

**Files:**
- 无新增/修改，仅验证

- [ ] **Step 1: 全量 JS 语法检查**

```bash
for f in js/*.js js/tools/*.js js/utils/*.js; do node --check "$f"; done && echo "All OK"
```

Expected: "All OK"

- [ ] **Step 2: 验证所有文件完整性**

确认以下文件存在:
- `js/utils/filter.js`
- `js/tools/FilterTool.js`
- `js/state.js` (含 filter toolOptions)
- `index.html` (含滤镜按钮)
- `js/main.js` (含 FilterTool 导入和注册)
- `css/components/_property-bar.css` (含滤镜样式)

```bash
git status
```

- [ ] **Step 3: 最终提交（如有未提交的变更）**

```bash
git add -A
git commit -m "feat: 滤镜功能集成完成"
```
