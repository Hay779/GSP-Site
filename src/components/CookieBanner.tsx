/**
 * Bannière de consentement (CNIL) : « Refuser » aussi visible que « Accepter ».
 * Rouverte depuis le lien « Gérer les cookies » du pied de page.
 */
import { useEffect, useState } from 'react';
import { GA_MEASUREMENT_ID, isAutomatedBrowser, OPEN_CONSENT_EVENT, readConsent, saveConsent } from '../utils/analytics';

export function CookieBanner({ privacyHref }: { readonly privacyHref: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || isAutomatedBrowser()) return;
    if (!readConsent()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (analytics: boolean) => {
    saveConsent(analytics);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies de mesure d’audience"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-[560px] rounded-2xl border border-[#B79A62]/40 bg-[#1C1F21] p-5 text-[#F3F0E7] shadow-[0_18px_50px_rgba(0,0,0,0.35)] sm:bottom-5"
    >
      <p className="text-[15px] leading-[1.55]">
        Nous aimerions mesurer la fréquentation du site avec Google Analytics pour l’améliorer. Ces cookies ne sont déposés
        qu’avec votre accord.{' '}
        <a href={privacyHref} className="text-[#B79A62] underline">
          En savoir plus
        </a>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => choose(false)}
          className="h-11 rounded-full border border-[#F3F0E7]/40 px-5 text-[15px] font-semibold text-[#F3F0E7] hover:border-[#F3F0E7] cursor-pointer"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          className="h-11 rounded-full border border-[#B79A62] bg-[#B79A62] px-5 text-[15px] font-semibold text-[#1C1F21] hover:bg-[#C6AA73] cursor-pointer"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}

/** Lien du pied de page pour changer d'avis à tout moment. */
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
