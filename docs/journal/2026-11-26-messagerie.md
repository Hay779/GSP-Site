# 2026-11-26 — Messagerie : récapitulatif, anti-spam, signature
- Nouveau fichier **`docs/MESSAGERIE.md`** : état de référence de toute la messagerie (adresses, qui reçoit et qui envoie, SPF/DKIM/DMARC, signature). Référencé dans `CLAUDE.md`.
- **Anti-spam** : DMARC ajouté (`_dmarc` TXT `v=DMARC1; p=none; adkim=r; aspf=r`). SPF et DKIM étaient déjà OK. Test Roundcube → Gmail : spf, dkim et dmarc = pass, arrivé en boîte de réception.
- **Roundcube** : nom d'expéditeur réglé sur « Serrurerie de la République » (avant : « contact »). Gmail garde « Serrurerie République » (choix du client).
- **Signature** : version fixe 440 px dans Gmail et Roundcube ; Outlook garde la version adaptable.

## Pour Hermes
- Avant toute action sur les e-mails, la signature ou la zone DNS : lire `docs/MESSAGERIE.md`.
- Ne jamais supprimer les enregistrements DNS SPF, DKIM (`ovhmo-selector-1/2._domainkey`), `_dmarc`, ni le TXT google-site-verification, ni le dossier `www/signature/` sur OVH.
- Si un client ou un annuaire signale des mails de contact@ en spam : vérifier d'abord les en-têtes (spf/dkim/dmarc) avant de changer quoi que ce soit.
