# Messagerie de l'entreprise — état de référence

Mis à jour le 26/11/2026. **Hermes et Claude Code : lire ce fichier avant de toucher aux e-mails, à la signature ou à la zone DNS.**
Aucun mot de passe ici : ils sont chez le client (Gestionnaire de mots de passe Google) ou dans `~/.hermes/.env` sur le serveur.

## Les adresses

| Adresse | Type | Rôle |
|---|---|---|
| **contact@serrurerierepublique.fr** | Boîte OVH MX Plan, webmail Roundcube (mail.ovh.net) | Adresse principale. Reçoit les formulaires du site. **Jamais affichée sur le site.** |
| annuaires@serrurerierepublique.fr | Boîte OVH MX Plan | Comptes des annuaires. Hermes la lit en lecture seule (`~/bin/annuaires-mail`). |
| postmaster@serrurerierepublique.fr | Redirection | Adresse technique obligatoire, redirigée vers serrurerieextra13@gmail.com et gspserrurerie13@gmail.com. |

## Qui reçoit, qui envoie

| Messagerie | Reçoit contact@ ? | Envoie en tant que contact@ ? | Nom affiché |
|---|---|---|---|
| **Roundcube** (mail.ovh.net) | Oui (copie conservée sur OVH) | Oui | **Serrurerie de la République** |
| **Gmail** gspserrurerie13@gmail.com | Non | Oui, par défaut (SMTP ssl0.ovh.net:465 SSL) | Serrurerie République (choix du client, on garde) |
| **Hotmail / Outlook.com** serrurerierepublique@hotmail.fr | Oui (redirection OVH contact@ → Hotmail) | Non (Outlook.com web ne le permet pas) | — |

Pour répondre en tant que contact@ : Gmail ou Roundcube (ou l'application Outlook avec contact@ ajouté en IMAP).

## Anti-spam : les 3 protections (toutes OK le 26/11/2026)

Zone DNS OVH de serrurerierepublique.fr. **Ne supprimer aucun de ces enregistrements.**

| Protection | Rôle | Réglage |
|---|---|---|
| **SPF** | Dit quels serveurs ont le droit d'envoyer pour le domaine | TXT `@` : `v=spf1 include:mx.ovh.com -all` |
| **DKIM** | Signe chaque mail | Activé chez OVH (vert dans MX Plan) ; CNAME `ovhmo-selector-1._domainkey` et `ovhmo-selector-2._domainkey` |
| **DMARC** | Dit à Gmail/Outlook que le domaine est géré | TXT `_dmarc` : `v=DMARC1; p=none; adkim=r; aspf=r` (ajouté le 26/11/2026) |

Test du 26/11/2026 : mail envoyé depuis Roundcube vers Gmail → **spf=pass, dkim=pass, dmarc=pass**, arrivé en boîte de réception.
Plus tard : passer DMARC en `p=quarantine` (protège contre l'usurpation), **seulement après avoir vérifié** que les mails des formulaires du site (`public/api/demande.php`) passent aussi SPF/DKIM.

## Signature e-mail

- Images hébergées sur OVH dans **`www/signature/`** (logo + bandeau WhatsApp + page d'aperçu). **Ne jamais supprimer ce dossier** lors d'un envoi du site, sinon les signatures affichent des images cassées.
- Sources : `C:\Users\hayko\Projects\GSP\Signature_Republique_Gmail_Outlook_OVH\signature_mail_republique\final\` (copie identique dans `Projects\Signature_Republique_Gmail_Outlook_OVH\`). Mode d'emploi : `INSTALLATION.md`.

| Messagerie | Version installée |
|---|---|
| Gmail | **Fixe** 440 px, 3 colonnes (logo / numéros / coordonnées) + bandeau — `signature-fixe.html` |
| Roundcube | **Fixe** (même fichier) |
| Outlook.com | Adaptable — `signature-finale.html` (sa fenêtre est assez large ; Outlook retire les liens `tel:`) |

La version adaptable se repliait mal dans les fenêtres étroites (Gmail, Roundcube) : d'où la version fixe.
Numéros dans la signature : dépannage et WhatsApp 06 50 70 44 52, boutique 04 91 90 51 65. Le WhatsApp du site est 07 82 82 82 08 : à harmoniser si le client le confirme.
