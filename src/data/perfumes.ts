import { PerfumeProduct, ProductReview } from '../types/perfume';

export const HERO_SHUTTER_FRAMES = [
  {
    id: 'still',
    image: '/src/assets/images/hero_v3_f01b_1795471311611.jpg',
    caption: 'I · Stillness',
    subcaption: 'Maison Léonie resting on honed travertine at dusk',
  },
  {
    id: 'glance',
    image: '/src/assets/images/hero_v3_m01_02_1795471706906.jpg',
    caption: 'II · The Glance',
    subcaption: 'Turning softly from the Paris window light',
  },
  {
    id: 'turn',
    image: '/src/assets/images/hero_v3_f02_1795471329361.jpg',
    caption: 'III · The Turn',
    subcaption: 'A quiet gaze toward the amber crystal flacon',
  },
  {
    id: 'approach',
    image: '/src/assets/images/hero_v3_m02_03_1795471707581.jpg',
    caption: 'IV · Approach',
    subcaption: 'Reaching gracefully toward the travertine plinth',
  },
  {
    id: 'touch',
    image: '/src/assets/images/hero_v3_f03_1795471347870.jpg',
    caption: 'V · First Touch',
    subcaption: 'Fingertips grazing the brushed gold cap',
  },
  {
    id: 'seal',
    image: '/src/assets/images/hero_v3_m03_04_1795471709331.jpg',
    caption: 'VI · The Seal',
    subcaption: 'Parting the solid brass closure from the collar',
  },
  {
    id: 'uncap',
    image: '/src/assets/images/hero_v3_f04_1795471366738.jpg',
    caption: 'VII · Uncapping',
    subcaption: 'Lifting the gold cap cleanly above the atomizer',
  },
  {
    id: 'stone',
    image: '/src/assets/images/hero_v3_m04_05_1795471710799.jpg',
    caption: 'VIII · Poise on Stone',
    subcaption: 'Setting the brushed cap gently onto warm travertine',
  },
  {
    id: 'lift',
    image: '/src/assets/images/hero_v3_f05_1795471386253.jpg',
    caption: 'IX · The Lift',
    subcaption: 'Raising the 100 ml crystal flacon from stone',
  },
  {
    id: 'ascent',
    image: '/src/assets/images/hero_v3_m05_06_1795471711560.jpg',
    caption: 'X · Ascent',
    subcaption: 'Drawing the sunlit extrait toward her collarbone',
  },
  {
    id: 'poise',
    image: '/src/assets/images/hero_v3_f06_1795471402391.jpg',
    caption: 'XI · Intimacy',
    subcaption: 'Cradling the glass flacon gently as eyes soften',
  },
  {
    id: 'anticipation',
    image: '/src/assets/images/hero_v3_m06_07_1795471731356.jpg',
    caption: 'XII · Anticipation',
    subcaption: 'Lifting her chin into twilight air before the spray',
  },
  {
    id: 'mist',
    image: '/src/assets/images/hero_v3_f07_1795471420252.jpg',
    caption: 'XIII · First Mist',
    subcaption: 'Fine golden droplets misting across neck and shoulder',
  },
  {
    id: 'bloom',
    image: '/src/assets/images/hero_v3_f07_mist_bloom.jpg',
    caption: 'XIV · The Bloom',
    subcaption: 'A delicate cloud expanding softly in evening light',
  },
  {
    id: 'shoulder',
    image: '/src/assets/images/hero_v3_f08_1795471437770.jpg',
    caption: 'XV · Second Veil',
    subcaption: 'A backlit halo of warm amber settling on bare skin',
  },
  {
    id: 'glow',
    image: '/src/assets/images/hero_v3_m08_09_1795471737172.jpg',
    caption: 'XVI · Golden Glow',
    subcaption: 'Turning back toward the boulevard in luminous mist',
  },
  {
    id: 'aura',
    image: '/src/assets/images/hero_v3_f09_1795471455304.jpg',
    caption: 'XVII · Soft Return',
    subcaption: 'Lowering the crystal flacon as sparkles drift in air',
  },
  {
    id: 'rest',
    image: '/src/assets/images/hero_v3_f10_1795471472028.jpg',
    caption: 'XVIII · Rest',
    subcaption: 'Returning Maison Léonie beside its brushed cap',
  },
  {
    id: 'closing',
    image: '/src/assets/images/hero_v3_m10_01_1795471737158.jpg',
    caption: 'XIX · Closing Ritual',
    subcaption: 'Sealing the flacon once more as gold dust fades',
  },
  {
    id: 'sillage',
    image: '/src/assets/images/hero_v3_f10_settled_v4.jpg',
    caption: 'XX · Sillage',
    subcaption: 'Quiet stillness restored with faint scent lingering in air',
  },
];

export const ATELIER_IMAGE = '/src/assets/images/atelier_grasse_organ_1795464161874.jpg';

export interface OlfactiveNoteDetail {
  name: string;
  tier: 'Top Notes' | 'Heart Notes' | 'Base Notes';
  origin: string;
  profile: string;
  family: string;
}

