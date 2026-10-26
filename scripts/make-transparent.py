# Run on any new line-art PNG dropped into /public: turns near-white paper into alpha so the
# sprite works on both light and dark backgrounds.  usage: python3 scripts/make-transparent.py public/foo.png
import sys
from PIL import Image, ImageOps
for p in sys.argv[1:]:
    im = Image.open(p).convert('RGB')
    lum = ImageOps.grayscale(im)
    alpha = ImageOps.invert(lum).point(lambda v: 0 if v < 18 else min(255, int((v - 18) * 255 / 237)))
    out = Image.new('RGBA', im.size, (0, 0, 0, 0)); out.putalpha(alpha); out.save(p, optimize=True)
    print('ok', p)
