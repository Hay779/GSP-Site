/**
 * llms.txt : fiche de présentation en texte simple pour les assistants IA
 * (ChatGPT, Claude, Perplexity, Gemini…), générée à partir des contenus du site.
 */
import { AGENCIES_CONFIG, BRANDS_CONFIG, DOMAINS_CONFIG, FAQ_CONFIG } from '../src/data/sectionsContent';
import { CURRENT_PROMOTION, isPromotionActive } from '../src/data/promotions';
import { SITE_URL, pathForRoute, seoForRoute } from '../src/utils/seo';
import type { PageId } from '../src/utils/router';

const PAGES: readonly PageId[] = [
  'cles-badges',
  'apres-sinistre',
  'professionnels',
  'pro-syndics',
  'pro-assureurs',
  'pro-immobilier',
  'zone-intervention',
  'agences-contact',
  'avis-clients',
  'questions-frequentes',
  'devis',
];

const link = (path: string, title: string, description: string) => `- [${title}](${SITE_URL}${path}) : ${description}`;

export function buildLlmsTxt(): string {
  const domains = DOMAINS_CONFIG.items.map((d) => {
    const seo = seoForRoute({ kind: 'domain', id: d.id });
    return link(seo.path, d.title, seo.description);
  });
  const pages = PAGES.map((id) => {
    const route = { kind: 'page', id } as const;
    const seo = seoForRoute(route);
    return link(pathForRoute(route), seo.title.split(' | ')[0], seo.description);
  });
  const agencies = AGENCIES_CONFIG.agencies.map(
    (a) => `- **${a.name}** (${a.districtLabel}) : ${a.addressLines.join(', ')} — tél. ${a.phoneDisplay} — ${a.hoursLabel}`
  );
  const faq = FAQ_CONFIG.items.map((q) => `### ${q.question}\n${q.answer}`);
  const promo = CURRENT_PROMOTION;
  // Offre en cours (uniquement pendant ses dates, au moment du build).
  const promoBlock = isPromotionActive(promo)
    ? `\n## Offre en cours : ${promo.name} (${promo.periodLabel.toLowerCase()})\n${promo.offers
        .map((o) => `- ${o.badge} — ${o.title} : ${o.summary}`)
        .join('\n')}\n- ${promo.conditions.join(' ')}\n- Détail : ${SITE_URL}/promotions\n`
    : '';

  return `# Serrurerie de la République — serrurier à Marseille

> Serrurier, vitrier, menuisier et spécialiste des fermetures à Marseille, avec deux boutiques : République (2e arrondissement) et Rome (6e arrondissement). Dépannage et ouverture de porte, changement de serrure, portes blindées, doubles de clés et badges, vitrerie, menuiserie, rideaux métalliques et volets, accompagnement après effraction ou bris de glace. Particuliers et professionnels (syndics, assureurs, agences immobilières).

## L'essentiel
- Téléphone : 04 91 90 51 65 (WhatsApp : 07 82 82 82 08)
- Zone : Marseille (tous arrondissements) et communes voisines
- Devis détaillé avant chaque intervention
- Note Google : 4,6/5 (30 avis)
- Société : SERRURERIE DE LA REPUBLIQUE, SARL — SIRET 106 157 118 00014

${promoBlock}
## Agences
${agencies.join('\n')}

## Marques sur lesquelles nous intervenons
${BRANDS_CONFIG.partners.map((p) => `${p.name} (${p.specialty.toLowerCase()})`).join(', ')}.

## Services
${domains.join('\n')}

## Pages utiles
${pages.join('\n')}

## Questions fréquentes
${faq.join('\n\n')}
`;
}
