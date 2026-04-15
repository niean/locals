# ROADMAP: mder

**Version:** v2
**Date:** 2026-04-15
**Phases:** 2 (plus Phase 0 baseline)
**Granularity:** coarse

## Phases

- [ ] **Phase 1: Code Governance** - Refactor JS/CSS to follow Airbnb style + ITCSS/BEM conventions
- [ ] **Phase 2: Render Enhancement** - Improve markdown rendering quality and layout experience

## Phase Details

### Phase 0: Baseline (Existing)
**Goal:** Markdown file open, render, info display
**Status:** COMPLETE
**Requirements:** FILE-01 through NFR-03 (21 requirements)
**Success Criteria:** All 21 validated requirements complete

### Phase 1: Code Governance
**Goal:** Refactor code to follow Airbnb JS style + ITCSS/BEM CSS conventions
**Depends on:** Phase 0 (existing codebase)
**Requirements:** GOV-01, GOV-02
**Success Criteria** (what must be TRUE):
  1. All JavaScript functions follow Airbnb style guide conventions (const/arrow functions, template literals, trailing commas, consistent indentation)
  2. All CSS class names use BEM naming convention (.block__element--modifier) and are organized by ITCSS layers (Generic/Elements/Components)
  3. All existing functionality preserved - can open file, render markdown, view metadata, reload, responsive layout works
**Plans:** 1 plan

Plans:
- [ ] 01-01-PLAN.md — Refactor JS (IIFE, emoji removal) and CSS (.is-hidden extraction)

### Phase 2: Render Enhancement
**Goal:** Improve markdown rendering quality and layout experience
**Depends on:** Phase 1 (clean codebase)
**Requirements:** ENH-01
**Success Criteria** (what must be TRUE):
  1. Rendered markdown layout visually matches GitHub reading experience (spacing, typography, code blocks, tables)
  2. Edge cases handled gracefully - long code lines scroll horizontally, large tables overflow correctly, nested lists render properly
  3. No visual regressions in existing rendered output (headers, paragraphs, lists, links, images, blockquotes, dividers still render correctly)
**Plans:** TBD
**UI hint:** yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Baseline | - | Complete | FILE-01..NFR-03 (21 reqs) |
| 1. Code Governance | 0/1 | Planned | - |
| 2. Render Enhancement | 0/TBD | Not started | - |

---

*Roadmap defined: 2026-04-15*
*Last updated: 2026-04-15 after plan creation*
