import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

export const GlucoseChartCard = ({ logs }) => {
  const chartData = [...logs].reverse().map(l => ({
    time: l.timestamp,
    glucose: l.value
  }));

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Continuous Blood Glucose Trajectory</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dexcom G7 Live Sync & Manual Fingerstick Readings</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <span className="badge badge-info">Live Stream</span>
          <span className="badge badge-success">Target: 70 - 180 mg/dL</span>
        </div>
      </div>

      <div style={{ height: '320px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
            <YAxis domain={[50, 220]} stroke="var(--text-muted)" fontSize={12} />
            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-cyan)', borderRadius: '8px', color: '#fff' }} />
            <ReferenceLine y={180} label="High Target (180)" stroke="#f43f5e" strokeDasharray="3 3" />
            <ReferenceLine y={70} label="Low Target (70)" stroke="#f59e0b" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="glucose" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5, fill: '#06b6d4' }} activeDot={{ r: 8, fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
