import fallback from '../data/palette.json';
export type Palette = { name: string; background: string; foreground: string; ansi: string[]; brights: string[] };
export function validatePalette(value: unknown): Palette | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Palette;
  const color = (c: unknown) => typeof c === 'string' && /^#[\da-f]{6}$/i.test(c);
  if (typeof p.name !== 'string' || !p.name.trim() || p.name.length > 200 || !color(p.background) || !color(p.foreground) || ![p.ansi, p.brights].every(a => Array.isArray(a) && a.length === 8 && a.every(color))) return null;
  return {name: p.name, background: p.background, foreground: p.foreground, ansi: [...p.ansi], brights: [...p.brights]};
}
export function readPalette(): Palette {
  try {
    const encoded = new URLSearchParams(location.hash.slice(1)).get('palette');
    if (encoded && encoded.length < 4000) {
      const p = validatePalette(JSON.parse(encoded));
      if (p) { try { localStorage.setItem('wezterm-font-picker.palette', JSON.stringify(p)); } catch {} return p; }
    }
  } catch {}
  try { return validatePalette(JSON.parse(localStorage.getItem('wezterm-font-picker.palette') || 'null')) || fallback; } catch { return fallback; }
}
export function fontConfig(family: string, ligatures = false) {
  const lua = '"' + family.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
  return `config.font = wezterm.font(${lua})\nconfig.font_size = 13.0\nconfig.harfbuzz_features = ${ligatures ? '{}' : '{ "calt=0", "clig=0", "liga=0" }'}`;
}
