# 图片逆时针旋转功能 实现计划

- 创建时间: 2026-03-30
- 状态: active
- 关联 spec: .harness/specs/active/spec-260330-rotate.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现图片逆时针旋转功能，每次点击旋转 90 度

**Architecture:** 在 canvas.js 中新增 rotateImage 函数，通过 Canvas translate + rotate 实现。UI 层在属性栏添加旋转按钮（位于撤销按钮左侧）和隔离栏。

**Tech Stack:** HTML5 Canvas API, ES6 Modules, CSS

---

## File Structure

| 文件 | 操作 | 职责 |
|------|------|------|
| index.html | 修改 | 添加旋转按钮和隔离栏 DOM |
| css/components/_property-bar.css | 修改 | 添加隔离栏样式 |
| js/canvas.js | 修改 | 添加 rotateImage 函数 |
| js/main.js | 修改 | 绑定旋转按钮事件、管理按钮状态 |

---

### Task 1: UI 结构 - 添加旋转按钮和隔离栏

**Files:**
- Modify: `index.html:17-31`

- [ ] **Step 1: 添加旋转按钮和隔离栏**

在 `c-property-bar__group`（撤销按钮所在组）之前插入新组，包含旋转按钮和隔离栏：

```html
<div class="c-property-bar__group">
  <button class="c-property-bar__btn" id="btnRotate" title="逆时针旋转" disabled>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2.5 2v6h6"/>
      <path d="M2.5 8a10 10 0 1 1 2.93 7.07"/>
    </svg>
  </button>
</div>
<div class="c-property-bar__divider"></div>
```

插入位置：在 `<div class="c-property-bar__spacer"></div>` 之前，即撤销按钮组的左侧。

---

### Task 2: CSS 样式 - 添加隔离栏样式

**Files:**
- Modify: `css/components/_property-bar.css:68-69`

- [ ] **Step 1: 添加隔离栏样式**

在文件末尾添加：

```css
.c-property-bar__divider {
  width: 1px;
  height: 20px;
  background-color: var(--color-border);
}
```

---

### Task 3: 旋转逻辑 - 在 canvas.js 添加 rotateImage 函数

**Files:**
- Modify: `js/canvas.js:89-100`

- [ ] **Step 1: 实现 rotateImage 函数**

在 `restoreFromImageData` 函数之后添加：

```js
function rotateImage() {
  if (!mainCanvas) return;

  const w = mainCanvas.width;
  const h = mainCanvas.height;
  const imageData = mainCtx.getImageData(0, 0, w, h);

  // 创建临时画布存储原图
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.putImageData(imageData, 0, 0);

  // 旋转后宽高互换
  mainCanvas.width = h;
  mainCanvas.height = w;
  overlayCanvas.width = h;
  overlayCanvas.height = w;

  state.set('canvasWidth', h);
  state.set('canvasHeight', w);

  // 逆时针旋转 90 度
  mainCtx.save();
  mainCtx.translate(0, w);
  mainCtx.rotate(-Math.PI / 2);
  mainCtx.drawImage(tempCanvas, 0, 0);
  mainCtx.restore();

  history.push();
}
```

- [ ] **Step 2: 导出 rotateImage 函数**

修改导出列表：

```js
export {
  init,
  loadImage,
  getMainCanvas,
  getMainCtx,
  getOverlayCanvas,
  getOverlayCtx,
  clearOverlay,
  restoreFromImageData,
  getCanvasArea,
  rotateImage,
};
```

---

### Task 4: 事件绑定 - 在 main.js 添加旋转按钮事件

**Files:**
- Modify: `js/main.js:120-122`

- [ ] **Step 1: 添加旋转按钮点击事件**

在 `handleFile` 函数中，在 `document.getElementById('downloadFormat').disabled = false;` 之后添加：

```js
document.getElementById('btnRotate').disabled = false;
```

- [ ] **Step 2: 添加旋转事件处理函数**

在 `setupUndoRedoButtons` 函数之前添加：

```js
function setupRotateButton() {
  document.getElementById('btnRotate').addEventListener('click', () => {
    canvas.rotateImage();
    updateUndoRedoButtons();
  });
}
```

- [ ] **Step 3: 在 init 中调用 setupRotateButton**

在 `init` 函数中，在 `setupUndoRedoButtons();` 之后添加：

```js
setupRotateButton();
```

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|

## 发现的技术债
- 无
