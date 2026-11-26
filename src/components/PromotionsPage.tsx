/**
 * Page /promotions : détail du Black Friday (maquette `docs/maquettes/black-friday/8-presentation-onglet-popup.png`).
 * Hors des dates de la promotion, la page affiche « Pas d'offre en ce moment » (et passe en noindex, voir seo.ts).
 */
import { useEffect, useId, useState } from 'react';
import { ChevronRight, MapPin, Minus, Phone, Plus } from 'lucide-react';
import { promotionCountdown, type PromoOffer, type Promotion } from '../data/promotions';
import type { AgencyItem } from '../data/sectionsContent';
import { HeroGoldWave } from './HeroGoldWave';
import { PROMO_GOLD, PROMO_GOLD_TEXT, promoBadgeText } from './BlackFriday';

interface PromotionsPageProps {
  readonly promo: Promotion;
  readonly active: boolean;
  readonly agency: AgencyItem;
  readonly phoneDisplay: string;
  readonly phoneHref: string;
  readonly quoteHref: string;
  readonly homeHref: string;
}

const AGENCY_ID = 'promo-agence';

function useCountdown(promo: Promotion) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return promotionCountdown(promo, now);
}

function Kicker({ children, tone = 'light' }: { readonly children: string; readonly tone?: 'light' | 'dark' }) {
  return (
    <p
      className={`flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.2em] ${
        tone === 'dark' ? 'text-[#E5C57B]' : 'text-[#7D612D]'
      }`}
    >
      <span aria-hidden="true" className="h-[1.5px] w-7 bg-[#B79A62]" />
      {children}
    </p>
  );
}

