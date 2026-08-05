import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState('patient'); // patient, doctor, caregiver, admin
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('glucose'); // glucose, food, lab, complications, fitness, doctor, caregiver, admin, devices
  const [sosActive, setSosActive] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Health Data State
  const [glucoseLogs, setGlucoseLogs] = useState([
    { id: 'g1', timestamp: '07:30 AM', value: 112, type: 'Fasting', notes: 'Woke up feeling good' },
    { id: 'g2', timestamp: '08:30 AM', value: 145, type: 'After Meal', notes: 'Oatmeal & berries' },
    { id: 'g3', timestamp: '12:15 PM', value: 108, type: 'Before Meal', notes: 'Pre-lunch check' },
    { id: 'g4', timestamp: '01:45 PM', value: 162, type: 'After Meal', notes: 'Chicken salad + quinoa' },
    { id: 'g5', timestamp: '05:00 PM', value: 125, type: 'Before Meal', notes: 'Post walk' },
    { id: 'g6', timestamp: '09:00 PM', value: 118, type: 'Bedtime', notes: 'Optimal range' }
  ]);

  const [currentGlucose, setCurrentGlucose] = useState(118);
  const [hba1cHistory, setHba1cHistory] = useState([
    { date: 'Jan 2026', value: 6.8 },
    { date: 'Apr 2026', value: 6.5 },
    { date: 'Jul 2026', value: 6.3 }
  ]);

  const [aiPrediction, setAiPrediction] = useState({
    predictedGlucose2h: 122,
    trend: 'Stable',
    hypoglycemiaRisk: 'Low',
    hyperglycemiaRisk: 'Low',
    confidenceScore: '94.2%',
    explanation: 'Carbohydrate intake is well balanced with active insulin and moderate walking routine.',
    recommendation: 'Glucose level is on track within target range (70-140 mg/dL). Maintain current regimen.',
    hourlyForecast: [
      { time: 'Now', value: 118 },
      { time: '+30m', value: 124 },
      { time: '+60m', value: 130 },
      { time: '+90m', value: 126 },
      { time: '+120m', value: 122 }
    ]
  });

  const [waterIntake, setWaterIntake] = useState(2.2); // Liters
  const [waterGoal] = useState(2.8);

  const [healthScore, setHealthScore] = useState(94);
  const [streakDays, setStreakDays] = useState(14);

  // Sync theme attribute with document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load initial data from PHP API when mounted
  useEffect(() => {
    apiService.getGlucoseData().then(res => {
      if (res && res.status === 'success') {
        if (res.logs) setGlucoseLogs(res.logs);
        if (res.currentGlucose) setCurrentGlucose(res.currentGlucose);
      }
    });
  }, []);

  const addGlucoseLog = (newReading) => {
    const logItem = {
      id: 'g' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: parseInt(newReading.value),
      type: newReading.type || 'Manual Entry',
      notes: newReading.notes || ''
    };
    
    setGlucoseLogs(prev => [logItem, ...prev]);
    setCurrentGlucose(parseInt(newReading.value));

    // Update AI prediction dynamically
    apiService.getAIPrediction({ currentGlucose: newReading.value }).then(res => {
      if (res && res.status === 'success') {
        setAiPrediction(res);
      }
    });

    // Try posting to PHP API
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
      glucoseLogs, addGlucoseLog,
      currentGlucose, setCurrentGlucose,
      hba1cHistory,
      aiPrediction, setAiPrediction,
      waterIntake, setWaterIntake, waterGoal,
      healthScore, streakDays
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
