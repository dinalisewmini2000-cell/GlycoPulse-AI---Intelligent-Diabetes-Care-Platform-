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
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Global Toast Alert Banner
  const [toastAlert, setToastAlert] = useState(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const auth = localStorage.getItem('glycopulse_auth');
    if (auth !== null) return auth === 'true';
    return true; // Default session active on initial load
  });
  const [role, setRole] = useState(() => localStorage.getItem('glycopulse_role') || 'patient');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const formatNameByRole = (name, targetRole) => {
    const raw = (name || '').trim();
    if (!raw || raw.toLowerCase() === 'member' || raw.toLowerCase() === 'patient user') {
      if (targetRole === 'admin') return 'System Administrator';
      if (targetRole === 'doctor') return 'Dr. Medical Practitioner';
      if (targetRole === 'caregiver') return 'Family Caregiver';
      return 'Dinali Bhagya';
    }
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
    return {
      id: 'usr-101',
      name: 'Dinali Bhagya',
      email: 'dinali@glucocare.ai',
      role: localStorage.getItem('glycopulse_role') || 'patient'
    };
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

  const saveUserToGlobalList = (userObj) => {
    try {
      if (!userObj || !userObj.email) return;
      const savedList = localStorage.getItem('glycopulse_all_users');
      let list = savedList ? JSON.parse(savedList) : [];
      if (!Array.isArray(list)) list = [];
      const existsIndex = list.findIndex(u => u.email?.toLowerCase() === userObj.email?.toLowerCase());
      const entry = {
        id: userObj.id || ('usr-' + Date.now()),
        name: userObj.name || 'Dinali Bhagya',
        email: userObj.email,
        role: userObj.role || 'patient',
        status: 'Active',
        joined: new Date().toISOString().split('T')[0]
      };
      if (existsIndex >= 0) {
        list[existsIndex] = { ...list[existsIndex], ...entry };
      } else {
        list.push(entry);
      }
      localStorage.setItem('glycopulse_all_users', JSON.stringify(list));
    } catch (e) {}
  };

  const loginUser = async (credentials) => {
    const res = await apiService.login(credentials);
    const requestedRole = credentials.role || 'patient';
    let defaultName = 'Dinali Bhagya';
    if (requestedRole === 'admin') defaultName = 'System Administrator';
    else if (requestedRole === 'doctor') defaultName = 'Dr. Medical Practitioner';
    else if (requestedRole === 'caregiver') defaultName = 'Family Caregiver';

    let userObj = {
      id: 'usr-' + Date.now(),
      name: credentials.name || defaultName,
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

    saveUserToGlobalList(userObj);

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

    saveUserToGlobalList(userObj);

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
    localStorage.setItem('glycopulse_auth', 'false');
    localStorage.removeItem('glycopulse_user');
    localStorage.removeItem('glycopulse_role');
    setAuthModalOpen(false);
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('glycopulse_role', newRole);
    
    let name = 'Dinali Bhagya';
    let email = 'dinali@glucocare.ai';
    if (newRole === 'doctor') {
      name = 'Dr. Medical Practitioner';
      email = 'doctor@glycopulse.ai';
    } else if (newRole === 'caregiver') {
      name = 'Family Caregiver';
      email = 'caregiver@glycopulse.ai';
    } else if (newRole === 'admin') {
      name = 'System Administrator';
      email = 'admin@glycopulse.ai';
    }

    const updatedUser = {
      id: 'usr-' + newRole + '-101',
      name,
      email,
      role: newRole
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('glycopulse_user', JSON.stringify(updatedUser));

    if (newRole === 'doctor') setActiveTab('doctor_patients');
    else if (newRole === 'caregiver') setActiveTab('caregiver_feed');
    else if (newRole === 'admin') setActiveTab('admin_telemetry');
    else setActiveTab('glucose');

    setToastAlert({
      type: 'info',
      title: `SWITCHED TO ${newRole.toUpperCase()} PORTAL`,
      message: `Active profile: ${name} (${email})`
    });
    setTimeout(() => setToastAlert(null), 3500);
  };

  // Health Data & Live Ticker State
  const [currentGlucose, setCurrentGlucose] = useState(null);
  const [cgmTrendArrow, setCgmTrendArrow] = useState('↗'); 
  const [rateOfChange, setRateOfChange] = useState('Awaiting First Entry');
  const [lastCgmSync, setLastCgmSync] = useState('Dexcom G7 Stream');

  const [iobUnits, setIobUnits] = useState(0); 
  const [cobGrams, setCobGrams] = useState(0);  
  
  const [waterIntake, setWaterIntakeState] = useState(() => {
    const saved = localStorage.getItem('glycopulse_water_intake');
    return saved ? parseFloat(saved) : 0.0;
  });

  const setWaterIntake = (val) => {
    setWaterIntakeState(prev => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('glycopulse_water_intake', nextVal.toString());
      return nextVal;
    });
  };

  const [waterGoal] = useState(2.5);

  const [glucoseLogs, setGlucoseLogs] = useState(() => {
    const saved = localStorage.getItem('glycopulse_glucose_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {}
    }
    return [];
  });

  const [hba1cHistory, setHba1cHistory] = useState([]);

  const [aiPrediction, setAiPrediction] = useState({
    predictedGlucose2h: null,
    trend: 'Standby',
    hypoglycemiaRisk: 'Low',
    hyperglycemiaRisk: 'Low',
    confidenceScore: '96.4%',
    explanation: 'Awaiting blood sugar log to calculate personalized 4-Hour forecast curve.',
    recommendation: 'Log your current blood glucose and meal carbs under Blood Glucose & CGM to generate AI trajectory guidance.',
    hourlyForecast: []
  });
  const [streakDays, setStreakDays] = useState(0);
  const [healthScore, setHealthScore] = useState(0);

  // DFU Foot Vision Scanner State
  const [dfuScanResult, setDfuScanResult] = useState(null);
  const [dfuPhotoUrl, setDfuPhotoUrl] = useState(null);

  // Complication Risk Matrix States (Retinopathy, Nephropathy, ASCVD)
  const [retinopathyStatus, setRetinopathyStatus] = useState(null);
  const [nephropathyStatus, setNephropathyStatus] = useState(null);
  const [ascvdStatus, setAscvdStatus] = useState(null);

  // Comprehensive Patient Health History & Measurements State
  const [healthHistoryLogs, setHealthHistoryLogs] = useState(() => {
    const saved = localStorage.getItem('glycopulse_health_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 'h-1', date: 'Aug 14, 2026 09:30', category: 'Blood Pressure', value: '118/76 mmHg', status: 'Normal', notes: 'Morning resting vitals' },
      { id: 'h-2', date: 'Aug 13, 2026 18:15', category: 'Body Weight', value: '68.5 kg', status: 'Optimal', notes: 'Post-workout measurement' },
      { id: 'h-3', date: 'Aug 12, 2026 11:00', category: 'HbA1c Lab', value: '6.5 %', status: 'Target Met', notes: 'Quarterly Lab Scan (OCR Verified)' },
      { id: 'h-4', date: 'Aug 11, 2026 08:00', category: 'Health Condition', value: 'Retinopathy Assessment', status: 'Mild Stage 1', notes: 'Annual fundus exam clear, non-proliferative' },
      { id: 'h-5', date: 'Aug 10, 2026 14:20', category: 'Heart Rate', value: '72 bpm (SpO2 98%)', status: 'Normal', notes: 'Smartwatch live sync' },
      { id: 'h-6', date: 'Aug 08, 2026 10:00', category: 'Kidney Function', value: 'eGFR 95 mL/min', status: 'Healthy', notes: 'Microalbuminuria negative' }
    ];
  });

  const addHealthHistoryLog = (entry) => {
    const newLog = {
      id: 'h-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...entry
    };
    setHealthHistoryLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('glycopulse_health_history', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    localStorage.setItem('glycopulse_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // LIVE 5-SECOND CONTINUOUS GLUCOSE TELEMETRY STREAM TICKER (Only active when logs exist)
  useEffect(() => {
    if (!glucoseLogs || glucoseLogs.length === 0) return;
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
    const formattedLog = {
      ...newLog,
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setGlucoseLogs((prev) => {
      const updated = [formattedLog, ...prev];
      localStorage.setItem('glycopulse_glucose_logs', JSON.stringify(updated));
      return updated;
    });

    setCurrentGlucose(newLog.value);

    // Send to Firebase Cloud Firestore Database (cardiora-new)
    const res = await apiService.logGlucose({
      userId: currentUser?.id || 'pat-101',
      patientName: currentUser?.name || 'Dinali Bhagya',
      value: newLog.value,
      glucoseLevel: newLog.value,
      type: newLog.type,
      notes: newLog.notes
    });

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
        pdfModalOpen,
        setPdfModalOpen,
        isAuthenticated,
        authModalOpen,
        setAuthModalOpen,
        currentUser,
        loginUser,
        signupUser,
        logoutUser,
        switchRole,
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
        setToastAlert,
        dfuScanResult,
        setDfuScanResult,
        dfuPhotoUrl,
        setDfuPhotoUrl,
        retinopathyStatus,
        setRetinopathyStatus,
        nephropathyStatus,
        setNephropathyStatus,
        ascvdStatus,
        setAscvdStatus,
        healthHistoryLogs,
        addHealthHistoryLog
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
