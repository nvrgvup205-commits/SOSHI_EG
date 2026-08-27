import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { detectMessageLanguage, normalizeLang, readTranslationCache } from './translate.ts';

describe('normalizeLang', () => {
  it('maps supported language codes', () => {
    assert.equal(normalizeLang('en'), 'en');
    assert.equal(normalizeLang('ru'), 'ru');
    assert.equal(normalizeLang('ar'), 'ar');
  });

  it('defaults unknown codes to Arabic', () => {
    assert.equal(normalizeLang('fr'), 'ar');
    assert.equal(normalizeLang(undefined), 'ar');
  });
});

describe('detectMessageLanguage', () => {
  it('detects Arabic including dialect', () => {
    assert.equal(detectMessageLanguage('عايز أوردر سوشي'), 'ar');
    assert.equal(detectMessageLanguage('ازيك يا باشا'), 'ar');
  });

  it('detects Russian', () => {
    assert.equal(detectMessageLanguage('Привет, хочу заказать'), 'ru');
  });

  it('detects English', () => {
    assert.equal(detectMessageLanguage('I want sushi please'), 'en');
  });
});

describe('readTranslationCache', () => {
  it('reads JSON cache for matching target language', () => {
    const raw = JSON.stringify({ target: 'ru', text: 'Привет' });
    assert.equal(readTranslationCache(raw, 'ru'), 'Привет');
    assert.equal(readTranslationCache(raw, 'en'), null);
  });
});
