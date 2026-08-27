import assert from 'node:assert/strict';
import { test } from 'node:test';
import { explainNonJson, isJsonSyntaxError, sanitizeProductPayload } from './http.ts';
import { isDemoCredentials } from './demo.ts';

test('JSON.parse of Cloudflare/Hono 404 text matches the customer-facing bug', () => {
  assert.throws(
    () => JSON.parse('404 Not Found'),
    (err: unknown) => {
      assert.equal(err instanceof SyntaxError, true);
      assert.match((err as SyntaxError).message, /position 4|column 5/i);
      return true;
    },
  );
});

test('explainNonJson turns 404 text into an actionable error', () => {
  assert.match(explainNonJson(404, '404 Not Found'), /API route not found/);
});

test('isJsonSyntaxError detects the browser parse message', () => {
  assert.equal(isJsonSyntaxError(new SyntaxError('Unexpected non-whitespace character after JSON at position 4')), true);
  assert.equal(isJsonSyntaxError(new Error('boom')), false);
});

test('sanitizeProductPayload keeps only product columns', () => {
  const clean = sanitizeProductPayload({
    name_ar: 'نيجيري',
    name_en: 'Nigiri',
    name_ru: 'Нигири',
    price: '120',
    extra: 'drop me',
    folder: '../hack',
  });
  assert.equal(clean.price, 120);
  assert.equal('extra' in clean, false);
  assert.equal(clean.name_en, 'Nigiri');
});

test('demo credentials accept 1111 / 1111 and ignore email', () => {
  assert.equal(isDemoCredentials('1111', '1111'), true);
  assert.equal(isDemoCredentials('admin', '1111'), true);
  assert.equal(isDemoCredentials('1111', '9999'), false);
  assert.equal(isDemoCredentials('user', '1111'), false);
});