export const OLFACTIVE_NOTES_LIBRARY: OlfactiveNoteDetail[] = [
  {
    name: 'Bergamot',
    tier: 'Top Notes',
    origin: 'Reggio Calabria, Italy',
    profile: 'Crisp sunlit peel with radiant mineral brightness and bitter green lift.',
    family: 'Citrus',
  },
  {
    name: 'Neroli',
    tier: 'Top Notes',
    origin: 'Vallauris, Provence',
    profile: 'Honeyed orange blossom distilled at dawn for luminous transparent freshness.',
    family: 'Fresh',
  },
  {
    name: 'Saffron',
    tier: 'Top Notes',
    origin: 'La Mancha, Spain',
    profile: 'Velvety spiced warmth with subtle suede and metallic crimson threads.',
    family: 'Oriental',
  },
  {
    name: 'Jasmine',
    tier: 'Heart Notes',
    origin: 'Grasse, France',
    profile: 'Opulent nocturnal white petals picked before sunrise for intoxicating radiance.',
    family: 'Floral',
  },
  {
    name: 'Rose',
    tier: 'Heart Notes',
    origin: 'Isparta & Grasse',
    profile: 'Velvet Damascus rose facets balanced with spiced jammy depth.',
    family: 'Floral',
  },
  {
    name: 'Iris',
    tier: 'Heart Notes',
    origin: 'Florence, Italy',
    profile: 'Aged pallida orris butter lending cool suede-like powdery elegance.',
    family: 'Floral',
  },
  {
    name: 'Vanilla',
    tier: 'Base Notes',
    origin: 'Sava, Madagascar',
    profile: 'Dark cured bourbon pod rich with smoky liqueur and warm cashmere sweetness.',
    family: 'Gourmand',
  },
  {
    name: 'Sandalwood',
    tier: 'Base Notes',
    origin: 'Mysore Heritage Groves',
    profile: 'Creamy, meditative lactonic heartwood that anchors sillage for hours.',
    family: 'Woody',
  },
  {
    name: 'Amber',
    tier: 'Base Notes',
    origin: 'Cistus Labdanum & Benzoin',
    profile: 'Resinous golden warmth glowing like candlelight on warm stone.',
    family: 'Oriental',
  },
  {
    name: 'Musk',
    tier: 'Base Notes',
    origin: 'Ambrette Botanical Accord',
    profile: 'Second-skin crystalline warmth that softens sharp edges into silk.',
    family: 'Fresh',
  },
];

