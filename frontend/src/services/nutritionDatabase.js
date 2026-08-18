/**
 * GlucoCare - Authentic Sri Lankan, South Asian & Global Nutritional Database
 * Standard nutritional values per 100 grams
 */

export const NUTRITION_DATABASE = {
  // RICE & GRAINS (SRI LANKAN & SOUTH ASIAN)
  'white rice': { calories: 130, carbs: 28.2, protein: 2.7, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1, defaultGrams: 180, category: 'Rice & Grains' },
  'red rice': { calories: 111, carbs: 23.5, protein: 2.3, fat: 0.8, fiber: 1.8, sugar: 0.2, sodium: 2, defaultGrams: 180, category: 'Rice & Grains' },
  'basmati rice': { calories: 121, carbs: 25.0, protein: 3.5, fat: 0.4, fiber: 0.6, sugar: 0.1, sodium: 1, defaultGrams: 180, category: 'Rice & Grains' },
  'fried rice': { calories: 163, carbs: 22.8, protein: 4.1, fat: 6.2, fiber: 0.9, sugar: 0.5, sodium: 340, defaultGrams: 200, category: 'Rice & Grains' },
  'chicken biryani': { calories: 175, carbs: 21.0, protein: 8.5, fat: 6.8, fiber: 1.1, sugar: 0.8, sodium: 380, defaultGrams: 220, category: 'Rice & Grains' },
  'string hoppers': { calories: 142, carbs: 31.0, protein: 2.8, fat: 0.5, fiber: 0.8, sugar: 0.2, sodium: 15, defaultGrams: 120, category: 'Rice & Grains' },
  'plain hopper': { calories: 135, carbs: 26.0, protein: 2.4, fat: 2.1, fiber: 0.5, sugar: 1.5, sodium: 85, defaultGrams: 70, category: 'Rice & Grains' },
  'egg hopper': { calories: 170, carbs: 22.0, protein: 7.2, fat: 6.5, fiber: 0.5, sugar: 1.5, sodium: 160, defaultGrams: 110, category: 'Rice & Grains' },
  'pittu': { calories: 165, carbs: 34.5, protein: 3.2, fat: 1.4, fiber: 1.5, sugar: 0.4, sodium: 40, defaultGrams: 130, category: 'Rice & Grains' },
  'kiribath (milk rice)': { calories: 185, carbs: 29.0, protein: 3.1, fat: 6.8, fiber: 0.8, sugar: 1.2, sodium: 110, defaultGrams: 150, category: 'Rice & Grains' },
  'roti': { calories: 264, carbs: 46.0, protein: 7.2, fat: 5.5, fiber: 3.2, sugar: 0.8, sodium: 210, defaultGrams: 80, category: 'Rice & Grains' },
  'paratha': { calories: 320, carbs: 45.0, protein: 6.5, fat: 13.0, fiber: 2.8, sugar: 1.1, sodium: 310, defaultGrams: 90, category: 'Rice & Grains' },
  'kottu roti (chicken)': { calories: 195, carbs: 23.5, protein: 9.8, fat: 7.2, fiber: 1.5, sugar: 1.2, sodium: 420, defaultGrams: 250, category: 'Rice & Grains' },

  // CURRIES & SAMBOLS (SRI LANKAN & SOUTH ASIAN)
  'chicken curry': { calories: 145, carbs: 4.2, protein: 16.5, fat: 7.2, fiber: 1.1, sugar: 1.2, sodium: 320, defaultGrams: 120, category: 'Curries & Sides' },
  'fish curry': { calories: 125, carbs: 3.8, protein: 15.2, fat: 5.4, fiber: 0.9, sugar: 1.0, sodium: 310, defaultGrams: 120, category: 'Curries & Sides' },
  'beef curry': { calories: 185, carbs: 3.5, protein: 18.0, fat: 11.2, fiber: 0.8, sugar: 0.9, sodium: 340, defaultGrams: 120, category: 'Curries & Sides' },
  'dhal curry (lentils)': { calories: 115, carbs: 14.5, protein: 6.8, fat: 3.6, fiber: 3.8, sugar: 1.1, sodium: 260, defaultGrams: 100, category: 'Curries & Sides' },
  'potato curry': { calories: 110, carbs: 17.2, protein: 2.1, fat: 3.8, fiber: 2.1, sugar: 1.3, sodium: 240, defaultGrams: 100, category: 'Curries & Sides' },
  'vegetable curry': { calories: 85, carbs: 9.5, protein: 2.2, fat: 4.5, fiber: 2.5, sugar: 2.1, sodium: 220, defaultGrams: 100, category: 'Curries & Sides' },
  'pol sambol (coconut sambol)': { calories: 290, carbs: 9.2, protein: 3.5, fat: 27.0, fiber: 6.2, sugar: 3.1, sodium: 380, defaultGrams: 40, category: 'Curries & Sides' },
  'gotukola sambol': { calories: 55, carbs: 5.1, protein: 2.2, fat: 3.1, fiber: 2.8, sugar: 1.2, sodium: 140, defaultGrams: 50, category: 'Curries & Sides' },
  'lunu miris': { calories: 80, carbs: 12.0, protein: 2.5, fat: 2.8, fiber: 3.1, sugar: 2.5, sodium: 620, defaultGrams: 25, category: 'Curries & Sides' },
  'mallung': { calories: 65, carbs: 6.2, protein: 3.1, fat: 3.2, fiber: 3.4, sugar: 1.1, sodium: 160, defaultGrams: 60, category: 'Curries & Sides' },
  'papadam': { calories: 410, carbs: 58.0, protein: 22.0, fat: 9.5, fiber: 12.0, sugar: 0.5, sodium: 1400, defaultGrams: 15, category: 'Curries & Sides' },

  // SHORT EATS & SNACKS
  'samosa': { calories: 262, carbs: 32.0, protein: 4.5, fat: 13.0, fiber: 2.4, sugar: 1.8, sodium: 360, defaultGrams: 80, category: 'Short Eats' },
  'fish roll': { calories: 245, carbs: 26.0, protein: 8.5, fat: 12.2, fiber: 1.8, sugar: 1.2, sodium: 410, defaultGrams: 85, category: 'Short Eats' },
  'meat cutlet': { calories: 220, carbs: 18.0, protein: 11.2, fat: 11.8, fiber: 1.5, sugar: 0.9, sodium: 380, defaultGrams: 60, category: 'Short Eats' },

  // SWEETS & DESSERTS
  'watalappam': { calories: 240, carbs: 32.0, protein: 4.8, fat: 10.5, fiber: 0.6, sugar: 29.0, sodium: 65, defaultGrams: 100, category: 'Sweets' },
  'curd and treacle': { calories: 155, carbs: 22.0, protein: 4.2, fat: 5.5, fiber: 0.0, sugar: 21.0, sodium: 50, defaultGrams: 150, category: 'Sweets' },

  // FRUITS & FRESH PRODUCE
  'strawberries & berries': { calories: 32, carbs: 7.7, protein: 0.7, fat: 0.3, fiber: 2.0, sugar: 4.9, sodium: 1, defaultGrams: 100, category: 'Fruits' },
  'sliced kiwi & orange': { calories: 50, carbs: 12.0, protein: 1.0, fat: 0.3, fiber: 2.5, sugar: 9.0, sodium: 2, defaultGrams: 120, category: 'Fruits' },
  'banana & grapes': { calories: 75, carbs: 19.0, protein: 0.9, fat: 0.2, fiber: 1.8, sugar: 14.5, sodium: 1, defaultGrams: 120, category: 'Fruits' },
  'fresh mixed fruit platter': { calories: 52, carbs: 13.2, protein: 0.8, fat: 0.3, fiber: 2.1, sugar: 10.2, sodium: 2, defaultGrams: 200, category: 'Fruits' },
  'banana': { calories: 89, carbs: 22.8, protein: 1.1, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1, defaultGrams: 120, category: 'Fruits' },
  'mango': { calories: 60, carbs: 15.0, protein: 0.8, fat: 0.4, fiber: 1.6, sugar: 13.7, sodium: 1, defaultGrams: 150, category: 'Fruits' },
  'papaya': { calories: 43, carbs: 10.8, protein: 0.5, fat: 0.3, fiber: 1.7, sugar: 7.8, sodium: 8, defaultGrams: 150, category: 'Fruits' },
  'pineapple': { calories: 50, carbs: 13.1, protein: 0.5, fat: 0.1, fiber: 1.4, sugar: 9.9, sodium: 1, defaultGrams: 120, category: 'Fruits' },

  // GLOBAL & FAST FOODS
  'beef burger': { calories: 254, carbs: 24.0, protein: 13.5, fat: 12.0, fiber: 1.2, sugar: 4.2, sodium: 480, defaultGrams: 180, category: 'Fast Food' },
  'french fries': { calories: 312, carbs: 41.0, protein: 3.4, fat: 15.0, fiber: 3.8, sugar: 0.3, sodium: 210, defaultGrams: 100, category: 'Fast Food' },
  'soft drink / beverage': { calories: 42, carbs: 10.6, protein: 0.0, fat: 0.0, fiber: 0.0, sugar: 10.6, sodium: 10, defaultGrams: 250, category: 'Fast Food' },
  'pizza slice': { calories: 266, carbs: 33.0, protein: 11.0, fat: 10.0, fiber: 2.3, sugar: 3.6, sodium: 590, defaultGrams: 110, category: 'Fast Food' },
  'mixed salad greens': { calories: 20, carbs: 3.6, protein: 1.5, fat: 0.2, fiber: 2.1, sugar: 1.2, sodium: 25, defaultGrams: 100, category: 'Salads' },
  'grilled chicken breast': { calories: 165, carbs: 0.0, protein: 31.0, fat: 3.6, fiber: 0.0, sugar: 0.0, sodium: 74, defaultGrams: 150, category: 'Proteins' },
  'avocado slice': { calories: 160, carbs: 8.5, protein: 2.0, fat: 14.7, fiber: 6.7, sugar: 0.7, sodium: 7, defaultGrams: 70, category: 'Produce' }
};

