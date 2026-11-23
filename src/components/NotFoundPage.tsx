import { ArrowRight, FileText, Home, Phone } from 'lucide-react';
import { DOMAINS_CONFIG } from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import { hrefForDomain, hrefForHome, hrefForPage, type RouterMode } from '../utils/router';

/** Page « introuvable » (adresse inconnue) : explication courte et raccourcis utiles. */
export function NotFoundPage({ brand, routerMode }: { readonly brand: BrandConfig; readonly routerMode: RouterMode }) {
  const links = [
    ...DOMAINS_CONFIG.items.map((item) => ({ label: item.title, href: hrefForDomain(item.id, routerMode) })),
    { label: 'Clés & badges', href: hrefForPage('cles-badges', routerMode) },
    { label: 'Après sinistre', href: hrefForPage('apres-sinistre', routerMode) },
    { label: 'Agences & contact', href: hrefForPage('agences-contact', routerMode) },
  ];

  return (
    <section aria-labelledby="not-found-title" className="w-full bg-[#1C1F21] text-[#F3F0E7]">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-24 lg:py-28">
        <div className="max-w-[640px]">
          <p className="font-display text-[72px] sm:text-[96px] font-bold leading-none tracking-[-0.03em] text-[#B79A62]">404</p>
          <h1 id="not-found-title" className="mt-4 font-display text-[32px] sm:text-[44px] font-semibold leading-[1.08] tracking-[-0.015em]">
            Cette page n’existe pas.
          </h1>
          <p className="mt-4 text-[16px] sm:text-[18px] leading-[1.6] text-[#F3F0E7]/80">
            Le lien est peut-être incomplet, ou la page a été déplacée. Voici de quoi retrouver votre chemin.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={hrefForHome(routerMode)}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#B79A62] px-6 text-[15.5px] font-semibold text-[#1C1F21] hover:bg-[#C6AA73] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7]"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Retour à l’accueil
            </a>
            <a
              href={hrefForPage('devis', routerMode)}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[#F3F0E7]/40 px-6 text-[15.5px] font-medium text-[#F3F0E7] hover:border-[#F3F0E7] hover:bg-[#F3F0E7]/10 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
            >
              <FileText className="h-4 w-4 text-[#B79A62]" aria-hidden="true" />
              Demander un devis
            </a>
          </div>

          <p className="mt-6 inline-flex flex-wrap items-center gap-2 text-[15px] text-[#F3F0E7]/75">
            Une urgence ?
            <a href={brand.phoneHref} className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-[#F3F0E7] underline decoration-[#B79A62] decoration-2 underline-offset-[6px]">
              <Phone className="h-4 w-4 text-[#B79A62]" aria-hidden="true" />
              {brand.phoneDisplay}
            </a>
          </p>
        </div>

        <nav aria-label="Nos services" className="mt-12 border-t border-[#F3F0E7]/12 pt-8">
          <p className="section-kicker text-[#B79A62]">Nos services</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-[#F3F0E7]/20 px-4 py-2 text-[14.5px] text-[#F3F0E7]/90 hover:border-[#B79A62] hover:text-[#F3F0E7] transition-colors duration-150"
                >
                  {link.label}
                  <ArrowRight className="h-3.5 w-3.5 text-[#B79A62] transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
