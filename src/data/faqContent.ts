import type { FaqItem } from './sectionsContent';

/**
 * Questions fréquentes par thème. Chaque liste est réutilisée sur la page
 * concernée ET sur la page « Questions fréquentes » qui les regroupe toutes.
 * ⚠️ Textes à relire par l'entreprise avant publication.
 */

export const FAQ_SERRURERIE: readonly FaqItem[] = [
  {
    id: 'serr-porte-claquee',
    popular: true,
    question: 'Ma porte est claquée : pouvez-vous l’ouvrir sans abîmer la serrure ?',
    answer:
      'Lorsque la porte est simplement claquée (non fermée à clé), nous privilégions une ouverture fine, sans dégradation. Si la serrure est verrouillée ou endommagée, nous vous expliquons les solutions possibles avant d’intervenir.',
  },
  {
    id: 'serr-changer-cylindre',
    question: 'Quand faut-il changer le cylindre de sa serrure ?',
    answer:
      'Après une perte ou un vol de clés, un emménagement, une tentative d’effraction ou lorsque la clé tourne mal. Changer le cylindre permet de retrouver la maîtrise de vos accès sans remplacer toute la serrure.',
  },
  {
    id: 'serr-blindage',
    question: 'Quelle différence entre un blindage de porte et une porte blindée ?',
    answer:
      'Le blindage renforce votre porte existante (plaque, serrure multipoints, cornières). La porte blindée, ou bloc-porte, remplace l’ensemble porte et cadre pour un niveau de protection supérieur. Nous vous conseillons selon votre porte et votre besoin.',
  },
  {
    id: 'serr-pros',
    question: 'Intervenez-vous pour les syndics, commerces et professionnels ?',
    answer:
      'Oui. Nous intervenons pour les particuliers comme pour les syndics, commerces et locaux professionnels : dépannage, entretien et réglage des serrures, mise en sécurité.',
  },
  {
    id: 'serr-devis',
    question: 'Un devis est-il établi avant l’intervention ?',
    answer:
      'Oui, un devis détaillé vous est présenté et validé avec vous avant la réalisation des travaux.',
  },
];

export const FAQ_VITRERIE: readonly FaqItem[] = [
  {
    id: 'vitr-bris',
    popular: true,
    question: 'Que faire juste après un bris de glace ?',
    answer:
      'Mettez-vous en sécurité et éloignez les éclats, prenez des photos des dégâts puis contactez-nous : nous assurons la mise en sécurité et, si besoin, une fermeture provisoire en attendant le remplacement.',
  },
  {
    id: 'vitr-double',
    question: 'Pouvez-vous remplacer un double vitrage sans changer la fenêtre ?',
    answer:
      'Dans de nombreux cas, oui : nous remplaçons le vitrage à l’identique (simple, double ou feuilleté) en conservant votre menuiserie, après prise de mesures.',
  },
  {
    id: 'vitr-vitrine',
    question: 'Intervenez-vous sur les vitrines de commerce ?',
    answer:
      'Oui, nous posons et remplaçons les vitrines commerciales et les verres de sécurité pour les commerçants et locaux professionnels.',
  },
  {
    id: 'vitr-miroir',
    question: 'Réalisez-vous des miroirs sur mesure ?',
    answer:
      'Oui, nous découpons et posons des miroirs sur mesure pour les logements et les locaux professionnels.',
  },
];

export const FAQ_MENUISERIE: readonly FaqItem[] = [
  {
    id: 'menu-materiaux',
    question: 'Quels matériaux proposez-vous pour les portes et fenêtres ?',
    answer:
      'Nous travaillons l’aluminium, le PVC, le bois et le métal. Nous vous orientons selon votre logement, votre budget et vos attentes en isolation et en entretien.',
  },
  {
    id: 'menu-reglage',
    popular: true,
    question: 'Ma fenêtre ferme mal : faut-il la changer ?',
    answer:
      'Pas forcément. Un réglage ou le remplacement de pièces de quincaillerie (crémone, paumelles) suffit souvent. Nous évaluons la situation avant de proposer un remplacement.',
  },
  {
    id: 'menu-isolation',
    question: 'Changer mes menuiseries améliore-t-il l’isolation ?',
    answer:
      'Des menuiseries récentes et bien posées améliorent l’isolation thermique et acoustique ainsi que l’étanchéité de vos ouvertures.',
  },
  {
    id: 'menu-sur-mesure',
    question: 'Vos portes et fenêtres sont-elles fabriquées sur mesure ?',
    answer:
      'Oui, nous fournissons et posons des portes d’entrée, fenêtres et portes-fenêtres sur mesure, adaptées à vos ouvertures.',
  },
];

