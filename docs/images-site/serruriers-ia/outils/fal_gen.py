"""Génère les images des pages Professionnels avec fal.ai (FLUX 1.1 pro ultra).
Usage : python fal_gen.py <dossier_sortie> [nom ...]
La clé est lue dans C:/Users/hayko/fal-key.txt (ligne « Authorization: Key ... »), jamais affichée."""
import json, sys, urllib.request, os

KEY_LINE = ('Authorization: Key ' + os.environ['FAL_KEY']) if os.environ.get('FAL_KEY') else open('C:/Users/hayko/fal-key.txt', encoding='utf-8').read().strip()
AUTH = KEY_LINE.split(':', 1)[1].strip()  # « Key xxx »

STYLE = ("Photorealistic editorial photograph, natural warm late-afternoon light, soft shadows, "
         "Marseille, France, light limestone architecture, shot on a full-frame camera, 35mm lens, "
         "shallow depth of field, realistic skin and hands, no text, no logos, no readable signs, no watermark.")
LOOK_A = "a handsome young French locksmith around 30, Mediterranean look, dark brown medium-length wavy hair swept back, three-day stubble beard, tanned skin, dark eyes, ornamental tattoos (patterns only, no letters or words) on his forearms, wearing a plain fitted navy blue polo shirt"
LOOK_D = "a handsome young French locksmith around 30, light brown hair slightly longer on top with a messy textured style, light stubble, blue eyes, relaxed friendly vibe, ornamental tattoos (patterns only, no letters or words) on his forearms, wearing a plain fitted navy blue polo shirt"
CRAFTSMAN = LOOK_A

PROMPTS = {
 'pro_syndics': (f"{CRAFTSMAN} adjusting with a screwdriver the lock of the large black wrought-iron and glass entrance door "
                 "of an old Haussmann-style apartment building in Marseille, light cut-stone facade with wrought-iron balconies above, "
                 "the door slightly open, clean sidewalk, medium shot showing the whole door and the craftsman, subject slightly right of center. " + STYLE),
 'pro_assureurs': (f"{LOOK_D} photographing with a tablet a damaged apartment door lock after a burglary attempt (splintered wood around the lock), "
                   "next to him an insurance loss adjuster in a light blue shirt taking notes on a clipboard, bright stairwell landing of an old Marseille building, "
                   "medium shot, both people visible, calm professional atmosphere. " + STYLE),
 'pro_immobilier': (f"Exactly two people standing side by side, medium shot. {CRAFTSMAN} points at a brand-new lock he has just installed on the open entrance door "
                    "of an empty bright renovated apartment in Marseille, next to him a smiling female real estate agent in her thirties wearing a grey blazer "
                    "holds a ring of new keys firmly in her hand and looks at the lock, parquet floor and tall windows in the background. " + STYLE),
 'pro_partenaire': (f"Exactly two people, both fully visible, nobody in the foreground. {LOOK_D} stands behind the counter of a traditional locksmith shop "
                    "and shakes hands over the counter with a business professional in a navy blazer seen in three-quarter profile, "
                    "wall of key blanks and key-cutting machines behind them, warm shop lighting, friendly partnership atmosphere, medium shot. " + STYLE),
}

def gen(name, out):
    body = json.dumps({"prompt": PROMPTS[name], "aspect_ratio": "16:9", "output_format": "jpeg",
                       "num_images": 1, "enable_safety_checker": True, "safety_tolerance": "2", "raw": False}).encode()
    req = urllib.request.Request('https://fal.run/fal-ai/flux-pro/v1.1-ultra', data=body,
                                 headers={'Authorization': AUTH, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=300) as r:
        res = json.load(r)
    img = res['images'][0]
    path = os.path.join(out, name + '.jpg')
    urllib.request.urlretrieve(img['url'], path)
    print(name, img.get('width'), img.get('height'), 'ok')

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
for n in (sys.argv[2:] or PROMPTS):
    try:
        gen(n, out)
    except Exception as e:
        print(n, 'ERREUR', type(e).__name__, str(e)[:200])