export const INITIAL_PERFUMES: PerfumeProduct[] = [
  {
    id: 'voie-dor',
    slug: 'voie-dor',
    name: "Voie d'Or",
    brand: 'Maison Léonie · Collection Privée',
    subtitle: 'Signature Extrait de Parfum',
    category: 'Limited Editions',
    fragranceFamily: 'Oriental',
    concentration: 'Extrait de Parfum',
    longevityHours: 14,
    intensity: 'Statement',
    price: 340,
    volumeMl: 100,
    stockCount: 14,
    popularityScore: 99,
    shortDescription:
      'A luminous veil of Calabrian bergamot, Grasse jasmine, and golden ambergris.',
    description:
      "Created in our Rue Saint-Honoré laboratory to mark the Maison's centenary reserve, Voie d'Or opens with shimmering Calabrian bergamot and saffron threads before unfurling a nocturnal heart of hand-harvested Grasse jasmine and Florentine orris butter. Anchored in resinous amber, aged sandalwood, and Madagascar vanilla pod, it lingers like warm silk long after midnight.",
    perfumerNote:
      'Macerated for twelve weeks in small oak vessels to allow the orris and labdanum resins to fuse seamlessly.',
    topNotes: ['Bergamot', 'Saffron', 'White Pepper'],
    heartNotes: ['Jasmine', 'Iris', 'Rose'],
    baseNotes: ['Amber', 'Sandalwood', 'Vanilla'],
    occasion: ['Black Tie', 'Evening', 'Signature'],
    season: ['Autumn', 'Winter'],
    images: [
      '/src/assets/images/bottle_santal_imperial_1795464160135.jpg',
      '/src/assets/images/hero_shutter_pickup_1795464157955.jpg',
      '/src/assets/images/hero_v3_f07_1795471420252.jpg',
      '/src/assets/images/hero_shutter_atmosphere_1795464158053.jpg',
    ],
    ratingAvg: 4.9,
    reviewCount: 2,
    lifeChapter: 'The Golden Hour of Self-Actualization',
    emotionalResonance: 'Radiant Dignity · Quiet Sovereignty · Unshakable Calm',
    lifeMemoryQuote: 'For the evening you walked into the room knowing you no longer needed anyone’s permission to exist.',
    frequencyResonance: '528 Hz Solar Radiance',
  },
  {
    id: 'ember-noir',
    slug: 'ember-noir',
    name: 'Ember Noir',
    brand: 'Maison Léonie · Les Extraits',
    subtitle: 'Smoked Oud & Cistus Amber',
    category: 'Best Sellers',
    fragranceFamily: 'Woody',
    concentration: 'Extrait de Parfum',
    longevityHours: 16,
    intensity: 'Statement',
    price: 285,
    volumeMl: 100,
    stockCount: 22,
    popularityScore: 96,
    shortDescription:
      'Charred incense wood wrapped in cistus amber, black cardamom, and velvety vanilla.',
    description:
      'Ember Noir captures the hush of an autumn library after dusk. Smoky Assam oud and roasted cardamom give way to a supple leather-rose core, settling on skin with golden labdanum amber and dark vanilla bean.',
    perfumerNote: 'Blended at 32% pure aromatic oil concentration for architectural sillage.',
    topNotes: ['Cardamom', 'Bergamot', 'Incense'],
    heartNotes: ['Rose', 'Smoked Oud', 'Labdanum'],
    baseNotes: ['Amber', 'Vanilla', 'Sandalwood'],
    occasion: ['Evening', 'Winter Gala', 'Signature'],
    season: ['Autumn', 'Winter'],
    images: [
      '/src/assets/images/bottle_oud_velours_1795464159199.jpg',
      '/src/assets/images/hero_shutter_atmosphere_1795464158053.jpg',
      '/src/assets/images/atelier_grasse_organ_1795464161874.jpg',
    ],
    ratingAvg: 4.8,
    reviewCount: 2,
    lifeChapter: 'The Midnight Metamorphosis & Inner Power',
    emotionalResonance: 'Grounding Courage · Sacred Mystery · Resilient Strength',
    lifeMemoryQuote: 'For the rainy night you realized heartbreak was not an ending, but the soil where your courage grew.',
    frequencyResonance: '432 Hz Earth Anchor',
  },
  {
    id: 'lumiere-cherie',
    slug: 'lumiere-cherie',
    name: 'Lumière Chérie',
    brand: 'Maison Léonie · Collection Privée',
    subtitle: 'Iris Pallida & White Musk',
    category: 'Best Sellers',
    fragranceFamily: 'Floral',
    concentration: 'Eau de Parfum',
    longevityHours: 10,
    intensity: 'Moderate',
    price: 245,
    volumeMl: 100,
    stockCount: 30,
    popularityScore: 94,
    shortDescription:
      'Morning light filtered through Florentine iris, peony silk, and cashmere musk.',
    description:
      'Effortless and sculptural, Lumière Chérie marries cool iris pallida rhizome with crisp pear blossom and freshly laundered white musk. Crafted for quiet daytime elegance and intimate proximity.',
    perfumerNote: 'Uses three-year aged Florentine iris butter for an unmistakable suede finish.',
    topNotes: ['Bergamot', 'Neroli', 'Pear Blossom'],
    heartNotes: ['Iris', 'Jasmine', 'White Peony'],
    baseNotes: ['Musk', 'Sandalwood', 'Ambrette'],
    occasion: ['Daytime', 'Gallery', 'Bridal'],
    season: ['Spring', 'Summer'],
    images: [
      '/src/assets/images/bottle_iris_blanc_1795464159068.jpg',
      '/src/assets/images/hero_shutter_mist_1795464158097.jpg',
      '/src/assets/images/atelier_grasse_organ_1795464161874.jpg',
    ],
    ratingAvg: 4.9,
    reviewCount: 2,
    lifeChapter: 'The Morning of Gentle Rebirth',
    emotionalResonance: 'Innocence Restored · Tender Clarity · Luminous Grace',
    lifeMemoryQuote: 'For the first Sunday you woke up without anxiety in your chest, listening to the rain give way to sun.',
    frequencyResonance: '639 Hz Heart Renewal',
  },
  {
    id: 'aurore-luminaire',
    slug: 'aurore-luminaire',
    name: 'Aurore Luminaire',
    brand: 'Maison Léonie · Atelier Botanique',
    subtitle: 'Golden Neroli & Fig Nectar',
    category: 'New Arrivals',
    fragranceFamily: 'Gourmand',
    concentration: 'Eau de Parfum',
    longevityHours: 11,
    intensity: 'Moderate',
    price: 260,
    volumeMl: 100,
    stockCount: 18,
    popularityScore: 91,
    shortDescription:
      'Sun-drenched Mediterranean neroli glazed with wild fig honey and toasted tonka.',
    description:
      'Inspired by late afternoon sun across Provençal orchards, Aurore Luminaire pairs sparkling bitter orange blossom with ripe fig nectar and golden benzoin, unfolding into a luminous gourmand trail that never turns heavy.',
    perfumerNote: 'Distilled from spring harvest bitter orange flowers in Vallauris.',
    topNotes: ['Neroli', 'Bergamot', 'Mandarin Leaf'],
    heartNotes: ['Jasmine', 'Fig Nectar', 'Orange Blossom'],
    baseNotes: ['Vanilla', 'Amber', 'Musk'],
    occasion: ['Daytime', 'Resort', 'Brunch'],
    season: ['Spring', 'Summer', 'Autumn'],
    images: [
      '/src/assets/images/bottle_neroli_soleil_1795464160313.jpg',
      '/src/assets/images/hero_shutter_pickup_1795464157955.jpg',
      '/src/assets/images/atelier_grasse_organ_1795464161874.jpg',
    ],
    ratingAvg: 4.7,
    reviewCount: 1,
    lifeChapter: 'Youth, Saltwater & Wild Freedom',
    emotionalResonance: 'Effortless Joy · Sunlit Optimism · Spontaneous Laughter',
    lifeMemoryQuote: 'For windows rolled down on coastal cliffs, wind in your hair, and laughing until your ribs ached.',
    frequencyResonance: '741 Hz Vitality & Expression',
  },
  {
    id: 'nocturne-ambre',
    slug: 'nocturne-ambre',
    name: 'Nocturne Ambre',
    brand: 'Maison Léonie · Les Extraits',
    subtitle: 'Crimson Rose & Velvet Amber',
    category: 'Exclusive Collections',
    fragranceFamily: 'Floral',
    concentration: 'Extrait de Parfum',
    longevityHours: 14,
    intensity: 'Statement',
    price: 295,
    volumeMl: 100,
    stockCount: 8,
    popularityScore: 93,
    shortDescription:
      'Velvet Damask rose infused with pink pepper, dark patchouli, and molten amber.',
    description:
      'A nocturnal study in rose chiaroscuro. Nocturne Ambre layers hand-picked Damask rose absolute over spiced saffron and dark patchouli leaf, smoothed into an enveloping amber-vanilla drydown.',
    perfumerNote: 'Numbered batch bottle finished in deep garnet smoked crystal.',
    topNotes: ['Saffron', 'Pink Pepper', 'Bergamot'],
    heartNotes: ['Rose', 'Jasmine', 'Geranium'],
    baseNotes: ['Amber', 'Vanilla', 'Musk'],
    occasion: ['Evening', 'Black Tie', 'Date Night'],
    season: ['Autumn', 'Winter'],
    images: [
      '/src/assets/images/bottle_rose_nuit_1795464160072.jpg',
      '/src/assets/images/hero_shutter_atmosphere_1795464158053.jpg',
      '/src/assets/images/hero_shutter_mist_1795464158097.jpg',
    ],
    ratingAvg: 4.9,
    reviewCount: 2,
    lifeChapter: 'The Unspoken Promise & Deep Love',
    emotionalResonance: 'Intimate Devotion · Hypnotic Warmth · Lingering Memory',
    lifeMemoryQuote: 'For two hands touching under a candlelit table, knowing your whole world had just shifted forever.',
    frequencyResonance: '528 Hz Heart Devotion',
  },
  {
    id: 'sandalwood-amber',
    slug: 'sandalwood-amber',
    name: 'Sandalwood Amber',
    brand: 'Maison Léonie · Collection Privée',
    subtitle: 'Mysore Sandalwood & Cedar',
    category: 'Best Sellers',
    fragranceFamily: 'Woody',
    concentration: 'Eau de Parfum',
    longevityHours: 12,
    intensity: 'Moderate',
    price: 230,
    volumeMl: 100,
    stockCount: 0, // Intentionally 0 so Restock Alerts can be demonstrated live!
    popularityScore: 89,
    shortDescription:
      'Creamy Mysore sandalwood, Atlas cedar, and sunlit amber resin in quiet equilibrium.',
    description:
      'Clean architectural woodwork refined for everyday distinction. Sandalwood Amber balances dry Atlas cedar and crushed cardamom over a deeply creamy sandalwood heart and warm mineral skin musk.',
    perfumerNote: 'Currently awaiting our winter maceration release; reserve a restock alert.',
    topNotes: ['Cardamom', 'Bergamot', 'Cypress'],
    heartNotes: ['Iris', 'Cedarwood', 'Violet Leaf'],
    baseNotes: ['Sandalwood', 'Amber', 'Musk'],
    occasion: ['Office', 'Daytime', 'Evening'],
    season: ['Autumn', 'Winter', 'Spring'],
    images: [
      '/src/assets/images/bottle_santal_imperial_1795464160135.jpg',
      '/src/assets/images/atelier_grasse_organ_1795464161874.jpg',
      '/src/assets/images/hero_shutter_pickup_1795464157955.jpg',
    ],
    ratingAvg: 4.8,
    reviewCount: 1,
    lifeChapter: 'The Solitary Sanctuary & Wisdom',
    emotionalResonance: 'Mindful Stillness · Ancestral Grace · Meditative Peace',
    lifeMemoryQuote: 'For the quiet hour beside the rain-streaked window, reading old letters and feeling completely at home.',
    frequencyResonance: '396 Hz Root Grounding',
  },
  {
    id: 'leclat-celeste',
    slug: 'leclat-celeste',
    name: "L'Éclat",
    brand: 'Maison Léonie · Les Eaux',
    subtitle: 'Calabrian Bergamot & White Tea',
    category: 'New Arrivals',
    fragranceFamily: 'Citrus',
    concentration: 'Eau de Toilette',
    longevityHours: 7,
    intensity: 'Intimate',
    price: 215,
    volumeMl: 100,
    stockCount: 26,
    popularityScore: 87,
    shortDescription:
      'Sparkling cold-pressed bergamot zest, silver needle tea, and crisp mineral musk.',
    description:
      "Pure coastal clarity bottled. L'Éclat opens with first-press Calabrian bergamot and green petitgrain before settling into steamed white tea, neroli mist, and clean cedar-musk.",
    perfumerNote: 'Cold-filtered to preserve the delicate volatile citrus esters.',
    topNotes: ['Bergamot', 'Neroli', 'Lemon Verbena'],
    heartNotes: ['White Tea', 'Jasmine', 'Petitgrain'],
    baseNotes: ['Musk', 'Cedarwood', 'Ambrette'],
    occasion: ['Daytime', 'Travel', 'Summer'],
    season: ['Spring', 'Summer'],
    images: [
      '/src/assets/images/bottle_bergamote_celeste_1795464161390.jpg',
      '/src/assets/images/atelier_grasse_organ_1795464161874.jpg',
      '/src/assets/images/hero_shutter_mist_1795464158097.jpg',
    ],
    ratingAvg: 4.7,
    reviewCount: 1,
    lifeChapter: 'First Light & Clear Beginnings',
    emotionalResonance: 'Crystal Clarity · Fresh Perspective · Gentle Awakening',
    lifeMemoryQuote: 'For the morning you set out on your own path with nothing in your hands but faith.',
    frequencyResonance: '852 Hz Clear Mind',
  },
  {
    id: 'coffret-decouverte',
    slug: 'coffret-decouverte',
    name: 'Le Coffret Découverte',
    brand: "Maison Léonie · Coffret d'Atelier",
    subtitle: 'Six-Vial Atelier Discovery Archive',
    category: 'Exclusive Collections',
    fragranceFamily: 'Fresh',
    concentration: 'Eau de Parfum',
    longevityHours: 10,
    intensity: 'Moderate',
    price: 165,
    volumeMl: 60,
    stockCount: 35,
    popularityScore: 95,
    shortDescription:
      'Six 10ml travel atomizers showcasing every Maison Léonie olfactive signature.',
    description:
      "Designed for unhurried exploration on skin across days and seasons. Includes Voie d'Or, Ember Noir, Lumière Chérie, Aurore Luminaire, Nocturne Ambre, and L'Éclat, presented in a linen-bound archive box with a $40 privilege toward your next full flacon.",
    perfumerNote: 'Includes hand-stamped blotter cards and layering guide from Grasse.',
    topNotes: ['Bergamot', 'Neroli', 'Saffron'],
    heartNotes: ['Jasmine', 'Rose', 'Iris'],
    baseNotes: ['Amber', 'Sandalwood', 'Vanilla'],
    occasion: ['Gift', 'Travel', 'Discovery'],
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    images: [
      '/src/assets/images/atelier_grasse_organ_1795464161874.jpg',
      '/src/assets/images/bottle_iris_blanc_1795464159068.jpg',
      '/src/assets/images/bottle_oud_velours_1795464159199.jpg',
    ],
    ratingAvg: 4.9,
    reviewCount: 2,
    lifeChapter: 'The Anthology of a Lifetime',
    emotionalResonance: 'Curiosity · Transformation · Boundless Possibility',
    lifeMemoryQuote: 'For the wanderer who understands that every chapter of life requires its own secret scent.',
    frequencyResonance: '528 Hz Complete Harmony',
  },
];