export const FAQ_FERMETURES: readonly FaqItem[] = [
  {
    id: 'ferm-rideau-bloque',
    popular: true,
    question: 'Mon rideau métallique est bloqué : que faire ?',
    answer:
      'Évitez de le forcer, cela peut aggraver la panne. Contactez-nous : nous intervenons pour le dépannage et le déblocage des rideaux métalliques de commerces.',
  },
  {
    id: 'ferm-motorisation',
    question: 'Peut-on motoriser un volet ou un rideau existant ?',
    answer:
      'Dans de nombreux cas, oui. Nous étudions votre installation et vous proposons une motorisation adaptée, ou le remplacement si nécessaire.',
  },
  {
    id: 'ferm-garage',
    question: 'Quels types de portes de garage installez-vous ?',
    answer:
      'Nous posons et entretenons des portes de garage sectionnelles, basculantes et enroulables.',
  },
  {
    id: 'ferm-pieces',
    question: 'Remplacez-vous seulement les pièces usées ?',
    answer:
      'Oui : moteurs, lames, axes et commandes de sécurité peuvent être remplacés séparément lorsque c’est pertinent, sans changer toute la fermeture.',
  },
];

export const FAQ_CLES_BADGES: readonly FaqItem[] = [
  {
    id: 'cles-apporter',
    popular: true,
    question: 'Que dois-je apporter pour faire un double ?',
    answer: 'Apportez la clé ou le badge d’origine dans l’une de nos agences.',
  },
  {
    id: 'cles-securite',
    question: 'Pouvez-vous reproduire une clé de sécurité ?',
    answer:
      'Certaines clés de sécurité sont protégées par le fabricant : leur reproduction nécessite la carte de propriété et peut demander une commande. Nous vous indiquons la marche à suivre en boutique.',
  },
  {
    id: 'cles-badges-compat',
    question: 'Tous les badges peuvent-ils être copiés ?',
    answer:
      'Cela dépend de la technologie du badge. Nous vérifions la compatibilité de votre modèle en boutique avant toute reproduction.',
  },
  {
    id: 'cles-delai',
    question: 'Combien de temps faut-il pour obtenir un double ?',
    answer: 'Le délai dépend du modèle : nous vous l’indiquons en boutique après avoir vu votre original.',
  },
];

export const FAQ_APRES_SINISTRE: readonly FaqItem[] = [
  {
    id: 'sin-premiers-gestes',
    popular: true,
    question: 'Que faire juste après une effraction ?',
    answer:
      'Mettez-vous en sécurité, évitez de toucher aux traces, prenez des photos et prévenez les autorités ainsi que votre assureur. Appelez-nous ensuite pour sécuriser les accès.',
  },
  {
    id: 'sin-provisoire',
    question: 'Pouvez-vous sécuriser les lieux provisoirement ?',
    answer:
      'Oui, la mise en sécurité est notre première étape : nous rendons à nouveau vos accès fermables en attendant la réparation définitive.',
  },
  {
    id: 'sin-assurance',
    question: 'Fournissez-vous des documents pour mon assurance ?',
    answer:
      'Nous établissons un devis détaillé accompagné d’un reportage photo, utiles à votre déclaration de sinistre. Rapprochez-vous de votre assureur pour connaître sa procédure.',
  },
  {
    id: 'sin-photos',
    question: 'Puis-je vous envoyer des photos avant votre venue ?',
    answer:
      'Oui, vous pouvez nous envoyer des photos depuis le site : elles nous aident à préparer l’intervention.',
  },
];

