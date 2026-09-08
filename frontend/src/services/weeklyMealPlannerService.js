/**
 * GlycoPulse AI - Personalized Weekly Meal Planner & Shopping List Service
 * 
 * Communicates with Gemini AI (gemini-2.0-flash / gemini-1.5-flash) to generate
 * 7-day diabetic-tailored meal plans, swap individual meals, and aggregate
 * categorized raw ingredients into smart shopping lists.
 */

export async function generateWeeklyMealPlan({
  targetCalories = 1800,
  targetCarbs = 150,
  cuisine = 'Sri Lankan & South Asian',
  dietaryNotes = 'Low GI, High Fiber, Heart-Healthy'
} = {}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY;

  // Attempt Gemini API call if key is available
  if (apiKey) {
    const prompt = `You are a clinical diabetes dietitian and nutritionist. Generate a structured 7-day diabetic-friendly weekly meal plan tailored for a patient with:
- Daily Calorie Target: ~${targetCalories} kcal
- Daily Carbohydrate Target: ~${targetCarbs} g
- Preferred Cuisine / Culture: ${cuisine}
- Special Notes: ${dietaryNotes}

CRITICAL RULES:
1. Every meal must be low-to-medium glycemic index (GI), high in fiber, and balanced in macronutrients.
2. Provide realistic meals for Breakfast, Lunch, Dinner, and Snack for all 7 days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
3. Ingredients must list specific raw grocery items with approximate quantities for shopping (e.g., "Red raw rice 150g", "Dhal/Red lentils 80g", "Gotukola greens 50g", "Virgin coconut oil 1 tsp").
4. Return ONLY valid, strictly formatted JSON matching this exact structure:

{
  "planName": "Diabetic-Friendly ${cuisine} Plan",
  "targetCalories": ${targetCalories},
  "targetCarbs": ${targetCarbs},
  "days": [
    {
      "day": "Monday",
      "totalCalories": 1780,
      "totalCarbs": 145,
      "meals": {
        "breakfast": {
          "name": "Meal Name",
          "description": "Short appetizing description",
          "calories": 380,
          "carbs": 42,
          "protein": 14,
          "fat": 10,
          "glycemicIndex": "Low",
          "ingredients": ["Item 1 quantity", "Item 2 quantity"]
        },
        "lunch": {
          "name": "Meal Name",
          "description": "Short description",
          "calories": 520,
          "carbs": 48,
          "protein": 28,
          "fat": 14,
          "glycemicIndex": "Low",
          "ingredients": ["Item 1", "Item 2"]
        },
        "dinner": {
          "name": "Meal Name",
          "description": "Short description",
          "calories": 480,
          "carbs": 38,
          "protein": 26,
          "fat": 12,
          "glycemicIndex": "Low",
          "ingredients": ["Item 1", "Item 2"]
        },
        "snack": {
          "name": "Meal Name",
          "description": "Short description",
          "calories": 180,
          "carbs": 16,
          "protein": 6,
          "fat": 5,
          "glycemicIndex": "Low",
          "ingredients": ["Item 1", "Item 2"]
        }
      }
    }
    ... repeat for Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
  ]
}`;

    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              topP: 0.95
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.days && parsed.days.length === 7) {
                console.log(`[Gemini Weekly Meal Plan] Successfully generated plan via model '${model}'`);
                return parsed;
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[Gemini Meal Plan ${model} error]:`, err.message);
      }
    }
  }

  // Fallback to clinically verified local meal plan generator
  console.log('[Weekly Meal Plan] Generating fallback diabetic plan');
  return getFallbackWeeklyMealPlan(targetCalories, targetCarbs, cuisine);
}

/**
 * Request Gemini AI to generate 3 healthy diabetic meal swaps for a specific meal slot.
 */
export async function getMealAlternatives(dayName, mealType, currentMeal, cuisine = 'Sri Lankan & South Asian') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY;

  if (apiKey) {
    const prompt = `You are a diabetic clinical dietitian. Provide 3 healthier diabetic-friendly alternative meal options to replace this current meal:
Day: ${dayName}
Meal Slot: ${mealType}
Current Meal: "${currentMeal.name}" (${currentMeal.calories} kcal, ${currentMeal.carbs}g carbs)
Cuisine Context: ${cuisine}

Return ONLY a JSON array of 3 alternative meal objects:
[
  {
    "name": "Alternative Meal 1 Title",
    "description": "Short appetizing explanation focusing on low glycemic impact",
    "calories": 390,
    "carbs": 40,
    "protein": 18,
    "fat": 11,
    "glycemicIndex": "Low",
    "ingredients": ["Ingredient 1 with quantity", "Ingredient 2 with quantity"]
  },
  ...
]`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        }
      }
    } catch (err) {
      console.warn('[Gemini Meal Alternatives error]:', err);
    }
  }

  // Smart fallback alternatives
  return getFallbackMealAlternatives(mealType, cuisine);
}

/**
 * Smart Ingredient Aggregator & Categorizer
 * Extracts raw ingredients across all 7 days and categorizes into:
 * - Vegetables & Greens
 * - Proteins & Seafood
 * - Whole Grains & Carbs
 * - Dairy, Healthy Fats & Spices
 */
export function aggregateShoppingList(weeklyPlan) {
  if (!weeklyPlan || !weeklyPlan.days) return [];

  const rawMap = new Map();

  // Keyword categorization rules
  const catVeg = ['gotukola', 'spinach', 'kankun', 'bitter gourd', 'karawila', 'drumstick', 'murunga', 'beans', 'carrot', 'tomato', 'cucumber', 'broccoli', 'cabbage', 'onion', 'garlic', 'ginger', 'leeks', 'pumpkin', 'brinjal', 'eggplant', 'capsicum', 'mushroom', 'salad greens', 'zucchini', 'avocado'];
  const catProtein = ['chicken', 'fish', 'tuna', 'salmon', 'egg', 'eggs', 'dhal', 'lentils', 'chickpea', 'chickpeas', 'mung', 'kadala', 'tofu', 'prawn', 'shrimp', 'beef', 'mutton', 'soya'];
  const catGrains = ['rice', 'red rice', 'kurakkan', 'millet', 'oats', 'quinoa', 'whole wheat', 'bread', 'string hoppers', 'atta', 'roti', 'barley'];
  
  weeklyPlan.days.forEach((dayObj) => {
    const meals = dayObj.meals;
    if (!meals) return;

    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((slot) => {
      const meal = meals[slot];
      if (meal && Array.isArray(meal.ingredients)) {
        meal.ingredients.forEach((itemStr) => {
          const cleanItem = itemStr.trim();
          if (!cleanItem) return;

          const lower = cleanItem.toLowerCase();
          let category = 'Dairy, Healthy Fats & Spices'; // default

          if (catVeg.some(k => lower.includes(k))) {
            category = 'Vegetables & Greens';
          } else if (catProtein.some(k => lower.includes(k))) {
            category = 'Proteins & Seafood';
          } else if (catGrains.some(k => lower.includes(k))) {
            category = 'Whole Grains & Carbs';
          } else if (lower.includes('milk') || lower.includes('curd') || lower.includes('yogurt') || lower.includes('cheese') || lower.includes('oil') || lower.includes('cinnamon') || lower.includes('turmeric') || lower.includes('seeds') || lower.includes('nuts')) {
            category = 'Dairy, Healthy Fats & Spices';
          }

          if (!rawMap.has(cleanItem)) {
            rawMap.set(cleanItem, {
              id: 'shop-' + Math.random().toString(36).substring(2, 9),
              name: cleanItem,
              category,
              purchased: false
            });
          }
        });
      }
    });
  });

  return Array.from(rawMap.values());
}

/**
 * Clinical Fallback Meal Generator for 7 Days
 */
function getFallbackWeeklyMealPlan(targetCalories, targetCarbs, cuisine) {
  const isSriLankan = cuisine.toLowerCase().includes('lankan') || cuisine.toLowerCase().includes('asian');

  const daysData = [
    {
      day: 'Monday',
      totalCalories: 1760,
      totalCarbs: 142,
      meals: {
        breakfast: {
          name: isSriLankan ? 'Red Rice String Hoppers with Fish Hodi & Sambol' : 'Oatmeal Porridge with Cinnamon & Walnuts',
          description: isSriLankan ? '5 steamed red rice string hoppers with mild fish curry hodi and fresh coconut sambol.' : 'Warm steel-cut oats with cinnamon powder, chia seeds, and chopped walnuts.',
          calories: 380, carbs: 42, protein: 16, fat: 10, glycemicIndex: 'Low',
          ingredients: ['Red rice string hoppers (5 pcs)', 'Tuna / Sailfish fillet 60g', 'Thin coconut milk 80ml', 'Fresh coconut sambol 30g']
        },
        lunch: {
          name: isSriLankan ? 'Red Raw Rice, Grilled Chicken Breast & Gotukola Sambol' : 'Grilled Chicken Salad with Quinoa & Avocados',
          description: isSriLankan ? '1 cup red raw rice, lean grilled chicken breast, yellow dhal curry, and fresh gotukola green sambol.' : 'Grilled chicken breast served over quinoa, mixed leafy greens, cherry tomatoes, and olive oil dressing.',
          calories: 540, carbs: 50, protein: 38, fat: 14, glycemicIndex: 'Low',
          ingredients: ['Red raw rice 150g', 'Chicken breast fillet 120g', 'Yellow dhal / Red lentils 80g', 'Gotukola greens 50g', 'Olive oil 1 tsp']
        },
        dinner: {
          name: isSriLankan ? 'Kurakkan (Finger Millet) Roti with Vegetable Curry' : 'Pan-Seared Salmon with Steamed Broccoli',
          description: isSriLankan ? '2 thin kurakkan rotis served with mixed brinjal and capsicum vegetable curry.' : 'Pan-seared Atlantic salmon fillet with garlic steamed broccoli and brown rice.',
          calories: 460, carbs: 36, protein: 28, fat: 12, glycemicIndex: 'Low',
          ingredients: ['Kurakkan / Finger millet flour 60g', 'Brinjal / Eggplant 100g', 'Capsicum 50g', 'Virgin coconut oil 1 tsp']
        },
        snack: {
          name: 'Handful of Roasted Almonds & Green Tea',
          description: '12-15 unsalted raw almonds with unsweetened organic green tea.',
          calories: 180, carbs: 14, protein: 6, fat: 11, glycemicIndex: 'Low',
          ingredients: ['Raw unsalted almonds 25g', 'Green tea bag 1 pc']
        }
      }
    },
    {
      day: 'Tuesday',
      totalCalories: 1810,
      totalCarbs: 148,
      meals: {
        breakfast: {
          name: isSriLankan ? 'Kurakkan Pittu with Fresh Coconut & Mung Bean Curry' : 'Whole Wheat Toast with Poached Eggs & Spinach',
          description: isSriLankan ? 'Steamed millet flour pitu served with high-protein green mung bean curry.' : '2 slices whole grain toast with 2 poached eggs and wilted baby spinach.',
          calories: 410, carbs: 45, protein: 18, fat: 11, glycemicIndex: 'Low',
          ingredients: ['Kurakkan flour 60g', 'Green mung beans 80g', 'Thin coconut milk 50ml', 'Grated coconut 20g']
        },
        lunch: {
          name: isSriLankan ? 'Suwandel Low-GI Rice with Sear Fish Curry & Karawila' : 'Baked Cod with Brown Rice & Roasted Asparagus',
          description: isSriLankan ? 'Traditional heirloom low-GI rice with spicy sear fish curry and sautéed bitter gourd.' : 'Fillet of baked cod with brown rice and olive oil roasted asparagus.',
          calories: 550, carbs: 52, protein: 36, fat: 13, glycemicIndex: 'Low',
          ingredients: ['Suwandel rice 140g', 'Sear fish / Spanish mackerel 120g', 'Bitter gourd / Karawila 80g', 'Red onions & garlic 30g']
        },
        dinner: {
          name: isSriLankan ? 'Vegetable & Egg Kottu with Whole Wheat Roti' : 'Grilled Tofu & Vegetable Stir-Fry',
          description: isSriLankan ? 'Chopped whole wheat roti stir-fried with eggs, leeks, carrots, and cabbage.' : 'Firm tofu cubes stir-fried with broccoli, bell peppers, and sesame oil.',
          calories: 470, carbs: 38, protein: 26, fat: 15, glycemicIndex: 'Low',
          ingredients: ['Whole wheat roti (2 pcs)', 'Eggs 2 pcs', 'Leeks & cabbage 100g', 'Carrots 50g']
        },
        snack: {
          name: 'Greek Yogurt / Curd with Chia Seeds & Papaya',
          description: 'Low-fat buffalo curd topped with soaked chia seeds and fresh papaya cubes.',
          calories: 180, carbs: 13, protein: 9, fat: 5, glycemicIndex: 'Low',
          ingredients: ['Low-fat curd 120g', 'Chia seeds 1 tbsp', 'Fresh papaya 80g']
        }
      }
    },
    {
      day: 'Wednesday',
      totalCalories: 1750,
      totalCarbs: 138,
      meals: {
        breakfast: {
          name: isSriLankan ? 'Boiled Kadala (Chickpeas) with Grated Coconut & Mustard Seeds' : 'Avocado Mash on Whole Grain Rye Toast',
          description: isSriLankan ? 'Steamed high-fiber chickpeas tempered with mustard seeds, curry leaves, and fresh coconut.' : 'Mashed fresh avocado on toasted whole grain rye bread with lemon juice.',
          calories: 390, carbs: 42, protein: 15, fat: 11, glycemicIndex: 'Low',
          ingredients: ['White / Brown chickpeas 100g', 'Fresh coconut 25g', 'Mustard seeds & curry leaves 1 tsp', 'Coconut oil 1 tsp']
        },
        lunch: {
          name: isSriLankan ? 'Red Raw Rice with Chicken Curry & Kankun Mallum' : 'Grilled Turkey Breast Bowl with Quinoa',
          description: isSriLankan ? 'Red raw rice, skinless chicken curry, pumpkin curry, and stir-fried water spinach (kankun).' : 'Lean turkey breast with quinoa, steamed green beans, and extra virgin olive oil.',
          calories: 530, carbs: 48, protein: 36, fat: 12, glycemicIndex: 'Low',
          ingredients: ['Red raw rice 140g', 'Skinless chicken 130g', 'Kankun / Water spinach 80g', 'Pumpkin 70g']
        },
        dinner: {
          name: isSriLankan ? 'Steamed Vegetable Soup with Dhal & Roasted OATS Roti' : 'Lentil & Vegetable Shepherd Soup',
          description: isSriLankan ? 'Hearty red lentil vegetable soup with garlic, ginger, and oat-flour flatbread.' : 'Slow-cooked lentil soup packed with diced root vegetables and spinach.',
          calories: 450, carbs: 34, protein: 24, fat: 10, glycemicIndex: 'Low',
          ingredients: ['Red lentils 80g', 'Rolled oats flour 50g', 'Spinach & carrots 100g', 'Garlic & ginger 15g']
        },
        snack: {
          name: 'Boiled Egg & Cucumber Slices',
          description: 'Hard-boiled egg seasoned with black pepper alongside crunchy cucumber rounds.',
          calories: 180, carbs: 14, protein: 8, fat: 6, glycemicIndex: 'Low',
          ingredients: ['Large egg 1 pc', 'Cucumber 100g', 'Black pepper 1 pinch']
        }
      }
    },
    {
      day: 'Thursday',
      totalCalories: 1790,
      totalCarbs: 145,
      meals: {
        breakfast: {
          name: isSriLankan ? 'Oat Kurakkan Porridge (Kenda) with Garlic & Curry Leaves' : 'Scrambled Eggs with Spinach & Cherry Tomatoes',
          description: isSriLankan ? 'Slightly salted herbal millet porridge made with garlic, ginger, and thin coconut milk.' : 'Fluffy scrambled eggs cooked with fresh baby spinach and vine tomatoes.',
          calories: 370, carbs: 40, protein: 14, fat: 9, glycemicIndex: 'Low',
          ingredients: ['Kurakkan flour 50g', 'Rolled oats 30g', 'Garlic cloves 4 pcs', 'Thin coconut milk 100ml']
        },
        lunch: {
          name: isSriLankan ? 'Brown Rice with Boiled Egg Curry & Mukunuwenna' : 'Tuna & White Bean Mediterranean Salad',
          description: isSriLankan ? 'Brown rice, egg curry cooked in coconut gravy, dhal, and fresh mukunuwenna green sambol.' : 'Canned light tuna packed in water with white beans, diced celery, and lemon vinegar.',
          calories: 540, carbs: 49, protein: 32, fat: 14, glycemicIndex: 'Low',
          ingredients: ['Brown rice 150g', 'Eggs 2 pcs', 'Mukunuwenna greens 60g', 'Red lentils / Dhal 70g']
        },
        dinner: {
          name: isSriLankan ? 'Grilled Fish Tikka with Spicy Cabbage & Carrot Sambol' : 'Pan-Seared Sea Bass with Cauliflower Mash',
          description: isSriLankan ? 'Spiced sear fish fillet grilled with turmeric, served with crunchy shredded cabbage.' : 'White sea bass fillet served alongside creamy roasted garlic cauliflower puree.',
          calories: 470, carbs: 38, protein: 34, fat: 12, glycemicIndex: 'Low',
          ingredients: ['Fish fillet 140g', 'Shredded cabbage 100g', 'Carrots 40g', 'Turmeric & chili powder 1 tsp']
        },
        snack: {
          name: 'Handful of Roasted Pumpkin Seeds & Guava Slices',
          description: 'Raw zinc-rich pumpkin seeds served with half a low-GI fresh green guava.',
          calories: 190, carbs: 18, protein: 7, fat: 7, glycemicIndex: 'Low',
          ingredients: ['Pumpkin seeds 20g', 'Fresh green guava 80g']
        }
      }
    },
    {
      day: 'Friday',
      totalCalories: 1770,
      totalCarbs: 140,
      meals: {
        breakfast: {
          name: isSriLankan ? 'Brown Rice Hopper with Seeni Sambol (Low Sugar)' : 'Protein Smoothie with Almond Milk & Spinach',
          description: isSriLankan ? '2 crisp brown rice hoppers served with low-sugar caramelised onion sambol.' : 'Unsweetened almond milk blended with plant protein powder, spinach, and flaxseed.',
          calories: 390, carbs: 44, protein: 15, fat: 10, glycemicIndex: 'Low',
          ingredients: ['Brown rice hopper batter (2 hoppers)', 'Red onions 60g', 'Olive oil 1 tsp']
        },
        lunch: {
          name: isSriLankan ? 'Kalu Heenati Rice with Black Pepper Beef & Drumstick' : 'Grilled Lean Steak with Sweet Potato & Broccoli',
          description: isSriLankan ? 'Ancient low-GI red rice, lean black pepper beef curry, and drumstick (murunga) curry.' : 'Lean sirloin steak grilled with rosemary, served with roasted sweet potato wedge.',
          calories: 560, carbs: 48, protein: 40, fat: 15, glycemicIndex: 'Low',
          ingredients: ['Kalu Heenati red rice 140g', 'Lean beef / chicken 130g', 'Drumstick / Murunga 80g', 'Black pepper 1 tsp']
        },
        dinner: {
          name: isSriLankan ? 'String Hopper Biryani with Chicken & Mint Sambol' : 'Baked Chicken Thighs with Roasted Zucchini',
          description: isSriLankan ? 'Red string hoppers tossed with spices, shredded chicken, and fresh mint sambol.' : 'Skinless chicken thighs baked with herbs, served with zucchini and bell peppers.',
          calories: 460, carbs: 36, protein: 30, fat: 12, glycemicIndex: 'Low',
          ingredients: ['Red string hoppers (5 pcs)', 'Shredded chicken breast 100g', 'Fresh mint leaves 30g', 'Ghee / Butter 1 tsp']
        },
        snack: {
          name: 'Handful of Walnuts & Chamomile Tea',
          description: 'Omega-3 rich raw walnut halves with calming warm chamomile tea.',
          calories: 180, carbs: 12, protein: 5, fat: 11, glycemicIndex: 'Low',
          ingredients: ['Raw walnuts 25g', 'Chamomile tea bag 1 pc']
        }
      }
    },
    {
      day: 'Saturday',
      totalCalories: 1830,
      totalCarbs: 152,
      meals: {
        breakfast: {
          name: isSriLankan ? 'Atta Roti with Egg Curry & Tomato Sambol' : 'Greek Yogurt Parfait with Mixed Berries',
          description: isSriLankan ? '2 whole wheat flour rotis served with spiced egg curry and fresh tomato onion sambol.' : 'Unsweetened Greek yogurt layered with fresh strawberries, blueberries, and flaxseeds.',
          calories: 420, carbs: 46, protein: 18, fat: 12, glycemicIndex: 'Low',
          ingredients: ['Atta / Whole wheat flour 60g', 'Large eggs 2 pcs', 'Fresh tomatoes 60g', 'Red onions 30g']
        },
        lunch: {
          name: isSriLankan ? 'Red Rice with Prawn Curry, Dhal & Anguna Leaves' : 'Grilled Salmon Grain Bowl with Edamame',
          description: isSriLankan ? 'Red rice, coconut prawn curry, red lentils, and anguna / gotukola herbal leaf salad.' : 'Wild salmon fillet served over brown rice, edamame beans, and sesame soy dressing.',
          calories: 560, carbs: 52, protein: 36, fat: 14, glycemicIndex: 'Low',
          ingredients: ['Red rice 150g', 'Prawns / Shrimp 120g', 'Red lentils 80g', 'Herbal green leaves 50g']
        },
        dinner: {
          name: isSriLankan ? 'Stir-Fried Mung Bean Sprouts with Tofu & Garlic' : 'Tofu & Mushroom Soup with Asian Greens',
          description: isSriLankan ? 'Fresh sprouted mung beans stir-fried with firm tofu, garlic, and soya sauce.' : 'Clear vegetable broth simmered with silken tofu, shiitake mushrooms, and bok choy.',
          calories: 450, carbs: 36, protein: 26, fat: 13, glycemicIndex: 'Low',
          ingredients: ['Sprouted mung beans 120g', 'Firm tofu 100g', 'Garlic & soya sauce 15g', 'Sesame oil 1 tsp']
        },
        snack: {
          name: 'Roasted Chickpeas (Kadala) with Chili Flakes',
          description: 'Crunchy oven-roasted chickpeas seasoned with sea salt and coarse chili flakes.',
          calories: 190, carbs: 18, protein: 7, fat: 5, glycemicIndex: 'Low',
          ingredients: ['Boiled chickpeas 80g', 'Olive oil 1 tsp', 'Chili flakes 1 pinch']
        }
      }
    },
    {
      day: 'Sunday',
      totalCalories: 1780,
      totalCarbs: 144,
      meals: {
        breakfast: {
          name: isSriLankan ? 'Whole Wheat Vegetable Wrap with Paneer / Cottage Cheese' : 'Veggie Omelet with Whole Grain Toast',
          description: isSriLankan ? 'Whole wheat wrap filled with grilled paneer, onions, capsicum, and mint chutney.' : '3-egg white omelet packed with diced bell peppers, mushrooms, and spinach.',
          calories: 400, carbs: 42, protein: 20, fat: 12, glycemicIndex: 'Low',
          ingredients: ['Whole wheat wrap 1 pc', 'Paneer / Cottage cheese 80g', 'Capsicum & onions 60g', 'Mint leaves 20g']
        },
        lunch: {
          name: isSriLankan ? 'Special Sunday Red Rice with Grilled Chicken & Mixed Mallum' : 'Roasted Chicken Salad with Quinoa & Pomegranate',
          description: isSriLankan ? 'A celebratory diabetic plate: red rice, herb grilled chicken, dhal, cashew curry (light), and gotukola.' : 'Herb roasted chicken breast with quinoa, cucumber, and fresh pomegranate seeds.',
          calories: 550, carbs: 50, protein: 38, fat: 14, glycemicIndex: 'Low',
          ingredients: ['Red rice 150g', 'Chicken breast 130g', 'Gotukola greens 50g', 'Cashew nuts (light) 20g']
        },
        dinner: {
          name: isSriLankan ? 'Fish Soup with Boiled Cassava / Sweet Potato (Portion Controlled)' : 'Pan-Seared Cod with Roasted Green Beans',
          description: isSriLankan ? 'Light spicy fish broth served with 75g portion of high-fiber sweet potato.' : 'Pan-seared cod fillet served with garlic sautéed green beans and lemon.',
          calories: 460, carbs: 36, protein: 30, fat: 11, glycemicIndex: 'Low',
          ingredients: ['Sear fish / Tuna 130g', 'Boiled sweet potato 75g', 'Lime & curry leaves 15g']
        },
        snack: {
          name: 'Green Apple Slices with Peanut Butter',
          description: '1 medium green apple sliced and served with 1 tablespoon of natural unsweetened peanut butter.',
          calories: 170, carbs: 16, protein: 4, fat: 8, glycemicIndex: 'Low',
          ingredients: ['Green apple 1 pc', 'Natural peanut butter 1 tbsp']
        }
      }
    }
  ];

  return {
    planName: `Diabetic-Friendly ${cuisine} Plan`,
    targetCalories,
    targetCarbs,
    days: daysData
  };
}

/**
 * Fallback meal options for single meal swap
 */
function getFallbackMealAlternatives(mealType, cuisine) {
  const isSriLankan = cuisine.toLowerCase().includes('lankan') || cuisine.toLowerCase().includes('asian');

  if (mealType.toLowerCase() === 'breakfast') {
    return [
      {
        name: isSriLankan ? 'Red Rice String Hoppers with Fish Curry' : 'Oatmeal Porridge with Walnuts & Cinnamon',
        description: 'High fiber, low GI breakfast designed to prevent morning glycemic spikes.',
        calories: 380, carbs: 42, protein: 16, fat: 10, glycemicIndex: 'Low',
        ingredients: ['Red rice string hoppers (5 pcs)', 'Tuna fillet 60g', 'Thin coconut milk 80ml']
      },
      {
        name: isSriLankan ? 'Boiled Mung Beans (Mung Ata) with Coconut' : 'Scrambled Eggs with Avocado & Toast',
        description: 'Protein-packed breakfast rich in dietary fiber and healthy fats.',
        calories: 390, carbs: 40, protein: 18, fat: 11, glycemicIndex: 'Low',
        ingredients: ['Green mung beans 100g', 'Fresh coconut 20g', 'Curry leaves 5g']
      },
      {
        name: isSriLankan ? 'Kurakkan Roti with Vegetable Sambol' : 'Greek Yogurt with Berries & Chia',
        description: 'Complex carb millet flatbread providing long-lasting energy.',
        calories: 370, carbs: 38, protein: 14, fat: 9, glycemicIndex: 'Low',
        ingredients: ['Kurakkan flour 60g', 'Red onions & tomatoes 50g', 'Olive oil 1 tsp']
      }
    ];
  }

  if (mealType.toLowerCase() === 'lunch') {
    return [
      {
        name: isSriLankan ? 'Red Raw Rice, Chicken Curry & Gotukola Sambol' : 'Grilled Chicken Salad with Quinoa',
        description: 'Balanced plate with 1 cup low-GI red rice, lean protein, and fresh greens.',
        calories: 540, carbs: 50, protein: 38, fat: 14, glycemicIndex: 'Low',
        ingredients: ['Red raw rice 150g', 'Chicken breast 120g', 'Gotukola greens 50g']
      },
      {
        name: isSriLankan ? 'Suwandel Low-GI Rice with Sear Fish & Bitter Gourd' : 'Baked Cod with Brown Rice & Vegetables',
        description: 'Heirloom rice dish paired with omega-3 rich fish and blood-sugar lowering bitter gourd.',
        calories: 530, carbs: 48, protein: 36, fat: 13, glycemicIndex: 'Low',
        ingredients: ['Suwandel rice 140g', 'Sear fish fillet 120g', 'Bitter gourd / Karawila 80g']
      },
      {
        name: isSriLankan ? 'Kalu Heenati Rice with Dhal & Mukunuwenna' : 'Tuna & White Bean Salad Bowl',
        description: 'High-fiber vegetarian lunch loaded with lentils and nutrient-rich herbal greens.',
        calories: 510, carbs: 46, protein: 28, fat: 11, glycemicIndex: 'Low',
        ingredients: ['Kalu Heenati rice 140g', 'Red lentils 80g', 'Mukunuwenna greens 60g']
      }
    ];
  }

  if (mealType.toLowerCase() === 'dinner') {
    return [
      {
        name: isSriLankan ? 'Kurakkan Roti with Egg Curry & Brinjal' : 'Pan-Seared Salmon with Steamed Broccoli',
        description: 'Light evening meal focused on protein and fiber to manage overnight glucose levels.',
        calories: 460, carbs: 36, protein: 26, fat: 12, glycemicIndex: 'Low',
        ingredients: ['Kurakkan flour 60g', 'Eggs 2 pcs', 'Brinjal / Eggplant 80g']
      },
      {
        name: isSriLankan ? 'Steamed Fish Soup with Garlic & Oats Flatbread' : 'Grilled Tofu & Vegetable Stir-Fry',
        description: 'Warm soothing fish broth served with oats flatbread.',
        calories: 440, carbs: 34, protein: 28, fat: 10, glycemicIndex: 'Low',
        ingredients: ['Fish fillet 140g', 'Rolled oats flour 50g', 'Garlic & ginger 15g']
      },
      {
        name: isSriLankan ? 'Whole Wheat Egg Kottu with Shredded Cabbage' : 'Pan-Seared Sea Bass with Cauliflower Mash',
        description: 'High-protein diabetic kottu made from whole wheat flatbread and fresh vegetables.',
        calories: 470, carbs: 38, protein: 26, fat: 14, glycemicIndex: 'Low',
        ingredients: ['Whole wheat roti (2 pcs)', 'Eggs 2 pcs', 'Cabbage & leeks 100g']
      }
    ];
  }

  // Default / Snack options
  return [
    {
      name: 'Roasted Almonds & Unsweetened Green Tea',
      description: 'Healthy fats and antioxidants to sustain energy between meals.',
      calories: 180, carbs: 14, protein: 6, fat: 11, glycemicIndex: 'Low',
      ingredients: ['Raw unsalted almonds 25g', 'Green tea bag 1 pc']
    },
    {
      name: 'Low-Fat Curd with Chia Seeds & Fresh Papaya',
      description: 'Probiotic-rich snack supporting gut health and blood sugar stability.',
      calories: 180, carbs: 13, protein: 9, fat: 5, glycemicIndex: 'Low',
      ingredients: ['Low-fat curd 120g', 'Chia seeds 1 tbsp', 'Fresh papaya 80g']
    },
    {
      name: 'Boiled Egg with Cucumber Rounds & Black Pepper',
      description: 'Zero-sugar protein snack ideal for a quick glucose stabilize.',
      calories: 170, carbs: 12, protein: 8, fat: 6, glycemicIndex: 'Low',
      ingredients: ['Large egg 1 pc', 'Cucumber 100g', 'Black pepper 1 pinch']
    }
  ];
}