export const SEED_REVIEWS: Record<string, ProductReview[]> = {
  'voie-dor': [
    {
      id: 'rev-voie-1',
      authorId: 'atelier-patron-1',
      authorName: 'Camille Laurent',
      rating: 5,
      title: 'Liquid candlelight on cashmere',
      comment:
        'The saffron and iris transition is extraordinary. Twelve hours later it still leaves an unmistakable golden trail on my coat lapel.',
      verifiedPurchase: true,
      createdAt: '2026-10-18',
    },
    {
      id: 'rev-voie-2',
      authorId: 'atelier-patron-2',
      authorName: 'Julian Vance',
      rating: 5,
      title: 'Effortlessly commanding without shouting',
      comment:
        'I wore this to an evening gallery opening in Paris and three guests asked for the house name. Balanced, resinous, deeply refined.',
      verifiedPurchase: true,
      createdAt: '2026-11-02',
    },
  ],
  'ember-noir': [
    {
      id: 'rev-ember-1',
      authorId: 'atelier-patron-3',
      authorName: 'Elena Rostova',
      rating: 5,
      title: 'Smoky elegance perfected',
      comment:
        'Most oud fragrances feel medicinal; Ember Noir wraps the smoke in warm cardamom and dark vanilla. Truly enveloping.',
      verifiedPurchase: true,
      createdAt: '2026-10-29',
    },
  ],
  'lumiere-cherie': [
    {
      id: 'rev-lum-1',
      authorId: 'atelier-patron-4',
      authorName: 'Sophie Moreau',
      rating: 5,
      title: 'My daily second skin',
      comment:
        'The travertine cap alone feels like sculpture on my vanity, and the iris-musk drydown lasts through an entire workday.',
      verifiedPurchase: true,
      createdAt: '2026-11-05',
    },
  ],
  'nocturne-ambre': [
    {
      id: 'rev-noc-1',
      authorId: 'atelier-patron-5',
      authorName: 'Margaux Delacroix',
      rating: 5,
      title: 'A dark, velvety rose masterpiece',
      comment:
        'Never sweet or powdery—this is Damask rose lit by amber embers. Worth every cent.',
      verifiedPurchase: true,
      createdAt: '2026-10-12',
    },
  ],
};

