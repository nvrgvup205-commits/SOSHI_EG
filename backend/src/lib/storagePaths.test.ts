import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildProductImagePath, extensionForType, safeImageFolder } from './storagePaths.ts';

test('safeImageFolder strips traversal', () => {
  assert.equal(safeImageFolder('../products/../../x'), 'products/x');
});

test('buildProductImagePath stays in the product folder', () => {
  const path = buildProductImagePath('prod-1', 'thumb', '.webp');
  assert.match(path, /^prod-1\/thumb-\d+-[a-f0-9-]+\.webp$/);
});

test('extensionForType maps mime types', () => {
  assert.equal(extensionForType('image/webp'), '.webp');
  assert.equal(extensionForType('image/png'), '.png');
  assert.equal(extensionForType('image/jpeg'), '.jpg');
});
