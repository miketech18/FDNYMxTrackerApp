# FDNY Mutual Tracker website

Marketing site and how-to guides for FDNY Mutual Tracker, built with React, TypeScript, and Vite.

## Local development

```bash
npm ci
npm run dev
```

## Verification

```bash
npm test
```

The test command builds the production site, verifies source and deployment safeguards, runs ESLint, and exercises the desktop and mobile experience in Playwright.

## Deployment

Pushes to `main` are tested, built, and deployed to GitHub Pages by `.github/workflows/deploy-pages.yml`. The production site uses the custom domain `fdnymxtrackerapp.harvestave.org`.

The build emits static entry points for `/app-simulator`, the guide routes and legacy `.html` guide URLs so direct links continue to work on GitHub Pages.


## App simulator

Visit `/app-simulator` or use **Try the app simulator** on the homepage. **Full-screen demo** expands the app with persistent Reset and Exit controls, a scrolling content area, and visible bottom navigation. On phones, day details open as scrollable bottom sheets and the calendar legend scrolls horizontally. The simulator code and styles load only when its route is opened. The interface follows `SIMULATOR-SPEC.md`, using the existing fonts and app colors. The sample clock is fixed to September 12, 2026 so screenshots, tours, and tests remain reproducible.

- `src/pages/AppSimulator.tsx` contains the four app tabs, local forms, dialogs, and navigation; `AppSimulator.css` scopes its styling.
- `src/lib/simulator.ts` owns fictional fixtures, date helpers, validation, and the `fdnymx.demo.v1` storage key. Reset only replaces this key; it does not clear other site preferences. If storage is unavailable, edits work in memory with a visible warning.
- Johnny Staylow and Joe Floorbelow are fixed demo identities. Forms accept only predefined demo choices, dates, durations, and colors; crew search is not persisted.
- Sync, scanning, maps, directories, sharing, and backup screens are labeled local previews. Subscriptions and restore purchases are disabled. No simulator action calls a backend. The analytics bootstrap in `index.html` skips direct simulator loads and blocks analytics after client-side navigation via Umami’s before-send filter.
- The deployment script explicitly emits `dist/app-simulator/index.html`. Source tests guard that route; Playwright checks the built route, interactions, persistence, reset, external requests, and 320px/390px layouts. UI screenshots are written to ignored `artifacts/` files.
