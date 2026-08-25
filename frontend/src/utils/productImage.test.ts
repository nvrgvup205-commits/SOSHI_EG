import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildProductImagePath,
  pickProductImage,
  pickProductThumbnail,
  replaceExtension,
  scaledDimensions,
} from './productImage.ts';

test('scaledDimensions shrinks the long edge without enlarging', () => {
  assert.deepEqual(scaledDimensions(2400, 1800, 1200), { width: 1200, height: 900 });
  assert.deepEqual(scaledDimensions(400, 300, 1200), { width: 400, height: 300 });
});

test('replaceExtension swaps the suffix', () => {
  assert.equal(replaceExtension('nigiri.png', '.webp'), 'nigiri.webp');
});

test('buildProductImagePath uses the variant name', () => {
  const path = buildProductImagePath('abc-123', 'compressed', '.webp');
  assert.match(path, /^abc-123\/compressed-\d+-[a-f0-9]+\.webp$/);
});

test('pickProductImage prefers compressed over original and thumbnail', () => {
  assert.equal(
    pickProductImage({
      image_original_url: 'orig.webp',
      image_compressed_url: 'comp.webp',
      image_thumbnail_url: 'thumb.webp',
    }),
    'comp.webp'
  );
  assert.equal(
    pickProductImage({
      image_original_url: 'orig.webp',
      image_compressed_url: null,
      image_thumbnail_url: 'thumb.webp',
    }),
    'orig.webp'
  );
  assert.equal(pickProductImage({}), null);
});

test('pickProductThumbnail prefers the small variant', () => {
  assert.equal(
    pickProductThumbnail({
      image_original_url: 'orig.webp',
      image_compressed_url: 'comp.webp',
      image_thumbnail_url: 'thumb.webp',
    }),
    'thumb.webp'
  );
});
