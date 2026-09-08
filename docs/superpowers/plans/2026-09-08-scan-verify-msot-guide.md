# Scan & Verify MSOT Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing Overtime Equalization article with the supplied interactive Scan & Verify MSOT guide, without changing the other FDNY MX Tracker pages.

**Architecture:** Keep `guides.ts` as route metadata and introduce `OvertimeEqualizationGuide` as a focused React page component rendered only for the `overtime-equalization` slug. Its guide-local state owns the alert simulator, FAQ, image dialog, active step, and resilient checklist persistence. Styles are rooted under `.msot-guide` so the generic guide renderer stays unchanged.

**Tech Stack:** React 19, TypeScript, React Router 7, lucide-react, CSS, Node test runner, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-08-scan-verify-msot-guide-design.md`

## Global Constraints

- Do not embed the Vercel page or add `framer-motion` or another dependency.
- Do not change package version metadata, shared header/footer, Calendar or Mutuals guides, or unrelated dirty files.
- Use the supplied screenshots already present at `public/images/equalization-step-1.png` through `equalization-step-4.png`; map by visual content, not filename number.
- Preserve keyboard-accessible controls and usable behavior when local storage is unavailable or malformed.

---

## File structure

- Create: `src/pages/OvertimeEqualizationGuide.tsx` — dedicated article, static content, and guide-local controls.
- Modify: `src/pages/Guides.tsx` — select the dedicated article for the overtime slug.
- Modify: `src/lib/guides.ts` — retain only the overtime library-card metadata needed by the generic library.
- Modify: `src/index.css` — append `.msot-guide*` desktop and mobile styles.
- Modify: `tests/redesign-production.test.mjs` — assert source and route contract.
- Modify: `scripts/test.mjs` — verify the production guide in Playwright.

### Task 1: Create and route the dedicated guide

**Files:**
- Create: `src/pages/OvertimeEqualizationGuide.tsx`
- Modify: `src/pages/Guides.tsx`
- Modify: `tests/redesign-production.test.mjs`

**Interfaces:**
- Produces: `OvertimeEqualizationGuide({ onFeedback }: { onFeedback: () => void }): JSX.Element`.
- Consumes: the existing `guides` route entry and shared `onFeedback` callback.

- [ ] **Step 1: Write the failing source test**

Add a Node test that reads `src/pages/Guides.tsx` and `src/pages/OvertimeEqualizationGuide.tsx`; it must require the dedicated import, the `guide.slug === 'overtime-equalization'` branch, four step IDs, `Calendar hours`, `fdny-howto3-checks`, and all four `/images/equalization-step-*.png` paths.

- [ ] **Step 2: Verify it fails**

Run: `node --test tests/redesign-production.test.mjs`

Expected: FAIL because the component and route branch do not exist.

- [ ] **Step 3: Write the minimal route implementation**

Create the component with `<article className="msot-guide">`, four source image paths, four step IDs, a native range input labelled `Calendar hours`, and `fdny-howto3-checks`. Import it in `Guides.tsx` and directly return `OvertimeEqualizationGuide` when the known guide slug equals `overtime-equalization`. Do not alter generic guide markup.

- [ ] **Step 4: Verify it passes**

Run: `node --test tests/redesign-production.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add tests/redesign-production.test.mjs src/pages/Guides.tsx src/pages/OvertimeEqualizationGuide.tsx && git commit -m "feat: add MSOT guide route"`

### Task 2: Build the four-step article and image dialog

**Files:**
- Modify: `src/pages/OvertimeEqualizationGuide.tsx`
- Modify: `src/index.css`
- Modify: `tests/redesign-production.test.mjs`

**Interfaces:**
- Produces: `PhoneShot({ src, alt, caption, onExpand })` and an accessible dialog with `role="dialog"`, `aria-modal="true"`, labelled close button, overlay dismissal, and Escape dismissal.

- [ ] **Step 1: Add the failing semantic-content test**

Require the source strings `SCAN YOUR OT SHEET`, `START A NEW REPORT SCAN`, `CAPTURE THE SHEET FLAT, LIT & FULL-PAGE`, `READ YOUR PROJECTED MSOT NUMBER`, `CLEAR THE CALENDAR ALERTS — 3 STATES`, `Matching hours does not confirm payment`, and `aria-modal="true"`.

- [ ] **Step 2: Verify it fails**

Run: `node --test tests/redesign-production.test.mjs`

Expected: FAIL because detailed guide content and dialog are absent.

- [ ] **Step 3: Implement the source guide content**

Add typed step metadata, hero, action links, desktop rail, mobile step rail, four sections, scan advice, alert overview, and safety/payroll caveat. Use this intentional screenshot map: `newReport` → `/images/equalization-step-2.png`, `scanOptions` → `/images/equalization-step-3.png`, `projectedMsot` → `/images/equalization-step-4.png`, and `calendarStats` → `/images/equalization-step-1.png`.

Keep dialog state as `{ src: string; alt: string } | null`. Add an Escape listener with cleanup. Screenshot triggers must have `aria-label` beginning `Enlarge:`. Append only `.msot-guide*` CSS for the dark/gold/red field-guide treatment, phone frame, sticky rail, and responsive layout.

- [ ] **Step 4: Verify source and build**

Run: `npm run test:source && npm run build`

Expected: PASS; `dist/images` contains all four images.

- [ ] **Step 5: Commit**

Run: `git add src/pages/OvertimeEqualizationGuide.tsx src/index.css tests/redesign-production.test.mjs && git commit -m "feat: add Scan and Verify MSOT content"`

### Task 3: Implement simulator, FAQ, and checklist persistence

**Files:**
- Modify: `src/pages/OvertimeEqualizationGuide.tsx`
- Modify: `src/index.css`
- Modify: `tests/redesign-production.test.mjs`

**Interfaces:**
- Produces: a range simulator with fixed report hours of `24`, visible `.msot-simulator-status`, and six persisted checklist controls.

- [ ] **Step 1: Add failing source assertions**

Require `CALENDAR HIGHER`, `HOURS MATCH`, `CALENDAR LOWER`, `0 of 6 done`, `localStorage.getItem`, and `localStorage.setItem` in the dedicated component source.

- [ ] **Step 2: Verify it fails**

Run: `node --test tests/redesign-production.test.mjs`

Expected: FAIL because the three states and checklist do not exist.

- [ ] **Step 3: Implement local interactions**

Initialize six boolean checklist items by parsing `fdny-howto3-checks` only when it is an array of six booleans; otherwise use six `false` values. Wrap storage read and `useEffect` write in `try/catch`. Render a 0–36 range (step 1) labelled `Calendar hours`. With report hours fixed at 24, derive `CALENDAR HIGHER`, `HOURS MATCH`, or `CALENDAR LOWER` from the difference. Copy must distinguish possible unpaid MSOT from a missing calendar mark and never imply matching proves payment. Render six `aria-pressed` checklist buttons, `.msot-checklist-progress` as `N of 6 done`, five FAQ buttons with `aria-expanded`, and the shared feedback CTA using `onFeedback`.

- [ ] **Step 4: Verify source and lint**

Run: `npm run test:source && npm run lint`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/pages/OvertimeEqualizationGuide.tsx src/index.css tests/redesign-production.test.mjs && git commit -m "feat: add MSOT guide interactions"`

