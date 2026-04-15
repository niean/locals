# Phase 1: Code Governance - Research

**Researched:** 2026-04-15
**Domain:** JavaScript (Airbnb Style Guide), CSS (ITCSS + BEM), HTML semantics
**Confidence:** HIGH

## Summary

The mder codebase is a single-file application (`index.html`, ~598 lines) containing all HTML, CSS, and JavaScript. It is a Markdown file renderer that opens local `.md`/`.markdown`/`.txt` files via File System Access API (with fallback to traditional file input), renders via marked.js v12.0.0, and applies syntax highlighting via highlight.js v11.9.0.

The codebase is already well-structured: CSS follows ITCSS layering (Generic -> Elements -> Components) with BEM naming, JavaScript uses `const`/`let` (no `var`), arrow functions, template literals, and `addEventListener`. The gaps are narrow and well-defined: no IIFE wrapper (all variables are global-scope), 5 emoji characters scattered across HTML and JS, 2 inline `style` attributes, and minor trailing comma gaps in multi-line object literals.

**Primary recommendation:** Apply all changes in a single atomic edit (D-01). Wrap all JS in an IIFE, replace all 5 emoji instances with plain Chinese text labels, move 2 inline `style` attributes to CSS classes, add trailing commas to multi-line object literals that lack them, and verify all functionality is preserved.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 一次性全部改完 -- all style changes in a single batch. Codebase is small (598 lines), risk is low. Single atomic commit.
- **D-02:** 全部移除emoji -- remove all emoji characters from HTML and JS (unicode emoji like U+1F4DD, U+1F4C1, U+1F504, U+1F4C4, U+274C). Replace with plain text or SVG icons if visual distinction is needed.
- **D-03:** 加IIFE包裹 -- wrap all JavaScript code in an Immediately Invoked Function Expression `(function() { ... })()` to avoid global scope pollution. Functions remain accessible within the closure. Event listeners bound inside the IIFE. State variables (`currentFileHandle`, etc.) become module-level inside the closure, not window globals.
- CSS is already largely ITCSS/BEM compliant -- layer organization and BEM naming are good. Minor cleanup may be needed.
- JS mostly follows Airbnb style (const/arrow functions, template literals) but has gaps: missing trailing commas, `marked.setOptions()` as top-level side-effect call, inline `style` attributes on buttons.
- All refactoring must not change any user-visible behavior.

### Claude's Discretion

- Exact trailing comma placement within Airbnb rules
- Whether to add JSDoc comments (none currently exist)
- Media query organization (already placed correctly per component)

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GOV-01 | JS code per Airbnb JavaScript Style Guide | See "Airbnb Style Deviations" section below for exact locations and fixes |
| GOV-02 | CSS per ITCSS architecture + BEM naming | CSS is already compliant; see "CSS Audit" for minor cleanup items |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Code style enforcement | Browser / Client | -- | All code runs in-browser; no build step or server-side linting |
| CSS architecture | Browser / Client | -- | CSS is inline in `<style>` tag within index.html |
| JS module structure | Browser / Client | -- | IIFE provides closure-based module pattern for single-file architecture |
| Emoji removal | Browser / Client | -- | Pure HTML/JS text replacement, no external dependency |

## Standard Stack

No new libraries are introduced. This phase is a pure refactor of existing code.

### Existing Dependencies (verified)
| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| marked.js | 12.0.0 | Markdown parsing | `lib/marked.min.js` header comment |
| highlight.js | 11.9.0 | Code syntax highlighting | `lib/highlight.min.js` line 305 |

### Tooling (verification only, not shipped)
| Tool | Purpose | Availability |
|------|---------|-------------|
| ESLint (airbnb config) | JS style verification | Not installed -- manual verification recommended |
| stylelint | CSS linting | Not installed -- manual verification recommended |

**Installation:** None required. This phase modifies `index.html` only.

## Architecture Patterns

### System Architecture Diagram

```
User Action
    |
    v
[File Selection] --(File System Access API)--> openFileWithAPI()
    |                      |
    |                      v (fallback)
    |               file input <input> --> handleFileSelect()
    |
    v
[File Read] --(FileReader / fileHandle.getFile())--> readFile()
    |
    v
[Markdown Render] --(marked.parse())--> renderMarkdown()
    |
    +---> DOM output (innerHTML)
    +---> File metadata display (path, lines, size, time)
    +---> Reload button visibility toggle
    |
    v
[Syntax Highlight] --(hljs.highlight())--> (via marked highlight option)
```

### Recommended Project Structure

No changes. Single-file architecture is locked. All modifications remain in `index.html`.

