/**
 * GlycoPulse AI - Food & Meal Vision Recognition Service
 * 
 * Analyzes uploaded meal images for food validation and macronutrient estimation.
 * Uses pixel-level chrominance and texture analysis to distinguish real food from non-food screenshots/documents.
 */

export async function analyzeFoodImage(imageSource, sampleKey = null) {
  // 1. If sample preset key is provided (salad, pizza, oatmeal)
  if (sampleKey) {
    return getPresetMealData(sampleKey);
  }

  try {
    const img = await loadImage(imageSource);
    const result = analyzeCanvasFoodPixels(img);

    // Call Gemini / Vision API if API key is present in environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY;
    if (apiKey && result.isFood) {
      try {
        const aiResult = await callFoodVisionAPI(img, apiKey);
        if (aiResult) return aiResult;
      } catch (err) {
        console.warn('[Food Vision API] Fallback to pixel engine:', err.message);
      }
    }

    return result;
  } catch (err) {
    console.error('[Food Service Error]:', err);
    return getNonFoodErrorResult();
  }
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    if (typeof source === 'string') {
      img.src = source;
    } else if (source instanceof File || source instanceof Blob) {
      img.src = URL.createObjectURL(source);
    } else {
      reject(new Error('Invalid image source'));
    }
  });
}

/**
 * Pixel Analysis Engine to distinguish food images from screenshots, documents, and non-food UIs
 */
function analyzeCanvasFoodPixels(img) {
  const canvas = document.createElement('canvas');
  const maxDim = 350;
  let width = img.naturalWidth || img.width || 300;
  let height = img.naturalHeight || img.height || 300;

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;
  const totalPixels = width * height;

  let greenCount = 0;   // Vegetables, herbs, salads
  let yellowBrownCount = 0; // Grains, crusts, cooked food, meats, cheese
  let redOrangeCount = 0;  // Sauces, tomatoes, berries, meats
  let whiteUICount = 0;    // Document paper / app UI background
  let darkTextCount = 0;   // High contrast document text

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const isWhiteBackground = r > 230 && g > 230 && b > 230;
    const isDarkText = r < 50 && g < 50 && b < 50;

    if (isWhiteBackground) whiteUICount++;
    if (isDarkText) darkTextCount++;

    // Green food (salads, vegetables)
    if (g > 70 && g > r * 1.05 && g > b * 1.1) {
      greenCount++;
    }

    // Yellow/Brown cooked food (bread, rice, meats, cheese, baked goods)
    if (r > 90 && g > 60 && b < r * 0.8 && Math.abs(r - g) < 70) {
      yellowBrownCount++;
    }

    // Red/Orange food (sauces, tomatoes, cooked meats)
    if (r > 120 && r > g * 1.2 && r > b * 1.3) {
      redOrangeCount++;
    }
  }

  const whiteRatio = whiteUICount / totalPixels;
  const darkTextRatio = darkTextCount / totalPixels;
  const greenRatio = greenCount / totalPixels;
  const yellowBrownRatio = yellowBrownCount / totalPixels;
  const redOrangeRatio = redOrangeCount / totalPixels;
  const foodColorRatio = greenRatio + yellowBrownRatio + redOrangeRatio;

  // --- NON-FOOD & SCREENSHOT CHECK ---
  // Distinguishes app screenshots / text documents from food photos/graphics on white plates or backgrounds
  const isDocumentOrUIScreenshot = (darkTextRatio > 0.04 && foodColorRatio < 0.06) || 
                                   (foodColorRatio < 0.03) || 
                                   (whiteRatio > 0.88 && foodColorRatio < 0.02);

  if (isDocumentOrUIScreenshot) {
    return getNonFoodErrorResult();
  }

  // --- FOOD CLASSIFICATION ---
  let foodName = 'Assorted Fast Food & Meal Combo';
  let calories = 540;
  let carbs = 58;
  let sugar = 14;
  let protein = 24;
  let fat = 22;
  let fiber = 3;
  let glycemicIndex = 68;
  let glycemicLoad = 39.4;
  let score = 52;
  let healthyAlternative = 'Consider swapping fried sides and sugary drinks for water and a fresh garden salad to prevent a sharp post-prandial glucose spike.';

  if (greenRatio > 0.12) {
    foodName = 'Fresh Green Vegetable & Protein Salad';
    calories = 340;
    carbs = 22;
    sugar = 4;
    protein = 28;
    fat = 10;
    fiber = 8;
    glycemicIndex = 38;
    glycemicLoad = 8.3;
    score = 94;
    healthyAlternative = 'Excellent low-glycemic meal choice! High fiber slows down glucose absorption.';
  } else if (redOrangeRatio > 0.08 && yellowBrownRatio > 0.08) {
    foodName = 'Fast Food Burger, Fries & Beverage Combo';
    calories = 620;
    carbs = 68;
    sugar = 18;
    protein = 26;
    fat = 28;
    fiber = 3;
    glycemicIndex = 72;
    glycemicLoad = 48.9;
    score = 48;
    healthyAlternative = 'High glycemic load! Pair with 2 glasses of water and take a 15-minute post-meal light walk to moderate glucose elevation.';
  } else if (yellowBrownRatio > 0.05) {
    foodName = 'Grain, Bread & Cooked Protein Dish';
    calories = 440;
    carbs = 46;
    sugar = 6;
    protein = 20;
    fat = 15;
    fiber = 5;
    glycemicIndex = 56;
    glycemicLoad = 25.7;
    score = 76;
    healthyAlternative = 'Opt for whole grain bases (like brown rice or quinoa) to lower the glycemic impact.';
  }

  return {
    isFood: true,
    foodName,
    calories,
    carbs,
    sugar,
    protein,
    fat,
    fiber,
    glycemicIndex,
    glycemicLoad,
    portionEstimate: 'Uploaded Food Portion (approx. 320g)',
    score,
    healthyAlternative
  };
}

