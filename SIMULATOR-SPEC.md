# FDNY Mutual Tracker — App Simulator Spec

Source of truth for building the `/app-simulator` page. This spec was produced by viewing all 38 reference screenshots; a build agent should be able to build from this file alone. Screenshots remain at `/Users/mikemauch/Desktop/web simulator/` if pixel-level detail is needed.

## 1. What this is

A public, interactive, phone-framed recreation of the FDNY Mutual Tracker mobile app (Expo/React Native). It must feel like the real app but run entirely on fake local data — no Firebase, no auth, no network.

## 2. Overall structure

**Bottom tab bar (4 tabs, in order):** `Calendar · Tracker · My Crew · Settings`
- Active tab: red icon + small red dot + red label; inactive: gray.
- iOS-style rounded phone frame on desktop; full viewport on mobile.

**Identity line pattern** (monospace, letter-spaced, shown under page titles):
`L99 · GROUP 10 · TEST MUTUAL SWAPS` — in the simulator replace with `L99 · GROUP 10 · DEMO`.

## 3. Theme tokens

Dark UI. Extract from screenshots; these are from the app's real Edit Colors screen:

| Token | Value |
|---|---|
| App background | near-black `#0D0D0F` |
| Card/panel | `#1C1C22` with subtle lighter border |
| Accent (active tab, selected chips, headers) | gold `#D4A94E` |
| Primary red (icons, FAB, alerts) | `#E84C3D` |
| Text primary | `#F5F5F5`, secondary `#9E9E9E` |
| Tour/schedule colors | 9x day `#FDD835` (yellow), 6x night `#1E88E5` (blue), MSOT `#558B2F`, RSOT `#827717`, Other OT `#546E7A`, Vacation `#CE93D8`, Medical `#E53935`, Crew On `#FB8C00` (orange), Crew Off `#AB47BC` (purple), MX On `#4FC3F7`, MX Off `#F9A825` |

**Typography:** condensed/monospace uppercase for headings, section labels, tabs, and stat numbers (letter-spaced); regular sans-serif for body/cards. Match this pairing.

## 4. Screen inventory (38 screenshots → screens to build)

### Calendar tab
| Ref | Screen | Key elements |
|---|---|---|
| 01 | Month view + "Sync Warning" dialog | Segmented WEEK/MONTH/YEAR control (selected = gold outline); month grid; dialog warns sync failed with Retry/dismiss |
| 02 | Month view with entries | Day cells colored (yellow/blue tour chips, purple/orange Crew On/Off, `$` payday markers, holiday labels); month header with TODAY button + arrows |
| 03 | **Week view** | Big date header `NOVEMBER 11 – 17`; identity line; "Stay Low" card (gold title, `SATURDAY, SEPTEMBER 12`, `06:00 PM FDNY Night Tour`, weather `--` top-right); horizontal 7-day strip (WED 4 → TUE 10) with event dots; `9x/6x` legend rows (9x: (1) (2) 3* 4 5 6 / 6x: 16* 17* 18* 19 20 21); day section with holiday (Veterans Day), "No events" + "Nothing scheduled." empty card; gold `+` FAB |
| 04–06 | Year view (3 scroll positions) | 12 mini-month grid; every day shows stacked 9x/6x chips (yellow/blue); entry chips: `MSOT 9x`, `RSOT 9x`, `MSOT 6x`, `AR 45m`, `P2P 75m` (orange), `MX Off 6x`, `Other OT` (gray), `+Medical` (red), `Vacation` (purple), `Crew On/Off 9x`; holiday + payday `$` markers; Sep 11 highlighted blue; ring/checkmark icons on some tour chips |

