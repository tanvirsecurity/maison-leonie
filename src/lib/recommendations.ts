import {
  FragranceFamily,
  OrderRecord,
  PerfumeProduct,
  QuizAnswers,
} from '../types/perfume';

export interface QuizRecommendation {
  product: PerfumeProduct;
  matchPercent: number;
  explanation: string;
}

export function computeQuizRecommendations(
  products: PerfumeProduct[],
  answers: QuizAnswers
): QuizRecommendation[] {
  const scored = products.map((product) => {
    let score = 42;
    const reasons: string[] = [];

    if (answers.families.includes(product.fragranceFamily)) {
      score += 24;
      reasons.push(`aligned with your ${product.fragranceFamily.toLowerCase()} sensibility`);
    }

    const allNotes = [...product.topNotes, ...product.heartNotes, ...product.baseNotes].map((n) =>
      n.toLowerCase()
    );
    const matchedNotes = answers.notes.filter((note) =>
      allNotes.some((pn) => pn.includes(note.toLowerCase()))
    );
    if (matchedNotes.length > 0) {
      score += Math.min(20, matchedNotes.length * 8);
      reasons.push(`composed around ${matchedNotes.slice(0, 2).join(' and ').toLowerCase()}`);
    }

    if (product.intensity === answers.intensity) {
      score += 10;
      reasons.push(`calibrated to your ${answers.intensity.toLowerCase()} projection preference`);
    }

    if (
      answers.timeOfDay === 'Versatile' ||
      product.occasion.some((o) =>
        answers.timeOfDay === 'Daytime'
          ? ['Daytime', 'Office', 'Gallery', 'Brunch', 'Travel'].includes(o)
          : ['Evening', 'Black Tie', 'Date Night', 'Winter Gala'].includes(o)
      )
    ) {
      score += 6;
    }

    if (product.season.includes(answers.season)) {
      score += 6;
      reasons.push(`blended to bloom beautifully in ${answers.season.toLowerCase()}`);
    }

    const boundedScore = Math.min(99, score);
    const explanation =
      reasons.length > 0
        ? `Selected because it is ${reasons.join(', ')}.`
        : `A balanced ${product.concentration.toLowerCase()} pairing for your ${answers.lifestyle.toLowerCase()} cadence.`;

    return {
      product,
      matchPercent: boundedScore,
      explanation,
    };
  });

  return scored.sort((a, b) => b.matchPercent - a.matchPercent).slice(0, 3);
}

export function getPersonalizedRecommendations(
  products: PerfumeProduct[],
  options: {
    recentlyViewedIds: string[];
    wishlistIds: string[];
    orders: OrderRecord[];
    preferredFamilies: FragranceFamily[];
    favoriteNotes: string[];
  }
): {
  selectedForYou: PerfumeProduct[];
  youMayAlsoLove: PerfumeProduct[];
  completeCollection: PerfumeProduct[];
} {
  const purchasedIds = new Set(
    options.orders.flatMap((o) => o.items.map((item) => item.productId))
  );
  const affinityIds = new Set([...options.wishlistIds, ...options.recentlyViewedIds, ...purchasedIds]);

  const affinityProducts = products.filter((p) => affinityIds.has(p.id));
  const affinityFamilies = new Set<string>([
    ...options.preferredFamilies,
    ...affinityProducts.map((p) => p.fragranceFamily),
  ]);
  const affinityNotes = new Set<string>(
    [
      ...options.favoriteNotes,
      ...affinityProducts.flatMap((p) => [...p.topNotes, ...p.heartNotes, ...p.baseNotes]),
    ].map((n) => n.toLowerCase())
  );

  const scoreProduct = (p: PerfumeProduct) => {
    let score = p.popularityScore * 0.3;
    if (affinityFamilies.has(p.fragranceFamily)) score += 25;
    const notes = [...p.topNotes, ...p.heartNotes, ...p.baseNotes].map((n) => n.toLowerCase());
    const shared = notes.filter((n) => affinityNotes.has(n)).length;
    score += shared * 10;
    if (purchasedIds.has(p.id)) score -= 35; // prioritize unowned scents
    return score;
  };

  const sortedByAffinity = [...products].sort((a, b) => scoreProduct(b) - scoreProduct(a));
  const selectedForYou = sortedByAffinity.slice(0, 3);

  const youMayAlsoLove = sortedByAffinity
    .filter((p) => !selectedForYou.some((s) => s.id === p.id))
    .slice(0, 3);

  // Complementary families not yet owned
  const ownedFamilies = new Set(
    products.filter((p) => purchasedIds.has(p.id)).map((p) => p.fragranceFamily)
  );
  const completeCollection = [...products]
    .filter((p) => !purchasedIds.has(p.id))
    .sort((a, b) => {
      const aNewFam = ownedFamilies.has(a.fragranceFamily) ? 0 : 20;
      const bNewFam = ownedFamilies.has(b.fragranceFamily) ? 0 : 20;
      return bNewFam + b.popularityScore - (aNewFam + a.popularityScore);
    })
    .slice(0, 3);

  return {
    selectedForYou,
    youMayAlsoLove,
    completeCollection,
  };
}
