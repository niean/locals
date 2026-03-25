# 记住原文件名 实现计划

- 创建时间: 2026-03-25
- 状态: active
- 关联 spec: .harness/specs/active/spec-250325-save-filename.md

> **For agentic workers:** REQUIRED SUB-SKILL: Use .harness/skills/superpowers/executing-plans.md to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 文件上传时记住原文件名，下载时默认使用该文件名（含格式后缀）

**Architecture:** state 新增 imageFileName 字段，file.js 新增 extractFileName 函数，main.js 在上传和下载流程中调用

**Tech Stack:** ES6 Modules, 纯 JavaScript

---

## File Structure

| 文件 | 操作 | 职责 |
|------|------|------|
| js/utils/file.js | 修改 | 新增 extractFileName 函数 |
| js/state.js | 修改 | 新增 imageFileName 默认值 |
| js/main.js | 修改 | 上传时存储文件名，下载时使用文件名 |

---

### Task 1: file.js 新增 extractFileName 函数

**Files:**
- Modify: `js/utils/file.js`

- [ ] **Step 1: 添加 extractFileName 函数**

在 `getExtension` 函数后添加：

```javascript
function extractFileName(file) {
  const name = file.name || '';
  const dotIndex = name.lastIndexOf('.');
  return dotIndex > 0 ? name.substring(0, dotIndex) : name || 'photo-edit';
}
```

- [ ] **Step 2: 更新 export**

```javascript
export { loadImageFromFile, downloadCanvas, getMimeType, getExtension, extractFileName };
```

---

### Task 2: state.js 新增 imageFileName 默认值

**Files:**
- Modify: `js/state.js`

- [ ] **Step 1: 在初始状态中添加 imageFileName**

找到 state 对象定义，添加 `imageFileName` 字段：

```javascript
const state = {
  tool: 'crop',
  image: null,
  imageType: 'image/png',
  imageFileName: null,  // 新增
  canvasWidth: 0,
  canvasHeight: 0,
  toolOptions: { ... },
};
```

---

### Task 3: main.js 修改上传和下载逻辑

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: 更新 import 语句**

```javascript
import { loadImageFromFile, downloadCanvas, getMimeType, getExtension, extractFileName } from './utils/file.js';
```

- [ ] **Step 2: 修改 handleFile 函数**

在 `state.set('imageType', getMimeType(file));` 后添加：

```javascript
state.set('imageFileName', extractFileName(file));
```

- [ ] **Step 3: 修改 handleDownload 函数**

将：
```javascript
downloadCanvas(mainC, `photo-edit.${ext}`, mimeType);
```

改为：
```javascript
const fileName = state.get('imageFileName') || 'photo-edit';
downloadCanvas(mainC, `${fileName}.${ext}`, mimeType);
```

---

### Task 4: 验证

- [ ] **Step 1: 语法验证**

```bash
for f in js/*.js js/tools/*.js js/utils/*.js; do node --check "$f"; done
```

Expected: 无输出（无错误）

- [ ] **Step 2: 浏览器手动测试**

1. 启动服务器：`python3 -m http.server 8888`
2. 访问 http://localhost:8888
3. 上传 test-image.jpg
4. 点击下载（默认格式）
5. 验证下载文件名为 test-image.jpg
6. 切换导出格式为 PNG
7. 再次下载
8. 验证下载文件名为 test-image.png

---

## 变更记录
| 时间 | 变更内容 |
|------|---------|
| 2026-03-25 | 创建计划 |

## 发现的技术债
- 无
