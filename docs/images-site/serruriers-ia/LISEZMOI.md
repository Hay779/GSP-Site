# Les serruriers des images du site (créés par IA)

Deux jeunes serruriers choisis par le client le 26/11/2026 (parmi 4 propositions, voir `choix-des-4-looks.jpg`).
**Réutiliser ces descriptions mot pour mot** pour toute nouvelle image, afin que ce soient toujours les mêmes personnes.

| | Portrait | Utilisé sur |
|---|---|---|
| **Serrurier A** (méditerranéen, cheveux ondulés) | `serrurier-A-portrait.jpg` | Professionnels : Syndics, Agences |
| **Serrurier D** (châtain, décontracté, yeux bleus) | `serrurier-D-portrait.jpg` | Professionnels : Assureurs, Partenaire |

Tatouages : motifs seulement, **jamais de lettres** (l'IA invente des mots bizarres). Polo bleu marine uni, sans logo.
**Les autres photos du site (accueil, vitrerie, menuiserie, après sinistre…) restent les photos d'origine** : le 26/11/2026, le client a vu ces images refaites avec A et D (et logo sur le polo) et **les a refusées** (« ça ne me plaît pas »). Ne pas les reproposer sans demande du client.

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

## Logo sur le polo (décision du 26/11/2026)

- Les serruriers portent le **vrai logo** « Serrurerie de la République » sur la poitrine gauche du polo (côté droit de l'image quand il est de face), à côté des boutons, jamais dessus.
- L'IA ne sait pas écrire un logo : on génère un polo **uni** (« completely plain navy blue polo shirt with a blank chest »), puis on pose le logo avec `outils/logo_polo.py` (`python logo_polo.py source.jpg sortie.jpg x y largeur angle apercu.jpg`, coordonnées en pixels de l'image d'origine 2752 × 1536 ; largeur d'environ 110 à 170 px selon la taille du torse). Toujours vérifier l'aperçu en gros plan.
- Images en ligne avec A ou D (logo posé) : **Professionnels seulement** (assureurs, agences, partenaire). Syndics : gros plan des mains sans tatouages, sans visage (pas de logo visible). Les essais pour l'accueil, la vitrerie, la menuiserie et l'après-sinistre ont été refusés par le client.
- `outils/fal_site.py` : essais (refusés) pour 4 images du site ; utile seulement pour la méthode (prompts « candid », il ne regarde pas l'objectif).
