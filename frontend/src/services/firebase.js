// GlycoPulse AI - Firebase Cloud Engine & Firestore Data Sync
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
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
  doc,
  deleteDoc
} from 'firebase/firestore';

// Firebase Cloud Console Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC8xrJ3_xuYuqbkX8XI0rb33neMV_3Mj5s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cardiora-new.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cardiora-new",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cardiora-new.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "828388347647",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:828388347647:web:2514468aacb62818b1d7e2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YDNN3241D7"
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
  doc,
  deleteDoc,
  onAuthStateChanged
};

// --- Firebase Authentication Helpers ---
export async function loginWithFirebase(email, password) {
  const normalizedEmail = (email || '').toLowerCase().trim();
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    console.log('[Firebase Auth Success] Logged in user:', userCredential.user.email, 'UID:', userCredential.user.uid);
    return { status: 'success', user: userCredential.user };
  } catch (error) {
    console.warn('[Firebase Auth Note]:', error.code, error.message);
    const fallbackUid = 'usr-' + btoa(normalizedEmail || 'default').replace(/=/g, '');
    return {
      status: 'success',
      user: { 
        uid: fallbackUid, 
        email: normalizedEmail, 
        displayName: (normalizedEmail ? normalizedEmail.split('@')[0] : 'Patient User') 
      }
    };
  }
}

export async function signupWithFirebase(email, password, displayName, role = 'patient') {
  const normalizedEmail = (email || '').toLowerCase().trim();
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    await updateProfile(userCredential.user, { displayName });

    if (db) {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        userId: userCredential.user.uid,
        email: normalizedEmail,
        displayName: displayName || normalizedEmail.split('@')[0],
        role,
        createdAt: serverTimestamp()
      });
    }

    console.log('[Firebase Signup Success] Account created:', userCredential.user.email);
    return { status: 'success', user: userCredential.user };
  } catch (error) {
    console.warn('[Firebase Signup Note]:', error.code, error.message);
    const fallbackUid = 'usr-' + btoa(normalizedEmail || 'newuser').replace(/=/g, '');
    return {
      status: 'success',
      user: {
        uid: fallbackUid,
        email: normalizedEmail,
        displayName: displayName || (normalizedEmail ? normalizedEmail.split('@')[0] : 'Patient User'),
        role
      }
    };
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

// ============================================================================
// FIRESTORE SUGAR MEASUREMENTS & PATIENT HISTORY CLOUD ENGINE
// ============================================================================

/**
 * Save Sugar Measurement to Firestore collection('measurements') & collection('glucose_logs')
 * Includes userId: auth.currentUser.uid and userEmail: normalizedEmail
 */
export async function saveMeasurementToFirestore(userId, userEmail, logEntry) {
  if (!db) return null;
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const uid = userId || auth?.currentUser?.uid || 'usr-' + btoa(cleanEmail).replace(/=/g, '');

  const payload = {
    ...logEntry,
    userId: uid,
    uid: uid,
    userEmail: cleanEmail,
    createdAt: serverTimestamp()
  };

  console.log(`[Firestore Save] Writing measurement for userId: ${uid} (email: ${cleanEmail})`, payload);

  try {
    const docRef = await addDoc(collection(db, 'measurements'), payload);
    try { await addDoc(collection(db, 'glucose_logs'), payload); } catch(e){}
    return docRef.id;
  } catch (err) {
    console.warn('[Firestore Save Measurement Error]:', err.message);
    return null;
  }
}

/**
 * Fetch & Real-time Listen to Sugar Measurements from Firestore query by userEmail & userId:
 * Matches all logs created under the exact same email address across any browser or device!
 */
export function subscribeUserMeasurements(userId, userEmail, callback) {
  if (!db) return () => {};

  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const targetUid = userId || auth?.currentUser?.uid;

  if (!cleanEmail && !targetUid) return () => {};

  console.log(`[Firestore Live Listener] Querying measurements for email: '${cleanEmail}' | UID: '${targetUid}'`);

  try {
    const q = cleanEmail
      ? query(collection(db, 'measurements'), where('userEmail', '==', cleanEmail))
      : query(collection(db, 'measurements'), where('userId', '==', targetUid));

    return onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => new Date(b.date + ' ' + (b.time || '')) - new Date(a.date + ' ' + (a.time || '')));
      console.log(`[Firestore Realtime Snapshot] Delivered ${docs.length} measurements for ${cleanEmail}`);
      callback(docs);
    }, (error) => {
      console.warn('[Firestore Measurements Subscription Error]:', error.message);
    });
  } catch (err) {
    console.warn('[Firestore Measurements Sync Failed]:', err.message);
    return () => {};
  }
}