function scrollToAgency() {
  document.getElementById(AGENCY_ID)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function OfferAction({ offer, quoteHref, wide }: { readonly offer: PromoOffer; readonly quoteHref: string; readonly wide?: boolean }) {
  const cls = `inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full px-4 text-[14px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] ${
    wide ? 'w-full' : ''
  }`;
  return offer.cta.kind === 'quote' ? (
    <a href={quoteHref} className={`${cls} ${PROMO_GOLD} text-[#1C1F21]`}>
      {offer.cta.label}
    </a>
  ) : (
    <button type="button" onClick={scrollToAgency} className={`${cls} cursor-pointer border border-[#D9BD82]/60 text-[#F3F0E7]`}>
      {offer.cta.label}
    </button>
  );
}

export function PromotionsPage({ promo, active, agency, phoneDisplay, phoneHref, quoteHref, homeHref }: PromotionsPageProps) {
  const countdown = useCountdown(promo);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const faqBaseId = useId();
  const [main, ...others] = promo.offers;

  if (!active) {
    return (
      <section id="02_Hero" aria-labelledby="promo-title" className="relative bg-[#0B0C0D] text-[#F3F0E7]">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 pb-24 pt-14 sm:pb-32 sm:pt-20">
          <Kicker tone="dark">Promotions</Kicker>
          <h1 id="promo-title" className="mt-4 font-display text-[34px] sm:text-[46px] font-bold leading-[1.08]">
            Pas d’offre en ce moment.
          </h1>
          <p className="mt-4 max-w-[520px] text-[16px] leading-[1.6] text-[#F3F0E7]/80">
            Nos prochaines offres seront annoncées ici. En attendant, nous vous accueillons en boutique et
            répondons à toutes vos demandes de devis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={quoteHref} className={`inline-flex h-11 items-center rounded-full ${PROMO_GOLD} px-5 text-[15px] font-semibold text-[#1C1F21]`}>
              Demander un devis
            </a>
            <a href={homeHref} className="inline-flex h-11 items-center rounded-full border border-[#F3F0E7]/35 px-5 text-[15px] font-semibold">
              Retour à l’accueil
            </a>
          </div>
        </div>
        <HeroGoldWave compact fillColor="#FFFFFF" />
      </section>
    );
  }

  const units = [
    { value: countdown.days, label: 'Jours' },
    { value: countdown.hours, label: 'Heures' },
    { value: countdown.minutes, label: 'Min' },
  ];

  return (
    <>
      {/* Haut de page façon affiche */}
      <section
        id="02_Hero"
        aria-labelledby="promo-title"
        className="relative overflow-hidden bg-[#0B0C0D] bg-[radial-gradient(90%_55%_at_100%_0%,rgba(183,154,98,0.3),transparent_60%)] text-[#F3F0E7]"
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 pb-20 pt-8 sm:pb-28 sm:pt-14 lg:pb-36">
          <div className="lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
          <div>
          <Kicker tone="dark">Opération · Marseille 2e</Kicker>
          <h1 id="promo-title" className="mt-3 font-display text-[44px] sm:text-[64px] lg:text-[88px] font-extrabold uppercase leading-[0.98] tracking-[-0.02em]">
            Black <br className="sm:hidden lg:inline" />
            <span className={PROMO_GOLD_TEXT}>Friday</span>
          </h1>
          <p className="mt-3 font-display text-[21px] sm:text-[26px] font-extrabold uppercase tracking-[-0.01em]">
            {promo.tagline.split(/(-\d+ %)/).map((part, i) =>
              /^-\d+ %$/.test(part) ? (
                <span key={i} className={PROMO_GOLD_TEXT}>
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
          <p className="mt-3 max-w-[520px] text-[15.5px] leading-[1.6] text-[#F3F0E7]/80">
            En boutique au {agency.addressLines[0]} et à domicile sur devis. {promo.periodLabel}.
          </p>

          <div className="mt-5 grid max-w-[420px] grid-cols-3 gap-2.5" aria-label={`Fin de l’offre dans ${countdown.days} jours, ${countdown.hours} heures et ${countdown.minutes} minutes`}>
            {units.map((u) => (
              <div key={u.label} aria-hidden="true" className="rounded-2xl border-[1.5px] border-[#D9BD82]/55 py-2.5 text-center">
                <p className="font-display text-[26px] font-bold tabular-nums leading-none">{String(u.value).padStart(2, '0')}</p>
                <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-[0.16em] text-[#F3F0E7]/60">{u.label}</p>
              </div>
            ))}
          </div>

          {/* Les offres */}
          </div>
          <div className="mt-6 lg:mt-0">
          <h2 className="sr-only">Les offres {promo.name}</h2>
          <article className="flex max-w-[720px] lg:max-w-none overflow-hidden rounded-2xl border-[1.5px] border-[#D9BD82]/55 bg-[#111315]">
            <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
              {main.badgePrefix && (
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#F3F0E7]/80">{main.badgePrefix}</p>
              )}
              <p className={`font-display text-[46px] sm:text-[60px] font-extrabold leading-none tracking-[-0.03em] ${PROMO_GOLD_TEXT}`}>
                {promoBadgeText(main.badge)}
              </p>
              <h3 className="mt-2 font-display text-[17px] sm:text-[21px] font-extrabold uppercase leading-tight">
                {main.headline.replace(main.title.toLowerCase(), '')}
                <span className={PROMO_GOLD_TEXT}>{main.title}</span>
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.45] text-[#F3F0E7]/75">{main.summary}</p>
              <ul className="mt-2 space-y-1 text-[12.5px] leading-snug text-[#F3F0E7]/85">
                {main.includes.map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <span aria-hidden="true" className="text-[#E5C57B]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                <OfferAction offer={main} quoteHref={quoteHref} wide />
              </div>
            </div>
            <img src={main.imageSrc} alt={main.imageAlt} className="w-[38%] max-w-[260px] shrink-0 object-cover sm:max-h-[320px]" />
          </article>

          <div className="mt-2.5 grid max-w-[720px] grid-cols-2 gap-2.5 sm:grid-cols-3 lg:max-w-none [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1">
            {others.map((offer) => (
              <article key={offer.id} className="flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#D9BD82]/55 bg-[#111315] text-center">
                <h3 className="px-2 pt-3.5 font-display text-[15px] sm:text-[18px] font-extrabold uppercase leading-[1.15]">
                  {offer.badge.includes('%') ? (
                    <>
                      <span className={PROMO_GOLD_TEXT}>{offer.badge}</span> {offer.headline}
                    </>
                  ) : (
                    <span className={PROMO_GOLD_TEXT}>{offer.headline}</span>
                  )}
                </h3>
                <p className="mt-1 px-2 text-[12.5px] leading-snug text-[#F3F0E7]/70">{offer.summary}</p>
                <img src={offer.imageSrc} alt={offer.imageAlt} loading="lazy" className="mt-2.5 h-[110px] w-full bg-[#0B0C0D] object-contain" />
                <div className="mt-auto p-2.5">
                  <OfferAction offer={offer} quoteHref={quoteHref} wide />
                </div>
              </article>
            ))}
          </div>
          </div>
          </div>
        </div>
        <HeroGoldWave compact fillColor="#F7F5F0" />
      </section>

      {/* Comment en profiter + conditions */}
      <section aria-labelledby="promo-how" className="bg-[#F7F5F0] text-[#1C1F21]">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-12 sm:py-20">
          <Kicker>Comment en profiter</Kicker>
          <h2 id="promo-how" className="mt-3 section-title">Simple et rapide.</h2>
          <ol className="mt-6 grid max-w-[720px] gap-2.5 lg:max-w-none lg:grid-cols-3 lg:gap-4">
            {[
              { title: 'En boutique', text: `Montrez cette page au ${agency.addressLines[0]}.` },
              { title: 'Par téléphone', text: `Dites « ${promo.name} » au ${phoneDisplay}.` },
              { title: 'Par devis en ligne', text: `Précisez « ${promo.name} » dans votre demande.` },
            ].map((step, i) => (
              <li key={step.title} className="flex items-center gap-4 rounded-2xl border border-[#1C1F21]/8 bg-white p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F1E7D3] font-display text-[17px] font-bold text-[#7D612D]">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-display text-[17px] font-semibold">{step.title}</span>
                  <span className="block text-[14.5px] leading-snug text-[#1C1F21]/65">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-5 max-w-[720px] rounded-2xl bg-[#1C1F21] p-5 lg:max-w-none lg:p-7 text-[#F3F0E7]">
            <h3 className="font-display text-[16px] font-semibold text-[#E5C57B]">Conditions</h3>
            {promo.conditions.map((c) => (
              <p key={c} className="mt-2 text-[14.5px] leading-[1.55] text-[#F3F0E7]/80">
                {c}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Questions + agence */}
      <section aria-labelledby="promo-faq" className="bg-white text-[#1C1F21]">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-12 sm:py-20 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
          <div>
          <Kicker>Questions</Kicker>
          <h2 id="promo-faq" className="mt-3 section-title">Vos questions.</h2>
          <div className="mt-5 max-w-[720px] border-t border-[#1C1F21]/12">
            {promo.faq.map((item) => {
              const open = openFaq === item.id;
              const panelId = `${faqBaseId}-${item.id}`;
              return (
                <div key={item.id} className="border-b border-[#1C1F21]/12">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(open ? null : item.id)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-display text-[16px] font-medium"
                    >
                      {item.question}
                      {open ? (
                        <Minus className="h-5 w-5 shrink-0 text-[#B79A62]" aria-hidden="true" />
                      ) : (
                        <Plus className="h-5 w-5 shrink-0 text-[#B79A62]" aria-hidden="true" />
                      )}
                    </button>
                  </h3>
                  <div id={panelId} hidden={!open} className="pb-4 text-[15px] leading-[1.6] text-[#1C1F21]/75">
                    {item.answer}
                  </div>
                </div>
              );
            })}
          </div>

          </div>

          <div id={AGENCY_ID} className="mt-8 max-w-[720px] scroll-mt-28 lg:sticky lg:top-28 lg:mt-14 rounded-2xl border border-[#1C1F21]/10 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <h3 className="font-display text-[21px] font-semibold">{agency.name}</h3>
            <p className="mt-1.5 flex items-start gap-2 text-[14.5px] leading-snug text-[#1C1F21]/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B79A62]" aria-hidden="true" />
              <span>
                {agency.addressLines.join(', ')}
                <br />
                {agency.hoursLabel}
              </span>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <a
                href={agency.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-1 rounded-full bg-[#1C1F21] px-5 text-[15px] font-semibold text-white"
              >
                Itinéraire
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={phoneHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#1C1F21]/25 px-5 text-[15px] font-semibold"
              >
                <Phone className="h-4 w-4 text-[#7D612D]" aria-hidden="true" />
                Appeler
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
