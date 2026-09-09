import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Activity, Utensils, Calendar, FileText, MessageSquare, 
  Camera, Sparkles, ChevronDown, ChevronRight, Smile, Pill, Radio
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, mealSubTab, setMealSubTab, currentUser } = useApp();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { id: 'glucose', label: 'Glucose', path: '/glucose', icon: Activity },
    { 
      id: 'meals', 
      label: 'Meals', 
      path: '/meals', 
      icon: Utensils,
      subItems: [
        { subId: 'daily', label: 'Food Recognition', icon: Camera },
        { subId: 'weekly', label: 'Weekly Meal Planner', icon: Sparkles }
      ]
    },
    { id: 'calendar', label: 'History', path: '/calendar', icon: Calendar },
    { id: 'lab', label: 'Lab Reports', path: '/lab', icon: FileText },
    { id: 'community', label: 'Community', path: '/community', icon: MessageSquare },
    { id: 'mental-health', label: 'Mental Health', path: '/mental-health', icon: Smile },
    { id: 'medications', label: 'Medications', path: '/medications', icon: Pill },
    { id: 'devices', label: 'Smart Devices', path: '/devices', icon: Radio },
    { id: 'premium-ai', label: 'Premium AI Hub', path: '/premium-ai', icon: Sparkles }
  ];

  return (
    <aside style={{ width: '230px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
      
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', paddingLeft: '0.6rem', marginBottom: '0.4rem' }}>
        PATIENT MENU
      </div>

      {navigationItems.map(item => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        const hasSub = Array.isArray(item.subItems);

        return (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            
            <button
              onClick={() => setActiveTab(item.id, hasSub ? (mealSubTab || 'daily') : null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Icon size={17} color={active ? '#ffffff' : 'currentColor'} />
                <span>{item.label}</span>
              </div>

              {hasSub && (
                active ? <ChevronDown size={14} color="#ffffff" /> : <ChevronRight size={14} color="currentColor" />
              )}
            </button>

            {/* Sub-items for Meals section */}
            {hasSub && active && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '1.5rem', marginTop: '0.15rem', marginBottom: '0.25rem' }}>
                {item.subItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = mealSubTab === sub.subId;

                  return (
                    <button
                      key={sub.subId}
                      onClick={() => setActiveTab('meals', sub.subId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.55rem',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: isSubActive ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
                        color: isSubActive ? '#0284c7' : 'var(--text-muted)',
                        fontWeight: isSubActive ? 800 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <SubIcon size={14} color={isSubActive ? '#0284c7' : 'currentColor'} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

          </div>
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
