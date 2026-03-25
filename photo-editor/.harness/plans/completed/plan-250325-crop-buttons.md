# 裁剪工具确认按钮显示修复 实现计划

- 创建时间: 2025-03-25
- 状态: completed
- 关联 spec: .harness/specs/completed/spec-250325-crop-buttons.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将裁剪工具的确认/取消按钮从 Canvas 绘制改为 HTML 浮动层，支持拖动调整位置，解决边界溢出问题。

**Architecture:** 在 CropTool.js 中创建 HTML 按钮元素，添加到 `#canvasArea` 容器，通过绝对定位跟随选区位置，实现拖动行为和边界检测。

**Tech Stack:** ES6 Modules, CSS BEM, HTML5 Canvas API

---

## File Structure

| 文件 | 操作 | 职责 |
|------|------|------|
| `js/tools/CropTool.js` | Modify | 添加 HTML 按钮创建/定位/拖动/销毁逻辑 |
| `css/components/_crop-actions.css` | Create | 按钮容器及按钮样式 |
| `css/main.css` | Modify | @import 新 CSS 文件 |

---

### Task 1: 新增 CSS 样式文件

**Files:**
- Create: `css/components/_crop-actions.css`
- Modify: `css/main.css`

- [ ] **Step 1: 创建按钮容器样式文件**

Create `css/components/_crop-actions.css`:

```css
.c-crop-actions {
  position: absolute;
  display: flex;
  gap: var(--space-sm);
  padding: 4px;
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: move;
  user-select: none;
  z-index: 10;
}

.c-crop-actions.is-dragging {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  opacity: 0.9;
}

.c-crop-actions__btn {
  padding: 4px 12px;
  font-size: var(--font-size-sm);
  font-family: inherit;
  color: #fff;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.c-crop-actions__btn--confirm {
  background-color: #4a9eff;
}

.c-crop-actions__btn--confirm:hover {
  background-color: #3a8eef;
}

.c-crop-actions__btn--cancel {
  background-color: #666;
}

.c-crop-actions__btn--cancel:hover {
  background-color: #555;
}
```

- [ ] **Step 2: 引入新样式文件**

Modify `css/main.css`, add after `@import 'components/_modal.css';`:

```css
@import 'components/_crop-actions.css';
```

- [ ] **Step 3: 验证 CSS 语法**

Run: `cat css/main.css css/components/_crop-actions.css`
Expected: 文件内容正确显示，无语法错误

---

### Task 2: 重构 CropTool 按钮逻辑

**Files:**
- Modify: `js/tools/CropTool.js`

- [ ] **Step 1: 添加按钮相关属性**

在 `constructor()` 中添加:

```javascript
this.actionButtons = null;
this.isDraggingButtons = false;
this.dragOffset = { x: 0, y: 0 };
```

- [ ] **Step 2: 实现 _createActionButtons 方法**

在 `_showCropActions()` 方法位置替换为:

```javascript
_createActionButtons() {
  if (this.actionButtons) return;

  const container = document.createElement('div');
  container.className = 'c-crop-actions';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'c-crop-actions__btn c-crop-actions__btn--confirm';
  confirmBtn.textContent = '确认';
  confirmBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    this._applyCrop();
    this._removeActionButtons();
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'c-crop-actions__btn c-crop-actions__btn--cancel';
  cancelBtn.textContent = '取消';
  cancelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    this.cropRect = null;
    canvas.clearOverlay();
    this._removeActionButtons();
  });

  container.appendChild(confirmBtn);
  container.appendChild(cancelBtn);

  const canvasArea = document.getElementById('canvasArea');
  canvasArea.appendChild(container);

  this.actionButtons = container;
  this._setupDragBehavior();
  this._positionActionButtons();
}
```

- [ ] **Step 3: 实现 _positionActionButtons 方法**