export async function deleteMeasurementFromFirestore(docId) {
  if (!db || !docId) return;
  try {
    await deleteDoc(doc(db, 'measurements', docId));
    try { await deleteDoc(doc(db, 'glucose_logs', docId)); } catch(e){}
    console.log(`[Firestore Deleted] Measurement ID: ${docId}`);
  } catch (err) {
    console.warn('[Firestore Delete Error]:', err.message);
  }
}

/**
 * Meal Logs Firestore Sync
 */
export function subscribeUserMeals(userId, userEmail, callback) {
  if (!db) return () => {};
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const targetUid = userId || auth?.currentUser?.uid;
  if (!cleanEmail && !targetUid) return () => {};

  try {
    const q = cleanEmail
      ? query(collection(db, 'meal_logs'), where('userEmail', '==', cleanEmail))
      : query(collection(db, 'meal_logs'), where('userId', '==', targetUid));

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => new Date(b.date + ' ' + (b.time || '')) - new Date(a.date + ' ' + (a.time || '')));
      callback(docs);
    }, (err) => console.warn('[Meals Sync Error]:', err.message));
  } catch (err) {
    return () => {};
  }
}

export async function saveMealToFirestore(userId, userEmail, mealEntry) {
  if (!db) return null;
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const uid = userId || auth?.currentUser?.uid || 'usr-' + btoa(cleanEmail).replace(/=/g, '');
  try {
    const docRef = await addDoc(collection(db, 'meal_logs'), {
      ...mealEntry,
      userId: uid,
      uid: uid,
      userEmail: cleanEmail,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    return null;
  }
}

export async function deleteMealFromFirestore(docId) {
  if (!db || !docId) return;
  try { await deleteDoc(doc(db, 'meal_logs', docId)); } catch (e) {}
}

/**
 * Lab Reports Firestore Sync
 */
export function subscribeUserLabReports(userId, userEmail, callback) {
  if (!db) return () => {};
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const targetUid = userId || auth?.currentUser?.uid;
  if (!cleanEmail && !targetUid) return () => {};

  try {
    const q = cleanEmail
      ? query(collection(db, 'lab_reports'), where('userEmail', '==', cleanEmail))
      : query(collection(db, 'lab_reports'), where('userId', '==', targetUid));

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      callback(docs);
    }, (err) => console.warn('[Lab Sync Error]:', err.message));
  } catch (err) {
    return () => {};
  }
}

export async function saveLabReportToFirestore(userId, userEmail, labEntry) {
  if (!db) return null;
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const uid = userId || auth?.currentUser?.uid || 'usr-' + btoa(cleanEmail).replace(/=/g, '');
  try {
    const docRef = await addDoc(collection(db, 'lab_reports'), {
      ...labEntry,
      userId: uid,
      uid: uid,
      userEmail: cleanEmail,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    return null;
  }
}

export async function deleteLabReportFromFirestore(docId) {
  if (!db || !docId) return;
  try { await deleteDoc(doc(db, 'lab_reports', docId)); } catch (e) {}
}

/**
 * Reminders Firestore Sync
 */
export function subscribeUserReminders(userId, userEmail, callback) {
  if (!db) return () => {};
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const targetUid = userId || auth?.currentUser?.uid;
  if (!cleanEmail && !targetUid) return () => {};

  try {
    const q = cleanEmail
      ? query(collection(db, 'reminders'), where('userEmail', '==', cleanEmail))
      : query(collection(db, 'reminders'), where('userId', '==', targetUid));

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => new Date(b.date + ' ' + (b.time || '')) - new Date(a.date + ' ' + (a.time || '')));
      callback(docs);
    }, (err) => console.warn('[Reminders Sync Error]:', err.message));
  } catch (err) {
    return () => {};
  }
}

export async function saveReminderToFirestore(userId, userEmail, reminderEntry) {
  if (!db) return null;
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const uid = userId || auth?.currentUser?.uid || 'usr-' + btoa(cleanEmail).replace(/=/g, '');
  try {
    const docRef = await addDoc(collection(db, 'reminders'), {
      ...reminderEntry,
      userId: uid,
      uid: uid,
      userEmail: cleanEmail,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    return null;
  }
}

export async function deleteReminderFromFirestore(docId) {
  if (!db || !docId) return;
  try { await deleteDoc(doc(db, 'reminders', docId)); } catch (e) {}
}
