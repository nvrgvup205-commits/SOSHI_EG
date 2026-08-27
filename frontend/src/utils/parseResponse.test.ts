import assert from 'node:assert/strict';
import { test } from 'node:test';
import { explainNonJson } from './parseResponse.ts';

test('plain-text 404 is the source of the JSON position 4 error', () => {
  assert.throws(
    () => JSON.parse('404 Not Found'),
    (err: unknown) => {
      assert.match((err as SyntaxError).message, /position 4|column 5/i);
      return true;
    },
  );
  assert.match(explainNonJson(404, '404 Not Found'), /API route not found/);
});
