"""Preserve Nerd Fonts' icon-set licenses from the matching upstream release."""
from pathlib import Path
import urllib.request
ROOT=Path(__file__).resolve().parents[1]
REV='b894ea7803af6aade63d60a4381e006098ec9c4d'
FILES=['LICENSE','license-audit.md','src/glyphs/codicons/LICENSE.txt','src/glyphs/font-awesome/LICENSE.txt','src/glyphs/materialdesign/LICENSE','src/glyphs/octicons/LICENSE','src/glyphs/pomicons/LICENSE','src/glyphs/powerline-extra/LICENSE','src/glyphs/powerline-symbols/LICENSE.txt','src/glyphs/weather-icons/OFL.txt']
for path in FILES:
    out=ROOT/'public/licenses/upstream'/path
    out.parent.mkdir(parents=True,exist_ok=True)
    with urllib.request.urlopen(f'https://raw.githubusercontent.com/ryanoasis/nerd-fonts/{REV}/{path}',timeout=60) as response:
        out.write_bytes(response.read())
with urllib.request.urlopen('https://www.apache.org/licenses/LICENSE-2.0.txt',timeout=60) as response:
    (ROOT/'public/licenses/APACHE-2.0.txt').write_bytes(response.read())
print('Saved root, icon-set, audit, and Apache notices.')
