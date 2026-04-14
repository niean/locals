# 扩展形状工具支持椭圆标注 Implementation Plan

- 创建时间: 2026-04-14
- 状态: completed
- 关联 spec: .harness/specs/completed/spec-260414-annotation-shape.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/framework/skills/superpowers/subagent-driven-development.md (recommended) or .harness/framework/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 扩展现有的形状工具，增加椭圆（圈注）支持，同时将形状类型选择从下拉菜单改为平铺按钮。

**Architecture:** 在现有 ShapeTool 基础上扩展：新增椭圆绘制方法，重写属性栏渲染逻辑为平铺按钮，复用现有状态管理和历史记录机制。

**Tech Stack:** JavaScript ES6 Modules, HTML5 Canvas API, CSS Custom Properties, ITCSS

---

## T 1: 新增椭圆绘制方法

**Files:**
- Modify: `js/tools/ShapeTool.js`

- [ ] **S 1: 在 _drawShape 方法中新增 'ellipse' 分支**

在 `_drawShape` 方法的 `if (shapeType === 'rect')` 和 `else if (shapeType === 'arrow')` 之后，新增：

```javascript
} else if (shapeType === 'ellipse') {
  this._drawEllipse(ctx, x1, y1, x2, y2);
```

- [ ] **S 2: 新增 _drawEllipse 方法**

在 `_drawArrow` 方法之后新增：

```javascript
_drawEllipse(ctx, x1, y1, x2, y2) {
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const radiusX = Math.abs(x2 - x1) / 2;
  const radiusY = Math.abs(y2 - y1) / 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();
}
```

---

## T 2: 新增平铺按钮样式

**Files:**
- Modify: `css/components/_property-bar.css`

- [ ] **S 1: 在文件末尾新增样式类**

在 `css/components/_property-bar.css` 文件末尾新增：

```css
.c-property-bar__type-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 6px var(--space-sm);
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--color-surface-hover);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.c-property-bar__type-btn:hover {
  background-color: var(--color-border);
}

.c-property-bar__type-btn.is-active {
  background-color: var(--color-primary);
  color: #fff;
}

.c-property-bar__type-btn.is-active:hover {
  background-color: var(--color-primary-hover);
}

.c-property-bar__type-btn svg {
  width: 16px;
  height: 16px;
}
```

---

## T 3: 重写属性栏为平铺按钮

**Files:**
- Modify: `js/tools/ShapeTool.js`

- [ ] **S 1: 替换 renderPropertyBar 方法**

将现有的 `renderPropertyBar` 方法完整替换为：

```javascript
renderPropertyBar(container) {
  const shapeType = state.getToolOption('shape', 'type');
  const color = state.getToolOption('shape', 'color');
  const lineWidth = state.getToolOption('shape', 'lineWidth');

  container.innerHTML = `
    <label class="c-property-bar__label">类型</label>
    <button class="c-property-bar__type-btn ${shapeType === 'arrow' ? 'is-active' : ''}" data-type="arrow">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14"/>
        <path d="M12 5l7 7-7 7"/>
      </svg>
      <span>箭头</span>
    </button>
    <button class="c-property-bar__type-btn ${shapeType === 'rect' ? 'is-active' : ''}" data-type="rect">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="4" y="4" width="16" height="16"/>
      </svg>
      <span>矩形</span>
    </button>
    <button class="c-property-bar__type-btn ${shapeType === 'ellipse' ? 'is-active' : ''}" data-type="ellipse">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <ellipse cx="12" cy="12" rx="9" ry="7"/>
      </svg>
      <span>椭圆</span>
    </button>
    <div class="c-property-bar__divider"></div>
    <label class="c-property-bar__label">颜色</label>
    <input type="color" id="shapeColor" value="${color}">
    <label class="c-property-bar__label">线宽</label>
    <input type="number" id="shapeLineWidth" value="${lineWidth}" min="1" max="20">
  `;

  container.querySelectorAll('.c-property-bar__type-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.setToolOption('shape', 'type', btn.dataset.type);
      this.renderPropertyBar(container);
    });
  });

  container.querySelector('#shapeColor').addEventListener('input', (e) => {
    state.setToolOption('shape', 'color', e.target.value);
  });

  container.querySelector('#shapeLineWidth').addEventListener('change', (e) => {
    state.setToolOption('shape', 'lineWidth', parseInt(e.target.value, 10));
  });
}
```

---

## T 4: 更新 state.js 支持 ellipse 选项

**Files:**
- Modify: `js/state.js`

- [ ] **S 1: 更新注释（可选，非必须）**

无需修改代码，state.js 已支持动态设置 toolOptions，type 字段支持任意字符串值。

---

## T 5: 验证与测试

**Files:**
- 无新增/修改文件，手动测试

- [ ] **S 1: 验证 JS 语法**

运行：
```bash
for f in js/*.js js/tools/*.js; do node --check "$f"; done
```

Expected: 无语法错误输出

- [ ] **S 2: 手动测试功能**

启动本地服务器：
```bash
python3 -m http.server 8888
```

在浏览器中访问 http://localhost:8888，测试：
1. 加载图片，选择形状工具
2. 点击三个类型按钮，确认选中状态正确切换（蓝色高亮）
3. 选择"箭头"，拖拽绘制箭头
4. 选择"矩形"，拖拽绘制矩形边框
5. 选择"椭圆"，拖拽绘制椭圆边框
6. 调整颜色和线宽，确认对所有形状生效
7. 测试撤销/重做功能

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|
| 2026-04-14 | 初始计划，调整任务顺序（T2 样式先于 T3 JS） |
| 2026-04-14 | 实现完成：T1-T5 全部完成，新增椭圆绘制、平铺按钮 UI |

## 发现的技术债
- 无
