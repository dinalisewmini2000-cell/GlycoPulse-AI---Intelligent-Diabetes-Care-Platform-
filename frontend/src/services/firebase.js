// GlycoPulse AI - Firebase Cloud Engine
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc
} from 'firebase/firestore';

// Firebase Cloud Console Configuration
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey_GlycoPulse2026_Expo",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "glycopulse-ai.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "glycopulse-ai",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "glycopulse-ai.appspot.com",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "987654321012",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:987654321012:web:abcdef123456"
};

// Initialize Firebase App & Services
let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('[Firebase Initialized] Connected to Firebase Cloud Firestore & Auth');
} catch (err) {
  console.warn('[Firebase Init Warning] Offline or Demo Mode:', err.message);
}

export { 
  app, 
  auth, 
  db, 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  setDoc, 
  doc 
};

// --- Firebase Authentication Helpers ---
export async function loginWithFirebase(email, password) {
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { status: 'success', user: userCredential.user };
  } catch (error) {
    console.warn('[Firebase Auth Fallback]:', error.message);
    return { status: 'fallback', message: error.message };
  }
}

export async function signupWithFirebase(email, password, displayName, role = 'patient') {
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Save User document to Firestore `users` collection
    if (db) {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        role,
        createdAt: serverTimestamp()
      });
    }

    return { status: 'success', user: userCredential.user };
  } catch (error) {
    console.warn('[Firebase Signup Fallback]:', error.message);
    return { status: 'fallback', message: error.message };
  }
}

export async function logoutWithFirebase() {
  try {
    if (auth) await signOut(auth);
    return { status: 'success' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

// --- Firestore Glucose Telemetry Collection Helpers ---
export async function logGlucoseToFirebase(glucoseData) {
  try {
    if (!db) throw new Error('Firestore DB not ready');
    const docRef = await addDoc(collection(db, 'glucose_logs'), {
      ...glucoseData,
      createdAt: serverTimestamp()
    });
    return { status: 'success', id: docRef.id };
  } catch (err) {
    console.warn('[Firestore Log Fallback]:', err.message);
    return { status: 'fallback', message: err.message };
  }
}

export async function getGlucoseLogsFromFirebase(userId = 'pat-976') {
  try {
    if (!db) return [];
    const q = query(collection(db, 'glucose_logs'), orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[Firestore Fetch Fallback]:', err.message);
    return [];
  }
}

export function listenToGlucoseRealtime(callback) {
  try {
    if (!db) return () => {};
    const q = query(collection(db, 'glucose_logs'), orderBy('createdAt', 'desc'), limit(15));
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(logs);
    });
  } catch (err) {
    console.warn('[Firestore Realtime Listener Fallback]:', err.message);
    return () => {};
  }
}

// --- Firestore Prescriptions & Caregiver Helpers ---
export async function logPrescriptionToFirebase(rxData) {
  try {
    if (!db) throw new Error('Firestore DB not ready');
    const docRef = await addDoc(collection(db, 'prescriptions'), {
      ...rxData,
      createdAt: serverTimestamp()
    });
    return { status: 'success', id: docRef.id };
  } catch (err) {
    return { status: 'fallback', message: err.message };
  }
}

export async function logCaregiverActionToFirebase(actionData) {
  try {
    if (!db) throw new Error('Firestore DB not ready');
    const docRef = await addDoc(collection(db, 'caregiver_actions'), {
      ...actionData,
      createdAt: serverTimestamp()
    });
    return { status: 'success', id: docRef.id };
  } catch (err) {
    return { status: 'fallback', message: err.message };
  }
}
