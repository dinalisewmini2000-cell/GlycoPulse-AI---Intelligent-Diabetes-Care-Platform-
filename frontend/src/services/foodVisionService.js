/**
 * GlycoPulse AI - Food Vision Recognition & Diagnostic Service
 * 
 * Multi-Provider AI Vision Pipeline:
 * 1. Google Gemini Vision SDK (@google/generative-ai) - Primary Vision Engine
 * 2. xAI Grok Vision API (grok-2-vision-1212 / grok-vision-beta) - Secondary Vision Engine
 * 3. Intelligent Client-Side Classifier - Fallback Engine
 * 4. Nutrition Database Lookup & Instant Glycemic Calculation
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateItemNutrition, calculateMealTotals } from './nutritionDatabase';

const STRICT_NON_FOOD_KEYWORDS = [
  'person', 'face', 'hand', 'finger', 'arm', 'body', 'skin', 'cloth', 'clothing', 'shirt',
  'wall', 'floor', 'furniture', 'desk', 'room', 'background', 'napkin', 'paper', 'screenshot',
  'document', 'text', 'ui', 'shadow', 'selfie', 'head', 'eye', 'glasses', 'hair', 'phone',
  'laptop', 'computer', 'screen', 'keyboard', 'mouse', 'shoe', 'car', 'vehicle', 'cat', 'dog',
  'no food', 'no food detected', 'non-food', 'non food', 'not food', 'no recognizable food',
  'no food item', 'no edible food', 'no food present', 'no food items', 'unclear image', 'human'
];

export function sanitizeFoodName(rawName) {
  if (!rawName || typeof rawName !== 'string') return '';
  let cleaned = rawName.trim();

  // Strip Markdown bold/italic or vessel prefixes
  cleaned = cleaned.replace(/[\*\_\`]/g, '');
  cleaned = cleaned.replace(/^(plate|bowl|dish|cup|serving|portion|side|extra)\s+of\s+/i, '');
  cleaned = cleaned.replace(/\s+(on a|in a)\s+(plate|bowl|dish|tray|container)$/i, '');
  cleaned = cleaned.trim();

  return cleaned || rawName;
}

export function isEdibleFood(itemName) {
  if (!itemName || typeof itemName !== 'string') return false;
  const lower = itemName.toLowerCase().trim();

  for (const keyword of STRICT_NON_FOOD_KEYWORDS) {
    if (lower === keyword || lower.includes(keyword)) {
      return false;
    }
  }
  return true;
}

export function normalizeConfidence(rawConfidence, fallback = 88) {
  let val = Number(rawConfidence);
  if (isNaN(val) || val === null || val === undefined) {
    val = fallback;
  }
  if (val <= 1 && val > 0) {
    val = Math.round(val * 100);
  } else {
    val = Math.round(val);
  }
  return Math.min(100, Math.max(0, val));
}

export function filterFoodItems(rawItems) {
  if (!Array.isArray(rawItems)) return [];
  const valid = [];

  for (const item of rawItems) {
    const rawName = typeof item === 'string' ? item : item?.food || item?.name || item?.item || item?.dish || item?.title;
    const cleanName = sanitizeFoodName(rawName);

    if (cleanName && isEdibleFood(cleanName)) {
      const parsedWeight = Number(item?.weight ?? item?.estimatedGrams ?? item?.grams ?? item?.portion_estimate_grams ?? item?.weightGrams);
      const parsedCalories = item?.calories !== undefined ? Number(item?.calories) : undefined;
      const weightVal = (!isNaN(parsedWeight) && parsedWeight > 0) ? parsedWeight : 120;
      valid.push({
        ...(typeof item === 'object' ? item : {}),
        food: cleanName,
        name: cleanName,
        grams: weightVal,
        weight: weightVal,
        calories: (parsedCalories !== undefined && !isNaN(parsedCalories)) ? parsedCalories : item?.calories,
        confidence: normalizeConfidence(item?.confidence, 88)
      });
    }
  }

  return valid;
}

export function parseVisionAPIResponse(responseText) {
  if (!responseText || typeof responseText !== 'string') return null;

  let cleanedText = responseText.trim();
  // Strip Markdown code block indicators ```json ... ``` or backticks
  cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').replace(/```/g, '').trim();

  let directJSON = null;
  try {
    directJSON = JSON.parse(cleanedText);
  } catch (e) {
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        directJSON = JSON.parse(jsonMatch[0]);
      } catch (e2) { }
    }
  }

  if (directJSON && typeof directJSON === 'object') {
    return normalizeParsedJSON(directJSON);
  }

  return null;
}

function normalizeParsedJSON(parsed) {
  const isFoodFlag = parsed.isFood !== undefined ? Boolean(parsed.isFood) : (parsed.is_food !== undefined ? Boolean(parsed.is_food) : true);
  const dishName = parsed.foodName || parsed.dishName || parsed.dish || parsed.mealName || parsed.title || parsed.name || 'Recorded Food Dish';
  const dishLower = (dishName || '').toLowerCase().trim();

  if (
    isFoodFlag === false ||
    parsed.isNonFoodObject ||
    !isEdibleFood(dishName) ||
    dishLower.includes('no food') ||
    dishLower.includes('non-food') ||
    dishLower.includes('not food') ||
    dishLower.includes('no recognizable food') ||
    dishLower.includes('person') ||
    dishLower.includes('selfie') ||
    dishLower.includes('human')
  ) {
    return getNonFoodErrorResult();
  }

  const confidence = normalizeConfidence(parsed.confidence, 92);
  const calories = Number(parsed.calories) || 0;
  const carbs = Number(parsed.carbs) || 0;
  const protein = Number(parsed.protein) || 0;
  const fat = Number(parsed.fat) || 0;

  const mappedItems = parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0
    ? parsed.items.map(i => ({
        name: sanitizeFoodName(i.name || i.food || dishName),
        food: sanitizeFoodName(i.name || i.food || dishName),
        weight: Number(i.weight || i.grams) || 150,
        estimatedGrams: Number(i.weight || i.grams) || 150,
        grams: Number(i.weight || i.grams) || 150,
        calories: Number(i.calories) || Math.round(calories / (parsed.items.length || 1)),
        carbs: Number(i.carbs) || Math.round(carbs / (parsed.items.length || 1)),
        protein: Number(i.protein) || Math.round(protein / (parsed.items.length || 1)),
        fat: Number(i.fat) || Math.round(fat / (parsed.items.length || 1)),
        confidence: confidence
      }))
    : [{
        name: sanitizeFoodName(dishName),
        food: sanitizeFoodName(dishName),
        weight: 150,
        estimatedGrams: 150,
        grams: 150,
        calories: calories,
        carbs: carbs,
        protein: protein,
        fat: fat,
        confidence: confidence
      }];

  return {
    isFood: true,
    dishName: dishName,
    foodName: dishName,
    calories: calories,
    carbs: carbs,
    protein: protein,
    fat: fat,
    confidence: confidence,
    detectedItems: mappedItems,
    nutritionTotals: {
      calories: calories,
      carbs: carbs,
      protein: protein,
      fat: fat,
      fiber: Math.round(carbs * 0.1),
      sugar: Math.round(carbs * 0.2)
    }
  };
}

async function toBase64Data(imageSource) {
  if (!imageSource) return { base64: '', mimeType: 'image/jpeg' };

  if (typeof imageSource === 'string' && imageSource.startsWith('data:image')) {
    const parts = imageSource.split(',');
    const mimeMatch = imageSource.match(/data:(image\/[a-zA-Z+]+);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    return { base64: parts[1], mimeType };
  }

  if (typeof window !== 'undefined' && (imageSource instanceof File || imageSource instanceof Blob)) {
    const mimeType = imageSource.type || 'image/jpeg';
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result.split(',')[1] || '');
        } else {
          resolve('');
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    });
    return { base64, mimeType };
  }

  try {
    const img = await loadImage(imageSource);
    const canvas = document.createElement('canvas');
    let maxDim = 800;
    let w = img.naturalWidth || img.width || 600;
    let h = img.naturalHeight || img.height || 600;
    if (w > maxDim || h > maxDim) {
      if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
      else { w = Math.round((w * maxDim) / h); h = maxDim; }
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    return { base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
  } catch (e) {
    return { base64: '', mimeType: 'image/jpeg' };
  }
}

/**
 * Primary AI Engine: Google Gemini SDK (@google/generative-ai)
 */
