"""Pose le vrai logo sur la poitrine du polo, façon broderie.
Usage : python logo_polo.py <image_source> <image_sortie> <x_centre> <y_centre> <largeur> <angle> [apercu.jpg]
Coordonnées en pixels de l'image source."""
import sys
from PIL import Image, ImageFilter, ImageEnhance, ImageStat

LOGO = 'C:/Users/hayko/Projects/GSP-Site-barre-mobile/src/assets/images/logo_republique_dark.png'
src, out, cx, cy, w, ang = sys.argv[1], sys.argv[2], *map(float, sys.argv[3:7])
apercu = sys.argv[7] if len(sys.argv) > 7 else None

im = Image.open(src).convert('RGB')
logo = Image.open(LOGO).convert('RGBA')
h = w * logo.height / logo.width
logo = logo.resize((int(w), int(h)), Image.LANCZOS)

# Lumière : on assombrit le logo autant que le tissu à cet endroit (polo à l'ombre = logo à l'ombre)
box = (int(cx - w / 2), int(cy - h / 2), int(cx + w / 2), int(cy + h / 2))
zone = im.crop(box).convert('L')
lum = ImageStat.Stat(zone).mean[0]          # luminance du tissu sous le logo
facteur = max(0.45, min(1.0, 0.55 + lum / 160))
rgb = ImageEnhance.Brightness(logo.convert('RGB')).enhance(facteur)
alpha = logo.getchannel('A').point(lambda a: int(a * 0.93))
logo = Image.merge('RGBA', (*rgb.split(), alpha))
logo = logo.filter(ImageFilter.GaussianBlur(0.6))  # aspect brodé, pas collé
logo = logo.rotate(ang, resample=Image.BICUBIC, expand=True)

base = im.convert('RGBA')
base.alpha_composite(logo, (int(cx - logo.width / 2), int(cy - logo.height / 2)))
base = base.convert('RGB')
base.save(out, quality=92)
if apercu:
    m = int(w * 2.2)
    base.crop((int(cx - m), int(cy - m * 0.8), int(cx + m), int(cy + m * 0.8))).save(apercu, quality=90)
print('ok', round(facteur, 2))
