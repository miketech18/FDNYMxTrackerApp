# Scan & Verify MSOT guide replacement

## Goal

Replace the existing `/guides/overtime-equalization` article with the supplied “How-To #03: Scan & Verify MSOT” guide while preserving the surrounding FDNY MX Tracker website, its other guides, and shared application behavior.

## Architecture

The guide remains a first-party React route in the existing guide system. `src/lib/guides.ts` continues to own guide metadata and route registration; a dedicated guide-page component renders the richer overtime content when that slug is active. Existing `Header`, `Footer`, feedback modal, routing, and image-modal accessibility behavior remain shared.

The dedicated component owns only guide-local UI state:

- active in-page step for the mobile/side navigation;
- an expanded screenshot lightbox, dismissible with its close control, overlay click, or Escape;
- expanded FAQ item;
- a checklist persisted under the existing guide-specific local-storage key;
- calendar comparison slider state, with accessible value text and an outcome calculated from the fixed report hours.

## Content and visual treatment

The page imports the source guide’s four sequential steps: start a new report scan, capture a clean sheet, read Projected MSOT, and clear calendar alerts. It includes the source’s practical scan advice, three alert states, interactive comparison, checklist, FAQ, and concise safety/payroll caveats.

Its visuals use a guide-scoped layout and styles so the imported guide can retain its high-contrast field-guide treatment without changing the Calendar or Mutuals guide pages. The four original screenshots are copied into `public/images` and remain accessible with descriptive alt text.

## Boundaries and errors

The import does not embed the Vercel app, add an external runtime dependency, or change the website’s package metadata. If local storage is unavailable or malformed, the checklist starts empty and the guide remains usable. Unknown guide routes still use the existing not-found page.

## Verification

Add focused source coverage for the dedicated guide’s content and controls, then run the production build, source tests, lint, and the browser UI suite. Browser checks cover the route, screenshot enlargement, slider state, FAQ, and checklist persistence behavior. Confirm the supplied screenshot assets resolve from the production build.
