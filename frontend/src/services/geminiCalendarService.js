/**
 * GlycoPulse AI - Gemini Calendar & Doctor Visit Analytics Service
 * 
 * Manages calendar measurement marking, doctor consultation results logging,
 * and calls Gemini AI to provide personalized clinical calendar guidance.
 */

export async function analyzeDoctorResultsWithGemini(visitData) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY;

  const defaultAnalysis = generateFallbackAnalysis(visitData);

  if (!apiKey) {
    return defaultAnalysis;
  }

  try {
    const prompt = `You are a clinical diabetes AI assistant. Analyze these doctor visit results submitted by a patient:
Doctor Name: ${visitData.doctorName || 'Attending Physician'}
Visit Date: ${visitData.visitDate || new Date().toISOString().split('T')[0]}
Doctor Advice / Results: "${visitData.doctorNotes || 'Routine diabetes checkup completed.'}"
Prescribed Target Glucose Range: ${visitData.targetRange || '70-180 mg/dL'}
Next Recommended Visit Date: ${visitData.nextVisitDate || 'Not specified'}

Provide a JSON object with:
{
  "summary": "Clear 2-sentence summary of the doctor's feedback for the patient",
  "actionSteps": ["Action step 1", "Action step 2", "Action step 3"],
  "reminders": ["Calendar reminder 1", "Calendar reminder 2"],
  "glycemicGoalStatus": "Target Met | Needs Adjustment | Follow-up Required"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) return defaultAnalysis;

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return defaultAnalysis;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return defaultAnalysis;

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.warn('[Gemini Calendar Service] Fallback to clinical rules:', err.message);
    return defaultAnalysis;
  }
}

function generateFallbackAnalysis(visitData) {
  const notes = (visitData.doctorNotes || '').toLowerCase();
  
  let goalStatus = 'Target Met';
  let steps = [
    'Maintain daily blood glucose logs (Fasting & Post-meal)',
    'Follow prescribed medication schedules consistently',
    'Stay hydrated with 2.5L water daily & keep 30 mins active walking'
  ];

  if (notes.includes('increase') || notes.includes('high') || notes.includes('adjust')) {
    goalStatus = 'Needs Adjustment';
    steps = [
      'Adhere strictly to adjusted medication dosage prescribed by doctor',
      'Monitor post-prandial (after meal) glucose 2 hours after lunch and dinner',
      'Reduce high-glycemic carbohydrates and avoid sugary beverages'
    ];
  } else if (notes.includes('hba1c') || notes.includes('lab')) {
    steps.push('Schedule lab appointment 1 week prior to next consultation date');
  }

  return {
    summary: `Doctor visit recorded for ${visitData.doctorName || 'Attending Physician'} on ${visitData.visitDate}. Doctor advised: "${visitData.doctorNotes || 'Routine checkup completed.'}"`,
    actionSteps: steps,
    reminders: [
      `Next Follow-up Consultation: ${visitData.nextVisitDate || 'Schedule in 3 months'}`,
      `Daily Target Glucose Range: ${visitData.targetRange || '70-180 mg/dL'}`
    ],
    glycemicGoalStatus: goalStatus
  };
}
