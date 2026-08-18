import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, Brain, Utensils, Flame, FileSpreadsheet, 
  ShieldAlert, Users, Stethoscope, Cpu, Pill
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
    { id: 'doctor_prescriptions', label: 'E-Prescriptions & Dose', icon: Pill },
    { id: 'doctor_appointments', label: 'Appointments & Consults', icon: Stethoscope }
  ];

  const adminTabs = [
    { id: 'admin_telemetry', label: 'System Telemetry', icon: Cpu },
    { id: 'admin_users', label: 'User Directory', icon: Users }
  ];

  let currentTabs = patientTabs;
  if (role === 'doctor') currentTabs = doctorTabs;
  if (role === 'admin') currentTabs = adminTabs;

  return (
    <aside style={{ width: '240px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '1.2rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', flexShrink: 0 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '0.5rem' }}>
        {role.toUpperCase()} PORTAL
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
              gap: '0.65rem',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              background: active ? 'var(--primary-color)' : 'transparent',
              color: active ? '#ffffff' : 'var(--text-muted)',
              fontWeight: active ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Icon size={16} color={active ? '#ffffff' : 'currentColor'} />
            <span>{t.label}</span>
          </button>
        );
      })}

      {/* Profile session box */}
      <div style={{ marginTop: 'auto', background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Session</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0.15rem 0', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentUser?.name || 'Dinali Bhagya'}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentUser?.email || 'dinali@glucocare.ai'}
        </div>
      </div>

    </aside>
  );
};
