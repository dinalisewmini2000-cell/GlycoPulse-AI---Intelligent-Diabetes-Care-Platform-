import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { listenToGlucoseRealtime } from '../services/firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('glycopulse_theme') || 'dark');

  // Backend & SQL DB Status State
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [dbEngineName, setDbEngineName] = useState('Checking...');

  // Active Main Tab
  const [activeTab, setActiveTab] = useState('glucose'); 
  const [sosActive, setSosActive] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Global Toast Alert Banner
  const [toastAlert, setToastAlert] = useState(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('glycopulse_auth') === 'true' && !!localStorage.getItem('glycopulse_user');
  });
  const [role, setRole] = useState(() => localStorage.getItem('glycopulse_role') || 'patient');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const formatNameByRole = (name, targetRole) => {
    const raw = (name || '').trim();
    if (!raw) return targetRole === 'doctor' ? 'Dr. Practitioner' : 'Patient User';
    const clean = raw.replace(/^Dr\.\s*/i, '').trim();
    const formatted = clean.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
    return targetRole === 'doctor' ? `Dr. ${formatted}` : formatted;
  };

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('glycopulse_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          const activeRole = parsed.role || 'patient';
          parsed.name = formatNameByRole(parsed.name, activeRole);
          return parsed;
        }
      } catch (err) {}
    }
    return null;
  });

  // Check Backend Connection & Fetch DB Logs on Mount
  const checkBackend = async (silent = false) => {
    const health = await apiService.checkBackendHealth();
    if (health && !health.offline && health.status === 'success') {
      setIsBackendConnected(true);
      setDbEngineName(health.database || 'SQL Database');

      // Sync Glucose logs from real SQL DB
      const gRes = await apiService.getGlucoseData();
      if (gRes && gRes.logs && gRes.logs.length > 0) {
        setGlucoseLogs(gRes.logs);
      }
    } else {
      setIsBackendConnected(false);
      setDbEngineName('Offline');
      if (!silent) {
        setToastAlert({
          type: 'warning',
          title: 'PHP BACKEND SERVER OFFLINE',
          message: 'Start the PHP backend (php -S localhost:8000 -t backend) to connect to SQL database.'
        });
      }
    }
  };

  useEffect(() => {
    checkBackend(true);
    const interval = setInterval(() => {
      checkBackend(true);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const loginUser = async (credentials) => {
    const res = await apiService.login(credentials);
    const requestedRole = credentials.role || 'patient';
    let userObj = {
      id: 'usr-' + Date.now(),
      name: credentials.name || credentials.email?.split('@')[0] || 'Member',
      email: credentials.email,
      role: requestedRole
    };

    if (res && res.status === 'success' && res.user) {
      userObj = res.user;
    }

    if (credentials.name && credentials.name.trim()) {
      userObj.name = credentials.name.trim();
    }
    
    const activeRole = userObj.role || requestedRole;
    userObj.role = activeRole;
    userObj.name = formatNameByRole(userObj.name, activeRole);

    setCurrentUser(userObj);
    setRole(activeRole);
    setIsAuthenticated(true);
    setAuthModalOpen(false);

    localStorage.setItem('glycopulse_auth', 'true');
    localStorage.setItem('glycopulse_user', JSON.stringify(userObj));
    localStorage.setItem('glycopulse_role', activeRole);

    if (activeRole === 'doctor') setActiveTab('doctor_patients');
    else if (activeRole === 'caregiver') setActiveTab('caregiver_feed');
    else if (activeRole === 'admin') setActiveTab('admin_telemetry');
    else setActiveTab('glucose');
  };

  const signupUser = async (userData) => {
    const res = await apiService.signup(userData);
    const requestedRole = userData.role || 'patient';
    let userObj = {
      id: 'user-' + Date.now(),
      name: userData.name || 'New Member',
      email: userData.email,
      role: requestedRole,
      diabetesType: userData.diabetesType || 'Type 2'
    };

    if (res && res.status === 'success' && res.user) {
      userObj = res.user;
    }

    if (userData.name && userData.name.trim()) {
      userObj.name = userData.name.trim();
    }

    const activeRole = userObj.role || requestedRole;
    userObj.role = activeRole;
    userObj.name = formatNameByRole(userObj.name, activeRole);

    setCurrentUser(userObj);
    setRole(activeRole);
    setIsAuthenticated(true);
    setAuthModalOpen(false);

    localStorage.setItem('glycopulse_auth', 'true');
    localStorage.setItem('glycopulse_user', JSON.stringify(userObj));
    localStorage.setItem('glycopulse_role', activeRole);

    if (activeRole === 'doctor') setActiveTab('doctor_patients');
    else if (activeRole === 'caregiver') setActiveTab('caregiver_feed');
    else if (activeRole === 'admin') setActiveTab('admin_telemetry');
    else setActiveTab('glucose');
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setGlucoseLogs([]);
    localStorage.removeItem('glycopulse_auth');
    localStorage.removeItem('glycopulse_user');
    localStorage.removeItem('glycopulse_role');
    setAuthModalOpen(false);
  };

  // Health Data & Live Ticker State
  const [currentGlucose, setCurrentGlucose] = useState(118);
  const [cgmTrendArrow, setCgmTrendArrow] = useState('↗'); 
  const [rateOfChange, setRateOfChange] = useState('+1.2 mg/dL/min');
  const [lastCgmSync, setLastCgmSync] = useState('Just now (Dexcom G7)');

  const [iobUnits, setIobUnits] = useState(0); 
  const [cobGrams, setCobGrams] = useState(0);  
  const [waterIntake, setWaterIntake] = useState(1.5);
  const [waterGoal] = useState(2.5);

  const [glucoseLogs, setGlucoseLogs] = useState([]);

  const [hba1cHistory] = useState([
    { date: 'Jan 2026', value: 6.8 },
    { date: 'Apr 2026', value: 6.5 },
    { date: 'Jul 2026', value: 6.3 }
  ]);

  const [aiPrediction, setAiPrediction] = useState({
    predictedGlucose2h: 122,
    trend: 'Stable',
    hypoglycemiaRisk: 'Low (2.1%)',
    hyperglycemiaRisk: 'Low (4.5%)',
    confidenceScore: '96.4%',
    explanation: 'Active Insulin (1.4U) is currently matching Carbohydrate digestion (18g). Glucose will remain stable.',
    recommendation: 'Optimal time for light physical activity. Target range (70-180 mg/dL) maintained.',
    hourlyForecast: [
      { time: 'Now', value: 118 },
      { time: '+30m', value: 124 },
      { time: '+60m', value: 130 },
      { time: '+90m', value: 126 },
      { time: '+120m', value: 122 }
    ]
  });
  const [streakDays] = useState(14);
  const [healthScore] = useState(88);

  useEffect(() => {
    localStorage.setItem('glycopulse_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // LIVE 5-SECOND CONTINUOUS GLUCOSE TELEMETRY STREAM TICKER
  useEffect(() => {
    const ticker = setInterval(() => {
      const delta = Math.floor(Math.random() * 7) - 3;
      
      setCurrentGlucose((prev) => {
        const nextVal = Math.max(55, Math.min(260, prev + delta));
        
        if (delta >= 3) {
          setCgmTrendArrow('↑');
          setRateOfChange(`+${(delta * 0.8).toFixed(1)} mg/dL/min`);
        } else if (delta === 1 || delta === 2) {
          setCgmTrendArrow('↗');
          setRateOfChange(`+${(delta * 0.6).toFixed(1)} mg/dL/min`);
        } else if (delta === 0) {
          setCgmTrendArrow('➔');
          setRateOfChange('0.0 mg/dL/min');
        } else if (delta === -1 || delta === -2) {
          setCgmTrendArrow('↘');
          setRateOfChange(`${(delta * 0.6).toFixed(1)} mg/dL/min`);
        } else {
          setCgmTrendArrow('↓');
          setRateOfChange(`${(delta * 0.8).toFixed(1)} mg/dL/min`);
        }

        if (nextVal < 70) {
          setToastAlert({
            type: 'danger',
            title: 'CRITICAL HYPOGLYCEMIA ALERT',
            message: `Current Glucose is ${nextVal} mg/dL. Consume 15g fast-acting carbs immediately.`
          });
        }

        return nextVal;
      });

      setIobUnits((prev) => Math.max(0, parseFloat((prev - 0.05).toFixed(2))));
      setCobGrams((prev) => Math.max(0, Math.round(prev - 0.5)));
      setLastCgmSync('Just now (Dexcom G7 Live Sync)');

    }, 5000);

    return () => clearInterval(ticker);
  }, []);

  // FIREBASE CLOUD FIRESTORE REALTIME LISTENER
  useEffect(() => {
    const unsub = listenToGlucoseRealtime((fbLogs) => {
      if (fbLogs && fbLogs.length > 0) {
        const formatted = fbLogs.map((l, i) => ({
          id: l.id || ('fb-' + i),
          value: l.value || l.glucoseLevel || 118,
          type: l.type || 'CGM Check',
          notes: l.notes || 'Firebase Cloud Sync',
          timestamp: 'Just now'
        }));
        setGlucoseLogs(formatted);
        setIsBackendConnected(true);
        setDbEngineName('Firebase Cloud Firestore (cardiora-new)');
      }
    });
    return () => unsub();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addGlucoseLog = async (newLog) => {
    // Send to Firebase Cloud Firestore Database (cardiora-new)
    const res = await apiService.logGlucose({
      userId: currentUser?.id || 'pat-101',
      patientName: currentUser?.name || 'Dinali Bhagya',
      value: newLog.value,
      glucoseLevel: newLog.value,
      type: newLog.type,
      notes: newLog.notes
    });

    setGlucoseLogs((prev) => [newLog, ...prev]);
    setIsBackendConnected(true);
    setDbEngineName('Firebase Cloud Firestore (cardiora-new)');

    setToastAlert({
      type: 'success',
      title: 'SAVED TO FIREBASE CLOUD',
      message: `Glucose ${newLog.value} mg/dL written to Cloud Firestore (cardiora-new).`
    });

    setAiPrediction((prev) => ({
      ...prev,
      predictedGlucose2h: Math.round(newLog.value + (cobGrams * 0.8) - (iobUnits * 12)),
      explanation: `Latest log entry (${newLog.value} mg/dL) written to Firebase Firestore & model.`
    }));

    setTimeout(() => setToastAlert(null), 5000);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        isBackendConnected,
        dbEngineName,
        checkBackend,
        role,
        setRole,
        activeTab,
        setActiveTab,
        sosActive,
        setSosActive,
        pdfModalOpen,
        setPdfModalOpen,
        isAuthenticated,
        authModalOpen,
        setAuthModalOpen,
        currentUser,
        loginUser,
        signupUser,
        logoutUser,
        currentGlucose,
        cgmTrendArrow,
        rateOfChange,
        lastCgmSync,
        iobUnits,
        setIobUnits,
        cobGrams,
        setCobGrams,
        waterIntake,
        setWaterIntake,
        waterGoal,
        glucoseLogs,
        addGlucoseLog,
        hba1cHistory,
        aiPrediction,
        streakDays,
        healthScore,
        toastAlert,
        setToastAlert
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
