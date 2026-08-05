import React, { useState } from 'react';
import { Users, Stethoscope, Pill, Calendar, AlertTriangle, CheckCircle2, Search, PlusCircle } from 'lucide-react';

export const DoctorPortal = () => {
  const [patients] = useState([
    { id: 'pat-101', name: 'Sarah Jenkins', age: 34, type: 'Type 1', lastGlucose: 118, hba1c: 6.3, tirPercent: 84, alertStatus: 'Stable', lastVisit: '2026-06-15', nextAppointment: '2026-08-20' },
    { id: 'pat-102', name: 'Marcus Vance', age: 58, type: 'Type 2', lastGlucose: 195, hba1c: 7.8, tirPercent: 58, alertStatus: 'Attention Needed (Hyperglycemia)', lastVisit: '2026-05-10', nextAppointment: '2026-08-08' },
    { id: 'pat-103', name: 'Elena Rostova', age: 29, type: 'Gestational', lastGlucose: 98, hba1c: 5.9, tirPercent: 91, alertStatus: 'Optimal Control', lastVisit: '2026-07-18', nextAppointment: '2026-08-15' }
  ]);

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPat, setSelectedPat] = useState('Sarah Jenkins');
  const [medName, setMedName] = useState('Novolog (Insulin Aspart)');
  const [dosage, setDosage] = useState('1 Unit per 10g Carbs');
  const [rxSuccess, setRxSuccess] = useState(false);

  const handleIssueRx = (e) => {
    e.preventDefault();
    setRxSuccess(true);
    setTimeout(() => {
      setRxSuccess(false);
      setShowPrescriptionModal(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Stethoscope size={28} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Physician Tele-Health & Remote Monitoring Dashboard</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Dr. Robert Vance, MD — Endocrinology & Diabetology</div>
          </div>
        </div>
      </div>

      {/* Quick Doctor Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE MONITORED PATIENTS</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.3rem 0' }}>48</div>
          <div className="badge badge-info">100% CGM Telemetry Active</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>PATIENTS NEEDING ATTENTION</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-rose)', margin: '0.3rem 0' }}>1</div>
          <div className="badge badge-danger">Marcus Vance (HbA1c 7.8%)</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>APPOINTMENTS TODAY</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.3rem 0' }}>2</div>
          <div className="badge badge-success">Virtual Tele-Consult Ready</div>
        </div>
      </div>

      {/* Patient Directory Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Patient Clinical Overview</h3>
          
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button onClick={() => setShowPrescriptionModal(true)} className="btn-glow">
              <Pill size={16} />
              <span>Issue E-Prescription</span>
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Patient Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Diabetes Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Real-Time Glucose</th>
                <th style={{ padding: '0.75rem 1rem' }}>HbA1c</th>
                <th style={{ padding: '0.75rem 1rem' }}>TIR %</th>
                <th style={{ padding: '0.75rem 1rem' }}>Clinical Alert Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Next Appointment</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{p.name} ({p.age}y)</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{p.type}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{p.lastGlucose} mg/dL</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{p.hba1c}%</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: p.tirPercent > 70 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{p.tirPercent}%</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${p.alertStatus.includes('Attention') ? 'badge-danger' : 'badge-success'}`}>
                      {p.alertStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{p.nextAppointment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* E-Prescription Modal */}
      {showPrescriptionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Issue E-Prescription & Dose Adjustment</h3>
            
            {rxSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-emerald)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>E-Prescription Sent!</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Synced directly to patient wallet and preferred pharmacy.</p>
              </div>
            ) : (
              <form onSubmit={handleIssueRx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Select Patient</label>
                  <select 
                    value={selectedPat} 
                    onChange={e => setSelectedPat(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                  >
                    <option value="Sarah Jenkins">Sarah Jenkins (Type 1)</option>
                    <option value="Marcus Vance">Marcus Vance (Type 2)</option>
                    <option value="Elena Rostova">Elena Rostova (Gestational)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Medication Name</label>
                  <input 
                    type="text" 
                    value={medName} 
                    onChange={e => setMedName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Dosage & Timing Instructions</label>
                  <input 
                    type="text" 
                    value={dosage} 
                    onChange={e => setDosage(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>Sign & Issue Rx</button>
                  <button type="button" onClick={() => setShowPrescriptionModal(false)} className="btn-outline">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
