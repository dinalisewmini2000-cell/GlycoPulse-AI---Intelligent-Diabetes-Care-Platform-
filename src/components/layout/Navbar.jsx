import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sun, Moon, AlertTriangle, FileText, Globe, 
  UserCheck, Stethoscope, HeartHandshake, ShieldAlert, ChevronDown 
} from 'lucide-react';

export const Navbar = () => {
  const { 
    role, setRole, 
    theme, toggleTheme, 
    language, setLanguage, 
    setSosActive, setPdfModalOpen 
  } = useApp();

  const roleConfigs = {
    patient: { label: 'Patient View', icon: UserCheck, color: 'text-emerald-400' },
    doctor: { label: 'Doctor Portal', icon: Stethoscope, color: 'text-cyan-400' },
    caregiver: { label: 'Caregiver Portal', icon: HeartHandshake, color: 'text-pink-400' },
    admin: { label: 'Admin Dashboard', icon: ShieldAlert, color: 'text-purple-400' }
  };

  return (
    <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.9rem 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
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

        {/* Role Switcher */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '12px', border: 'var(--border-color)' }}>
          {Object.keys(roleConfigs).map((r) => {
            const Icon = roleConfigs[r].icon;
            const active = role === r;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: active ? 'var(--bg-secondary)' : 'transparent',
                  color: active ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: active ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                {roleConfigs[r].label.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          
          {/* PDF Report Export */}
          <button onClick={() => setPdfModalOpen(true)} className="btn-outline" style={{ fontSize: '0.82rem' }}>
            <FileText size={16} />
            <span>Export Report</span>
          </button>

          {/* Language Selector */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.45rem 0.75rem', borderRadius: '8px', border: 'var(--border-color)', fontSize: '0.82rem', color: 'var(--text-muted)', gap: '0.3rem' }}>
            <Globe size={15} />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
            >
              <option value="en">EN (English)</option>
              <option value="es">ES (Español)</option>
              <option value="hi">HI (Hindi)</option>
              <option value="fr">FR (Français)</option>
            </select>
          </div>

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
