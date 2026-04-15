---
phase: 01-code-governance
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - index.html
autonomous: true
requirements:
  - GOV-01
  - GOV-02

must_haves:
  truths:
    - "All JavaScript code is wrapped in IIFE — no global-scope variables"
    - "No emoji characters remain in HTML or JavaScript source"
    - "No inline style attributes on HTML elements"
    - "All existing functionality works: open file, render markdown, metadata display, reload, responsive"
  artifacts:
    - path: "index.html"
      provides: "Single-file application — all HTML/CSS/JS"
      contains: "(function() { 'use strict';"
      min_lines: 590
  key_links:
    - from: "<script> block"
      to: "marked, hljs globals"
      via: "closure references to window globals"
      pattern: "marked\\.(setOptions|parse)"
    - from: "toggleReloadButton()"
      to: ".is-hidden CSS class"
      via: "classList.toggle replacing style.display"
      pattern: "classList\\.toggle\\('is-hidden'"
---

<objective>
Refactor index.html to follow Airbnb JavaScript Style Guide and ITCSS/BEM CSS conventions.

Purpose: Address GOV-01 (JS style) and GOV-02 (CSS architecture) — the only pending v2 requirements. All existing functionality must be preserved (FILE-01 through NFR-03, 21 v1 requirements).

Output: Single index.html with IIFE-wrapped JS, emoji-free HTML/JS, inline styles extracted to CSS classes.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.harness/PROJECT.md
@.harness/knowledge/03-conventions.md
@.harness/knowledge/02-architecture.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-code-governance/01-CONTEXT.md
@.planning/phases/01-code-governance/01-RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add .is-hidden CSS class and extract inline styles (D-02, GOV-02)</name>
  <files>index.html</files>
  <read_first>
    - index.html (lines 1-598, full file — current state of CSS, HTML inline styles, JS toggle logic)
    - .harness/knowledge/03-conventions.md (CSS architecture rules: ITCSS layers, BEM naming)
  </read_first>
  <action>
    Step 1 — Add .is-hidden utility class to CSS:
    Insert a new CSS block after line 332 (after the .file-info block, before the closing `</style>` on line 333):

    ```css
    /* ==========================================================================
       Components - Utility
       ========================================================================== */

    .is-hidden {
        display: none;
    }
    ```

    Step 2 — Remove inline style="display: none;" from HTML elements and add .is-hidden class:
    - Line 342: Change `<button class="header__action-btn" id="reloadFileBtn" style="display: none;">` to `<button class="header__action-btn is-hidden" id="reloadFileBtn">`
    - Line 351: Change `<input type="file" id="fileInput" accept=".md,.markdown,.txt" style="display: none;">` to `<input type="file" id="fileInput" class="is-hidden" accept=".md,.markdown,.txt">`

    Step 3 — Update JS toggle logic from style.display to classList.toggle:
    - Line 404: Change `reloadBtn.style.display = show ? 'block' : 'none';` to `reloadBtn.classList.toggle('is-hidden', !show);`

    Step 4 — Do NOT remove .empty-state__icon class yet (kept for CSS consistency, text content inside will change in Task 3).
  </action>
  <verify>
    <automated>grep -c '\.is-hidden' index.html | grep -q '[2-9]' && grep -c 'style="display: none;"' index.html | grep -q '^0$'</automated>
  </verify>
  <done>
    - .is-hidden CSS class exists in index.html with display: none rule
    - Zero inline style="display: none;" attributes remain in index.html
    - reloadFileBtn has class="header__action-btn is-hidden" in HTML
    - fileInput has class="is-hidden" in HTML (replaces inline style)
    - toggleReloadButton() uses classList.toggle('is-hidden', !show) instead of style.display
  </done>
</task>

