import manifest from '../data/fonts.json';
export type Face = { file: string; family: string; weight: number };
export type Font = Face & { id: string; label: string; cask: string; version: string; brewCommand: string; source: string; licenses: string[]; variants: (Face & {label: string})[] };
export const fonts: Font[] = manifest.fonts;
export const revision = manifest.revision;
export const checkedAt = manifest.checkedAt;
const loads = new Map<string, Promise<string>>();
export function loadFont(face: Face): Promise<string> {
  const alias = `picker-${face.file.replace(/[^a-z0-9]/gi, '-')}`;
  if (!loads.has(alias)) {
    const font = new FontFace(alias, `url("${import.meta.env.BASE_URL}${face.file}")`, { weight: '400', style: 'normal' });
    const promise = font.load().then(loaded => {
      if (loaded.status !== 'loaded') throw new Error('Font not loaded');
      document.fonts.add(loaded);
      return alias;
    }).catch(error => { loads.delete(alias); throw error; });
    loads.set(alias, promise);
  }
  return loads.get(alias)!;
}
