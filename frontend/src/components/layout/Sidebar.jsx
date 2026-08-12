import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, Brain, Utensils, Activity, Flame, FileSpreadsheet, 
  ShieldAlert, Radio, Award, Stethoscope, Users, HeartPulse, Cpu,
  Pill, Moon, AlertCircle
} from 'lucide-react';

export const Sidebar = () => {
  const { role, activeTab, setActiveTab, currentUser } = useApp();


  const patientTabs = [
    { id: 'glucose', label: 'Blood Glucose & CGM', icon: BarChart3 },
    { id: 'predictions', label: 'AI Glucose Forecast', icon: Brain },
    { id: 'food', label: 'AI Food Vision & Meals', icon: Utensils },
    { id: 'fitness', label: 'Fitness & Sleep Tracker', icon: Flame },
    { id: 'complications', label: 'Complications & Risks', icon: ShieldAlert },
    { id: 'lab', label: 'Lab OCR & Reports', icon: FileSpreadsheet }
  ];

  const doctorTabs = [
    { id: 'doctor_patients', label: 'Patient Roster & CGM', icon: Users },
    { id: 'doctor_prescriptions', label: 'E-Prescriptions & AI', icon: Pill },
    { id: 'doctor_appointments', label: 'Appointments & Consults', icon: Stethoscope }
  ];

  const caregiverTabs = [
    { id: 'caregiver_feed', label: 'Patient Live Feed', icon: HeartPulse },
    { id: 'caregiver_alerts', label: 'Emergency Alerts Log', icon: AlertCircle }
  ];

  const adminTabs = [
    { id: 'admin_telemetry', label: 'System Telemetry', icon: Cpu },
    { id: 'admin_ai_models', label: 'AI Model Accuracy', icon: Brain },
    { id: 'admin_users', label: 'User & Clinic Directory', icon: Users }
  ];

  let currentTabs = patientTabs;
  if (role === 'doctor') currentTabs = doctorTabs;
  if (role === 'caregiver') currentTabs = caregiverTabs;
  if (role === 'admin') currentTabs = adminTabs;

  return (
    <aside className="glass-panel" style={{ width: '260px', borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: '0.75rem', marginBottom: '0.5rem' }}>
        {role} Navigation
      </div>

      {currentTabs.map(t => {
        const Icon = t.icon;
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: active ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(20, 184, 166, 0.15))' : 'transparent',
              color: active ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderLeft: active ? '3px solid var(--accent-cyan)' : '3px solid transparent',
              fontWeight: active ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={18} />
            <span>{t.label}</span>
          </button>
        );
      })}

      {/* Profile quick stats card */}
      <div style={{ marginTop: 'auto', background: 'var(--bg-secondary)', padding: '1.0rem', borderRadius: '12px', border: 'var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Connected Profile</div>
        <div style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0.2rem 0', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentUser?.name || 'Dinali Bhagya'}
        </div>
        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentUser?.email || 'dinali@glucocare.ai'}
        </div>
        <div style={{ fontSize: '0.73rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
          <span className="pulse-indicator"></span>
          <span>Session Active</span>
        </div>
      </div>

    </aside>
  );
};
