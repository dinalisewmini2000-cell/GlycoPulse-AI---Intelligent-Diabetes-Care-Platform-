import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trash2, Filter } from 'lucide-react';

export const CalendarPage = () => {
  const { glucoseLogs, deleteGlucoseLog } = useApp();

  // Date Filter State
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL');

  const getGlucoseStatusBadge = (val) => {
    const num = Number(val);
    if (num < 70) {
      return <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700 }}>Low ({num} mg/dL)</span>;
    }
    if (num <= 130) {
      return <span className="badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 700 }}>Normal ({num} mg/dL)</span>;
    }
    if (num <= 180) {
      return <span className="badge" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontWeight: 700 }}>Elevated ({num} mg/dL)</span>;
    }
    return <span className="badge" style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', fontWeight: 700 }}>High ({num} mg/dL)</span>;
  };

  // Filter logs by date if selected
  const filteredLogs = selectedDateFilter === 'ALL' 
    ? glucoseLogs 
    : glucoseLogs.filter(log => log.date === selectedDateFilter);

  // Get unique dates for filter dropdown
  const uniqueDates = Array.from(new Set(glucoseLogs.map(log => log.date)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
            Sugar Measurement History
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Review a comprehensive history of your blood glucose measurement results by date.
          </p>
        </div>
      </div>

      {/* FILTER & HISTORY SECTION */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        {/* Table Header with Date Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Historical Sugar Measurement Logs
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Review all past blood sugar entries recorded by date and context.
            </p>
          </div>

          {/* Filter by Date Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="#64748b" />
            <select 
              value={selectedDateFilter} 
              onChange={e => setSelectedDateFilter(e.target.value)}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
            >
              <option value="ALL">Show All Dates ({glucoseLogs.length})</option>
              {uniqueDates.map(d => (
                <option key={d} value={d}>Date: {d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sugar Measurement Results Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>DATE</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>TIME</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>GLUCOSE LEVEL</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONTEXT</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>NOTES</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No sugar measurement results recorded for this date filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                      {log.date}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                      {log.time}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {log.value} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>mg/dL</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {getGlucoseStatusBadge(log.value)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {log.context}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-dim)' }}>
                      {log.notes || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => deleteGlucoseLog(log.id)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)', padding: '0.2rem' }}
                        title="Delete log"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
