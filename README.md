https://sunrise201238-sys.github.io/photo-aesthetic-assistant/

# photo-aesthetic-assistant
🎯 Project Goal

Create a zero-budget, privacy-first photography aesthetic assistant website that:

Runs entirely in the user’s browser — no backend, no cloud API, no uploads.

Allows users to upload one photo at a time for instant aesthetic analysis.

Uses OpenCV.js to automatically generate an “improved composition” version (pseudo-generated image).

Provides clear, language-adaptive composition and photography suggestions in English and Traditional Chinese.

Essentially, it’s a lightweight AI photography coach — fast, private, and offline.

⚙️ Core Features
🖼️ 1. Image Upload & Local Processing

Drag-and-drop or select one image file.

Image never leaves the browser — all processing happens locally.

EXIF rotation is automatically corrected for consistent orientation.

🧠 2. Aesthetic Analysis (OpenCV.js)

Analyzes the image’s structure and key photographic qualities:

Main subject detection (face/body/contour)

Horizon tilt angle

Rule-of-thirds alignment

Foreground/background balance and sharpness (Laplacian variance)

Exposure, contrast, saturation, and color balance

Outputs language-neutral metrics (angles, offsets, brightness index, etc.) for further interpretation.

🎨 3. Pseudo-Generated Improved Composition

Based on the analysis, the app automatically creates a visually improved version of the photo:

Adjusts rotation, cropping, perspective, and exposure

Applies mild tonal and color balance corrections

The only downloadable image is the “aesthetic-suggestion applied” result.

Preview overlays (grid lines, horizon guides, arrows) appear only on-screen — not embedded in the final image.

🌐 4. Bilingual Interface (en-US ⇄ zh-TW)

Toggle between English and Traditional Chinese instantly.

All text elements — UI labels, feedback messages, download names, accessibility text — update in real time without reloading or reprocessing.

Language handled through two JSON dictionaries (en-US.json and zh-TW.json) that define all visible strings.

💾 5. Resource Management & Performance

OpenCV.js runs in a single session, optionally in a Web Worker to keep the UI smooth.

Each step cleans up resources: deletes cv.Mat() objects, revokes Blob URLs, closes ImageBitmaps.

Images are resized before processing (e.g., max 2048 px) to control memory usage.

No files or data are cached permanently — the app remains lightweight and safe.

✅ Final Outcome

A fully client-side web app that performs aesthetic evaluation and automatic composition correction.

User uploads → analyzed → improved version generated → instant download.

Works on desktop and mobile browsers, entirely free and open-source via GitHub Pages.

The GitHub repository shows multiple code languages (JavaScript/TypeScript, HTML, CSS, JSON, wasm) for clarity and transparency.

## Manual GitHub upload helpers

This workspace does not have a Git remote configured, so `git push` fails. Add the upstream repository first (for example `git remote add origin https://github.com/you/photo-aesthetic-assistant.git`) or upload the built assets manually. The files that must be copied into GitHub Pages are:

- `index.html`
- `assets/css/styles.css`
- `assets/js/main.js`
- `translations/en-US.json`
- `translations/zh-TW.json`

Each file is already self-contained (no external fonts or scripts), so dropping them into the repository root will publish the fully offline experience.
