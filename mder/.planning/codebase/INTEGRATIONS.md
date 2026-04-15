# External Integrations

**Analysis Date:** 2026-04-15

## Third-Party Libraries

**Markdown Parsing:**
- **Marked.js v12.0.0** (`lib/marked.min.js`)
  - Loaded via: `<script src="lib/marked.min.js">` in `<head>` of `index.html`
  - Global export: `marked` (available as `window.marked`)
  - Configuration: `marked.setOptions()` at line 371 of `index.html`
    - `gfm: true` - Enable GitHub Flavored Markdown
    - `breaks: true` - Convert line breaks to `<br>`
    - `highlight: (code, lang) => {...}` - Custom callback delegating to highlight.js
  - Primary API used: `marked.parse(content)` - converts Markdown string to HTML
  - License: MIT

**Syntax Highlighting:**
- **Highlight.js v11.9.0** (`lib/highlight.min.js`)
  - Loaded via: `<script src="lib/highlight.min.js">` in `<head>` of `index.html`
  - Global export: `hljs` (available as `window.hljs`)
  - Primary APIs used:
    - `hljs.getLanguage(lang)` - Check if language is supported
    - `hljs.highlight(code, { language: lang }).value` - Explicit language highlighting
    - `hljs.highlightAuto(code).value` - Auto-detect language fallback
  - Style theme: `lib/github.min.css` loaded via `<link rel="stylesheet">`
  - Theme: GitHub Light (colors match github.com)
  - License: BSD-3-Clause

## Browser API Integrations

**File System Access API (Primary):**
- API: `window.showOpenFilePicker()`
- Used in: `openFileWithAPI()` function at line 549 of `index.html`
- Integration pattern:
  ```javascript
  const [fileHandle] = await window.showOpenFilePicker({
    types: [{ description: 'Markdown 文件', accept: { 'text/markdown': ['.md', '.markdown'], 'text/plain': ['.txt'] } }],
    multiple: false,
  });
  const file = await fileHandle.getFile();
  ```
- File handle persistence: `currentFileHandle` global variable stores the `FileSystemFileHandle` for reload operations
- Reload support: `reloadFile()` at line 485 uses `handle.getFile()` to re-read the same file without re-prompting
- Browser support: Chrome 86+, Edge 86+; Safari and Firefox do not support this API

**File API (Fallback):**
- API: `<input type="file">` + `FileReader`
- Used in: `handleFileSelect()` at line 580 of `index.html`
- Integration pattern:
  ```javascript
  const reader = new FileReader();
  reader.onload = (e) => { const content = e.target.result; ... };
  reader.readAsText(file, 'UTF-8');
  ```
- Triggered when: File System Access API is unavailable (`!window.showOpenFilePicker`)
- Hidden input element: `<input type="file" id="fileInput" accept=".md,.markdown,.txt">` at line 351
- No file handle persistence available with this approach (cannot reload without re-selecting)

**Fetch API (Tertiary - Reload):**
- API: `fetch()`
- Used in: `reloadFile()` at line 526 of `index.html`
- Attempts to fetch file from `currentFilePath` as a fallback when file handle is unavailable
- Only works for files served by the same HTTP server
- Reads `Last-Modified` header for timestamp display

**Other Browser APIs:**
- `TextEncoder` - Used in `renderMarkdown()` at line 448 for byte-count calculation: `new TextEncoder().encode(content).length`
- `Date.toLocaleDateString()` / `Date.toLocaleTimeString()` - Used in `formatDate()` at line 416 for timestamp formatting with `zh-CN` locale

## Data Storage

**Databases:**
- None

**File Storage:**
- Local filesystem only - user explicitly selects files via browser dialog
- No server-side file access
- No automatic file scanning or directory traversal

**Caching:**
- None - No `localStorage`, `sessionStorage`, cookies, or IndexedDB usage
- File content is not cached; each reload re-reads from disk
- File handles (`FileSystemFileHandle`) stored in JavaScript memory only (lost on page reload)

## Authentication & Identity

**Auth Provider:**
- None - No authentication required
- App runs entirely client-side, no server communication

## Monitoring & Observability

**Error Tracking:**
- None - No Sentry, LogRocket, or external error tracking
- Errors displayed to user via `showError()` function rendering `.error-message` component

**Logs:**
- `console.log` - Used only in fallback path ("不支持 File System Access API，回退到传统方式") at line 551
- `console.error` - Used for unexpected errors in `openFileWithAPI()` at line 573
- No structured logging, no log aggregation

## CI/CD & Deployment

**Hosting:**
- Static file hosting via local HTTP server (port 8888)
- Accessible at: `http://localhost:8888/mder/`
- No cloud hosting platform configured

**CI Pipeline:**
- None - No GitHub Actions, no CI configuration files
- No automated testing, linting, or build steps

## Environment Configuration

**Required env vars:**
- None

**Secrets location:**
- N/A - No secrets or API keys used

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None - No network requests except optional `fetch()` for reload of locally-served files

## Integration Architecture

**Loading Sequence:**
1. Browser parses `index.html`
2. `<script src="lib/marked.min.js">` loads Marked.js, exposes global `marked`
3. `<script src="lib/highlight.min.js">` loads Highlight.js, exposes global `hljs`
4. `<link rel="stylesheet" href="lib/github.min.css">` loads code highlighting styles
5. Inline `<script>` in `index.html` body executes:
   - Configures `marked.setOptions()` with highlight callback
   - Initializes global state variables (`currentFileHandle`, `currentFilePath`, `currentFileName`)
   - Defines utility functions (`showError`, `clearError`, `formatBytes`, `formatDate`, `renderMarkdown`, `readFile`, `reloadFile`, `openFileWithAPI`, `handleFileSelect`)
   - Registers event listeners via `addEventListener`

**Markdown Rendering Pipeline:**
```
User selects file
  -> openFileWithAPI() or handleFileSelect()
    -> FileReader.readAsText() or handle.getFile()
      -> readFile() callback
        -> renderMarkdown(content, ...)
          -> marked.parse(content)  // Markdown -> HTML (with highlight callback)
            -> highlight callback: hljs.highlight(code, {language}) or hljs.highlightAuto(code)
          -> document.getElementById('markdownOutput').innerHTML = html
          -> Update file info display (path, lines, bytes, timestamp)
```

**Fallback Chain:**
```
File System Access API (showOpenFilePicker)
  -> if unsupported: <input type="file"> (FileReader API)
    -> if reload: fetch() from known path
      -> if all fail: prompt user to re-select file
```

---

*Integration audit: 2026-04-15*