### Task 4: Browser-test the production route

**Files:**
- Modify: `scripts/test.mjs`

**Interfaces:**
- Consumes: built `/guides/overtime-equalization` route and deterministic visible controls.

- [ ] **Step 1: Add failing browser checks**

Navigate to `/guides/overtime-equalization`. Assert `.msot-guide-step` count is four. Open the button named by `/Enlarge:.*New report needed/`, confirm the dialog, press Escape, and confirm it is gone. Set `Calendar hours` to 24 and require `.msot-simulator-status` to include `HOURS MATCH`. Toggle the button named by `/Tapped “Scan New OT Report”/` and require `.msot-checklist-progress` to include `1 of 6 done`. Add 390px and 320px route checks requiring no horizontal overflow.

- [ ] **Step 2: Verify it fails**

Run: `npm run build && npm run test:ui`

Expected: FAIL until the named classes and controls exist.

- [ ] **Step 3: Expose deterministic semantic selectors**

Add only `.msot-guide-step`, `.msot-simulator-status`, and `.msot-checklist-progress` to visible production elements. Do not add hidden test controls.

- [ ] **Step 4: Run full verification**

Run: `npm test`

Expected: build, source tests, lint, and browser tests PASS; inspect desktop and mobile overflow results.

- [ ] **Step 5: Diff-check and commit**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; stage only plan-owned files.

Run: `git add scripts/test.mjs && git commit -m "test: cover Scan and Verify MSOT guide"`

## Plan self-review

- Spec coverage: Tasks 1–2 implement first-party routing, scoped design, four screenshots, and accessible expansion. Task 3 implements alert states, simulator, FAQ, saved checklist, feedback callback, and storage fallback. Task 4 validates the production route and responsive behavior.
- Placeholder scan: no unresolved implementation markers or deferred language remains.
- Type consistency: the guide component signature, storage key, class names, labels, and screenshot paths are defined once and reused consistently.
