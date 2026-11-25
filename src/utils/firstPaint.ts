/**
 * Vrai quand la page arrive déjà pré-rendue (HTML complet envoyé par le serveur).
 * Dans ce cas, le haut de page est affiché tout de suite, sans animation d'entrée :
 * le visiteur (et Google, pour le LCP) voit le titre et la photo sans attendre le JavaScript.
 * Évalué au chargement du module, donc avant que React ne remplace le HTML pré-rendu.
 */
export const HAS_PRERENDERED_HTML: boolean =
  typeof document !== 'undefined' && (document.getElementById('root')?.children.length ?? 0) > 0;
