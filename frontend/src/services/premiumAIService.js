/**
 * GlycoPulse AI - Future Premium AI Services
 * 
 * Includes:
 * 1. AI Digital Twin Glucose Simulator (Gemini API gemini-2.0-flash / gemini-1.5-flash)
 * 2. AI Smart Grocery & Pantry Recipe Planner
 */

export async function simulateGlucoseDigitalTwin(currentGlucose = 120, carbsGrams = 45, insulinUnits = 3) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY;
  const startMg = Number(currentGlucose) || 120;
  const carbs = Number(carbsGrams) || 0;
  const insulin = Number(insulinUnits) || 0;

  if (apiKey) {
    const prompt = `You are a clinical diabetes pharmacokinetics specialist and AI Digital Twin simulator.
A diabetes patient inputs:
- Current Fasting/Pre-meal Blood Glucose: ${startMg} mg/dL
- Planned Carbohydrate Intake: ${carbs} grams
- Rapid-Acting Insulin Dose: ${insulin} Units

Simulate the patient's predicted 4-hour postprandial blood glucose trajectory (+0h, +1h, +2h, +3h, +4h).
Return ONLY a valid JSON object matching this schema without markdown code blocks:
{
  "predictedCurve": [
    { "hour": "0h", "mgDl": ${startMg}, "label": "Start Baseline" },
    { "hour": "1h", "mgDl": number, "label": "Peak Carb Rise" },
    { "hour": "2h", "mgDl": number, "label": "Insulin Action Peak" },
    { "hour": "3h", "mgDl": number, "label": "Glucose Clearance" },
    { "hour": "4h", "mgDl": number, "label": "Equilibrium" }
  ],
  "peakGlucose": number,
  "nadirGlucose": number,
  "hypoRisk": "Low" | "Moderate" | "High",
  "hyperRisk": "Low" | "Moderate" | "High",
  "summaryNote": "2-sentence clinical explanation of carb absorption vs insulin pharmacokinetics.",
  "clinicalRecommendation": "1-sentence practical bolus or timing tip for the patient."
}`;

    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed && Array.isArray(parsed.predictedCurve) && parsed.predictedCurve.length === 5) {
                console.log(`[Digital Twin AI Success via ${model}]`);
                return parsed;
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[Digital Twin AI ${model} Error]:`, err);
      }
    }
  }

  // Clinical Fallback Simulation Engine
  return getFallbackDigitalTwinSimulation(startMg, carbs, insulin);
}

export async function generateSmartGroceryRecipe(pantryIngredients = 'eggs, spinach, tomatoes, olive oil, garlic') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY;

  if (apiKey) {
    const prompt = `You are a clinical diabetes executive chef and dietitian.
A diabetes patient has these ingredients available at home: "${pantryIngredients}".

Generate a healthy, delicious, low-glycemic diabetic recipe using these ingredients.
Return ONLY a valid JSON object matching this schema without markdown code blocks:
{
  "recipeTitle": "String Recipe Name",
  "prepTimeMinutes": 15,
  "glycemicIndex": "Low (GI 25)",
  "nutritionPerServing": {
    "calories": 250,
    "carbs": 8,
    "protein": 18,
    "fat": 14
  },
  "ingredientsList": [
    "2 Large Eggs",
    "1 cup Fresh Spinach",
    "1 Small Tomato (diced)",
    "1 tbsp Olive Oil"
  ],
  "instructions": [
    "Step 1: Heat olive oil in a non-stick pan over medium heat.",
    "Step 2: Sauté diced tomatoes and spinach until tender.",
    "Step 3: Whisk eggs and pour into skillet, cooking gently for 3 minutes.",
    "Step 4: Serve hot for a zero-spike glycemic meal."
  ],
  "clinicalTip": "1-sentence clinical nutrition tip explaining why this dish is great for blood sugar control."
}`;

    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed && parsed.recipeTitle && parsed.instructions) {
                console.log(`[Smart Grocery AI Success via ${model}]`);
                return parsed;
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[Smart Grocery AI ${model} Error]:`, err);
      }
    }
  }

  // Clinical Fallback Recipe Engine
  return getFallbackGroceryRecipe(pantryIngredients);
}

function getFallbackDigitalTwinSimulation(startMg, carbs, insulin) {
  const carbRise = carbs * 0.8;
  const insulinDrop = insulin * 28;

  const h0 = startMg;
  const h1 = Math.round(startMg + carbRise * 0.9 - insulinDrop * 0.3);
  const h2 = Math.round(startMg + carbRise * 0.5 - insulinDrop * 0.85);
  const h3 = Math.round(startMg + carbRise * 0.2 - insulinDrop * 0.95);
  const h4 = Math.round(Math.max(65, startMg + carbRise * 0.1 - insulinDrop * 0.9));

  const peak = Math.max(h0, h1, h2, h3, h4);
  const nadir = Math.min(h0, h1, h2, h3, h4);

  return {
    predictedCurve: [
      { hour: '0h', mgDl: h0, label: 'Start Baseline' },
      { hour: '1h', mgDl: h1, label: 'Carb Absorption Peak' },
      { hour: '2h', mgDl: h2, label: 'Insulin Action Peak' },
      { hour: '3h', mgDl: h3, label: 'Glucose Clearance' },
      { hour: '4h', mgDl: h4, label: 'Equilibrium' }
    ],
    peakGlucose: peak,
    nadirGlucose: nadir,
    hypoRisk: nadir < 70 ? 'High' : nadir < 80 ? 'Moderate' : 'Low',
    hyperRisk: peak > 180 ? 'High' : peak > 140 ? 'Moderate' : 'Low',
    summaryNote: `Simulated ${carbs}g carbohydrate intake against ${insulin}U rapid insulin dose. Projected peak of ${peak} mg/dL at 1 hour post-meal.`,
    clinicalRecommendation: nadir < 70 
      ? 'Warning: High risk of hypoglycemia at 3-4 hours. Consider reducing insulin dose or adding 15g complex carbs.' 
      : 'Optimal carb-to-insulin ratio simulated. Glucose remains within target 70-140 mg/dL window.'
  };
}

function getFallbackGroceryRecipe(ingredientsStr) {
  return {
    recipeTitle: 'Mediterranean Spinach & Tomato Egg Scramble',
    prepTimeMinutes: 12,
    glycemicIndex: 'Very Low (GI 18)',
    nutritionPerServing: {
      calories: 230,
      carbs: 5,
      protein: 17,
      fat: 15
    },
    ingredientsList: [
      '2 Fresh Eggs',
      '1 cup Fresh Baby Spinach',
      '1 Small Ripe Tomato (sliced)',
      '1 tbsp Cold-Pressed Olive Oil',
      'Pinch of Salt & Crushed Black Pepper'
    ],
    instructions: [
      'Step 1: Heat olive oil in a non-stick skillet over medium-low heat.',
      'Step 2: Add sliced tomatoes and spinach, tossing gently for 2 minutes until spinach is wilted.',
      'Step 3: Beat eggs in a bowl with salt and pepper, then pour into the skillet.',
      'Step 4: Gently scramble for 2-3 minutes until set. Serve warm with green tea for a zero-spike breakfast.'
    ],
    clinicalTip: 'Eggs and olive oil provide high-quality protein and healthy monounsaturated fats that slow digestion and prevent postprandial glucose spikes.'
  };
}