<task type="auto">
  <name>Task 2: Wrap all JavaScript in IIFE with 'use strict' (D-03, GOV-01)</name>
  <files>index.html</files>
  <read_first>
    - index.html (full file — Task 1 modified version, specifically script block lines 365-596)
    - .harness/knowledge/03-conventions.md (JS style rules: const/arrow, template literals, trailing commas)
    - .planning/phases/01-code-governance/01-RESEARCH.md (IIFE wrapper example pattern)
  </read_first>
  <action>
    Wrap the entire content of the `<script>` block in an IIFE:

    Step 1 — Replace the opening `<script>` on line 365 and first line of JS content:
    - Replace `<script>` followed by line 366 comment with:

    ```javascript
    <script>
        (function() {
            'use strict';

            // 文件大小单位常量
    ```

    Step 2 — Add closing IIFE at the very end of the script, before `</script>`:
    - After the last event listener binding (line 595: `document.querySelector('.empty-state').addEventListener('click', openFileWithAPI);`), add two lines:

    ```javascript
        })();
    </script>
    ```

    Step 3 — Move the `marked.setOptions()` call (currently lines 371-382) to be the second statement inside the IIFE, right after the constants:
    - The order inside IIFE should be:
      1. `'use strict';`
      2. Constants (BYTES_PER_KB, BYTES_PER_MB)
      3. `marked.setOptions({ ... })` — already correct as-is inside the IIFE
      4. State variables (currentFileHandle, etc.)
      5. All function definitions
      6. Event listener bindings
      7. `})();` closing

    Step 4 — Verify all references to `marked` and `hljs` still work inside the IIFE (they are window properties, accessible as closure variables — no code changes needed for these).

    Step 5 — Verify all `document.getElementById()` and `document.querySelector()` calls return valid elements. The script tag remains at the end of `<body>` (line 365 position), so DOM is fully parsed before execution.

    Note: Tasks 1 and 2 operate on the same file but Task 2 must happen after Task 1 because Task 1 modifies JS code that Task 2 wraps.
  </action>
  <verify>
    <automated>grep -qP '\(function\(\)' index.html && grep -q "'use strict'" index.html && grep -qP '\}\)\(\);' index.html</automated>
  </verify>
  <done>
    - All JS is wrapped in `(function() { ... })()`
    - `'use strict';` is the first statement inside the IIFE
    - `marked.setOptions()` is inside the IIFE, not a global side-effect
    - All constants (BYTES_PER_KB, BYTES_PER_MB) are inside the IIFE scope
    - All state variables (currentFileHandle, currentFilePath, currentFileName) are inside the IIFE scope
    - All functions are inside the IIFE
    - All event listener bindings are inside the IIFE
    - No JS variables leak to window global scope
    - `marked` and `hljs` references still work (window globals accessible from closure)
  </done>
</task>

<task type="auto">
  <name>Task 3: Remove all emoji characters and replace with plain Chinese text (D-02, GOV-01)</name>
  <files>index.html</files>
  <read_first>
    - index.html (full file — Tasks 1+2 modified version, specifically HTML lines 339, 343, 346, 357 and JS line 392)
    - .planning/phases/01-code-governance/01-RESEARCH.md (emoji audit table with exact line numbers and replacements)
  </read_first>
  <action>
    Remove all 5 emoji instances, replacing with plain Chinese text:

    1. Line 339 (header title): Change `<h1 class="header__title">📝 MD文件渲染工具</h1>` to `<h1 class="header__title">MD文件渲染工具</h1>` (remove 📝 U+1F4DD)

    2. Line 343 (reload button text): Change `🔄 重新加载` to `重新加载` (remove 🔄 U+1F504)

    3. Line 346 (open file button text): Change `📁 打开文件` to `打开文件` (remove 📁 U+1F4C1)

    4. Line 357-358 (empty state icon + text): Replace the entire empty-state block:
       From:
       ```html
       <div class="empty-state">
           <div class="empty-state__icon">📄</div>
           <div class="empty-state__text">请点击右上角的"打开文件"按钮选择 Markdown 文件</div>
       </div>
       ```
       To:
       ```html
       <div class="empty-state">
           <div class="empty-state__text">点击此处或右上角的"打开文件"按钮选择 Markdown 文件</div>
       </div>
       ```
       (Remove 📄 U+1F4C4 and the `.empty-state__icon` div entirely; update text to indicate both click areas work)

    5. Line 392 (showError template literal): Change `<div class="error-message">❌ ${message}</div>` to `<div class="error-message">错误：${message}</div>` (remove ❌ U+274C, replace with plain Chinese text "错误：" prefix to maintain visual error distinction)
  </action>
  <verify>
    <automated>! grep -qP '[\x{1F4DD}\x{1F504}\x{1F4C1}\x{1F4C4}\x{274C}]' index.html</automated>
  </verify>
  <done>
    - No emoji characters (U+1F4DD, U+1F504, U+1F4C1, U+1F4C4, U+274C) in index.html
    - Header title is "MD文件渲染工具" (no emoji)
    - Reload button text is "重新加载" (no emoji)
    - Open file button text is "打开文件" (no emoji)
    - Empty state has no icon div, text reads "点击此处或右上角的'打开文件'按钮选择 Markdown 文件"
    - Error messages render as `错误：${message}` (Chinese "错误：" prefix replaces ❌)
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| User file → DOM | User-selected file content rendered via innerHTML after marked.js parsing |
| External lib → App | marked.js and hljs loaded as global scripts from lib/ directory |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-01 | Tampering | marked.parse() output → innerHTML | mitigate | marked.js built-in sanitization handles HTML escaping; IIFE wrapping (D-03) prevents global scope injection vectors |
| T-01-02 | Information disclosure | File System Access API usage | mitigate | File access only via user-initiated action (button click); file type filter restricts to .md/.markdown/.txt; no automatic file scanning |
| T-01-03 | Elevation of privilege | Global scope pollution (pre-IIFE) | mitigate | IIFE wrapping (D-03) + 'use strict' eliminates global variable leakage; no external script can access closure-scoped variables |
| T-01-04 | Tampering | lib/ directory third-party scripts | accept | Files served locally, not from CDN; lib/ contains only marked.min.js, highlight.min.js, github.min.css — controlled by repo |
</threat_model>

