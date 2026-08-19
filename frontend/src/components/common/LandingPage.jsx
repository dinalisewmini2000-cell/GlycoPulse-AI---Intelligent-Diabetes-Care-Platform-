import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, LogIn, ArrowRight } from 'lucide-react';

export const LandingPage = () => {
  const { loginUser, setAuthModalOpen } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const handleEnterPortal = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setAuthModalOpen(true);
      return;
    }
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanName = nameInput.trim() || cleanEmail.split('@')[0];
    loginUser({
      name: cleanName,
      email: cleanEmail,
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
        <form onSubmit={handleEnterPortal} className="glass-panel" style={{ width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', background: 'var(--bg-secondary)', textAlign: 'left' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Access Patient Care Portal
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Enter your email address to open your daily glucose dashboard and health logs.
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              YOUR EMAIL ADDRESS
            </label>
            <input 
              type="email" 
              required
              placeholder="e.g. user@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              YOUR NAME (OPTIONAL)
            </label>
            <input 
              type="text" 
              placeholder="e.g. John Smith"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>

          <button 
            type="submit"
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            <span>Enter Patient Portal</span>
            <ArrowRight size={18} />
          </button>
        </form>

      </div>

      <footer style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
        GlucoCare Diabetes Care Portal &copy; {new Date().getFullYear()}
      </footer>

    </div>
  );
};
