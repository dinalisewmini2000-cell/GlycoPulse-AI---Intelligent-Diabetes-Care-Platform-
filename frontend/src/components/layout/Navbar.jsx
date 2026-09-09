import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sun, Moon, FileText, 
  LogOut, LogIn, UserPlus, User, ShieldAlert
} from 'lucide-react';

export const Navbar = () => {
  const { 
    theme, toggleTheme, 
    setPdfModalOpen, setEmergencyModalOpen,
    isAuthenticated, setAuthModalOpen, openAuthModal,
    currentUser, logoutUser
  } = useApp();

  return (
    <header style={{ 
      background: 'var(--bg-secondary)', 
      borderBottom: '1px solid var(--border-color)', 
      padding: '0.65rem 1.5rem', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Brand Logo & Platform Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'var(--primary-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={20} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              GlucoCare
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '-2px' }}>
              Diabetes Clinical Portal
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Sign In button for unauthenticated state */}
          {!isAuthenticated && (
            <button 
              onClick={() => openAuthModal('signin')} 
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.84rem', fontWeight: 700,
                padding: '0.45rem 1rem', borderRadius: '20px',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* User Profile Chip if Authenticated */}
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              
              {/* Patient Avatar & Profile Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', background: '#f8fafc', padding: '0.35rem 0.75rem 0.35rem 0.45rem', borderRadius: '25px', border: '1px solid #e2e8f0' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem', color: '#ffffff',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                }}>
                  <User size={16} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                    {currentUser?.name || 'Patient'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                    {currentUser?.email || ''}
                  </span>
                </div>
              </div>

              {/* Clean Subtle Sign Out */}
              <button 
                onClick={logoutUser}
                title="Sign out of your account"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            </div>
          )}

          {/* Export Report Pill Button */}
          <button 
            onClick={() => setPdfModalOpen(true)} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: '#ffffff', border: '1px solid #cbd5e1',
              color: '#334155', fontSize: '0.82rem', fontWeight: 700,
              padding: '0.45rem 0.95rem', borderRadius: '20px',
              cursor: 'pointer', transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0284c7'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
          >
            <FileText size={15} color="#0284c7" />
            <span>Export Report</span>
          </button>

          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme} 
            style={{ 
              background: '#ffffff', border: '1px solid #cbd5e1', 
              padding: '0.45rem', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6d28d9" />}
          </button>

        </div>

      </div>
    </header>
  );
};
