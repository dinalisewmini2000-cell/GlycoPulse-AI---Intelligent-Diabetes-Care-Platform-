import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sun, Moon, FileText, 
  LogOut, LogIn, UserPlus, User
} from 'lucide-react';

export const Navbar = () => {
  const { 
    theme, toggleTheme, 
    setPdfModalOpen,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* Sign In button for unauthenticated state */}
          {!isAuthenticated && (
            <button 
              onClick={() => openAuthModal('signin')} 
              className="btn-outline" 
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', background: 'transparent' }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}

          {/* User Profile Chip & Sign Out if Authenticated */}
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.35rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: '0.75rem', color: 'var(--primary-color)'
                }}>
                  <User size={14} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.1 }}>
                    {currentUser?.name || 'Patient'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '0.3rem 0.5rem',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <LogOut size={14} />
                <span>Sign out</span>
              </button>
            </div>
          )}

          {/* Export Report */}
          <button 
            onClick={() => setPdfModalOpen(true)} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: 'transparent', border: '1px solid var(--border-color)',
              color: 'var(--text-main)', fontSize: '0.8rem', padding: '0.35rem 0.65rem',
              borderRadius: '4px', cursor: 'pointer'
            }}
          >
            <FileText size={14} />
            <span>Export Report</span>
          </button>

          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme} 
            style={{ 
              background: 'transparent', border: '1px solid var(--border-color)', 
              padding: '0.35rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' 
            }}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#6d28d9" />}
          </button>

        </div>

      </div>
    </header>
  );
};
