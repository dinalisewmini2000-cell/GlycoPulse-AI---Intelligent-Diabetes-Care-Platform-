import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserCheck, Stethoscope, HeartHandshake, ShieldAlert, 
  Lock, Mail, Key, LogIn, UserPlus, Activity, CheckCircle, AlertCircle, X, User
} from 'lucide-react';

export const LoginModal = () => {
  const { authModalOpen, setAuthModalOpen, loginUser, signupUser, isAuthenticated } = useApp();

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

  if (!authModalOpen && isAuthenticated) return null;

  const roleDetails = {
    patient: {
      title: 'Diabetes Patient Portal',
      subtitle: 'Track blood sugar logs, AI risk predictions & food nutrition',
      icon: UserCheck,
      color: '#10b981',
      defaultEmail: 'patient@glucocare.ai',
      defaultPassword: 'patient123',
      badge: 'Type 1 / Type 2 Care'
    },
    doctor: {
      title: 'Clinical Doctor Portal',
      subtitle: 'Access patient telemetry rosters, sign prescriptions & AI risk alerts',
      icon: Stethoscope,
      color: '#06b6d4',
      defaultEmail: 'doctor@glucocare.ai',
      defaultPassword: 'doctor123',
      badge: 'Medical Practitioner'
    },
    caregiver: {
      title: 'Family Caregiver Portal',
      subtitle: 'Monitor loved ones with live remote alerts and emergency SOS telemetry',
      icon: HeartHandshake,
      color: '#ec4899',
      defaultEmail: 'caregiver@glucocare.ai',
      defaultPassword: 'caregiver123',
      badge: 'Remote Telemetry'
    },
    admin: {
      title: 'System Admin Console',
      subtitle: 'Manage platform user accounts, security audit trails & database metrics',
      icon: ShieldAlert,
      color: '#a855f7',
      defaultEmail: 'admin@glucocare.ai',
      defaultPassword: 'admin123',
      badge: 'Super Admin Security'
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
          name,
          email,
          password,
          role: selectedRole,
          diabetesType,
          specialty
        });
      } else {
        await loginUser({
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

  const handleQuickDemoLogin = (roleKey) => {
    setIsSignUp(false);
    setSelectedRole(roleKey);
    setEmail(roleDetails[roleKey].defaultEmail);
    setPassword(roleDetails[roleKey].defaultPassword);
    loginUser({
      email: roleDetails[roleKey].defaultEmail,
      password: roleDetails[roleKey].defaultPassword,
      role: roleKey
    });
    setAuthModalOpen(false);
  };

  const currentRole = roleDetails[selectedRole];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 10, 24, 0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      overflowY: 'auto'
    }}>
      <div className="glass-panel card-3d-glow" style={{
        maxWidth: '540px', width: '100%', borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.12)', padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', position: 'relative',
        maxHeight: '92vh', overflowY: 'auto'
      }}>
        
        {/* Close Button if already authenticated */}
        {isAuthenticated && (
          <button 
            onClick={() => setAuthModalOpen(false)}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              background: 'rgba(255,255,255,0.08)', border: 'none',
              borderRadius: '50%', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '18px',
            background: `linear-gradient(135deg, ${currentRole.color}, #3b82f6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem auto', boxShadow: `0 0 20px ${currentRole.color}66`
          }}>
            <Activity size={32} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.2rem' }}>
            Glyco<span className="gradient-text-cyan">Pulse AI</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isSignUp ? 'Create your medical account' : 'Sign in to access your health portal'}
          </p>
        </div>

        {/* Mode Selector (Sign In vs Sign Up) */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
          background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem'
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
            <span>Existing User (Sign In)</span>
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
            <span>New User (Sign Up)</span>
          </button>
        </div>

        {/* Role Selection Tabs */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem',
          background: 'rgba(0,0,0,0.3)', padding: '0.35rem', borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem'
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
                  gap: '0.35rem', padding: '0.6rem 0.25rem', borderRadius: '10px',
                  border: isSelected ? `1px solid ${r.color}66` : '1px solid transparent',
                  background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isSelected ? r.color : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 600, fontSize: '0.75rem'
                }}
              >
                <IconComp size={18} />
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

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          
          {/* Full Name for Sign Up */}
          {isSignUp && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                FULL NAME
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alex Morgan or Sarah Jenkins"
                  style={{
                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem',
                    borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)',
                    outline: 'none', fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              {selectedRole.toUpperCase()} EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@glucocare.ai"
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem',
                  borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)',
                  outline: 'none', fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem',
                  borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)',
                  outline: 'none', fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Confirm Password for Sign Up */}
          {isSignUp && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                CONFIRM PASSWORD
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem',
                    borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)',
                    outline: 'none', fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* Role Specific Registration Info */}
          {isSignUp && selectedRole === 'patient' && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                DIABETES DIAGNOSIS TYPE
              </label>
              <select
                value={diabetesType}
                onChange={(e) => setDiabetesType(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem'
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
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                MEDICAL SPECIALTY
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Endocrinology & Diabetology"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem'
                }}
              />
            </div>
          )}

          {/* Admin Specific Passcode */}
          {selectedRole === 'admin' && (
            <div>
              <label style={{ fontSize: '0.8rem', color: currentRole.color, fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
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
                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem',
                    borderRadius: '12px', background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${currentRole.color}66`, color: 'var(--text-main)',
                    outline: 'none', fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem', padding: '0.85rem', borderRadius: '12px',
              border: 'none', background: `linear-gradient(135deg, ${currentRole.color}, #3b82f6)`,
              color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: `0 8px 20px ${currentRole.color}44`, transition: 'all 0.2s ease'
            }}
          >
            {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
            <span>
              {loading 
                ? 'Processing...' 
                : isSignUp 
                  ? `Create ${selectedRole.toUpperCase()} Account` 
                  : `Sign In as ${selectedRole.toUpperCase()}`}
            </span>
          </button>
        </form>

        {/* Quick Demo Switchers */}
        {!isSignUp && (
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.65rem', fontWeight: 600 }}>
              ⚡ INSTANT DEMO ONE-CLICK LOGIN:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('patient')}
                className="btn-outline"
                style={{ fontSize: '0.78rem', justifyContent: 'center', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}
              >
                Demo Patient
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('doctor')}
                className="btn-outline"
                style={{ fontSize: '0.78rem', justifyContent: 'center', color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)' }}
              >
                Demo Doctor
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('caregiver')}
                className="btn-outline"
                style={{ fontSize: '0.78rem', justifyContent: 'center', color: '#ec4899', borderColor: 'rgba(236,72,153,0.3)' }}
              >
                Demo Caregiver
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="btn-outline"
                style={{ fontSize: '0.78rem', justifyContent: 'center', color: '#a855f7', borderColor: 'rgba(168,85,247,0.3)' }}
              >
                Demo Admin
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
