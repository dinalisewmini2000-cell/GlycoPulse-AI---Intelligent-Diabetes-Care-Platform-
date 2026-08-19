/**
 * GlucoCare - Clinical Lab Report Vision & Document Reader Engine
 * 
 * Pipeline:
 * File Selection -> Format & MIME Resolution -> Gemini 1.5 Flash Vision / PDF OCR API -> Test Itemization -> Reference Range Preservation -> Patient Educational Explanation & Risk Level
 * 
 * STRICT CLINICAL INTEGRITY RULES:
 * 1. ZERO MOCK DATA / ZERO HARDCODED LAB NUMBERS.
 * 2. Real PDF & Image payloads sent to Gemini 1.5 Flash with exact MIME type (application/pdf, image/jpeg, image/png).
 * 3. Every single upload generates a fresh unique upload ID and extracts real document contents.
 * 4. Provides Essential Details (Lab Name, Date, Patient, Total Tests) and Clinical Risk Level (Low / Moderate / High).
 */

export async function analyzeLabReportDocument(fileOrBase64, fileName = '') {
  const uploadId = 'lab-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  
  console.log(`[DEBUG Lab Analysis Pipeline] Request ID: ${uploadId} | File: ${fileName} | Timestamp: ${new Date().toISOString()}`);

  try {
    let base64Data = '';
    let imageSrc = '';
    let rawTextContent = '';
    let mimeType = 'application/pdf';
    let fileSizeStr = 'Unknown size';

    if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      fileSizeStr = `${(fileOrBase64.size / 1024).toFixed(1)} KB`;
      mimeType = fileOrBase64.type || (fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      
      console.log(`[DEBUG Lab File Received] Name: ${fileName} | Type: ${mimeType} | Size: ${fileSizeStr}`);

      base64Data = await fileToBase64(fileOrBase64);
      if (mimeType.includes('image')) {
        imageSrc = URL.createObjectURL(fileOrBase64);
      }
      try {
        rawTextContent = await readTextFromFile(fileOrBase64);
      } catch (e) {
        console.log('[DEBUG Lab Reader] Text file reader skipped for binary payload.');
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
        errorMessage: "We couldn't read this file. Please upload a clear digital PDF or high-resolution photo."
      };
    }

    console.log(`[DEBUG Payload Ready] ID: ${uploadId} | MIME: ${mimeType} | Base64 Length: ${base64Data.length} chars`);

    // Execute Gemini AI Vision / Document Reader API if API key is present
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY;
    if (apiKey) {
      try {
        const aiExtracted = await callGeminiLabVisionAPI(base64Data, mimeType, apiKey);
        
        console.log(`[DEBUG Vision API Output] ID: ${uploadId}`, aiExtracted);

        if (aiExtracted && aiExtracted.isLabReport && Array.isArray(aiExtracted.testResults) && aiExtracted.testResults.length > 0) {
          const sanitizedResults = sanitizeAndValidateResults(aiExtracted.testResults);
          const riskInfo = calculateOverallRiskLevel(sanitizedResults);

          return {
            isReadable: true,
            isLabReport: true,
            uploadId: uploadId,
            imageSrc: imageSrc,
            laboratoryName: aiExtracted.laboratoryName || extractLabNameFromText(rawTextContent, fileName),
            reportDate: aiExtracted.reportDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            patientName: aiExtracted.patientName || 'Patient',
            totalTestsFound: sanitizedResults.length,
            riskAssessment: riskInfo,
            overallSummary: generateOverallSummary(sanitizedResults),
            testResults: sanitizedResults,
            disclaimer: getSafetyDisclaimer()
          };
        }
      } catch (err) {
        console.warn('[DEBUG Lab Vision API Warning]:', err.message);
      }
    }

    // Secondary Parser: Real text regex parser for text-based PDF/documents
    if (rawTextContent && rawTextContent.length > 20) {
      const realExtractedResults = parseRealTextFromDocument(rawTextContent, fileName);

      if (realExtractedResults && realExtractedResults.length > 0) {
        const sanitizedResults = sanitizeAndValidateResults(realExtractedResults);
        const riskInfo = calculateOverallRiskLevel(sanitizedResults);

        return {
          isReadable: true,
          isLabReport: true,
          uploadId: uploadId,
          imageSrc: imageSrc,
          laboratoryName: extractLabNameFromText(rawTextContent, fileName),
          reportDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          patientName: 'Patient',
          totalTestsFound: sanitizedResults.length,
          riskAssessment: riskInfo,
          overallSummary: generateOverallSummary(sanitizedResults),
          testResults: sanitizedResults,
          disclaimer: getSafetyDisclaimer()
        };
      }
    }

    // IF EXTRACTION FAILS OR API KEY IS MISSING: RETURN EXPLICIT ERROR
    return {
      isReadable: false,
      errorMessage: apiKey 
        ? "We couldn't read the test values from this report. Please upload a clearer PDF or high-resolution image." 
        : "Vision API Key is not configured. Please set VITE_GEMINI_API_KEY in frontend/.env to enable live AI lab report extraction."
    };

  } catch (err) {
    console.error('[Lab Reader Error]:', err);
    return {
      isReadable: false,
      errorMessage: "We couldn't analyze this file. Please try again with a clearer image or supported document."
    };
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

function readTextFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = () => resolve('');
  });
}

