# Blur every occurrence of a word in a screenshot (OCR at 2x for recall), then re-check. usage: python3 scripts/scrub-name.py WORD file...
import sys, subprocess, csv, io
from PIL import Image, ImageFilter
word = sys.argv[1].lower()
def boxes(im, scale):
    big = im.resize((im.width*scale, im.height*scale), Image.LANCZOS)
    tsv = subprocess.run(['tesseract','stdin','-','--psm','11','tsv'], input=big.convert('RGB').tobytes() if False else None, capture_output=True) if False else None
    big.save('/tmp/_ocr.png')
    out = subprocess.run(['tesseract','/tmp/_ocr.png','-','--psm','11','tsv'], capture_output=True, text=True).stdout
    bx = []
    for r in csv.DictReader(io.StringIO(out), delimiter='\t', quoting=csv.QUOTE_NONE):
        if r.get('text') and word in r['text'].lower():
            l,t,w,h = (int(r[k])//scale for k in ('left','top','width','height'))
            bx.append((l,t,w,h))
    return bx
for p in sys.argv[2:]:
    im = Image.open(p).convert('RGB'); total = 0
    for rnd in range(3):
        bx = boxes(im,1) + boxes(im,2)
        if not bx: break
        for l,t,w,h in bx:
            pad = max(4, h//2)
            box = (max(0,l-pad), max(0,t-pad), min(im.width,l+w+pad), min(im.height,t+h+pad))
            region = im.crop(box).filter(ImageFilter.GaussianBlur(radius=max(6,h)))
            im.paste(region, box); total += 1
    im.save(p, optimize=True)
    left = boxes(im,1)+boxes(im,2)
    print(f'{p}: blurred {total}, remaining {len(left)}')