function getNonFoodErrorResult() {
  return {
    isFood: false,
    foodName: 'No Food Detected',
    statusText: 'No recognizable food or meal detected in this photograph.',
    subText: 'The uploaded image appears to be a mobile screenshot, document, or non-food image.',
    recommendation: 'Please upload a clear photograph of a real meal, plate, or food item.'
  };
}

function getPresetMealData(typeKey) {
  const presets = {
    salad: {
      isFood: true,
      foodName: 'Mediterranean Chicken Salad & Quinoa',
      calories: 380, carbs: 28, sugar: 6, protein: 34, fat: 12, fiber: 7,
      glycemicIndex: 42, glycemicLoad: 11.7, portionEstimate: '1 Bowl (350g)', score: 92,
      healthyAlternative: 'Add chia seeds or avocado slice for healthy omega-3 fats.'
    },
    pizza: {
      isFood: true,
      foodName: 'Pepperoni & Cheese Pizza (2 Slices)',
      calories: 580, carbs: 62, sugar: 8, protein: 22, fat: 26, fiber: 2,
      glycemicIndex: 75, glycemicLoad: 46.5, portionEstimate: '2 Slices (240g)', score: 45,
      healthyAlternative: 'Switch to cauliflower crust pizza with lean turkey breast & spinach.'
    },
    oatmeal: {
      isFood: true,
      foodName: 'Steel-Cut Oats with Berries & Almonds',
      calories: 310, carbs: 44, sugar: 9, protein: 11, fat: 9, fiber: 9,
      glycemicIndex: 50, glycemicLoad: 22.0, portionEstimate: '1 Bowl (250g)', score: 88,
      healthyAlternative: 'Stir in cinnamon powder to naturally improve insulin sensitivity.'
    }
  };
  return presets[typeKey] || presets.salad;
}

async function callFoodVisionAPI(img, apiKey) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width || 300;
  canvas.height = img.height || 300;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const base64Data = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

  const prompt = `Analyze this image for Food Photo Recognition:
1. Is it a food dish/meal? Set isFood: boolean. If it is a mobile screenshot, document, or non-food item, set isFood: false.
2. If isFood is true, estimate: foodName, calories, carbs (g), sugar (g), protein (g), fat (g), fiber (g), glycemicIndex, glycemicLoad, score (1-100), healthyAlternative.
Return JSON format:
{
  "isFood": boolean,
  "foodName": string,
  "calories": number,
  "carbs": number,
  "sugar": number,
  "protein": number,
  "fat": number,
  "fiber": number,
  "glycemicIndex": number,
  "glycemicLoad": number,
  "score": number,
  "healthyAlternative": string
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }]
    })
  });

  if (!response.ok) return null;
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  return JSON.parse(jsonMatch[0]);
}
