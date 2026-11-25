import { useCallback, useEffect, useState } from 'react';
import { CURRENT_PROMOTION, PROMO_DISMISS_KEY, isPromotionActive, type Promotion } from '../data/promotions';

function readDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(PROMO_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * État de la promotion en cours : active selon la date (revérifiée chaque minute,
 * pour disparaître à minuit même si la page reste ouverte) et masquée ou non
 * par le visiteur pour sa visite (sessionStorage).
 */
export function usePromotion(): {
  readonly promo: Promotion;
  readonly active: boolean;
  readonly dismissed: boolean;
  readonly dismiss: () => void;
} {
  const [active, setActive] = useState(() => isPromotionActive(CURRENT_PROMOTION));
  const [dismissed, setDismissed] = useState(() => typeof window !== 'undefined' && readDismissed());

  useEffect(() => {
    const timer = window.setInterval(() => setActive(isPromotionActive(CURRENT_PROMOTION)), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(PROMO_DISMISS_KEY, '1');
    } catch {
      /* navigation privée : masqué pour cette page seulement */
    }
  }, []);

  return { promo: CURRENT_PROMOTION, active, dismissed, dismiss };
}