export interface LifeChapter {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
  quote: string;
  narrative: string;
  associatedProductId: string;
  resonantAura: string;
  frequency: string;
  image: string;
  keyNotes: string[];
  lifeAnchorPrompt: string;
}

export const LIFE_CHAPTERS: LifeChapter[] = [
  {
    id: 'aube',
    numeral: 'I',
    title: 'The Dawn of Clear Ambition',
    subtitle: 'Calabrian Bergamot · White Tea · Cedar',
    quote: 'The quiet hour before anyone else wakes up, when your life belongs only to you.',
    narrative:
      'There is a sacred moment when you sit alone with a warm cup before the world rushes in. The air is cold, your mind is luminous, and you feel the quiet thrill of your own strength. L’Éclat was blended to anchor this lucid clarity—a breath of brisk citrus and mountain tea that reminds you what you are capable of building.',
    associatedProductId: 'leclat-celeste',
    resonantAura: 'Lucid Clarity · Unshakable Dignity',
    frequency: '852 Hz Clear Mind',
    image: '/src/assets/images/bottle_bergamote_celeste_1795464161390.jpg',
    keyNotes: ['Bergamot', 'White Tea', 'Lemon Verbena', 'Cedarwood'],
    lifeAnchorPrompt: 'For the morning you decided to trust yourself completely.',
  },
  {
    id: 'renaissance',
    numeral: 'II',
    title: 'The Season of Gentle Rebirth',
    subtitle: 'Florentine Iris · White Peony · Ambrette Silk',
    quote: 'You survived the long winter. Now allow the light back into your hands.',
    narrative:
      'After the storms, after the heartbreak, there comes an afternoon when the weight abruptly lifts from your ribs. You notice the sun filtering through the linen curtains. You are not scarred; you are deepened. Lumière Chérie wraps skin in buttery Florentine iris and pristine musk—a tender, luminous shield that honors how soft your heart remained.',
    associatedProductId: 'lumiere-cherie',
    resonantAura: 'Healing Stillness · Pure Grace',
    frequency: '639 Hz Heart Renewal',
    image: '/src/assets/images/bottle_iris_blanc_1795464159068.jpg',
    keyNotes: ['Florentine Iris', 'Pear Blossom', 'Peony Silk', 'Cashmere Musk'],
    lifeAnchorPrompt: 'For the day you finally felt peaceful in your own skin.',
  },
  {
    id: 'metamorphose',
    numeral: 'III',
    title: 'The Night Courage Found You',
    subtitle: 'Assam Smoked Oud · Roasted Cardamom · Cistus Amber',
    quote: 'You did not shrink to fit the room. You grew into the shadow.',
    narrative:
      'Walking through rainy cobblestones at 2 AM after taking a leap that frightened you. Your coat smells of smoke, damp night air, and quiet ferocity. Ember Noir holds the alchemy of transformation—charred Assam woods fused with molten labdanum amber. It is the armor you slip into when you step onto life’s greatest stage.',
    associatedProductId: 'ember-noir',
    resonantAura: 'Sacred Power · Grounded Sovereignty',
    frequency: '432 Hz Earth Anchor',
    image: '/src/assets/images/bottle_oud_velours_1795464159199.jpg',
    keyNotes: ['Smoked Oud', 'Cardamom', 'Cistus Amber', 'Dark Vanilla'],
    lifeAnchorPrompt: 'For the milestone when you chose truth over approval.',
  },
  {
    id: 'amour',
    numeral: 'IV',
    title: 'An Unspoken Intimacy',
    subtitle: 'Damask Rose · Pink Pepper · Golden Amber',
    quote: 'Some things are never said aloud because words would only diminish them.',
    narrative:
      'A glance exchanged across a crowded Paris bistrot. Two hands resting beside each other in the dark, electricity passing between pulse points. Nocturne Ambre is a chiaroscuro of crimson Damask roses dipped in hot amber and spiced saffron—the scent of skin touched by someone you will never be able to forget.',
    associatedProductId: 'nocturne-ambre',
    resonantAura: 'Hypnotic Devotion · Unspoken Magnetic Heat',
    frequency: '528 Hz Heart Devotion',
    image: '/src/assets/images/bottle_rose_nuit_1795464160072.jpg',
    keyNotes: ['Damask Rose', 'Saffron', 'Molten Amber', 'Pink Pepper'],
    lifeAnchorPrompt: 'For the memory of love that reshaped your entire trajectory.',
  },
  {
    id: 'sanctuaire',
    numeral: 'V',
    title: 'Solitude as Sacred Sanctuary',
    subtitle: 'Mysore Sandalwood · Atlas Cedar · Warm Musk',
    quote: 'To love your own company is to possess a home that can never be lost.',
    narrative:
      'Surrounded by shelves of worn books, rain softly drumming against the studio skylight. No calls to answer. No masks to wear. Sandalwood Amber balances aged cedar woodwork with warm skin musk, evoking the ancient serenity of someone who has made peace with silence and discovered their soul inside it.',
    associatedProductId: 'sandalwood-amber',
    resonantAura: 'Contemplative Stillness · Centered Grace',
    frequency: '396 Hz Root Grounding',
    image: '/src/assets/images/bottle_santal_imperial_1795464160135.jpg',
    keyNotes: ['Mysore Sandalwood', 'Atlas Cedar', 'Cardamom', 'Skin Musk'],
    lifeAnchorPrompt: 'For the sacred sanctuary you carry within yourself anywhere.',
  },
  {
    id: 'liberte',
    numeral: 'VI',
    title: 'Golden Wind & Wild Freedom',
    subtitle: 'Provençal Neroli · Fig Nectar · Bitter Orange',
    quote: 'The road unfolding toward the sea, windows wide, heart wide open.',
    narrative:
      'Bare feet pressed against warm limestone, sea spray tingling on sun-warmed skin, wind whipping through your hair as laughter spills into the Mediterranean dusk. Aurore Luminaire is pure, unfiltered life—honeyed neroli blossom, ripe green figs, and golden benzoin that make every ordinary day feel like an eternal summer.',
    associatedProductId: 'aurore-luminaire',
    resonantAura: 'Unbridled Vitality · Radiance & Joy',
    frequency: '741 Hz Vitality & Freedom',
    image: '/src/assets/images/bottle_neroli_soleil_1795464160313.jpg',
    keyNotes: ['Bitter Orange', 'Neroli', 'Wild Fig Nectar', 'Golden Benzoin'],
    lifeAnchorPrompt: 'For the wild, laughing freedom of your most unforgettable summer.',
  },
];

