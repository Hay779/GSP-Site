"""4 portraits du serrurier pour choisir le look. Clé lue dans la variable FAL_KEY."""
import json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

AUTH = 'Key ' + os.environ['FAL_KEY']
BASE = ("Photorealistic editorial portrait photograph, waist-up, of a handsome young French locksmith around 30 years old, {look}, "
        "friendly confident smile, visible tattoos on his forearms, wearing a plain fitted navy blue polo shirt, arms crossed, "
        "standing in a traditional locksmith shop with a wall of key blanks softly blurred behind him, warm natural light, "
        "35mm lens, shallow depth of field, realistic skin, no text, no logos.")
LOOKS = {
 'A': "Mediterranean look, dark brown medium-length wavy hair swept back, three-day stubble, tanned skin, dark eyes",
 'B': "short natural dark curly hair, clean-shaven, soft friendly face, brown eyes",
 'C': "classic short dark brown hair neatly side-parted with no fade, short well-groomed full beard, light green eyes",
 'D': "light brown slightly longer hair on top, messy textured style, light stubble, blue eyes, relaxed surfer vibe",
}

def gen(k):
    body = json.dumps({"prompt": BASE.format(look=LOOKS[k]), "aspect_ratio": "3:4", "output_format": "jpeg",
                       "num_images": 1, "enable_safety_checker": True, "safety_tolerance": "2"}).encode()
    req = urllib.request.Request('https://fal.run/fal-ai/flux-pro/v1.1-ultra', data=body,
                                 headers={'Authorization': AUTH, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=300) as r:
        url = json.load(r)['images'][0]['url']
    urllib.request.urlretrieve(url, os.path.join(sys.argv[1], f'look_{k}.jpg'))
    return k

os.makedirs(sys.argv[1], exist_ok=True)
with ThreadPoolExecutor(4) as ex:
    for k in ex.map(gen, LOOKS):
        print(k, 'ok')

from PIL import Image, ImageDraw, ImageFont
ims = [Image.open(os.path.join(sys.argv[1], f'look_{k}.jpg')).resize((420, 560)) for k in LOOKS]
sheet = Image.new('RGB', (4 * 430 + 10, 620), 'white')
d = ImageDraw.Draw(sheet)
try:
    f = ImageFont.truetype('arial.ttf', 40)
except OSError:
    f = ImageFont.load_default()
for i, (k, im) in enumerate(zip(LOOKS, ims)):
    sheet.paste(im, (10 + i * 430, 50))
    d.text((10 + i * 430 + 190, 2), k, fill='black', font=f)
sheet.save(os.path.join(sys.argv[1], 'choix-look.jpg'), quality=85)
