"""Images du site avec les serruriers A et D. Clé : variable FAL_KEY."""
import json, os, sys, re, urllib.request
from concurrent.futures import ThreadPoolExecutor
src = open(os.path.join(os.path.dirname(__file__), 'fal_gen.py'), encoding='utf-8').read()
LOOK_A = re.search(r'LOOK_A = "([^"]+)"', src).group(1).replace('wearing a plain fitted navy blue polo shirt', 'wearing a completely plain fitted navy blue polo shirt with a blank chest, no print')
LOOK_D = re.search(r'LOOK_D = "([^"]+)"', src).group(1).replace('wearing a plain fitted navy blue polo shirt', 'wearing a completely plain fitted navy blue polo shirt with a blank chest, no print')
STYLE = ("Photorealistic editorial photograph, natural warm light, soft shadows, Marseille, France, light limestone architecture, "
         "35mm lens, shallow depth of field, realistic hands with five fingers, candid documentary moment: he does NOT look at the camera, he is focused on his work with his eyes on his hands or on the person he talks to, "
         "seen from a slight three-quarter front angle so the left side of his polo chest stays visible, no text, no logos, no readable signs, no watermark.")
P = {
 'hero_serrurier': f"{LOOK_A} kneeling beside the open dark green entrance door of a Marseille townhouse, replacing the lock cylinder with a screwdriver, "
                   "behind him in the soft-focus background, inside a sunny courtyard with olive trees and potted plants, "
                   "a woman in a beige sweater watches calmly. Medium shot, he is on the right third of the frame. " + STYLE,
 'domaine_vitrerie': f"{LOOK_D} wearing grey work gloves, installing a new large glass window pane on the front of a small boutique "
                     "in a sunny pedestrian street of old Marseille with cafe terraces in the background, he carefully guides the edge of the glass into the frame, "
                     "focused on his work, side three-quarter view, medium shot. " + STYLE,
 'domaine_menuiserie': f"{LOOK_A} adjusting the hinge of a tall white wooden French window in a bright Haussmann-style apartment in Marseille, "
                       "rooftops of Marseille visible outside, toolbox on the parquet floor, medium shot. " + STYLE,
 'apres_sinistre_diagnostic': f"Exactly two people facing each other in conversation: {LOOK_D} holds a tablet and points at the screen while explaining, "
                              "and a woman in her forties wearing a beige sweater listens and looks at the tablet, both seen in profile three-quarters, "
                              "next to a dark green apartment door with splintered wood around its forced lock, stone courtyard of a Marseille building, medium shot. " + STYLE,
}
def gen(name):
    body = json.dumps({"prompt": P[name], "aspect_ratio": "16:9", "output_format": "jpeg", "num_images": 1,
                       "enable_safety_checker": True, "safety_tolerance": "2"}).encode()
    req = urllib.request.Request('https://fal.run/fal-ai/flux-pro/v1.1-ultra', data=body,
                                 headers={'Authorization': 'Key ' + os.environ['FAL_KEY'], 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=300) as r:
        url = json.load(r)['images'][0]['url']
    urllib.request.urlretrieve(url, os.path.join(sys.argv[1], name + '.jpg')); return name
os.makedirs(sys.argv[1], exist_ok=True)
names = sys.argv[2:] or list(P)
with ThreadPoolExecutor(4) as ex:
    for n in ex.map(gen, names): print(n, 'ok')
from PIL import Image
ims = [Image.open(os.path.join(sys.argv[1], n + '.jpg')).resize((688, 384)) for n in P]
sheet = Image.new('RGB', (688 * 2 + 30, 384 * 2 + 30), 'white')
for i, im in enumerate(ims): sheet.paste(im, (10 + (i % 2) * 698, 10 + (i // 2) * 394))
sheet.save(os.path.join(sys.argv[1], 'planche.jpg'), quality=85)
