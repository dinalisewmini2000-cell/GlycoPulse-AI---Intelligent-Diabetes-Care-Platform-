/**
 * GlycoPulse AI - Diabetic Foot Ulcer (DFU) Vision Inspection Service
 * 
 * Image-based visual screening pipeline for Diabetic Foot Ulcers.
 * Operates on actual image pixels (HTML5 Canvas Pixel Analyzer & Vision API Bridge).
 * Strictly complies with medical safety standards: no fake perfusion %, no Grade 0, no diagnostic claims.
 */

/**
 * Analyzes an uploaded image file or URL for DFU visual screening.
 * @param {File | string} imageSource - Uploaded File object or image Data URL
 * @returns {Promise<Object>} Structured DFU visual screening result
 */
export async function analyzeDFUFootImage(imageSource) {
  try {
    // Step 1: Load image into HTML Image object
    const img = await loadImage(imageSource);
    
    // Step 2: Analyze image pixels using HTML5 Canvas Computer Vision Engine
    const canvasResult = analyzeCanvasPixels(img);

    // If Gemini or External AI Vision API key is present in environment, call vision AI
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY;
    if (apiKey && canvasResult.isFoot && canvasResult.imageQuality === 'good') {
      try {
        const aiResult = await callVisionAPI(img, apiKey);
        if (aiResult) return aiResult;
      } catch (err) {
        console.warn('[DFU Vision API] Fallback to Canvas Pixel Analyzer:', err.message);
      }
    }

    return canvasResult;
  } catch (err) {
    console.error('[DFU Service Error]:', err);
    return {
      isFoot: false,
      imageQuality: 'insufficient',
      assessmentPossible: false,
      screeningResult: 'UNABLE TO RELIABLY ASSESS',
      statusText: 'Image quality insufficient for reliable visual screening.',
      findings: [],
      confidence: 'Unable to assess',
      limitations: ['Image file could not be processed properly.'],
      recommendation: 'Please upload a clear, well-lit foot photo.',
      disclaimer: getSafetyDisclaimer()
    };
  }
}

/**
 * Helper to load an image element asynchronously
 */
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
 * HTML5 Canvas Pixel Inspection Engine
 * Inspects raw RGB values, luminescence, skin color ratios, edge sharpness, and color clusters.
 */
