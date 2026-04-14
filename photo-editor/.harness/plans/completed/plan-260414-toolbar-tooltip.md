# 工具栏 Tooltip 实现计划

- 创建时间: 2026-04-14 20:05
- 状态: completed
- 关联 spec: .harness/specs/completed/spec-260414-toolbar-tooltip.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/framework/skills/superpowers/subagent-driven-development.md (recommended) or .harness/framework/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为左侧工具栏按钮添加纯 CSS Tooltip，鼠标悬停后快速显示工具名称

**Architecture:** 移除 HTML 中按钮的 `title` 属性，改用 `data-tooltip` 属性；通过 CSS `::after` 伪元素渲染 Tooltip，hover 时以 CSS 变量控制过渡动画显示。在 CSS 变量文件中新增 `--color-tooltip-bg` 变量。

**Tech Stack:** HTML5, CSS Custom Properties, ITCSS + BEM

---

## File Structure

| 操作 | 文件 | 职责 |
|------|------|------|
| Modify | css/settings/_variables.css | 新增 --color-tooltip-bg 变量 |
| Modify | css/components/_toolbar.css | 添加 Tooltip 样式（::after 伪元素 + 过渡动画） |
| Modify | index.html | 移除 title 属性，添加 data-tooltip 属性 |

---

### T 1: CSS 变量与 Tooltip 样式

**Files:**
- Modify: `css/settings/_variables.css:1-34`
- Modify: `css/components/_toolbar.css:1-42`

- [ ] **S 1: 在 _variables.css 中新增 --color-tooltip-bg 变量**

在 `:root` 的颜色区域末尾添加：

```css
--color-tooltip-bg: #333;
```

- [ ] **S 2: 在 _toolbar.css 中添加 Tooltip 样式**

在 `.c-toolbar__btn svg` 规则之后添加以下样式：

```css
.c-toolbar__btn {
  position: relative;
}

.c-toolbar__btn::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-tooltip-bg);
  color: #fff;
  font-size: var(--font-size-md);
  border-radius: var(--border-radius);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.c-toolbar__btn:hover::after {
  opacity: 1;
}
```

注意：`.c-toolbar__btn` 的 `position: relative` 是为 `::after` 绝对定位提供参照。需与已有 `.c-toolbar__btn` 规则合并（在原有规则中添加 `position: relative`），而非重复声明。

### T 2: HTML 属性替换

**Files:**
- Modify: `index.html:66-100`

- [ ] **S 1: 替换按钮的 title 为 data-tooltip**

将五个工具按钮的 `title` 属性替换为 `data-tooltip`：

- `data-tool="crop" title="裁剪"` -> `data-tool="crop" data-tooltip="裁剪"`
- `data-tool="brush" title="画笔"` -> `data-tool="brush" data-tooltip="画笔"`
- `data-tool="text" title="文字"` -> `data-tool="text" data-tooltip="文字"`
- `data-tool="mosaic" title="马赛克"` -> `data-tool="mosaic" data-tooltip="马赛克"`
- `data-tool="shape" title="形状"` -> `data-tool="shape" data-tooltip="形状"`

### T 3: 构建验证

- [ ] **S 1: 运行构建检查**

Run: `for f in js/*.js js/tools/*.js js/utils/*.js; do node --check "$f"; done`
Expected: 无输出（所有 JS 文件语法正确）

- [ ] **S 2: 浏览器手动验证**

启动本地服务器后验证：
1. 鼠标悬停每个工具按钮，确认 Tooltip 在按钮右侧快速显示对应工具名称
2. 鼠标离开后 Tooltip 快速消失
3. 没有原生 title tooltip 出现
4. 工具切换功能正常

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|

## 发现的技术债
