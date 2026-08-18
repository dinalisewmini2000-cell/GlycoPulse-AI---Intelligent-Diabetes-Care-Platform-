import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { loginWithFirebase, signupWithFirebase } from '../../services/firebase';
import { 
  UserCheck, ShieldAlert, 
  Lock, Mail, LogIn, UserPlus, Activity, AlertCircle, X, User
} from 'lucide-react';

export const LoginModal = () => {
  const { authModalOpen, setAuthModalOpen, loginUser, signupUser, isAuthenticated } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [diabetesType, setDiabetesType] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen && isAuthenticated) return null;

  const roleDetails = {
    patient: {
      title: 'Diabetes Patient Portal',
      subtitle: 'Track blood sugar logs, AI risk predictions & food nutrition',
      icon: UserCheck,
      color: '#10b981',
      badge: 'Type 1 / Type 2 Care'
    },
    admin: {
      title: 'System Admin Console',
      subtitle: 'Manage platform user accounts, security audit trails & database metrics',
      icon: ShieldAlert,
      color: '#a855f7',
      badge: 'Super Admin Security'
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('+94 77 123 4567');
    setEmergencyEmail('');
    setPassword('');
    setConfirmPassword('');
    setDiabetesType('');
    setError('');
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === 'admin') {
      setIsSignUp(false);
    }
    resetForm();
  };

  const handleModeSwitch = (signUpMode) => {
    setIsSignUp(signUpMode);
    if (signUpMode && selectedRole === 'admin') {
      setSelectedRole('patient');
    }
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const activeName = name.trim() || (selectedRole === 'admin' ? 'System Administrator' : 'Dinali Bhagya');

    try {
      if (isSignUp) {
        try {
          await signupWithFirebase(email, password, activeName, selectedRole);
        } catch (e) {}

        await signupUser({
          name: activeName,
          email,
          password,
          role: selectedRole,
          diabetesType
        });
      } else {
        try {
          await loginWithFirebase(email, password);
        } catch (e) {}

        await loginUser({
          name: activeName,
          email,
          password,
          role: selectedRole
        });
      }
      setAuthModalOpen(false);
    } catch (err) {
      console.warn('[Auth Note]:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentRole = roleDetails[selectedRole] || roleDetails.patient;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 10, 24, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '460px', width: '100%', borderRadius: '16px',
        background: 'var(--bg-secondary)', border: `1px solid var(--border-color)`, padding: '1.75rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative',
        maxHeight: '90vh', overflowY: 'auto', color: 'var(--text-main)'
      }}>
        
        {/* Close Button if already authenticated */}
        {isAuthenticated && (
          <button 
            onClick={() => setAuthModalOpen(false)}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'transparent', border: 'none',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--primary-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.6rem auto'
          }}>
            <Activity size={24} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.2rem', color: 'var(--text-main)' }}>
            GlucoCare
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isSignUp ? `Register for ${currentRole.title}` : `Sign In to ${currentRole.title}`}
          </p>
        </div>

        {/* Mode Selector (Sign In vs Sign Up) */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem',
          background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '8px',
          border: '1px solid var(--border-color)', marginBottom: '1.2rem'
        }}>
          <button
            type="button"
            onClick={() => handleModeSwitch(false)}
            style={{
              padding: '0.55rem', borderRadius: '6px', border: 'none',
              background: !isSignUp ? 'var(--primary-color)' : 'transparent',
              color: !isSignUp ? '#ffffff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch(true)}
            style={{
              padding: '0.55rem', borderRadius: '6px', border: 'none',
              background: isSignUp ? 'var(--primary-color)' : 'transparent',
              color: isSignUp ? '#ffffff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}
          >
            <UserPlus size={16} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Role Selection Tabs */}
        {(() => {
          const visibleRoles = Object.keys(roleDetails);
          return (
            <div style={{
              display: 'grid', gridTemplateColumns: `repeat(${visibleRoles.length}, 1fr)`, gap: '0.5rem',
              background: 'var(--bg-primary)', padding: '0.3rem', borderRadius: '8px',
              border: '1px solid var(--border-color)', marginBottom: '1.2rem'
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
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.4rem', padding: '0.6rem', borderRadius: '6px',
                      border: 'none',
                      background: isSelected ? 'var(--primary-color)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem'
                    }}
                  >
                    <IconComp size={16} color={isSelected ? '#ffffff' : 'currentColor'} />
                    <span>{rKey.charAt(0).toUpperCase() + rKey.slice(1)}</span>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* Form Error Alert */}
        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fecaca',
            padding: '0.65rem 0.85rem', borderRadius: '6px', color: '#b91c1c',
            fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* Full Name for Sign Up */}
          {isSignUp && (
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Full Name"
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email Address"
              style={{ width: '100%' }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              style={{ width: '100%' }}
            />
          </div>

          {/* Glowing Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', marginTop: '0.4rem' }}
          >
            {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
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
