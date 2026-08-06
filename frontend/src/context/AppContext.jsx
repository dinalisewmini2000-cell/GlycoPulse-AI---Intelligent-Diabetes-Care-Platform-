import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState('patient'); // patient, doctor, caregiver, admin
  const [theme, setTheme] = useState(() => localStorage.getItem('glycopulse_theme') || 'dark');
  const [language, setLanguage] = useState('en');
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
    let userObj = defaultProfiles[userRole];

    if (res && res.status === 'success' && res.user) {
      userObj = res.user;
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
    setAuthModalOpen(true);
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

  const [waterIntake, setWaterIntake] = useState(2.2);
  const [waterGoal] = useState(2.8);
  const [healthScore, setHealthScore] = useState(94);
  const [streakDays, setStreakDays] = useState(14);

  // Save state to localStorage whenever logs change
  useEffect(() => {
    localStorage.setItem('glycopulse_logs', JSON.stringify(glucoseLogs));
  }, [glucoseLogs]);

  useEffect(() => {
    localStorage.setItem('glycopulse_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // LIVE 5-SECOND CONTINUOUS GLUCOSE MONITOR (CGM) TICKER SIMULATOR
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      // Small realistic fluctuations (-2 to +3 mg/dL)
      const delta = Math.floor(Math.random() * 6) - 2;
      setCurrentGlucose(prev => {
        const nextVal = Math.max(55, Math.min(280, prev + delta));
        
        // Update trend arrow based on delta
        if (delta >= 3) {
          setCgmTrendArrow('↑');
          setRateOfChange('+2.8 mg/dL/min');
        } else if (delta === 1 || delta === 2) {
          setCgmTrendArrow('↗');
          setRateOfChange('+1.2 mg/dL/min');
        } else if (delta === 0) {
          setCgmTrendArrow('➔');
          setRateOfChange('0.0 mg/dL/min');
        } else if (delta === -1) {
          setCgmTrendArrow('↘');
          setRateOfChange('-0.8 mg/dL/min');
        } else {
          setCgmTrendArrow('↓');
          setRateOfChange('-2.4 mg/dL/min');
        }

        // Trigger Hypoglycemia Alert Toast if sugar drops < 70
        if (nextVal < 70) {
          setToastAlert({
            type: 'danger',
            msg: `⚠️ LOW GLUCOSE WARNING: Sensor reading ${nextVal} mg/dL. Consume 15g fast-acting carbs!`
          });
        }

        return nextVal;
      });

      // Slowly decay IOB & COB over time
      setIobUnits(prev => Math.max(0, parseFloat((prev - 0.05).toFixed(2))));
      setCobGrams(prev => Math.max(0, Math.round(prev - 0.5)));
      setLastCgmSync(`Synced ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
    }, 5000);

    return () => clearInterval(tickerInterval);
  }, []);

  const addGlucoseLog = (newReading) => {
    const val = parseInt(newReading.value);
    const logItem = {
      id: 'g' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: val,
      type: newReading.type || 'Manual Entry',
      notes: newReading.notes || ''
    };
    
    setGlucoseLogs(prev => [logItem, ...prev]);
    setCurrentGlucose(val);

    // If logging insulin or carbs, update active IOB/COB
    if (newReading.insulinUnits) {
      setIobUnits(prev => parseFloat((prev + parseFloat(newReading.insulinUnits)).toFixed(2)));
    }
    if (newReading.carbsGrams) {
      setCobGrams(prev => prev + parseInt(newReading.carbsGrams));
    }

    setToastAlert({
      type: 'success',
      msg: `Log Recorded: ${val} mg/dL (${logItem.type})`
    });

    setTimeout(() => setToastAlert(null), 3000);

    // Dynamic AI prediction recalculation
    apiService.getAIPrediction({ currentGlucose: val }).then(res => {
      if (res && res.status === 'success') {
        setAiPrediction(res);
      }
    });

    apiService.logGlucose(newReading);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <AppContext.Provider value={{
      role, setRole,
      theme, toggleTheme,
      language, setLanguage,
      activeTab, setActiveTab,
      sosActive, setSosActive,
      pdfModalOpen, setPdfModalOpen,
      isAuthenticated, setIsAuthenticated,
      authModalOpen, setAuthModalOpen,
      currentUser, loginUser, signupUser, logoutUser,
      glucoseLogs, addGlucoseLog,
      currentGlucose, setCurrentGlucose,
      cgmTrendArrow, rateOfChange, lastCgmSync,
      iobUnits, setIobUnits, cobGrams, setCobGrams,
      hba1cHistory,
      aiPrediction, setAiPrediction,
      waterIntake, setWaterIntake, waterGoal,
      healthScore, streakDays, setStreakDays,
      toastAlert, setToastAlert
    }}>
      {children}
      {toastAlert && (
        <div style={{
          position: 'fixed', top: '1.2rem', right: '1.2rem', zIndex: 9999,
          background: toastAlert.type === 'danger' ? 'rgba(239, 68, 68, 0.92)' : 'rgba(16, 185, 129, 0.92)',
          color: '#fff', padding: '0.85rem 1.4rem', borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
          fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem'
        }}>
          <span>{toastAlert.msg}</span>
          <button onClick={() => setToastAlert(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '0.5rem' }}>✕</button>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
