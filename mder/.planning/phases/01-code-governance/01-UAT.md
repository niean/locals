---
status: testing
phase: 01-code-governance
source: [.planning/phases/01-code-governance/01-01-SUMMARY.md]
started: 2026-04-16T00:00:00Z
updated: 2026-04-16T00:00:00Z
---

## Current Test

number: 2
name: File Type Filter
expected: |
  File picker only shows .md, .markdown, and .txt files
awaiting: user response

## Tests

### 1. Open Markdown File
expected: Click "打开文件" button or empty state area. File picker opens. Select a .md file — it renders as formatted HTML. File info bar shows path, line count, size, and time.
result: pass

### 2. File Type Filter
expected: File picker only shows .md, .markdown, and .txt files
result: [pending]

### 3. Reload File
expected: After opening a file, "重新加载" button appears. Clicking it refreshes the content from the original file
result: [pending]

### 4. Markdown Rendering
expected: Headers, paragraphs, lists, tables, code blocks with syntax highlighting, blockquotes, links render correctly in GitHub style
result: [pending]

### 5. Responsive Layout
expected: Resize browser to <768px — header stacks vertically, text sizes adapt, layout remains usable
result: [pending]

### 6. Error Display
expected: If an error occurs, red error message appears with "错误：" prefix (no emoji)
result: [pending]

### 7. Empty State
expected: Before opening any file, page shows "点击此处或右上角的'打开文件'按钮选择 Markdown 文件" text (no emoji icon). Clicking empty state opens file picker
result: [pending]

### 8. Hidden Elements Use CSS Class
expected: Reload button and file input are hidden using .is-hidden CSS class (no inline style attributes in HTML source)
result: [pending]

### 9. JavaScript Scope Isolation
expected: No JavaScript variables leak to window global scope (IIFE wrapping with 'use strict' confirmed in source)
result: [pending]

## Summary

total: 9
passed: 1
issues: 0
pending: 8
skipped: 0

## Gaps

[none yet]
