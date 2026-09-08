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
  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Patient';

  const safeLogs = Array.isArray(glucoseLogs) ? glucoseLogs : [];
  const latestLog = safeLogs.length > 0 ? safeLogs[0] : null;
  const trendInfo = calculateGlucoseTrend(safeLogs);
  const details = latestLog ? getGlucoseContextDetails(latestLog.value, latestLog.context) : null;

  const chartData = safeLogs.slice(0, timeRange === '7' ? 7 : 30).reverse().map((log, index) => ({
    displayTime: log?.time || `Log ${index + 1}`,
    value: Number(log?.value) || 0,
    date: log?.date || 'Today'
  }));

  const displayChartData = chartData.length > 0 ? chartData : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1020px' }}>
      
      {/* 1. Header Greeting */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.025em' }}>
          {greetingTime}, {userName}
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
          Here is your persistent glucose & clinical record summary.
        </p>
      </div>

      {/* 2. Current Glucose Summary Card */}
      {latestLog ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Latest Glucose Reading ({latestLog.date || 'Today'})
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '2.85rem', fontWeight: 900, lineHeight: 1, color: details?.isWithinRange ? '#0284c7' : '#dc2626' }}>
                {latestLog.value}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#64748b' }}>
                mg/dL
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className={`badge ${details?.isWithinRange ? 'badge-success' : 'badge-warning'}`}>
                {details?.status || 'Logged'}
              </span>
              <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 500 }}>
                Context: {latestLog.context || 'General'} ({details?.rangeLabel || ''})
              </span>
            </div>

            <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>
              {trendInfo?.direction === 'up' && <TrendingUp size={16} color="#dc2626" />}
              {trendInfo?.direction === 'down' && <TrendingDown size={16} color="#16a34a" />}
              {trendInfo?.direction === 'stable' && <Minus size={16} color="#64748b" />}
              <span>{trendInfo?.text || 'No trend data'}</span>
            </div>
          </div>

          <button 
            onClick={onOpenAddGlucose}
            style={{
              padding: '0.75rem 1.4rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(2, 132, 199, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.3)';
            }}
          >
            <PlusCircle size={18} />
            <span>+ Add glucose reading</span>
          </button>
        </div>
      ) : (
        <div style={{
          padding: '2.5rem 1.5rem',
          background: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid #f1f5f9',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
          }}>
            <Activity size={28} color="#0284c7" />
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              No previous glucose records available
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, maxWidth: '420px' }}>
              Start tracking your blood sugar levels to see real-time clinical trends and AI glycemic insights.
            </p>
          </div>

          <button
            onClick={onOpenAddGlucose}
            style={{
              padding: '0.7rem 1.35rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              marginTop: '0.25rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(2, 132, 199, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.3)';
            }}
          >
            <PlusCircle size={18} />
            <span>+ Log First Reading</span>
          </button>
        </div>
      )}

      {/* 3. Glucose Over Time Chart */}
      {displayChartData.length > 0 && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '1.75rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Glucose trend over time
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '20px' }}>
              <button 
                onClick={() => setTimeRange('7')}
                style={{ 
                  padding: '0.35rem 0.85rem', borderRadius: '16px', border: 'none',
                  background: timeRange === '7' ? '#0284c7' : 'transparent',
                  color: timeRange === '7' ? '#ffffff' : '#64748b',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                7 days
              </button>
              <button 
                onClick={() => setTimeRange('30')}
                style={{ 
                  padding: '0.35rem 0.85rem', borderRadius: '16px', border: 'none',
                  background: timeRange === '30' ? '#0284c7' : 'transparent',
                  color: timeRange === '30' ? '#ffffff' : '#64748b',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  transition: 'all 0.15s ease'
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
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayTime" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis domain={[50, 220]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val) => [`${val} mg/dL`, 'Glucose']}
                />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '70 Low', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '140 Target', fill: '#f59e0b', fontSize: 10 }} />
                <Area type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#glucoseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. Recent Readings Table */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '1.75rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Recent glucose records
          </h3>
          <button onClick={() => setActiveTab('glucose')} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            View all history →
          </button>
        </div>

        {safeLogs.length === 0 ? (
          <div style={{ padding: '1.75rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.86rem' }}>
            No previous records available for this account. Log your first reading to populate history.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontWeight: 700 }}>Date / Time</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontWeight: 700 }}>Glucose Value</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontWeight: 700 }}>Context</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontWeight: 700 }}>Target Range</th>
                </tr>
              </thead>
              <tbody>
                {safeLogs.slice(0, 5).map((log, i) => {
                  const itemCtx = getGlucoseContextDetails(log.value, log.context);
                  return (
                    <tr key={log.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.8rem 0.5rem', color: '#64748b', fontWeight: 600 }}>
                        {log.date || 'Today'} ({log.time || '--:--'})
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem', fontWeight: 800, color: '#0f172a' }}>
                        {log.value} mg/dL
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem', color: '#0f172a', fontWeight: 600 }}>
                        {log.context || 'General'}
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem', fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                        {itemCtx?.rangeLabel || ''}
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
