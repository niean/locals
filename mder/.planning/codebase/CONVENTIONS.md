# Coding Conventions

**Analysis Date:** 2026-04-15

## Project Overview

mder is a single-file browser application (index.html) that renders Markdown files with syntax highlighting. All custom HTML/CSS/JS lives in one file; third-party libraries live in `lib/`.

## Naming Patterns

**Files:**
- Single application file: `index.html`
- Third-party libraries use versioned minified names: `marked.min.js`, `highlight.min.js`, `github.min.css`
- All files use lowercase English kebab-case

**Functions:**
- Use `const` + arrow function expressions exclusively: `const renderMarkdown = (content, filePath, ...) => { ... }`
- Function names use camelCase with verb-noun order: `renderMarkdown`, `readFile`, `reloadFile`, `openFileWithAPI`, `handleFileSelect`, `showError`, `clearError`, `formatBytes`, `formatDate`, `toggleReloadButton`

**Variables:**
- Use `const` for constants (UPPER_SNAKE_CASE): `BYTES_PER_KB`, `BYTES_PER_MB`
- Use `let` for mutable state (camelCase): `currentFileHandle`, `currentFilePath`, `currentFileName`
- Never use `var`

**CSS Classes:**
- BEM naming: `.block__element--modifier` (e.g., `.header__title`, `.header__action-btn`, `.empty-state__icon`, `.empty-state__text`)
- Block names use lowercase with hyphens: `.header`, `.output-section`, `.empty-state`, `.markdown-content`, `.error-message`, `.file-info`, `.container`
- Elements use double underscore: `.header__content`, `.header__actions`, `.output-header__title`
- Modifiers use double dash (not currently used in the codebase but defined in convention)
- Exception: `.markdown-content` uses descendant selectors (e.g., `.markdown-content h1`) because marked.js generates HTML without custom classes

**DOM IDs:**
- camelCase with prefix: `fileInput`, `markdownOutput`, `errorContainer`, `fileInfo`, `reloadFileBtn`, `openFileBtn`

## HTML Structure

**Document:**
- HTML5 doctype: `<!DOCTYPE html>`
- Language attribute: `lang="zh-CN"`
- UTF-8 charset
- Viewport meta for responsive design

**Layout:**
- Single `.container` div wrapping all content
- `.header` section at top (title + action buttons)
- Hidden `<input type="file">` for fallback file selection
- `.output-section` for rendered content
- `.file-info` footer for metadata display

**Script/Style placement:**
- CSS in `<style>` tag inside `<head>`
- Third-party scripts in `<head>` via `<script src="lib/...">` and `<link href="lib/...">`
- Custom JavaScript in `<script>` tag at end of `<body>`

## JavaScript Style (Airbnb Style Guide)

**Function definitions:**
```javascript
const formatBytes = (bytes) => {
    if (bytes < BYTES_PER_KB) return `${bytes} B`;
    if (bytes < BYTES_PER_MB) return `${(bytes / BYTES_PER_KB).toFixed(2)} KB`;
    return `${(bytes / BYTES_PER_MB).toFixed(2)} MB`;
};
```

**String interpolation:**
- Always use template literals (backticks), never `+` concatenation:
  ```javascript
  `文件：${displayPath} | 行数：${lineCount} | 大小：${formatBytes(byteCount)} | 时间：${updateTime}`
  ```

**Error handling:**
- Use try/catch around async operations
- User-facing errors display via `showError(message)` helper
- AbortError from file picker is silently ignored (user cancellation)

**Event binding:**
- Always use `addEventListener`, never inline `onclick`/`onchange` attributes
```javascript
document.getElementById('reloadFileBtn').addEventListener('click', reloadFile);
document.getElementById('openFileBtn').addEventListener('click', openFileWithAPI);
document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.querySelector('.empty-state').addEventListener('click', openFileWithAPI);
```

**Async patterns:**
- Use `async/await` for File System Access API operations
- Use `FileReader` with `onload`/`onerror` callbacks for traditional file input fallback

**Magic numbers:**
- Extract to named constants at top of script: `BYTES_PER_KB = 1024`, `BYTES_PER_MB = 1024 * 1024`

