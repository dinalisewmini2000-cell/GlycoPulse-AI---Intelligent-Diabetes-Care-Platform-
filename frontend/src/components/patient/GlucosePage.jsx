import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Trash2, X } from 'lucide-react';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
            Glucose
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Track and review your blood glucose readings.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary" 
          style={{ padding: '0.7rem 1.25rem', fontSize: '0.9rem' }}
        >
          <PlusCircle size={17} />
          <span>+ Add glucose reading</span>
        </button>
      </div>

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
                  <option value="Before breakfast">Before breakfast</option>
                  <option value="After breakfast">After breakfast</option>
                  <option value="Before lunch">Before lunch</option>
                  <option value="After lunch">After lunch</option>
                  <option value="Before dinner">Before dinner</option>
                  <option value="After dinner">After dinner</option>
                  <option value="Before bed">Before bed</option>
                  <option value="Other">Other</option>
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
          All recorded glucose readings
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Time</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Glucose</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Context</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Note</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {glucoseLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{log.date}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{log.time}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{log.value} mg/dL</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-main)' }}>{log.context}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-dim)' }}>{log.notes || '—'}</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    <button onClick={() => deleteGlucoseLog(log.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)' }}>
                      <Trash2 size={16} />
                    </button>
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
