import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const DashboardView = ({ onOpenAddGlucose }) => {
  const { currentUser, glucoseLogs, setActiveTab } = useApp();
  const [timeRange, setTimeRange] = useState('7'); // '7' or '30'

  // Dynamic Time Greeting
  const currentHour = new Date().getHours();
  const greetingTime = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = currentUser?.name?.split(' ')[0] || 'Dinali';

  // Latest reading
  const latestLog = glucoseLogs[0] || { value: 168, context: 'Before dinner', time: '7:00 PM' };
  const latestValue = latestLog.value;

  const isTarget = latestValue >= 70 && latestValue <= 180;
  const statusText = isTarget ? 'Within target range' : latestValue < 70 ? 'Below target range' : 'Above target range';
  const statusBadgeClass = isTarget ? 'badge-success' : latestValue < 70 ? 'badge-danger' : 'badge-warning';

  // Prepare chart data for 7 or 30 days
  const chartData = glucoseLogs.slice(0, timeRange === '7' ? 7 : 30).reverse().map((log, index) => ({
    displayTime: log.time || `Log ${index + 1}`,
    value: log.value,
    date: log.date || 'Today'
  }));

  // Fallback dummy chart data if logs are sparse
  const displayChartData = chartData.length > 0 ? chartData : [
    { displayTime: '8:00 AM', value: 110 },
    { displayTime: '1:00 PM', value: 145 },
    { displayTime: '7:00 PM', value: 168 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px' }}>
      
      {/* 1. Header Greeting */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
          {greetingTime}, {userName}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Here's your glucose summary for today.
        </p>
      </div>

      {/* 2. Current Glucose Summary Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
            Current glucose
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1, color: isTarget ? 'var(--primary-color)' : latestValue < 70 ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
              {latestValue}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              mg/dL
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`badge ${statusBadgeClass}`}>
              {statusText}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Target: 70–180 mg/dL
            </span>
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

      {/* 3. Glucose Over Time Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Glucose over time
            </h3>
          </div>

          {/* Time range selector */}
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
              <ReferenceLine y={70} stroke="var(--accent-rose)" strokeDasharray="3 3" label={{ value: '70 Low Target', fill: 'var(--accent-rose)', fontSize: 10 }} />
              <ReferenceLine y={180} stroke="var(--accent-amber)" strokeDasharray="3 3" label={{ value: '180 High Target', fill: 'var(--accent-amber)', fontSize: 10 }} />
              <Area type="monotone" dataKey="value" stroke="var(--primary-color)" strokeWidth={2.5} fillOpacity={1} fill="url(#glucoseGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Recent Readings Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Recent readings
          </h3>
          <button onClick={() => setActiveTab('glucose')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            View all →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Time</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Glucose</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Context</th>
              </tr>
            </thead>
            <tbody>
              {glucoseLogs.slice(0, 5).map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                    {log.time || '8:00 AM'}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {log.value} mg/dL
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-main)' }}>
                    {log.context || 'General check'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
