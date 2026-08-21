/**
 * GlycoPulse AI - Clinical Laboratory Report Vision & Extraction Service
 * 
 * Uses Google Gemini Vision SDK (@google/generative-ai) for OCR extraction.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeLabReportDocument(fileOrBase64, fileName = '') {
  const uploadId = 'lab-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  console.log(`[Lab Report Pipeline] Processing file: ${fileName} (ID: ${uploadId})`);

  try {
    let base64Data = '';
    let imageSrc = '';
    let mimeType = 'application/pdf';

    if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      mimeType = fileOrBase64.type || (fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      base64Data = await fileToBase64(fileOrBase64);
      if (mimeType.includes('image')) {
        imageSrc = URL.createObjectURL(fileOrBase64);
      }
    } else if (typeof fileOrBase64 === 'string') {
      if (fileOrBase64.startsWith('data:')) {
        const parts = fileOrBase64.split(';');
        mimeType = parts[0].replace('data:', '');
        base64Data = fileOrBase64.split(',')[1];
      } else {
        base64Data = fileOrBase64;
        mimeType = fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
      }
      imageSrc = fileOrBase64.startsWith('data:image') ? fileOrBase64 : '';
    }

    if (!base64Data || base64Data.length < 50) {
      return {
        isReadable: false,
        errorMessage: "Could not read the uploaded file. Please provide a clear PDF or image payload."
      };
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY;
    if (!apiKey) {
      return {
        isReadable: false,
        errorMessage: "VITE_GEMINI_API_KEY is not configured in frontend/.env. Please set your Gemini API Key to enable lab report OCR."
      };
    }

    // Call Gemini Vision SDK with exact medical OCR prompt requested
    const parsedData = await callGeminiSDKLabVisionAPI(base64Data, mimeType, apiKey);

    if (!parsedData || typeof parsedData !== 'object') {
      return {
        isReadable: false,
        errorMessage: "We couldn't extract test values from this report. Please upload a clearer PDF or high-resolution photo."
      };
    }

    // Process and validate extracted categories & tests
    const processed = processExtractedLabData(parsedData);
    if (!processed || processed.testResults.length === 0) {
      return {
        isReadable: false,
        errorMessage: "No diagnostic lab test entries were found in the uploaded document. Please ensure it is a valid lab report."
      };
    }

    const labName = parsedData.labName || 'Laboratory Report';
    const patientName = parsedData.patientName || 'Patient';
    const reportDate = parsedData.reportDate || new Date().toLocaleDateString('en-GB');

    const riskInfo = buildRiskAssessmentObject(parsedData.riskAssessment, processed.testResults);

    return {
      isReadable: true,
      isLabReport: true,
      uploadId: uploadId,
      imageSrc: imageSrc,
      labName: labName,
      laboratoryName: labName,
      patientName: patientName,
      reportDate: reportDate,
      totalTestsFound: processed.testResults.length,
      riskAssessment: riskInfo,
      overallSummary: parsedData.overallSummary || `Extracted ${processed.testResults.length} test results from ${labName}.`,
      categories: processed.categories,
      testResults: processed.testResults,
      disclaimer: "This information is provided to help you understand your laboratory report and is not a medical diagnosis. Laboratory results should be interpreted together with your healthcare professional."
    };

  } catch (err) {
    console.error('[Lab Report Service Exception]:', err);
    return {
      isReadable: false,
      errorMessage: "An error occurred while analyzing the lab report file. Please try again with a clear document."
    };
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = err => reject(err);
  });
}

/**
 * Executes Google Gemini Vision API via @google/generative-ai SDK
 */