/**
 * Searches the nutrition database for a food item (case-insensitive fuzzy match)
 */
export function findNutritionDatabaseEntry(foodName) {
  if (!foodName || typeof foodName !== 'string') return null;
  const lower = foodName.toLowerCase().trim();

  // 1. Exact match
  if (NUTRITION_DATABASE[lower]) {
    return { name: lower, data: NUTRITION_DATABASE[lower] };
  }

  // 2. Partial match
  for (const [key, data] of Object.entries(NUTRITION_DATABASE)) {
    if (lower.includes(key) || key.includes(lower)) {
      return { name: key, data };
    }
  }

  // 3. Fallback generic profile
  if (lower.includes('rice')) return { name: 'white rice', data: NUTRITION_DATABASE['white rice'] };
  if (lower.includes('curry')) return { name: 'chicken curry', data: NUTRITION_DATABASE['chicken curry'] };
  if (lower.includes('fruit') || lower.includes('berry')) return { name: 'fresh mixed fruit platter', data: NUTRITION_DATABASE['fresh mixed fruit platter'] };
  if (lower.includes('burger')) return { name: 'beef burger', data: NUTRITION_DATABASE['beef burger'] };
  if (lower.includes('salad')) return { name: 'mixed salad greens', data: NUTRITION_DATABASE['mixed salad greens'] };

  return {
    name: foodName,
    data: { calories: 150, carbs: 20, protein: 8, fat: 5, fiber: 2, sugar: 2, sodium: 200, defaultGrams: 100, category: 'General' }
  };
}

