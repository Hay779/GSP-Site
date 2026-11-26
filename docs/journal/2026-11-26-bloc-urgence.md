# 2026-11-26 — Bloc « Dépannage en urgence » refait d'après la maquette du client (branche `claude/bloc-urgence`)

- Maquette du client : `Dépannage d’urgence à Marseille.png` (non versionnée, dossier du client).
- Textes (`src/data/sectionsContent.ts`, `URGENCY_CONFIG`, affiché sur l'accueil et la page Serrurerie) :
  - titre « Besoin d’une intervention à Marseille ? » (avant « Un problème de porte ? ») ;
  - sous-titre « Porte claquée, serrure endommagée ou accès à sécuriser : notre équipe intervient chez vous et dans vos locaux. » + **« Devis détaillé avant intervention. »** en gras (nouveau champ `subtitleStrong`) ;
  - cartes « Ouverture de porte » et « Mise en sécurité » (avant « Porte claquée » / « Porte forcée ») ;
  - engagements « Artisans basés à Marseille » (nouvelle icône `pin`), « Devis clair avant travaux », « Suivi après sinistre ». « Intervention rapide » retiré (cf. étude Tryba : ne pas promettre de délai).
- Photos : `urgence_ouverture_porte.webp` (photo HD fournie par le client, « Mains expertes sur une serrure anthracite ») ; carte 2 = photo existante `apres_sinistre_diagnostic`, recadrée pour montrer la cliente et le serrurier.
- Carte 1 : texture de pierre beige derrière le texte (`urgence_texture_pierre.webp`, découpée dans la photo du client, champ `textureSrc`), sur mobile, tablette et ordinateur.
- Ronds d'icône des cartes retirés **sur ce bloc seulement** (champ `hideCaseIcons`), à la demande du client (croix noires sur sa capture). Les autres pages (vitrerie, menuiserie, fermetures, clés) gardent leurs icônes et leurs textes : un essai de retrait partout a été annulé, le client ne le voulait pas.
- TypeScript, 100 tests, build : OK. Mis en ligne sur OVH.

## Pistes (non faites)
- Les blocs urgence des autres pages affichent encore « Intervention rapide » : à aligner si le client le souhaite.
