import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine 
} from 'recharts';
import { 
  Activity, PlusCircle, FileText, Heart, Scale, ShieldAlert, 
  CheckCircle2, Clock, Stethoscope, TrendingUp, X, Filter, 
  Calendar, AlertTriangle, Pill, UserCheck
} from 'lucide-react';

export const PatientHistory = () => {
  const { currentUser, healthHistoryLogs, addHealthHistoryLog, glucoseLogs } = useApp();

  const [activeCategory, setActiveCategory] = useState('All');
  const [showLogModal, setShowLogModal] = useState(false);

  // New History Entry Modal Form State
  const [category, setCategory] = useState('Blood Pressure');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('Normal');
  const [notes, setNotes] = useState('');

  const patientName = currentUser?.name || 'Dinali Bhagya';
  const diabetesType = currentUser?.diabetesType || 'Type 1 Diabetes';

  // Filter logs by active category
  const filteredLogs = activeCategory === 'All'
    ? healthHistoryLogs
    : healthHistoryLogs.filter(item => item.category.toLowerCase().includes(activeCategory.toLowerCase()));

  // Prepare trend chart data from history
  const chartData = [
    { date: 'Aug 08', bpSystolic: 124, weight: 69.2, hba1c: 6.8 },
    { date: 'Aug 10', bpSystolic: 122, weight: 69.0, hba1c: 6.7 },
    { date: 'Aug 11', bpSystolic: 120, weight: 68.8, hba1c: 6.6 },
    { date: 'Aug 12', bpSystolic: 119, weight: 68.6, hba1c: 6.5 },
    { date: 'Aug 13', bpSystolic: 118, weight: 68.5, hba1c: 6.5 },
    { date: 'Aug 14', bpSystolic: 118, weight: 68.5, hba1c: 6.5 }
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;

    addHealthHistoryLog({
      category,
      value: value.trim(),
      status,
      notes: notes.trim() || 'Patient self-reported update'
    });

    setValue('');
    setNotes('');
    setShowLogModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock size={20} color="var(--accent-emerald)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                PATIENT MEDICAL & MEASUREMENT HISTORY
              </span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '0.3rem', color: 'var(--text-main)' }}>
              Clinical History & Vitals Timeline
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Comprehensive longitudinal record of blood pressure, body metrics, diagnoses, and lab results for {patientName}.
            </p>
          </div>

          <button 
            onClick={() => setShowLogModal(true)} 
            className="btn-glow" 
            style={{ padding: '0.85rem 1.4rem', fontSize: '0.92rem' }}
          >
            <PlusCircle size={18} />
            <span>Record Measurement / Condition</span>
          </button>
        </div>
      </div>

      {/* Patient Health Overview & Clinical Profile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
        
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: '1.35rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <UserCheck size={20} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Diagnosed Conditions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Primary Condition:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{diabetesType}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Diagnosis Date:</span>
              <span style={{ fontWeight: 600 }}>March 2019 (7 Years)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Retinopathy Screening:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>Mild Stage 1 (Stable)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Renal Status:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>eGFR 95 (Healthy)</span>
            </div>
          </div>
        </div>

        {/* Current Regimen & Medications Card */}
        <div className="glass-panel" style={{ padding: '1.35rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <Pill size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Active Prescriptions & Regimen</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rapid Insulin:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>Lispro (1:10 Carb Ratio)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Basal Insulin:</span>
              <span style={{ fontWeight: 600 }}>Glargine 18 U (Bedtime)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Oral Hypoglycemic:</span>
              <span style={{ fontWeight: 600 }}>Metformin 500mg Twice Daily</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Allergies & Warnings:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>Penicillin (Mild)</span>
            </div>
          </div>
        </div>

        {/* Vitals Summary Card */}
        <div className="glass-panel" style={{ padding: '1.35rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <Activity size={20} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Latest Vitals Summary</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BLOOD PRESSURE</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>118/76 mmHg</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BODY WEIGHT</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>68.5 kg</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>HEART RATE</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '0.2rem' }}>72 bpm</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>HBA1C TARGET</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '0.2rem' }}>6.5 %</div>
            </div>
          </div>
        </div>

      </div>

      {/* Recharts Vitals & Measurements Trend Graph */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Longitudinal Vitals & BP Trajectory</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Historical Systolic Blood Pressure (mmHg) vs Weight (kg) over time</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-cyan)' }}></span>
              Systolic BP (mmHg)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-emerald)' }}></span>
              Body Weight (kg)
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis domain={[50, 150]} stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'rgba(10, 16, 32, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} 
              />
              <ReferenceLine y={120} label={{ value: 'BP Target (120)', fill: '#10b981', fontSize: 11 }} stroke="#10b981" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="bpSystolic" name="Systolic BP" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#bpGrad)" />
              <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#wtGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Measurement & Condition History Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        
        {/* Table Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Historical Logs & Diagnostic Records</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete audit trail of all recorded health conditions and physical measurements</p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: '8px' }}>
            {['All', 'Blood Pressure', 'Weight', 'HbA1c', 'Condition'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none',
                  background: activeCategory === cat ? 'var(--accent-cyan)' : 'transparent',
                  color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Measurement / Finding</th>
                <th style={{ padding: '0.75rem 1rem' }}>Clinical Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Notes & Diagnostic Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No historical logs found for category "{activeCategory}". Click <strong>"Record Measurement"</strong> to add an entry.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{log.date}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-info">{log.category}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {log.value}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span 
                        style={{
                          padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                          background: log.status.toLowerCase().includes('normal') || log.status.toLowerCase().includes('target') || log.status.toLowerCase().includes('healthy') || log.status.toLowerCase().includes('optimal')
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                          color: log.status.toLowerCase().includes('normal') || log.status.toLowerCase().includes('target') || log.status.toLowerCase().includes('healthy') || log.status.toLowerCase().includes('optimal')
                            ? 'var(--accent-emerald)'
                            : 'var(--accent-amber)'
                        }}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                      {log.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Measurement / Health Condition Modal */}
      {showLogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Record Vital / Health Condition</h3>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  CATEGORY / TYPE
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 600 }}
                >
                  <option value="Blood Pressure" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Blood Pressure (mmHg)</option>
                  <option value="Body Weight" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Body Weight & BMI (kg)</option>
                  <option value="HbA1c Lab" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>HbA1c Lab Result (%)</option>
                  <option value="Heart Rate" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Heart Rate & SpO2 (bpm)</option>
                  <option value="Health Condition" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Diagnosed Health Condition</option>
                  <option value="Kidney Function" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Renal / Kidney Lab Result</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  VALUE / DIAGNOSTIC RESULT
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 120/80 mmHg or 68.5 kg"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  CLINICAL STATUS TAG
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 600 }}
                >
                  <option value="Normal" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Normal / Optimal</option>
                  <option value="Target Met" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Target Met</option>
                  <option value="Elevated" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Elevated / Attention</option>
                  <option value="Stage 1" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Stage 1 Mild</option>
                  <option value="Healthy" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Healthy / Normal Range</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  NOTES / CLINICAL DETAILS
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Taken with digital cuff after 5m rest"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>
                  Save History Entry
                </button>
                <button type="button" onClick={() => setShowLogModal(false)} className="btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
