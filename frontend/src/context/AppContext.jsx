import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('glucocare_theme') || 'light');

  // Active Navigation Section: 'dashboard' | 'glucose' | 'meals' | 'calendar' | 'lab'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastAlert, setToastAlert] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const auth = localStorage.getItem('glucocare_auth');
    if (auth !== null) return auth === 'true';
    return false;
  });

  const [role, setRole] = useState('patient');

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('glucocare_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      } catch (err) {}
    }
    return {
      id: 'usr-101',
      name: 'Dinali Bhagya',
      email: 'dinali@glucocare.ai',
      role: 'patient'
    };
  });

  // 1. Glucose Readings State
  const [glucoseLogs, setGlucoseLogs] = useState(() => {
    const saved = localStorage.getItem('glucocare_glucose_readings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {}
    }
    return [
      { id: 'g-1', date: '2026-08-18', time: '8:00 AM', value: 110, context: 'Before breakfast', notes: 'Fasting check' },
      { id: 'g-2', date: '2026-08-18', time: '1:00 PM', value: 145, context: 'After lunch', notes: 'Walked 15 mins' },
      { id: 'g-3', date: '2026-08-18', time: '7:00 PM', value: 168, context: 'Before dinner', notes: '' }
    ];
  });

  // 2. Meal Logs State
  const [mealLogs, setMealLogs] = useState(() => {
    const saved = localStorage.getItem('glucocare_meal_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {}
    }
    return [
      { id: 'm-1', date: '2026-08-18', mealType: 'Breakfast', time: '8:00 AM', food: 'Eggs, bread and tea', notes: 'Whole wheat bread' },
      { id: 'm-2', date: '2026-08-18', mealType: 'Lunch', time: '1:00 PM', food: 'Rice, chicken and vegetables', notes: 'Balanced meal' },
      { id: 'm-3', date: '2026-08-18', mealType: 'Dinner', time: '7:30 PM', food: 'Rice and vegetables', notes: 'Light dinner' }
    ];
  });

  // 3. Health Reminders State
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('glucocare_reminders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {}
    }
    return [
      { id: 'r-1', title: 'Fasting Glucose Check', date: '2026-08-19', time: '8:00 AM', category: 'Glucose Check' },
      { id: 'r-2', title: 'Quarterly HbA1c Lab Test', date: '2026-08-25', time: '9:00 AM', category: 'Lab Test' },
      { id: 'r-3', title: 'Evening Glucose Check', date: '2026-08-19', time: '9:00 PM', category: 'Glucose Check' }
    ];
  });

  // 4. Lab Reports State
  const [labReports, setLabReports] = useState(() => {
    const saved = localStorage.getItem('glucocare_lab_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {}
    }
    return [
      { id: 'l-1', name: 'HbA1c Lab Report', date: '18 Aug 2026', result: '6.5%', status: 'Within Target' },
      { id: 'l-2', name: 'Fasting Lipid Profile', date: '10 Jun 2026', result: 'Normal (Cholesterol 175 mg/dL)', status: 'Normal' }
    ];
  });

  // Save to LocalStorage effects
  useEffect(() => {
    localStorage.setItem('glucocare_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const loginUser = (credentials) => {
    const userObj = {
      id: 'usr-' + Date.now(),
      name: credentials.name || 'Dinali Bhagya',
      email: credentials.email || 'dinali@glucocare.ai',
      role: 'patient'
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
    localStorage.setItem('glucocare_auth', 'false');
    localStorage.removeItem('glucocare_user');
  };

  // Add / Delete Glucose Reading
  const addGlucoseLog = (newLog) => {
    const entry = {
      id: 'g-' + Date.now(),
      date: newLog.date || new Date().toISOString().split('T')[0],
      time: newLog.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Number(newLog.value),
      context: newLog.context || 'Before breakfast',
      notes: newLog.notes || ''
    };

    setGlucoseLogs((prev) => {
      const updated = [entry, ...prev];
      localStorage.setItem('glucocare_glucose_readings', JSON.stringify(updated));
      return updated;
    });

    setToastAlert({
      type: 'success',
      title: 'Glucose Reading Saved',
      message: `${entry.value} mg/dL (${entry.context}) recorded successfully.`
    });
    setTimeout(() => setToastAlert(null), 3500);
  };

  const deleteGlucoseLog = (id) => {
    setGlucoseLogs((prev) => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('glucocare_glucose_readings', JSON.stringify(updated));
      return updated;
    });
  };

  // Add / Delete Meal Log
  const addMealLog = (newMeal) => {
    const entry = {
      id: 'm-' + Date.now(),
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

    setMealLogs((prev) => {
      const updated = [entry, ...prev];
      localStorage.setItem('glucocare_meal_logs', JSON.stringify(updated));
      return updated;
    });

    setToastAlert({
      type: 'success',
      title: 'Meal Saved',
      message: `${entry.mealType} logged successfully.`
    });
    setTimeout(() => setToastAlert(null), 3500);
  };

  const deleteMealLog = (id) => {
    setMealLogs((prev) => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('glucocare_meal_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Add / Delete Reminder
  const addReminder = (newRem) => {
    const entry = {
      id: 'r-' + Date.now(),
      title: newRem.title,
      date: newRem.date || new Date().toISOString().split('T')[0],
      time: newRem.time || '8:00 AM',
      category: newRem.category || 'Glucose Check'
    };

    setReminders((prev) => {
      const updated = [entry, ...prev];
      localStorage.setItem('glucocare_reminders', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteReminder = (id) => {
    setReminders((prev) => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('glucocare_reminders', JSON.stringify(updated));
      return updated;
    });
  };

  // Add / Delete Lab Report
  const addLabReport = (newLab) => {
    const entry = {
      id: 'l-' + Date.now(),
      name: newLab.name,
      date: newLab.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      result: newLab.result || 'Uploaded Document',
      status: newLab.status || 'Report Added'
    };

    setLabReports((prev) => {
      const updated = [entry, ...prev];
      localStorage.setItem('glucocare_lab_reports', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        isInitialLoading,
        setIsInitialLoading,
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
        toastAlert,
        setToastAlert,
        glucoseLogs,
        addGlucoseLog,
        deleteGlucoseLog,
        mealLogs,
        addMealLog,
        deleteMealLog,
        reminders,
        addReminder,
        deleteReminder,
        labReports,
        addLabReport
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
