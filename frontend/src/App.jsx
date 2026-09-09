import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/common/LandingPage';
import { ShieldAlert } from 'lucide-react';

// Simplified Patient Components according to Human Design Spec
import { DashboardView } from './components/patient/DashboardView';
import { GlucosePage } from './components/patient/GlucosePage';
import { MealsPage } from './components/patient/MealsPage';
import { CalendarPage } from './components/patient/CalendarPage';
import { LabReportsPage } from './components/patient/LabReportsPage';
import { CommunityForum } from './components/patient/CommunityForum';
import { MentalHealth } from './components/patient/MentalHealth';
import { MedicationsPage } from './components/patient/MedicationsPage';
import { SmartDevicesHub } from './components/patient/SmartDevicesHub';
import { PremiumAIHub } from './components/patient/PremiumAIHub';
import { EmergencyModal } from './components/patient/EmergencyModal';

// Common Components
import { PDFExportModal } from './components/common/PDFExportModal';
import { LoginModal } from './components/common/LoginModal';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainContentArea = () => {
  const { activeTab, setActiveTab } = useApp();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <DashboardView onOpenAddGlucose={() => setActiveTab('glucose')} />;
      case 'glucose': 
        return <GlucosePage />;
      case 'meals': 
        return <MealsPage />;
      case 'calendar': 
        return <CalendarPage />;
      case 'lab': 
        return <LabReportsPage />;
      case 'community':
        return <CommunityForum />;
      case 'mental-health':
        return <MentalHealth />;
      case 'medications':
        return <MedicationsPage />;
      case 'devices':
        return <SmartDevicesHub />;
      case 'premium-ai':
        return <PremiumAIHub />;
      default: 
        return <DashboardView onOpenAddGlucose={() => setActiveTab('glucose')} />;
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
  const { isAuthenticated, setEmergencyModalOpen } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      <Navbar />

      {!isAuthenticated ? (
        <LandingPage />
      ) : (
        <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
          <Sidebar />
          <MainContentArea />

          {/* Modern Floating Emergency SOS FAB */}
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer Pulsing Ping Ring */}
            <span style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '30px',
              background: '#ef4444',
              opacity: 0.4,
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            
            <button
              onClick={() => setEmergencyModalOpen(true)}
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #ef4444 0%, #e11d48 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '30px',
                padding: '0.8rem 1.35rem',
                fontWeight: 800,
                fontSize: '0.88rem',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                boxShadow: '0 10px 25px -3px rgba(239, 68, 68, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              title="Open Emergency SOS & Digital Medical ID"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 14px 30px -3px rgba(239, 68, 68, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1.0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(239, 68, 68, 0.5)';
              }}
            >
              <ShieldAlert size={20} />
              <span>SOS EMERGENCY</span>
            </button>
          </div>
        </div>
      )}

      <PDFExportModal />
      <LoginModal />
      <EmergencyModal />
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
