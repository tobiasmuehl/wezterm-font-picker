# Contributing to Terminal Font Duel

The app should make choosing a terminal font feel easy. Changes that improve the comparison, keyboard access, loading reliability, or installation instructions are especially useful. Preserve the short path from opening the app to comparing two fonts.

## Get started

```sh
npm ci
npm run dev
```

Use Node.js 22.12 or newer. The browser fonts are committed, so the normal development loop needs neither Python nor installed Nerd Fonts.

## Project map

| Location | Responsibility |
| --- | --- |
| `src/App.tsx` | Comparison controls, results, keyboard input, saved progress |
| `src/core/engine.ts` | Deterministic tournament and history validation |
| `src/core/fonts.ts` | Manifest types and browser font loading |
| `src/core/palette.ts` | Palette validation and WezTerm configuration export |
| `src/components/Specimen.tsx` | The shared code and glyph specimen |
| `src/data/fonts.json` | Font provenance, filenames, checksums, licenses |
| `public/fonts/` | Full WOFF2 preview faces |
| `public/licenses/` | Font, icon, and palette notices |
| `scripts/` | Font and upstream-notice importers |
| `tests/` | Tournament, palette, export, and asset checks |

## Keep comparisons useful

Both sides should use the same content and rendering settings. Keep font names hidden until results and require successful font loads before accepting votes. Preserve both-good and neither as distinct outcomes, the 20-comparison ceiling, keyboard controls, and Undo.

Browser font rasterization is not identical to a native terminal. Document a limitation when it affects the choice, rather than claiming pixel-perfect WezTerm rendering.

## Updating fonts

A candidate needs an active Homebrew cask, a suitable regular monospaced Nerd Font face, and retained redistribution notices. Prefer a small, varied set over many nearly identical families. Keep JetBrains Mono and its NL face.

Font maintenance uses Python 3.10+ and fontTools with WOFF2 support. An isolated environment keeps those dependencies local:

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install 'fonttools[woff]'
npm run fonts:import
```

The importer downloads the Homebrew archive, verifies its SHA-256, checks required glyph coverage and monospaced ASCII advances, and writes full WOFF2 conversions. It does not install or execute fonts. Downloads are cached under the ignored `.font-cache/` directory.

Review changes to `src/data/fonts.json`, `public/fonts/`, and each family's license files together. Upstream font names, outlines, and glyph coverage should remain intact. If the Nerd Fonts release changes, update the pinned revision in `scripts/import-notices.py` to match before running:

```sh
python3 scripts/import-notices.py
```

Keep `THIRD-PARTY-NOTICES.md`, `public/licenses/NERD-FONTS-LICENSE.txt`, and `public/licenses/index.html` in sync with the collected notices. When changing the family count, update the UI copy, README shortlist, coverage tests, and budget assumptions too.

## Before submitting a change

Run `npm test` and `npm run build`. For behavior or visual changes, open the app and check the affected flow at a wide and narrow viewport. A useful interaction check includes arrow-key votes, Both good, Neither, Undo, reload persistence, and the final install/configuration controls. If a font changes, inspect its code, punctuation, and icons in the browser.

Describe the problem, what changes for the user, and how you verified it. Include a screenshot for visible changes. Retain existing font and icon license notices; the app's MIT license does not replace them.

## Reporting an issue

Include the browser and OS, the steps to reproduce, the expected result, and what happened. For a rendering problem, include a screenshot and the font's result name if you have reached it. A small reproduction is more helpful than a long description.