### Tracker tab (arrow-shaped sub-tabs: `OT LOG ▸ MUTUALS ▸ SCHEDULE ▸ STATS`)
| Ref | Screen | Key elements |
|---|---|---|
| 07 | OT Log list | 3 stat cards (gold left edge): `0h THIS OT PERIOD`, `0h LAST OT PERIOD`, `44h YTD TOTAL`; year summary row `2026 · OT pay periods · 6 entries · 44h ∨`; collapsed pay-period cards: `Nov 22 – Dec 5 / WK 49-50 · Pay 12/18/2026 / 10.3h >`; red `+` FAB |
| 08 | OT Log, period expanded | Entries: `Sun, Nov 22, 2026 / PORTAL 2 PORTAL · 9× / 75 MIN`; `Sat, Nov 28, 2026 / OTHER OT · 9× ▸ ERP / 9 h` |
| 09 | OT Log, more periods | Entries incl. `AWAITING RELIEF 9×`, `MSOT`, `RSOT` rows in later periods |
| 10 | Mutuals dashboard | Balance hero card (`MX BALANCE -1`); `MX ON 8 / MX OFF 9` pair; per-partner balance rows; mutual history list |
| 11 | Mutual partner detail | `THEY WORKED FOR YOU` / `YOU WORKED THEIR` chips; dated swap entries; long-press/ⓘ to delete |
| 12 | Mutuals delete confirm | Dialog: remove this mutual partner + history? Cancel/Delete |
| 13 | Schedule › Edit RSOT Dates | Scan card + manual rows `#1–8` each with date + `9x/6x` toggle; reminders toggle |
| 14 | Schedule › Enter Vacation Leaves | First Half / Second Half / Swapped selectors; "days from calendar" picker; MX Partner Vacation section |
| 15 | Schedule › Medical, Light Duty & Other Leaves | Add-entry form (type, start, end); Medical + Vacation lists with totals |
| 16 | Schedule index | Numbered accordions: `01 SCHEDULE` (RSOT Dates, Vacation Leaves, Medical & Other, Comp Time, Training Dates), `02 TRAINING DATES`, `03 LEAVE HOURS` |
| 17 | Comp Time | `0h` hero; on/off entry form; empty state |
| 18 | Training Dates | Add form (date, type); `CHOOSE TRAINING` bottom sheet: `CFR-D`, `HazMat Ops`, `ERP`, `Green Energy`; list with `DUE SOON` badge |
| 19 | Stats | `MSOT` scan-style card; `Key Stats` (0h / 0 entries); `OT BREAKDOWN` collapsed accordion |

### My Crew tab (sub-tabs: `CREW · MX PARTNER · OFFERS · BOARD`)
| Ref | Screen | Key elements |
|---|---|---|
| 20 | Crew | Roster cards: avatar initials, name, unit/group, on/off tour chip |
| 21 | MX Partner (empty) | Empty state + "set partner" CTA |
| 22 | Offers (empty) | Empty state |
| 23 | Board (empty) | Empty state |
| 24 | Find Crew search | Search input + results rows with add/connect |

### Settings tab (numbered accordions `01–06`)
| Ref | Screen | Key elements |
|---|---|---|
| 25 | Settings index | `L99 · GROUP 10 · TEST MUTUAL SWAPS`; `01 IDENTITY & CREW — CONNECTED`: My Group & MX Partner (`10 / 10`), My Crew Profile, Rank (Firefighter/Officer segmented); `02 OPERATIONAL TOOLS`; `03 APPEARANCE — CUSTOM`; `04 DATA & MAINTENANCE — NOT BACKED UP` (red); `05 ABOUT & SUPPORT — v4.7.24`; `06 SEND FEEDBACK & SHARE`; FDNY badge watermark |
| 26 | Operational Tools | Door Codes; Navigate to FDNY Unit; FDNY Links; Phone Numbers |
| 27 | FDNY Links | List of official FDNY resources (divisions, units, portal) |
| 28 | Telephone Numbers | Directory list: name/role + tap-to-call rows |
| 29 | Appearance › Edit Colors | Per-tour color pickers with hex values (see §3 tokens) + presets |
| 30 | Data & Maintenance | Backup now, import, calendar sync, transfer — show "NOT BACKED UP" red state |
| 31–32 | iPhone: Settings + paywall | Same Settings on iOS; **paywall screen**: app icon, `FDNY Mutual Tracker / Simplified tour scheduling`, 3 feature rows (Mutual calendar / MSOT + RSOT + Vacation / Mutual history), `$9.99 / year`, red `START 7-DAY FREE TRIAL`, restore link. In the simulator make the trial button inert-but-labeled ("Demo — subscriptions disabled") |

## 5. Navigation map

```
Tabs: Calendar | Tracker | My Crew | Settings
Calendar: [WEEK|MONTH|YEAR] segmented; year scrolls; FAB + → add entry modal
Tracker:  [OT LOG|MUTUALS|SCHEDULE|STATS]
  OT LOG: period → expand entries
  MUTUALS: dashboard → partner detail → (delete dialog)
  SCHEDULE: index accordions → RSOT / Vacation / Medical / Comp / Training (+ CHOOSE TRAINING sheet)
  STATS: accordions (Key Stats, OT Breakdown)
My Crew:  [CREW|MX PARTNER|OFFERS|BOARD] + Find Crew
Settings: accordions 01–06 → sub-pages (Ops Tools, Links, Numbers, Colors, Data, About, Paywall)
```

