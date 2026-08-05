import React from 'react';
import { ShieldAlert, Cpu, Brain, Users, Activity, CheckCircle2 } from 'lucide-react';

export const AdminPortal = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Cpu size={28} color="var(--accent-purple)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Platform Administration & AI Telemetry Dashboard</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-purple)', fontWeight: 600 }}>System Health: 100% Operational (99.99% Uptime)</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL REGISTERED USERS</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.3rem 0' }}>14,250</div>
          <div className="badge badge-info">+12% Growth this month</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>VERIFIED PHYSICIANS</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.3rem 0' }}>380</div>
          <div className="badge badge-success">Hospital Networks Synced</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI PREDICTION ACCURACY</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.3rem 0' }}>96.4%</div>
          <div className="badge badge-success">Model Loss: 0.012</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Active AI Engine Models</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Glucose Forecast Model (v3.4-active)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>Latency: 18ms | Precision: 96.4%</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Food Vision Recognition (v2.1-active)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>Latency: 45ms | Precision: 94.8%</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Lab PDF OCR Parser (v4.0-active)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>Latency: 120ms | Recall: 98.9%</div>
          </div>
        </div>
      </div>

    </div>
  );
};
