import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { 
  Users, Stethoscope, Pill, Calendar, AlertTriangle, CheckCircle2, 
  Search, PlusCircle, Eye, Calculator, Video, VideoOff, Mic, MicOff, 
  PhoneOff, ShieldCheck, Clock, X, FileText, Sparkles 
} from 'lucide-react';

export const DoctorPortal = ({ activeTab = 'doctor_patients' }) => {
  const { currentUser, currentGlucose, setActiveTab } = useApp();

  // Patients State: dynamically loaded from stored registered patients or logged-in patient
  const [patients, setPatients] = useState(() => {
    try {
      const saved = localStorage.getItem('glycopulse_all_users');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          const patientOnly = list.filter(u => u.role === 'patient');
          if (patientOnly.length > 0) {
            return patientOnly.map(p => ({
              id: p.id,
              name: p.name,
              age: p.age || null,
              type: p.diabetesType || 'Type 1',
              lastGlucose: currentGlucose || 118,
              hba1c: '6.8',
              tirPercent: '82',
              alertStatus: 'Active Sync',
              lastVisit: 'Recent',
              nextAppointment: 'Today, 10:00 AM',
              weightKg: '72',
              phone: p.email || 'N/A',
              doctorNotes: 'Continuous Telemetry Monitoring active.'
            }));
          }
        }
      }
    } catch (e) {}
    
    // Determine realistic active patient name
    const actualPatientName = (currentUser?.role === 'patient' && currentUser?.name && !currentUser.name.includes('Doctor') && !currentUser.name.includes('Practitioner'))
      ? currentUser.name
      : 'Dinali Bhagya';

    return [{
      id: 'p-1',
      name: actualPatientName,
      age: null,
      type: 'Type 1',
      lastGlucose: currentGlucose || 118,
      hba1c: '6.8',
      tirPercent: '82',
      alertStatus: 'Active Sync',
      lastVisit: 'Today',
      nextAppointment: 'Today, 10:00 AM',
      weightKg: '72',
      phone: 'dinali@glucocare.ai',
      doctorNotes: 'Awaiting clinical tele-health checkup.'
    }];
  });

  const [prescriptions, setPrescriptions] = useState([]);
  
  // Appointments state: dynamically initialized with real patients
  const [appointments, setAppointments] = useState(() => {
    const patientName = patients[0]?.name || 'Dinali Bhagya';
    return [
      {
        id: 'apt-1',
        patientName: patientName,
        date: 'Today, 10:00 AM',
        reason: 'Continuous Glucose Monitoring & Dose Optimization Review',
        type: 'Tele-Health Video',
        status: 'Ready to Join'
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);

  // Prescription Modal State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [rxPatient, setRxPatient] = useState(() => patients[0]?.name || '');
  const [medName, setMedName] = useState('Novolog (Insulin Aspart)');
  const [dosage, setDosage] = useState('1 Unit per 10g Carbs');
  const [rxSuccess, setRxSuccess] = useState(false);

  // AI Dose Calculator State
  const [calcCarbs, setCalcCarbs] = useState(50);
  const [calcBG, setCalcBG] = useState(160);
  const [calcResult, setCalcResult] = useState(null);

  // Appointment Modal State
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [aptPatient, setAptPatient] = useState(() => patients[0]?.name || '');
  const [aptDate, setAptDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [aptTime, setAptTime] = useState('10:00 AM');
  const [aptReason, setAptReason] = useState('Routine Telemetry Checkup');
  const [aptSuccess, setAptSuccess] = useState(false);

  // Interactive Video Call Room State
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('');

  // Keep dropdown default values in sync with actual patients list
  useEffect(() => {
    if (patients.length > 0) {
      if (!rxPatient) setRxPatient(patients[0].name);
      if (!aptPatient) setAptPatient(patients[0].name);
    }
  }, [patients]);

  // Video call timer loop
  useEffect(() => {
    let timer;
    if (activeVideoCall) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeVideoCall]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Fetch Doctor data on mount if available
  useEffect(() => {
    apiService.getDoctorPatients().then(res => {
      if (res && res.status === 'success' && res.patients && res.patients.length > 0) {
        setPatients(res.patients);
        if (res.upcomingAppointments) {
          setAppointments(res.upcomingAppointments.map((a, idx) => ({
            id: 'apt-' + idx,
            patientName: a.patientName,
            date: a.date,
            reason: a.reason,
            type: 'Tele-Health Video',
            status: 'Ready to Join'
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
      status: 'Ready to Join'
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

  const highRiskPatients = patients.filter(p => (typeof p.lastGlucose === 'number' && p.lastGlucose > 180) || parseFloat(p.hba1c) > 7.5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Stethoscope size={28} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Physician Tele-Health & Clinical Command Center</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {currentUser?.name || 'Dr. Medical Practitioner'} — {currentUser?.specialty || 'Endocrinology & Diabetology'} ({currentUser?.email || 'doctor@glycopulse.ai'})
            </div>
          </div>
        </div>

        {/* Quick Tab Switcher Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab && setActiveTab('doctor_patients')}
            style={{ padding: '0.45rem 0.85rem', borderRadius: '7px', border: 'none', background: (activeTab === 'doctor_patients' || activeTab === 'doctor') ? 'var(--accent-cyan)' : 'transparent', color: (activeTab === 'doctor_patients' || activeTab === 'doctor') ? '#fff' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Patients & CGM
          </button>
          <button 
            onClick={() => setActiveTab && setActiveTab('doctor_prescriptions')}
            style={{ padding: '0.45rem 0.85rem', borderRadius: '7px', border: 'none', background: activeTab === 'doctor_prescriptions' ? 'var(--accent-cyan)' : 'transparent', color: activeTab === 'doctor_prescriptions' ? '#fff' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >
            E-Prescriptions
          </button>
          <button 
            onClick={() => setActiveTab && setActiveTab('doctor_appointments')}
            style={{ padding: '0.45rem 0.85rem', borderRadius: '7px', border: 'none', background: activeTab === 'doctor_appointments' ? 'var(--accent-cyan)' : 'transparent', color: activeTab === 'doctor_appointments' ? '#fff' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Appointments & Consults
          </button>
        </div>
      </div>

      {/* Doctor Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
        <div 
          onClick={() => setActiveTab && setActiveTab('doctor_patients')}
          className="glass-panel" 
          style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE MONITORED PATIENTS</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.3rem 0' }}>{patients.length}</div>
          <div className="badge badge-info">100% CGM Telemetry Active</div>
        </div>

        <div 
          onClick={() => setActiveTab && setActiveTab('doctor_patients')}
          className="glass-panel" 
          style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>HIGH RISK ALERTS</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: highRiskPatients.length > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', margin: '0.3rem 0' }}>
            {highRiskPatients.length}
          </div>
          {highRiskPatients.length > 0 ? (
            <div className="badge badge-danger">{highRiskPatients[0].name} (Glucose {highRiskPatients[0].lastGlucose} mg/dL)</div>
          ) : (
            <div className="badge badge-success">No Critical Alerts</div>
          )}
        </div>

        <div 
          onClick={() => setActiveTab && setActiveTab('doctor_appointments')}
          className="glass-panel" 
          style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-purple)', cursor: 'pointer', transition: 'transform 0.2s' }}
        >
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>SCHEDULED CONSULTATIONS</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.3rem 0' }}>{appointments.length}</div>
          <div className="badge badge-success">Virtual Video Rooms Ready</div>
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

              <button onClick={() => { if(patients.length > 0) setRxPatient(patients[0].name); setShowPrescriptionModal(true); }} className="btn-glow" style={{ fontSize: '0.82rem' }}>
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
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{p.name}{p.age ? ` (${p.age}y)` : ''}</td>
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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Carbohydrate Load (g)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button type="button" onClick={() => setCalcCarbs(p => Math.max(0, Number(p) - 5))} style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer' }}>-</button>
                  <input 
                    type="number" 
                    value={calcCarbs} 
                    onChange={e => setCalcCarbs(e.target.value)} 
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center', fontWeight: 700 }}
                  />
                  <button type="button" onClick={() => setCalcCarbs(p => Number(p) + 5)} style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer' }}>+</button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Current Glucose (mg/dL)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button type="button" onClick={() => setCalcBG(p => Math.max(30, Number(p) - 5))} style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer' }}>-</button>
                  <input 
                    type="number" 
                    value={calcBG} 
                    onChange={e => setCalcBG(e.target.value)} 
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center', fontWeight: 700 }}
                  />
                  <button type="button" onClick={() => setCalcBG(p => Number(p) + 5)} style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer' }}>+</button>
                </div>
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
              <button onClick={() => { if(patients.length > 0) setRxPatient(patients[0].name); setShowPrescriptionModal(true); }} className="btn-glow">
                <PlusCircle size={16} />
                <span>New E-Prescription</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              {prescriptions.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No active prescriptions issued yet. Click "New E-Prescription" to issue a prescription to a patient.
                </div>
              ) : (
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
              )}
            </div>
          </div>

        </div>
      )}

      {/* View 3: Appointments & Consultations */}
      {activeTab === 'doctor_appointments' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tele-Health Appointments & Consult Schedule</h3>
            <button onClick={() => { if(patients.length > 0) setAptPatient(patients[0].name); setShowAppointmentModal(true); }} className="btn-glow">
              <Calendar size={16} />
              <span>Schedule New Consult</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {appointments.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No scheduled consults. Click "Schedule New Consult" to add an appointment for a patient.
              </div>
            ) : (
              appointments.map(apt => (
                <div key={apt.id} className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{apt.type.toUpperCase()}</span>
                    <div className="badge badge-info">
                      <Clock size={12} />
                      <span>{apt.date}</span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.5rem 0 0.2rem 0' }}>{apt.patientName}</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Reason: {apt.reason}</p>

                  <button 
                    onClick={() => {
                      setActiveVideoCall(apt);
                      setCallNotes(`Clinical Tele-Health session for ${apt.patientName}. Patient telemetry status verified.`);
                    }} 
                    className="btn-glow" 
                    style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'center' }}
                  >
                    <Video size={15} />
                    <span>Launch In-App HD Video Room</span>
                  </button>
                </div>
              ))
            )}
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
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedPatientModal.type} Diabetes{selectedPatientModal.age ? ` | Age: ${selectedPatientModal.age}` : ''}</span>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, padding: '1rem' }}>
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
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 600 }}
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.name} style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>{p.name} ({p.type})</option>
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
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Dosage & Timing Instructions</label>
                  <input 
                    type="text" 
                    value={dosage} 
                    onChange={e => setDosage(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Schedule Tele-Health Consultation</h3>
            
            {aptSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-emerald)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Appointment Scheduled!</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Video Room generated & saved to consult schedule.</p>
              </div>
            ) : (
              <form onSubmit={handleScheduleApt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Select Patient</label>
                  <select 
                    value={aptPatient} 
                    onChange={e => setAptPatient(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 600 }}
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.name} style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>{p.name} ({p.type})</option>
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
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Time</label>
                    <input 
                      type="text" 
                      value={aptTime} 
                      onChange={e => setAptTime(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
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
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>Confirm & Schedule Room</button>
                  <button type="button" onClick={() => setShowAppointmentModal(false)} className="btn-outline">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Interactive In-App HD Tele-Health Video Call Room Modal */}
      {activeVideoCall && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '980px', height: '88vh', maxHeight: '720px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '16px', overflow: 'hidden' }}>
            
            {/* Video Call Header */}
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>HD Tele-Health Consult: {activeVideoCall.patientName}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Encrypted WebRTC Room | Call Duration: {formatTimer(callDuration)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={13} />
                  <span>HIPAA Compliant Session</span>
                </span>
                <button 
                  onClick={() => setActiveVideoCall(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                  title="Close Consultation Room"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Video Call Body (Left Video Area + Right Clinical Panel) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, minHeight: 0 }}>
              
              {/* Left: Interactive Video Screen */}
              <div style={{ background: '#0b1329', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderRight: '1px solid var(--border-color)' }}>
                
                {/* Patient Remote Video Screen Container */}
                <div style={{ width: '100%', flex: 1, background: 'linear-gradient(145deg, #1e293b, #0f172a)', borderRadius: '12px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  
                  {isVideoOn ? (
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#fff', boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)', marginBottom: '1rem' }}>
                        {activeVideoCall.patientName.charAt(0)}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{activeVideoCall.patientName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span>
                        Camera Active • Audio Connected (1080p HD)
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <VideoOff size={48} style={{ marginBottom: '0.5rem' }} />
                      <div>Patient Video Muted</div>
                    </div>
                  )}

                  {/* Doctor Self-Preview Box */}
                  <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '120px', height: '90px', background: '#020617', borderRadius: '8px', border: '2px solid var(--accent-cyan)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <Stethoscope size={20} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.65rem', color: '#fff', marginTop: '0.2rem', fontWeight: 700 }}>You (Doctor)</span>
                  </div>
                </div>

                {/* Floating Call Controls Toolbar */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', background: 'rgba(15, 23, 42, 0.95)', padding: '0.6rem 1.2rem', borderRadius: '40px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
                  <button 
                    onClick={() => setIsMicOn(!isMicOn)}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', background: isMicOn ? 'var(--bg-secondary)' : '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                  >
                    {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                  </button>

                  <button 
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', background: isVideoOn ? 'var(--bg-secondary)' : '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
                  >
                    {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
                  </button>

                  <button 
                    onClick={() => {
                      setRxPatient(activeVideoCall.patientName);
                      setShowPrescriptionModal(true);
                    }}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', background: 'var(--accent-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Issue E-Prescription"
                  >
                    <Pill size={18} />
                  </button>

                  <button 
                    onClick={() => setActiveVideoCall(null)}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="End Consultation Call"
                  >
                    <PhoneOff size={18} />
                  </button>
                </div>

              </div>

              {/* Right: Live Clinical Side Panel */}
              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Live Patient Telemetry</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-primary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Current Glucose</span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{currentGlucose || 118} mg/dL</span>
                    </div>
                    <div style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-primary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Latest HbA1c</span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-purple)' }}>6.8%</span>
                    </div>
                    <div style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-primary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Time-In-Range</span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>82%</span>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={14} />
                    <span>Consultation Impressions</span>
                  </label>
                  <textarea 
                    value={callNotes}
                    onChange={e => setCallNotes(e.target.value)}
                    placeholder="Record clinical observations, dietary adjustments, or medication dosage changes..."
                    style={{ flex: 1, width: '100%', minHeight: '120px', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.82rem', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button 
                    onClick={() => {
                      setRxPatient(activeVideoCall.patientName);
                      setShowPrescriptionModal(true);
                    }}
                    className="btn-glow" 
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
                  >
                    <Pill size={15} />
                    <span>Issue E-Prescription</span>
                  </button>

                  <button 
                    onClick={() => setActiveVideoCall(null)}
                    className="btn-outline" 
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    <PhoneOff size={15} />
                    <span>End & Save Consult</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
