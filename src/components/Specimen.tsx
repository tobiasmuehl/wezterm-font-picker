import type { CSSProperties } from 'react';
import type { Palette } from '../core/palette';
const lines: [string, string][] = [
  ['prompt', '\uf07c ~/code/launch  \ue725 main  \ue0b0'],
  ['muted', '── TypeScript ───────────────────────────'],
  ['code', 'const ready = items.filter(x => x.ok);'],
  ['code', 'if (count !== 0) return { id: "O0l1" };'],
  ['muted', '── Go ───────────────────────────────────'],
  ['code', 'func sum(xs []int) (total int) {'],
  ['code', '  for _, x := range xs { total += x }'],
  ['code', '  return total'],
  ['code', '}'],
  ['muted', '── Python ───────────────────────────────'],
  ['code', 'def greet(name: str) -> str:'],
  ['code', '    return f"Hello, {name.lower()}!"'],
  ['muted', '── YAML / JSON ──────────────────────────'],
  ['code', 'deploy: { retries: 3, enabled: true }'],
  ['code', '{ "port": 8080, "paths": ["/api/v1"] }'],
  ['muted', '── git diff / logs ───────────────────────'],
  ['delete', '- const timeout = 5000;'],
  ['add', '+ const timeout = 1500;'],
  ['add', '\uf00c INFO  built in 128ms · 42 tests passed'],
  ['warn', '\uf071 WARN  retry=1/3 latency=204ms'],
  ['muted', '── Look closely ─────────────────────────'],
  ['code', '0O oO  1Il|!  2Z  5S  8B  rn m  cl d'],
  ['code', '.,:; \'"`  ()[]{}  <> <= >= != === =>'],
  ['code', 'abcdefghijklmnopqrstuvwxyz 0123456789'],
  ['code', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ @#$%&*~/\\'],
];
function tokens(line: string) {
  return line.split(/("[^"\n]*"|\b(?:const|if|return|func|for|range|def|str|int|true)\b|\b\d+\b)/g).map((part, i) =>
    <span key={i} className={part.startsWith('"') ? 'token-string' : /^(const|if|return|func|for|range|def|str|int|true)$/.test(part) ? 'token-keyword' : /^\d+$/.test(part) ? 'token-number' : undefined}>{part}</span>);
}
export function Specimen({ alias, palette, ligatures = false }: {alias: string; palette: Palette; ligatures?: boolean}) {
  const style = {background: palette.background, color: palette.foreground, fontFamily: `"${alias}"`, '--red': palette.ansi[1], '--green': palette.ansi[2], '--yellow': palette.ansi[3], '--blue': palette.ansi[4], '--magenta': palette.ansi[5], '--cyan': palette.ansi[6], fontVariantLigatures: ligatures ? 'normal' : 'none'} as CSSProperties;
  return <pre className="specimen" style={style} aria-label="Identical code and glyph sample">{lines.map(([kind, line], i) => <div className={`sample-line ${kind}`} key={i}>{kind === 'code' ? tokens(line) : line}</div>)}</pre>;
}