/**
 * Calculates exact nutritional values based on serving weight in grams
 * Formula: Nutrient = (Nutrient per 100g) * (serving weight in g) / 100
 */
export function calculateItemNutrition(foodName, weightGrams) {
  const grams = Math.max(5, Number(weightGrams) || 100);
  const entry = findNutritionDatabaseEntry(foodName);
  const base = entry.data;

  const factor = grams / 100;

  return {
    foodName: foodName,
    matchedDatabaseName: entry.name,
    grams: grams,
    calories: Math.round(base.calories * factor),
    carbs: Math.round((base.carbs * factor) * 10) / 10,
    protein: Math.round((base.protein * factor) * 10) / 10,
    fat: Math.round((base.fat * factor) * 10) / 10,
    fiber: Math.round((base.fiber * factor) * 10) / 10,
    sugar: Math.round((base.sugar * factor) * 10) / 10,
    sodium: Math.round(base.sodium * factor)
  };
}

/**
 * Calculates total nutrition for a list of detected food items
 * Total Calories MUST mathematically equal the sum of individual food item calories.
 */
export function calculateMealTotals(detectedItems) {
  if (!Array.isArray(detectedItems) || detectedItems.length === 0) {
    return { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
  }

  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSugar = 0;
  let totalSodium = 0;

  detectedItems.forEach(item => {
    const foodName = item.food || item.name || 'Food Item';
    const grams = Number(item.grams) || Number(item.weightGrams) || 100;

    const nut = calculateItemNutrition(foodName, grams);
    totalCalories += nut.calories;
    totalCarbs += nut.carbs;
    totalProtein += nut.protein;
    totalFat += nut.fat;
    totalFiber += nut.fiber;
    totalSugar += nut.sugar;
    totalSodium += nut.sodium;
  });

  return {
    calories: totalCalories,
    carbs: Math.round(totalCarbs * 10) / 10,
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
    sugar: Math.round(totalSugar * 10) / 10,
    sodium: Math.round(totalSodium)
  };
}
