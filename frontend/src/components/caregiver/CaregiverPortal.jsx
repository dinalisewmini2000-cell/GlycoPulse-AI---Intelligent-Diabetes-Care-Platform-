import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { 
  HeartHandshake, Bell, ShieldAlert, CheckCircle2, PhoneCall, 
  Clock, Send, AlertCircle, PlusCircle, Check, MessageSquare, Mail, Activity 
} from 'lucide-react';

export const CaregiverPortal = ({ activeTab = 'caregiver_feed' }) => {
  const { currentUser, currentGlucose, glucoseLogs, waterIntake = 0 } = useApp();

  const hasLogs = glucoseLogs && glucoseLogs.length > 0;
  const displayBg = hasLogs ? (glucoseLogs[0]?.value || currentGlucose) : '--';

  const statusText = !hasLogs 
    ? 'Awaiting Patient Telemetry'
    : displayBg < 70 
    ? 'Hypoglycemia Alert (< 70 mg/dL)' 
    : (displayBg > 180 ? 'Hyperglycemia Spike (> 180 mg/dL)' : 'Normal & Active (Target Range)');

  const isCaregiverUser = currentUser?.role === 'caregiver';

  const linkedPatientName = isCaregiverUser 
    ? (currentUser?.linkedPatientName || 'Dinali Bhagya') 
    : (currentUser?.name || 'Dinali Bhagya');

  const patientPhone = isCaregiverUser 
    ? (currentUser?.linkedPatientPhone || '+94 77 123 4567') 
    : (currentUser?.phone || '+94 77 123 4567');

  const patientEmergencyEmail = isCaregiverUser 
    ? (currentUser?.linkedPatientEmail || 'dinali@glucocare.ai') 
    : (currentUser?.emergencyEmail || 'dinali@glucocare.ai');

  const [patientData, setPatientData] = useState({
    patientName: linkedPatientName,
    relationship: 'Family Caregiver Monitor',
    currentGlucose: displayBg,
    statusText: statusText,
    lastLogged: hasLogs ? (glucoseLogs[0]?.timestamp || 'Recent') : 'Awaiting Entry',
    medicationAdherence: hasLogs ? 'Logs Active' : 'Awaiting Log',
    waterIntake: `${(waterIntake || 0).toFixed(1)}L / 2.5L Goal`,
    cgmSignal: 'Active Stream'
  });

  // Keep patientData synchronized with real-time CGM telemetry
  useEffect(() => {
    setPatientData(prev => ({
      ...prev,
      patientName: linkedPatientName,
      currentGlucose: displayBg,
      statusText: statusText,
      waterIntake: `${(waterIntake || 0).toFixed(1)}L / 2.5L Goal`
    }));
  }, [displayBg, statusText, waterIntake, linkedPatientName]);

  const [alerts, setAlerts] = useState([]);

  // Modal States
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsText, setSmsText] = useState(`Hi ${currentUser?.name || 'Dinali'}, checking in on your blood sugar reading!`);
  const [smsSent, setSmsSent] = useState(false);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    apiService.getCaregiverData().then(res => {
      if (res && res.status === 'success') {
        if (res.patientSummary) setPatientData(prev => ({ ...prev, ...res.patientSummary }));
        if (res.alertsHistory) {
          setAlerts(res.alertsHistory.map((a, i) => ({
            id: 'alt-' + i,
            time: a.time,
            level: a.level || 'Info',
            msg: a.msg,
            acknowledged: true
          })));
        }
      }
    });
  }, []);

  const handleAcknowledge = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const handleSendEmailAlert = () => {
    const subject = encodeURIComponent(`URGENT: GlycoPulse Emergency Alert for ${patientData.patientName}`);
    const body = encodeURIComponent(`HIGH PRIORITY EMERGENCY ALERT\n\nPatient Name: ${patientData.patientName}\nCurrent Glucose Level: ${patientData.currentGlucose} mg/dL\nStatus: ${patientData.statusText}\nEmergency Phone: ${patientPhone}\n\nPlease check in on patient immediately.`);
    
    // Log emergency dispatch to alerts feed
    const newAlert = {
      id: 'alt-' + Date.now(),
      time: 'Just now',
      level: 'Warning',
      msg: `Emergency Email dispatched to ${patientEmergencyEmail} for ${patientData.patientName}`,
      acknowledged: true
    };
    setAlerts(prev => [newAlert, ...prev]);

    // Trigger mail client
    window.location.href = `mailto:${patientEmergencyEmail}?subject=${subject}&body=${body}`;
  };

  const handleSendSms = (e) => {
    e.preventDefault();
    if (!smsText.trim()) return;

    // 1. Send POST to PHP Backend API
    apiService.postCaregiverAction({
      action: 'send_sms',
      patientId: 'pat-976',
      text: smsText
    });

    // 2. Append sent SMS to active alerts feed
    const newAlert = {
      id: 'alt-' + Date.now(),
      time: 'Just now',
      level: 'Info',
      msg: `SMS Check-in sent to ${patientData.patientName} (${patientPhone}): "${smsText}"`,
      acknowledged: true
    };
    setAlerts(prev => [newAlert, ...prev]);

    // 3. Trigger native SMS app
    try {
      window.open(`sms:${patientPhone.replace(/\s+/g, '')}?body=${encodeURIComponent(smsText)}`, '_blank');
    } catch(err) {
      console.log('SMS protocol opened');
    }

    setSmsSent(true);
    setTimeout(() => {
      setSmsSent(false);
      setShowSmsModal(false);
    }, 1200);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    const newAlert = {
      id: 'alt-' + Date.now(),
      time: 'Just now',
      level: 'Info',
      msg: `Caregiver note: "${noteText}"`,
      acknowledged: true
    };
    setAlerts(prev => [newAlert, ...prev]);
    setNoteText('');
    setShowNoteModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <HeartHandshake size={28} color="var(--accent-rose)" />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Caregiver & Family Companion Portal</h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
                Caregiver: {currentUser?.name || 'David Jenkins'} ({currentUser?.email || 'caregiver@glucocare.ai'}) | Linked Patient: {patientData.patientName}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.9rem', borderRadius: '10px', fontSize: '0.8rem' }}>
            <PhoneCall size={14} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 700 }}>Patient Phone:</span> {patientPhone}
            <span style={{ margin: '0 0.3rem', color: 'var(--text-muted)' }}>|</span>
            <Mail size={14} color="var(--accent-rose)" />
            <span style={{ fontWeight: 700 }}>Patient Email:</span> {patientEmergencyEmail}
          </div>
        </div>
      </div>

      {/* Sub-View 1: Patient Live Telemetry Feed */}
      {(activeTab === 'caregiver_feed' || activeTab === 'caregiver') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Real-Time Glucose Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-emerald)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>PATIENT REAL-TIME GLUCOSE STATUS</span>
                <h3 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.2rem 0' }}>
                  {patientData.currentGlucose} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>mg/dL ({patientData.statusText})</span>
                </h3>
                <div className="badge badge-success">
                  <CheckCircle2 size={13} />
                  <span>CGM Signal: {patientData.cgmSignal}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                {/* Emergency Email Button */}
                <button 
                  onClick={handleSendEmailAlert} 
                  className="btn-outline" 
                  style={{ fontSize: '0.82rem', borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}
                  title="Send urgent emergency email notification to patient & contact"
                >
                  <Mail size={15} />
                  <span>Send Emergency Email</span>
                </button>

                {/* SMS Check-in */}
                <button onClick={() => setShowSmsModal(true)} className="btn-outline" style={{ fontSize: '0.82rem' }}>
                  <MessageSquare size={15} />
                  <span>SMS Check-in</span>
                </button>
                
                {/* Direct Phone Call Button */}
                <a 
                  href={`tel:${patientPhone.replace(/\s+/g, '')}`} 
                  className="btn-glow" 
                  style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', textDecoration: 'none', fontSize: '0.82rem' }}
                >
                  <PhoneCall size={15} />
                  <span>Call Patient ({patientPhone})</span>
                </a>
              </div>
            </div>
          </div>

          {/* Adherence & Vital Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>MEDICATION ADHERENCE</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.4rem 0' }}>{patientData.medicationAdherence}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last dose: Lantus 10:15 PM</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-purple)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>HYDRATION TRACKER</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.4rem 0' }}>{patientData.waterIntake}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>88% Goal Achieved</div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-amber)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>LAST LOGGED READING</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '0.4rem 0' }}>{patientData.lastLogged}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type: Bedtime Check</div>
            </div>
          </div>

        </div>
      )}

      {/* Sub-View 2: Emergency & Historical Alerts Log */}
      {activeTab === 'caregiver_alerts' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Live Telemetry Alert & Observation Feed</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Remote monitoring notifications sent from CGM & Emergency SOS</p>
            </div>

            <button onClick={() => setShowNoteModal(true)} className="btn-glow">
              <PlusCircle size={16} />
              <span>Log Observation</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {alerts.map(a => (
              <div key={a.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: a.level === 'Warning' ? '4px solid var(--accent-amber)' : '4px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  {a.level === 'Warning' ? <AlertCircle size={20} color="var(--accent-amber)" /> : <CheckCircle2 size={20} color="var(--accent-emerald)" />}
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{a.msg}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.time}</div>
                  </div>
                </div>

                <div>
                  {a.acknowledged ? (
                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                      <Check size={12} />
                      <span>Acknowledged</span>
                    </span>
                  ) : (
                    <button onClick={() => handleAcknowledge(a.id)} className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                      Acknowledge Alert
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SMS Modal */}
      {showSmsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.3rem' }}>Send SMS to {patientData.patientName}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '1rem' }}>Destination: {patientPhone}</p>
            
            {smsSent ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--accent-emerald)' }}>
                <CheckCircle2 size={44} style={{ margin: '0 auto 0.8rem auto' }} />
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>SMS Sent Successfully!</div>
              </div>
            ) : (
              <form onSubmit={handleSendSms} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <textarea 
                  value={smsText}
                  onChange={e => setSmsText(e.target.value)}
                  rows={4}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button type="submit" className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>
                    <Send size={16} />
                    <span>Send SMS Text</span>
                  </button>
                  <button type="button" onClick={() => setShowSmsModal(false)} className="btn-outline">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Log Caregiver Observation Note</h3>
            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="e.g. Prepared low-GI dinner, glucose 108 mg/dL"
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button type="submit" className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>Save Note</button>
                <button type="button" onClick={() => setShowNoteModal(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
