/**
 * GlycoPulse AI - Stress & Mental Health AI Guidance Service
 * 
 * Calls Gemini AI (gemini-2.0-flash / gemini-1.5-flash) to generate personalized
 * 3-minute relaxation breathing exercises and clinical stress-glycemia guidance
 * whenever a high stress rating (> 6) or anxious mood is recorded.
 */

export async function generateAIStressGuidance(mood = 'Stressed', stressLevel = 7, note = '') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY;

  if (apiKey) {
    const prompt = `You are a clinical psychologist and diabetes wellness specialist. A diabetes patient just logged:
Mood: "${mood}"
Stress Level: ${stressLevel}/10
Patient Note: "${note || 'Feeling overwhelmed with daily glycemic management'}"

Generate a soothing 3-minute guided relaxation and breathing exercise to lower acute cortisol levels and help stabilize blood glucose.

Return ONLY a valid JSON object matching this schema without markdown code blocks:
{
  "title": "3-Minute Box Breathing & De-Stress Guidance",
  "clinicalInsight": "Short 2-sentence medical explanation of how cortisol elevates blood glucose and how deep diaphragmatic breathing suppresses sympathetic nervous arousal.",
  "positiveAffirmation": "A calm, reassuring 1-sentence positive affirmation for the patient.",
  "breathingPattern": {
    "inhaleSec": 4,
    "holdSec": 4,
    "exhaleSec": 4,
    "restSec": 4
  },
  "relaxationSteps": [
    "Step 1: Sit comfortably with feet flat on the floor and shoulders relaxed.",
    "Step 2: Follow the visual breath indicator: Inhale deeply through your nose for 4 seconds.",
    "Step 3: Gently hold your breath for 4 seconds.",
    "Step 4: Slowly release breath through your mouth for 4 seconds, releasing muscle tension."
  ]
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
              if (parsed && parsed.title && parsed.relaxationSteps) {
                console.log(`[Gemini Mental Health AI Success via ${model}]`);
                return parsed;
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[Gemini Mental Health AI ${model} Error]:`, err);
      }
    }
  }

  // Clinical Fallback Guidance Generator
  return getFallbackStressGuidance(mood, stressLevel);
}

function getFallbackStressGuidance(mood, stressLevel) {
  const isAnxiousOrStressed = mood === 'Anxious' || mood === 'Stressed' || stressLevel >= 7;

  return {
    title: isAnxiousOrStressed ? '3-Minute Acute De-Stress & Diaphragmatic Reset' : 'Mindful Breathing & Wellness Focus',
    clinicalInsight: 'Stress triggers the adrenal release of cortisol and epinephrine, causing liver glycogen breakdown and sudden blood glucose spikes. 3 minutes of 4-7-8 diaphragmatic breathing activates the vagus nerve to lower heart rate and reduce stress hormones.',
    positiveAffirmation: isAnxiousOrStressed 
      ? 'You are in control of your health. Take a deep breath — this moment of stress will pass.' 
      : 'Prioritizing your peace of mind is an essential part of managing healthy blood glucose levels.',
    breathingPattern: {
      inhaleSec: 4,
      holdSec: 4,
      exhaleSec: 4,
      restSec: 4
    },
    relaxationSteps: [
      'Find a quiet, comfortable position. Unclench your jaw and drop your shoulders away from your ears.',
      'Place one hand on your chest and the other on your abdomen to feel your breath expand.',
      'Inhale slowly through your nose for 4 seconds, expanding your belly naturally.',
      'Hold gently for 4 seconds, allowing your nervous system to settle.',
      'Exhale completely through your mouth for 4 seconds, releasing all physical tension.'
    ]
  };
}
