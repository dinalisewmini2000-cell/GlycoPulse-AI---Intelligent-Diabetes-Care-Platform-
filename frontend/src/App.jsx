import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/common/LandingPage';
import { InitialSplashScreen } from './components/common/InitialSplashScreen';

// Patient Components
import { GlucoseDashboard } from './components/patient/GlucoseDashboard';
import { AIPredictions } from './components/patient/AIPredictions';
import { FoodNutrition } from './components/patient/FoodNutrition';
import { FitnessSleep } from './components/patient/FitnessSleep';
import { RiskComplications } from './components/patient/RiskComplications';
import { LabOCR } from './components/patient/LabOCR';

// Doctor and Admin Components
import { DoctorPortal } from './components/doctor/DoctorPortal';
import { AdminPortal } from './components/admin/AdminPortal';

// Common Components
import { AIChatWidget } from './components/common/AIChatWidget';
import { PDFExportModal } from './components/common/PDFExportModal';
import { LoginModal } from './components/common/LoginModal';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainContentArea = () => {
  const { role, activeTab } = useApp();

  const renderTabContent = () => {
    if (role === 'doctor') return <DoctorPortal activeTab={activeTab} />;
    if (role === 'admin') return <AdminPortal activeTab={activeTab} />;

    // Patient Tabs
    switch (activeTab) {
      case 'glucose': return <GlucoseDashboard />;
      case 'predictions': return <AIPredictions />;
      case 'food': return <FoodNutrition />;
      case 'fitness': return <FitnessSleep />;
      case 'complications': return <RiskComplications />;
      case 'lab': return <LabOCR />;
      default: return <GlucoseDashboard />;
    }
  };

  return (
    <main className="main-content">
      <ErrorBoundary>
        {renderTabContent()}
      </ErrorBoundary>
    </main>
  );
};

const AppShell = () => {
  const { isInitialLoading, setIsInitialLoading, isAuthenticated } = useApp();

  if (isInitialLoading) {
    return <InitialSplashScreen onComplete={() => setIsInitialLoading(false)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {!isAuthenticated ? (
        <LandingPage />
      ) : (
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <MainContentArea />
        </div>
      )}

      <AIChatWidget />
      <PDFExportModal />
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </ErrorBoundary>
  );
}
