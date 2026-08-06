import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sparkles, Brain, ShieldCheck, Heart, Users, Radio, Utensils, 
  FileSpreadsheet, Award, ArrowRight, CheckCircle2, Lock, UserCheck, Stethoscope, 
  ShieldAlert, Mail, User, UserPlus, LogIn, Key, AlertCircle 
} from 'lucide-react';

export const LandingPage = () => {
  const { loginUser, signupUser } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('patient@glucocare.ai');
  const [password, setPassword] = useState('patient123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [diabetesType, setDiabetesType] = useState('Type 2');
  const [specialty, setSpecialty] = useState('Endocrinology & Diabetology');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleDetails = {
    patient: {
      title: 'Diabetes Patient Portal',
      subtitle: 'Track blood sugar logs, AI risk predictions & food nutrition',
      icon: UserCheck,
      color: '#10b981',
      defaultEmail: 'patient@glucocare.ai',
      defaultPassword: 'patient123'
    },
    doctor: {
      title: 'Clinical Doctor Portal',
      subtitle: 'Access patient telemetry rosters, sign prescriptions & AI risk alerts',
      icon: Stethoscope,
      color: '#06b6d4',
      defaultEmail: 'doctor@glucocare.ai',
      defaultPassword: 'doctor123'
    },
    caregiver: {
      title: 'Family Caregiver Portal',
      subtitle: 'Monitor loved ones with live remote alerts and emergency SOS telemetry',
      icon: Heart,
      color: '#ec4899',
      defaultEmail: 'caregiver@glucocare.ai',
      defaultPassword: 'caregiver123'
    },
    admin: {
      title: 'System Admin Console',
      subtitle: 'Manage platform user accounts, security audit trails & database metrics',
      icon: ShieldAlert,
      color: '#a855f7',
      defaultEmail: 'admin@glucocare.ai',
      defaultPassword: 'admin123'
    }
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
    setLoading(true);
    setError('');

    try {
      if (selectedRole === 'admin' && securityKey && securityKey !== 'ADMIN123' && securityKey !== 'admin') {
        throw new Error('Invalid Admin Security Passcode. Use "ADMIN123"');
      }

      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (password !== confirmPassword && confirmPassword) {
          throw new Error('Passwords do not match');
        }

        await signupUser({
          name: name.trim(),
          email,
          password,
          role: selectedRole,
          diabetesType,
          specialty
        });
      } else {
        await loginUser({
          name: name.trim() || undefined,
          email,
          password,
          role: selectedRole
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleKey) => {
    setIsSignUp(false);
    setSelectedRole(roleKey);
    setEmail(roleDetails[roleKey].defaultEmail);
    setPassword(roleDetails[roleKey].defaultPassword);
    loginUser({
      email: roleDetails[roleKey].defaultEmail,
      password: roleDetails[roleKey].defaultPassword,
      role: roleKey
    });
  };

  const currentRole = roleDetails[selectedRole];

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', background: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Main Split-Screen Section */}
      <div style={{ maxWidth: '1450px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
        
        {/* LEFT COLUMN: Brand Showcase & Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="badge badge-info" style={{ display: 'inline-flex', padding: '0.45rem 1rem', borderRadius: '30px', fontSize: '0.82rem', width: 'fit-content' }}>
            <Sparkles size={15} />
            <span>Next-Generation AI Clinical Diabetes Care Engine</span>
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.15, background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Intelligent Continuous Glucose Telemetry & Multi-Role Care
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            GlycoPulse AI connects real-time wearable sensor streams (Dexcom G7, FreeStyle Libre), computer vision meal recognition, lab OCR parsing, and 4-hour predictive trajectory modeling for Patients, Endocrinologists, Caregivers, and Health Admins.
          </p>

          {/* Quick Feature Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            
            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Radio size={18} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>5s Live CGM Stream</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Real-time sensor rate-of-change & trend arrows</p>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-purple)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Brain size={18} color="var(--accent-purple)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>4h AI Trajectory</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Forward 240m glucose forecasting & hypo alerts</p>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-emerald)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Utensils size={18} color="var(--accent-emerald)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Vision Food AI</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Photo meal scanning & macro carbohydrate estimation</p>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-amber)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <FileSpreadsheet size={18} color="var(--accent-amber)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Clinical Lab OCR</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Automated PDF blood report biomarker parser</p>
            </div>

          </div>

          {/* 1-Click Instant Demo Access */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ OR TEST INSTANT DEMO ACCESS IN ONE CLICK:
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleQuickDemo('patient')} className="btn-outline" style={{ fontSize: '0.8rem', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                <UserCheck size={15} />
                <span>Patient Demo</span>
              </button>
              <button onClick={() => handleQuickDemo('doctor')} className="btn-outline" style={{ fontSize: '0.8rem', color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)' }}>
                <Stethoscope size={15} />
                <span>Doctor Demo</span>
              </button>
              <button onClick={() => handleQuickDemo('caregiver')} className="btn-outline" style={{ fontSize: '0.8rem', color: '#ec4899', borderColor: 'rgba(236,72,153,0.3)' }}>
                <Heart size={15} />
                <span>Caregiver Demo</span>
              </button>
              <button onClick={() => handleQuickDemo('admin')} className="btn-outline" style={{ fontSize: '0.8rem', color: '#a855f7', borderColor: 'rgba(168,85,247,0.3)' }}>
                <ShieldAlert size={15} />
                <span>Admin Demo</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Embedded Sign In & Sign Up Form */}
        <div className="glass-panel card-3d-glow" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: `linear-gradient(135deg, ${currentRole.color}, #3b82f6)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.6rem auto', boxShadow: `0 0 20px ${currentRole.color}66`
            }}>
              <Activity size={28} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>
              Glyco<span className="gradient-text-cyan">Pulse AI</span> Access Portal
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isSignUp ? 'Create your medical account to get started' : 'Sign in to access your telemetry health dashboard'}
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Sign Up */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
            background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.2rem'
          }}>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              style={{
                padding: '0.55rem', borderRadius: '9px', border: 'none',
                background: !isSignUp ? 'var(--bg-secondary)' : 'transparent',
                color: !isSignUp ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontWeight: !isSignUp ? 700 : 500, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
              }}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setName(''); setConfirmPassword(''); }}
              style={{
                padding: '0.55rem', borderRadius: '9px', border: 'none',
                background: isSignUp ? 'var(--bg-secondary)' : 'transparent',
                color: isSignUp ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontWeight: isSignUp ? 700 : 500, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
              }}
            >
              <UserPlus size={16} />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Role Selection Tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem',
            background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.2rem'
          }}>
            {Object.keys(roleDetails).map((rKey) => {
              const r = roleDetails[rKey];
              const IconComp = r.icon;
              const isSelected = selectedRole === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => handleRoleSelect(rKey)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '0.3rem', padding: '0.55rem 0.2rem', borderRadius: '10px',
                    border: isSelected ? `1px solid ${r.color}66` : '1px solid transparent',
                    background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: isSelected ? r.color : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 600, fontSize: '0.75rem'
                  }}
                >
                  <IconComp size={16} />
                  <span>{rKey.charAt(0).toUpperCase() + rKey.slice(1)}</span>
                </button>
              );
            })}
          </div>

          {/* Form Error Alert */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '0.75rem 1rem', borderRadius: '12px', color: '#fca5a5',
              fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            {/* Full Name (Available for Sign Up AND Sign In if desired) */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                YOUR FULL NAME {isSignUp ? '(REQUIRED)' : '(OPTIONAL)'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={17} style={{ position: 'absolute', left: '0.9rem', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins or Alex Vance"
                  style={{
                    width: '100%', padding: '0.7rem 0.9rem 0.7rem 2.6rem',
                    borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)',
                    outline: 'none', fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                {selectedRole.toUpperCase()} EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={17} style={{ position: 'absolute', left: '0.9rem', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@glucocare.ai"
                  style={{
                    width: '100%', padding: '0.7rem 0.9rem 0.7rem 2.6rem',
                    borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)',
                    outline: 'none', fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={17} style={{ position: 'absolute', left: '0.9rem', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%', padding: '0.7rem 0.9rem 0.7rem 2.6rem',
                    borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)',
                    outline: 'none', fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            {/* Confirm Password for Sign Up */}
            {isSignUp && (
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  CONFIRM PASSWORD
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '0.9rem', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%', padding: '0.7rem 0.9rem 0.7rem 2.6rem',
                      borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)',
                      outline: 'none', fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Patient Specific Diagnosis */}
            {isSignUp && selectedRole === 'patient' && (
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  DIABETES DIAGNOSIS TYPE
                </label>
                <select
                  value={diabetesType}
                  onChange={(e) => setDiabetesType(e.target.value)}
                  style={{
                    width: '100%', padding: '0.7rem 0.9rem', borderRadius: '12px',
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-main)', outline: 'none', fontSize: '0.88rem'
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
                <label style={{ fontSize: '0.78rem', color: currentRole.color, fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  ADMIN SECURITY PASSCODE (Default: ADMIN123)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Key size={17} style={{ position: 'absolute', left: '0.9rem', color: currentRole.color }} />
                  <input
                    type="password"
                    value={securityKey}
                    onChange={(e) => setSecurityKey(e.target.value)}
                    placeholder="Enter ADMIN123"
                    style={{
                      width: '100%', padding: '0.7rem 0.9rem 0.7rem 2.6rem',
                      borderRadius: '12px', background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${currentRole.color}66`, color: 'var(--text-main)',
                      outline: 'none', fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.4rem', padding: '0.8rem', borderRadius: '12px',
                border: 'none', background: `linear-gradient(135deg, ${currentRole.color}, #3b82f6)`,
                color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: `0 8px 20px ${currentRole.color}44`, transition: 'all 0.2s ease'
              }}
            >
              {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
              <span>
                {loading 
                  ? 'Authenticating...' 
                  : isSignUp 
                    ? `Create ${selectedRole.toUpperCase()} Account` 
                    : `Sign In to ${selectedRole.toUpperCase()} Portal`}
              </span>
            </button>

          </form>

        </div>

      </div>

      {/* Footer */}
      <footer style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <div>GlycoPulse AI - Clinical Diabetes Care Platform &copy; 2026. All Rights Reserved.</div>
      </footer>

    </div>
  );
};