```javascript
_positionActionButtons() {
  if (!this.actionButtons || !this.cropRect) return;

  const { x, y, w, h } = this.cropRect;
  const btnH = 32;
  const gap = 8;

  let btnX = x + w - 136;
  let btnY = y + h + gap;

  const canvasW = state.get('canvasWidth');
  const canvasH = state.get('canvasHeight');

  // 底部溢出 -> 上移
  if (btnY + btnH > canvasH) {
    btnY = y - btnH - gap;
  }

  // 顶部也溢出 -> 内嵌
  if (btnY < 0) {
    btnY = y + h - btnH - 4;
  }

  // 左边界溢出
  if (btnX < 0) {
    btnX = 0;
  }

  // 右边界溢出
  const btnW = 136;
  if (btnX + btnW > canvasW) {
    btnX = canvasW - btnW;
  }

  this.actionButtons.style.left = `${btnX}px`;
  this.actionButtons.style.top = `${btnY}px`;
}
```

- [ ] **Step 4: 实现 _setupDragBehavior 方法**

```javascript
_setupDragBehavior() {
  if (!this.actionButtons) return;

  const onMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON') return;

    this.isDraggingButtons = true;
    this.actionButtons.classList.add('is-dragging');
    const rect = this.actionButtons.getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.preventDefault();
  };

  const onMouseMove = (e) => {
    if (!this.isDraggingButtons) return;

    const canvasArea = document.getElementById('canvasArea');
    const areaRect = canvasArea.getBoundingClientRect();
    const btnRect = this.actionButtons.getBoundingClientRect();

    let newX = e.clientX - areaRect.left - this.dragOffset.x;
    let newY = e.clientY - areaRect.top - this.dragOffset.y;

    // 边界限制
    newX = Math.max(0, Math.min(newX, areaRect.width - btnRect.width));
    newY = Math.max(0, Math.min(newY, areaRect.height - btnRect.height));

    this.actionButtons.style.left = `${newX}px`;
    this.actionButtons.style.top = `${newY}px`;
  };

  const onMouseUp = () => {
    if (this.isDraggingButtons) {
      this.isDraggingButtons = false;
      this.actionButtons.classList.remove('is-dragging');
    }
  };

  this.actionButtons.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  this._dragHandlers = { onMouseDown, onMouseMove, onMouseUp };
}
```

- [ ] **Step 5: 实现 _removeActionButtons 方法**

```javascript
_removeActionButtons() {
  if (this._dragHandlers) {
    document.removeEventListener('mousemove', this._dragHandlers.onMouseMove);
    document.removeEventListener('mouseup', this._dragHandlers.onMouseUp);
    this._dragHandlers = null;
  }

  if (this.actionButtons) {
    this.actionButtons.remove();
    this.actionButtons = null;
  }

  this.isDraggingButtons = false;
}
```

- [ ] **Step 6: 更新 onDeactivate 方法**

在 `onDeactivate()` 中添加:

```javascript
this._removeActionButtons();
```

替换现有的 `this._removeClickHandler();`。

- [ ] **Step 7: 更新 onMouseUp 方法**

将 `_showCropActions()` 调用改为:

```javascript
this._createActionButtons();
```

- [ ] **Step 8: 删除旧的 Canvas 按钮绘制代码**

删除以下方法:
- `_getButtonRects()`
- `_hitRect()`
- `_showCropActions()`
- `_removeClickHandler()`

删除 `onMouseDown` 中的按钮点击检测代码块。

- [ ] **Step 9: 验证 JS 语法**

Run: `for f in js/tools/CropTool.js; do node --check "$f"; done`
Expected: 无输出（语法正确）

---

### Task 3: 浏览器测试验证

**Files:**
- Test: 浏览器手动测试

- [ ] **Step 1: 启动本地服务器**

Run: `python3 -m http.server 8888`
Expected: 服务器启动，访问 http://localhost:8888

- [ ] **Step 2: 测试底部边界场景**

1. 打开图片
2. 选择裁剪工具
3. 在画布底部创建选区
4. 验证按钮显示在选区上方

- [ ] **Step 3: 测试顶部边界场景**

1. 在画布顶部创建选区
2. 验证按钮显示在选区下方

- [ ] **Step 4: 测试拖动功能**

1. 创建选区后显示按钮
2. 按住按钮容器空白区域拖动
3. 验证按钮跟随鼠标移动
4. 验证按钮不会超出画布边界
5. 验证点击按钮仍然正常响应

- [ ] **Step 5: 测试工具切换**

1. 创建选区显示按钮
2. 切换到其他工具
3. 验证按钮自动消失

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|

## 发现的技术债
- 无
