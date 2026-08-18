import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sun, Moon, FileText, 
  LogOut, LogIn, User
} from 'lucide-react';

export const Navbar = () => {
  const { 
    theme, toggleTheme, 
    setPdfModalOpen,
    isAuthenticated, setAuthModalOpen,
    currentUser, logoutUser
  } = useApp();

  return (
    <header style={{ 
      background: 'var(--bg-secondary)', 
      borderBottom: '1px solid var(--border-color)', 
      padding: '0.65rem 1.5rem', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Brand Logo & Portal Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '4px', 
            background: 'var(--primary-color)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={18} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
              GlucoCare
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
              Patient Portal
            </span>
          </div>
        </div>

        {/* User Account Bar & Subtle Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              
              {/* Account Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)} 
              className="btn-primary" 
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
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