### Pattern: IIFE Module Wrapper (Airbnb-compatible for no-build scenarios)

**What:** Wrap all JavaScript in an IIFE to avoid global scope pollution. This is the standard pattern when ES modules (`type="module"`) cannot be used (older browser support) or when a build step is not available.

**When to use:** Single-file applications without bundlers, where `const`/`let` at script top-level would otherwise become global variables.

**Example:**
```javascript
(function() {
    'use strict';

    // Constants (inside closure, not global)
    const BYTES_PER_KB = 1024;
    const BYTES_PER_MB = 1024 * 1024;

    // Module-level state (inside closure)
    let currentFileHandle = null;
    let currentFilePath = null;
    let currentFileName = null;

    // All functions defined as const arrow functions inside IIFE
    const formatBytes = (bytes) => { ... };

    // Top-level side effects (marked.setOptions) inside IIFE
    marked.setOptions({ ... });

    // Event listeners bound inside IIFE
    document.getElementById('reloadFileBtn').addEventListener('click', reloadFile);
    // ... more listeners
})();
```

**Source:** [Airbnb JS Style Guide - Modules](https://github.com/airbnb/javascript#modules) -- recommends modules; IIFE is the no-build equivalent.

### Pattern: CSS Class Extraction (remove inline styles)

**What:** Replace inline `style="display: none;"` attributes with CSS utility classes.

**When to use:** Any element with inline styles that control visibility or layout.

**Example:**
```css
/* In the Generic or Components layer */
.is-hidden {
    display: none;
}
```
```html
<button class="header__action-btn is-hidden" id="reloadFileBtn">
<input type="file" id="fileInput" class="is-hidden" accept=".md,.markdown,.txt">
```

## Airbnb Style Deviations (GOV-01)

### Critical: Global Scope Pollution (D-03)

**Location:** Line 365-596 (entire `<script>` block)

**What goes wrong:** All variables and functions are declared at script top-level, making them properties of `window`. This pollutes the global namespace and risks collisions with other scripts.

**Current state:**
```javascript
// Lines 367-388: Global declarations
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;
marked.setOptions({ ... });  // Top-level side effect
let currentFileHandle = null;
let currentFilePath = null;
let currentFileName = null;
const showError = (message) => { ... };
// ... all other functions and event listeners
```

**Fix:** Wrap entire script content (lines 366-595) in IIFE with `'use strict';` directive.

### Missing `'use strict';` Directive

**Location:** Line 366 (script opening)

**What:** The script does not use strict mode. Airbnb style guide requires strict mode.

**Fix:** Add `'use strict';` as first statement inside the IIFE.

### Top-Level Side Effect: `marked.setOptions()`

**Location:** Lines 371-382

**What:** `marked.setOptions()` is called at module top-level. While acceptable inside an IIFE, it is currently a global side-effect call.

**Fix:** Move inside IIFE body. No code change needed to the call itself.

### Trailing Commas in Multi-Line Object Literals

**Status:** MOSTLY COMPLIANT -- trailing commas are already present in many places:
- `marked.setOptions()` (line 382) -- has trailing comma
- `toLocaleDateString()` options (line 423) -- has trailing comma
- `toLocaleTimeString()` options (line 427) -- has trailing comma
- `showOpenFilePicker()` types array (lines 508-509) -- has trailing comma on inner object

**Gaps identified:**
1. **Lines 503-509** -- `showOpenFilePicker` config in `reloadFile()`: the `types` array's last object lacks trailing comma after closing `}` on line 509:
```javascript
types: [{
    description: 'Markdown 文件',
    accept: {
        'text/markdown': ['.md', '.markdown'],
        'text/plain': ['.txt'],
    },
}],  // <-- trailing comma present on outer array, but inner object at line 509 does
```
Actually, reviewing carefully: the `accept` object on lines 506-508 has trailing comma, and the `types` array has trailing comma. This is compliant.

**Verdict:** Trailing commas are already consistently applied throughout the codebase. No trailing comma additions needed.

### `var` Usage

**Status:** COMPLIANT. No `var` declarations found. All variables use `const` or `let`.

### Function Declarations vs Arrow Functions

**Status:** COMPLIANT. All functions use `const` arrow function expressions. No `function` keyword found.

### Template Literals vs String Concatenation

**Status:** COMPLIANT. All string interpolation uses template literals. No `+` concatenation for strings.

### `addEventListener` Usage

**Status:** COMPLIANT. All event binding uses `addEventListener`. No inline event attributes (`onclick`, `onchange`).

### Magic Numbers

**Status:** COMPLIANT. Byte-size constants (`BYTES_PER_KB`, `BYTES_PER_MB`) are extracted as named constants. No other magic numbers detected.

### `eval()` / `Function()` Constructor

**Status:** COMPLIANT. Neither found.

## Emoji Audit (D-02)

All emoji instances found in `index.html`:

| # | Line | Location | Emoji | Unicode | Replacement |
|---|------|----------|-------|---------|-------------|
| 1 | 339 | `<h1 class="header__title">` | 📝 | U+1F4DD (memo) | `[编辑]` or remove entirely |
| 2 | 343 | Reload button text | 🔄 | U+1F504 (arrows) | `重新加载` (text only) |
| 3 | 346 | Open file button text | 📁 | U+1F4C1 (folder) | `打开文件` (text only) |
| 4 | 357 | Empty state icon div | 📄 | U+1F4C4 (page) | Replace with CSS-based icon or plain text `文件` |
| 5 | 392 | `showError()` template literal | ❌ | U+274C (cross mark) | `错误：` (text only) |

**Recommended replacements:**
- Lines 339, 343, 346, 392: Remove emoji, keep Chinese text only
- Line 357: The emoji serves as a visual icon in the empty state. Options:
  - Option A (recommended): Replace with plain Chinese text `点击打开文件` in the `.empty-state__text`, remove `.empty-state__icon` div entirely
  - Option B: Use a CSS pseudo-element or SVG for visual distinction
  - Decision per D-02: remove all emoji. Option A aligns with "replace with plain Chinese text labels"

## Inline Style Audit

**Location:** 2 instances

| # | Line | Element | Inline Style | Fix |
|---|------|---------|-------------|-----|
| 1 | 342 | `<button id="reloadFileBtn">` | `style="display: none;"` | Add `.is-hidden { display: none; }` class, toggle via JS `classList` |
| 2 | 351 | `<input id="fileInput">` | `style="display: none;"` | Add `.is-hidden` class |

**Note:** Line 404 uses `reloadBtn.style.display = show ? 'block' : 'none';` in JS. After extracting inline styles to `.is-hidden` class, this must change to `reloadBtn.classList.toggle('is-hidden', !show)`.

## CSS Audit (GOV-02)

### ITCSS Layer Organization

**Status:** COMPLIANT. CSS is well-organized with clear layer comments:

| Layer | Lines | Content | Quality |
|-------|-------|---------|---------|
| Generic | 12-20 | Reset (`* { margin: 0; ... }`) | Good |
| Elements | 22-32 | `body` base styles | Good |
| Components | 34-332 | `.container`, `.header`, `.output-section`, `.markdown-content`, `.empty-state`, `.error-message`, `.file-info` | Good |

### BEM Naming

**Status:** MOSTLY COMPLIANT. All component classes follow BEM:

| Component | Block | Element | Modifier | Status |
|-----------|-------|---------|----------|--------|
| Header | `.header` | `.header__content`, `.header__title`, `.header__subtitle`, `.header__actions`, `.header__action-btn` | -- | Good |
| Output | -- | `.output-section`, `.output-header`, `.output-header__title` | -- | Good |
| Markdown | -- | `.markdown-content` | -- | Good (uses descendant selectors for marked.js output, which is acceptable per conventions) |
| Empty State | -- | `.empty-state`, `.empty-state__icon`, `.empty-state__text` | -- | Good |
| Error | -- | `.error-message` | -- | Good |
| File Info | -- | `.file-info` | -- | Good |

### Minor CSS Cleanup Items

1. **Missing `.is-hidden` utility class:** After extracting inline styles, this class must be added to the CSS (see Inline Style Audit above).

2. **`.empty-state__icon` class:** Currently styles a font-size 64px emoji display. After emoji removal, this class may become unused (if Option A from Emoji Audit is chosen). Consider removing or repurposing.

3. **Media queries:** All placed correctly after their respective component blocks (lines 100-110, 139-145). Compliant.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JS linting | Custom regex-based style checker | Manual verification or ESLint with airbnb config | Airbnb rules have 100+ edge cases |
| CSS linting | Custom style checker | Manual verification or stylelint | BEM/ITCSS validation is complex |
| Emoji removal | Regex-only approach | Manual line-by-line review | Emoji in Unicode can have variation selectors and combining characters; manual review ensures no misses |

**Key insight:** The codebase is small enough (~598 lines) that automated linting is unnecessary. Manual verification with a checklist is faster and equally reliable.

## Common Pitfalls

### Pitfall 1: IIFE Breaks DOMContentLoaded Timing

**What goes wrong:** If the IIFE wraps code that accesses DOM elements before they exist, `getElementById` returns `null`.

**Why it happens:** The `<script>` tag is currently at the end of `<body>` (line 365), which means DOM is already parsed. Wrapping in IIFE does not change this. However, if the script were moved to `<head>`, it would break.

**How to avoid:** Keep `<script>` at the end of `<body>` (current position). Verify all `getElementById`/`querySelector` calls return non-null after IIFE wrapping.

**Warning signs:** `TypeError: Cannot read properties of null` in browser console.

### Pitfall 2: Inline Style -> Class Toggle Breaks Existing Logic

**What goes wrong:** The current code uses `element.style.display = show ? 'block' : 'none'` (line 404). If inline styles are replaced with a CSS class but the JS is not updated to use `classList.toggle()`, the toggle will silently fail.

**Why it happens:** `element.style.display` only reads/writes inline styles, not computed styles from CSS classes.

**How to avoid:** When removing inline `style="display: none;"`, simultaneously update the JS toggle from `style.display` to `classList.toggle('is-hidden', !show)`.

### Pitfall 3: Emoji Removal Breaks Visual Hierarchy

**What goes wrong:** Removing emojis from buttons and the header reduces visual distinction between UI elements.

**Why it happens:** Emojis serve as informal icons. Removing them without replacement may make the UI feel sparse.

**How to avoid:** Ensure Chinese text labels are clear and the CSS styling (padding, font-weight, color) provides sufficient visual hierarchy. The current CSS already has good button styling (background, border, hover effects).

### Pitfall 4: IIFE and External Globals

**What goes wrong:** After IIFE wrapping, references to `marked` and `hljs` (loaded as `<script>` globals) must still work.

**Why it happens:** `marked` and `hljs` are set as properties on `window` by their respective scripts. Inside an IIFE, they are still accessible as closure variables (IIFE does not create a new scope for globals -- it only prevents its own variables from leaking out).

**How to avoid:** No special handling needed. `marked` and `hljs` remain accessible inside IIFE as they are `window` properties. Verify with browser console after change.

## Code Examples

### IIFE Wrapper with All Current Code

```javascript
<script>
    (function() {
        'use strict';

        // 文件大小单位常量
        const BYTES_PER_KB = 1024;
        const BYTES_PER_MB = 1024 * 1024;

        // 配置 marked (inside IIFE, not global side-effect)
        marked.setOptions({
            highlight: (code, lang) => {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {}
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true,
        });

        // 保存当前文件的句柄和路径信息
        let currentFileHandle = null;
        let currentFilePath = null;
        let currentFileName = null;

        // ... all existing functions (showError, clearError, etc.)
        // ... with emoji removed per D-02
        // ... with classList.toggle instead of style.display per inline style fix

        // 绑定事件监听器
        document.getElementById('reloadFileBtn').addEventListener('click', reloadFile);
        document.getElementById('openFileBtn').addEventListener('click', openFileWithAPI);
        document.getElementById('fileInput').addEventListener('change', handleFileSelect);
        document.querySelector('.empty-state').addEventListener('click', openFileWithAPI);
    })();
</script>
```

### CSS Utility Class for Hidden Elements

```css
/* ==========================================================================
   Components - Utility Classes
   ========================================================================== */

.is-hidden {
    display: none;
}
```

### JS Class Toggle (replacing inline style)

```javascript
// Before:
const toggleReloadButton = (show) => {
    const reloadBtn = document.getElementById('reloadFileBtn');
    if (reloadBtn) {
        reloadBtn.style.display = show ? 'block' : 'none';
    }
};

// After:
const toggleReloadButton = (show) => {
    const reloadBtn = document.getElementById('reloadFileBtn');
    if (reloadBtn) {
        reloadBtn.classList.toggle('is-hidden', !show);
    }
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Global-scope JS in `<script>` tags | IIFE or ES modules | ES6 era | Prevents namespace collisions |
| Inline `style` attributes | CSS classes with `classList` API | DOM4 era | Separation of concerns, easier testing |
| Emoji as icons | SVG or CSS-based icons or plain text | Accessibility movement | Better screen reader support |

**Deprecated/outdated:**
- `var` declarations: Replaced by `const`/`let` (ES6)
- String concatenation with `+`: Replaced by template literals (ES6)
- `function` declarations for simple functions: Replaced by arrow functions in most cases (ES6)
- Inline event attributes (`onclick`): Replaced by `addEventListener` (DOM2)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Trailing commas are already consistently applied throughout the codebase | "Trailing Commas" | LOW -- manual verification found them in all multi-line objects |
| A2 | `.empty-state__icon` can be removed entirely after emoji replacement | "Emoji Audit" | LOW -- planner can decide to keep with alternative content |
| A3 | `marked` and `hljs` remain accessible inside IIFE as `window` properties | "Pitfall 4" | NONE -- this is how JavaScript scope works, verifiable |

## Open Questions

1. **Should JSDoc comments be added to functions?**
   - What we know: No JSDoc comments currently exist. CONTEXT.md marks this as Claude's discretion.
   - What's unclear: Whether the planner considers JSDoc valuable for this small codebase.
   - Recommendation: Skip JSDoc for this phase. Code is small (~10 functions) and self-documenting. Can be added later if needed.

2. **Should the `is-hidden` class be used, or should inline styles be kept?**
   - What we know: Inline `style="display: none;"` violates separation of concerns. Airbnb style does not explicitly forbid inline styles, but the project conventions (03-conventions.md) place all CSS in the `<style>` tag.
   - What's unclear: Whether 2 inline styles are considered a significant deviation.
   - Recommendation: Extract to `.is-hidden` class. It is a 2-line change and improves consistency.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Browser (Chrome/Safari/Firefox/Edge) | Runtime execution | Yes (macOS) | Latest | -- |
| Node.js / npm | Linting (optional) | Unknown | -- | Manual verification |
| ESLint | JS style verification | Not installed | -- | Manual checklist verification |
| HTTP server (port 8888) | Browser testing | Per PROJECT.md | -- | Open index.html directly |

**Note:** No new dependencies are introduced. This phase is a pure code refactor.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual browser testing (no automation) |
| Config file | none |
| Quick run command | Open `http://localhost:8888/mder/` in browser |
| Full suite command | Test all v1 requirements manually (FILE-01 through NFR-03) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GOV-01 | JS follows Airbnb style | Manual code review | N/A | N/A |
| GOV-02 | CSS follows ITCSS/BEM | Manual code review | N/A | N/A |
| FILE-01 | Open file via File System Access API | Manual | Browser test | Existing |
| FILE-02 | Fallback to file input | Manual | Browser test (disable API) | Existing |
| FILE-03 | File type filter | Manual | Browser test | Existing |
| FILE-04 | File handle persistence | Manual | Browser test | Existing |
| FILE-05 | Click empty state to open | Manual | Browser test | Existing |
| REND-01 | Markdown rendering | Manual | Browser test | Existing |
| REND-03 | Code syntax highlighting | Manual | Browser test | Existing |
| UX-03 | Reload current file | Manual | Browser test | Existing |
| UX-04 | Responsive layout | Manual | Browser resize test | Existing |

### Sampling Rate
- **Per edit batch:** Manual browser check -- open file, verify rendering
- **Phase gate:** All 21 v1 requirements must pass manual testing before phase is considered complete

### Wave 0 Gaps
- [ ] No automated test infrastructure exists -- per PROJECT.md, all verification is manual
- [ ] No ESLint or stylelint config -- style verification is manual checklist

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Not applicable |
| V3 Session Management | No | Not applicable |
| V4 Access Control | No | Not applicable |
| V5 Input Validation | Yes | marked.js built-in sanitization, file type filter |
| V6 Cryptography | No | Not applicable |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via Markdown content | Tampering | marked.js handles HTML escaping; no `eval()` used |
| File system access | Information disclosure | Only user-selected files are read; no automatic file access |
| Global scope pollution (pre-IIFE) | Elevation of privilege | IIFE wrapping (D-03) mitigates this |

## Sources

### Primary (HIGH confidence)
- `.harness/knowledge/03-conventions.md` -- Authoritative coding conventions (read in full)
- `.harness/knowledge/02-architecture.md` -- Architecture layers (read in full)
- `index.html` (lines 1-598) -- Complete codebase audit (read in full)
- `lib/marked.min.js` -- Version 12.0.0 confirmed via header comment
- `lib/highlight.min.js` -- Version 11.9.0 confirmed via `t.versionString`

### Secondary (MEDIUM confidence)
- Airbnb JavaScript Style Guide (GitHub) -- [airbnb/javascript](https://github.com/airbnb/javascript) -- JS style rules referenced
- ITCSS methodology -- [ITCSS introduction](https://www.creativebloq.com/web-design/manage-large-css-projects-itcss-10151752) -- CSS architecture reference
- BEM methodology -- [getbem.com](http://getbem.com/) -- CSS naming reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- verified via file header comments
- Architecture: HIGH -- verified via full codebase read
- Pitfalls: HIGH -- based on standard JS/CSS patterns, verified against codebase
- Trailing comma audit: HIGH -- manually verified every multi-line object/array

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (stable codebase, no fast-moving dependencies)
