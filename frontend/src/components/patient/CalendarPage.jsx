import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Calendar as CalendarIcon, Trash2, X, CheckCircle2, Activity, Filter, Clock } from 'lucide-react';

export const CalendarPage = () => {
  const { glucoseLogs, addGlucoseLog, deleteGlucoseLog } = useApp();

  // Manual Sugar Entry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [glucoseValue, setGlucoseValue] = useState('');
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0]);
  const [measurementTime, setMeasurementTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [measurementContext, setMeasurementContext] = useState('Fasting');
  const [notes, setNotes] = useState('');

  // Date Filter State
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!glucoseValue) return;

    addGlucoseLog({
      value: Number(glucoseValue),
      date: measurementDate,
      time: measurementTime,
      context: measurementContext,
      notes: notes
    });

    setGlucoseValue('');
    setNotes('');
    setIsModalOpen(false);
  };

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
      
      {/* Header & Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
            Sugar Measurement Calendar & History
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Manually enter and keep a comprehensive history of your blood glucose measurement results by date.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary" 
          style={{ padding: '0.65rem 1.2rem', fontSize: '0.88rem', background: 'linear-gradient(135deg, #0284c7, #2563eb)', border: 'none' }}
        >
          <PlusCircle size={17} />
          <span>+ Record Sugar Measurement</span>
        </button>
      </div>

      {/* MANUAL ENTRY MODAL FOR SUGAR MEASUREMENT RESULTS */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }}>
          <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '1.5rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Activity size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Record Sugar Measurement Result
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '50%', padding: '0.35rem' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Sugar Value */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Blood Sugar Value (mg/dL) *
                </label>
                <input 
                  type="number" 
                  required 
                  value={glucoseValue} 
                  onChange={e => setGlucoseValue(e.target.value)} 
                  placeholder="e.g. 115" 
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 800, padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
                />
              </div>

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Measurement Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={measurementDate} 
                    onChange={e => setMeasurementDate(e.target.value)} 
                    style={{ width: '100%', fontSize: '0.85rem' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Time *</label>
                  <input 
                    type="text" 
                    required 
                    value={measurementTime} 
                    onChange={e => setMeasurementTime(e.target.value)} 
                    placeholder="e.g. 8:00 AM" 
                    style={{ width: '100%', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              {/* Context */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Measurement Context</label>
                <select 
                  value={measurementContext} 
                  onChange={e => setMeasurementContext(e.target.value)} 
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="Fasting">Fasting (Before breakfast)</option>
                  <option value="Post-Breakfast">Post-Breakfast (2 hours after)</option>
                  <option value="Before Lunch">Before Lunch</option>
                  <option value="Post-Lunch">Post-Lunch (2 hours after)</option>
                  <option value="Before Dinner">Before Dinner</option>
                  <option value="Post-Dinner">Post-Dinner (2 hours after)</option>
                  <option value="Bedtime">Bedtime Check</option>
                  <option value="Random Check">Random Check</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Optional Notes</label>
                <input 
                  type="text" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="e.g. Felt slightly dizzy before lunch" 
                  style={{ width: '100%', fontSize: '0.85rem' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#0284c7' }}>Save Result</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    No sugar measurement results recorded for this date filter. Click "+ Record Sugar Measurement" to add entry.
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
