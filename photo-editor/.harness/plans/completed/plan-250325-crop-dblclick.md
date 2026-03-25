# 裁剪双击确认 实现计划

- 创建时间: 2026-03-25
- 状态: active
- 关联 spec: .harness/specs/active/spec-250325-crop-dblclick.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/skills/superpowers/executing-plans.md to implement this plan task-by-task.

**Goal:** 裁剪工具支持双击选区确认

**Architecture:** CropTool 在构造函数中绑定 dblclick 处理函数，activate/deactivate 时添加/移除事件监听

**Tech Stack:** ES6 Modules, 纯 JavaScript

---

## File Structure

| 文件 | 操作 | 职责 |
|------|------|------|
| js/tools/CropTool.js | 修改 | 新增双击事件监听 |

---

### Task 1: CropTool.js 新增双击确认

**Files:**
- Modify: `js/tools/CropTool.js`

- [ ] **Step 1: 在构造函数中添加绑定处理函数**

在 `this._dragHandlers = null;` 后添加：

```javascript
this._boundOnDblClick = this._onDblClick.bind(this);
```

- [ ] **Step 2: 添加 dblclick 事件处理方法**

在 `_removeActionButtons` 方法后添加：

```javascript
_onDblClick(e) {
  if (!this.cropRect) return;
  const p = this.getCanvasPoint(e);
  const { x, y, w, h } = this.cropRect;
  if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) {
    this._applyCrop();
    this._removeActionButtons();
  }
}
```

- [ ] **Step 3: 修改 onActivate 绑定 dblclick 事件**

```javascript
onActivate() {
  this.cropRect = null;
  canvas.getOverlayCanvas().addEventListener('dblclick', this._boundOnDblClick);
}
```

- [ ] **Step 4: 修改 onDeactivate 解绑 dblclick 事件**

```javascript
onDeactivate() {
  this.cropRect = null;
  this._removeActionButtons();
  canvas.getOverlayCanvas().removeEventListener('dblclick', this._boundOnDblClick);
  canvas.clearOverlay();
}
```

---

### Task 2: 验证

- [ ] **Step 1: 语法验证**

```bash
for f in js/*.js js/tools/*.js js/utils/*.js; do node --check "$f"; done
```

Expected: 无输出（无错误）

- [ ] **Step 2: 浏览器手动测试**

1. 启动服务器：`python3 -m http.server 8888`
2. 访问 http://localhost:8888
3. 上传图片，选择裁剪工具
4. 拖拽绘制选区
5. 双击选区内，验证裁剪完成
6. 再次绘制选区，双击选区外，验证无响应
7. 再次绘制选区，点击"确认"按钮，验证裁剪完成

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|
| 2026-03-25 | 创建计划 |
| 2026-03-25 | 修复事件监听器绑定/解绑引用问题 |

## 发现的技术债
- 无
