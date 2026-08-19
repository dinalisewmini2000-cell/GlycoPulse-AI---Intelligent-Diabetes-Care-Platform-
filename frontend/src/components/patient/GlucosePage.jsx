import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Trash2, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function getGlucoseContextDetails(value, contextStr) {
  const num = Number(value);
  const lowerCtx = (contextStr || '').toLowerCase();

  let rangeLabel = '70–99 mg/dL (Fasting target)';
  let isWithinRange = num >= 70 && num <= 99;
  let status = 'Within target range';
  let riskLevel = 'Normal';

  if (lowerCtx.includes('after') || lowerCtx.includes('post-prandial')) {
    rangeLabel = '< 140 mg/dL (Post-meal target)';
    isWithinRange = num < 140;
    status = isWithinRange ? 'Within target range' : num < 70 ? 'Below target range' : 'Above target range';
  } else if (lowerCtx.includes('before lunch') || lowerCtx.includes('before dinner') || lowerCtx.includes('before meal')) {
    rangeLabel = '80–130 mg/dL (Pre-meal target)';
    isWithinRange = num >= 80 && num <= 130;
    status = isWithinRange ? 'Within target range' : num < 80 ? 'Below target range' : 'Above target range';
  } else if (lowerCtx.includes('bed')) {
    rangeLabel = '100–140 mg/dL (Bedtime target)';
    isWithinRange = num >= 100 && num <= 140;
    status = isWithinRange ? 'Within target range' : num < 100 ? 'Below target range' : 'Above target range';
  } else if (lowerCtx.includes('not provided') || lowerCtx.includes('other')) {
    rangeLabel = 'Measurement context not provided';
    status = 'Reported';
    isWithinRange = true;
  } else {
    rangeLabel = '70–99 mg/dL (Fasting target)';
    isWithinRange = num >= 70 && num <= 99;
    status = isWithinRange ? 'Within target range' : num < 70 ? 'Below target range' : 'Above target range';
  }

  if (status === 'Above target range') riskLevel = 'Needs attention';
  if (status === 'Below target range') riskLevel = 'Hypoglycemia risk (Low)';

  return { rangeLabel, status, isWithinRange, riskLevel };
}

export function calculateGlucoseTrend(logs) {
  if (!Array.isArray(logs) || logs.length < 2) {
    return { text: 'Not enough previous readings to determine a trend.', direction: 'neutral' };
  }

  const latest = Number(logs[0].value);
  const previous = Number(logs[1].value);
  const diff = latest - previous;

  if (diff > 0) {
    return { text: `Glucose trend: Increased (+${diff} mg/dL compared to previous reading)`, direction: 'up', diff };
  } else if (diff < 0) {
    return { text: `Glucose trend: Decreased (${diff} mg/dL compared to previous reading)`, direction: 'down', diff };
  }

  return { text: 'Glucose trend: Stable (No change compared to previous reading)', direction: 'stable', diff: 0 };
}

export const GlucosePage = ({ showAddModal, onCloseAddModal }) => {
  const { glucoseLogs, addGlucoseLog, deleteGlucoseLog } = useApp();

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [value, setValue] = useState('');
  const [context, setContext] = useState('Before breakfast');
  const [notes, setNotes] = useState('');

  const isOpen = showAddModal || isModalOpen;
  const handleClose = () => {
    setIsModalOpen(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value) return;

    addGlucoseLog({
      date,
      time,
      value: Number(value),
      context,
      notes
    });

    setValue('');
    setNotes('');
    handleClose();
  };

  const latestLog = glucoseLogs[0];
  const trendInfo = calculateGlucoseTrend(glucoseLogs);
  const details = latestLog ? getGlucoseContextDetails(latestLog.value, latestLog.context) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
            Blood Glucose Tracking
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Record and review your blood sugar logs over time.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary" 
          style={{ padding: '0.65rem 1.15rem', fontSize: '0.88rem' }}
        >
          <PlusCircle size={16} />
          <span>+ Add glucose reading</span>
        </button>
      </div>

      {/* Latest Glucose Summary & Trend */}
      {latestLog && details && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                Most Recent Reading ({latestLog.date} — {latestLog.time})
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                  {latestLog.value}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  mg/dL
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: details.isWithinRange ? '#166534' : '#991b1b' }}>
                  {details.status}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Target Range: {details.rangeLabel}
                </span>
              </div>
            </div>

            {/* Trend Indicator */}
            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', maxWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                {trendInfo.direction === 'up' && <TrendingUp size={16} color="#dc2626" />}
                {trendInfo.direction === 'down' && <TrendingDown size={16} color="#16a34a" />}
                {trendInfo.direction === 'stable' && <Minus size={16} color="var(--text-muted)" />}
                <span>{trendInfo.text}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                A single result above range does not establish a diagnosis. Discuss repeated abnormal results with your physician.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Glucose Reading Modal */}
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '1.5rem', background: 'var(--bg-secondary)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Add glucose reading
              </h3>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Date</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Time</label>
                  <input type="text" required value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. 8:00 AM" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Blood glucose (mg/dL)</label>
                <input type="number" required min="30" max="500" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 120" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Measurement context</label>
                <select value={context} onChange={e => setContext(e.target.value)} style={{ width: '100%' }}>
                  <option value="Before breakfast">Before breakfast (Fasting)</option>
                  <option value="After breakfast">After breakfast (Post-prandial)</option>
                  <option value="Before lunch">Before lunch</option>
                  <option value="After lunch">After lunch</option>
                  <option value="Before dinner">Before dinner</option>
                  <option value="After dinner">After dinner</option>
                  <option value="Before bed">Before bed</option>
                  <option value="Measurement context not provided">Measurement context not provided</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Optional note</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Fasting check or felt tired" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={handleClose} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save reading</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Glucose Readings Log Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
          All recorded glucose readings ({glucoseLogs.length})
        </h3>

        {glucoseLogs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No previous records available. Use the button above to log your first reading.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Time</th>
                  <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Glucose</th>
                  <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Context</th>
                  <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Range</th>
                  <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {glucoseLogs.map((log) => {
                  const ctxDetails = getGlucoseContextDetails(log.value, log.context);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{log.date}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{log.time}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{log.value} mg/dL</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-main)' }}>{log.context}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{ctxDetails.rangeLabel}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button onClick={() => deleteGlucoseLog(log.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)' }}>
                          <Trash2 size={16} />
                        </button>
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
