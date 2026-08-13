import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sun, Moon, AlertTriangle, FileText, 
  UserCheck, Stethoscope, HeartHandshake, ShieldAlert, LogOut, LogIn
} from 'lucide-react';

export const Navbar = () => {
  const { 
    role, 
    theme, toggleTheme, 
    setSosActive, setPdfModalOpen,
    isAuthenticated, setAuthModalOpen,
    currentUser, logoutUser
  } = useApp();

  const roleConfigs = {
    patient: { label: 'Patient View', icon: UserCheck, color: '#10b981' },
    doctor: { label: 'Doctor Portal', icon: Stethoscope, color: '#06b6d4' },
    caregiver: { label: 'Caregiver Portal', icon: HeartHandshake, color: '#ec4899' },
    admin: { label: 'Admin Dashboard', icon: ShieldAlert, color: '#a855f7' }
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

        {/* Active Role Indicator Badge */}
        {isAuthenticated && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(0,0,0,0.25)', padding: '0.45rem 1rem', borderRadius: '12px',
            border: `1px solid ${roleConfigs[role]?.color || '#06b6d4'}44`,
            boxShadow: `0 0 12px ${roleConfigs[role]?.color || '#06b6d4'}22`
          }}>
            {React.createElement(roleConfigs[role]?.icon || UserCheck, {
              size: 18,
              color: roleConfigs[role]?.color || '#06b6d4'
            })}
            <span style={{
              fontSize: '0.85rem', fontWeight: 700,
              color: roleConfigs[role]?.color || '#06b6d4', letterSpacing: '0.3px'
            }}>
              {roleConfigs[role]?.label}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          
          {/* User Profile & Logout Status */}
          {isAuthenticated && currentUser ? (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.6rem', 
              background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.75rem', 
              borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' 
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${roleConfigs[role]?.color || '#06b6d4'}, #3b82f6)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem', color: '#fff'
              }}>
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {currentUser.name || 'Dinali Bhagya'}
                </span>
                <span style={{ fontSize: '0.7rem', color: roleConfigs[role]?.color || '#06b6d4', fontWeight: 600 }}>
                  {role.toUpperCase()}
                </span>
              </div>

              {/* Logout Button */}
              <button 
                onClick={logoutUser}
                title="Sign Out"
                style={{
                  marginLeft: '0.4rem', background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px',
                  padding: '0.4rem 0.6rem', color: '#f87171', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem',
                  fontWeight: 600, transition: 'all 0.2s ease'
                }}
              >
                <LogOut size={15} />
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

          {/* Emergency SOS Button */}
          <button onClick={() => setSosActive(true)} className="btn-danger-glow sos-anim" style={{ fontSize: '0.85rem' }}>
            <AlertTriangle size={17} />
            <span>SOS EMERGENCY</span>
          </button>
        </div>

      </div>
    </nav>
  );
};
