<?php
/**
 * Modèle des réglages des formulaires.
 * Copier sur OVH sous le nom ~/config-formulaires.php (à côté du dossier www, PAS dedans).
 * Ne jamais mettre le vrai fichier dans Git.
 */
return [
    // Adresse qui reçoit les demandes (jamais affichée sur le site).
    'destinataire' => 'contact@exemple.fr',
    // Expéditeur des mails : une adresse du domaine du site.
    'expediteur' => 'site@exemple.fr',
    // Seuls ces sites peuvent envoyer des demandes.
    'domaines_autorises' => ['exemple.fr', 'www.exemple.fr'],
    // Plus tard : adresse du serveur de l'entreprise qui enregistre les demandes en base.
    // Vide = pas de transmission. Le serveur vérifie l'en-tête X-Signature (HMAC SHA-256).
    'webhook_url' => '',
    'webhook_secret' => '',
];
