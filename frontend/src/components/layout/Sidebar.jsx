import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Activity, Utensils, Calendar, FileText
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, currentUser } = useApp();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'glucose', label: 'Glucose', icon: Activity },
    { id: 'meals', label: 'Meals', icon: Utensils },
    { id: 'calendar', label: 'History', icon: Calendar },
    { id: 'lab', label: 'Lab Reports', icon: FileText }
  ];

  return (
    <aside style={{ width: '220px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
      
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '0.4rem' }}>
        PATIENT MENU
      </div>

      {navigationItems.map(item => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: active ? 'var(--primary-color)' : 'transparent',
              color: active ? '#ffffff' : 'var(--text-muted)',
              fontWeight: active ? 600 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease, color 0.15s ease'
            }}
          >
            <Icon size={17} color={active ? '#ffffff' : 'currentColor'} />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* User Session Info */}
      <div style={{ marginTop: 'auto', background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Logged in as</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0.1rem 0', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Patient Account')}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentUser?.email || 'Not Logged In'}
        </div>
      </div>

    </aside>
  );
};
