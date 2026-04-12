# Sumo v2.0 — GitHub Pages Build

This version is refactored for simple static hosting.

## Structure

- `index.html` — markup only
- `assets/style.css` — extracted UI styles + dynamic background layer
- `assets/script.js` — extracted app logic + visual theme controller
- `assets/images/*.svg` — local tab/day background artwork for GitHub Pages

## Deploy on GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this folder to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and the **/(root)** folder.
6. Save.

No build step is required.

## Background system

- Bottom-nav pages each have a default background.
- The **Training** page swaps to a day-specific background when you change the day selector.
- Background images are local SVG assets, so the site is fully self-contained for hosting.