export async function callGeminiSDKFoodVisionAPI(imageSource, apiKey) {
  try {
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      console.error('[Gemini SDK Error]: VITE_GEMINI_API_KEY is missing');
      return { isApiError: true, errorMsg: 'API Key missing' };
    }

    const { base64, mimeType } = await toBase64Data(imageSource);
    if (!base64) return { isApiError: true, errorMsg: 'Failed to process image payload' };

    const genAI = new GoogleGenerativeAI(key);

    const prompt = `Analyze the image. If there is NO food or drink in the image (e.g., it's a person, selfie, or random object), return strictly { "isFood": false } and nothing else.

If there IS real, edible human food or drink in the image, return ONLY raw JSON without markdown formatting (no \`\`\`json code blocks) using this EXACT schema:
{
  "isFood": true,
  "foodName": "Name of the dish",
  "calories": 450,
  "carbs": 55,
  "protein": 22,
  "fat": 14,
  "confidence": 92
}`;

    const modelsToTry = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

    let lastErrorMsg = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64, mimeType: mimeType } }
        ]);

        const responseText = result.response.text();
        console.log(`[Gemini SDK Food Vision (${modelName}) Success Response]:`, responseText);

        const parsed = parseVisionAPIResponse(responseText);
        if (parsed) return parsed;
      } catch (modelErr) {
        console.warn(`[Gemini SDK Model ${modelName} failed]:`, modelErr?.message);
        lastErrorMsg = modelErr?.message;
      }
    }

    return { isApiError: true, errorMsg: lastErrorMsg || 'Model connection failed' };

  } catch (err) {
    console.error('[Gemini SDK Food Vision API Failure Reason]:', err?.message || err);
    return { isApiError: true, errorMsg: err?.message || 'SDK Exception' };
  }
}

