# 旋转按钮可见性控制 Implementation Plan

- 创建时间: 2026-04-03 16:35
- 状态: completed
- 关联 spec: .harness/specs/active/spec-260403-rotate-btn-visibility.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 旋转按钮仅在裁剪工具激活时显示，其他工具时隐藏。

**Architecture:** 在 `switchTool()` 函数中根据工具类型控制旋转按钮的 `u-hidden` 类。

**Tech Stack:** ES6 Modules, CSS BEM

---

## File Structure

| 文件 | 操作 | 职责 |
|------|------|------|
| js/main.js | 修改 | 在 switchTool() 中增加旋转按钮显示/隐藏逻辑 |

---

### Task 1: 修改 switchTool 函数

**Files:**
- Modify: `js/main.js:38-56`

- [ ] **Step 1: 修改 switchTool 函数，增加旋转按钮可见性控制**

在 `switchTool()` 函数中，`updatePropertyBar()` 调用之后增加旋转按钮可见性控制：

```javascript
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

  // 控制旋转按钮可见性：仅裁剪工具显示
  const btnRotate = document.getElementById('btnRotate');
  if (btnRotate) {
    btnRotate.classList.toggle('u-hidden', toolName !== 'crop');
  }
}
```

- [ ] **Step 2: 验证 JS 语法**

Run: `node --check js/main.js`
Expected: 无输出（语法正确）

- [ ] **Step 3: 浏览器测试**

1. 启动本地服务器：`python3 -m http.server 8888`
2. 浏览器访问 http://localhost:8888
3. 加载任意图片
4. 验证裁剪工具激活时旋转按钮可见
5. 依次切换到画笔/文字/马赛克/形状工具，验证旋转按钮隐藏

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|

## 发现的技术债
- 无