function parseRealTextFromDocument(rawText, fileName) {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split(/[\r\n]+/);
  const detected = [];

  const testPatterns = [
    { name: 'HbA1c (Glycated Hemoglobin)', keywords: ['hba1c', 'glycated hemoglobin', 'a1c'], category: 'Blood Glucose & HbA1c' },
    { name: 'Fasting Blood Glucose', keywords: ['fasting glucose', 'fbg', 'fasting blood sugar', 'glucose fasting'], category: 'Blood Glucose & HbA1c' },
    { name: 'Random Blood Glucose', keywords: ['random glucose', 'rbg', 'random blood sugar'], category: 'Blood Glucose & HbA1c' },
    { name: 'Hemoglobin', keywords: ['hemoglobin', 'hb', 'haemoglobin'], category: 'Complete Blood Count (CBC)' },
    { name: 'Total Leukocyte Count (WBC)', keywords: ['wbc', 'leukocyte', 'white blood cell'], category: 'Complete Blood Count (CBC)' },
    { name: 'Platelet Count', keywords: ['platelet', 'plt', 'platelets'], category: 'Complete Blood Count (CBC)' },
    { name: 'Serum Creatinine', keywords: ['creatinine', 'serum creatinine'], category: 'Kidney Function' },
    { name: 'Blood Urea', keywords: ['blood urea', 'bun', 'urea'], category: 'Kidney Function' },
    { name: 'Total Cholesterol', keywords: ['total cholesterol', 'cholesterol total', 'cholesterol'], category: 'Lipid Profile' },
    { name: 'HDL Cholesterol', keywords: ['hdl cholesterol', 'hdl'], category: 'Lipid Profile' },
    { name: 'LDL Cholesterol', keywords: ['ldl cholesterol', 'ldl'], category: 'Lipid Profile' },
    { name: 'Triglycerides', keywords: ['triglycerides', 'triglyceride', 'tg'], category: 'Lipid Profile' },
    { name: 'ALT (SGPT)', keywords: ['alt', 'sgpt', 'alanine aminotransferase'], category: 'Liver Function' },
    { name: 'AST (SGOT)', keywords: ['ast', 'sgot', 'aspartate aminotransferase'], category: 'Liver Function' }
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    for (const testPattern of testPatterns) {
      const matchKeyword = testPattern.keywords.some(kw => lowerLine.includes(kw));
      if (matchKeyword) {
        const numMatch = line.match(/([0-9]+(?:\.[0-9]+)?)/);
        if (numMatch) {
          const val = numMatch[1];
          const unitMatch = line.match(/(%|mg\/dL|g\/dL|mmol\/L|U\/L|x10\^9\/L|fl|pg)/i);
          const unit = unitMatch ? unitMatch[1] : 'Not provided';
          const rangeMatch = line.match(/([0-9.]+\s*[-–—to]+\s*[0-9.]+|[<>]\s*[0-9.]+)/);
          const range = rangeMatch ? rangeMatch[1] : 'Not provided';

          detected.push({
            testName: testPattern.name,
            result: val,
            unit: unit,
            referenceRange: range,
            category: testPattern.category
          });

          break;
        }
      }
    }
  }

  return detected;
}

