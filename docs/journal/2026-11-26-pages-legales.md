# 2026-11-26 — Pages légales complètes + page CGV

Branche : `claude/pages-legales` (non fusionnée dans main).

## Fait
- `mentions-legales` complétée : activité et assurance (RC pro Allianz, France, sans numéro ni adresse), SIREN, mobile/WhatsApp, responsabilité, liens hypertextes, droit applicable.
- `confidentialite` réécrite : responsable, finalités et bases légales, durées de conservation, destinataires, droits, sécurité, rappel sous 24 h. Section cookies / Google Analytics conservée (elle décrit la réalité du site).
- Nouvelle page `cgv` (21 articles, texte validé par le client le 25/11/2026), lien « CGV » dans le pied de page, `noindex` comme les autres pages légales.

## À faire avant la mise en ligne
- Médiateur de la consommation : adhésion à signer (CM2C proposé). L'article 20 dit pour l'instant que les coordonnées sont communiquées sur demande et sur les devis ; ajouter le nom une fois l'adhésion signée.
- Relecture des CGV (art. 5, 6, 12, 13, 15 à 18) par un avocat ou le comptable.
- Case « J'ai lu les CGV » sous le formulaire de devis (non faite : formulaires non branchés avant OVH).
- Adresse e-mail non affichée sur le site (règle CLAUDE.md).
- Build non lancé dans cette session (node_modules Windows) : lancer `npm run lint` et `npm run build:prod`.
