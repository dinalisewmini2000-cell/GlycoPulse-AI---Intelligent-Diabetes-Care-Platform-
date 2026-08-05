import React from 'react';
import { HeartHandshake, Bell, ShieldAlert, CheckCircle2, PhoneCall, Clock } from 'lucide-react';

export const CaregiverPortal = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <HeartHandshake size={28} color="var(--accent-rose)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Caregiver & Family Companion Portal</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-rose)', fontWeight: 600 }}>Linked Patient: Sarah Jenkins (Spouse)</div>
          </div>
        </div>
      </div>

      {/* Patient Real-Time Status Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-emerald)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>PATIENT REAL-TIME GLUCOSE STATUS</span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.2rem 0' }}>
              118 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>mg/dL (In Target Range)</span>
            </h3>
            <div className="badge badge-success">
              <CheckCircle2 size={13} />
              <span>CGM Signal Strong (Dexcom G7)</span>
            </div>
          </div>

          <button className="btn-glow" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
            <PhoneCall size={16} />
            <span>Call Patient</span>
          </button>
        </div>
      </div>

      {/* Alert Feed Timeline */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Live Alert & Adherence Feed</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Night Lantus Insulin Dose Confirmed</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Logged 10:15 PM Yesterday</div>
              </div>
            </div>
            <span className="badge badge-success">Adherence 100%</span>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Clock size={18} color="var(--accent-cyan)" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Post-Meal Walk Completed (20 mins)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Logged 5:30 PM Yesterday</div>
              </div>
            </div>
            <span className="badge badge-info">Activity Verified</span>
          </div>
        </div>
      </div>

    </div>
  );
};
