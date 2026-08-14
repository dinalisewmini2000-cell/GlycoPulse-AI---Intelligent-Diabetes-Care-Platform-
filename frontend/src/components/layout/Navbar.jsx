import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sun, Moon, FileText, 
  UserCheck, Stethoscope, HeartHandshake, ShieldAlert, LogOut, LogIn
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
    patient: { label: 'Patient View', name: 'Dinali Bhagya', icon: UserCheck, color: '#10b981' },
    doctor: { label: 'Doctor Portal', name: 'Dr. Medical Practitioner', icon: Stethoscope, color: '#06b6d4' },
    caregiver: { label: 'Caregiver Portal', name: 'Family Caregiver', icon: HeartHandshake, color: '#ec4899' },
    admin: { label: 'Admin Dashboard', name: 'System Administrator', icon: ShieldAlert, color: '#a855f7' }
  };

  return (
    <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.8rem 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ 
            width: '42px', height: '42px', borderRadius: '12px', 
            background: 'linear-gradient(135deg, #06b6d4, #10b981)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' 
          }}>
            <Activity size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Glyco<span className="gradient-text-cyan">Pulse AI</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              AI DIABETES CARE PLATFORM
            </div>
          </div>
        </div>

        {/* Active Role Indicator (Static Portal Badge) */}
        {isAuthenticated && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1.1rem', borderRadius: '14px',
              border: `1.5px solid ${roleConfigs[role]?.color || '#10b981'}66`,
              boxShadow: `0 0 15px ${roleConfigs[role]?.color || '#10b981'}22`,
              color: '#fff'
            }}
          >
            {React.createElement(roleConfigs[role]?.icon || UserCheck, {
              size: 19,
              color: roleConfigs[role]?.color || '#10b981'
            })}
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                ACTIVE PORTAL VIEW
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: roleConfigs[role]?.color || '#10b981' }}>
                {roleConfigs[role]?.label || 'Patient View'}
              </span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          
          {/* User Profile & Logout / Sign In Control */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.65rem', 
                background: 'rgba(255,255,255,0.06)', padding: '0.4rem 0.85rem', 
                borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' 
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${roleConfigs[role]?.color || '#10b981'}, #3b82f6)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.88rem', color: '#fff',
                  boxShadow: `0 0 10px ${roleConfigs[role]?.color || '#10b981'}44`
                }}>
                  {(currentUser?.name || 'Dinali Bhagya').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {currentUser?.name || 'Dinali Bhagya'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: roleConfigs[role]?.color || '#10b981', fontWeight: 800 }}>
                    LOGGED IN AS {(role || 'patient').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Dedicated Logout Button */}
              <button 
                onClick={logoutUser}
                title="Log out of session"
                className="btn-danger-outline"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)} 
              className="btn-primary" 
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}

          {/* PDF Report Export */}
          <button onClick={() => setPdfModalOpen(true)} className="btn-outline" style={{ fontSize: '0.82rem' }}>
            <FileText size={16} />
            <span>Export Report</span>
          </button>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#8b5cf6" />}
          </button>
        </div>

      </div>
    </nav>
  );
};
