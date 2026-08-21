import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth,
  onAuthStateChanged,
  subscribeUserMeasurements,
  saveMeasurementToFirestore,
  deleteMeasurementFromFirestore,
  subscribeUserMeals,
  saveMealToFirestore,
  deleteMealFromFirestore,
  subscribeUserLabReports,
  saveLabReportToFirestore,
  deleteLabReportFromFirestore,
  subscribeUserReminders,
  saveReminderToFirestore,
  deleteReminderFromFirestore
} from '../services/firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('glucocare_theme') || 'light');

  // Active Navigation Section: 'dashboard' | 'glucose' | 'meals' | 'calendar' | 'lab'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const openAuthModal = (mode = 'signin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };
  const [toastAlert, setToastAlert] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authFlag = localStorage.getItem('glucocare_auth');
    if (authFlag !== null) return authFlag === 'true';
    return false;
  });

  const [role, setRole] = useState('patient');

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('glucocare_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.uid || parsed.email)) return parsed;
      } catch (err) {}
    }
    return null;
  });

  const currentEmail = currentUser?.email || '';
  const currentUid = currentUser?.uid || currentUser?.id || auth?.currentUser?.uid || '';

  // 1. Glucose Readings State (Populated strictly from Firestore Cloud, ZERO localStorage)
  const [glucoseLogs, setGlucoseLogs] = useState([]);

  // 2. Meal Logs State (Populated strictly from Firestore Cloud)
  const [mealLogs, setMealLogs] = useState([]);

  // 3. Health Reminders State (Populated strictly from Firestore Cloud)
  const [reminders, setReminders] = useState([]);

  // 4. Lab Reports State (Populated strictly from Firestore Cloud)
  const [labReports, setLabReports] = useState([]);

  // --------------------------------------------------------------------------
  // FIREBASE AUTHENTICATION LISTENER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        console.log('[Firebase Auth Active User]:', fbUser.email, 'UID:', fbUser.uid);
        const email = fbUser.email.toLowerCase().trim();
        const userObj = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email: email,
          role: 'patient'
        };
        setCurrentUser(userObj);
        setIsAuthenticated(true);
        localStorage.setItem('glucocare_auth', 'true');
        localStorage.setItem('glucocare_user', JSON.stringify(userObj));
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // --------------------------------------------------------------------------
  // FIRESTORE REAL-TIME DATA SUBSCRIPTION (ZERO LOCAL STORAGE PATIENT DATA)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const targetUid = currentUser?.uid || currentUser?.id || auth?.currentUser?.uid;
    const targetEmail = currentUser?.email || auth?.currentUser?.email;

    if (!targetEmail && !targetUid) return;

    console.log(`[Firestore Real-time Fetch] Listening for userId: '${targetUid}' (email: '${targetEmail}')`);

    // 1. Subscribe Sugar Measurements (collection: measurements, where('userEmail', '==', targetEmail))
    const unsubGlucose = subscribeUserMeasurements(targetUid, targetEmail, (cloudDocs) => {
      setGlucoseLogs(cloudDocs);
    });

    // 2. Subscribe Meal Logs (collection: meal_logs)
    const unsubMeals = subscribeUserMeals(targetUid, targetEmail, (cloudDocs) => {
      setMealLogs(cloudDocs);
    });

    // 3. Subscribe Lab Reports (collection: lab_reports)
    const unsubLabs = subscribeUserLabReports(targetUid, targetEmail, (cloudDocs) => {
      setLabReports(cloudDocs);
    });

    // 4. Subscribe Reminders (collection: reminders)
    const unsubReminders = subscribeUserReminders(targetUid, targetEmail, (cloudDocs) => {
      setReminders(cloudDocs);
    });

    return () => {
      unsubGlucose();
      unsubMeals();
      unsubLabs();
      unsubReminders();
    };
  }, [currentUser?.uid, currentUser?.email]);

  // Multi-Tab Theme & User Storage Sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e.key) return;
      if (e.key === 'glucocare_user' || e.key === 'glucocare_auth') {
        const savedAuth = localStorage.getItem('glucocare_auth') === 'true';
        setIsAuthenticated(savedAuth);
        const savedUserStr = localStorage.getItem('glucocare_user');
        if (savedUserStr) {
          try { setCurrentUser(JSON.parse(savedUserStr)); } catch (err) {}
        } else {
          setCurrentUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Theme Sync
  useEffect(() => {
    localStorage.setItem('glucocare_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const loginUser = (credentials) => {
    if (!credentials || !credentials.email) return;

    const email = credentials.email.toLowerCase().trim();
    const derivedName = credentials.name || credentials.displayName || (email ? email.split('@')[0] : 'Patient User');
    const userUid = credentials.uid || auth?.currentUser?.uid || 'usr-' + btoa(email).replace(/=/g, '');
    
    const userObj = {
      id: userUid,
      uid: userUid,
      name: derivedName,
      email: email,
      role: credentials.role || 'patient'
    };

    setCurrentUser(userObj);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setActiveTab('dashboard');
    localStorage.setItem('glucocare_auth', 'true');
    localStorage.setItem('glucocare_user', JSON.stringify(userObj));
  };

  const signupUser = (userData) => {
    loginUser(userData);
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setGlucoseLogs([]);
    setMealLogs([]);
    setLabReports([]);
    setReminders([]);
    localStorage.setItem('glucocare_auth', 'false');
    localStorage.removeItem('glucocare_user');
  };

  // Add Sugar Measurement Result -> Writes directly to Firebase Firestore collection('measurements') with userId & userEmail
  const addGlucoseLog = async (newLog) => {
    const targetUid = currentUser?.uid || currentUser?.id || auth?.currentUser?.uid;
    const targetEmail = currentUser?.email || auth?.currentUser?.email;

    if (!targetEmail) {
      console.warn('[Add Glucose Error] Cannot save measurement without an authenticated user email.');
      return;
    }

    const entry = {
      date: newLog.date || new Date().toISOString().split('T')[0],
      time: newLog.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Number(newLog.value),
      context: newLog.context || newLog.type || 'Measurement context not provided',
      notes: newLog.notes || '',
      insulinUnits: newLog.insulinUnits || null,
      carbsGrams: newLog.carbsGrams || null
    };

    // Optimistic UI update while Firestore writes
    setGlucoseLogs((prev) => [{ ...entry, id: 'g-' + Date.now(), userId: targetUid, userEmail: targetEmail }, ...prev]);

    // Save directly to Firebase Firestore
    await saveMeasurementToFirestore(targetUid, targetEmail, entry);

    setToastAlert({
      type: 'success',
      title: 'Glucose Reading Recorded',
      message: `${entry.value} mg/dL saved to Firebase Firestore.`
    });
    setTimeout(() => setToastAlert(null), 3500);
  };

  const deleteGlucoseLog = async (id) => {
    setGlucoseLogs((prev) => prev.filter(item => item.id !== id));
    await deleteMeasurementFromFirestore(id);
  };

  // Add Meal Log -> Writes directly to Firebase Firestore collection('meal_logs')
  const addMealLog = async (newMeal) => {
    const targetUid = currentUser?.uid || currentUser?.id || auth?.currentUser?.uid;
    const targetEmail = currentUser?.email || auth?.currentUser?.email;

    if (!targetEmail) return;

    const entry = {
      date: newMeal.date || new Date().toISOString().split('T')[0],
      mealType: newMeal.mealType || 'Breakfast',
      time: newMeal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      food: newMeal.food,
      calories: newMeal.calories || '—',
      carbs: newMeal.carbs,
      protein: newMeal.protein,
      fat: newMeal.fat,
      notes: newMeal.notes || ''
    };

    setMealLogs((prev) => [{ ...entry, id: 'm-' + Date.now(), userId: targetUid, userEmail: targetEmail }, ...prev]);
    await saveMealToFirestore(targetUid, targetEmail, entry);

    setToastAlert({
      type: 'success',
      title: 'Meal Saved',
      message: `${entry.mealType} saved to Firebase Firestore.`
    });
    setTimeout(() => setToastAlert(null), 3500);
  };

  const deleteMealLog = async (id) => {
    setMealLogs((prev) => prev.filter(item => item.id !== id));
    await deleteMealFromFirestore(id);
  };

  // Add Reminder -> Writes directly to Firebase Firestore collection('reminders')
  const addReminder = async (newRem) => {
    const targetUid = currentUser?.uid || currentUser?.id || auth?.currentUser?.uid;
    const targetEmail = currentUser?.email || auth?.currentUser?.email;

    if (!targetEmail) return;

    const entry = {
      title: newRem.title,
      date: newRem.date || new Date().toISOString().split('T')[0],
      time: newRem.time || '8:00 AM',
      category: newRem.category || 'Glucose Check'
    };

    setReminders((prev) => [{ ...entry, id: 'r-' + Date.now(), userId: targetUid, userEmail: targetEmail }, ...prev]);
    await saveReminderToFirestore(targetUid, targetEmail, entry);
  };

  const deleteReminder = async (id) => {
    setReminders((prev) => prev.filter(item => item.id !== id));
    await deleteReminderFromFirestore(id);
  };

  // Add Lab Report -> Writes directly to Firebase Firestore collection('lab_reports')
  const addLabReport = async (newLab) => {
    const targetUid = currentUser?.uid || currentUser?.id || auth?.currentUser?.uid;
    const targetEmail = currentUser?.email || auth?.currentUser?.email;

    if (!targetEmail) return;

    const fullData = newLab.fullReport || newLab.extractedData || newLab.fullPayload || null;

    const entry = {
      name: newLab.name,
      date: newLab.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      result: newLab.result || 'Uploaded Document',
      status: newLab.status || 'Report Added',
      fullReport: fullData,
      extractedData: fullData,
      fullPayload: fullData
    };

    setLabReports((prev) => [{ ...entry, id: 'l-' + Date.now(), userId: targetUid, userEmail: targetEmail }, ...prev]);
    await saveLabReportToFirestore(targetUid, targetEmail, entry);
  };

  const deleteLabReport = async (id) => {
    setLabReports((prev) => prev.filter(item => item.id !== id));
    await deleteLabReportFromFirestore(id);
  };

  const value = {
    theme, toggleTheme,
    activeTab, setActiveTab,
    pdfModalOpen, setPdfModalOpen,
    authModalOpen, setAuthModalOpen,
    authMode, setAuthMode, openAuthModal,
    toastAlert, setToastAlert,
    isInitialLoading,
    isAuthenticated, setIsAuthenticated,
    role, setRole,
    currentUser, setCurrentUser,
    loginUser, signupUser, logoutUser,
    glucoseLogs, addGlucoseLog, deleteGlucoseLog,
    mealLogs, addMealLog, deleteMealLog,
    reminders, addReminder, deleteReminder,
    labReports, addLabReport, deleteLabReport
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
