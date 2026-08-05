const API_BASE_URL = 'http://localhost:8000/api';

async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API Fallback] Endpoint ${endpoint} unreachable via PHP server, utilizing client state:`, err.message);
    return null;
  }
}

export const apiService = {
  getAuth: () => fetchAPI('auth.php'),
  login: (credentials) => fetchAPI('auth.php?action=login', { method: 'POST', body: JSON.stringify(credentials) }),
  
  getGlucoseData: () => fetchAPI('glucose.php'),
  logGlucose: (data) => fetchAPI('glucose.php', { method: 'POST', body: JSON.stringify(data) }),
  
  getAIPrediction: (params) => fetchAPI('ai_predict.php', { method: 'POST', body: JSON.stringify(params) }),
  
  analyzeFood: (foodType) => fetchAPI('food_analysis.php', { method: 'POST', body: JSON.stringify({ foodType }) }),
  getMealPlan: () => fetchAPI('food_analysis.php'),
  
  getLabOCR: () => fetchAPI('lab_ocr.php'),
  uploadLabReport: (formData) => fetchAPI('lab_ocr.php', { method: 'POST', body: JSON.stringify(formData) }),
  
  getComplicationsAndRisks: () => fetchAPI('complications.php'),
  
  getDoctorPatients: () => fetchAPI('doctor.php'),
  addPrescription: (data) => fetchAPI('doctor.php', { method: 'POST', body: JSON.stringify({ action: 'addPrescription', ...data }) }),
  
  getCaregiverData: () => fetchAPI('caregiver.php'),
  
  triggerEmergencySOS: (location) => fetchAPI('emergency.php', { method: 'POST', body: JSON.stringify({ location }) }),
  getMedicalID: () => fetchAPI('emergency.php'),
  
  getAdminStats: () => fetchAPI('admin.php')
};
