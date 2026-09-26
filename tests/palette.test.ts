import { describe, it, expect } from 'vitest';
import { validatePalette, fontConfig } from '../src/core/palette';
import palette from '../src/data/palette.json';
import manifest from '../src/data/fonts.json';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
describe('palette and exports', () => {
  it('accepts a complete palette and rejects malformed CSS', () => {
    expect(validatePalette(palette)).toEqual(palette);
    expect(validatePalette({...palette,background:'url(https://example.com)'})).toBeNull();
    expect(validatePalette({...palette,ansi:['#ffffff']})).toBeNull();
    expect(validatePalette({...palette,name:'x'.repeat(201)})).toBeNull();
  });
  it('exports literal, escaped WezTerm family names and explicit ligature settings', () => {
    expect(fontConfig('JetBrainsMono Nerd Font Mono')).toContain('wezterm.font("JetBrainsMono Nerd Font Mono")');
    expect(fontConfig('a"b\\c\n')).toContain('"a\\"b\\\\c\\n"');
    expect(fontConfig('A',true)).toContain('harfbuzz_features = {}');
  });
});
describe('bundled font integrity', () => {
  it('ships 16 families and JetBrains standard and NL faces, all via Homebrew', () => {
    expect(manifest.fonts).toHaveLength(16);
    expect(new Set(manifest.fonts.map(f=>f.id)).size).toBe(16);
    const jet=manifest.fonts.find(f=>f.id==='jetbrains-mono')!;
    expect(jet.family).toBe('JetBrainsMono Nerd Font Mono');
    expect(jet.variants[0].family).toBe('JetBrainsMonoNL Nerd Font Mono');
    for(const font of manifest.fonts) {
      expect(font.brewCommand).toBe(`brew install --cask ${font.cask}`);
      expect(font.licenses.length).toBeGreaterThan(0);
      for(const license of font.licenses)expect(existsSync(`public/${license}`)).toBe(true);
      for(const face of [font,...font.variants]) {
        const data=readFileSync(`public/${face.file}`);
        expect(data.subarray(0,4).toString()).toBe('wOF2');
        expect(createHash('sha256').update(data).digest('hex')).toBe(face.sha256);
      }
    }
  });
});
