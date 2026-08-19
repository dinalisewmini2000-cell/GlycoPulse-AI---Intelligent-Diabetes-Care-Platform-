import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getGlucoseContextDetails, calculateGlucoseTrend } from './GlucosePage';

export const DashboardView = ({ onOpenAddGlucose }) => {
  const { currentUser, glucoseLogs, setActiveTab } = useApp();
  const [timeRange, setTimeRange] = useState('7');

  const currentHour = new Date().getHours();
  const greetingTime = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = currentUser?.name?.split(' ')[0] || 'Patient';

  const latestLog = glucoseLogs[0];
  const trendInfo = calculateGlucoseTrend(glucoseLogs);
  const details = latestLog ? getGlucoseContextDetails(latestLog.value, latestLog.context) : null;

  const chartData = glucoseLogs.slice(0, timeRange === '7' ? 7 : 30).reverse().map((log, index) => ({
    displayTime: log.time || `Log ${index + 1}`,
    value: log.value,
    date: log.date || 'Today'
  }));

  const displayChartData = chartData.length > 0 ? chartData : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px' }}>
      
      {/* 1. Header Greeting */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
          {greetingTime}, {userName}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Here is your persistent glucose & clinical record summary.
        </p>
      </div>

      {/* 2. Current Glucose Summary Card */}
      {latestLog ? (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
              Latest Glucose Reading ({latestLog.date})
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1, color: details?.isWithinRange ? 'var(--primary-color)' : '#dc2626' }}>
                {latestLog.value}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                mg/dL
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className={`badge ${details?.isWithinRange ? 'badge-success' : 'badge-warning'}`}>
                {details?.status}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Context: {latestLog.context} ({details?.rangeLabel})
              </span>
            </div>

            <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {trendInfo.direction === 'up' && <TrendingUp size={15} color="#dc2626" />}
              {trendInfo.direction === 'down' && <TrendingDown size={15} color="#16a34a" />}
              {trendInfo.direction === 'stable' && <Minus size={15} color="var(--text-muted)" />}
              <span>{trendInfo.text}</span>
            </div>
          </div>

          <button 
            onClick={onOpenAddGlucose}
            className="btn-primary" 
            style={{ padding: '0.7rem 1.25rem', fontSize: '0.9rem' }}
          >
            <PlusCircle size={17} />
            <span>+ Add glucose reading</span>
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No previous glucose records available for this account.</p>
          <button onClick={onOpenAddGlucose} className="btn-primary">
            <PlusCircle size={16} />
            <span>+ Log First Reading</span>
          </button>
        </div>
      )}

      {/* 3. Glucose Over Time Chart */}
      {displayChartData.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Glucose trend over time
              </h3>
            </div>

            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '0.2rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setTimeRange('7')}
                style={{
                  padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none',
                  background: timeRange === '7' ? 'var(--primary-color)' : 'transparent',
                  color: timeRange === '7' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                7 days
              </button>
              <button
                onClick={() => setTimeRange('30')}
                style={{
                  padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none',
                  background: timeRange === '30' ? 'var(--primary-color)' : 'transparent',
                  color: timeRange === '30' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                30 days
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayTime" stroke="var(--text-dim)" fontSize={12} tickLine={false} />
                <YAxis domain={[50, 220]} stroke="var(--text-dim)" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }}
                  formatter={(val) => [`${val} mg/dL`, 'Glucose']}
                />
                <ReferenceLine y={70} stroke="var(--accent-rose)" strokeDasharray="3 3" label={{ value: '70 Low', fill: 'var(--accent-rose)', fontSize: 10 }} />
                <ReferenceLine y={140} stroke="var(--accent-amber)" strokeDasharray="3 3" label={{ value: '140 Target', fill: 'var(--accent-amber)', fontSize: 10 }} />
                <Area type="monotone" dataKey="value" stroke="var(--primary-color)" strokeWidth={2.5} fillOpacity={1} fill="url(#glucoseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. Recent Readings Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Recent glucose records
          </h3>
          <button onClick={() => setActiveTab('glucose')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            View all history →
          </button>
        </div>

        {glucoseLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No previous records available.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Date / Time</th>
                  <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Glucose Value</th>
                  <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Context</th>
                  <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Range</th>
                </tr>
              </thead>
              <tbody>
                {glucoseLogs.slice(0, 5).map((log) => {
                  const itemCtx = getGlucoseContextDetails(log.value, log.context);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                        {log.date} ({log.time})
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {log.value} mg/dL
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-main)' }}>
                        {log.context}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {itemCtx.rangeLabel}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