export const FAQ_ZONE: readonly FaqItem[] = [
  {
    id: 'zone-secteurs',
    question: 'Dans quels secteurs intervenez-vous ?',
    answer:
      'Nous intervenons dans les arrondissements de Marseille ainsi que dans plusieurs communes voisines. Utilisez la vérification de secteur ou appelez-nous en cas de doute.',
  },
  {
    id: 'zone-hors-secteur',
    question: 'Mon adresse n’est pas dans la liste : pouvez-vous venir ?',
    answer: 'Contactez-nous : selon votre besoin et votre localisation, nous étudions votre demande.',
  },
  {
    id: 'zone-boutique',
    question: 'Puis-je venir directement en boutique ?',
    answer:
      'Oui, nos agences République (2e) et Rome (6e) vous accueillent pour vos doubles de clés et de badges et pour vos conseils.',
  },
];

/* ------------------------------------------------------------------ */
/* Professionnels                                                      */
/* ------------------------------------------------------------------ */

export const FAQ_PRO_GENERAL: readonly FaqItem[] = [
  {
    id: 'pro-demande',
    question: 'Comment nous transmettre une demande d’intervention ?',
    answer:
      'Par téléphone pour une urgence, ou via le formulaire « Devenir partenaire » / la demande de devis pour organiser une intervention. Précisez l’adresse, le besoin et la personne à contacter sur place.',
  },
  {
    id: 'pro-devis',
    question: 'Recevons-nous un devis avant l’intervention ?',
    answer: 'Oui, un devis détaillé est transmis et validé avant la réalisation des travaux.',
  },
  {
    id: 'pro-photos',
    question: 'Pouvez-vous fournir des photos de l’intervention ?',
    answer:
      'Oui, nous pouvons réaliser un reportage photo, notamment après un sinistre, pour faciliter le suivi du dossier.',
  },
  {
    id: 'pro-zone',
    question: 'Dans quels secteurs intervenez-vous pour les professionnels ?',
    answer:
      'Dans les arrondissements de Marseille et plusieurs communes voisines, depuis nos agences République (2e) et Rome (6e).',
  },
];

export const FAQ_PRO_SYNDICS: readonly FaqItem[] = [
  {
    id: 'syn-parties-communes',
    question: 'Intervenez-vous sur les parties communes ?',
    answer:
      'Oui : portes de hall, serrures et cylindres, ferme-portes, vitrages, portes de garage et fermetures collectives.',
  },
  {
    id: 'syn-badges',
    question: 'Pouvez-vous fournir des badges ou des clés pour les résidents ?',
    answer:
      'Nous reproduisons les clés et les badges compatibles, et vous conseillons sur l’organisation des accès de la copropriété.',
  },
  FAQ_PRO_GENERAL[1],
];

export const FAQ_PRO_ASSUREURS: readonly FaqItem[] = [
  {
    id: 'ass-securisation',
    question: 'Pouvez-vous sécuriser un logement avant le passage de l’expert ?',
    answer:
      'Oui, la mise en sécurité (fermeture provisoire, remplacement de cylindre) peut être réalisée rapidement ; les éléments endommagés et les photos sont conservés pour l’expertise.',
  },
  {
    id: 'ass-dossier',
    question: 'Quels documents fournissez-vous pour le dossier ?',
    answer: 'Un devis détaillé et un reportage photo, utiles à l’instruction du sinistre.',
  },
  FAQ_PRO_GENERAL[3],
];

export const FAQ_PRO_IMMOBILIER: readonly FaqItem[] = [
  {
    id: 'imm-relocation',
    question: 'Changez-vous les serrures entre deux locataires ?',
    answer:
      'Oui, nous remplaçons le cylindre ou la serrure pour que le nouveau locataire soit le seul à disposer des clés.',
  },
  {
    id: 'imm-doubles',
    question: 'Pouvez-vous préparer des jeux de clés ?',
    answer: 'Oui, nous réalisons les doubles de clés et de badges compatibles en boutique.',
  },
  FAQ_PRO_GENERAL[1],
];
