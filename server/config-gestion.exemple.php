<?php
// Modèle de ~/config-gestion.php (sur OVH, au-dessus de www). Ne pas remplir à la main :
// le vrai fichier est créé par « npm run gestion:mot-de-passe » (server/prive/, jamais dans Git).
return [
    'mot_de_passe' => [
        'sel' => '(16 octets en hexadécimal)',
        'iterations' => 210000,
        'empreinte' => '(PBKDF2-SHA256 du mot de passe, 32 octets en hexadécimal)',
    ],
    'secret' => '(32 octets aléatoires en hexadécimal : signe le cookie de connexion)',
    'domaines_autorises' => ['www.serrurerierepublique.fr', 'serrurerierepublique.fr'],
];
