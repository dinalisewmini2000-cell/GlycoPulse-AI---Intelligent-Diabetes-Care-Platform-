import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Patient Components
import { GlucoseDashboard } from './components/patient/GlucoseDashboard';
import { AIPredictions } from './components/patient/AIPredictions';
import { FoodNutrition } from './components/patient/FoodNutrition';
import { FitnessSleep } from './components/patient/FitnessSleep';
import { RiskComplications } from './components/patient/RiskComplications';
import { LabOCR } from './components/patient/LabOCR';
import { SmartDevicesHub } from './components/patient/SmartDevicesHub';
import { GamificationBar } from './components/patient/GamificationBar';
import { EmergencySOSModal } from './components/patient/EmergencySOSModal';

// Doctor, Caregiver, Admin Components
import { DoctorPortal } from './components/doctor/DoctorPortal';
import { CaregiverPortal } from './components/caregiver/CaregiverPortal';
import { AdminPortal } from './components/admin/AdminPortal';

// Common Components
import { AIChatWidget } from './components/common/AIChatWidget';
import { PDFExportModal } from './components/common/PDFExportModal';
import { LoginModal } from './components/common/LoginModal';

const MainContentArea = () => {
  const { role, activeTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center', maxWidth: '480px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>Session Locked</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Please sign in to access your GlycoPulse AI portal and healthcare telemetry data.
          </p>
        </div>
      </main>
    );
  }

  const renderTabContent = () => {
    if (role === 'doctor') return <DoctorPortal activeTab={activeTab} />;
    if (role === 'caregiver') return <CaregiverPortal activeTab={activeTab} />;
    if (role === 'admin') return <AdminPortal activeTab={activeTab} />;

    // Patient Tabs
    switch (activeTab) {
      case 'glucose': return <GlucoseDashboard />;
      case 'predictions': return <AIPredictions />;
      case 'food': return <FoodNutrition />;
      case 'fitness': return <FitnessSleep />;
      case 'complications': return <RiskComplications />;
      case 'lab': return <LabOCR />;
      case 'devices': return <SmartDevicesHub />;
      case 'gamification': return <GamificationBar />;
      default: return <GlucoseDashboard />;
    }
  };

  return (
    <main className="main-content">
      {renderTabContent()}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <MainContentArea />
        </div>
        <AIChatWidget />
        <EmergencySOSModal />
        <PDFExportModal />
        <LoginModal />
      </div>
    </AppProvider>
  );
}

