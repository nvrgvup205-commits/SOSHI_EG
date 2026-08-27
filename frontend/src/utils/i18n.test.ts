import assert from 'node:assert/strict';
import { test } from 'node:test';
import { translations } from './i18n.ts';

test('Arabic, English and Russian share the same translation keys', () => {
  const en = Object.keys(translations.en).sort();
  assert.deepEqual(Object.keys(translations.ar).sort(), en);
  assert.deepEqual(Object.keys(translations.ru).sort(), en);
});
