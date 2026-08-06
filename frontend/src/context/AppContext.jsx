import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme & Language State
  const [theme, setTheme] = useState(() => localStorage.getItem('glycopulse_theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('glycopulse_lang') || 'en');

  // Active Main Tab
  const [activeTab, setActiveTab] = useState('glucose'); 
  const [sosActive, setSosActive] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Global Toast Alert Banner
  const [toastAlert, setToastAlert] = useState(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('glycopulse_auth') === 'true';
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('glycopulse_user');
    return saved ? JSON.parse(saved) : {
      id: 'pat-101',
      name: 'Sarah Jenkins',
      email: 'patient@glucocare.ai',
      role: 'patient',
      diabetesType: 'Type 1'
    };
  });

  const defaultProfiles = {
    patient: { id: 'pat-101', name: 'Sarah Jenkins', email: 'patient@glucocare.ai', role: 'patient', diabetesType: 'Type 1' },
    doctor: { id: 'doc-201', name: 'Dr. Robert Vance, MD', email: 'doctor@glucocare.ai', role: 'doctor', specialty: 'Endocrinology' },
    caregiver: { id: 'cg-301', name: 'David Jenkins', email: 'caregiver@glucocare.ai', role: 'caregiver' },
    admin: { id: 'adm-401', name: 'System Administrator', email: 'admin@glucocare.ai', role: 'admin' }
  };

  const loginUser = async (credentials) => {
    const res = await apiService.login(credentials);
    const userRole = credentials.role || 'patient';
    let userObj = defaultProfiles[userRole] ? { ...defaultProfiles[userRole] } : { id: 'usr-' + Date.now(), role: userRole };

    if (res && res.status === 'success' && res.user) {
      userObj = res.user;
    }

    // Override with custom credentials if specified
    if (credentials.name && credentials.name.trim()) {
      userObj.name = credentials.name.trim();
    } else if (credentials.email && credentials.email !== defaultProfiles[userRole]?.email) {
      const emailPrefix = credentials.email.split('@')[0];
      userObj.email = credentials.email;
      userObj.name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    
    setCurrentUser(userObj);
    setRole(userRole);
    setIsAuthenticated(true);
    setAuthModalOpen(false);

    localStorage.setItem('glycopulse_auth', 'true');
    localStorage.setItem('glycopulse_user', JSON.stringify(userObj));

    if (userRole === 'doctor') setActiveTab('doctor_patients');
    else if (userRole === 'caregiver') setActiveTab('caregiver_feed');
    else if (userRole === 'admin') setActiveTab('admin_telemetry');
    else setActiveTab('glucose');
  };

  const signupUser = async (userData) => {
    const res = await apiService.signup(userData);
    const userRole = userData.role || 'patient';
    let userObj = {
      id: 'user-' + Date.now(),
      name: userData.name || 'New Member',
      email: userData.email,
      role: userRole,
      diabetesType: userData.diabetesType || 'Type 2'
    };

    if (res && res.status === 'success' && res.user) {
      userObj = res.user;
    }

    if (userData.name && userData.name.trim()) {
      userObj.name = userData.name.trim();
    }

    setCurrentUser(userObj);
    setRole(userRole);
    setIsAuthenticated(true);
    setAuthModalOpen(false);

    localStorage.setItem('glycopulse_auth', 'true');
    localStorage.setItem('glycopulse_user', JSON.stringify(userObj));

    if (userRole === 'doctor') setActiveTab('doctor_patients');
    else if (userRole === 'caregiver') setActiveTab('caregiver_feed');
    else if (userRole === 'admin') setActiveTab('admin_telemetry');
    else setActiveTab('glucose');
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('glycopulse_auth');
    localStorage.removeItem('glycopulse_user');
    setAuthModalOpen(false);
  };

  // Health Data & Live Ticker State
  const [currentGlucose, setCurrentGlucose] = useState(118);
  const [cgmTrendArrow, setCgmTrendArrow] = useState('↗'); // ↑, ↗, ➔, ↘, ↓
  const [rateOfChange, setRateOfChange] = useState('+1.2 mg/dL/min');
  const [lastCgmSync, setLastCgmSync] = useState('Just now (Dexcom G7)');

  // IOB (Insulin on Board) & COB (Carbs on Board)
  const [iobUnits, setIobUnits] = useState(1.4); // Rapid acting insulin active in blood
  const [cobGrams, setCobGrams] = useState(18);  // Carbs digesting in stomach

  const [glucoseLogs, setGlucoseLogs] = useState(() => {
    const saved = localStorage.getItem('glycopulse_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'g1', timestamp: '07:30 AM', value: 112, type: 'Fasting', notes: 'Morning wake up' },
      { id: 'g2', timestamp: '08:30 AM', value: 145, type: 'After Meal', notes: 'Oatmeal & berries' },
      { id: 'g3', timestamp: '12:15 PM', value: 108, type: 'Before Meal', notes: 'Pre-lunch check' },
      { id: 'g4', timestamp: '01:45 PM', value: 162, type: 'After Meal', notes: 'Chicken salad & quinoa' },
      { id: 'g5', timestamp: '05:00 PM', value: 125, type: 'Before Meal', notes: 'Post 30m walk' },
      { id: 'g6', timestamp: '09:00 PM', value: 118, type: 'Bedtime', notes: 'Night target reached' }
    ];
  });

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

  // Role Management
  const [role, setRole] = useState(() => currentUser?.role || 'patient');

  // Gamification & Streaks
  const [streakDays, setStreakDays] = useState(14);
  const [healthScore, setHealthScore] = useState(88);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('glycopulse_logs', JSON.stringify(glucoseLogs));
  }, [glucoseLogs]);

  useEffect(() => {
    localStorage.setItem('glycopulse_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('glycopulse_lang', language);
  }, [language]);

  // LIVE 5-SECOND CONTINUOUS GLUCOSE TELEMETRY STREAM TICKER
  useEffect(() => {
    const ticker = setInterval(() => {
      // Simulate micro-fluctuations (-3 to +3 mg/dL)
      const delta = Math.floor(Math.random() * 7) - 3;
      
      setCurrentGlucose((prev) => {
        const nextVal = Math.max(55, Math.min(260, prev + delta));
        
        // Compute trend arrow & rate of change
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

        // Trigger Global Toast Alert for Hypoglycemia (<70 mg/dL)
        if (nextVal < 70) {
          setToastAlert({
            type: 'danger',
            title: 'CRITICAL HYPOGLYCEMIA ALERT',
            message: `Current Glucose is ${nextVal} mg/dL. Consume 15g fast-acting carbs immediately.`
          });
        }

        return nextVal;
      });

      // Slowly decay IOB & COB over time
      setIobUnits((prev) => Math.max(0, parseFloat((prev - 0.05).toFixed(2))));
      setCobGrams((prev) => Math.max(0, Math.round(prev - 0.5)));
      setLastCgmSync('Just now (Dexcom G7 Live Sync)');

    }, 5000);

    return () => clearInterval(ticker);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addGlucoseLog = (newLog) => {
    const updated = [newLog, ...glucoseLogs];
    setGlucoseLogs(updated);
    
    // Re-evaluate AI prediction based on new log
    setAiPrediction((prev) => ({
      ...prev,
      predictedGlucose2h: Math.round(newLog.value + (cobGrams * 0.8) - (iobUnits * 12)),
      explanation: `Latest log entry (${newLog.value} mg/dL) incorporated into neural pharmacokinetic model.`
    }));

    // Trigger success toast
    setToastAlert({
      type: 'success',
      title: 'GLUCOSE ENTRY LOGGED',
      message: `Recorded ${newLog.value} mg/dL (${newLog.type}) successfully.`
    });
    setTimeout(() => setToastAlert(null), 4000);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
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