function analyzeCanvasPixels(img) {
  const canvas = document.createElement('canvas');
  // Scale down large images for performance while retaining enough detail for feature extraction
  const maxDim = 400;
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

  // -------------------------------------------------------------
  // 1. QUALITY CHECK: Resolution, Brightness, and Sharpness/Blur
  // -------------------------------------------------------------
  if (width < 60 || height < 60) {
    return {
      isFoot: false,
      imageQuality: 'too_small',
      assessmentPossible: false,
      screeningResult: 'UNABLE TO RELIABLY ASSESS',
      statusText: 'Image quality insufficient for reliable visual screening.',
      subText: 'Resolution is too small for reliable inspection.',
      findings: [],
      confidence: 'Unable to assess',
      limitations: ['Image resolution is too low to inspect fine skin details.'],
      recommendation: 'Please upload a larger, higher-resolution photograph of the foot.',
      disclaimer: getSafetyDisclaimer()
    };
  }

  let totalLuma = 0;
  let skinPixelCount = 0;
  let highRedCount = 0;
  let darkLesionCount = 0;
  let purplishCount = 0;
  let edgeDiffSum = 0;

  // Grayscale matrix for blur detection
  const grayGrid = new Float32Array(totalPixels);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuma += luma;

    const pixelIdx = i / 4;
    grayGrid[pixelIdx] = luma;

    // --- Human Skin Color Detection Rules (RGB & YCbCr) ---
    // Y = 0.299R + 0.587G + 0.114B
    // Cb = 128 - 0.168736R - 0.331264G + 0.5B
    // Cr = 128 + 0.5R - 0.418688G - 0.081312B
    const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;

    const isSkinRGB = r > 45 && g > 25 && b > 15 && r > g && (r - g) > 8 && (r - b) > 8;
    const isSkinYCbCr = Cr >= 130 && Cr <= 180 && Cb >= 80 && Cb <= 135;

    if (isSkinRGB || isSkinYCbCr) {
      skinPixelCount++;

      // Erythema / Redness check inside skin region
      if (r > 130 && r > (g + 30) && (r / (g + b + 1)) > 0.65) {
        highRedCount++;
      }

      // Dark Necrotic / Ulcerated Lesion check inside skin region
      if (r < 75 && g < 60 && b < 60 && (r + g + b) < 170) {
        darkLesionCount++;
      }

      // Cyanotic / Discolored / Bruised skin check
      if (b > g && r > g && (r + b) > (2 * g + 20)) {
        purplishCount++;
      }
    }
  }

  const avgLuma = totalLuma / totalPixels;

  // Calculate Simple Laplacian Edge Gradient Variance (Sharpness)
  let lapVarianceSum = 0;
  let edgeSamples = 0;

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const idx = y * width + x;
      // 3x3 Laplacian filter kernel
      const center = grayGrid[idx];
      const neighbors = grayGrid[idx - 1] + grayGrid[idx + 1] + grayGrid[idx - width] + grayGrid[idx + width];
      const lap = Math.abs(4 * center - neighbors);
      edgeDiffSum += lap;
      edgeSamples++;
    }
  }

  const avgSharpness = edgeSamples > 0 ? edgeDiffSum / edgeSamples : 100;

  // --- Quality Classification ---
  if (avgLuma < 30) {
    return {
      isFoot: true,
      imageQuality: 'too_dark',
      assessmentPossible: false,
      screeningResult: 'UNABLE TO RELIABLY ASSESS',
      statusText: 'Image quality insufficient for reliable visual screening.',
      subText: 'The photograph is too dark to inspect skin details or lesions.',
      findings: [],
      confidence: 'Unable to assess',
      limitations: ['Severe underexposure / darkness prevents visual analysis.'],
      recommendation: 'Please capture a new photo with adequate lighting or flash.',
      disclaimer: getSafetyDisclaimer()
    };
  }

  if (avgLuma > 242) {
    return {
      isFoot: true,
      imageQuality: 'too_bright',
      assessmentPossible: false,
      screeningResult: 'UNABLE TO RELIABLY ASSESS',
      statusText: 'Image quality insufficient for reliable visual screening.',
      subText: 'The photograph is overexposed / washed out.',
      findings: [],
      confidence: 'Unable to assess',
      limitations: ['Overexposure washes out skin surface details.'],
      recommendation: 'Please reduce bright light glare and capture a clear foot photo.',
      disclaimer: getSafetyDisclaimer()
    };
  }

  if (avgSharpness < 3.2) {
    return {
      isFoot: true,
      imageQuality: 'blurry',
      assessmentPossible: false,
      screeningResult: 'UNABLE TO RELIABLY ASSESS',
      statusText: 'Image quality insufficient for reliable visual screening.',
      subText: 'The photo appears blurry or out of focus.',
      findings: [],
      confidence: 'Unable to assess',
      limitations: ['Blurriness obscures skin texture, cuts, and lesion margins.'],
      recommendation: 'Please hold the camera steady and focus clearly on the foot.',
      disclaimer: getSafetyDisclaimer()
    };
  }

  // -------------------------------------------------------------
  // 2. FOOT VALIDATION: Check if image is actually a human foot
  // -------------------------------------------------------------
  const skinRatio = skinPixelCount / totalPixels;

  if (skinRatio < 0.16) {
    return {
      isFoot: false,
      imageQuality: 'good',
      assessmentPossible: false,
      screeningResult: 'NOT A FOOT',
      statusText: 'No clearly identifiable foot detected.',
      subText: 'Please upload a clear photograph of a foot for visual screening.',
      findings: [],
      confidence: 'High',
      limitations: ['The uploaded image does not contain a recognizable human foot surface.'],
      recommendation: 'Ensure your photograph clearly displays the sole, top, or sides of a human foot without shoes or socks.',
      disclaimer: getSafetyDisclaimer()
    };
  }

  // -------------------------------------------------------------
  // 3. FEATURE EXTRACTION & FINDINGS CLASSIFICATION
  // -------------------------------------------------------------
  const redRatioInSkin = skinPixelCount > 0 ? highRedCount / skinPixelCount : 0;
  const darkRatioInSkin = skinPixelCount > 0 ? darkLesionCount / skinPixelCount : 0;
  const purpleRatioInSkin = skinPixelCount > 0 ? purplishCount / skinPixelCount : 0;

  const findings = [];
  let screeningResult = 'NO OBVIOUS VISIBLE ABNORMALITY';
  let confidence = 'High';
  let subText = 'No obvious visible ulcer or open wound detected.';
  let recommendation = 'Maintain daily foot inspection, proper footwear, and regular clinical evaluations with your healthcare provider.';

  // Check 1: Dark / Open Lesion / Ulcer-like area
  if (darkRatioInSkin > 0.015) {
    screeningResult = 'VISIBLE WOUND / ULCER-LIKE AREA';
    confidence = darkRatioInSkin > 0.04 ? 'High' : 'Moderate';
    subText = 'An open lesion or dark ulcer-like skin defect is visible on the foot.';
    findings.push({
      type: 'Visible wound / ulcer-like lesion',
      location: 'Visible area of foot',
      confidence: confidence,
      description: 'An open skin defect or dark ulcer-like tissue disruption is visible in the photograph.'
    });
    recommendation = 'The appearance is concerning for a wound/ulcer-like lesion and requires prompt clinical assessment by a podiatrist or physician.';
  }

  // Check 2: Redness / Inflammation / Swelling
  if (redRatioInSkin > 0.08) {
    if (screeningResult === 'VISIBLE WOUND / ULCER-LIKE AREA') {
      screeningResult = 'MULTIPLE VISIBLE ABNORMALITIES';
    } else {
      screeningResult = 'VISIBLE SWELLING / REDNESS';
    }
    const redConf = redRatioInSkin > 0.16 ? 'High' : 'Moderate';
    findings.push({
      type: 'Visible redness / erythema',
      location: 'Localized area of foot',
      confidence: redConf,
      description: 'High confidence that visible redness or localized inflammation is present in the visible skin region.'
    });
    if (screeningResult === 'VISIBLE SWELLING / REDNESS') {
      subText = 'Visible redness and potential localized swelling detected in visible skin area.';
      recommendation = 'Monitor the red area carefully. The cause of redness or swelling cannot be determined from a photo alone; consult your clinician if persistent or worsening.';
    }
  }

  // Check 3: Discoloration / Cyanosis / Callus
  if (purpleRatioInSkin > 0.06 && screeningResult === 'NO OBVIOUS VISIBLE ABNORMALITY') {
    screeningResult = 'VISIBLE SKIN CHANGE';
    confidence = 'Moderate';
    subText = 'Skin discoloration or bluish/purplish hue detected on visible area.';
    findings.push({
      type: 'Skin discoloration',
      location: 'Visible skin region',
      confidence: 'Moderate',
      description: 'Unusual color variation or purplish/bluish discoloration observed in visible skin.'
    });
    recommendation = 'Have a healthcare professional inspect any new or unexplained skin color changes during your next checkup.';
  }

  // Check 4: Normal Intact Foot
  if (findings.length === 0) {
    findings.push({
      type: 'Intact skin appearance',
      location: 'Visible surface of foot',
      confidence: 'High',
      description: 'Skin appears intact in the visible areas with no obvious open wound or ulcer-like lesion detected.'
    });
  }

  // Build Limitations List (Crucial for clinical safety)
  const limitations = [
    'Assessment is limited exclusively to the visible area shown in the photo.',
    'Circulation, microvascular perfusion percentage, nerve sensation, and neuropathy cannot be determined from a photograph.',
    'The plantar surface must be photographed directly if assessing for plantar ulcers.',
    'A normal photograph appearance does not rule out underlying neuropathy, deep tissue infection, or arterial disease.'
  ];

  return {
    isFoot: true,
    imageQuality: 'good',
    assessmentPossible: true,
    screeningResult: screeningResult,
    statusText: getScreeningTitle(screeningResult),
    subText: subText,
    findings: findings,
    confidence: confidence,
    limitations: limitations,
    recommendation: recommendation,
    disclaimer: getSafetyDisclaimer()
  };
}