## 6. Interactions to implement (all local React state + namespaced localStorage)

1. Tab + sub-tab navigation (Calendar/Tracker/My Crew/Settings).
2. Calendar: switch week/month/year; navigate dates; tap day → detail; FAB `+` → modal to add fake entry; delete entry.
3. OT Log: expand/collapse pay periods; `+` add OT entry (type, multiplier 9x/6x, hours or minutes); mark entries.
4. Mutuals: open partner detail; change a mutual status; delete partner via confirm dialog (restorable via reset).
5. Schedule accordions; RSOT 9x/6x row toggles; add vacation/medical/comp/training entries; CHOOSE TRAINING bottom sheet (Esc-closable).
6. Settings accordions; Rank toggle (Firefighter/Officer); tour color editing (persists to localStorage); "Backup now" → success toast (fake).
7. Reset-demo control restoring seed data; demo changes persist across refresh under key like `fdnymx.demo.*`.

## 7. Demo data rules

- **Fictionalize everything.** The screenshots contain a real name/phone in Settings and crew names — the simulator must use fictional ones. **The demo user is `Johnny Staylow`** (use this name everywhere a user profile appears — Settings profile, identity areas, crew entries; fake phone like `(555) 010-0143`). **Johnny's mutual partner is `Joe Floorbelow`** — use Joe as the primary MX partner for mutual balances, mutual history, and partner detail. Any other crew/member names must be invented and clearly fictional. Keep structural fidelity (unit/tour/group labels like `L99 · GROUP 10 · DEMO`), swap all personal data.
- Populate: profile, current tour, vacation/medical/military leave, mutual partners + balances (open requests, MX on/off, one negative balance), OT entries across two pay periods (P2P 75min, Other OT/ERP 9h, Awaiting Relief, MSOT, RSOT), comp time, training dates with one DUE SOON, stats, notifications/recent activity.
- Keep some screens showing their empty states (MX Partner, Offers, Board, Comp Time zero state) to mirror the app.
- Calendar chips must include at least: MSOT 9x, RSOT 9x, MSOT 6x, AR 45m, P2P 75m, MX Off 6x, Other OT, +Medical, Vacation, Crew On/Off.
- Include the "Stay Low" card on Week view and a dismissible demo variant of the Sync Warning dialog (never real errors, no retries against network).
- Keep version label `v4.7.24` and the paywall as inert demo content.

## 8. Page chrome (outside the phone frame)

- "APP SIMULATOR — DEMO DATA" label; note: *"This interactive demo uses fictional data. Changes are local to this browser and do not affect the FDNY Mutual Tracker app."*
- Reset-demo control; desktop: centered phone frame; ≤390px: full-viewport, no horizontal overflow at 320px.

## 9. Repo conventions (verified — follow these exactly)

- **Stack:** React 19 + TypeScript + Vite 7 + react-router-dom 7 (BrowserRouter, no basename — site serves at custom-domain root) + Tailwind CSS 4. Routing is flat in `src/App.tsx`; add `<Route path="/app-simulator" ...>` there.
- **Direct-route loading on GitHub Pages:** `scripts/prepare-pages.mjs` copies the built app shell (`dist/index.html`) to a hardcoded `routeFiles` list. **Add `'app-simulator/index.html'` to that list** — without this, loading `/app-simulator` directly after deployment 404s.
- **Site fonts:** "Bebas Neue" (condensed uppercase display) + "Inter" (body). Use Bebas Neue for app-style headings/stat numbers and Inter for body; use a generic monospace stack for the identity line and letter-spaced labels. Do NOT add new font packages.
- **Site chrome:** the route renders inside existing `Header`/`Footer`/`DownloadBar` (see `src/components/Layout.tsx`). Keep that chrome. If the fixed DownloadBar overlaps the phone frame on mobile, hide it on the simulator route ONLY.
- **Browser tests:** single sequential Playwright script `scripts/test.mjs` serving `dist/`, using `check(name, condition)` PASS/FAIL lines; add simulator checks there following that pattern. Source tests: `node --test` on `tests/redesign-production.test.mjs`.
- **Full verification gate:** `npm test` = build (tsc + vite + prepare-pages) → test:source → lint → test:ui. Run it before finishing.
- **localStorage:** existing site keys look like `fdny-howto3-checks`; the simulator must use its own namespace (e.g. `fdnymx.demo.*`) and must never touch existing keys.
- **Analytics:** the site fires Umami events on some clicks — the simulator must fire none (consistent with the no-network rule).
- **Version label:** site/app version is `4.7.24` (package.json). Do not bump it.