function extractLabNameFromText(rawText, fileName) {
  const combined = (fileName + ' ' + rawText).toLowerCase();
  if (combined.includes('lanka')) return 'Lanka Hospitals Diagnostics';
  if (combined.includes('nawaloka')) return 'Nawaloka Medical Diagnostics';
  if (combined.includes('asiri')) return 'Asiri Health Laboratories';
  if (combined.includes('durdans')) return 'Durdans Hospital Laboratory';
  return 'Clinical Diagnostics Laboratory';
}

function sanitizeAndValidateResults(rawResults) {
  return rawResults.map(item => {
    const testName = item.testName || item.test || 'Lab Test';
    const rawResult = String(item.result || item.value || '—');
    const rawUnit = item.unit ? String(item.unit) : 'Not provided';
    const rawRange = item.referenceRange || item.range ? String(item.referenceRange || item.range) : 'Not provided';
    
    let status = item.status || 'Within range';
    if (!item.status) {
      status = determineStatusFromStatedRange(rawResult, rawRange);
    }

    const explanation = generatePatientFriendlyExplanation(testName, rawResult, rawUnit, rawRange, status);

    return {
      testName: testName,
      result: rawResult,
      unit: rawUnit,
      referenceRange: rawRange,
      status: status,
      category: item.category || categorizeTest(testName),
      explanation: explanation
    };
  });
}

function calculateOverallRiskLevel(sanitizedResults) {
  const total = sanitizedResults.length;
  const criticalCount = sanitizedResults.filter(t => t.status === 'Critical').length;
  const outOfRangeCount = sanitizedResults.filter(t => t.status === 'Above range' || t.status === 'Below range').length;
  const withinRangeCount = total - outOfRangeCount - criticalCount;

  if (criticalCount > 0 || outOfRangeCount >= 3) {
    return {
      level: 'HIGH RISK',
      label: 'High Clinical Risk — Immediate Medical Follow-up Advised',
      description: `${criticalCount > 0 ? criticalCount + ' critical result(s)' : outOfRangeCount + ' lab values outside reference ranges'}. Discuss these findings with your attending physician.`,
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      withinRangeCount,
      outOfRangeCount,
      criticalCount
    };
  }

  if (outOfRangeCount > 0) {
    return {
      level: 'MODERATE RISK',
      label: 'Moderate Risk — Clinical Attention Needed',
      description: `${outOfRangeCount} test result(s) fall outside stated reference ranges. Follow up with your healthcare provider.`,
      color: '#b45309',
      bg: '#fffbeb',
      border: '#fde68a',
      withinRangeCount,
      outOfRangeCount,
      criticalCount: 0
    };
  }

  return {
    level: 'LOW RISK',
    label: 'Low Risk — All Values Within Target Ranges',
    description: `All ${total} analyzed test results fall within the reference ranges stated on this laboratory report.`,
    color: '#166534',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    withinRangeCount: total,
    outOfRangeCount: 0,
    criticalCount: 0
  };
}

