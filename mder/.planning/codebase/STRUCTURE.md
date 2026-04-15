# Codebase Structure

**Analysis Date:** 2026-04-15

## Directory Layout

```
mder/
├── index.html              # Main application (all HTML/CSS/JS inlined)
├── lib/                    # Third-party library dependencies
│   ├── marked.min.js       # Marked.js markdown parser (34.3KB)
│   ├── highlight.min.js    # Highlight.js syntax highlighter (118.9KB)
│   └── github.min.css      # GitHub-style code highlighting (1.3KB)
├── .harness/               # Harness AI framework (project configuration)
│   ├── PROJECT.md          # Project-level framework adapter
│   ├── knowledge/          # AI knowledge base
│   ├── prd/                # Product requirements documents
│   ├── lessons/            # Project-specific lessons learned
│   ├── specs/              # Design documents (active/completed)
│   └── plans/              # Implementation plans (active/completed)
├── .claude/                # Claude Code slash commands
│   └── commands/           # Harness workflow trigger commands
├── .planning/              # Codebase analysis output (generated)
│   └── codebase/           # Architecture and structure docs
├── locals/                 # Local sensitive config (gitignored)
├── AGENTS.md               # AI agent entry point (routing only)
├── CLAUDE.md               # Claude Code project instructions
└── .gitignore              # Git ignore rules
```

## Directory Purposes

**Root (/):**
- Purpose: Single-file application entry point
- Contains: `index.html` (only application file), AI entry points, configuration
- Key files: `index.html` -- complete application in one file (598 lines)

**lib/:**
- Purpose: Third-party library dependencies (read-only, not modified by project code)
- Contains: Minified JavaScript and CSS files loaded via `<script>` / `<link>` tags
- Key files: `marked.min.js` (markdown parser), `highlight.min.js` (code highlighter), `github.min.css` (GitHub theme for code blocks)
- Convention: Only minified/compressed versions; no source maps or unminified variants

**.harness/:**
- Purpose: Harness AI framework configuration and knowledge base
- Contains: Project specs, AI knowledge, product documents, execution plans
- Not maintained by developers; maintained by AI agents during development sessions
- Subdirectories:
  - `knowledge/` -- AI knowledge base (01-overview, 02-architecture, 03-conventions, 04-data-boundaries, 05-key-patterns, 21-glossary, 22-file-map)
  - `prd/` -- Product requirement documents (01-prd-sense, 02-prd-baseline, 03-prd-specs)
  - `lessons/` -- Project-specific lessons learned (`project.md`)
  - `specs/active/` and `specs/completed/` -- Design documents lifecycle
  - `plans/active/` and `plans/completed/` -- Implementation plans lifecycle
  - `plans/debt-tracker.md` -- Technical debt tracking

**.harness/framework/:**
- Purpose: Reusable Harness framework capabilities (project-independent)
- Contains: Agent templates, workflow definitions, skill definitions, guides
- Subdirectories:
  - `agents/` -- Agent role templates (Orchestrator, Designer, Planner, Coder, Reviewer)
  - `workflows/` -- End-to-end workflow definitions (iterate-feature, fix-bug, iterate-docs)
  - `workflows/harness-ops/` -- Harness operations workflows
  - `skills/harness/` -- Core skill definitions
  - `skills/harness-ops/` -- Operations skill definitions
  - `skills/superpowers/` -- Platform methodology skills (brainstorming, writing-plans, systematic-debugging, etc.)
  - `guides/` -- Methodology reference documents
  - `lessons/general.md` -- Cross-project general lessons

**.claude/commands/:**
- Purpose: Claude Code slash command definitions
- Contains: Harness workflow trigger commands
- Key files:
  - `harness:iterate-feature.md` -- Trigger feature iteration workflow
  - `harness:fix-bug.md` -- Trigger bug fix workflow
  - `harness:iterate-docs.md` -- Trigger documentation iteration workflow
  - `harness:refine-feature.md` -- Trigger feature refinement workflow

**.planning/:**
- Purpose: Generated codebase analysis documents
- Contains: `codebase/ARCHITECTURE.md`, `codebase/STRUCTURE.md`, etc.
- Created by GSD map-codebase agent; consumed by planning and execution agents

**locals/:**
- Purpose: Local sensitive configuration (gitignored)
- Contains: Environment-specific or personal configuration
- Convention: Never committed; excluded via `.gitignore`

## Key File Locations

**Application Entry:**
- `index.html`: Complete single-file application (HTML + CSS + JS), 598 lines

