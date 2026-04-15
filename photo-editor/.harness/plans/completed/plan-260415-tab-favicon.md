# Favicon 图标实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 PhotoEditor 添加浏览器 Tab favicon 图标（圆角方形+对勾轮廓线 SVG）

**Architecture:** 创建独立 SVG 文件，通过 HTML link 标签引用，零运行时开销

**Tech Stack:** SVG、HTML

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `favicon.svg` | 新增 | favicon 图标 SVG 文件 |
| `index.html` | 修改（line 6-7） | 添加 favicon 引用 |

---

### Task 1: 创建 Favicon SVG 文件

**Files:**
- Create: `favicon.svg`

- [ ] **Step 1: 创建 favicon.svg 文件**

创建圆角方形外框 + 内部对勾标记的 SVG 图标，轮廓线风格：

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect x="3" y="3" width="26" height="26" rx="6" ry="6"
        fill="none" stroke="currentColor" stroke-width="2.5"/>
  <path d="M9 16.5l4 4 10-10"
        fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

设计说明：
- `viewBox="0 0 32 32"` 适配浏览器 favicon 渲染
- `currentColor` 使浏览器自动适配深色/浅色主题
- `rx="6" ry="6"` 圆角方形外框
- 对勾路径使用圆角端点和圆角连接

- [ ] **Step 2: 验证 SVG 语法**

在浏览器中打开 `favicon.svg` 确认图标正确显示。

- [ ] **Step 3: 提交**

```bash
git add favicon.svg
git commit -m "feat: 添加 favicon SVG 图标（圆角方形+对勾）"
```

---

### Task 2: 在 index.html 中引用 Favicon

**Files:**
- Modify: `index.html:6-7`

- [ ] **Step 1: 添加 link 标签**

在 `index.html` 的 `<head>` 中，`<title>` 标签之后添加 favicon 引用：

```html
  <title>PhotoEditor</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/main.css">
```

完整 head 结构应保持：

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PhotoEditor</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/main.css">
</head>
```

- [ ] **Step 2: 验证 HTML 语法**

```bash
node --check index.html 2>&1 || echo "Note: node --check is for JS only"
# HTML 验证：确认 link 标签位置正确，无语法错误
grep -n 'rel="icon"' index.html
```

期望输出：显示 `link rel="icon"` 在 head 区域内（约第 7 行）

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "feat: 在 index.html 中引用 favicon"
```

---

### Task 3: 浏览器验证

**Files:**
- Test: 浏览器手动测试

- [ ] **Step 1: 启动本地服务器**

```bash
python3 -m http.server 8888
```

- [ ] **Step 2: 浏览器访问 http://localhost:8888**

验收检查：
- [ ] 浏览器 Tab 显示 favicon 图标（圆角方形+对勾）
- [ ] 标题显示 "PhotoEditor"（静态不变）
- [ ] 图标在深色/浅色浏览器主题下均可见

- [ ] **Step 3: 验证文件状态**

```bash
git status
```

期望：工作区干净，无未提交变更
