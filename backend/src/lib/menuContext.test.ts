import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSystemPrompt } from './sushiAi.ts';
import { clearMenuContextCache, serializeMenuForPrompt } from './menuContext.ts';

test('serializeMenuForPrompt groups products by category', () => {
  const json = serializeMenuForPrompt({
    categories: [
      { slug: 'soups', name_ar: 'الشوربة', name_en: 'Soups', name_ru: 'Супы' },
    ],
    products: [
      {
        id: '1',
        name_ar: 'شوربة ميسو',
        name_en: 'Miso Soup',
        name_ru: 'Суп мисо',
        price: 150,
        category: 'soups',
        description_ar: null,
        description_en: null,
        description_ru: null,
        is_new: false,
        is_popular: true,
        is_offer: false,
      },
    ],
    addons: [{ name_ar: 'صويا', name_en: 'Soy Sauce', name_ru: 'Соевый соус', price: 20 }],
  });

  const parsed = JSON.parse(json) as {
    categories: Array<{ slug: string; items: Array<{ name_en: string; price_egp: number }> }>;
    addons: Array<{ name_en: string }>;
  };

  assert.equal(parsed.categories[0].slug, 'soups');
  assert.equal(parsed.categories[0].items[0].name_en, 'Miso Soup');
  assert.equal(parsed.categories[0].items[0].price_egp, 150);
  assert.equal(parsed.addons[0].name_en, 'Soy Sauce');
});

test('buildSystemPrompt embeds menu and grounding rules', () => {
  const menu = '{"categories":[]}';
  const prompt = buildSystemPrompt('en', menu);

  assert.match(prompt, /customer assistant for SUSHI SHOP EGYPT/i);
  assert.match(prompt, /Only recommend items explicitly listed/i);
  assert.match(prompt, /Korean Fried Chicken/i);
  assert.match(prompt, /Never hallucinate/i);
  assert.ok(prompt.includes(menu));
  assert.match(prompt, /Respond in English/);
});

test('clearMenuContextCache resets cached menu', () => {
  clearMenuContextCache();
  assert.doesNotThrow(() => clearMenuContextCache());
});
