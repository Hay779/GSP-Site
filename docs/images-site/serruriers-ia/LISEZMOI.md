# Les serruriers des images du site (créés par IA)

Deux jeunes serruriers choisis par le client le 26/11/2026 (parmi 4 propositions, voir `choix-des-4-looks.jpg`).
**Réutiliser ces descriptions mot pour mot** pour toute nouvelle image, afin que ce soient toujours les mêmes personnes.

| | Portrait | Utilisé sur |
|---|---|---|
| **Serrurier A** (méditerranéen, cheveux ondulés) | `serrurier-A-portrait.jpg` | Professionnels : Syndics, Agences |
| **Serrurier D** (châtain, décontracté, yeux bleus) | `serrurier-D-portrait.jpg` | Professionnels : Assureurs, Partenaire |

Tatouages : motifs seulement, **jamais de lettres** (l'IA invente des mots bizarres). Polo bleu marine uni, sans logo.
Les autres photos du site (accueil, urgence, après sinistre, vitrerie…) montrent encore l'ancien serrurier aux cheveux gris : à remplacer seulement si le client le demande.

## Descriptions (anglais, pour l'outil d'images)

Serrurier A :
> a handsome young French locksmith around 30, Mediterranean look, dark brown medium-length wavy hair swept back, three-day stubble beard, tanned skin, dark eyes, ornamental tattoos (patterns only, no letters or words) on his forearms, wearing a plain fitted navy blue polo shirt

Serrurier D :
> a handsome young French locksmith around 30, light brown hair slightly longer on top with a messy textured style, light stubble, blue eyes, relaxed friendly vibe, ornamental tattoos (patterns only, no letters or words) on his forearms, wearing a plain fitted navy blue polo shirt

Style commun à ajouter à la fin de chaque description :
> Photorealistic editorial photograph, natural warm late-afternoon light, soft shadows,  Marseille, France, light limestone architecture, shot on a full-frame camera, 35mm lens,  shallow depth of field, realistic skin and hands, no text, no logos, no readable signs, no watermark.

## Outil utilisé

- fal.ai, modèle **FLUX 1.1 pro ultra** (`fal-ai/flux-pro/v1.1-ultra`), format 16:9, environ 0,06 € l'image, sortie 2752 × 1536 px. Le site utilise une version 1600 px en WebP + JPG.
- Scripts : `outils/fal_gen.py` (les 4 scènes Professionnels) et `outils/fal_portraits.py` (les portraits). La clé fal.ai n'est **jamais** dans ces fichiers : elle est donnée au moment de lancer, par la variable `FAL_KEY`.
- Méthode qui a marché : préciser « exactly two people, nobody in the foreground », décrire l'action des mains (clés tenues dans la main, pas en l'air), regarder chaque image avant de l'utiliser et refaire celles qui ont un défaut.
