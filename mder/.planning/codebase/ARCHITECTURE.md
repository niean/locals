# Architecture

**Analysis Date:** 2026-04-15

## Pattern Overview

**Overall:** Single-File Inline Architecture

All application code (HTML, CSS, JavaScript) lives in a single `index.html` file. No build tools, no bundlers, no frameworks. Third-party libraries are loaded as `<script>` / `<link>` tags from the `lib/` directory.

**Key Characteristics:**
- Zero build step -- served directly by a static HTTP server (port 8888)
- All JS functions in global scope, no module system
- All CSS in a single `<style>` tag, organized by ITCSS layers
- DOM manipulated via `document.getElementById()` and `innerHTML`
- External dependencies: marked.js (markdown parsing), highlight.js (syntax highlighting)

## Layers

**View Layer (HTML):**
- Purpose: DOM structure and UI layout
- Location: `index.html` (lines 1-363)
- Contains: Header with action buttons, hidden file input, output section with empty state, error container, file info bar
- Depends on: CSS layer for styling
- Used by: JS layer via DOM selectors

**Style Layer (CSS):**
- Purpose: Visual presentation and responsive layout
- Location: `index.html` (lines 11-333, inside `<style>`)
- Contains: ITCSS-organized styles -- Generic (reset), Elements (body), Components (container, header, output, markdown-content, empty-state, error-message, file-info)
- Depends on: None
- Used by: All DOM elements

**Logic Layer (JavaScript):**
- Purpose: File I/O, markdown rendering, UI interaction
- Location: `index.html` (lines 365-596, inside `<script>`)
- Contains: Constants, configuration, utility functions, event handlers, rendering pipeline
- Depends on: `marked` global (from `lib/marked.min.js`), `hljs` global (from `lib/highlight.min.js`), browser APIs (File System Access API, FileReader, TextEncoder, fetch)
- Used by: User interactions (button clicks, file selection)

**Dependency Layer (lib/):**
- Purpose: Third-party library dependencies
- Location: `lib/` directory
- Contains: `marked.min.js` (34.3KB, markdown parser), `highlight.min.js` (118.9KB, syntax highlighter), `github.min.css` (1.3KB, GitHub code style)
- Depends on: None
- Used by: JS layer (globals `marked` and `hljs`)

## Data Flow

**File Open Flow (File System Access API -- primary path):**

1. User clicks "打开文件" button (`#openFileBtn`)
2. `openFileWithAPI()` calls `window.showOpenFilePicker()` with file type filters (`.md`, `.markdown`, `.txt`)
3. User selects file → returns `FileSystemFileHandle`
4. `handle.getFile()` returns a `File` object
5. `readFile(file, fileHandle)` creates a `FileReader`, reads as UTF-8 text
6. On load: `renderMarkdown(content, filePath, file.name, fileHandle, lastModified)` is called
7. `marked.parse(content)` converts markdown to HTML
8. `document.getElementById('markdownOutput').innerHTML = html` renders the output
9. File info bar is populated with path, line count, byte size, modification time
10. Reload button becomes visible

**File Open Flow (Traditional file input -- fallback path):**

1. `openFileWithAPI()` detects `window.showOpenFilePicker` is unavailable
2. Triggers `document.getElementById('fileInput').click()`
3. User selects file → `handleFileSelect(event)` fires on `change`
4. File extension validated against `/\\.(md|markdown|txt)$/i`
5. `readFile(file)` called without file handle
6. Rendering proceeds identically, but reload capability is limited

**Reload File Flow:**

1. User clicks "重新加载" button (`#reloadFileBtn`)
2. `reloadFile()` checks available reload strategies in priority order:
   - Strategy 1: If `currentFileHandle` exists, use `handle.getFile()` directly
   - Strategy 2: If `window.showOpenFilePicker` available, prompt user to re-select (same file path)
   - Strategy 3: Attempt `fetch(currentFilePath)` (works if served from HTTP server)
   - Strategy 4: Show error message prompting manual re-selection

**State Management:**
- Three module-level variables hold current file state: `currentFileHandle`, `currentFilePath`, `currentFileName`
- State is set in `renderMarkdown()` on every successful render
- State is read by `reloadFile()` to determine reload strategy
- No reactive state system; all state is imperative and manually synchronized

## Key Abstractions

**Rendering Pipeline:**
- Purpose: Transform raw markdown text into styled HTML
- Entry point: `renderMarkdown()` at `index.html:432`
- Pattern: Sequential transform -- raw text → `marked.parse()` → HTML string → `innerHTML` injection
- Highlighting integrated via `marked.setOptions({ highlight: ... })` callback that delegates to `hljs`

**File Abstraction:**
- Purpose: Unified file access across API and fallback paths
- Pattern: Both paths converge on `readFile(file, fileHandle)` which produces the same render result
- The `fileHandle` parameter is optional; when present, enables direct reload without re-prompting

**Error Handling:**
- Strategy: Inline error display with DOM injection
- `showError(message)` at `index.html:390` -- injects `.error-message` div into `#errorContainer`
- `clearError()` at `index.html:396` -- clears error container
- Each major operation has its own try/catch block
- File reading errors handled via `FileReader.onerror` callback
- Silent fallback for highlight.js failures (line 376: `catch (err) {}`)

## Entry Points

**Browser Load:**
- Location: `index.html`
- Triggers: Browser navigation to `http://localhost:8888/mder/`
- Responsibilities: Render empty state with call-to-action, initialize marked.js configuration, bind event listeners

**Event Listeners (bound at script load, `index.html:592-595`):**
- `#reloadFileBtn` click → `reloadFile()`
- `#openFileBtn` click → `openFileWithAPI()`
- `#fileInput` change → `handleFileSelect()`
- `.empty-state` click → `openFileWithAPI()`

## Cross-Cutting Concerns

**Logging:** Console-only. `console.log()` used for debug trace (line 551). `console.error()` for unexpected failures (line 573).

**Validation:** File extension check in `handleFileSelect()` at `index.html:583`. MIME type filtering in `showOpenFilePicker()` config.

**Responsive Design:** Media queries at `@media (max-width: 768px)` for header (line 100) and output-header (line 139) to stack elements vertically on mobile.

**Security:** Uses `marked.parse()` for markdown rendering (not raw innerHTML of user input). File access requires explicit user gesture (no auto-read). No `eval()` usage. No sensitive data stored client-side.

---

*Architecture analysis: 2026-04-15*
