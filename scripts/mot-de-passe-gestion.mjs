#!/usr/bin/env node
/**
 * Crée le fichier de réglages de l'espace gestion (/gestion) à partir d'un mot de passe
 * que VOUS tapez (il n'est jamais affiché ni enregistré : seule son empreinte l'est).
 *
 *   npm run gestion:mot-de-passe
 *
 * Résultat : server/prive/config-gestion.php (jamais dans Git), à envoyer sur OVH
 * sous le nom ~/config-gestion.php (au-dessus du dossier www).
 * Pour changer le mot de passe : relancer la commande et renvoyer le fichier
 * (toutes les connexions en cours sont alors fermées).
 */
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';

const ITERATIONS = 210000;
const LONGUEUR_MIN = 10;
const sortie = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'server', 'prive', 'config-gestion.php');

function demanderCache(question) {
  return new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let masque = false;
    rl._writeToOutput = (texte) => {
      if (!masque) rl.output.write(texte);
      else if (texte.includes('\n') || texte.includes('\r')) rl.output.write('\n');
      else rl.output.write('*'.repeat(texte.length));
    };
    rl.question(question, (reponse) => {
      rl.close();
      res(reponse);
    });
    masque = true;
  });
}

const mdp = await demanderCache('Mot de passe de l’espace gestion : ');
if (mdp.length < LONGUEUR_MIN) {
  console.error(`\nTrop court : au moins ${LONGUEUR_MIN} caractères. Rien n’a été créé.`);
  process.exit(1);
}
const confirmation = await demanderCache('Retapez-le pour confirmer : ');
if (confirmation !== mdp) {
  console.error('\nLes deux mots de passe sont différents. Rien n’a été créé.');
  process.exit(1);
}

const sel = randomBytes(16);
const empreinte = pbkdf2Sync(mdp, sel, ITERATIONS, 32, 'sha256').toString('hex');
const secret = randomBytes(32).toString('hex');
const contenu = `<?php
// Espace gestion — généré le ${new Date().toLocaleString('fr-FR')} par scripts/mot-de-passe-gestion.mjs.
// À placer sur OVH : ~/config-gestion.php (au-dessus de www). Ne jamais mettre dans Git.
return [
    'mot_de_passe' => [
        'sel' => '${sel.toString('hex')}',
        'iterations' => ${ITERATIONS},
        'empreinte' => '${empreinte}',
    ],
    'secret' => '${secret}',
    'domaines_autorises' => ['www.serrurerierepublique.fr', 'serrurerierepublique.fr'],
];
`;
mkdirSync(dirname(sortie), { recursive: true });
writeFileSync(sortie, contenu, { mode: 0o600 });
console.log(`\nC’est prêt : ${sortie}\nDites à Claude Code « envoie le fichier de l’espace gestion » pour le mettre sur OVH.`);
