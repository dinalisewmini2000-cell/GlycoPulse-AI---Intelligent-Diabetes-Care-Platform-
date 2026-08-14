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

        {/* Action Controls & Single Professional User Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              
              {/* Sleek Consolidated User Profile Badge */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', 
                background: 'rgba(255,255,255,0.05)', padding: '0.45rem 0.95rem', 
                borderRadius: '14px', border: `1px solid ${roleConfigs[role]?.color || '#10b981'}44`
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${roleConfigs[role]?.color || '#10b981'}, #3b82f6)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.9rem', color: '#fff',
                  boxShadow: `0 0 12px ${roleConfigs[role]?.color || '#10b981'}55`
                }}>
                  {(currentUser?.name || 'Dinali Bhagya').charAt(0).toUpperCase()}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {currentUser?.name || 'Dinali Bhagya'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: roleConfigs[role]?.color || '#10b981', fontWeight: 700 }}>
                    {roleConfigs[role]?.label || 'Patient View'}
                  </span>
                </div>
              </div>

              {/* Dedicated Logout Button */}
              <button 
                onClick={logoutUser}
                title="Log out of session"
                className="btn-danger-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
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
        </div>

      </div>
    </nav>
  );
};
