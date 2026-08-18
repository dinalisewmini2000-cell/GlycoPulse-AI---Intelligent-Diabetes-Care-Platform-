import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, UserCheck, Stethoscope, ShieldAlert, Mail, User, UserPlus, LogIn, Key, AlertCircle, ArrowRight
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
  const [connectingStatus, setConnectingStatus] = useState('Initializing authentication...');
  const [error, setError] = useState('');

  const roleDetails = {
    patient: {
      title: 'Patient Portal',
      subtitle: 'Track blood glucose readings, log meal carbs, view TIR & AI trajectories',
      icon: UserCheck,
      defaultEmail: 'kasun@glucocare.ai',
      defaultPassword: 'password123'
    },
    doctor: {
      title: 'Doctor Portal',
      subtitle: 'Review patient telemetry roster, manage appointments & issue e-prescriptions',
      icon: Stethoscope,
      defaultEmail: 'kasun.doc@glucocare.ai',
      defaultPassword: 'password123'
    },
    admin: {
      title: 'System Admin Console',
      subtitle: 'Manage user access permissions, monitor database connections & system logs',
      icon: ShieldAlert,
      defaultEmail: 'admin@glucocare.ai',
      defaultPassword: 'admin123'
    }
  };

  const startConnectingSequence = async (authAction) => {
    setConnecting(true);
    setConnectingProgress(25);
    setConnectingStatus('Connecting to GlycoPulse backend service...');
    
    await new Promise(r => setTimeout(r, 200));
    setConnectingProgress(65);
    setConnectingStatus('Verifying credentials & session state...');

    await new Promise(r => setTimeout(r, 200));
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
    <div style={{ width: '100%', minHeight: 'calc(100vh - 60px)', background: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* CONNECTING OVERLAY */}
      {connecting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 9999, background: 'rgba(15, 23, 42, 0.85)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#ffffff', padding: '2rem'
        }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            GlycoPulse AI
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.2rem', textAlign: 'center' }}>
            {connectingStatus}
          </div>
          <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ height: '100%', width: `${connectingProgress}%`, background: 'var(--primary-color)', transition: 'width 0.2s ease' }}></div>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Project Introduction & Role Entry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              GlycoPulse AI
            </h1>
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
              Diabetes Management & Telemetry System
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              GlycoPulse AI provides continuous blood glucose telemetry monitoring, meal nutrition logging, lab report analysis, and clinical consultation management for patients and medical practitioners.
            </p>
          </div>

          {/* Quick Role Selection */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem' }}>
              Select Portal Access
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* Patient Demo */}
              <div 
                onClick={() => handleQuickDemoLogin('patient')}
                className="glass-card" 
                style={{
                  padding: '0.9rem 1.1rem', cursor: 'pointer',
                  borderLeft: '3px solid var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <UserCheck size={20} color="var(--accent-emerald)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Patient Portal
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      View glucose logs, food recognition, & health assistant
                    </div>
                  </div>
                </div>
                <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                  <span>Enter</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Doctor Demo */}
              <div 
                onClick={() => handleQuickDemoLogin('doctor')}
                className="glass-card" 
                style={{
                  padding: '0.9rem 1.1rem', cursor: 'pointer',
                  borderLeft: '3px solid var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Stethoscope size={20} color="var(--primary-color)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Doctor Portal
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Monitor patient roster, appointments & e-prescriptions
                    </div>
                  </div>
                </div>
                <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                  <span>Enter</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Admin Demo */}
              <div 
                onClick={() => handleQuickDemoLogin('admin')}
                className="glass-card" 
                style={{
                  padding: '0.9rem 1.1rem', cursor: 'pointer',
                  borderLeft: '3px solid var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShieldAlert size={20} color="var(--accent-purple)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Admin Console
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      System telemetry, user accounts & database state
                    </div>
                  </div>
                </div>
                <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                  <span>Enter</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Authentication Form */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '8px' }}>
          
          <div style={{ marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              {isSignUp ? `Sign Up for ${currentRole.title}` : `Sign In to ${currentRole.title}`}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Select your role below to authenticate into the system.
            </p>
          </div>

          {/* Sign In vs Sign Up Tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem',
            background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '6px',
            border: '1px solid var(--border-color)', marginBottom: '1rem'
          }}>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              style={{
                padding: '0.45rem', borderRadius: '4px', border: 'none',
                background: !isSignUp ? 'var(--primary-color)' : 'transparent',
                color: !isSignUp ? '#ffffff' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
              }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setName(''); setConfirmPassword(''); }}
              style={{
                padding: '0.45rem', borderRadius: '4px', border: 'none',
                background: isSignUp ? 'var(--primary-color)' : 'transparent',
                color: isSignUp ? '#ffffff' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
              }}
            >
              <UserPlus size={14} />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Role Selection Tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem',
            marginBottom: '1.2rem'
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.35rem', padding: '0.5rem 0.3rem', borderRadius: '6px',
                    border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    color: isSelected ? 'var(--primary-color)' : 'var(--text-muted)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem'
                  }}
                >
                  <IconComp size={15} />
                  <span>{rKey.charAt(0).toUpperCase() + rKey.slice(1)}</span>
                </button>
              );
            })}
          </div>

          {/* Form Error Alert */}
          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fecaca',
              padding: '0.65rem 0.85rem', borderRadius: '6px', color: '#b91c1c',
              fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            {/* Full Name */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Full Name {isSignUp ? '(Required)' : '(Optional)'}
              </label>
              <input
                type="text"
                required={isSignUp}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dinali Bhagya"
                style={{ width: '100%' }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@glucocare.ai"
                style={{ width: '100%' }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%' }}
              />
            </div>

            {/* Confirm Password for Sign Up */}
            {isSignUp && (
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {/* Patient Specific Diagnosis */}
            {isSignUp && selectedRole === 'patient' && (
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Diabetes Diagnosis Type
                </label>
                <select
                  value={diabetesType}
                  onChange={(e) => setDiabetesType(e.target.value)}
                  style={{ width: '100%' }}
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
                <label style={{ fontSize: '0.78rem', color: 'var(--accent-purple)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Admin Passcode (Default: ADMIN123)
                </label>
                <input
                  type="password"
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  placeholder="Enter ADMIN123"
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={connecting}
              className="btn-primary"
              style={{
                marginTop: '0.3rem', padding: '0.65rem', borderRadius: '6px',
                justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, width: '100%'
              }}
            >
              {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
              <span>
                {isSignUp 
                  ? `Create ${selectedRole.toUpperCase()} Account` 
                  : `Sign In to ${selectedRole.toUpperCase()} Portal`}
              </span>
            </button>

          </form>

        </div>

      </div>

      {/* Footer */}
      <footer style={{ padding: '1.2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <div>GlycoPulse AI — Diabetes Management Platform &copy; {new Date().getFullYear()}</div>
      </footer>

    </div>
  );
};
