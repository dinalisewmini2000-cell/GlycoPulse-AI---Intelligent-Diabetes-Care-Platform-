import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine 
} from 'recharts';
import { Activity, PlusCircle, Radio, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const GlucoseDashboard = () => {
  const { glucoseLogs, addGlucoseLog, currentGlucose, hba1cHistory } = useApp();
  const [showLogModal, setShowLogModal] = useState(false);
  const [val, setVal] = useState(120);
  const [type, setType] = useState('After Meal');
  const [notes, setNotes] = useState('');
  const [cgmSyncing, setCgmSyncing] = useState(false);

  const handleSubmitLog = (e) => {
    e.preventDefault();
    addGlucoseLog({ value: val, type, notes });
    setShowLogModal(false);
    setNotes('');
  };

  const handleTriggerCGMSync = () => {
    setCgmSyncing(true);
    setTimeout(() => {
      const simulatedCGM = Math.floor(Math.random() * (145 - 90 + 1)) + 90;
      addGlucoseLog({ value: simulatedCGM, type: 'CGM Auto Sync', notes: 'Bluetooth Dexcom G7 Live Sync' });
      setCgmSyncing(false);
    }, 1200);
  };

  // Reformat logs for Recharts
  const chartData = [...glucoseLogs].reverse().map(l => ({
    time: l.timestamp,
    glucose: l.value
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
        
        {/* Current Glucose */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT GLUCOSE</span>
            <span className="pulse-indicator"></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800 }}>{currentGlucose}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>mg/dL</span>
          </div>
          <div className="badge badge-success">
            <CheckCircle2 size={13} />
            <span>Target Range (70 - 180)</span>
          </div>
        </div>

        {/* Time In Range (TIR) */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>TIME IN RANGE (TIR)</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.5rem 0' }}>
            84<span style={{ fontSize: '1.2rem' }}>%</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Target: &gt;70% in 70-180 mg/dL range
          </div>
        </div>

        {/* Latest HbA1c */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED HbA1c</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.5rem 0' }}>
            6.3<span style={{ fontSize: '1.2rem' }}>%</span>
          </div>
          <div className="badge badge-info">
            <span>Optimal Control (&lt; 7.0%)</span>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justify: 'center', gap: '0.6rem' }}>
          <button onClick={() => setShowLogModal(true)} className="btn-glow" style={{ width: '100%', justifyContent: 'center' }}>
            <PlusCircle size={17} />
            <span>Log Blood Sugar</span>
          </button>
          <button onClick={handleTriggerCGMSync} disabled={cgmSyncing} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
            <Radio size={16} className={cgmSyncing ? 'animate-spin' : ''} />
            <span>{cgmSyncing ? 'Syncing CGM...' : 'Sync CGM / Bluetooth'}</span>
          </button>
        </div>

      </div>

      {/* Main Chart Card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Glucose Trend Chart (Daily / Continuous)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time CGM readings with high & low threshold reference bands</p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="badge badge-info" style={{ cursor: 'pointer' }}>Daily</button>
            <button className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'pointer' }}>Weekly</button>
            <button className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'pointer' }}>Monthly</button>
          </div>
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
              <YAxis domain={[50, 220]} stroke="var(--text-muted)" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-cyan)', borderRadius: '8px', color: '#fff' }}
              />
              <ReferenceLine y={180} label="High Target (180)" stroke="#f43f5e" strokeDasharray="3 3" />
              <ReferenceLine y={70} label="Low Target (70)" stroke="#f59e0b" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="glucose" 
                stroke="#06b6d4" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#06b6d4' }} 
                activeDot={{ r: 8, fill: '#10b981' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Glucose Logs History Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Glucose Log Entries</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Glucose (mg/dL)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Notes & Context</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {glucoseLogs.map((log) => {
                let badgeClass = 'badge-success';
                let statusText = 'In Range';
                if (log.value > 180) { badgeClass = 'badge-danger'; statusText = 'Hyperglycemia'; }
                if (log.value < 70) { badgeClass = 'badge-warning'; statusText = 'Hypoglycemia'; }
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, fontSize: '1rem' }}>{log.value}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{log.type}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{log.notes || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${badgeClass}`}>{statusText}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showLogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Log Blood Glucose Reading</h3>
            <form onSubmit={handleSubmitLog} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Glucose Value (mg/dL)</label>
                <input 
                  type="number" 
                  value={val} 
                  onChange={e => setVal(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Timing / Category</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                >
                  <option value="Fasting">Fasting (Morning)</option>
                  <option value="Before Meal">Before Meal</option>
                  <option value="After Meal">After Meal (2h Post-prandial)</option>
                  <option value="Bedtime">Bedtime Check</option>
                  <option value="Night">Night (3:00 AM Check)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Notes & Meal Details</label>
                <input 
                  type="text" 
                  value={notes} 
                  placeholder="e.g. Ate 40g carbs, 20-min post walk"
                  onChange={e => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>Save Entry</button>
                <button type="button" onClick={() => setShowLogModal(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
