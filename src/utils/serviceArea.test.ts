import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkServiceSector,
  isMarseillePostalCode,
  normalizeSectorText,
  resolveZoneMapFocusPin,
} from './serviceArea';

test('normalizes accents, case, and punctuation reliably', () => {
  assert.equal(normalizeSectorText('  Septèmes-les-Vallons ! '), 'septemes-les-vallons');
  assert.equal(normalizeSectorText('République'), 'republique');
});

test('identifies valid Marseille postal codes 13001 through 13016', () => {
  assert.equal(isMarseillePostalCode('13002'), '13002');
  assert.equal(isMarseillePostalCode('marseille 13016'), '13016');
  assert.equal(isMarseillePostalCode('13017'), null);
  assert.equal(isMarseillePostalCode('75001'), null);
});

test('matches Marseille districts and all 6 neighboring communes in service area', () => {
  const joliette = checkServiceSector('Joliette');
  assert.equal(joliette.status, 'covered');
  assert.match(joliette.matchedLabel ?? '', /Joliette/);

  const allauch = checkServiceSector('13190');
  assert.equal(allauch.status, 'covered');
  assert.equal(allauch.matchedLabel, 'Allauch (13190)');

  const pennesMirabeau = checkServiceSector('Les Pennes-Mirabeau');
  assert.equal(pennesMirabeau.status, 'covered');
  assert.equal(pennesMirabeau.matchedLabel, 'Les Pennes-Mirabeau (13170)');

  const penneHuveaune = checkServiceSector('13821');
  assert.equal(penneHuveaune.status, 'covered');
  assert.equal(penneHuveaune.matchedLabel, 'La Penne-sur-Huveaune (13821)');

  const marseille12 = checkServiceSector('13012');
  assert.equal(marseille12.status, 'covered');
  assert.equal(marseille12.matchedLabel, 'Marseille (13012)');
});

test('resolves interactive map focus pin accurately for Marseille districts and communes', () => {
  assert.equal(resolveZoneMapFocusPin(null), 'marseille');
  assert.equal(resolveZoneMapFocusPin('Lodi'), 'marseille');
  assert.equal(resolveZoneMapFocusPin('1er au 16ème arrondissements'), 'marseille');
  assert.equal(resolveZoneMapFocusPin('Septèmes-les-Vallons'), 'septemes');
  assert.equal(resolveZoneMapFocusPin('Plan-de-Cuques'), 'plan-de-cuques');
  assert.equal(resolveZoneMapFocusPin('Allauch'), 'allauch');
  assert.equal(resolveZoneMapFocusPin('Aubagne'), 'aubagne');
  assert.equal(resolveZoneMapFocusPin('Les Pennes-Mirabeau'), 'pennes-mirabeau');
  assert.equal(resolveZoneMapFocusPin('La Penne-sur-Huveaune'), 'penne-sur-huveaune');
});

test('returns empty or unconfirmed status cleanly for blank or outside queries', () => {
  assert.equal(checkServiceSector(' ').status, 'empty');
  assert.equal(checkServiceSector('Lyon').status, 'unconfirmed');
});

test('does not confuse « marseille 13006 » with « marseille 1 » (Vieux-Port)', () => {
  const result = checkServiceSector('Marseille 13006');
  assert.equal(result.status, 'covered');
  assert.ok(result.matchedLabel?.includes('13006'), result.matchedLabel ?? '');
  assert.ok(!result.matchedLabel?.includes('Vieux-Port'));
});

test('plain « Marseille » is covered without picking a random district', () => {
  const result = checkServiceSector('Marseille');
  assert.equal(result.status, 'covered');
  assert.ok(!result.matchedLabel?.includes('République'), result.matchedLabel ?? '');
});

test('still matches partial place names while typing', () => {
  assert.equal(checkServiceSector('aubag').status, 'covered');
  assert.equal(checkServiceSector('13190').matchedLabel, 'Allauch (13190)');
});
