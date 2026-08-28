/**
 * Sushi Shop Egypt — full menu seed (prices from attached menu screenshots).
 * Run: node scripts/seed-menu.mjs | supabase db query (or paste into Supabase SQL editor)
 */

const categories = [
  { slug: 'soups', name_ar: 'الشوربة', name_en: 'Soups', name_ru: 'Супы', sort: 1 },
  { slug: 'uramaki', name_ar: 'أوراماكي', name_en: 'Uramaki', name_ru: 'Урамаки', sort: 2 },
  { slug: 'fried-rolls', name_ar: 'المقلي', name_en: 'Fried Rolls', name_ru: 'Жареные роллы', sort: 3 },
  { slug: 'cooked-rolls', name_ar: 'المطبوخ', name_en: 'Cooked Rolls', name_ru: 'Готовые роллы', sort: 4 },
  { slug: 'hosomaki', name_ar: 'هوسوماكي', name_en: 'Hosomaki', name_ru: 'Хосомаки', sort: 5 },
  { slug: 'nigiri-temaki-sashimi', name_ar: 'نيجيري وتيماكي وساشيمي', name_en: 'Nigiri, Temaki & Sashimi', name_ru: 'Нигири, Темаки и Сашими', sort: 6 },
  { slug: 'sets-combo', name_ar: 'المجموعات والكومبو', name_en: 'Sets & Combo', name_ru: 'Сеты и комбо', sort: 7 },
  { slug: 'salads', name_ar: 'السلطات', name_en: 'Salads', name_ru: 'Салаты', sort: 8 },
  { slug: 'noodles', name_ar: 'النودلز', name_en: 'Noodles', name_ru: 'Лапша', sort: 9 },
  { slug: 'appetizers', name_ar: 'المقبلات', name_en: 'Appetizers', name_ru: 'Закуски', sort: 10 },
  { slug: 'maki-large', name_ar: 'ماكي كبير', name_en: 'Maki Large', name_ru: 'Футомаки', sort: 11 },
  { slug: 'shawarma', name_ar: 'الشاورما', name_en: 'Shawarma', name_ru: 'Шаурма', sort: 12 },
  { slug: 'drinks', name_ar: 'المشروبات', name_en: 'Drinks', name_ru: 'Напитки', sort: 13 },
];

