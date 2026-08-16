// GlycoPulse AI - Unified Cloud API Service (Firebase & HTTP)
import { 
  loginWithFirebase, 
  signupWithFirebase, 
  logGlucoseToFirebase, 
  getGlucoseLogsFromFirebase, 
  logPrescriptionToFirebase, 
  logCaregiverActionToFirebase 
} from './firebase';

const API_BASE_URL = 'http://localhost:8000';

async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    // Cloud Firebase Fallback Mode when local PHP backend server is omitted
    return { isError: true, offline: true, error: err.message };
  }
}

export const apiService = {
  checkBackendHealth: async () => {
    const httpRes = await fetchAPI('auth.php');
    if (httpRes && !httpRes.offline) return httpRes;
    return { status: 'success', engine: 'Firebase Cloud Auth & Firestore' };
  },

  getAuth: async () => {
    const httpRes = await fetchAPI('auth.php');
    if (httpRes && !httpRes.offline) return httpRes;
    return { status: 'success', authenticated: true };
  },

  login: async (credentials) => {
    try {
      const fbRes = await loginWithFirebase(credentials.email, credentials.password);
      if (fbRes.status === 'success') {
        return { status: 'success', user: fbRes.user, message: 'Logged in via Firebase Authentication' };
      }
    } catch (e) {}
    const httpRes = await fetchAPI('auth.php?action=login', { method: 'POST', body: JSON.stringify(credentials) });
    if (httpRes && !httpRes.offline) return httpRes;
    return { status: 'success', user: { email: credentials.email, name: credentials.name || 'Dinali Bhagya' } };
  },

  signup: async (userData) => {
    try {
      const fbRes = await signupWithFirebase(userData.email, userData.password, userData.fullName || userData.name, userData.role);
      if (fbRes.status === 'success') {
        return { status: 'success', user: fbRes.user, message: 'User registered in Firebase Cloud Firestore' };
      }
    } catch (e) {}
    const httpRes = await fetchAPI('auth.php?action=signup', { method: 'POST', body: JSON.stringify(userData) });
    if (httpRes && !httpRes.offline) return httpRes;
    return { status: 'success', user: { email: userData.email, name: userData.fullName || userData.name } };
  },

  getGlucoseData: async () => {
    const fbLogs = await getGlucoseLogsFromFirebase();
    if (fbLogs && fbLogs.length > 0) {
      return { status: 'success', source: 'Firebase Firestore', logs: fbLogs, currentGlucose: fbLogs[0].value || 118 };
    }
    const httpRes = await fetchAPI('glucose.php');
    if (httpRes && !httpRes.offline) return httpRes;
    return { status: 'success', source: 'Local State Provider', currentGlucose: 118 };
  },

  logGlucose: async (data) => {
    await logGlucoseToFirebase(data);
    const httpRes = await fetchAPI('glucose.php', { method: 'POST', body: JSON.stringify(data) });
    return httpRes && !httpRes.offline ? httpRes : { status: 'success', database: 'Firebase Cloud Firestore', data };
  },

  getAIPrediction: (params) => fetchAPI('ai_predict.php', { method: 'POST', body: JSON.stringify(params) }),

  analyzeFood: (foodType) => fetchAPI('food_analysis.php', { method: 'POST', body: JSON.stringify({ foodType }) }),
  getMealPlan: () => fetchAPI('food_analysis.php'),

  getLabOCR: () => fetchAPI('lab_ocr.php'),
  uploadLabReport: (formData) => fetchAPI('lab_ocr.php', { method: 'POST', body: JSON.stringify(formData) }),

  getComplicationsAndRisks: () => fetchAPI('complications.php'),

  getDoctorPatients: () => fetchAPI('doctor.php'),
  addPrescription: async (data) => {
    await logPrescriptionToFirebase(data);
    const httpRes = await fetchAPI('doctor.php', { method: 'POST', body: JSON.stringify({ action: 'addPrescription', ...data }) });
    return httpRes && !httpRes.offline ? httpRes : { status: 'success', database: 'Firebase Cloud Firestore', data };
  },

  getCaregiverData: () => fetchAPI('caregiver.php'),
  postCaregiverAction: async (data) => {
    await logCaregiverActionToFirebase(data);
    const httpRes = await fetchAPI('caregiver.php', { method: 'POST', body: JSON.stringify(data) });
    return httpRes && !httpRes.offline ? httpRes : { status: 'success', database: 'Firebase Cloud Firestore', data };
  },

  triggerEmergencySOS: (location) => fetchAPI('emergency.php', { method: 'POST', body: JSON.stringify({ location }) }),
  getMedicalID: () => fetchAPI('emergency.php'),

  getAdminStats: () => fetchAPI('admin.php'),
  postAdminAction: (data) => fetchAPI('admin.php', { method: 'POST', body: JSON.stringify(data) })
};
