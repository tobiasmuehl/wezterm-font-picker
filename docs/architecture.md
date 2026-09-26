# How Terminal Font Duel works

Terminal Font Duel is a static React application. Vite builds the JavaScript, styles, font files, and license files into `dist/`. There is no application server, database, account system, or telemetry.

## Tournament

`src/core/engine.ts` derives state from a shuffled catalog order and a list of comparison events. Each event records the two font IDs and one of four votes: left, right, both, or neither.

The first eight comparisons cover the current 16 families once each. Survivors enter a queue for further comparisons. A decisive vote retains the chosen font; both retains both; neither removes both. When several candidates remain, pairing prefers a less-repeated opponent for the next candidate in the queue.

The session ends when no comparison remains, two final candidates are both liked, or 20 comparisons have been recorded. With one winner chosen per comparison, 16 fonts yield a winner in 15 comparisons. Multiple survivors at the limit are joint favorites. The app does not manufacture a winner when all candidates are rejected.

Results can also include up to two previously liked alternatives, ordered by positive appearances; explicitly rejected candidates are excluded. This is a bounded preference tournament, not a statistical ranking or an exhaustive comparison of every pair.

## Persistence and Undo

A session stores a catalog revision, a random seed, and the comparison history in local storage. Replaying that history produces the same bracket. Undo drops the last event and replays the remainder.

Restoration validates the revision, seed, votes, expected pairs, and comparison limit, including whether an event illegally follows an already-finished session. Invalid or stale sessions start fresh. Votes remain local; unavailable storage is reported in the UI.

The storage keys retain the original `wezterm-font-picker` prefix for compatibility with sessions created before the Terminal Font Duel rename. They are implementation identifiers, not product branding. Renaming them requires a migration.

## Font rendering

`src/data/fonts.json` names the regular mono faces imported from Homebrew release archives. `src/core/fonts.ts` loads them with the browser FontFace API under internal aliases. Both current faces must load before the app renders the code specimens or accepts a vote; an error offers Retry.

The specimens share content, 17 px regular text, line height, colors, and ligature settings. Fonts retain their natural metrics, which are part of what the user is judging. Voting uses programming ligatures off. Results allow inspecting ligatures and the separate JetBrains Mono NL face.

These previews are styled code specimens, not terminal-emulator instances. Rendering can differ from WezTerm, especially shaping, fallback, and pixel rasterization. The export uses the actual patched family name and explicit ligature settings for native-terminal inspection.

## Palette handoff

The app accepts an optional URL fragment:

```text
#palette=<URL-encoded JSON>
```

The JSON contains `name`, `background`, `foreground`, `ansi`, and `brights`. The name must be nonempty and at most 200 characters. Each color must be `#RRGGBB`; both ANSI arrays must contain exactly eight colors. The JSON text is length-limited before parsing. Accepted palettes are saved locally and applied to both previews; hash changes update an already-open tab.

The fallback order is a valid URL palette, a saved palette, then the bundled nordfox palette. The fragment carries only a palette name and colors. No JavaScript, CSS expressions, or font URLs are accepted through this interface.

## Distribution

The current artifact is a static `dist/` directory. A public deployment must serve its JavaScript, WOFF2 assets, and licenses together. The application does not require runtime secrets or an API service. Homebrew and WezTerm commands are displayed for the user to copy; the website does not execute them.

The app code is MIT licensed. The fonts, patched glyphs, and palette retain their own notices and provenance. See the root third-party notice file and `public/licenses/`.