/** @type {Array<{cat:string, en:string, ar?:string, ru?:string, price:number, featured?:boolean, popular?:boolean}>} */
const dishes = [
  // 1. Soups (screenshot prices)
  { cat: 'soups', en: 'Miso Soup', ar: 'شوربة ميسو', ru: 'Суп мисо', price: 150 },
  { cat: 'soups', en: 'Ebi Miso Soup', ar: 'شوربة إبي ميسو', ru: 'Суп эби мисо', price: 230 },
  { cat: 'soups', en: 'Tom Yum Soup', ar: 'شوربة توم يم', ru: 'Суп том ям', price: 250 },
  { cat: 'soups', en: 'Creamy Seafood Soup', ar: 'شوربة مأكولات بحرية كريمية', ru: 'Кремовый морской суп', price: 280 },
  { cat: 'soups', en: 'Ramen Soup', ar: 'شوربة رامن', ru: 'Суп рамен', price: 300 },
  { cat: 'soups', en: 'Sushi Shop Special Soup', ar: 'شوربة سوشي شوب الخاصة', ru: 'Фирменный суп Sushi Shop', price: 300 },
  { cat: 'soups', en: 'Tom Yum with Rice', ar: 'توم يم مع أرز', ru: 'Том ям с рисом', price: 300 },

  // 2. Uramaki (screenshot prices)
  { cat: 'uramaki', en: 'Mexico Roll', ar: 'رول مكسيكو', ru: 'Ролл Мексика', price: 350 },
  { cat: 'uramaki', en: 'California Masago', ar: 'كاليفورنيا ماساجو', ru: 'Калифорния масаго', price: 420 },
  { cat: 'uramaki', en: 'Jamaica Roll', ar: 'رول جامايكا', ru: 'Ролл Ямайка', price: 330 },
  { cat: 'uramaki', en: 'Pyramid Roll', ar: 'رول الهرم', ru: 'Ролл Пирамида', price: 370 },
  { cat: 'uramaki', en: 'Shrimp Roll', ar: 'رول جمبري', ru: 'Ролл с креветкой', price: 290 },
  { cat: 'uramaki', en: 'Philadelphia Shrimp Roll', ar: 'فيلادلفيا جمبري', ru: 'Филадельфия с креветкой', price: 370 },
  { cat: 'uramaki', en: 'Dynamite Salmon Roll', ar: 'ديناميت سلمون', ru: 'Динамит с лососем', price: 350 },
  { cat: 'uramaki', en: 'Banzai Roll', ar: 'رول بانزاي', ru: 'Ролл Банзай', price: 390 },
  { cat: 'uramaki', en: 'Rollins Roll', ar: 'رول رولينز', ru: 'Ролл Роллинс', price: 350 },
  { cat: 'uramaki', en: 'Creamy Salmon Roll', ar: 'سلمون كريمي', ru: 'Кремовый лосось', price: 290 },
  { cat: 'uramaki', en: 'Romantic Roll', ar: 'رول رومانتيك', ru: 'Ролл Романтик', price: 300 },
  { cat: 'uramaki', en: 'Rainbow Roll', ar: 'رول قوس قزح', ru: 'Ролл Радуга', price: 360 },
  { cat: 'uramaki', en: 'California Classic Roll', ar: 'كاليفورنيا كلاسيك', ru: 'Калифорния классик', price: 330 },
  { cat: 'uramaki', en: 'Secret Sushi Shop Roll', ar: 'رول سوشي شوب السري', ru: 'Секретный ролл Sushi Shop', price: 270 },
  { cat: 'uramaki', en: 'Sushi Shop Special Butterfly Roll', ar: 'رول الفراشة الخاص', ru: 'Фирменный ролл Бабочка', price: 370 },
  { cat: 'uramaki', en: 'Salmon Maki', ar: 'ماكي سلمون', ru: 'Маки с лососем', price: 310 },
  { cat: 'uramaki', en: 'Pink Panther Roll', ar: 'رول النمر الوردي', ru: 'Ролл Розовая пантера', price: 250 },
  { cat: 'uramaki', en: 'Dynamite Creamy Tuna Roll', ar: 'ديناميت تونة كريمية', ru: 'Динамит с тунцом кремовый', price: 380 },
  { cat: 'uramaki', en: 'California Salmon Roll', ar: 'كاليفورنيا سلمون', ru: 'Калифорния с лососем', price: 340 },
  { cat: 'uramaki', en: 'New York Roll', ar: 'رول نيويورك', ru: 'Ролл Нью-Йорк', price: 360 },
  { cat: 'uramaki', en: 'Creamy Shrimp Roll', ar: 'جمبري كريمي', ru: 'Кремовая креветка', price: 350 },
  { cat: 'uramaki', en: 'Canada Lux Roll', ar: 'كندا لوكس', ru: 'Канада Люкс', price: 380 },
  { cat: 'uramaki', en: 'Philadelphia Classic Roll', ar: 'فيلادلفيا كلاسيك', ru: 'Филадельфия классик', price: 280 },
  { cat: 'uramaki', en: 'Caesar Roll', ar: 'رول سيزر', ru: 'Ролл Цезарь', price: 190 },
  { cat: 'uramaki', en: 'Reina Roll Smoked Salmon', ar: 'رول رينا سلمون مدخن', ru: 'Ролл Рейна копчёный лосось', price: 360 },
  { cat: 'uramaki', en: 'Philadelphia Tuna Roll', ar: 'فيلادلفيا تونة', ru: 'Филадельфия с тунцом', price: 380 },
  { cat: 'uramaki', en: 'Black Dragon Roll', ar: 'رول التنين الأسود', ru: 'Ролл Чёрный дракон', price: 400 },
  { cat: 'uramaki', en: 'Dynamite Creamy Salmon Roll', ar: 'ديناميت سلمون كريمي', ru: 'Динамит кремовый лосось', price: 380 },
  { cat: 'uramaki', en: 'Dynamite Tuna Roll', ar: 'ديناميت تونة', ru: 'Динамит с тунцом', price: 330 },
  { cat: 'uramaki', en: 'California Shrimp Roll', ar: 'كاليفورنيا جمبري', ru: 'Калифорния с креветкой', price: 365 },
  { cat: 'uramaki', en: 'Philadelphia Eel Roll', ar: 'فيلادلفيا أنقليس', ru: 'Филадельфия с угрём', price: 380 },

  // 3. Fried Rolls
  { cat: 'fried-rolls', en: 'Salmon Mania Roll', ar: 'سلمون مانيا', ru: 'Салмон Мания', price: 210 },
  { cat: 'fried-rolls', en: 'Hamanishi Roll', ar: 'هامانيشي', ru: 'Хаманиши', price: 300 },
  { cat: 'fried-rolls', en: 'Golden Amazing Roll', ar: 'جولدن أميزينج', ru: 'Голден Амейзинг', price: 290 },
  { cat: 'fried-rolls', en: 'Crunchy Salmon Roll', ar: 'كرانشي سلمون', ru: 'Хрустящий лосось', price: 220 },
  { cat: 'fried-rolls', en: 'Hot Lemon Roll', ar: 'هوت ليمون', ru: 'Хот Лимон', price: 295 },
  { cat: 'fried-rolls', en: 'Spider Hot Roll', ar: 'سبايدر هوت', ru: 'Спайдер хот', price: 230 },
  { cat: 'fried-rolls', en: 'Queen Roll', ar: 'رول الملكة', ru: 'Ролл Королева', price: 240 },
  { cat: 'fried-rolls', en: 'Tika Hot Roll', ar: 'تيكا هوت', ru: 'Тика хот', price: 205 },
  { cat: 'fried-rolls', en: 'Volcano Philadelphia', ar: 'فولكانو فيلادلفيا', ru: 'Вулкан Филадельфия', price: 350 },
  { cat: 'fried-rolls', en: 'Sake San Hot Roll', ar: 'ساكي سان هوت', ru: 'Саке Сан хот', price: 270 },
  { cat: 'fried-rolls', en: 'Sahara Roll Salmon', ar: 'صحراء سلمون', ru: 'Сахара с лососем', price: 230 },
  { cat: 'fried-rolls', en: 'Tuna San Hot Roll', ar: 'تونا سان هوت', ru: 'Туна Сан хот', price: 235 },
  { cat: 'fried-rolls', en: 'Akeno Hot Roll', ar: 'أكينو هوت', ru: 'Акено хот', price: 280 },
  { cat: 'fried-rolls', en: 'Ayashi Roll', ar: 'أياشي', ru: 'Аяши', price: 350 },
  { cat: 'fried-rolls', en: 'Crunchy Tuna Roll', ar: 'كرانشي تونة', ru: 'Хрустящий тунец', price: 270 },
  { cat: 'fried-rolls', en: 'Crunchy Shrimp Hot Roll', ar: 'كرانشي جمبري هوت', ru: 'Хрустящая креветка хот', price: 240 },

  // 4. Cooked Rolls
  { cat: 'cooked-rolls', en: 'Double Salmon Roll', ar: 'دبل سلمون', ru: 'Двойной лосось', price: 350 },
  { cat: 'cooked-rolls', en: 'Cracker Roll', ar: 'كراكر', ru: 'Крекер', price: 310 },
  { cat: 'cooked-rolls', en: 'Zen Roll', ar: 'زين', ru: 'Дзен', price: 320 },
  { cat: 'cooked-rolls', en: 'Mona Lisa Roll', ar: 'موناليزا', ru: 'Мона Лиза', price: 350 },
  { cat: 'cooked-rolls', en: 'Saki Roll', ar: 'ساكي', ru: 'Саки', price: 340 },
  { cat: 'cooked-rolls', en: 'Vienom Fried Roll', ar: 'فينوم مقلي', ru: 'Вьеном жареный', price: 320 },
  { cat: 'cooked-rolls', en: 'Lava Fried Roll', ar: 'لافا مقلي', ru: 'Лава жареный', price: 350 },
  { cat: 'cooked-rolls', en: 'Jewel Roll', ar: 'جوهرة', ru: 'Джуэл', price: 300 },
  { cat: 'cooked-rolls', en: 'Flaming Roll', ar: 'فلامينج', ru: 'Флейминг', price: 320 },
  { cat: 'cooked-rolls', en: 'Tobiko Roll', ar: 'توبيكو', ru: 'Тобико', price: 330 },

  // 5. Hosomaki
  { cat: 'hosomaki', en: 'Hosomaki Caviar', ar: 'هوسوماكي كافيار', ru: 'Хосомаки икра', price: 220 },
  { cat: 'hosomaki', en: 'Hosomaki Cucumber', ar: 'هوسوماكي خيار', ru: 'Хосомаки огурец', price: 80 },
  { cat: 'hosomaki', en: 'Hosomaki with Herring', ar: 'هوسوماكي رنجة', ru: 'Хосомаки селёдка', price: 220 },
  { cat: 'hosomaki', en: 'Hosomaki Salmon', ar: 'هوسوماكي سلمون', ru: 'Хосомаки лосось', price: 220 },
  { cat: 'hosomaki', en: 'Hosomaki Shrimp', ar: 'هوسوماكي جمبري', ru: 'Хосомаки креветка', price: 220 },
  { cat: 'hosomaki', en: 'Hosomaki Eel', ar: 'هوسوماكي أنقليس', ru: 'Хосомаки угорь', price: 190 },
  { cat: 'hosomaki', en: 'Hosomaki Crab', ar: 'هوسوماكي كابوريا', ru: 'Хосомаки краб', price: 150 },
  { cat: 'hosomaki', en: 'Hosomaki Avocado', ar: 'هوسوماكي أفوكادو', ru: 'Хосомаки авокадо', price: 130 },
  { cat: 'hosomaki', en: 'Hosomaki Tuna', ar: 'هوسوماكي تونة', ru: 'Хосомаки тунец', price: 220 },

  // 6. Nigiri, Temaki & Sashimi
  { cat: 'nigiri-temaki-sashimi', en: 'Nigiri Octopus', ar: 'نيجيري أخطبوط', ru: 'Нигири осьминог', price: 50 },
  { cat: 'nigiri-temaki-sashimi', en: 'Nigiri Tuna', ar: 'نيجيري تونة', ru: 'Нигири тунец', price: 50 },
  { cat: 'nigiri-temaki-sashimi', en: 'Nigiri Salmon', ar: 'نيجيري سلمون', ru: 'Нигири лосось', price: 50 },
  { cat: 'nigiri-temaki-sashimi', en: 'Nigiri Shrimp', ar: 'نيجيري جمبري', ru: 'Нигири креветка', price: 50 },
  { cat: 'nigiri-temaki-sashimi', en: 'Nigiri Crab', ar: 'نيجيري كابوريا', ru: 'Нигири краб', price: 50 },
  { cat: 'nigiri-temaki-sashimi', en: 'Shrimp Tempura', ar: 'جمبري تمبورا', ru: 'Креветка темпура', price: 50 },
  { cat: 'nigiri-temaki-sashimi', en: 'Nigiri Eel', ar: 'نيجيري أنقليس', ru: 'Нигири угорь', price: 50 },
  { cat: 'nigiri-temaki-sashimi', en: 'Maguro Sashimi', ar: 'ساشيمي ماغورو', ru: 'Сашими магуро', price: 275 },
  { cat: 'nigiri-temaki-sashimi', en: 'Tako Sashimi', ar: 'ساشيمي أكتو', ru: 'Сашими тако', price: 290 },
  { cat: 'nigiri-temaki-sashimi', en: 'Sake Sashimi', ar: 'ساشيمي ساكي', ru: 'Сашими саке', price: 265 },
  { cat: 'nigiri-temaki-sashimi', en: 'Sushi Shop Sashimi', ar: 'ساشيمي سوشي شوب', ru: 'Сашими Sushi Shop', price: 1500 },
  { cat: 'nigiri-temaki-sashimi', en: 'Temaki Salmon', ar: 'تيماكي سلمون', ru: 'Темаки лосось', price: 180 },
  { cat: 'nigiri-temaki-sashimi', en: 'Temaki Tuna', ar: 'تيماكي تونة', ru: 'Темаки тунец', price: 180 },
  { cat: 'nigiri-temaki-sashimi', en: 'Temaki Shrimp', ar: 'تيماكي جمبري', ru: 'Темаки креветка', price: 180 },
  { cat: 'nigiri-temaki-sashimi', en: 'Sushi Shop Special Temaki', ar: 'تيماكي سوشي شوب الخاص', ru: 'Фирменный темаки', price: 250 },
  { cat: 'nigiri-temaki-sashimi', en: 'Temaki Eel', ar: 'تيماكي أنقليس', ru: 'Темаки угорь', price: 180 },

  // 7. Sets & Combo
  { cat: 'sets-combo', en: 'Cake 50 Pcs', ar: 'كيك 50 قطعة', ru: 'Торт 50 шт', price: 2000, featured: true },
  { cat: 'sets-combo', en: 'Cake 48 Pcs', ar: 'كيك 48 قطعة', ru: 'Торт 48 шт', price: 1750 },
  { cat: 'sets-combo', en: 'Cake 32 Pcs', ar: 'كيك 32 قطعة', ru: 'Торт 32 шт', price: 1500 },
  { cat: 'sets-combo', en: 'Fried Combo 40 Pcs', ar: 'كومبو مقلي 40', ru: 'Жареное комбо 40', price: 1400 },
  { cat: 'sets-combo', en: 'Voyage Combo 100', ar: 'فوياج 100', ru: 'Вояж 100', price: 3700 },
  { cat: 'sets-combo', en: 'Combo 14 Special 3', ar: 'كومبو 14 سبيشال 3', ru: 'Комбо 14 спешл 3', price: 490 },
  { cat: 'sets-combo', en: 'Kombo 12 Pcs', ar: 'كومبو 12', ru: 'Комбо 12', price: 500 },
  { cat: 'sets-combo', en: 'Mix 40', ar: 'ميكس 40', ru: 'Микс 40', price: 1250 },
  { cat: 'sets-combo', en: 'Golden Combo 40', ar: 'جولدن 40', ru: 'Голден 40', price: 1400 },
  { cat: 'sets-combo', en: 'Combo 14 Fried', ar: 'كومبو 14 مقلي', ru: 'Комбо 14 жареное', price: 680 },
  { cat: 'sets-combo', en: 'Philadelphia Almond 40', ar: 'فيلادلفيا لوز 40', ru: 'Филадельфия миндаль 40', price: 1400 },
  { cat: 'sets-combo', en: 'Rich Combo 24', ar: 'ريتش 24', ru: 'Рич 24', price: 1100 },
  { cat: 'sets-combo', en: 'Combo 20 Mix', ar: 'كومبو 20 ميكس', ru: 'Комбо 20 микс', price: 650 },
  { cat: 'sets-combo', en: 'Relax Combo 50', ar: 'ريلاكس 50', ru: 'Релакс 50', price: 1600 },
  { cat: 'sets-combo', en: 'Shrimp Lover Combo 13', ar: 'شريمب لافر 13', ru: 'Шримп лавер 13', price: 620 },
  { cat: 'sets-combo', en: 'Combo WESO 40', ar: 'كومبو ويسو 40', ru: 'Комбо WESO 40', price: 1400, featured: true },
  { cat: 'sets-combo', en: 'Light Combo 15', ar: 'لايت 15', ru: 'Лайт 15', price: 700 },
  { cat: 'sets-combo', en: 'Combo 14 Special 2', ar: 'كومبو 14 سبيشال 2', ru: 'Комбо 14 спешл 2', price: 520 },
  { cat: 'sets-combo', en: 'Combo 20 Raw', ar: 'كومبو 20 ني', ru: 'Комбо 20 сырое', price: 820 },
  { cat: 'sets-combo', en: 'Allure Combo 25', ar: 'ألور 25', ru: 'Аллюр 25', price: 1050 },
  { cat: 'sets-combo', en: 'Tuna Lover 13', ar: 'تونا لافر 13', ru: 'Туна лавер 13', price: 650 },
  { cat: 'sets-combo', en: 'Combo 24 Fried', ar: 'كومبو 24 مقلي', ru: 'Комбо 24 жареное', price: 1000 },
  { cat: 'sets-combo', en: 'Fortune Combo 75', ar: 'فورتشن 75', ru: 'Форчун 75', price: 2600, featured: true },
  { cat: 'sets-combo', en: 'Kombo 14 Special 1', ar: 'كومبو 14 سبيشال 1', ru: 'Комбо 14 спешл 1', price: 470 },
  { cat: 'sets-combo', en: 'Combo Mine 20', ar: 'كومبو ماين 20', ru: 'Комбо майн 20', price: 800 },
  { cat: 'sets-combo', en: 'Kombo 20 Fried', ar: 'كومبو 20 مقلي', ru: 'Комбо 20 жареное', price: 840 },
  { cat: 'sets-combo', en: 'Combo Exquis 16', ar: 'كومبو إكسكويز 16', ru: 'Комбо экскиз 16', price: 750 },
  { cat: 'sets-combo', en: 'Combo Aspshel 30 Bes', ar: 'كومبو أسبشل 30', ru: 'Комбо асбшел 30', price: 1200 },
  { cat: 'sets-combo', en: 'Old School Combo 40', ar: 'أولد سكول 40', ru: 'Олд скул 40', price: 1450 },
  { cat: 'sets-combo', en: 'Hosomaki Combo 30', ar: 'هوسوماكي كومبو 30', ru: 'Хосомаки комбо 30', price: 900 },

  // 8. Salads
  { cat: 'salads', en: 'Taco Salad', ar: 'سلطة تاكو', ru: 'Салат тако', price: 300 },
  { cat: 'salads', en: 'Vegetable Salad', ar: 'سلطة خضار', ru: 'Овощной салат', price: 100 },
  { cat: 'salads', en: 'Greek Salad', ar: 'سلطة يوناني', ru: 'Греческий салат', price: 180 },
  { cat: 'salads', en: 'Crab Salad', ar: 'سلطة كابوريا', ru: 'Крабовый салат', price: 250 },
  { cat: 'salads', en: 'Poke Bowl', ar: 'بوكي بول', ru: 'Поке боул', price: 50 },
  { cat: 'salads', en: 'Salmon Japanese Salad', ar: 'سلطة سلمون يابانية', ru: 'Японский салат с лососем', price: 410, featured: true },
  { cat: 'salads', en: 'Poke with Shrimp', ar: 'بوكي بالجمبري', ru: 'Поке с креветкой', price: 300 },
  { cat: 'salads', en: 'Poke with Salmon', ar: 'بوكي بالسلمون', ru: 'Поке с лососем', price: 350 },
  { cat: 'salads', en: 'Dragon Salad', ar: 'سلطة التنين', ru: 'Салат Дракон', price: 300 },
  { cat: 'salads', en: 'Salmon Avocado Salad', ar: 'سلطة سلمون أفوكادو', ru: 'Салат лосось авокадо', price: 300 },
  { cat: 'salads', en: 'Crunchy Salmon Salad', ar: 'سلطة سلمون كرانشي', ru: 'Хрустящий салат с лососем', price: 350 },
  { cat: 'salads', en: 'Seaweed Salad', ar: 'سلطة أعشاب بحرية', ru: 'Салат из водорослей', price: 250 },

  // 9. Noodles
  { cat: 'noodles', en: 'Noodles Chicken', ar: 'نودلز فراخ', ru: 'Лапша с курицей', price: 250 },
  { cat: 'noodles', en: 'Noodles Shrimp', ar: 'نودلز جمبري', ru: 'Лапша с креветкой', price: 300 },
  { cat: 'noodles', en: 'Noodles Beef', ar: 'نودلز لحم', ru: 'Лапша с говядиной', price: 270 },
  { cat: 'noodles', en: 'Noodles Vegetables', ar: 'نودلز خضار', ru: 'Лапша с овощами', price: 200 },

  // 10. Appetizers
  { cat: 'appetizers', en: 'Shrimp Tiger', ar: 'جمبري تايجر', ru: 'Креветка тигр', price: 280 },
  { cat: 'appetizers', en: 'French Fries', ar: 'بطاطس مقلية', ru: 'Картофель фри', price: 100 },
  { cat: 'appetizers', en: 'Cheese Spring Rolls', ar: 'سبرينج رول جبنة', ru: 'Спринг-роллы с сыром', price: 130 },
  { cat: 'appetizers', en: 'Shrimp Spring', ar: 'سبرينج رول جمبري', ru: 'Спринг-роллы с креветкой', price: 290 },
  { cat: 'appetizers', en: 'Mozzarella Sticks', ar: 'موتزاريلا ستيك', ru: 'Палочки моцарелла', price: 120 },
  { cat: 'appetizers', en: 'Cheese Bonbon', ar: 'بونبون جبنة', ru: 'Сырные бонбоны', price: 250 },
  { cat: 'appetizers', en: 'Sushi Shop Spring Rolls', ar: 'سبرينج رول سوشي شوب', ru: 'Спринг-роллы Sushi Shop', price: 290 },
  { cat: 'appetizers', en: 'Vegetables Spring Rolls', ar: 'سبرينج رول خضار', ru: 'Овощные спринг-роллы', price: 100 },

  // 11. Maki Large
  { cat: 'maki-large', en: 'Futomaki', ar: 'فوتوماكي', ru: 'Футомаки', price: 430, featured: true },

  // 12. Shawarma
  { cat: 'shawarma', en: 'Chicken Shawarma with Cheese Sauce & Fries', ar: 'شاورما فراخ مع صوص الجبنة والبطاطس', ru: 'Шаурма с сырным соусом и картофелем', price: 120 },
  { cat: 'shawarma', en: 'Chicken Shawarma with Cheese Sauce', ar: 'شاورما فراخ مع صوص الجبنة', ru: 'Шаурма с сырным соусом', price: 105 },
  { cat: 'shawarma', en: 'Classic Chicken Shawarma', ar: 'شاورما فراخ كلاسيك', ru: 'Классическая куриная шаурма', price: 90 },
  { cat: 'shawarma', en: 'Chicken Shawarma Fatteh', ar: 'فتة شاورما فراخ', ru: 'Фатте с шаурмой', price: 120 },
  { cat: 'shawarma', en: 'Chicken Shawarma with BBQ Sauce', ar: 'شاورما فراخ مع صوص الباربكيو', ru: 'Шаурма с BBQ соусом', price: 100 },

  // 13. Drinks
  { cat: 'drinks', en: 'Cola', ar: 'كولا', ru: 'Кола', price: 25 },
];