**Configuration:**
- `AGENTS.md`: AI routing entry point, delegates to `.harness/PROJECT.md`
- `CLAUDE.md`: Claude Code project instructions, references `AGENTS.md`
- `.harness/PROJECT.md`: Project-level framework adapter (specs, knowledge paths, build commands)
- `.gitignore`: Excludes `locals/`, `.env`, editor files, OS artifacts

**Core Logic:**
- `index.html` lines 365-596 (`<script>` block): All JavaScript logic including marked config, file I/O, rendering pipeline, event binding
- `index.html` lines 11-333 (`<style>` block): All CSS, organized by ITCSS layers

**Dependencies:**
- `lib/marked.min.js`: Markdown parser (loaded as global `marked`)
- `lib/highlight.min.js`: Code syntax highlighter (loaded as global `hljs`)
- `lib/github.min.css`: GitHub-style code highlighting theme

**Knowledge Base:**
- `.harness/knowledge/01-overview.md`: Project overview (tech stack, entry points, core flows)
- `.harness/knowledge/02-architecture.md`: Architecture and module boundaries
- `.harness/knowledge/03-conventions.md`: Coding conventions (authoritative definition)
- `.harness/knowledge/04-data-boundaries.md`: Data structures and storage formats
- `.harness/knowledge/05-key-patterns.md`: Cross-module collaboration patterns
- `.harness/knowledge/21-glossary.md`: Terminology reference
- `.harness/knowledge/22-file-map.md`: File-to-functionality mapping

**Product Documents:**
- `.harness/prd/01-prd-sense.md`: Product positioning and decision criteria
- `.harness/prd/02-prd-baseline.md`: Product requirements baseline
- `.harness/prd/03-prd-specs.md`: Detailed specifications

## Naming Conventions

**Files:**
- kebab-case for all project files (e.g., `github.min.css`, `01-overview.md`)
- Numbered prefix for knowledge/prd files (e.g., `01-overview.md`, `02-architecture.md`)
- Layer 0 (cognitive) files: `01`-`05` prefix
- Layer 2 (tool index) files: `21`-`22` prefix

**CSS Classes:**
- BEM naming: `.block__element--modifier` (e.g., `.header__content`, `.header__action-btn`, `.empty-state__icon`)

**JavaScript:**
- camelCase for functions (e.g., `renderMarkdown`, `readFile`, `openFileWithAPI`)
- CONSTANT_CASE for constants (e.g., `BYTES_PER_KB`, `BYTES_PER_MB`)
- Descriptive verb-noun ordering for function names

**Directories:**
- lowercase with hyphens (e.g., `harness-ops`, `file-map` not used but convention established)

## Where to Add New Code

**New Feature (UI component or behavior):**
- HTML structure: `index.html` within existing `.container` layout
- CSS styles: `index.html` `<style>` block, in appropriate ITCSS section (Generic/Elements/Components)
- JavaScript logic: `index.html` `<script>` block, as global-scope function with event listener binding
- No new files should be created for application logic; single-file constraint is a hard architectural boundary

**New Third-Party Library:**
- Minified file: `lib/<library>.min.js` (or `.min.css`)
- Load via `<script src="lib/...">` or `<link href="lib/...">` in `index.html` `<head>`

**New Knowledge Entry:**
- Architecture changes: `.harness/knowledge/02-architecture.md`
- New terminology: `.harness/knowledge/21-glossary.md`
- New source files: `.harness/knowledge/22-file-map.md` (unlikely given single-file constraint)
- New conventions: `.harness/knowledge/03-conventions.md`

**New Product Document:**
- Specs: `.harness/specs/active/spec-{YYMMDD}-{desc}.md`
- Plans: `.harness/plans/active/plan-{YYMMDD}-{desc}.md`

## Special Directories

**.harness/specs/ and .harness/plans/:**
- Purpose: Ephemeral design documents and implementation plans
- Lifecycle: Created in `active/`, moved to `completed/` after implementation
- Naming: Date-prefixed for sorting and matching to tasks
- `.gitignore` in each directory excludes specific file patterns
- `.gitkeep` files maintain empty directory structure in git

**.harness/prd/:**
- Purpose: Product requirement documents (AI read-only)
- Contains: `01-prd-sense.md` (product sense), `02-prd-baseline.md` (baseline requirements), `03-prd-specs.md` (detailed specs)
- AI is prohibited from modifying these; changes require human confirmation

**locals/:**
- Purpose: Local sensitive configuration (gitignored)
- AI may create temporary scripts in `locals/harness_tmp/` for multi-step commands
- Automatically created and cleaned up by AI as needed

---

*Structure analysis: 2026-04-15*
