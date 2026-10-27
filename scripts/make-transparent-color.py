# Colour-preserving version: near-white paper becomes alpha, ink and colour stay.
# usage: python3 scripts/make-transparent-color.py in.png out.png
import sys
import numpy as np
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255.0
# alpha = how far the pixel is from white (max channel distance), with a soft knee
a = 1.0 - im.min(axis=2)
a = np.clip((a - 0.04) / 0.96, 0, 1)
# un-premultiply against white so edges don't go grey: c = (p - (1-a)) / a
rgb = np.where(a[..., None] > 0.01, (im - (1 - a)[..., None]) / np.maximum(a[..., None], 0.01), 0)
rgb = np.clip(rgb, 0, 1)
out = np.dstack([rgb, a])
Image.fromarray((out * 255).round().astype(np.uint8), 'RGBA').save(dst, optimize=True)
print('ok', dst)
