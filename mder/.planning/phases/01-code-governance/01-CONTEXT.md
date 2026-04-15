# Phase 1: Code Governance - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor JavaScript and CSS in `index.html` to follow Airbnb JavaScript Style Guide and ITCSS/BEM CSS conventions. All existing functionality must be preserved — file open, markdown render, metadata display, reload, responsive layout. No new features. No architecture changes (single-file constraint remains).

</domain>

<decisions>
## Implementation Decisions

### Refactoring Approach
- **D-01:** 一次性全部改完 — all style changes in a single batch. Codebase is small (598 lines), risk is low. Single atomic commit.

### Emoji Handling
- **D-02:** 全部移除emoji — remove all emoji characters from HTML and JS (📝, 📁, 🔄, 📄, ❌). Replace with plain text or SVG icons if visual distinction is needed.

### JavaScript Module Structure
- **D-03:** 加IIFE包裹 — wrap all JavaScript code in an Immediately Invoked Function Expression `(function() { ... })()` to avoid global scope pollution. Functions remain accessible within the closure. Event listeners bound inside the IIFE. State variables (`currentFileHandle`, etc.) become module-level inside the closure, not window globals.

### Code Context Notes
- CSS is already largely ITCSS/BEM compliant — layer organization and BEM naming are good. Minor cleanup may be needed.
- JS mostly follows Airbnb style (const/arrow functions, template literals) but has gaps: missing trailing commas, `marked.setOptions()` as top-level side-effect call, inline `style` attributes on buttons.
- All refactoring must not change any user-visible behavior.

### Claude's Discretion
- Exact trailing comma placement within Airbnb rules
- Whether to add JSDoc comments (none currently exist)
- Media query organization (already placed correctly per component)

</decisions>

<canonical_refs>
## Canonical References

### Coding conventions
- `.harness/knowledge/03-conventions.md` — Authoritative coding conventions (Airbnb JS style, ITCSS/BEM CSS, function naming, error handling patterns)
- `.harness/knowledge/02-architecture.md` — Architecture layers, data flow, entry points

### Project constraints
- `.harness/PROJECT.md` — Project norms, architecture boundary (single-file)
- `.planning/ROADMAP.md` — Phase 1 success criteria (3 items: JS style, CSS conventions, functionality preserved)

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `showError()` / `clearError()` helpers — clean, follow conventions, keep as-is
- `formatBytes()` / `formatDate()` — already follow Airbnb style
- `renderMarkdown()` — already uses const/arrow + template literals

### Established Patterns
- ITCSS layer separation in CSS — already done well with comment dividers
- BEM class naming (`.header__title`, `.header__action-btn`) — already compliant
- Event binding via `addEventListener` — already correct
- Constants in UPPER_SNAKE_CASE (`BYTES_PER_KB`, `BYTES_PER_MB`) — already correct

### Integration Points
- `marked.setOptions()` — top-level side effect, will be moved inside IIFE
- `document.getElementById()` selectors — will remain unchanged, IIFE scope handles visibility
- External globals: `marked`, `hljs` — loaded as globals from `lib/`, IIFE will reference them as closure variables

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for emoji replacement (plain Chinese text labels).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-code-governance*
*Context gathered: 2026-04-15*
