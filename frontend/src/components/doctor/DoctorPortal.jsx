import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { 
  Users, Stethoscope, Pill, Calendar, AlertTriangle, CheckCircle2, 
  Search, PlusCircle, Eye, Calculator, Video, Clock, X, FileText, Sparkles 
} from 'lucide-react';

export const DoctorPortal = ({ activeTab = 'doctor_patients' }) => {
  const { currentUser } = useApp();

  const [patients, setPatients] = useState([
    { id: 'pat-976', name: 'Dinali Bhagya', age: 24, type: 'Type 1', lastGlucose: 118, hba1c: 6.3, tirPercent: 84, alertStatus: 'Stable', lastVisit: '2026-06-15', nextAppointment: '2026-08-20', weightKg: 64, phone: '+1 555 349-2011', doctorNotes: 'Patient adhering well to 1:10 carb ratio.' },
    { id: 'pat-102', name: 'Marcus Vance', age: 58, type: 'Type 2', lastGlucose: 195, hba1c: 7.8, tirPercent: 58, alertStatus: 'Attention Needed (Hyperglycemia)', lastVisit: '2026-05-10', nextAppointment: '2026-08-08', weightKg: 88, phone: '+1 555 882-1920', doctorNotes: 'Recommend increasing Metformin to 1000mg BID.' },
    { id: 'pat-103', name: 'Elena Rostova', age: 29, type: 'Gestational', lastGlucose: 98, hba1c: 5.9, tirPercent: 91, alertStatus: 'Optimal Control', lastVisit: '2026-07-18', nextAppointment: '2026-08-15', weightKg: 68, phone: '+1 555 233-9011', doctorNotes: 'Post-prandial spikes under control with low-GI diet.' }
  ]);

  const [prescriptions, setPrescriptions] = useState([
    { id: 'rx-1', patientName: 'Dinali Bhagya', medName: 'Novolog (Insulin Aspart)', dose: '1 Unit per 10g Carbs', date: '2026-07-15', status: 'Active In Wallet' },
    { id: 'rx-2', patientName: 'Marcus Vance', medName: 'Metformin Hydrochloride 500mg', dose: '1 Tablet twice daily with meals', date: '2026-06-01', status: 'Refill Due' },
    { id: 'rx-3', patientName: 'Elena Rostova', medName: 'Lantus Solostar (Insulin Glargine)', dose: '8 Units at Bedtime', date: '2026-07-20', status: 'Active In Wallet' }
  ]);

  const [appointments, setAppointments] = useState([
    { id: 'apt-1', patientName: 'Marcus Vance', date: '2026-08-08 10:00 AM', reason: 'HbA1c & Medication Review', type: 'Tele-Health Video', link: 'https://glycopulse.ai/telehealth/vance-882' },
    { id: 'apt-2', patientName: 'Elena Rostova', date: '2026-08-15 02:30 PM', reason: 'Gestational Diabetes Follow-up', type: 'In-Clinic Room 304', link: '' },
    { id: 'apt-3', patientName: 'Dinali Bhagya', date: '2026-08-20 11:15 AM', reason: 'Quarterly CGM Telemetry Review', type: 'Tele-Health Video', link: 'https://glycopulse.ai/telehealth/dinali-bhagya' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);

  // Prescription Modal State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [rxPatient, setRxPatient] = useState('Dinali Bhagya');
  const [medName, setMedName] = useState('Novolog (Insulin Aspart)');
  const [dosage, setDosage] = useState('1 Unit per 10g Carbs');
  const [rxSuccess, setRxSuccess] = useState(false);

  // AI Dose Calculator State
  const [calcCarbs, setCalcCarbs] = useState(50);
  const [calcBG, setCalcBG] = useState(160);
  const [calcResult, setCalcResult] = useState(null);

  // Appointment Modal State
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [aptPatient, setAptPatient] = useState('Sarah Jenkins');
  const [aptDate, setAptDate] = useState('2026-08-25');
  const [aptTime, setAptTime] = useState('10:00 AM');
  const [aptReason, setAptReason] = useState('Routine Telemetry Checkup');
  const [aptSuccess, setAptSuccess] = useState(false);

  // Fetch Doctor data on mount
  useEffect(() => {
    apiService.getDoctorPatients().then(res => {
      if (res && res.status === 'success') {
        if (res.patients) setPatients(res.patients);
        if (res.upcomingAppointments) {
          setAppointments(res.upcomingAppointments.map((a, idx) => ({
            id: 'apt-' + idx,
            patientName: a.patientName,
            date: a.date,
            reason: a.reason,
            type: 'Tele-Health Video',
            link: `https://glycopulse.ai/telehealth/${a.patientName.toLowerCase().replace(' ', '-')}`
          })));
        }
      }
    });
  }, []);

  const handleIssueRx = (e) => {
    e.preventDefault();
    const newRx = {
      id: 'rx-' + Date.now(),
      patientName: rxPatient,
      medName,
      dose: dosage,
      date: new Date().toISOString().split('T')[0],
      status: 'Active In Wallet'
    };
    setPrescriptions(prev => [newRx, ...prev]);
    apiService.addPrescription(newRx);
    setRxSuccess(true);
    setTimeout(() => {
      setRxSuccess(false);
      setShowPrescriptionModal(false);
    }, 1200);
  };

  const handleCalculateDose = () => {
    // Standard clinical formula: (Carbs / ICR) + ((Current BG - Target BG) / ISF)
    const targetBG = 100;
    const icr = 10; // 1 unit per 10g carbs
    const isf = 50; // 1 unit lowers BG by 50 mg/dL
    
    const carbDose = calcCarbs / icr;
    const correctionDose = Math.max(0, (calcBG - targetBG) / isf);
    const totalDose = (carbDose + correctionDose).toFixed(1);
    
    setCalcResult({
      carbDose: carbDose.toFixed(1),
      correctionDose: correctionDose.toFixed(1),
      totalDose
    });
  };

  const handleScheduleApt = (e) => {
    e.preventDefault();
    const newApt = {
      id: 'apt-' + Date.now(),
      patientName: aptPatient,
      date: `${aptDate} ${aptTime}`,
      reason: aptReason,
      type: 'Tele-Health Video',
      link: `https://glycopulse.ai/telehealth/${aptPatient.toLowerCase().replace(' ', '-')}-${Date.now().toString().slice(-4)}`
    };
    setAppointments(prev => [newApt, ...prev]);
    setAptSuccess(true);
    setTimeout(() => {
      setAptSuccess(false);
      setShowAppointmentModal(false);
    }, 1200);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Stethoscope size={28} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Physician Tele-Health & Clinical Command Center</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {currentUser?.name || 'Dr. Robert Vance, MD'} — {currentUser?.specialty || 'Endocrinology & Diabetology'} ({currentUser?.email || 'doctor@glucocare.ai'})
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE MONITORED PATIENTS</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.3rem 0' }}>{patients.length}</div>
          <div className="badge badge-info">100% CGM Telemetry Active</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>HIGH RISK ALERTS</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-rose)', margin: '0.3rem 0' }}>
            {patients.filter(p => p.hba1c > 7.0 || p.lastGlucose > 180).length}
          </div>
          <div className="badge badge-danger">Marcus Vance (HbA1c 7.8%)</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>SCHEDULED CONSULTATIONS</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.3rem 0' }}>{appointments.length}</div>
          <div className="badge badge-success">Virtual Video Links Ready</div>
        </div>
      </div>

      {/* View 1: Patient Roster & CGM Telemetry */}
      {(activeTab === 'doctor_patients' || activeTab === 'doctor') && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Patient Clinical Roster & CGM Telemetry</h3>
            
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search patient or diagnosis..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem 0.5rem 2.2rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <button onClick={() => setShowPrescriptionModal(true)} className="btn-glow" style={{ fontSize: '0.82rem' }}>
                <Pill size={16} />
                <span>Issue E-Rx</span>
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
                  <th style={{ padding: '0.75rem 1rem' }}>Alert Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Next Visit</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{p.name} ({p.age}y)</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{p.type}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: p.lastGlucose > 180 ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>{p.lastGlucose} mg/dL</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{p.hba1c}%</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: p.tirPercent > 70 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{p.tirPercent}%</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${p.alertStatus.includes('Attention') ? 'badge-danger' : 'badge-success'}`}>
                        {p.alertStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{p.nextAppointment}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button onClick={() => setSelectedPatientModal(p)} className="btn-outline" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                        <Eye size={14} />
                        <span>View Chart</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: E-Prescriptions & AI Dose Calculator */}
      {activeTab === 'doctor_prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* AI Bolus & Basal Dose Calculator */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-purple)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <Calculator size={22} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Clinical Insulin Dose Calculator</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Carbohydrate Load (g)</label>
                <input 
                  type="number" 
                  value={calcCarbs} 
                  onChange={e => setCalcCarbs(e.target.value)} 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: 'var(--border-color)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Current Glucose (mg/dL)</label>
                <input 
                  type="number" 
                  value={calcBG} 
                  onChange={e => setCalcBG(e.target.value)} 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: 'var(--border-color)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={handleCalculateDose} className="btn-glow" style={{ width: '100%', justifyContent: 'center' }}>
                  <Sparkles size={16} />
                  <span>Calculate Dose</span>
                </button>
              </div>
            </div>

            {calcResult && (
              <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meal Carb Dose:</span>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-purple)' }}>{calcResult.carbDose} Units</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correction Dose:</span>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>{calcResult.correctionDose} Units</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RECOMMENDED TOTAL BOLUS:</span>
                  <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent-emerald)' }}>{calcResult.totalDose} Units</div>
                </div>
              </div>
            )}
          </div>

          {/* Active E-Prescriptions Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>E-Prescription History & Digital Wallet Sync</h3>
              <button onClick={() => setShowPrescriptionModal(true)} className="btn-glow">
                <PlusCircle size={16} />
                <span>New E-Prescription</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Patient</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Medication Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Dosage & Timing</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Prescribed Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map(rx => (
                    <tr key={rx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{rx.patientName}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{rx.medName}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{rx.dose}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{rx.date}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${rx.status.includes('Active') ? 'badge-success' : 'badge-warning'}`}>
                          {rx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* View 3: Appointments & Consultations */}
      {activeTab === 'doctor_appointments' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tele-Health Appointments & Consult Schedule</h3>
            <button onClick={() => setShowAppointmentModal(true)} className="btn-glow">
              <Calendar size={16} />
              <span>Schedule New Consult</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {appointments.map(apt => (
              <div key={apt.id} className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>{apt.type.toUpperCase()}</span>
                  <div className="badge badge-info">
                    <Clock size={12} />
                    <span>{apt.date}</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0 0.2rem 0' }}>{apt.patientName}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Reason: {apt.reason}</p>

                {apt.link ? (
                  <a href={apt.link} target="_blank" rel="noreferrer" className="btn-glow" style={{ fontSize: '0.8rem', justifyContent: 'center', textDecoration: 'none' }}>
                    <Video size={15} />
                    <span>Launch HD Video Room</span>
                  </a>
                ) : (
                  <button className="btn-outline" style={{ fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}>
                    Check-in Room 304
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Telemetry Detail Modal */}
      {selectedPatientModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedPatientModal.name}</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedPatientModal.type} Diabetes | Age: {selectedPatientModal.age}</span>
              </div>
              <button onClick={() => setSelectedPatientModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CURRENT GLUCOSE</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{selectedPatientModal.lastGlucose} mg/dL</div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>LATEST HbA1c</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{selectedPatientModal.hba1c}%</div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TIR PERCENT</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{selectedPatientModal.tirPercent}%</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>DOCTOR CLINICAL NOTES & IMPRESSIONS</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.3rem' }}>"{selectedPatientModal.doctorNotes}"</p>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={() => { setRxPatient(selectedPatientModal.name); setSelectedPatientModal(null); setShowPrescriptionModal(true); }} className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>
                <Pill size={16} />
                <span>Issue Prescription</span>
              </button>
              <button onClick={() => setSelectedPatientModal(null)} className="btn-outline">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* E-Prescription Modal */}
      {showPrescriptionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Issue E-Prescription & Dose Adjustment</h3>
            
            {rxSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-emerald)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>E-Prescription Sent!</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Synced directly to patient digital wallet.</p>
              </div>
            ) : (
              <form onSubmit={handleIssueRx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Select Patient</label>
                  <select 
                    value={rxPatient} 
                    onChange={e => setRxPatient(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.type})</option>
                    ))}
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

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Schedule Tele-Health Consultation</h3>
            
            {aptSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-emerald)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Appointment Scheduled!</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Video Link generated & sent to patient calendar.</p>
              </div>
            ) : (
              <form onSubmit={handleScheduleApt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Select Patient</label>
                  <select 
                    value={aptPatient} 
                    onChange={e => setAptPatient(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.type})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Date</label>
                    <input 
                      type="date" 
                      value={aptDate} 
                      onChange={e => setAptDate(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Time</label>
                    <input 
                      type="text" 
                      value={aptTime} 
                      onChange={e => setAptTime(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Consultation Reason</label>
                  <input 
                    type="text" 
                    value={aptReason} 
                    onChange={e => setAptReason(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>Confirm & Send Link</button>
                  <button type="button" onClick={() => setShowAppointmentModal(false)} className="btn-outline">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