export interface HumanChronicle {
  id: string;
  author: string;
  city: string;
  profession: string;
  title: string;
  quote: string;
  story: string;
  scentWorn: string;
  scentId: string;
  year: string;
  image: string;
}

export const HUMAN_CHRONICLES: HumanChronicle[] = [
  {
    id: 'chronicle-1',
    author: 'Elena Vance-Rostova',
    city: 'Vienna',
    profession: 'Concert Cellist',
    title: 'The Symphony Before the Dawn',
    quote: 'In the dressing room before my Carnegie Hall debut, my hands were shaking. One breath of iris on my wrists grounded me into something eternal.',
    story:
      'For eight years I doubted if my music was worthy of the world. On the evening of the debut, the backstage air smelled of rosin and anxiety. I opened my flacon of Lumière Chérie. The cool Florentine iris was like a hand resting on my shoulder, reminding me that music is not a performance—it is a confession of love. I walked out and played without fear.',
    scentWorn: 'Lumière Chérie',
    scentId: 'lumiere-cherie',
    year: '2024',
    image: '/src/assets/images/hero_v3_f06_1795471402391.jpg',
  },
  {
    id: 'chronicle-2',
    author: 'Julien Delacroix',
    city: 'Paris & Grasse',
    profession: 'Restoration Architect',
    title: 'My Father’s Suede Lapel',
    quote: 'Grief is strange. You think you have forgotten someone’s voice until an accord of warm sandalwood and amber brings them standing right beside you.',
    story:
      'My father passed when I was twenty-two. For fifteen years I looked for him in buildings and old sketches. When I first encountered Voie d’Or in the Grasse atelier, the combination of amber resin and dry cedar triggered a Proustian shock so visceral tears welled in my eyes. It was the exact aura of his study at 6 PM on autumn evenings. Scent is the only bridge between the living and the departed.',
    scentWorn: "Voie d'Or",
    scentId: 'voie-dor',
    year: '2025',
    image: '/src/assets/images/atelier_grasse_organ_1795464161874.jpg',
  },
  {
    id: 'chronicle-3',
    author: 'Marcus & Chloé K.',
    city: 'Kyoto & Positano',
    profession: 'Botanical Artists',
    title: 'The Vow We Kept in the Wind',
    quote: 'We didn’t want a photographer in our faces. We wanted a scent that would instantly return us to the cliffside where we promised our lives.',
    story:
      'We eloped on an ancient terrace overlooking the Tyrrhenian Sea. Just two witness rings and a single bottle of Aurore Luminaire. Now, every year on our anniversary, whether we are in a snowy train in Hokkaido or our apartment in Kyoto, we spray that same neroli mist. In one second, the warm sea wind returns to our skin. It is our portable altar.',
    scentWorn: 'Aurore Luminaire',
    scentId: 'aurore-luminaire',
    year: '2023',
    image: '/src/assets/images/bottle_neroli_soleil_1795464160313.jpg',
  },
];

