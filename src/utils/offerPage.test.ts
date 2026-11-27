import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PAGE, normalizeBlocks, parsePage, serializePage, themeStyle, validatePage } from './offerPage';

test('blocks: each once, missing ones added at the end', () => {
  assert.deepEqual(
    normalizeBlocks([
      { id: 'avis', visible: false },
      { id: 'avis', visible: true },
    ]).map((b) => `${b.id}:${b.visible}`),
    ['avis:false', 'etapes:true', 'infos:true']
  );
});

test('page settings round trip and defaults', () => {
  const page = { ...DEFAULT_PAGE, theme: 'calanques' as const, buttonText: 'Je profite de -10 %', blocks: [{ id: 'avis' as const, visible: true }, { id: 'etapes' as const, visible: false }, { id: 'infos' as const, visible: true }] };
  assert.deepEqual(parsePage(serializePage(page)), page);
  assert.deepEqual(parsePage(undefined), DEFAULT_PAGE);
  assert.equal(parsePage({ theme: 'rose' }).theme, 'mer');
});

test('validation and theme variables', () => {
  assert.equal(validatePage(DEFAULT_PAGE), null);
  assert.ok(validatePage({ ...DEFAULT_PAGE, buttonText: 'x'.repeat(41) }));
  assert.equal(themeStyle('soleil')['--o-accent'], '#B4460F');
});
