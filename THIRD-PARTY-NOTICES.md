# Third-party notices

The application code is MIT licensed. Font files retain their own licenses.

## Fonts

The full regular monospaced faces are obtained from the Homebrew casks recorded in `src/data/fonts.json`, using Nerd Fonts v3.5.1 release archives. Original filenames and SHA-256 checksums are in that manifest. The only transformation is lossless WOFF2 packaging by fontTools; no glyph subsetting or outline editing is performed. Original internal family names and copyright metadata are retained.

Each family has its archive's original license in `public/licenses/<family>/`. Most use SIL OFL 1.1. Meslo LG and Roboto Mono use Apache 2.0; the full Apache license is also preserved at `public/licenses/APACHE-2.0.txt`. Hack includes the MIT and Bitstream Vera licenses and DejaVu public-domain attribution. Go Mono includes the Bigelow & Holmes redistribution notice.

## Nerd Fonts and icons

Nerd Fonts, Ryan L McIntyre and contributors: https://github.com/ryanoasis/nerd-fonts

The v3.5.1 source revision is `b894ea7803af6aade63d60a4381e006098ec9c4d`. Its root license and license audit are preserved, alongside available icon-set licenses, in `public/licenses/upstream/`. The standalone root notice is also at `public/licenses/NERD-FONTS-LICENSE.txt`. Patched glyph sets include Font Awesome, Codicons, Devicons, Material Design, Octicons, Powerline, Pomicons, Weather Icons, and other sets documented by the upstream license audit. Icons and fonts are not relicensed under the application's MIT license.

## Default colors

The nordfox palette comes from the WezTerm color-scheme catalog, preserving the catalog's exact colors. WezTerm: https://github.com/wez/wezterm. Its MIT license is retained in `data/WEZTERM-LICENSE.md` and `public/licenses/WEZTERM-LICENSE.md`.

## JavaScript dependencies

React and React DOM are MIT licensed. Vite emits bundled dependency notices as `dist/.vite/license.md` at production build time. The application does not bundle a terminal command runner.
