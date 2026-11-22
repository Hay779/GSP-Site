import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppUrl, formatWhatsAppDigits } from './whatsapp';

test('formats French landline, mobile, and international numbers to wa.me digits', () => {
  assert.equal(formatWhatsAppDigits('04 91 90 51 65'), '33491905165');
  assert.equal(formatWhatsAppDigits('06 12 34 56 78'), '33612345678');
  assert.equal(formatWhatsAppDigits('+33 6 12 34 56 78'), '33612345678');
  assert.equal(formatWhatsAppDigits('0033 4 91 90 51 65'), '33491905165');
});

test('builds valid wa.me URL with encoded French emergency message', () => {
  const url = buildWhatsAppUrl(
    '04 91 90 51 65',
    'Bonjour, j’ai besoin d’un dépannage urgent à Marseille.'
  );
  assert.ok(url.startsWith('https://wa.me/33491905165?text='));
  const parsed = new URL(url);
  assert.equal(
    parsed.searchParams.get('text'),
    'Bonjour, j’ai besoin d’un dépannage urgent à Marseille.'
  );
});

test('omits text query parameter when message is empty or whitespace', () => {
  assert.equal(buildWhatsAppUrl('04 91 90 51 65', '   '), 'https://wa.me/33491905165');
});