export interface DailyRitual {
  time: string;
  phase: string;
  lifeContext: string;
  quote: string;
  recommendedScent: string;
  scentId: string;
  notes: string[];
  ritualAction: string;
}

export const DAILY_RITUALS: DailyRitual[] = [
  {
    time: '07:00',
    phase: 'First Light & Awakening',
    lifeContext: 'Setting your emotional compass before the world makes demands of you.',
    quote: 'Clear the mental fog. Breathe in the morning before stepping into your arena.',
    recommendedScent: "L'Éclat",
    scentId: 'leclat-celeste',
    notes: ['Calabrian Bergamot', 'White Tea', 'Crisp Petitgrain'],
    ritualAction: 'Mist high into the morning air and walk through the descending veil.',
  },
  {
    time: '13:00',
    phase: 'Midday Poise & Flow',
    lifeContext: 'Re-centering your calm in the middle of deadlines, meetings, and decisions.',
    quote: 'When chaos swirls around you, your fragrance is your invisible private sanctuary.',
    recommendedScent: 'Lumière Chérie',
    scentId: 'lumiere-cherie',
    notes: ['Florentine Iris', 'Peony Silk', 'Cashmere Musk'],
    ritualAction: 'Touch lightly to pulse points at the wrists and behind the ears.',
  },
  {
    time: '19:30',
    phase: 'Twilight Metamorphosis',
    lifeContext: 'Shedding the professional armor; stepping into intimacy, art, and celebration.',
    quote: 'The day is finished. The evening belongs to memory and desire.',
    recommendedScent: "Voie d'Or",
    scentId: 'voie-dor',
    notes: ['Calabrian Saffron', 'Grasse Jasmine', 'Aged Sandalwood'],
    ritualAction: 'Apply across collarbones and along the nape of the neck.',
  },
  {
    time: '23:30',
    phase: 'Sacred Slumber & Pillow Mist',
    lifeContext: 'Returning to total peace; releasing all worries into soft cedar and vanilla.',
    quote: 'Sleep wrapped in warmth, knowing tomorrow is an unwritten page.',
    recommendedScent: 'Sandalwood Amber',
    scentId: 'sandalwood-amber',
    notes: ['Mysore Sandalwood', 'Atlas Cedar', 'Mineral Amber'],
    ritualAction: 'Gently mist linen sheets thirty minutes before closing your eyes.',
  },
];

