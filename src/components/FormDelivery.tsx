/** Éléments communs aux 4 formulaires : champ piège anti-robots et message d'échec avec repli. */
import { MessageCircle, Phone } from 'lucide-react';
import { WHATSAPP_CONFIG } from '../data/sectionsContent';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { deliveryErrorMessage, HONEYPOT_NAME } from '../utils/formDelivery';

/** Invisible pour les visiteurs et les lecteurs d'écran ; les robots le remplissent. */
export function HoneypotField({ value, onChange }: { readonly value: string; readonly onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Site web (laisser vide)
        <input
          type="text"
          name={HONEYPOT_NAME}
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

export function DeliveryErrorNotice({
  reason,
  tone = 'light',
}: {
  readonly reason: 'reseau' | 'limite' | 'refus';
  /** « dark » pour la fenêtre sombre des photos après sinistre. */
  readonly tone?: 'light' | 'dark';
}) {
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_CONFIG.phoneDisplay, WHATSAPP_CONFIG.prefilledMessage);
  const dark = tone === 'dark';
  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 text-[15px] ${
        dark ? 'border-[#C0392B]/60 bg-[#C0392B]/15 text-[#F3F0E7]' : 'border-[#C0392B]/30 bg-[#C0392B]/5 text-[#1C1F21]'
      }`}
    >
      <p>{deliveryErrorMessage(reason)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href="tel:+33491905165"
          className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium ${
            dark ? 'bg-[#B79A62] text-[#1C1F21]' : 'bg-[#1C1F21] text-[#F7F5F0]'
          }`}
        >
          <Phone className="h-4 w-4" aria-hidden="true" /> 04 91 90 51 65
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[15px] font-medium ${
            dark ? 'border-[#F3F0E7]/30 text-[#F3F0E7]' : 'border-[#1C1F21]/20 text-[#1C1F21]'
          }`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
