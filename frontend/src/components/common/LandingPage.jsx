import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, LogIn, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LandingPage = () => {
  const { loginUser, signupUser, setAuthModalOpen } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [diabetesType, setDiabetesType] = useState('Type 2');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanName = nameInput.trim() || cleanEmail.split('@')[0];

    if (isSignUp) {
      await signupUser({
        name: cleanName,
        email: cleanEmail,
        password: passwordInput || 'default123',
        role: 'patient',
        diabetesType: diabetesType
      });
    } else {
      await loginUser({
        name: cleanName,
        email: cleanEmail,
        password: passwordInput || 'default123',
        role: 'patient'
      });
    }
  };

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 60px)', background: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Main Container */}
      <div style={{ maxWidth: '580px', width: '100%', margin: 'auto', padding: '2.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
        
        {/* Logo Header */}
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #0284c7, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(2, 132, 199, 0.25)' }}>
          <Activity size={28} color="#ffffff" />
        </div>

        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            GlucoCare Clinical Care Portal
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Personalized Diabetes Management. Monitor glucose readings, AI meal nutrition, lab reports, and doctor consultations.
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="glass-panel" style={{ width: '100%', padding: '1.75rem', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'left', boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)' }}>
          
          {/* Sign In vs Sign Up Tab Selector */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem',
            background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '10px',
            border: '1px solid var(--border-color)', marginBottom: '1.25rem'
          }}>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              style={{
                padding: '0.6rem', borderRadius: '8px', border: 'none',
                background: !isSignUp ? 'var(--primary-color)' : 'transparent',
                color: !isSignUp ? '#ffffff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                transition: 'all 0.15s ease'
              }}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              style={{
                padding: '0.6rem', borderRadius: '8px', border: 'none',
                background: isSignUp ? 'var(--primary-color)' : 'transparent',
                color: isSignUp ? '#ffffff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                transition: 'all 0.15s ease'
              }}
            >
              <UserPlus size={16} />
              <span>Sign Up</span>
            </button>
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              {isSignUp ? 'Create New Patient Account' : 'Sign In to Patient Portal'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {isSignUp ? 'Register your email to start recording your diabetes logs & AI reports.' : 'Enter your email credentials to open your daily health dashboard.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            
            {/* Full Name for Sign Up */}
            {isSignUp && (
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.03em' }}>
                  FULL NAME
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter your full name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.03em' }}>
                EMAIL ADDRESS
              </label>
              <input 
                type="email" 
                required
                placeholder="e.g. patient@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>

            {/* Diabetes Type Selection for Sign Up */}
            {isSignUp && (
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.03em' }}>
                  DIABETES DIAGNOSIS TYPE
                </label>
                <select
                  value={diabetesType}
                  onChange={(e) => setDiabetesType(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                >
                  <option value="Type 2">Type 2 Diabetes Mellitus</option>
                  <option value="Type 1">Type 1 Diabetes Mellitus</option>
                  <option value="Pre-diabetes">Pre-diabetes / High Risk</option>
                  <option value="Gestational">Gestational Diabetes</option>
                </select>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.03em' }}>
                PASSWORD
              </label>
              <input 
                type="password" 
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>

            <button 
              type="submit"
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.4rem', borderRadius: '8px' }}
            >
              {isSignUp ? <UserPlus size={17} /> : <LogIn size={17} />}
              <span>{isSignUp ? 'Create Patient Account & Enter' : 'Sign In to Patient Portal'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Direct Switch Footer link */}
          <div style={{ marginTop: '1.1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isSignUp ? (
              <span>Already have an account? <button type="button" onClick={() => setIsSignUp(false)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 800, cursor: 'pointer', padding: 0 }}>Sign In here</button></span>
            ) : (
              <span>Don't have an account yet? <button type="button" onClick={() => setIsSignUp(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 800, cursor: 'pointer', padding: 0 }}>Sign Up now</button></span>
            )}
          </div>

        </div>

      </div>

      <footer style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
        GlucoCare Clinical Diabetes Platform &copy; {new Date().getFullYear()}
      </footer>

    </div>
  );
};
