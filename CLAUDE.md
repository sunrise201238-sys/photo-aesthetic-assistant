# Photo Assistant — notes for Claude

## Workflow (owner's instruction, 2026-07)
Commit and push work **directly on `main`** — do not create feature branches
or pull requests unless the owner explicitly asks for one. GitHub Pages
deploys from `main`, so a push to `main` is what updates the live site.

## Project facts
- 100% client-side photo fixer (HTML/CSS/vanilla JS, no build step, no
  dependencies, no network calls). Live at
  https://sunrise201238-sys.github.io/photo-aesthetic-assistant/
- All engine code is in `assets/js/main.js`. Each feature is a
  self-contained function tuned via inline constants:
  `applyStraighten` (+ `nudgeToThirds`), `applyShadowLift`, `applyDetail`,
  `applyWhiteBalance`.
- Detail and White balance are always-on (no UI toggle); Composition
  (Landscape/Object), Shadow (default off), and Show guides are user
  toggles.
- Dual resolution: analysis/preview on a ≤2048px copy (`MAX_DIMENSION`),
  downloads re-rendered at up to 4096px / 15MP (`MAX_OUTPUT_DIMENSION`,
  `MAX_OUTPUT_AREA` — iOS Safari canvas-limit headroom). Download is
  JPEG 0.95, flattened onto white.
- i18n: `translations/en-US.json` + `zh-TW.json` **and** the duplicated
  fallback dictionaries at the top of `main.js` — keep all three in sync.
- The owner is very sensitive to over-processing: keep Shadow a simple
  gamma lift and Detail gentle; neutral-white color is their top priority.

## Validation
Headless check: serve locally (`python3 -m http.server`) and drive with
Playwright (chromium at `/opt/pw-browsers/`, `--no-sandbox`); ES modules
require http://, not file://. `node --check assets/js/main.js` for syntax.
