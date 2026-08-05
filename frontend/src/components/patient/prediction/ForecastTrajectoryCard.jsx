import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Brain, HelpCircle, CheckCircle2 } from 'lucide-react';

export const ForecastTrajectoryCard = ({ aiPrediction, currentGlucose }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>AI Forecasted 2-Hour Trajectory</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Predicting curve from baseline reading ({currentGlucose} mg/dL)
        </p>

        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aiPrediction.hourlyForecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGlucoseForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
              <YAxis domain={[60, 200]} stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-purple)', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGlucoseForecast)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <HelpCircle size={20} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Root-Cause Explanation</h4>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>"{aiPrediction.explanation}"</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <CheckCircle2 size={20} color="var(--accent-emerald)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Actionable AI Advice</h4>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>"{aiPrediction.recommendation}"</p>
        </div>
      </div>
    </div>
  );
};
