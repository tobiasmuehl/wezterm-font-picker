# Promo video prompt

The final prompt behind `out/ad.mp4`, reconstructed from the Claude Code session that produced it.
It evolved over many rounds (an Apple-style "premium" pass was scrapped); this is the consolidated
version that describes what shipped. Source: `video/Ad.tsx` + `video/music.py`.

```text
Make a dynamic 20-second motion graphics ad for Terminal Font Duel
(terminal-font-duel.muehl.io) that shows what an incredible motion designer you are,
like it's your showreel for a résumé. Go all out.

Build it in Remotion (React), 1920×1080, 60 fps, rendered to MP4. Use the 16 real Nerd Fonts
from the app (src/data/fonts.json) — show actual fonts, file size doesn't matter.

What the product is: a knockout quiz that helps you pick your terminal font. You see two fonts
side by side, pick left or right with the arrow keys, over and over, until one wins. All fonts
are Nerd Fonts installable with Homebrew. The point: find your favorite font by gut feel.

Tone: pain point first ("so many fonts, can't pick one"), then relief. Language is dead simple —
someone slightly drunk should get it at first glance. Max ~7 words on screen at once; viewers
read fast, so lines don't need to hold long. Premium feel, but keep things moving.

Script:
1. "So many terminal fonts."
2. "How do you pick one?"
3. "Left or right?"
4. "Pick by eye. Find your font."
5. End card: "Terminal Font Duel" /
   "Find your favorite terminal font by gut feel." /
   "16 Nerd Fonts · all installable with Homebrew · terminal-font-duel.muehl.io"

Storyboard:
- 0–1s: a terminal cursor blinks on black, then stretches into a full lime field.
- 1–3.5s: an endless tilted wall of "Aa" tiles scrolling in every font. "So many terminal fonts."
  slams in as black tape labels. Each letter gets its own fixed font — do NOT keep cycling
  fonts per frame, that looks epileptic.
- 3.25–5s: circle wipe to black; "How do you pick one?" rises word by word over a giant
  outlined spinning "?". "one?" slot-machines through fonts and lands on the winner.
- 5–10s: split-screen duels with big "Aa" in each font, "Left or right?" at the top, two 3D
  arrow keycaps at the bottom that physically press. Each press: screen shake + flash, the
  loser gets wiped away, a challenger pushes in. Rounds get faster each time. A "FONTS LEFT"
  counter top-right steps 16 → 8 → 4 → 2 → 1, one step per pick (not a fast countdown).
- 10–12s: zoom through the winner's "a" into black; "Pick by eye." / "Find your font." rise.
- 12–20s: end card — the title assembles letter by letter, each letter cycling fonts and
  settling on the winner, lime underline draws in. Hold it ~5 extra seconds so it's readable.
  Fade out to a lone blinking cursor so the video loops.
- Film grain + soft vignette over everything. Masked slide-up text reveals, snappy
  expo/bezier easing, a little overshoot on pops.

Music: copyright-free, synthesized in code (numpy → WAV) so it's ours. 120 BPM, every scene
cut and key press lands exactly on the beat grid shared with the video. Bassy with real thump
(heavy kick). One melody through the whole piece with an emotional arc matching the story:
a single motif in A minor while searching, the question left hanging, rising as a ladder
during the duels (each key press a higher peak), resolving to major when the font is found,
and a slow warm reprise on the end card. Not a new melody per slide.
```
