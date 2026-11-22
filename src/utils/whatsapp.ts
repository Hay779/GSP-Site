/**
 * Converts a French or international phone string into WhatsApp wa.me digits (no '+' or spaces).
 */
export function formatWhatsAppDigits(phoneDisplay: string): string {
  const digits = phoneDisplay.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return `33${digits.slice(1)}`;
  }
  if (digits.startsWith('00') && digits.length > 4) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Builds an official https://wa.me/<digits> link with an optional URL-encoded message.
 */
export function buildWhatsAppUrl(phoneDisplay: string, message = ''): string {
  const digits = formatWhatsAppDigits(phoneDisplay);
  const base = `https://wa.me/${digits}`;
  const trimmed = message.trim();
  if (!trimmed) {
    return base;
  }
  return `${base}?text=${encodeURIComponent(trimmed)}`;
}
