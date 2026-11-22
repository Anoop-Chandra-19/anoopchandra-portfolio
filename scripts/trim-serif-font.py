#!/usr/bin/env python3
"""Build the trimmed serif in app/fonts/ from Source Serif 4.

Google serves Source Serif 4 as variable fonts spanning weights 200-900 plus
the optical-size axis, ~125KB each for the Latin subset. The site sets the
serif at 400-700 upright and only 400 italic, so this keeps the opsz axis
(headings and body still get their optical sizes) and cuts the weight axis:
upright to 400-700, italic pinned at 400. Together that is about half the
bytes on every cold load.

Source Serif is under the SIL OFL with the Reserved Font Name "Source", and a
trimmed font is a modified version, so the output is renamed to Notebook
Serif and ships with the licence (app/fonts/OFL.txt). The copyright notice is
left as it is.

Needs fonttools and brotli (pip install fonttools brotli). Run from the repo
root; the outputs are committed.
"""

import io
import re
import urllib.request

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

CSS_URL = (
    "https://fonts.googleapis.com/css2?family=Source+Serif+4:"
    "ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap"
)
LICENSE_URL = "https://raw.githubusercontent.com/adobe-fonts/source-serif/release/LICENSE.md"
# Google picks the font format from the user agent; this one gets woff2.
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"

OUT_DIR = "app/fonts"
FAMILY = ("Source Serif 4", "Notebook Serif")
POSTSCRIPT = ("SourceSerif4", "NotebookSerif")
# Family, full, unique and PostScript names, typographic family/subfamily,
# WWS names and the variations PostScript prefix. The copyright (0) and
# licence (13, 14) entries are left alone.
RENAMED_NAME_IDS = {1, 3, 4, 6, 16, 17, 21, 22, 25}

STYLES = {
    "normal": ("NotebookSerif-Roman.woff2", {"wght": (400, 700)}),
    "italic": ("NotebookSerif-Italic.woff2", {"wght": 400}),
}


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request) as response:
        return response.read()


def find(pattern: str, text: str) -> str:
    match = re.search(pattern, text)
    if match is None:
        raise ValueError(f"{pattern!r} not found in Google's font CSS")
    return match.group(1)


def latin_urls(css: str) -> dict[str, str]:
    """Google's css2 response has one @font-face per subset, each preceded by
    a /* subset */ comment. Take the Latin one for each style."""
    urls = {}
    for subset, block in re.findall(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*{[^}]*})", css):
        if subset != "latin":
            continue
        urls[find(r"font-style:\s*(\w+)", block)] = find(r"url\(([^)]+)\)", block)
    return urls


def rename(font: TTFont) -> None:
    table = font["name"]
    for record in list(table.names):
        if record.nameID not in RENAMED_NAME_IDS:
            continue
        text = str(record).replace(*FAMILY).replace(*POSTSCRIPT)
        table.setName(text, record.nameID, record.platformID, record.platEncID, record.langID)
    remaining = [str(r) for r in font["name"].names if r.nameID in RENAMED_NAME_IDS and "Source" in str(r)]
    assert not remaining, f"reserved name left in the font: {remaining}"


def main() -> None:
    urls = latin_urls(fetch(CSS_URL).decode())
    for style, (filename, limits) in STYLES.items():
        source = fetch(urls[style])
        font = instancer.instantiateVariableFont(TTFont(io.BytesIO(source)), limits)
        rename(font)
        font.flavor = "woff2"
        font.save(f"{OUT_DIR}/{filename}")
        print(f"{filename}: {len(source):,} -> {len(open(f'{OUT_DIR}/{filename}', 'rb').read()):,} bytes")

    with open(f"{OUT_DIR}/OFL.txt", "wb") as licence:
        licence.write(fetch(LICENSE_URL))
    print("OFL.txt written")


if __name__ == "__main__":
    main()