export const PROUSTIAN_PRESETS = [
  {
    prompt: 'Walking through wet autumn leaves after rain in Paris',
    category: 'Memory of Nostalgia',
    resonantNotes: ['Cedarwood', 'Cardamom', 'Smoked Oud', 'Rain Petrichor'],
    scentId: 'ember-noir',
    scentName: 'Ember Noir',
    whyItRelates:
      'The wet leaf tannins and cold air find their soulmate in smoky Assam oud and roasted cardamom, anchoring the bittersweet beauty of passing seasons.',
  },
  {
    prompt: 'My mother’s freshly laundered linen sheets drying in summer sun',
    category: 'Memory of Sanctuary',
    resonantNotes: ['Florentine Iris', 'Ambrette Seed', 'White Musk', 'Pear Blossom'],
    scentId: 'lumiere-cherie',
    scentName: 'Lumière Chérie',
    whyItRelates:
      'Iris pallida creates that exact sublime feeling of sunlit cotton against skin—clean, tender, and deeply protective like a mother’s embrace.',
  },
  {
    prompt: 'Late night conversation on a balcony with someone you love',
    category: 'Memory of Intimacy',
    resonantNotes: ['Damask Rose', 'Pink Pepper', 'Golden Amber', 'Vanilla Bean'],
    scentId: 'nocturne-ambre',
    scentName: 'Nocturne Ambre',
    whyItRelates:
      'Warm night breeze and quiet whispered confessions are captured in velvet rose petals and amber embers that cling to wool and skin.',
  },
  {
    prompt: 'Stepping onto a foreign coast for the first time with an open heart',
    category: 'Memory of Freedom',
    resonantNotes: ['Bitter Orange', 'Neroli Blossom', 'Wild Fig Nectar', 'Sea Salt'],
    scentId: 'aurore-luminaire',
    scentName: 'Aurore Luminaire',
    whyItRelates:
      'The thrilling rush of leaving your old life behind is illuminated with golden neroli and sparkling fig nectar carried on saltwater winds.',
  },
  {
    prompt: 'The quiet pride after finishing a life’s masterpiece or dream',
    category: 'Memory of Sovereignty',
    resonantNotes: ['Calabrian Bergamot', 'Grasse Jasmine', 'Aged Sandalwood', 'Saffron'],
    scentId: 'voie-dor',
    scentName: "Voie d'Or",
    whyItRelates:
      'The golden radiance of personal triumph. It projects sovereign poise and warm resinous depth that demands neither apology nor permission.',
  },
];
