import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { detectMessageLanguage, normalizeLang } from './translate.ts';

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
