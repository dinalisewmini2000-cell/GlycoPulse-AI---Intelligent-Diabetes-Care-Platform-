import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/common/LandingPage';

// Simplified Patient Components according to Human Design Spec
import { DashboardView } from './components/patient/DashboardView';
import { GlucosePage } from './components/patient/GlucosePage';
import { MealsPage } from './components/patient/MealsPage';
import { CalendarPage } from './components/patient/CalendarPage';
import { LabReportsPage } from './components/patient/LabReportsPage';

// Common Components
import { AIChatWidget } from './components/common/AIChatWidget';
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
  const { isAuthenticated } = useApp();

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
