# 左侧工具栏展开/收起 Implementation Plan

- 创建时间: 2026-04-15
- 状态: completed
- 关联 spec: .harness/specs/completed/spec-260415-toolbar-expand.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/framework/skills/superpowers/subagent-driven-development.md (recommended) or .harness/framework/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为左侧工具栏增加展开/收起切换功能，默认收起（仅图标），展开后显示图标+文字。

**Architecture:** 纯 CSS class 切换（`.is-expanded`），JS 处理按钮点击事件，HTML 增加切换按钮和文字 label。

**Tech Stack:** HTML, CSS (ITCSS), Vanilla JS (ES6 Modules)

## File Structure

| 文件 | 操作 | 职责 |
|------|------|------|
| `index.html:65-100` | 修改 | 工具栏顶部增加切换按钮，每个工具按钮内增加文字 label |
| `css/components/_toolbar.css` | 修改 | 展开状态样式、过渡动画、tooltip 条件显示 |
| `css/settings/_variables.css` | 修改 | 新增 `--toolbar-expanded-width` 变量 |
| `js/main.js:64-69` | 修改 | `setupToolbar()` 增加切换按钮事件监听 |

## Task 1: HTML 结构调整

**Files:**
- Modify: `index.html:65-100`

- [ ] **S 1: 在工具栏顶部增加切换按钮**

在 `#toolbar` 内部最前面添加切换按钮：

```html
<button class="c-toolbar__toggle" id="btnToolbarToggle" title="展开工具栏">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 18l6-6-6-6"/>
  </svg>
</button>
<div class="c-toolbar__separator"></div>
```

- [ ] **S 2: 为每个工具按钮增加文字 label**

将每个 `.c-toolbar__btn` 内容改造为图标+文字结构：

```html
<button class="c-toolbar__btn" data-tool="crop" data-tooltip="裁剪">
  <svg ...>...</svg>
  <span class="c-toolbar__label">裁剪</span>
</button>
```

5 个工具依次增加对应文字的 label：裁剪、画笔、文字、马赛克、形状。

## Task 2: CSS 变量与展开状态样式

**Files:**
- Modify: `css/settings/_variables.css:23`
- Modify: `css/components/_toolbar.css`

- [ ] **S 1: 新增 CSS 变量**

在 `_variables.css` 中 `--toolbar-width: 48px;` 下方新增：

```css
--toolbar-expanded-width: 140px;
```

- [ ] **S 2: 修改 `.c-toolbar` 基础样式，增加过渡**

```css
.c-toolbar {
  /* ... existing styles ... */
  width: var(--toolbar-width);
  transition: width 0.2s ease;
}
```

- [ ] **S 3: 展开状态样式**

新增 `.c-toolbar.is-expanded` 相关规则：

```css
.c-toolbar.is-expanded {
  width: var(--toolbar-expanded-width);
  align-items: stretch;
  padding: var(--space-sm) var(--space-sm);
}

.c-toolbar.is-expanded .c-toolbar__btn {
  justify-content: flex-start;
  padding: 0 var(--space-md);
  width: auto;
}

.c-toolbar.is-expanded .c-toolbar__toggle {
  justify-content: flex-start;
  padding: 0 var(--space-md);
  width: auto;
}

.c-toolbar__label {
  display: none;
}

.c-toolbar.is-expanded .c-toolbar__label {
  display: inline;
  margin-left: var(--space-sm);
  font-size: var(--font-size-md);
}

.c-toolbar.is-expanded .c-toolbar__separator {
  margin: var(--space-xs) var(--space-sm);
}

.c-toolbar.is-expanded .c-toolbar__toggle {
  color: var(--color-text-secondary);
}

/* 展开状态下禁用 tooltip */
.c-toolbar.is-expanded .c-toolbar__btn::after {
  display: none;
}

/* 切换按钮 hover */
.c-toolbar__toggle {
  width: 36px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  transition: background-color var(--transition-fast);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.c-toolbar__toggle:hover {
  background-color: var(--color-surface-hover);
}

.c-toolbar__toggle svg {
  width: var(--icon-size);
  height: var(--icon-size);
}

/* 展开时切换箭头方向 */
.c-toolbar.is-expanded .c-toolbar__toggle svg {
  transform: rotate(180deg);
}
```

## Task 3: JavaScript 切换逻辑

**Files:**
- Modify: `js/main.js:64-69`

- [ ] **S 1: 在 setupToolbar 中增加切换按钮事件**

```javascript
function setupToolbar() {
  const toolbar = document.getElementById('toolbar');

  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tool]');
    if (!btn) return;
    switchTool(btn.dataset.tool);
  });

  // 工具栏展开/收起切换
  const toggleBtn = document.getElementById('btnToolbarToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      toolbar.classList.toggle('is-expanded');
    });
  }
}
```

## Task 4: 验证与测试

**Files:**
- Verify: `index.html`, `css/components/_toolbar.css`, `js/main.js`

- [ ] **S 1: 语法检查**

```bash
for f in js/*.js js/tools/*.js js/utils/*.js; do node --check "$f"; done
```

- [ ] **S 2: 手动验证清单**
  1. 启动 `python3 -m http.server 8888`
  2. 打开 http://localhost:8888
  3. 确认默认收起（48px，仅图标）
  4. 点击顶部切换按钮，确认展开（图标+文字）
  5. 再次点击，确认收起
  6. 展开/收起时工具切换功能正常
  7. 收起状态下 hover 显示 tooltip
  8. 展开状态下 hover 不显示 tooltip

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|

## 发现的技术债
- 暂无
