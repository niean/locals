# Testing Patterns

**Analysis Date:** 2026-04-15

## Test Framework

**Runner:** None

No automated test framework exists. There are no test files (`.test.*` / `.spec.*`), no `jest.config.*`, no `vitest.config.*`, no `package.json`, no npm dependencies, and no build tooling.

**Assertion Library:** None

**Run Commands:** Not applicable - no automated test runner.

## Test File Organization

**Location:** No test files exist anywhere in the codebase.

**Naming:** Not applicable.

**Structure:** Not applicable.

## Quality Assurance Approach

**Manual browser-based testing** is the sole verification method:

1. Open `index.html` in browser via HTTP server (localhost:8888/mder/)
2. Manually test by opening different file types (.md, .markdown, .txt)
3. Visually inspect rendered output for correctness
4. Check browser console for zero errors and zero warnings

**Quality guardrail:** Browser console must show zero errors and zero warnings after any code change.

## Error Handling Coverage

**Patterns verified through manual testing:**

| Scenario | Error Handler | Expected Behavior |
|----------|--------------|-------------------|
| File read failure | `reader.onerror` callback | Shows "读取文件失败" in `.error-message` |
| Markdown render failure | `try/catch` in `renderMarkdown()` | Shows "渲染 Markdown 时出错：{message}" |
| Open file API failure | `try/catch` in `openFileWithAPI()` | Shows "打开文件失败: {message}" |
| User cancels file picker | `e.name === 'AbortError'` check | Silently ignored, no error shown |
| No file to reload | Guard in `reloadFile()` | Shows "没有可重新加载的文件" |
| Reload without saved handle | Fallback chain in `reloadFile()` | Prompts user to re-select file |

**Error display function** (`index.html` line 390):
```javascript
const showError = (message) => {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = `<div class="error-message">❌ ${message}</div>`;
};
```

**Error clearing function** (`index.html` line 396):
```javascript
const clearError = () => {
    document.getElementById('errorContainer').innerHTML = '';
};
```

## Browser Compatibility Targets

**Supported browsers:** Latest versions of:
- Chrome
- Safari
- Firefox
- Edge

**Feature detection and graceful degradation:**
- **File System Access API:** Primary method via `window.showOpenFilePicker`
- **Fallback:** Traditional `<input type="file">` when API unavailable
- **Detection pattern:**
  ```javascript
  if (!window.showOpenFilePicker) {
      console.log('不支持 File System Access API，回退到传统方式');
      document.getElementById('fileInput').click();
      return;
  }
  ```

**Mobile:** Responsive layout via `@media (max-width: 768px)` query in `.header` and `.output-header` components.

## Console Logging

**Production code console usage** (all intentional, not debug leftovers):

| Location | Method | Message | Purpose |
|----------|--------|---------|---------|
| `openFileWithAPI()` line 551 | `console.log` | "不支持 File System Access API，回退到传统方式" | Degradation notification |
| `openFileWithAPI()` line 573 | `console.error` | "打开文件失败:" | Unexpected error logging |

**Rules observed:**
- `console.log` only for degradation/fallback notifications
- `console.error` for genuine error conditions
- No `console.warn` or `console.info`
- No debug statements remain in production code

## Manual Testing Checklist

Based on the codebase structure, these are the scenarios that should be manually tested after any change:

**File Operations:**
1. Open .md file via File System Access API (modern browsers)
2. Open .markdown file via File System Access API
3. Open .txt file via File System Access API
4. Open file via fallback file input (or in browsers without API support)
5. Select wrong file type (should show error)
6. Cancel file picker dialog (should show no error)
7. Reload previously opened file (via "重新加载" button)

**Rendering:**
8. Render Markdown with headings (h1-h6)
9. Render Markdown with code blocks (verify syntax highlighting)
10. Render Markdown with tables
11. Render Markdown with blockquotes
12. Render Markdown with images
13. Render Markdown with links
14. Render empty/blank file

**UI:**
15. Verify responsive layout at narrow viewport (< 768px)
16. Verify hover states on action buttons
17. Verify empty state display and click behavior
18. Verify file info footer shows path, line count, size, time

**Error Handling:**
19. Trigger file read error (e.g., permissions issue)
20. Trigger render error (malformed content)
21. Attempt reload when no file is loaded

**Console:**
22. Verify zero errors after all operations
23. Verify zero warnings after all operations

## What is NOT Tested

| Area | Gap | Risk |
|------|-----|------|
| Markdown rendering edge cases | No systematic coverage of all GFM features | Broken rendering may go unnoticed |
| Large file handling | No performance benchmarks | Slow rendering on large files |
| Cross-browser consistency | Manual testing is browser-dependent | Inconsistent behavior across browsers |
| Error message quality | No automated validation of error text | Incorrect or missing error messages |
| File encoding | Only UTF-8 tested via `readAsText(file, 'UTF-8')` | Non-UTF-8 files may render incorrectly |
| Reload file flow | Complex fallback chain (API -> picker -> fetch -> error) | Some fallback paths untested |

## Testing Recommendations for Future Changes

Given the absence of automated testing:

1. **After any code change:** Open browser, test the affected flow, check console for errors
2. **After CSS changes:** Verify layout at both desktop and mobile viewport widths
3. **After JS changes:** Test all button interactions (打开文件, 重新加载, empty state click)
4. **After marked.js config changes:** Test rendering of code blocks, tables, and lists
5. **Before commit:** Ensure console shows zero errors and zero warnings

---

*Testing analysis: 2026-04-15*