function esc(s) {
  return s.replace(/'/g, "''");
}

const catValues = categories
  .map((c) => `('${c.slug}', '${esc(c.name_ar)}', '${esc(c.name_en)}', '${esc(c.name_ru)}', ${c.sort})`)
  .join(',\n  ');

let sortCounters = {};
const dishInserts = dishes.map((d) => {
  sortCounters[d.cat] = (sortCounters[d.cat] || 0) + 1;
  const ar = d.ar || d.en;
  const ru = d.ru || d.en;
  const featured = d.featured ? 'true' : 'false';
  const popular = d.popular ? 'true' : 'false';
  return `  ('${esc(ar)}', '${esc(d.en)}', '${esc(ru)}', ${d.price}, '${d.cat}', true, ${sortCounters[d.cat]}, ${featured}, ${popular}, false)`;
}).join(',\n');

const sql = `-- Sushi Shop Egypt full menu seed (${dishes.length} dishes, ${categories.length} categories)
BEGIN;

DELETE FROM soshi.order_items;
DELETE FROM soshi.product_addons;
DELETE FROM soshi.banners;
DELETE FROM soshi.products;

DELETE FROM soshi.categories;

INSERT INTO soshi.categories (slug, name_ar, name_en, name_ru, sort_order)
VALUES
  ${catValues};

INSERT INTO soshi.products (
  name_ar, name_en, name_ru, price, category, is_available, sort_order,
  is_new, is_popular, is_offer, category_id
)
SELECT
  v.name_ar, v.name_en, v.name_ru, v.price, v.category, v.is_available, v.sort_order,
  v.is_new, v.is_popular, v.is_offer,
  c.id
FROM (VALUES
${dishInserts}
) AS v(name_ar, name_en, name_ru, price, category, is_available, sort_order, is_new, is_popular, is_offer)
JOIN soshi.categories c ON c.slug = v.category;

COMMIT;

SELECT c.slug, c.name_en, COUNT(p.id) AS dishes
FROM soshi.categories c
LEFT JOIN soshi.products p ON p.category_id = c.id
GROUP BY c.slug, c.name_en, c.sort_order
ORDER BY c.sort_order;
`;

console.log(sql);
console.error(`\n-- Stats: ${categories.length} categories, ${dishes.length} dishes`);
