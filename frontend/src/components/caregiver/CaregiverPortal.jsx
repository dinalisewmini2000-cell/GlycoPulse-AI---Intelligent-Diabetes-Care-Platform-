import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { 
  HeartHandshake, Bell, ShieldAlert, CheckCircle2, PhoneCall, 
  Clock, Send, AlertCircle, PlusCircle, Check, MessageSquare, Droplet, Activity 
} from 'lucide-react';

export const CaregiverPortal = ({ activeTab = 'caregiver_feed' }) => {
  const { currentUser } = useApp();

  const [patientData, setPatientData] = useState({
    patientName: 'Dinali Bhagya',
    relationship: 'Family Caregiver',
    currentGlucose: 118,
    statusText: 'Normal & Active',
    lastLogged: '12 mins ago (Bedtime Check)',
    medicationAdherence: '100% (3/3 doses taken today)',
    waterIntake: '2.2L / 2.5L Goal',
    cgmSignal: 'Strong (Dexcom G7)'
  });

  const [alerts, setAlerts] = useState([
    { id: 'alt-1', time: 'Today 07:30 AM', level: 'Info', msg: 'Fasting glucose logged: 112 mg/dL', acknowledged: true },
    { id: 'alt-2', time: 'Yesterday 10:15 PM', level: 'Success', msg: 'Night Lantus insulin dose confirmed taken.', acknowledged: true },
    { id: 'alt-3', time: 'Yesterday 04:30 PM', level: 'Warning', msg: 'Mild post-lunch spike: 168 mg/dL', acknowledged: false }
  ]);

  // Modal States
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsText, setSmsText] = useState('Hi Dinali, checking in on your evening blood sugar reading!');
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
      msg: `SMS Check-in sent to ${patientData.patientName}: "${smsText}"`,
      acknowledged: true
    };
    setAlerts(prev => [newAlert, ...prev]);

    // 3. Trigger native SMS app (Phone Link, iMessage, Android SMS)
    try {
      window.open(`sms:+15553492011?body=${encodeURIComponent(smsText)}`, '_blank');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <HeartHandshake size={28} color="var(--accent-rose)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Caregiver & Family Companion Portal</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
              Caregiver: {currentUser?.name || 'David Jenkins'} ({currentUser?.email || 'caregiver@glucocare.ai'}) | Linked Patient: {patientData.patientName}
            </div>
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

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => setShowSmsModal(true)} className="btn-outline" style={{ fontSize: '0.85rem' }}>
                  <MessageSquare size={16} />
                  <span>Send SMS Check-in</span>
                </button>
                
                <a href={`tel:+15553492011`} className="btn-glow" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', textDecoration: 'none', fontSize: '0.85rem' }}>
                  <PhoneCall size={16} />
                  <span>Call Patient</span>
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Send Instant SMS to {patientData.patientName}</h3>
            
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
