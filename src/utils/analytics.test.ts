import test from 'node:test';
import assert from 'node:assert/strict';
import { CONSENT_DURATION_MS, eventForHref, parseConsent } from './analytics';

test('reads a recent consent choice', () => {
  const now = 1_800_000_000_000;
  assert.deepEqual(parseConsent(JSON.stringify({ analytics: true, savedAt: now - 1000 }), now), { analytics: true, savedAt: now - 1000 });
  assert.deepEqual(parseConsent(JSON.stringify({ analytics: false, savedAt: now }), now), { analytics: false, savedAt: now });
});

test('asks again after 6 months or when the stored value is invalid', () => {
  const now = 1_800_000_000_000;
  assert.equal(parseConsent(JSON.stringify({ analytics: true, savedAt: now - CONSENT_DURATION_MS - 1 }), now), null);
  assert.equal(parseConsent(null, now), null);
  assert.equal(parseConsent('pas du json', now), null);
  assert.equal(parseConsent(JSON.stringify({ analytics: 'oui', savedAt: now }), now), null);
});

test('recognises phone and WhatsApp links', () => {
  assert.deepEqual(eventForHref('tel:+33491905165'), { name: 'clic_telephone', params: { numero: '+33491905165' } });
  assert.deepEqual(eventForHref('https://wa.me/33782828208?text=Bonjour'), { name: 'clic_whatsapp', params: {} });
  assert.equal(eventForHref('/devis'), null);
  assert.equal(eventForHref('https://example.com/wa.me/'), null);
});