async function callGeminiSDKLabVisionAPI(base64Data, mimeType, apiKey) {
  const prompt = `Analyze this laboratory report image carefully.
Extract EXACTLY what is written on the document. Do not invent or hallucinate tests that are not present.

Return ONLY a valid JSON object matching this schema:
{
  "labName": "Name of Laboratory / Hospital found on header (e.g. Asiri Laboratories)",
  "patientName": "Full Patient Name found on report",
  "reportDate": "Date of report",
  "riskAssessment": "NORMAL" | "MODERATE RISK" | "HIGH RISK",
  "overallSummary": "Brief clinical interpretation of actual results",
  "categories": [
    {
      "categoryName": "Category (e.g. Glycaemic Control)",
      "tests": [
        {
          "testName": "Exact Test Name (e.g. Haemoglobin A1C (%HbA1c))",
          "result": "Exact numeric/text result (e.g. 7.3)",
          "unit": "Unit (e.g. %)",
          "referenceRange": "Reference range printed on report (e.g. < 5.7)",
          "status": "Within range" | "Above range" | "Below range"
        }
      ]
    }
  ]
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const validMime = mimeType === 'application/pdf' ? 'application/pdf' : (mimeType.includes('png') ? 'image/png' : 'image/jpeg');

    const modelsToTry = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: validMime } }
        ]);

        const responseText = result.response.text();
        console.log(`[Gemini SDK Lab Vision Success (${modelName})]:`, responseText);

        let cleanedText = responseText.trim();
        cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').replace(/```/g, '').trim();

        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn(`[Gemini SDK Lab Model ${modelName} Error]:`, err?.message || err);
      }
    }
  } catch (sdkErr) {
    console.error('[Gemini SDK Exception]:', sdkErr);
  }

  return null;
}

/**
 * Normalizes extracted categories and tests with strict deduplication
 */
function processExtractedLabData(parsedJSON) {
  if (!parsedJSON || typeof parsedJSON !== 'object') {
    return { testResults: [], categories: [] };
  }

  const rawCategories = Array.isArray(parsedJSON.categories) ? parsedJSON.categories : [];
  const processedCategories = [];
  const allTests = [];
  const seenTestNames = new Set();

  for (const catObj of rawCategories) {
    if (!catObj || typeof catObj !== 'object') continue;

    const categoryName = String(catObj.categoryName || 'General Biochemistry').trim();
    const rawTests = Array.isArray(catObj.tests) ? catObj.tests : [];
    const validCategoryTests = [];

    for (const testObj of rawTests) {
      if (!testObj || typeof testObj !== 'object') continue;

      const rawTestName = String(testObj.testName || testObj.test || '').trim();
      if (!rawTestName || rawTestName.length < 2 || isNonTestMetadata(rawTestName)) continue;

      const normKey = rawTestName.toLowerCase();
      if (seenTestNames.has(normKey)) continue; // SKIP DUPLICATE TESTS
      seenTestNames.add(normKey);

      const result = String(testObj.result ?? testObj.value ?? '—').trim();
      const unit = testObj.unit ? String(testObj.unit).trim() : 'Not provided';
      const referenceRange = testObj.referenceRange ? String(testObj.referenceRange).trim() : 'Not provided';

      let status = testObj.status ? String(testObj.status).trim() : 'Within range';
      if (!['Within range', 'Above range', 'Below range', 'Critical'].includes(status)) {
        status = determineStatus(result, referenceRange);
      }

      const explanation = generateExplanation(rawTestName, result, unit, referenceRange, status);

      const testEntry = {
        testName: rawTestName,
        result: result,
        unit: unit,
        referenceRange: referenceRange,
        status: status,
        category: categoryName,
        explanation: explanation
      };

      validCategoryTests.push(testEntry);
      allTests.push(testEntry);
    }

    if (validCategoryTests.length > 0) {
      processedCategories.push({
        categoryName: categoryName,
        tests: validCategoryTests
      });
    }
  }

  return {
    testResults: allTests,
    categories: processedCategories
  };
}

function isNonTestMetadata(name) {
  const lower = name.toLowerCase();
  const blacklisted = [
    'uhid', 'phone', 'telephone', 'barcode', 'invoice', 'patient name', 'reg no',
    'date', 'page', 'address', 'collected', 'printed', 'sample id', 'lab no'
  ];
  return blacklisted.some(kw => lower === kw || lower.startsWith(kw + ':') || lower.startsWith(kw + ' :'));
}