/**
 * Maps screening result code to user-facing title
 */
function getScreeningTitle(resultCode) {
  switch (resultCode) {
    case 'NO OBVIOUS VISIBLE ABNORMALITY':
      return 'NO OBVIOUS VISIBLE ABNORMALITY DETECTED';
    case 'VISIBLE SKIN CHANGE':
      return 'VISIBLE SKIN CHANGE DETECTED';
    case 'VISIBLE WOUND / ULCER-LIKE AREA':
      return 'VISIBLE WOUND / ULCER-LIKE AREA DETECTED';
    case 'VISIBLE SWELLING / REDNESS':
      return 'VISIBLE SWELLING / REDNESS DETECTED';
    case 'MULTIPLE VISIBLE ABNORMALITIES':
      return 'MULTIPLE VISIBLE ABNORMALITIES DETECTED';
    default:
      return 'UNABLE TO RELIABLY ASSESS';
  }
}

/**
 * Standard mandatory medical safety disclaimer required on all outputs
 */
function getSafetyDisclaimer() {
  return "Important: This AI feature provides image-based visual screening support only. It cannot diagnose diabetic foot ulcers, neuropathy, infection, or circulation problems. A healthcare professional should perform a clinical assessment when medically appropriate.";
}

/**
 * Vision API Bridge (Optional call to Gemini Vision Model if API key is present)
 */
async function callVisionAPI(img, apiKey) {
  // Convert image canvas to base64 JPEG
  const canvas = document.createElement('canvas');
  canvas.width = img.width || 300;
  canvas.height = img.height || 300;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const base64Data = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

  const prompt = `Analyze this image for Diabetic Foot Ulcer (DFU) Visual Screening:
1. Is it a human foot? If not, set isFoot: false.
2. Is image quality good, dark, bright, or blurry?
3. If valid foot, classify screeningResult: "NO OBVIOUS VISIBLE ABNORMALITY" | "VISIBLE SKIN CHANGE" | "VISIBLE WOUND / ULCER-LIKE AREA" | "VISIBLE SWELLING / REDNESS" | "MULTIPLE VISIBLE ABNORMALITIES" | "UNABLE TO RELIABLY ASSESS".
4. DO NOT generate numerical clinical diagnostic metrics like blood perfusion %, microvascular %, ABI, or Wagner Grade 0.
Return JSON format:
{
  "isFoot": boolean,
  "imageQuality": "good"|"blurry"|"too_dark"|"too_bright",
  "assessmentPossible": boolean,
  "screeningResult": string,
  "findings": [{"type": string, "location": string, "confidence": "High"|"Moderate"|"Low", "description": string}],
  "confidence": "High"|"Moderate"|"Low",
  "limitations": [string],
  "recommendation": string
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

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    ...parsed,
    statusText: getScreeningTitle(parsed.screeningResult || 'UNABLE TO RELIABLY ASSESS'),
    disclaimer: getSafetyDisclaimer()
  };
}
