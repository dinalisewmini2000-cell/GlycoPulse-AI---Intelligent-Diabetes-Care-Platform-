import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sparkles, Brain, Radio, Utensils, 
  FileSpreadsheet, UserCheck, Stethoscope, 
  ShieldAlert, Mail, User, UserPlus, LogIn, Key, AlertCircle, Heart, Lock, ArrowRight, CheckCircle2, Zap
} from 'lucide-react';

export const LandingPage = () => {
  const { loginUser, signupUser } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('kasun@glucocare.ai');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [diabetesType, setDiabetesType] = useState('Type 1');
  const [specialty, setSpecialty] = useState('Endocrinology & Diabetology');

  const [connecting, setConnecting] = useState(false);
  const [connectingProgress, setConnectingProgress] = useState(0);
  const [connectingStatus, setConnectingStatus] = useState('Initializing telemetry link...');
  const [error, setError] = useState('');

  const roleDetails = {
    patient: {
      title: 'Diabetes Patient Portal',
      subtitle: 'Live blood glucose telemetry, AI predictions & meal vision scanner',
      icon: UserCheck,
      color: '#10b981',
      defaultEmail: 'kasun@glucocare.ai',
      defaultPassword: 'password123'
    },
    doctor: {
      title: 'Clinical Doctor Portal',
      subtitle: 'Patient telemetry roster, clinical prescriptions & risk alerts',
      icon: Stethoscope,
      color: '#06b6d4',
      defaultEmail: 'kasun.doc@glucocare.ai',
      defaultPassword: 'password123'
    },
    admin: {
      title: 'System Admin Console',
      subtitle: 'User permissions, SQL engine status & platform audit logs',
      icon: ShieldAlert,
      color: '#a855f7',
      defaultEmail: 'admin@glucocare.ai',
      defaultPassword: 'admin123'
    }
  };

  const startConnectingSequence = async (authAction) => {
    setConnecting(true);
    setConnectingProgress(15);
    setConnectingStatus('Connecting to GlycoPulse Cloud Telemetry Engine...');
    
    await new Promise(r => setTimeout(r, 250));
    setConnectingProgress(50);
    setConnectingStatus('Verifying SQL Database & Auth Credentials...');

    await new Promise(r => setTimeout(r, 350));
    setConnectingProgress(85);
    setConnectingStatus('Synchronizing Dexcom G7 & AI Vision Models...');

    await new Promise(r => setTimeout(r, 250));
    setConnectingProgress(100);
    
    try {
      await authAction();
    } catch (err) {
      setConnecting(false);
      setError(err.message || 'Authentication failed.');
    }
  };

  const handleQuickDemoLogin = (roleKey) => {
    const r = roleDetails[roleKey];
    setSelectedRole(roleKey);
    startConnectingSequence(() => loginUser({
      name: roleKey === 'admin' ? 'System Administrator' : roleKey === 'doctor' ? 'Dr. Medical Practitioner' : 'Dinali Bhagya',
      email: r.defaultEmail,
      password: r.defaultPassword,
      role: roleKey
    }));
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (!isSignUp) {
      setEmail(roleDetails[roleKey].defaultEmail);
      setPassword(roleDetails[roleKey].defaultPassword);
      if (roleKey === 'admin') setSecurityKey('ADMIN123');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const activeName = name.trim() || (selectedRole === 'admin' ? 'System Administrator' : selectedRole === 'doctor' ? 'Dr. Medical Practitioner' : 'Dinali Bhagya');

    if (isSignUp) {
      startConnectingSequence(() => signupUser({
        name: activeName,
        email,
        password,
        role: selectedRole,
        diabetesType,
        specialty
      }));
    } else {
      startConnectingSequence(() => loginUser({
        name: activeName,
        email,
        password,
        role: selectedRole
      }));
    }
  };

  const currentRole = roleDetails[selectedRole];

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', background: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* FULL SCREEN CONNECTING OVERLAY WITH GLYCOPULSE LOGO */}
      {connecting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 9999, background: 'rgba(11, 15, 25, 0.95)', backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#ffffff', padding: '2rem'
        }}>
          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            {/* Glowing Pulse Rings */}
            <div style={{
              position: 'absolute', width: '120px', height: '120px', borderRadius: '50%',
              border: `2px solid ${currentRole.color}`, animation: 'sos-pulse 1.5s infinite', opacity: 0.5
            }}></div>
            <div style={{
              width: '80px', height: '80px', borderRadius: '24px',
              background: `linear-gradient(135deg, ${currentRole.color}, #3b82f6)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px ${currentRole.color}aa`
            }}>
              <Activity size={44} color="#ffffff" className="spin-slow" />
            </div>
          </div>

          <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '0.4rem' }}>
            Glyco<span style={{ color: currentRole.color }}>Pulse AI</span>
          </div>

          <div style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>
            {connectingStatus}
          </div>

          {/* Connection Progress Bar */}
          <div style={{ width: '100%', maxWidth: '380px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              height: '100%', width: `${connectingProgress}%`,
              background: `linear-gradient(90deg, ${currentRole.color}, #38bdf8)`,
              borderRadius: '10px', transition: 'width 0.3s ease'
            }}></div>
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
            {connectingProgress}% Connected
          </div>
        </div>
      )}

      {/* Main Split-Screen Section */}
      <div style={{ maxWidth: '1450px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
        
        {/* LEFT COLUMN: Brand Showcase & 1-Click Quick Demo Gateway */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
            }}>
              <Activity size={28} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                Glyco<span className="gradient-text-cyan">Pulse AI</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1px' }}>
                CLINICAL DIABETES PLATFORM
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1.15, background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Continuous Glucose Telemetry & Multi-Role Care
          </h1>

          <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Welcome to GlycoPulse AI. Connect real-time wearable sensor streams (Dexcom G7, FreeStyle Libre), AI meal recognition, lab report OCR, and 4-hour predictive trajectory modeling. Select a portal below or log in to enter.
          </p>

          {/* 1-CLICK QUICK ACCESS DEMO PORTALS */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={15} color="var(--accent-amber)" />
              <span>Instant 1-Click Portal Demo Access</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              
              {/* Patient Demo Card */}
              <div 
                onClick={() => handleQuickDemoLogin('patient')}
                className="glass-panel" 
                style={{
                  padding: '1.1rem 1.3rem', cursor: 'pointer',
                  borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={22} color="#10b981" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Patient Portal (Dinali Bhagya)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Live CGM telemetry stream, HbA1c forecast & Food AI
                    </div>
                  </div>
                </div>
                <button className="btn-glow" style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <span>Enter</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Doctor Demo Card */}
              <div 
                onClick={() => handleQuickDemoLogin('doctor')}
                className="glass-panel" 
                style={{
                  padding: '1.1rem 1.3rem', cursor: 'pointer',
                  borderLeft: '4px solid #06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stethoscope size={22} color="#06b6d4" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Doctor Console (Dr. Practitioner)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Clinical patient roster, e-prescriptions & AI risk triage
                    </div>
                  </div>
                </div>
                <button className="btn-glow" style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}>
                  <span>Enter</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Admin Demo Card */}
              <div 
                onClick={() => handleQuickDemoLogin('admin')}
                className="glass-panel" 
                style={{
                  padding: '1.1rem 1.3rem', cursor: 'pointer',
                  borderLeft: '4px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={22} color="#a855f7" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Admin Console (System Admin)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      SQL DB status engine, security audit trails & user privileges
                    </div>
                  </div>
                </div>
                <button className="btn-glow" style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                  <span>Enter</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: High-Contrast Embedded Authentication Form */}
        <div style={{
          padding: '2.2rem', borderRadius: '24px',
          background: 'linear-gradient(145deg, #0b1329 0%, #172547 100%)',
          border: `2px solid ${currentRole.color}66`,
          boxShadow: `0 25px 60px -10px ${currentRole.color}44, 0 0 30px rgba(0,0,0,0.8)`,
          color: '#ffffff'
        }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '18px',
              background: `linear-gradient(135deg, ${currentRole.color}, #2563eb)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.7rem auto', boxShadow: `0 0 25px ${currentRole.color}88`
            }}>
              <Activity size={30} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.2rem', color: '#ffffff' }}>
              Glyco<span style={{ color: currentRole.color }}>Pulse AI</span> Login
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 600 }}>
              {isSignUp ? `Create your ${currentRole.title} account` : `Sign in to ${currentRole.title}`}
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Sign Up */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
            background: '#090d1a', padding: '0.35rem', borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.15)', marginBottom: '1.4rem'
          }}>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              style={{
                padding: '0.65rem', borderRadius: '10px', border: 'none',
                background: !isSignUp ? `linear-gradient(135deg, ${currentRole.color}, #2563eb)` : 'transparent',
                color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: !isSignUp ? `0 4px 15px ${currentRole.color}55` : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setName(''); setConfirmPassword(''); }}
              style={{
                padding: '0.65rem', borderRadius: '10px', border: 'none',
                background: isSignUp ? `linear-gradient(135deg, ${currentRole.color}, #2563eb)` : 'transparent',
                color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: isSignUp ? `0 4px 15px ${currentRole.color}55` : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <UserPlus size={18} />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Role Selection Tabs */}
          {(() => {
            const visibleRoles = Object.keys(roleDetails);
            return (
              <div style={{
                display: 'grid', gridTemplateColumns: `repeat(${visibleRoles.length}, 1fr)`, gap: '0.6rem',
                background: '#090d1a', padding: '0.45rem', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.12)', marginBottom: '1.4rem'
              }}>
                {visibleRoles.map((rKey) => {
                  const r = roleDetails[rKey];
                  const IconComp = r.icon;
                  const isSelected = selectedRole === rKey;
                  return (
                    <button
                      key={rKey}
                      type="button"
                      onClick={() => handleRoleSelect(rKey)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '0.4rem', padding: '0.75rem 0.5rem', borderRadius: '12px',
                        border: isSelected ? `2px solid ${r.color}` : '1px solid transparent',
                        background: isSelected ? `${r.color}25` : '#131c35',
                        color: isSelected ? '#ffffff' : '#94a3b8',
                        boxShadow: isSelected ? `0 0 12px ${r.color}44` : 'none',
                        cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 700, fontSize: '0.82rem'
                      }}
                    >
                      <IconComp size={20} color={isSelected ? r.color : '#94a3b8'} />
                      <span style={{ color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                        {rKey.charAt(0).toUpperCase() + rKey.slice(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {/* Form Error Alert */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.6)',
              padding: '0.85rem 1rem', borderRadius: '12px', color: '#fca5a5',
              fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem'
            }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            
            {/* Full Name */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.35rem' }}>
                YOUR FULL NAME {isSignUp ? '(REQUIRED)' : '(OPTIONAL)'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', color: currentRole.color }} />
                <input
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dinali Bhagya or Dr. Kasun"
                  style={{
                    width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                    borderRadius: '12px', background: '#090d1a',
                    border: '1.5px solid rgba(255,255,255,0.2)', color: '#ffffff',
                    outline: 'none', fontSize: '0.92rem', fontWeight: 600
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.35rem' }}>
                {selectedRole.toUpperCase()} EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', color: currentRole.color }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@glucocare.ai"
                  style={{
                    width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                    borderRadius: '12px', background: '#090d1a',
                    border: '1.5px solid rgba(255,255,255,0.2)', color: '#ffffff',
                    outline: 'none', fontSize: '0.92rem', fontWeight: 600
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.35rem' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', color: currentRole.color }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                    borderRadius: '12px', background: '#090d1a',
                    border: '1.5px solid rgba(255,255,255,0.2)', color: '#ffffff',
                    outline: 'none', fontSize: '0.92rem', fontWeight: 600
                  }}
                />
              </div>
            </div>

            {/* Confirm Password for Sign Up */}
            {isSignUp && (
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.35rem' }}>
                  CONFIRM PASSWORD
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', color: currentRole.color }} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                      borderRadius: '12px', background: '#090d1a',
                      border: '1.5px solid rgba(255,255,255,0.2)', color: '#ffffff',
                      outline: 'none', fontSize: '0.92rem', fontWeight: 600
                    }}
                  />
                </div>
              </div>
            )}

            {/* Patient Specific Diagnosis */}
            {isSignUp && selectedRole === 'patient' && (
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.35rem' }}>
                  DIABETES DIAGNOSIS TYPE
                </label>
                <select
                  value={diabetesType}
                  onChange={(e) => setDiabetesType(e.target.value)}
                  style={{
                    width: '100%', padding: '0.8rem 1rem', borderRadius: '12px',
                    background: '#090d1a', border: '1.5px solid rgba(255,255,255,0.2)',
                    color: '#ffffff', outline: 'none', fontSize: '0.92rem', fontWeight: 600
                  }}
                >
                  <option value="Type 1">Type 1 Diabetes</option>
                  <option value="Type 2">Type 2 Diabetes</option>
                  <option value="Pre-diabetes">Pre-diabetes</option>
                  <option value="Gestational">Gestational Diabetes</option>
                </select>
              </div>
            )}

            {/* Admin Security Passcode */}
            {selectedRole === 'admin' && (
              <div>
                <label style={{ fontSize: '0.8rem', color: currentRole.color, fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.35rem' }}>
                  ADMIN SECURITY PASSCODE (Default: ADMIN123)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Key size={18} style={{ position: 'absolute', left: '1rem', color: currentRole.color }} />
                  <input
                    type="password"
                    value={securityKey}
                    onChange={(e) => setSecurityKey(e.target.value)}
                    placeholder="Enter ADMIN123"
                    style={{
                      width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                      borderRadius: '12px', background: '#090d1a',
                      border: `1.5px solid ${currentRole.color}`, color: '#ffffff',
                      outline: 'none', fontSize: '0.92rem', fontWeight: 600
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={connecting}
              style={{
                marginTop: '0.5rem', padding: '0.9rem', borderRadius: '14px',
                border: 'none', background: `linear-gradient(135deg, ${currentRole.color}, #2563eb)`,
                color: '#ffffff', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                boxShadow: `0 8px 25px ${currentRole.color}66`, transition: 'all 0.2s ease',
                letterSpacing: '0.5px', textTransform: 'uppercase'
              }}
            >
              {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
              <span>
                {isSignUp 
                  ? `Create ${selectedRole.toUpperCase()} Account` 
                  : `Connect to ${selectedRole.toUpperCase()} Portal`}
              </span>
            </button>

          </form>

        </div>

      </div>

      {/* Footer */}
      <footer style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <div>GlycoPulse AI - Clinical Diabetes Care Platform &copy; {new Date().getFullYear()}. All Rights Reserved.</div>
      </footer>

    </div>
  );
};
