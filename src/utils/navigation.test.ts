import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND_CONFIG,
  HEADER_NAV_ITEMS,
  PROVISIONAL_SECTIONS,
  SITE_SECTIONS,
  formatTelHref,
  resolveActiveSectionId,
  validateSiteStructure,
} from './navigation';

test('site structure contains all 12 sections in the exact requested order including FAQ', () => {
  const validation = validateSiteStructure(SITE_SECTIONS, HEADER_NAV_ITEMS);
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  assert.equal(SITE_SECTIONS.length, 12);
  assert.equal(PROVISIONAL_SECTIONS.length, 11);
  assert.equal(SITE_SECTIONS[0].id, '01_Entete');
  assert.equal(SITE_SECTIONS[10].id, 'FAQ');
  assert.equal(SITE_SECTIONS[11].id, '11_Pied_De_Page');
});

test('header navigation items match required labels and valid anchors', () => {
  assert.deepEqual(
    HEADER_NAV_ITEMS.map((item) => item.label),
    ['Clés & badges', 'Nos domaines', 'Après sinistre', 'Nos agences']
  );
  assert.deepEqual(
    HEADER_NAV_ITEMS.map((item) => item.href),
    ['#04_Cles_Badges', '#05_Nos_Domaines', '#07_Apres_Sinistre', '#10_Nos_Agences']
  );
});

test('brand phone number formats accurately to tel:+33491905165', () => {
  assert.equal(formatTelHref(BRAND_CONFIG.phoneDisplay), 'tel:+33491905165');
  assert.equal(BRAND_CONFIG.phoneHref, 'tel:+33491905165');
  assert.equal(formatTelHref('04.91.90.51.65'), 'tel:+33491905165');
  assert.equal(formatTelHref('+33 4 91 90 51 65'), 'tel:+33491905165');
});

test('resolveActiveSectionId tracks the deepest scrolled nav target', () => {
  const navTargets = HEADER_NAV_ITEMS.map((item) => item.targetId);

  const atTop = resolveActiveSectionId(
    [
      { id: '02_Hero', top: 80 },
      { id: '04_Cles_Badges', top: 640 },
      { id: '05_Nos_Domaines', top: 1200 },
    ],
    navTargets
  );
  assert.equal(atTop, null);

  const atDomains = resolveActiveSectionId(
    [
      { id: '02_Hero', top: -900 },
      { id: '04_Cles_Badges', top: -320 },
      { id: '05_Nos_Domaines', top: 100 },
      { id: '07_Apres_Sinistre', top: 520 },
    ],
    navTargets
  );
  assert.equal(atDomains, '05_Nos_Domaines');

  const atAgencies = resolveActiveSectionId(
    [
      { id: '04_Cles_Badges', top: -1800 },
      { id: '05_Nos_Domaines', top: -1200 },
      { id: '07_Apres_Sinistre', top: -500 },
      { id: '10_Nos_Agences', top: 84 },
    ],
    navTargets
  );
  assert.equal(atAgencies, '10_Nos_Agences');
});