## CSS Architecture (ITCSS + BEM)

**Layer organization** (layers separated by comment dividers):

1. **Generic - Reset:** `* { margin: 0; padding: 0; box-sizing: border-box; }`
2. **Elements - Base styles:** `body { font-family: ... }`
3. **Components:** `.container`, `.header`, `.output-section`, `.markdown-content`, `.empty-state`, `.error-message`, `.file-info`

**BEM class naming:**
```css
/* Block */
.header { ... }

/* Elements */
.header__content { ... }
.header__title { ... }
.header__subtitle { ... }
.header__actions { ... }
.header__action-btn { ... }

/* Element hover state */
.header__action-btn:hover { ... }
```

**Media queries:**
- Placed immediately after the component they modify, not at file end
- Breakpoint: `@media (max-width: 768px)`
```css
@media (max-width: 768px) {
    .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    .header__title {
        font-size: 1.5em;
    }
}
```

**Font stacks:**
- Body: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif`
- Code: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`

**Color scheme:**
- Primary gradient: `#667eea` -> `#764ba2`
- Error: `#fee` background, `#c33` text and border
- Neutral grays: `#212529` (text), `#6c757d` (secondary), `#e9ecef` (borders)

## Import Organization

**No build system or module imports.** All code is inline in `index.html`. Third-party libraries load via `<script>` and `<link>` tags in `<head>`:
1. `lib/marked.min.js` (Markdown parser)
2. `lib/highlight.min.js` (Syntax highlighting)
3. `lib/github.min.css` (GitHub code theme)

Custom `<style>` and `<script>` tags follow third-party includes.

## Error Handling

**Patterns:**
- `showError(message)` - Renders error in `#errorContainer` as `.error-message` div with red left border
- `clearError()` - Removes all error content from `#errorContainer`
- All file operations wrapped in try/catch
- FileReader uses `onerror` callback for read failures
- `AbortError` from file picker silently ignored (user cancellation is not an error)

**Error messages are in Chinese:**
- "读取文件失败" (File read failed)
- "渲染 Markdown 时出错：{message}" (Error rendering Markdown)
- "打开文件失败: {message}" (Failed to open file)
- "没有可重新加载的文件" (No file to reload)

## Logging

**Framework:** Native `console` only (no logging library)

**Patterns:**
- `console.log` - Only in feature degradation scenarios (e.g., "不支持 File System Access API，回退到传统方式")
- `console.error` - For unexpected errors (e.g., "打开文件失败:")
- `console.warn` / `console.info` - Not used
- Production code must not contain debug `console.log` statements

## Comments

**CSS:**
- Section dividers use full-width comment blocks:
  ```css
  /* ==========================================================================
     Components - Header
     ========================================================================== */
  ```
- Exception notes explain intentional deviations:
  ```css
  /* marked.js generates raw HTML without custom classes,
     so descendant selectors are intentionally used here. */
  ```

**JavaScript:**
- Inline comments before logical sections:
  ```javascript
  // 配置 marked
  // 保存当前文件的句柄和路径信息
  // 显示错误信息
  // 读取文件内容
  // 重新加载文件
  ```
- All comments in Chinese

## Localization

**UI Language:** Chinese (zh-CN)

**All user-visible strings in Chinese:**
- Button text: "打开文件", "重新加载"
- Empty state: "请点击右上角的\"打开文件\"按钮选择 Markdown 文件"
- Error messages: "读取文件失败", "渲染 Markdown 时出错"
- File metadata labels: "文件", "行数", "大小", "时间"

**Date/time formatting:** Uses `zh-CN` locale
```javascript
date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
```

**Unit abbreviations:** English (B, KB, MB)

## Module Design

**Single module architecture:**
- No exports/imports (all code in one file)
- Functions defined at script scope, no IIFE wrapper
- State variables at script top level
- Event listeners attached at script end (DOMContentLoaded not needed since script is at body end)

**Configuration:**
- marked.js configured at script top via `marked.setOptions()`:
  ```javascript
  marked.setOptions({
      highlight: (code, lang) => { ... },
      breaks: true,
      gfm: true,
  });
  ```

---

*Convention analysis: 2026-04-15*
