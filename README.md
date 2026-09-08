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

The build emits static entry points for the guide routes and legacy `.html` guide URLs so direct links continue to work on GitHub Pages.
