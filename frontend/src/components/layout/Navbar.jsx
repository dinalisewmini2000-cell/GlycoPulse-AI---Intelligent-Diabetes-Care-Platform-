import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sun, Moon, FileText, 
  LogOut, LogIn
} from 'lucide-react';

export const Navbar = () => {
  const { 
    role, 
    theme, toggleTheme, 
    setPdfModalOpen,
    isAuthenticated, setAuthModalOpen,
    currentUser, logoutUser
  } = useApp();

  return (
    <nav style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '6px', 
            background: 'var(--primary-color)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
              GlucoCare
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Diabetes Management Portal
            </div>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              
              {/* User Badge */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                background: 'var(--bg-primary)', padding: '0.3rem 0.65rem', 
                borderRadius: '6px', border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '4px',
                  background: role === 'admin' ? 'var(--accent-purple)' : 'var(--primary-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.75rem', color: '#ffffff'
                }}>
                  {(currentUser?.name || 'Dinali Bhagya').charAt(0).toUpperCase()}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                    {currentUser?.name || 'Dinali Bhagya'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    PATIENT PORTAL
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={logoutUser}
                title="Log out of session"
                className="btn-danger-outline"
                style={{ padding: '0.35rem 0.65rem' }}
              >
                <LogOut size={13} />
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
          <button onClick={() => setPdfModalOpen(true)} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            <FileText size={14} />
            <span>Export Report</span>
          </button>

          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme} 
            className="btn-outline" 
            style={{ padding: '0.4rem', borderRadius: '6px' }}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6d28d9" />}
          </button>
        </div>

      </div>
    </nav>
  );
};