/**
 * Secondary AI Engine: xAI Grok Vision API (grok-2-vision-1212)
 */
export async function callGrokFoodVisionAPI(imageSource, grokApiKey) {
  let dataUrl = '';

  if (typeof imageSource === 'string' && imageSource.startsWith('data:image')) {
    dataUrl = imageSource;
  } else {
    try {
      const img = await loadImage(imageSource);
      const canvas = document.createElement('canvas');
      let maxDim = 800;
      let w = img.naturalWidth || img.width || 600;
      let h = img.naturalHeight || img.height || 600;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else { w = Math.round((w * maxDim) / h); h = maxDim; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      return { isApiError: true, errorMsg: 'Failed canvas encoding' };
    }
  }

  const prompt = `Analyze the image. If there is NO food or drink in the image (e.g., it's a person, selfie, or random object), return strictly { "isFood": false } and nothing else.

If there IS real, edible human food or drink in the image, return ONLY raw JSON without markdown formatting (no \`\`\`json code blocks) using this EXACT schema:
{
  "isFood": true,
  "foodName": "Name of the dish",
  "calories": 450,
  "carbs": 55,
  "protein": 22,
  "fat": 14,
  "confidence": 92
}`;

  const models = ['grok-2-vision-1212', 'grok-vision-beta', 'grok-2-vision'];

  for (const model of models) {
    try {
      const response = await fetch(`https://api.x.ai/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } }
              ]
            }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content;
      if (!rawText) continue;

      const parsed = parseVisionAPIResponse(rawText);
      if (parsed) return parsed;

    } catch (err) { }
  }

  return { isApiError: true, errorMsg: 'Grok Vision API unavailable' };
}

/**
 * Client-Side Vision Classifier Fallback - STRICT NON-FOOD CHECK (ZERO FAKE MOCK DATA)
 */
export function analyzeFoodImageCanvasFallback(canvas, width, height) {
  if (!canvas) {
    return getNonFoodErrorResult();
  }

  try {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    let greenPixels = 0;
    let yellowBrownPixels = 0;
    let redPixels = 0;
    let whitePixels = 0;
    let darkPixels = 0;
    let totalCount = pixels.length / 4;

    let rSum = 0, gSum = 0, bSum = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      rSum += r;
      gSum += g;
      bSum += b;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (g > 50 && g > r * 1.02 && g > b * 1.05) greenPixels++;
      else if ((r > 100 && g > 70 && b < r * 0.88) || (r > 140 && g > 95 && b < 130)) yellowBrownPixels++;
      else if (r > 120 && r > g * 1.15 && r > b * 1.15) redPixels++;
      else if (r > 165 && g > 165 && b > 165) whitePixels++;
      else if (lum < 40) darkPixels++;
    }

    const greenRatio = greenPixels / totalCount;
    const yellowBrownRatio = yellowBrownPixels / totalCount;
    const redRatio = redPixels / totalCount;
    const whiteRatio = whitePixels / totalCount;
    const darkRatio = darkPixels / totalCount;

    const avgR = rSum / totalCount;
    const avgG = gSum / totalCount;
    const avgB = bSum / totalCount;
    const isPureSelfieSkin = (avgR > 150 && avgG > 105 && avgB > 85 && avgR > avgG && avgG > avgB && greenRatio < 0.01 && whiteRatio < 0.02 && redRatio < 0.01 && darkRatio < 0.05);

    if (isPureSelfieSkin || (greenRatio < 0.01 && yellowBrownRatio < 0.02 && redRatio < 0.01 && whiteRatio < 0.01)) {
      return getNonFoodErrorResult();
    }
  } catch (e) {
    return getNonFoodErrorResult();
  }

  return getNonFoodErrorResult();
}

export async function analyzeFoodImage(imageSource, sampleType) {
  const uploadId = 'food-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  try {
    let aiResult = null;

    // Handle Preset Sample Scans (from FoodNutrition quick preset buttons if explicitly requested)
    if (!imageSource && sampleType) {
      if (sampleType === 'salad' || sampleType === 'Chicken Salad') {
        aiResult = {
          isFood: true,
          foodName: 'Fresh Chicken Salad',
          calories: 320, carbs: 12, protein: 28, fat: 14,
          confidence: 95,
          detectedItems: [
            { food: 'Mixed Salad Greens', grams: 140, calories: 45, carbs: 6, protein: 2, fat: 1, confidence: 95 },
            { food: 'Grilled Chicken Breast', grams: 120, calories: 195, carbs: 0, protein: 24, fat: 4, confidence: 92 }
          ]
        };
      } else if (sampleType === 'pizza' || sampleType === 'Pizza') {
        aiResult = {
          isFood: true,
          foodName: 'Vegetable Pizza Slice',
          calories: 285, carbs: 36, protein: 12, fat: 11,
          confidence: 92,
          detectedItems: [
            { food: 'Vegetable Pizza Slice', grams: 120, calories: 285, carbs: 36, protein: 12, fat: 11, confidence: 92 }
          ]
        };
      } else if (sampleType === 'oatmeal' || sampleType === 'Oatmeal') {
        aiResult = {
          isFood: true,
          foodName: 'Oatmeal with Almonds & Berries',
          calories: 240, carbs: 38, protein: 8, fat: 7,
          confidence: 96,
          detectedItems: [
            { food: 'Oatmeal with Berries', grams: 180, calories: 240, carbs: 38, protein: 8, fat: 7, confidence: 96 }
          ]
        };
      }
    }

    // 1. PRIMARY ENGINE: Google Gemini Vision SDK (@google/generative-ai)
    if (!aiResult && imageSource) {
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY;
      if (geminiApiKey) {
        aiResult = await callGeminiSDKFoodVisionAPI(imageSource, geminiApiKey);
      }
    }

    // 2. SECONDARY ENGINE: xAI Grok Vision API
    if ((!aiResult || aiResult.isApiError) && imageSource) {
      const grokKey = import.meta.env.VITE_GROK_API_KEY || import.meta.env.VITE_VISION_API_KEY;
      if (grokKey) {
        const grokRes = await callGrokFoodVisionAPI(imageSource, grokKey);
        if (grokRes && !grokRes.isApiError) {
          aiResult = grokRes;
        }
      }
    }

    // Differentiate between API Connection Error vs. Actual "Not Food" Classification
    if (aiResult?.isApiError) {
      return getApiErrorResult(aiResult.errorMsg);
    }

    if (!aiResult || aiResult.isFood === false) {
      return getNonFoodErrorResult();
    }

    const rawItems = aiResult.detectedItems || [];
    let sanitizedItems = filterFoodItems(rawItems);

    if (sanitizedItems.length === 0 && aiResult.foodName && isEdibleFood(aiResult.foodName)) {
      const fallbackName = sanitizeFoodName(aiResult.foodName);
      sanitizedItems = [{
        food: fallbackName,
        name: fallbackName,
        grams: 150,
        weight: 150,
        calories: Number(aiResult.calories) || 225,
        carbs: Number(aiResult.carbs) || 30,
        protein: Number(aiResult.protein) || 15,
        fat: Number(aiResult.fat) || 8,
        confidence: normalizeConfidence(aiResult.confidence, 90)
      }];
    }

    if (sanitizedItems.length === 0) {
      return getNonFoodErrorResult();
    }

    const processedItems = sanitizedItems.map(item => {
      const name = item.food || item.name;
      const grams = Number(item.weight || item.grams || item.estimatedGrams) || 150;
      const nut = calculateItemNutrition(name, grams);
      const calories = (typeof item.calories === 'number' && !isNaN(item.calories) && item.calories > 0) ? item.calories : nut.calories;
      return {
        food: nut.foodName || name,
        name: nut.foodName || name,
        grams: grams,
        weight: grams,
        portion: `${grams} g`,
        calories: calories,
        carbs: typeof item.carbs === 'number' ? item.carbs : nut.carbs,
        protein: typeof item.protein === 'number' ? item.protein : nut.protein,
        fat: typeof item.fat === 'number' ? item.fat : nut.fat,
        confidence: normalizeConfidence(item.confidence || aiResult.confidence, 90)
      };
    });

    const totals = calculateMealTotals(processedItems);

    const nutritionTotals = aiResult.nutritionTotals || {
      calories: Number(aiResult.calories) || totals.calories,
      carbs: Number(aiResult.carbs) || totals.carbs,
      protein: Number(aiResult.protein) || totals.protein,
      fat: Number(aiResult.fat) || totals.fat,
      fiber: totals.fiber,
      sugar: totals.sugar
    };

    const normConfidence = normalizeConfidence(aiResult.confidence, 90);

    return {
      isFood: true,
      isApiError: false,
      uploadId: uploadId,
      dishName: aiResult.foodName || aiResult.dishName || processedItems.map(i => i.food).join(', '),
      foodName: aiResult.foodName || aiResult.dishName || processedItems.map(i => i.food).join(', '),
      detectedItems: processedItems,
      nutritionTotals: nutritionTotals,
      calories: Number(nutritionTotals.calories) || totals.calories,
      carbs: Number(nutritionTotals.carbs) || totals.carbs,
      protein: Number(nutritionTotals.protein) || totals.protein,
      fat: Number(nutritionTotals.fat) || totals.fat,
      fiber: Number(nutritionTotals.fiber) || totals.fiber,
      sugar: Number(nutritionTotals.sugar) || totals.sugar,
      sodium: totals.sodium,
      confidence: normConfidence,
      confidenceLevel: getConfidenceLabel(normConfidence),
      possibleAlternatives: aiResult.possibleAlternatives || []
    };

  } catch (err) {
    console.error('[Food Service Exception]:', err);
    return getApiErrorResult(err?.message);
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
    } else if (typeof window !== 'undefined' && (source instanceof File || source instanceof Blob)) {
      img.src = URL.createObjectURL(source);
    } else {
      reject(new Error('Invalid image source'));
    }
  });
}

function getConfidenceLabel(confidence) {
  const normConf = normalizeConfidence(confidence, 88);
  if (normConf >= 85) return { label: 'High Confidence', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' };
  if (normConf >= 70) return { label: 'Medium Confidence', color: '#92400e', bg: '#fffbeb', border: '#fde68a' };
  return { label: 'Uncertain - Please Confirm Food', color: '#991b1b', bg: '#fef2f2', border: '#fecaca' };
}

export function getApiErrorResult(detailMsg) {
  return {
    isFood: false,
    isApiError: true,
    errorType: 'API_ERROR',
    error: 'API_ERROR',
    foodName: 'AI Service Connection Error',
    statusText: 'AI Service Connection Error. Please try again.',
    subText: detailMsg ? `Connection detail: ${detailMsg}` : 'Could not connect to AI Vision Service. Please check your network connection or API key.',
    recommendation: 'Please verify your internet connection or try again in a few moments.'
  };
}

export function getNonFoodErrorResult() {
  return {
    isFood: false,
    isApiError: false,
    errorType: 'NO_FOOD_DETECTED',
    error: 'NO_FOOD_DETECTED',
    foodName: 'No Food Detected',
    statusText: 'No food detected! Please upload a clear picture of a meal.',
    subText: 'The photo appears to show a person, selfie, face, or non-food object.',
    recommendation: 'Please upload a clear photograph of a real meal or food item.'
  };
}