function determineStatus(resultStr, rangeStr) {
  if (!rangeStr || rangeStr === 'Not provided' || !resultStr || resultStr === '—') return 'Within range';
  
  const numResult = parseFloat(resultStr.replace(/[^0-9.]/g, ''));
  if (isNaN(numResult)) return 'Within range';

  const rangeMatches = rangeStr.match(/([0-9.]+)\s*[-–—to]+\s*([0-9.]+)/);
  if (rangeMatches) {
    const min = parseFloat(rangeMatches[1]);
    const max = parseFloat(rangeMatches[2]);

    if (numResult < min) return 'Below range';
    if (numResult > max) return 'Above range';
    return 'Within range';
  }

  if (rangeStr.includes('<')) {
    const max = parseFloat(rangeStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(max) && numResult >= max) return 'Above range';
    return 'Within range';
  }

  if (rangeStr.includes('>')) {
    const min = parseFloat(rangeStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(min) && numResult <= min) return 'Below range';
    return 'Within range';
  }

  return 'Within range';
}

function generateExplanation(testName, result, unit, range, status) {
  const lower = testName.toLowerCase();
  let intro = `Measures ${testName} in your lab sample.`;

  if (lower.includes('hba1c') || lower.includes('haemoglobin a1c')) {
    intro = "HbA1c reflects your average blood glucose control over the past 2 to 3 months.";
  } else if (lower.includes('glucose') || lower.includes('sugar')) {
    intro = "Blood glucose measures current sugar level in your bloodstream at sample collection.";
  } else if (lower.includes('creatinine')) {
    intro = "Serum creatinine evaluates how efficiently your kidneys filter waste products.";
  } else if (lower.includes('cholesterol') || lower.includes('hdl') || lower.includes('ldl') || lower.includes('triglycerides')) {
    intro = "Lipid markers assess blood fats to evaluate cardiovascular and metabolic health.";
  }

  const u = unit === 'Not provided' ? '' : unit;
  if (status === 'Within range') {
    return `${intro} Result ${result} ${u} is within reference range (${range}).`;
  } else if (status === 'Above range') {
    return `${intro} Result ${result} ${u} is above stated reference range (${range}). Consult your doctor for clinical advice.`;
  } else if (status === 'Below range') {
    return `${intro} Result ${result} ${u} is below stated reference range (${range}). Consult your doctor for clinical advice.`;
  }
  return `${intro} Value is ${result} ${u} (Range: ${range}).`;
}

function buildRiskAssessmentObject(riskInput, testResults) {
  const total = testResults.length;
  const outOfRangeCount = testResults.filter(t => t.status === 'Above range' || t.status === 'Below range' || t.status === 'Critical').length;
  const withinRangeCount = Math.max(0, total - outOfRangeCount);

  let strLevel = 'NORMAL';
  if (typeof riskInput === 'string') {
    strLevel = riskInput.toUpperCase();
  } else if (outOfRangeCount >= 3) {
    strLevel = 'HIGH RISK';
  } else if (outOfRangeCount > 0) {
    strLevel = 'MODERATE RISK';
  }

  if (strLevel.includes('HIGH')) {
    return {
      level: 'HIGH RISK',
      label: 'High Clinical Risk — Medical Follow-up Advised',
      description: `${outOfRangeCount} test result(s) fall outside stated reference ranges. Discuss with your physician.`,
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      withinRangeCount,
      outOfRangeCount,
      criticalCount: 0
    };
  }

  if (strLevel.includes('MODERATE')) {
    return {
      level: 'MODERATE RISK',
      label: 'Moderate Risk — Attention Recommended',
      description: `${outOfRangeCount} test result(s) fall outside stated reference ranges. Consult your doctor.`,
      color: '#b45309',
      bg: '#fffbeb',
      border: '#fde68a',
      withinRangeCount,
      outOfRangeCount,
      criticalCount: 0
    };
  }

  return {
    level: 'NORMAL',
    label: 'Low Risk — All Values Within Target Ranges',
    description: `All ${total} analyzed test results fall within the reference ranges stated on this report.`,
    color: '#166534',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    withinRangeCount: total,
    outOfRangeCount: 0,
    criticalCount: 0
  };
}
