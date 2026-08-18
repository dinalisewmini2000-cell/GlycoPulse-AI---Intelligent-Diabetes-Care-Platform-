import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sun, Moon, FileText, 
  UserCheck, Stethoscope, ShieldAlert, LogOut, LogIn
} from 'lucide-react';

export const Navbar = () => {
  const { 
    role, 
    theme, toggleTheme, 
    setPdfModalOpen,
    isAuthenticated, setAuthModalOpen,
    currentUser, logoutUser
  } = useApp();

  const roleConfigs = {
    patient: { label: 'Patient View', name: 'Dinali Bhagya', icon: UserCheck, color: 'var(--accent-emerald)' },
    doctor: { label: 'Doctor Portal', name: 'Dr. Medical Practitioner', icon: Stethoscope, color: 'var(--primary-color)' },
    admin: { label: 'Admin Console', name: 'System Administrator', icon: ShieldAlert, color: 'var(--accent-purple)' }
  };

  return (
    <nav style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ 
            width: '34px', height: '34px', borderRadius: '6px', 
            background: 'var(--primary-color)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
              GlycoPulse AI
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Diabetes Telemetry & Clinical Portal
            </div>
          </div>
        </div>

        {/* Action Controls & User Profile Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              
              {/* Profile Badge */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.6rem', 
                background: 'var(--bg-primary)', padding: '0.35rem 0.75rem', 
                borderRadius: '6px', border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '4px',
                  background: 'var(--primary-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem', color: '#ffffff'
                }}>
                  {(currentUser?.name || 'Dinali Bhagya').charAt(0).toUpperCase()}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {currentUser?.name || 'Dinali Bhagya'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {roleConfigs[role]?.label || 'Patient View'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={logoutUser}
                title="Log out of session"
                className="btn-danger-outline"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>

            </div>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)} 
              className="btn-primary" 
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* Export PDF Report */}
          <button onClick={() => setPdfModalOpen(true)} className="btn-outline" style={{ fontSize: '0.82rem' }}>
            <FileText size={15} />
            <span>Export PDF Report</span>
          </button>

          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme} 
            className="btn-outline" 
            style={{ padding: '0.45rem', borderRadius: '6px' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6d28d9" />}
          </button>
        </div>

      </div>
    </nav>
  );
};
