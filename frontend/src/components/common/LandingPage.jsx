import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sparkles, Brain, Radio, Utensils, 
  FileSpreadsheet, UserCheck, Stethoscope, 
  ShieldAlert, Mail, User, UserPlus, LogIn, Key, AlertCircle, Heart, Lock
} from 'lucide-react';

export const LandingPage = () => {
  const { loginUser, signupUser } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('dinali@glucocare.ai');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [password, setPassword] = useState('password123');
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
      defaultEmail: 'kasun@glucocare.ai',
      defaultPassword: 'password123'
    },
    doctor: {
      title: 'Clinical Doctor Portal',
      subtitle: 'Access patient telemetry rosters, sign prescriptions & AI risk alerts',
      icon: Stethoscope,
      color: '#06b6d4',
      defaultEmail: 'kasun.doc@glucocare.ai',
      defaultPassword: 'password123'
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
          phone,
          emergencyEmail: emergencyEmail || email,
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

        </div>

        {/* RIGHT COLUMN: High-Contrast Vibrant Embedded Form */}
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
              Glyco<span style={{ color: currentRole.color }}>Pulse AI</span> Portal Access
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
            const visibleRoles = Object.keys(roleDetails).filter((rKey) => !isSignUp || rKey !== 'admin');
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

          {/* Loading Banner */}
          {loading && (
            <div style={{
              background: `${currentRole.color}25`, border: `1px solid ${currentRole.color}66`,
              padding: '0.85rem 1rem', borderRadius: '12px', color: '#ffffff',
              fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem'
            }}>
              <Activity className="spin-slow" size={20} color={currentRole.color} />
              <span>Authenticating with SQL Database... Please wait</span>
            </div>
          )}

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
                  placeholder="e.g. Sarah Jenkins or Alex Vance"
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
              disabled={loading}
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
        <div>GlycoPulse AI - Clinical Diabetes Care Platform &copy; {new Date().getFullYear()}. All Rights Reserved.</div>
      </footer>

    </div>
  );
};