function determineStatusFromStatedRange(resultStr, rangeStr) {
  if (rangeStr === 'Not provided' || !resultStr || resultStr === '—') return 'Reported';
  
  const numResult = parseFloat(resultStr.replace(/[^0-9.]/g, ''));
  if (isNaN(numResult)) return 'Reported';

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

function categorizeTest(testName) {
  const lower = testName.toLowerCase();
  if (lower.includes('hba1c') || lower.includes('glucose') || lower.includes('sugar')) return 'Blood Glucose & HbA1c';
  if (lower.includes('hemoglobin') || lower.includes('wbc') || lower.includes('rbc') || lower.includes('platelet') || lower.includes('cbc')) return 'Complete Blood Count (CBC)';
  if (lower.includes('cholesterol') || lower.includes('hdl') || lower.includes('ldl') || lower.includes('triglycerides') || lower.includes('lipid')) return 'Lipid Profile';
  if (lower.includes('alt') || lower.includes('ast') || lower.includes('alp') || lower.includes('bilirubin') || lower.includes('liver')) return 'Liver Function';
  if (lower.includes('creatinine') || lower.includes('urea') || lower.includes('egfr') || lower.includes('kidney')) return 'Kidney Function';
  return 'General Biochemistry';
}

function generatePatientFriendlyExplanation(testName, result, unit, range, status) {
  const lower = testName.toLowerCase();

  let educational = `Measures ${testName} concentration in your blood sample.`;

  if (lower.includes('hba1c')) {
    educational = "HbA1c shows your average blood sugar levels over the past 2 to 3 months.";
  } else if (lower.includes('glucose') || lower.includes('sugar')) {
    educational = "Blood glucose measures the sugar energy level present in your bloodstream at the time of sample collection.";
  } else if (lower.includes('hemoglobin')) {
    educational = "Hemoglobin is a protein in red blood cells that carries oxygen from your lungs to the rest of your body.";
  } else if (lower.includes('creatinine')) {
    educational = "Creatinine is a waste product filtered by your kidneys, indicating how effectively your kidneys are working.";
  } else if (lower.includes('cholesterol') || lower.includes('hdl') || lower.includes('ldl')) {
    educational = "Lipid markers measure fats in your blood to help assess heart & vascular health.";
  }

  const formattedUnit = unit === 'Not provided' ? '' : unit;

  if (status === 'Within range') {
    return `${educational} Your reported result of ${result} ${formattedUnit} falls within the reference range (${range}) provided by this laboratory.`;
  } else if (status === 'Above range') {
    return `${educational} Your reported result of ${result} ${formattedUnit} is above the reference range (${range}) provided by this laboratory. Result should be interpreted by a healthcare professional in clinical context.`;
  } else if (status === 'Below range') {
    return `${educational} Your reported result of ${result} ${formattedUnit} is below the reference range (${range}) provided by this laboratory. Result should be interpreted by a healthcare professional in clinical context.`;
  }

  return `${educational} Reported value is ${result} ${formattedUnit} with reference range stated as ${range}.`;
}

function generateOverallSummary(testResults) {
  const total = testResults.length;
  const abnormal = testResults.filter(t => t.status === 'Above range' || t.status === 'Below range' || t.status === 'Critical');

  if (abnormal.length === 0) {
    return `This report contains ${total} laboratory test results. All reported values are within the reference ranges provided by the laboratory.`;
  }

  return `This report contains ${total} laboratory test results. Most reported values are within the reference ranges provided by the laboratory. ${abnormal.length} test result(s) fall outside stated reference ranges and are highlighted below for review with your physician.`;
}

function getSafetyDisclaimer() {
  return "This information is provided to help you understand the laboratory report and is not a medical diagnosis. Laboratory results should be interpreted together with your symptoms, medical history, medications, and other clinical information by a qualified healthcare professional.";
}

async function callGeminiLabVisionAPI(base64Data, mimeType, apiKey) {
  const prompt = `You are an OCR and Clinical Extraction System for Laboratory Reports.
Analyze the provided document (PDF or image) and extract exact information written on this lab report.

CRITICAL EXTRACTION RULES:
1. NON-LAB-REPORT CHECK: If the uploaded file is NOT a laboratory report (e.g. a photo of a face, selfie, phone, landscape, non-medical document), return:
   {"isLabReport": false, "reason": "Not a laboratory report"}

2. EXACT NUMERICAL EXTRACTION: Do NOT modify any numerical result or number. Preserve exact values, decimals, and units as written on the report.
3. REFERENCE RANGE PRESERVATION: Extract the exact reference range written on the report. Do NOT invent or substitute third-party ranges.
4. CATEGORIZATION: Identify test categories (e.g., Blood Glucose & HbA1c, Complete Blood Count, Lipid Profile, Liver Function, Kidney Function).
5. MISSING VALUES: If a unit or reference range is missing, return "Not provided".
6. NO DIAGNOSES: Do NOT diagnose diseases.

Return JSON format ONLY:
{
  "isLabReport": true,
  "laboratoryName": string,
  "reportDate": string,
  "patientName": string,
  "testResults": [
    {
      "testName": string,
      "result": string,
      "unit": string,
      "referenceRange": string,
      "status": "Within range" | "Above range" | "Below range" | "Critical",
      "category": string
    }
  ]
}`;

  const validMime = mimeType === 'application/pdf' ? 'application/pdf' : (mimeType.includes('png') ? 'image/png' : 'image/jpeg');

  console.log(`[DEBUG Vision Request] Sending payload to gemini-1.5-flash | MIME: ${validMime} | Length: ${base64Data.length} chars`);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: validMime, data: base64Data } }
        ]
      }]
    })
  });

  if (!response.ok) {
    console.error(`[DEBUG Lab Vision Error] HTTP ${response.status} ${response.statusText}`);
    return null;
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  return JSON.parse(jsonMatch[0]);
}
