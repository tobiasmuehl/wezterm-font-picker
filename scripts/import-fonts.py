"""Import exact Homebrew-distributed regular faces, without installing fonts."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from datetime import date
import hashlib
import io
import json
import re
import urllib.request
import zipfile
import tarfile
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.font-cache'
CACHE.mkdir(exist_ok=True)
CHOICES = [
    ('jetbrains-mono', 'JetBrains Mono', 'JetBrainsMonoNerdFontMono-Regular.ttf'),
    ('fira-code', 'Fira Code', 'FiraCodeNerdFontMono-Regular.ttf'),
    ('caskaydia-cove', 'Caskaydia Cove', 'CaskaydiaCoveNerdFontMono-Regular.ttf'),
    ('hack', 'Hack', 'HackNerdFontMono-Regular.ttf'),
    ('iosevka', 'Iosevka', 'IosevkaNerdFontMono-Regular.ttf'),
    ('meslo-lg', 'Meslo LG', 'MesloLGMNerdFontMono-Regular.ttf'),
    ('sauce-code-pro', 'Source Code Pro', 'SauceCodeProNerdFontMono-Regular.ttf'),
    ('blex-mono', 'IBM Plex Mono', 'BlexMonoNerdFontMono-Regular.ttf'),
    ('mononoki', 'Mononoki', 'MononokiNerdFontMono-Regular.ttf'),
    ('victor-mono', 'Victor Mono', 'VictorMonoNerdFontMono-Regular.ttf'),
    ('0xproto', '0xProto', '0xProtoNerdFontMono-Regular.ttf'),
    ('commit-mono', 'Commit Mono', 'CommitMonoNerdFontMono-Regular.otf'),
    ('geist-mono', 'Geist Mono', 'GeistMonoNerdFontMono-Regular.otf'),
    ('roboto-mono', 'Roboto Mono', 'RobotoMonoNerdFontMono-Regular.ttf'),
    ('go-mono', 'Go Mono', 'GoMonoNerdFontMono-Regular.ttf'),
    ('monaspice', 'Monaspice Neon', 'MonaspiceNeNerdFontMono-Regular.otf'),
]
REQUIRED = set(range(32, 127)) | {0xf07c, 0xe725, 0xe0b0, 0xf00c, 0xf071}

def get(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'terminal-font-duel/0.1'})
    return urllib.request.urlopen(request, timeout=120)

def digest(data):
    return hashlib.sha256(data).hexdigest()

class TarArchive:
    def __init__(self, path):
        self.archive = tarfile.open(path)
    def __enter__(self):
        return self
    def __exit__(self, *args):
        self.archive.close()
    def namelist(self):
        return [m.name for m in self.archive.getmembers() if m.isfile()]
    def read(self, name):
        return self.archive.extractfile(name).read()

def load_face(archive, filename, key):
    path = next(n for n in archive.namelist() if Path(n).name == filename)
    raw = archive.read(path)
    font = TTFont(io.BytesIO(raw))
    cmap = font.getBestCmap()
    missing = REQUIRED - set(cmap)
    if missing:
        raise ValueError(f'{filename}: missing required glyphs {missing}')
    widths = {font['hmtx'][cmap[c]][0] for c in range(32, 127)}
    if len(widths) != 1:
        raise ValueError(f'{filename}: non-monospaced ASCII advances {widths}')
    family = font['name'].getDebugName(16) or font['name'].getDebugName(1)
    font_version = font['name'].getDebugName(5)
    font.flavor = 'woff2'
    output = io.BytesIO()
    font.save(output)
    web = output.getvalue()
    (ROOT / 'public/fonts' / f'{key}.woff2').write_bytes(web)
    return {'file': f'fonts/{key}.woff2', 'family': family, 'originalFile': filename,
            'originalSha256': digest(raw), 'sha256': digest(web), 'bytes': len(web),
            'fontVersion': font_version, 'weight': 400}

def collect(choice):
    key, label, filename = choice
    cask = f'font-{key}-nerd-font'
    api_url = f'https://formulae.brew.sh/api/cask/{cask}.json'
    with get(api_url) as response:
        metadata = json.load(response)
    if metadata.get('disabled') or metadata.get('deprecated'):
        raise ValueError(f'{cask} is no longer an active Homebrew cask')
    artifacts = [f for item in metadata['artifacts'] for f in item.get('font', []) if isinstance(f, str)]
    if filename not in artifacts:
        raise ValueError(f'{filename} is not in {cask}')
    checksum = metadata['sha256']
    if not re.fullmatch('[a-f0-9]{64}', checksum):
        raise ValueError(f'No pinned archive checksum for {cask}')
    archive_path = CACHE / f'{key}-{metadata["version"]}.zip'
    if not archive_path.exists() or digest(archive_path.read_bytes()) != checksum:
        print(f'Downloading {label}…', flush=True)
        with get(metadata['url']) as response, archive_path.open('wb') as output:
            while chunk := response.read(1024 * 1024):
                output.write(chunk)
    if digest(archive_path.read_bytes()) != checksum:
        raise ValueError(f'Archive checksum mismatch for {cask}')
    with (zipfile.ZipFile(archive_path) if zipfile.is_zipfile(archive_path) else TarArchive(archive_path)) as archive:
        face = load_face(archive, filename, key)
        licenses = []
        for name in archive.namelist():
            base = Path(name).name
            if not base or not any(word in base.lower() for word in ['license', 'copying', 'ofl', 'copyright']):
                continue
            path = ROOT / 'public/licenses' / key / base
            path.parent.mkdir(exist_ok=True, parents=True)
            path.write_bytes(archive.read(name))
            licenses.append(str(path.relative_to(ROOT / 'public')))
        if not licenses:
            raise ValueError(f'No license in {cask} archive')
        variants = []
        if key == 'jetbrains-mono':
            variants.append({'label': 'No-ligature face', **load_face(archive, 'JetBrainsMonoNLNerdFontMono-Regular.ttf', key + '-nl')})
    print(f'Ready: {label}, {face["bytes"] // 1024} KB, {face["family"]}', flush=True)
    return {'id': key, 'label': label, 'cask': cask, 'version': metadata['version'],
            'brewCommand': f'brew install --cask {cask}', 'source': api_url,
            'downloadUrl': metadata['url'], 'archiveSha256': checksum,
            'licenses': licenses, 'variants': variants, **face}

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=3) as pool:
        fonts = list(pool.map(collect, CHOICES))
    manifest = {'version': 1, 'checkedAt': str(date.today()), 'fonts': fonts}
    revision = digest(json.dumps(manifest, sort_keys=True).encode())[:16]
    manifest['revision'] = revision
    (ROOT / 'src/data/fonts.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Prepared {len(fonts)} font families plus JetBrains Mono NL; no fonts installed.', flush=True)
