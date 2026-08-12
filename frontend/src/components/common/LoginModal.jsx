import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { loginWithFirebase, signupWithFirebase } from '../../services/firebase';
import { 
  UserCheck, Stethoscope, HeartHandshake, ShieldAlert, 
  Lock, Mail, Key, LogIn, UserPlus, Activity, AlertCircle, X, User
} from 'lucide-react';

export const LoginModal = () => {
  const { authModalOpen, setAuthModalOpen, loginUser, signupUser, isAuthenticated } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [diabetesType, setDiabetesType] = useState('Type 2');
  const [specialty, setSpecialty] = useState('Endocrinology & Diabetology');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen && isAuthenticated) return null;

  const roleDetails = {
    patient: {
      title: 'Diabetes Patient Portal',
      subtitle: 'Track blood sugar logs, AI risk predictions & food nutrition',
      icon: UserCheck,
      color: '#10b981',
      defaultEmail: '',
      defaultPassword: '',
      badge: 'Type 1 / Type 2 Care'
    },
    doctor: {
      title: 'Clinical Doctor Portal',
      subtitle: 'Access patient telemetry rosters, sign prescriptions & AI risk alerts',
      icon: Stethoscope,
      color: '#06b6d4',
      defaultEmail: '',
      defaultPassword: '',
      badge: 'Medical Practitioner'
    },
    caregiver: {
      title: 'Family Caregiver Portal',
      subtitle: 'Monitor loved ones with live remote alerts and emergency SOS telemetry',
      icon: HeartHandshake,
      color: '#ec4899',
      defaultEmail: '',
      defaultPassword: '',
      badge: 'Remote Telemetry'
    },
    admin: {
      title: 'System Admin Console',
      subtitle: 'Manage platform user accounts, security audit trails & database metrics',
      icon: ShieldAlert,
      color: '#a855f7',
      defaultEmail: '',
      defaultPassword: '',
      badge: 'Super Admin Security'
    }
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
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

        // Call Firebase Signup
        const fbRes = await signupWithFirebase(email, password, name.trim(), selectedRole);
        if (fbRes.status === 'error') {
          throw new Error(fbRes.message || 'Firebase Sign Up failed');
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
        // Call Firebase Login
        const fbRes = await loginWithFirebase(email, password);
        if (fbRes.status === 'error') {
          throw new Error(fbRes.message || 'Firebase Authentication failed');
        }

        await loginUser({
          name: name.trim() || undefined,
          email,
          password,
          role: selectedRole
        });
      }
      setAuthModalOpen(false);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const currentRole = roleDetails[selectedRole];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 10, 24, 0.92)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '520px', width: '100%', borderRadius: '24px',
        background: 'linear-gradient(145deg, #0b1329 0%, #172547 100%)',
        border: `2px solid ${currentRole.color}66`, padding: '2.2rem',
        boxShadow: `0 25px 60px -10px ${currentRole.color}44, 0 0 30px rgba(0,0,0,0.8)`, position: 'relative',
        maxHeight: '94vh', overflowY: 'auto', color: '#ffffff'
      }}>
        
        {/* Close Button if already authenticated */}
        {isAuthenticated && (
          <button 
            onClick={() => setAuthModalOpen(false)}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              background: 'rgba(255,255,255,0.12)', border: 'none',
              borderRadius: '50%', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <X size={20} />
          </button>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '20px',
            background: `linear-gradient(135deg, ${currentRole.color}, #2563eb)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.85rem auto', boxShadow: `0 0 25px ${currentRole.color}88`
          }}>
            <Activity size={34} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.3rem', color: '#ffffff' }}>
            Glyco<span style={{ color: currentRole.color }}>Pulse AI</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 600 }}>
            {isSignUp ? `Register for ${currentRole.title}` : `Sign In to ${currentRole.title}`}
          </p>
        </div>

        {/* Mode Selector (Sign In vs Sign Up) */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
          background: '#090d1a', padding: '0.35rem', borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.15)', marginBottom: '1.4rem'
        }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); setEmail(''); setPassword(''); setConfirmPassword(''); setName(''); }}
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
            onClick={() => { setIsSignUp(true); setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setError(''); }}
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
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem',
          background: '#090d1a', padding: '0.4rem', borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.12)', marginBottom: '1.4rem'
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
                  gap: '0.35rem', padding: '0.7rem 0.2rem', borderRadius: '12px',
                  border: isSelected ? `2px solid ${r.color}` : '1px solid transparent',
                  background: isSelected ? `${r.color}25` : '#131c35',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  boxShadow: isSelected ? `0 0 12px ${r.color}44` : 'none',
                  cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 700, fontSize: '0.78rem'
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

        {/* Loading Indicator */}
        {loading && (
          <div style={{
            background: `${currentRole.color}25`, border: `1px solid ${currentRole.color}66`,
            padding: '0.85rem 1rem', borderRadius: '12px', color: '#ffffff',
            fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem'
          }}>
            <Activity className="spin-slow" size={20} color={currentRole.color} />
            <span>Authenticating with Firebase Cloud... Please wait</span>
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

        {/* High-Contrast Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Full Name for Sign Up */}
          {isSignUp && (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                FULL NAME
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={19} style={{ position: 'absolute', left: '1rem', color: currentRole.color }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alex Morgan or Sarah Jenkins"
                  style={{
                    width: '100%', padding: '0.85rem 1rem 0.85rem 2.9rem',
                    borderRadius: '12px', background: '#090d1a',
                    border: '1.5px solid rgba(255,255,255,0.2)', color: '#ffffff',
                    outline: 'none', fontSize: '0.95rem', fontWeight: 600
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
              {selectedRole.toUpperCase()} EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={19} style={{ position: 'absolute', left: '1rem', color: currentRole.color }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@glucocare.ai"
                style={{
                  width: '100%', padding: '0.85rem 1rem 0.85rem 2.9rem',
                  borderRadius: '12px', background: '#090d1a',
                  border: '1.5px solid rgba(255,255,255,0.2)', color: '#ffffff',
                  outline: 'none', fontSize: '0.95rem', fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={19} style={{ position: 'absolute', left: '1rem', color: currentRole.color }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%', padding: '0.85rem 1rem 0.85rem 2.9rem',
                  borderRadius: '12px', background: '#090d1a',
                  border: '1.5px solid rgba(255,255,255,0.2)', color: '#ffffff',
                  outline: 'none', fontSize: '0.95rem', fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* Confirm Password for Sign Up */}
          {isSignUp && (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                CONFIRM PASSWORD
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={19} style={{ position: 'absolute', left: '1rem', color: currentRole.color }} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%', padding: '0.85rem 1rem 0.85rem 2.9rem',
                    borderRadius: '12px', background: '#090d1a',
                    border: '1.5px solid rgba(255,255,255,0.2)', color: '#ffffff',
                    outline: 'none', fontSize: '0.95rem', fontWeight: 600
                  }}
                />
              </div>
            </div>
          )}

          {/* Role Specific Registration Info */}
          {isSignUp && selectedRole === 'patient' && (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                DIABETES DIAGNOSIS TYPE
              </label>
              <select
                value={diabetesType}
                onChange={(e) => setDiabetesType(e.target.value)}
                style={{
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
                  background: '#090d1a', border: '1.5px solid rgba(255,255,255,0.2)',
                  color: '#ffffff', outline: 'none', fontSize: '0.95rem', fontWeight: 600
                }}
              >
                <option value="Type 1">Type 1 Diabetes</option>
                <option value="Type 2">Type 2 Diabetes</option>
                <option value="Pre-diabetes">Pre-diabetes</option>
                <option value="Gestational">Gestational Diabetes</option>
              </select>
            </div>
          )}

          {isSignUp && selectedRole === 'doctor' && (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                MEDICAL SPECIALTY
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Endocrinology & Diabetology"
                style={{
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
                  background: '#090d1a', border: '1.5px solid rgba(255,255,255,0.2)',
                  color: '#ffffff', outline: 'none', fontSize: '0.95rem', fontWeight: 600
                }}
              />
            </div>
          )}

          {/* Admin Specific Passcode */}
          {selectedRole === 'admin' && (
            <div>
              <label style={{ fontSize: '0.8rem', color: currentRole.color, fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                ADMIN SECURITY PASSCODE (Default: ADMIN123)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Key size={19} style={{ position: 'absolute', left: '1rem', color: currentRole.color }} />
                <input
                  type="password"
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  placeholder="Enter ADMIN123"
                  style={{
                    width: '100%', padding: '0.85rem 1rem 0.85rem 2.9rem',
                    borderRadius: '12px', background: '#090d1a',
                    border: `1.5px solid ${currentRole.color}`, color: '#ffffff',
                    outline: 'none', fontSize: '0.95rem', fontWeight: 600
                  }}
                />
              </div>
            </div>
          )}

          {/* Glowing Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.6rem', padding: '0.95rem', borderRadius: '14px',
              border: 'none', background: `linear-gradient(135deg, ${currentRole.color}, #2563eb)`,
              color: '#ffffff', fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              boxShadow: `0 8px 25px ${currentRole.color}66`, transition: 'all 0.2s ease',
              letterSpacing: '0.5px', textTransform: 'uppercase'
            }}
          >
            {isSignUp ? <UserPlus size={22} /> : <LogIn size={22} />}
            <span>
              {loading 
                ? 'Authenticating...' 
                : isSignUp 
                  ? `Create ${selectedRole.toUpperCase()} Account` 
                  : `Sign In as ${selectedRole.toUpperCase()}`}
            </span>
          </button>
        </form>

      </div>
    </div>
  );
};