<verification>
## Pre-Execution Checklist

- [ ] index.html backed up or in git working tree before changes
- [ ] HTTP server running on port 8888 (per PROJECT.md)

## Post-Execution Verification (Manual Browser Testing)

Execute all 21 v1 requirement checks in browser at http://localhost:8888/mder/:

1. FILE-01: Open a .md file via File System Access API — renders correctly
2. FILE-02: In browser that doesn't support API (or force fallback) — file input works
3. FILE-03: File picker only shows .md/.markdown/.txt files
4. FILE-04: Open file, then reload — content refreshes
5. FILE-05: Click empty state area — file picker opens
6. REND-01: Markdown renders as HTML
7. REND-02: GFM features (tables, task lists) render
8. REND-03: Code blocks show syntax highlighting
9. REND-04: Headers, paragraphs, lists, tables, code, blockquotes, links, images, hr all render
10. REND-05: GitHub-style layout (spacing, typography)
11. INFO-01: File path displayed after render
12. INFO-02: Line count displayed
13. INFO-03: File size displayed
14. INFO-04: Last modified time displayed
15. UX-01: Empty state shows prompt text
16. UX-02: Empty state click opens file picker
17. UX-03: Reload button works (appears after file open)
18. UX-04: Resize browser to <768px — layout adapts responsively
19. NFR-01: No backend needed, pure frontend
20. NFR-02: Single HTML file + lib/ directory
21. NFR-03: Accessible at http://localhost:8888/mder/

## Code Style Verification (Manual Checklist — no ESLint installed)

- [ ] No var declarations (use grep `var ` in script block)
- [ ] All functions use const arrow syntax (grep `const.*=.*=>`)
- [ ] Template literals used for string interpolation (grep backticks)
- [ ] Trailing commas on multi-line objects/arrays
- [ ] No eval() or Function() constructor
- [ ] No inline event attributes (onclick/onchange)
- [ ] All event binding via addEventListener
- [ ] Magic numbers extracted as named constants
- [ ] 'use strict' present inside IIFE
- [ ] IIFE wraps all script content
- [ ] No inline style attributes in HTML
- [ ] .is-hidden CSS class present
- [ ] No emoji characters in source
- [ ] CSS organized by ITCSS layers (Generic → Elements → Components)
- [ ] BEM class naming (.block__element--modifier)
</verification>

<success_criteria>
1. index.html contains IIFE wrapper with 'use strict' — verified by `(function() {` and `'use strict'` present in script block
2. Zero emoji characters remain — verified by emoji grep returning no matches
3. Zero inline style="display: none;" attributes — verified by grep returning 0
4. .is-hidden CSS class exists with `display: none` rule
5. All 21 v1 requirements pass manual browser verification (no functional regressions)
6. CSS still organized by ITCSS layers with BEM naming (visual inspection of `<style>` block)
</success_criteria>

<output>
After completion, create `.planning/phases/01-code-governance/01-01-SUMMARY.md` with:
- Phase goal achievement status
- Tasks completed (or partial)
- Files changed with diff summary
- Browser verification results (all 21 v1 requirements pass/fail)
- Any new technical debt introduced
- Confirmation that no functionality regressed
</output>
