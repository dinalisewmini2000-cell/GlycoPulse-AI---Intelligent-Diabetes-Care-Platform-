import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Pill, Bell, AlertTriangle, Plus, CheckCircle2, RefreshCw, 
  Calendar, ShieldAlert, Clock, UserCheck, X, Volume2, Sparkles
} from 'lucide-react';
import { 
  subscribeUserMedications, 
  saveMedicationToFirestore, 
  updateMedicationStockInFirestore 
} from '../../services/firebase';
import { 
  requestNotificationPermission, 
  getNotificationPermissionState, 
  sendPushNotification, 
  startNotificationScheduler, 
  stopNotificationScheduler 
} from '../../services/notificationService';

export const MedicationsPage = () => {
  const { currentUser, setToastAlert } = useApp();

  const [medications, setMedications] = useState([]);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState(getNotificationPermissionState());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Prescription Form State
  const [newMed, setNewMed] = useState({
    medicationName: '',
    dosage: '1 Tablet',
    frequency: 'Twice Daily (Morning & Night)',
    time: '08:00 AM, 08:00 PM',
    totalPillsCount: 60,
    pillsTakenPerDay: 2,
    refillThreshold: 5,
    prescribedBy: 'Dr. Clinical Specialist',
    category: 'Diabetes Care'
  });

  // Real-time Firestore Sync
  useEffect(() => {
    const targetUid = currentUser?.uid || currentUser?.id || auth?.currentUser?.uid;
    const targetEmail = currentUser?.email || auth?.currentUser?.email;

    if (!targetEmail && !targetUid) {
      setMedications([]);
      return;
    }

    const unsubscribe = subscribeUserMedications(targetUid, targetEmail, (cloudMeds) => {
      setMedications(cloudMeds || []);
    });

    return () => unsubscribe();
  }, [currentUser?.uid, currentUser?.email, auth?.currentUser?.uid]);

  // Start/Stop Notification Scheduler
  useEffect(() => {
    if (isPushEnabled && permissionState === 'granted') {
      startNotificationScheduler(() => medications, () => isPushEnabled);
    } else {
      stopNotificationScheduler();
    }
  }, [isPushEnabled, permissionState, medications]);

  const handleTogglePushNotifications = async () => {
    if (!isPushEnabled) {
      const state = await requestNotificationPermission();
      setPermissionState(state);

      if (state === 'granted') {
        setIsPushEnabled(true);
        sendPushNotification('🔔 GlycoPulse Reminders Activated', {
          body: 'You will now receive desktop push alerts for scheduled medication doses and water hydration.'
        });
        if (setToastAlert) {
          setToastAlert({ type: 'success', title: 'Push Reminders Enabled', message: 'Browser notifications are active.' });
        }
      } else {
        setIsPushEnabled(false);
        if (setToastAlert) {
          setToastAlert({ type: 'error', title: 'Permission Denied', message: 'Please allow notification permissions in your browser settings.' });
        }
      }
    } else {
      setIsPushEnabled(false);
      stopNotificationScheduler();
    }
  };

  const handleSendTestPush = () => {
    if (permissionState !== 'granted') {
      handleTogglePushNotifications();
    } else {
      sendPushNotification('💊 Test Dose Alert: Metformin 500mg', {
        body: 'Time to take 1 Tablet of Metformin with water. 12 pills remaining.'
      });
    }
  };

  const handleRecordDose = async (med) => {
    const current = Number(med.currentPillsCount ?? med.totalPillsCount) || 0;
    const perDay = Number(med.pillsTakenPerDay) || 1;
    const newCount = Math.max(0, current - Math.ceil(perDay / 2)); // Decrement dose

    setMedications(prev => prev.map(m => m.id === med.id ? { ...m, currentPillsCount: newCount } : m));

    if (med.id && !med.id.startsWith('med-')) {
      await updateMedicationStockInFirestore(med.id, { currentPillsCount: newCount });
    }

    if (setToastAlert) {
      setToastAlert({
        type: 'success',
        title: 'Dose Recorded',
        message: `${med.medicationName} recorded. ${newCount} units left.`
      });
    }
  };

  const handleRefillStock = async (med) => {
    const total = Number(med.totalPillsCount) || 60;
    setMedications(prev => prev.map(m => m.id === med.id ? { ...m, currentPillsCount: total } : m));

    if (med.id && !med.id.startsWith('med-')) {
      await updateMedicationStockInFirestore(med.id, { currentPillsCount: total });
    }

    if (setToastAlert) {
      setToastAlert({
        type: 'success',
        title: 'Prescription Refilled',
        message: `${med.medicationName} stock reset to ${total} units.`
      });
    }
  };

  const handleAddMedicationSubmit = async (e) => {
    e.preventDefault();
    const total = Number(newMed.totalPillsCount) || 60;

    const medEntry = {
      ...newMed,
      totalPillsCount: total,
      currentPillsCount: total,
      pillsTakenPerDay: Number(newMed.pillsTakenPerDay) || 1,
      refillThreshold: Number(newMed.refillThreshold) || 5
    };

    setMedications(prev => [{ id: 'med-' + Date.now(), ...medEntry }, ...prev]);

    const targetUid = currentUser?.uid || currentUser?.id;
    const targetEmail = currentUser?.email;
    await saveMedicationToFirestore(targetUid, targetEmail, medEntry);

    setIsAddModalOpen(false);
    setNewMed({
      medicationName: '',
      dosage: '1 Tablet',
      frequency: 'Twice Daily (Morning & Night)',
      time: '08:00 AM, 08:00 PM',
      totalPillsCount: 60,
      pillsTakenPerDay: 2,
      refillThreshold: 5,
      prescribedBy: 'Dr. Clinical Specialist',
      category: 'Diabetes Care'
    });

    if (setToastAlert) {
      setToastAlert({ type: 'success', title: 'Prescription Added', message: `${medEntry.medicationName} added successfully.` });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1020px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.2rem' }}>
            <Pill size={26} color="#0284c7" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Advanced Medication & Refill Manager
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Prescription tracking, visual pill stock progress bars, automatic low refill alerts, and Web Push reminders.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
          style={{ padding: '0.65rem 1.1rem', fontSize: '0.86rem', fontWeight: 800, background: '#0284c7', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} />
          <span>Add New Prescription</span>
        </button>
      </div>

      {/* 1. BROWSER PUSH NOTIFICATIONS BAR */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: isPushEnabled ? '#f0fdf4' : '#f8fafc', border: `1px solid ${isPushEnabled ? '#bbf7d0' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={22} color={isPushEnabled ? '#16a34a' : '#64748b'} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                Web Push Reminders & Alerts
              </span>
              <span style={{ background: permissionState === 'granted' ? '#dcfce7' : '#fef2f2', color: permissionState === 'granted' ? '#15803d' : '#dc2626', border: `1px solid ${permissionState === 'granted' ? '#86efac' : '#fecaca'}`, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                {permissionState === 'granted' ? 'Notifications Granted' : 'Permission Required'}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
              Receive desktop notifications when it is time for your insulin/medication dose or water hydration.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={handleSendTestPush}
            className="btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', fontWeight: 700, borderColor: '#cbd5e1', color: '#334155' }}
          >
            <Volume2 size={14} style={{ marginRight: '0.35rem' }} />
            Test Push Alert
          </button>

          <button
            onClick={handleTogglePushNotifications}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '25px',
              border: 'none',
              background: isPushEnabled ? '#16a34a' : '#0284c7',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Bell size={14} />
            <span>{isPushEnabled ? 'Push Reminders Active' : 'Enable Push Reminders'}</span>
          </button>
        </div>
      </div>

      {/* 2. ACTIVE PRESCRIPTION STOCK PROGRESS CARDS GRID */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.01em' }}>
          Prescription Stock & Refill Tracker ({medications.length})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {medications.map(med => {
            const total = Number(med.totalPillsCount) || 60;
            const current = med.currentPillsCount !== undefined ? Number(med.currentPillsCount) : total;
            const perDay = Number(med.pillsTakenPerDay) || 1;
            const threshold = Number(med.refillThreshold) || 5;

            const percent = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
            const daysLeft = Math.floor(current / perDay);
            const isLowStock = current <= threshold || daysLeft <= 3;

            return (
              <div
                key={med.id}
                className="glass-panel"
                style={{
                  padding: '1.4rem',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: isLowStock ? '1px solid #fecaca' : '1px solid #e2e8f0',
                  boxShadow: isLowStock ? '0 6px 25px -4px rgba(220, 38, 38, 0.12)' : '0 4px 20px -2px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative'
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {med.medicationName}
                    </h4>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7' }}>
                      {med.dosage} • {med.category || 'Prescription'}
                    </span>
                  </div>

                  <span style={{ background: isLowStock ? '#fef2f2' : '#f0fdf4', color: isLowStock ? '#dc2626' : '#16a34a', border: `1px solid ${isLowStock ? '#fecaca' : '#bbf7d0'}`, padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                    {isLowStock ? '⚠️ Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Schedule info */}
                <div style={{ background: '#f8fafc', padding: '0.75rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#0f172a' }}>
                    <Clock size={14} color="#0284c7" />
                    <span>{med.frequency}</span>
                  </div>
                  <div>Scheduled Doses: <strong style={{ color: '#0f172a' }}>{med.time}</strong></div>
                  <div>Prescriber: <strong style={{ color: '#0f172a' }}>{med.prescribedBy}</strong></div>
                </div>

                {/* VISUAL STOCK PROGRESS BAR */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    <span style={{ color: '#475569' }}>Medication Stock Level</span>
                    <span style={{ color: isLowStock ? '#dc2626' : '#0f172a' }}>
                      {current} / {total} Units ({daysLeft} Days Supply Left)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: isLowStock ? 'linear-gradient(90deg, #ef4444, #dc2626)' : percent > 40 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                        borderRadius: '5px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>

                {/* LOW STOCK REFILL ALERT BANNER */}
                {isLowStock && (
                  <div style={{ background: '#fef2f2', padding: '0.75rem 0.85rem', borderRadius: '10px', border: '1px solid #fecaca', fontSize: '0.8rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Refill Threshold Alert:</strong> Only {current} units left ({daysLeft} days). Please contact pharmacy to refill.
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    onClick={() => handleRecordDose(med)}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', fontWeight: 800, background: '#0284c7', justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Take Dose</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRefillStock(med)}
                    className="btn-outline"
                    style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', fontWeight: 800, borderColor: isLowStock ? '#fca5a5' : '#cbd5e1', color: isLowStock ? '#dc2626' : '#475569', justifyContent: 'center' }}
                  >
                    <RefreshCw size={14} />
                    <span>Refill Stock</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PRESCRIPTION HISTORY TABLE */}
      <div className="glass-panel" style={{ padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.01em' }}>
          Prescription History & Clinical Details
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Medication & Dose</th>
                <th style={{ padding: '0.75rem 1rem' }}>Frequency & Schedule</th>
                <th style={{ padding: '0.75rem 1rem' }}>Remaining Stock</th>
                <th style={{ padding: '0.75rem 1rem' }}>Refill Alert Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Prescriber</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((med, idx) => {
                const total = Number(med.totalPillsCount) || 60;
                const current = med.currentPillsCount !== undefined ? Number(med.currentPillsCount) : total;
                const threshold = Number(med.refillThreshold) || 5;
                const isLow = current <= threshold;

                return (
                  <tr key={med.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                      <div>{med.medicationName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>{med.dosage}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                      <div>{med.frequency}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{med.time}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: isLow ? '#dc2626' : '#0f172a' }}>
                      {current} / {total} Units
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ background: isLow ? '#fef2f2' : '#f0fdf4', color: isLow ? '#dc2626' : '#16a34a', border: `1px solid ${isLow ? '#fecaca' : '#bbf7d0'}`, padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {isLow ? 'Refill Required' : 'Stock Optimal'}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                      {med.prescribedBy}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button
                        onClick={() => handleRefillStock(med)}
                        style={{ background: 'transparent', border: 'none', color: '#0284c7', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <RefreshCw size={13} />
                        <span>Refill</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ADD NEW PRESCRIPTION MODAL */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '520px', padding: '1.6rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pill size={22} color="#0284c7" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Add New Prescription</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMedicationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Medication Name & Strength</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin 850mg or Insulin Novorapid"
                  value={newMed.medicationName}
                  onChange={e => setNewMed({ ...newMed, medicationName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.86rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Single Dose Quantity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 Tablet or 12 Units"
                    value={newMed.dosage}
                    onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.86rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Oral Hypoglycemic"
                    value={newMed.category}
                    onChange={e => setNewMed({ ...newMed, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.86rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Total Pills / Stock Count</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="60"
                    value={newMed.totalPillsCount}
                    onChange={e => setNewMed({ ...newMed, totalPillsCount: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.86rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Refill Alert Threshold</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="5"
                    value={newMed.refillThreshold}
                    onChange={e => setNewMed({ ...newMed, refillThreshold: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.86rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Daily Dose Count</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2"
                    value={newMed.pillsTakenPerDay}
                    onChange={e => setNewMed({ ...newMed, pillsTakenPerDay: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.86rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Prescribing Physician</label>
                  <input
                    type="text"
                    placeholder="Dr. Specialist"
                    value={newMed.prescribedBy}
                    onChange={e => setNewMed({ ...newMed, prescribedBy: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.86rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.65rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, background: '#0284c7', justifyContent: 'center' }}>Save Prescription</button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
