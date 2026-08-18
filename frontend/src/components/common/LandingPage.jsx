import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, LogIn, ArrowRight } from 'lucide-react';

export const LandingPage = () => {
  const { loginUser } = useApp();

  const handleEnterPortal = () => {
    loginUser({
      name: 'Dinali Bhagya',
      email: 'dinali@glucocare.ai',
      role: 'patient'
    });
  };

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 60px)', background: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Main Container */}
      <div style={{ maxWidth: '640px', width: '100%', margin: 'auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
        
        {/* Logo */}
        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={26} color="#ffffff" />
        </div>

        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            GlucoCare
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Simple, personal diabetes management. Track your blood glucose readings, meal logs, health reminders, and lab test results.
          </p>
        </div>

        {/* Enter Portal Panel */}
        <div className="glass-panel" style={{ width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--bg-secondary)' }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Welcome back, Dinali
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click below to access your daily glucose dashboard and health logs.
            </p>
          </div>

          <button 
            onClick={handleEnterPortal} 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}
          >
            <span>Open Diabetes Portal</span>
            <ArrowRight size={18} />
          </button>
        </div>

      </div>

      <footer style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        GlucoCare Diabetes Care Portal &copy; {new Date().getFullYear()}
      </footer>

    </div>
  );
};
