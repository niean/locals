# Technology Stack

**Analysis Date:** 2026-04-15

## Languages

**Primary:**
- HTML5 - Document structure in `index.html` (single-file architecture)
- CSS3 - Styling in `<style>` block within `index.html`, ITCSS + BEM architecture
- JavaScript ES6+ - Application logic in `<script>` block within `index.html` (arrow functions, const/let, async/await, template literals, modules via global script imports)

**Secondary:**
- SVG - Inline SVG used for favicon in `<link rel="icon">` data URI

## Runtime

**Environment:**
- Modern Web Browser (Chrome, Safari, Firefox, Edge latest) - No server-side runtime required

**Package Manager:**
- None - All dependencies managed manually as minified files in `lib/` directory
- No lockfile present
- No `package.json`, no build toolchain, no npm/yarn/pnpm

## Frameworks

**Core:**
- None - Pure vanilla JavaScript, no frontend framework (no React, Vue, Angular, etc.)

**Markdown Parsing:**
- Marked.js v12.0.0 (`lib/marked.min.js`) - Markdown-to-HTML conversion with GFM support

**Syntax Highlighting:**
- Highlight.js v11.9.0 (`lib/highlight.min.js`) - Code block syntax highlighting
- GitHub theme (`lib/github.min.css`) - Light theme styling matching github.com

**Testing:**
- None - No automated test framework; manual browser-based testing only

**Build/Dev:**
- None - No bundler, no transpiler, no linter configuration files
- Served via static HTTP server (localhost:8888/mder/)

## Key Dependencies

**Critical:**
- `lib/marked.min.js` - v12.0.0, MIT License. Configured via `marked.setOptions()` with `gfm: true`, `breaks: true`, and custom `highlight` callback delegating to highlight.js
- `lib/highlight.min.js` - v11.9.0, BSD-3-Clause License. Provides `hljs.highlight()` and `hljs.highlightAuto()` for syntax highlighting
- `lib/github.min.css` - Highlight.js GitHub theme stylesheet, provides `.hljs` class styles matching GitHub's light theme

**Infrastructure:**
- File System Access API (`window.showOpenFilePicker`) - Modern browser API for file selection with persistent handles
- FileReader API - Fallback file reading for browsers without File System Access support

## Configuration

**Environment:**
- No environment variables or `.env` files
- Configuration is embedded directly in `index.html`
- Key configs:
  - `marked.setOptions()` at line 371-382 of `index.html`: enables GFM mode, line breaks, custom highlight callback
  - Color scheme hardcoded in CSS: `#667eea` to `#764ba2` gradient
  - Accepted file types: `.md`, `.markdown`, `.txt` (defined in `accept` attribute and File System Access picker types)

**Build:**
- No build configuration files
- `index.html` is the sole deliverable, served as static content
- `lib/` directory contains third-party minified assets

## Platform Requirements

**Development:**
- Any modern browser with ES6+ support
- Static HTTP server for serving (required for File System Access API; `file://` protocol may not support all features)
- UTF-8 encoding for all files

**Production:**
- Static file hosting (any HTTP server capable of serving HTML/JS/CSS)
- No server-side processing required
- Browser must support File System Access API for full functionality (Chrome/Edge recommended); Safari/Firefox fall back to traditional `<input type="file">`
- No deployment target specified (local development tool)

## Code Quality Standards

**Linting/Formatting:**
- No automated linting or formatting tools configured
- Manual adherence to Airbnb JavaScript Style Guide
- No `.eslintrc`, `.prettierrc`, `biome.json`, or similar config files

**Style Guidelines (from `.harness/knowledge/03-conventions.md`):**
- JavaScript: Airbnb Style Guide - `const` + arrow functions, template literals, trailing commas, `addEventListener` (no inline event attributes), named constants for magic numbers
- CSS: ITCSS architecture (Generic -> Elements -> Components) with BEM naming (`.block__element--modifier`), `@media` queries co-located with their components
- All custom code inline in single `index.html` file
- Third-party libraries via `<script>`/`<link>` tags from `lib/`

**Quality Guardrails:**
- Zero errors/warnings in browser console
- Error handling with user-friendly messages via `showError()` function
- Graceful degradation: File System Access API -> traditional file input
- Silent handling for user-cancelled operations (`AbortError`)

---

*Stack analysis: 2026-04-15*
