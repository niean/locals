---
phase: 01-code-governance
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - index.html
findings:
  critical: 1
  warning: 1
  info: 3
  total: 5
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-16
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

Reviewed index.html following a code governance refactoring that added a `.is-hidden` CSS utility class, wrapped all JavaScript in an IIFE with strict mode, and removed emoji instances. The IIFE wrapping is correctly implemented -- no scope regressions detected. The `classList.toggle` replacement for `style.display` is functionally correct (`toggle(className, force)` with a boolean second argument is well-supported). However, a significant XSS vulnerability exists in the markdown rendering path, and a silent error-swallowing pattern in the reload flow masks failures.

## Critical Issues

### CR-01: XSS via unsanitized marked.parse output into innerHTML

**File:** `index.html:446`
**Issue:** `marked.parse(content)` produces raw HTML from user-provided markdown content. Marked.js by default does NOT sanitize output -- it passes through raw HTML tags (including `<script>`, `<img onerror=...>`, `<iframe>`, etc.) unchanged. This HTML is then assigned directly to `document.getElementById('markdownOutput').innerHTML`. A malicious or crafted markdown file could execute arbitrary JavaScript in the browser context. The project spec claims "依赖其内置的安全处理" (relies on built-in security handling), but marked.js has no built-in sanitization by default.

**Fix:** Add a sanitization step before inserting into the DOM. Two options:

Option A -- Use DOMPurify (recommended, add lib/purify.min.js):
```js
const html = marked.parse(content);
const clean = DOMPurify.sanitize(html);
document.getElementById('markdownOutput').innerHTML = clean;
```

Option B -- Configure marked to disallow raw HTML:
```js
marked.setOptions({
    // ... existing options ...
    renderer: new marked.Renderer(),
});
// Then sanitize or use a custom renderer that strips dangerous tags
```

## Warnings

### WR-01: Silent error swallowing in fetch fallback of reloadFile

**File:** `index.html:546-548`
**Issue:** The empty `catch` block at line 546 silently swallows all fetch errors (network failures, CORS issues, 404s). Unlike the `hljs.highlight` catch block (line 386) which is an intentional graceful degradation for an optional feature, the fetch fallback here is a last-resort recovery path. If it fails, the user never learns why -- the code just falls through to an unhelpful generic error message at line 552.

**Fix:** Add minimal logging or accumulate the error for the final message:
```js
} catch (e) {
    console.warn('fetch fallback failed:', e.message);
    // falls through to final error message
}
```

## Info

### IN-01: console.log debug statement present

**File:** `index.html:561`
**Issue:** `console.log('不支持 File System Access API，回退到传统方式')` is a debug-level log that will appear in the browser console during normal operation (when the API is unavailable). The project spec requires "浏览器控制台零错误零警告" -- while this is not an error or warning, it still pollutes the console.

**Fix:** Remove the console.log line, or if logging is desired for diagnostics, use a conditional debug flag:
```js
// Remove line 561 entirely, or:
// DEBUG && console.log('...');
```

### IN-02: hljs.highlightAuto called without error handling

**File:** `index.html:388`
**Issue:** `hljs.highlightAuto(code).value` is called without a try-catch wrapper. The explicit-language path (line 385) is protected by try-catch, but the fallback to `highlightAuto` is not. If `highlightAuto` throws (e.g., on malformed input), the error will propagate and break the highlight callback.

**Fix:**
```js
const highlight = (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
        try {
            return hljs.highlight(code, { language: lang }).value;
        } catch (err) {}
    }
    try {
        return hljs.highlightAuto(code).value;
    } catch (err) {
        return hljs.escape(code); // fallback to plain escaped text
    }
};
```

### IN-03: empty-state__icon element removed without corresponding CSS cleanup

**File:** `index.html:298-302`
**Issue:** The refactoring removed the `<div class="empty-state__icon">` element from the HTML (the emoji was removed), but the `.empty-state__icon` CSS rule (lines 298-302) remains. This is dead CSS that is no longer referenced by any element.

**Fix:** Remove the `.empty-state__icon` CSS rule block if the icon element is permanently removed, or restore a non-emoji icon (e.g., an SVG) if the visual design still needs it.

---

_Reviewed: 2026-04-16_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
