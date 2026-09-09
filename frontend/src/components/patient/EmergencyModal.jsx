import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, MapPin, PhoneCall, Send, MessageSquare, 
  Printer, Edit3, Check, X, AlertTriangle, HeartPulse, RefreshCw
} from 'lucide-react';

export const EmergencyModal = () => {
  const { 
    emergencyModalOpen, setEmergencyModalOpen,
    medicalProfile, updateMedicalProfile,
    currentUser, glucoseLogs
  } = useApp();

  const [activeTab, setActiveTab] = useState('sos'); // 'sos' | 'card'
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(medicalProfile);

  // Geolocation State
  const [locationState, setLocationState] = useState({
    loading: false,
    error: null,
    coords: null, // { latitude, longitude, accuracy }
    timestamp: null
  });

  const [contactNumber, setContactNumber] = useState(
    medicalProfile?.emergencyContactPhone || '+94771234567'
  );

  // Synchronize editForm with medicalProfile
  useEffect(() => {
    if (medicalProfile) {
      setEditForm(medicalProfile);
      if (medicalProfile.emergencyContactPhone) {
        setContactNumber(medicalProfile.emergencyContactPhone);
      }
    }
  }, [medicalProfile]);

  // Fetch real-time GPS coordinates when SOS tab is shown or modal opens
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationState({
        loading: false,
        error: 'Geolocation is not supported by your browser.',
        coords: null,
        timestamp: null
      });
      return;
    }

    setLocationState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          loading: false,
          error: null,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy)
          },
          timestamp: new Date().toLocaleTimeString()
        });
      },
      (err) => {
        console.warn('Geolocation fetch error:', err);
        setLocationState({
          loading: false,
          error: err.message || 'Unable to retrieve location. Please check browser permissions.',
          coords: null,
          timestamp: null
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (emergencyModalOpen) {
      fetchLocation();
    }
  }, [emergencyModalOpen]);

  if (!emergencyModalOpen) return null;

  const patientName = medicalProfile?.fullName || currentUser?.name || 'Patient User';
  const latestGlucose = glucoseLogs && glucoseLogs.length > 0 ? glucoseLogs[0]?.value : null;
  const glucoseText = latestGlucose ? `${latestGlucose} mg/dL` : 'Not logged recently';

  const mapsUrl = locationState.coords 
    ? `https://www.google.com/maps?q=${locationState.coords.latitude},${locationState.coords.longitude}`
    : '';

  const sosMessage = `🚨 MEDICAL EMERGENCY ALERT 🚨\nName: ${patientName}\nCondition: ${medicalProfile?.diabetesType || 'Diabetes'}\nBlood Group: ${medicalProfile?.bloodGroup || 'O+'}\nLatest Glucose: ${glucoseText}\n${mapsUrl ? `Live Location: ${mapsUrl}\n` : ''}I require urgent medical assistance!`;

  const cleanPhone = (phoneStr) => (phoneStr || '').replace(/[^\d+]/g, '');

  const sendWhatsAppSOS = () => {
    const formattedPhone = cleanPhone(contactNumber);
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(sosMessage)}`;
    window.open(url, '_blank');
  };

  const sendSmsSOS = () => {
    const formattedPhone = cleanPhone(contactNumber);
    const url = `sms:${formattedPhone}?body=${encodeURIComponent(sosMessage)}`;
    window.open(url, '_self');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateMedicalProfile(editForm);
    setIsEditing(false);
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div 
      className="emergency-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setEmergencyModalOpen(false);
      }}
    >
      {/* Modal Card */}
      <div 
        className="emergency-modal-content"
        style={{
          background: 'var(--bg-card)',
          border: '2px solid #dc2626',
          borderRadius: '12px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        
        {/* Header */}
        <div style={{
          background: '#dc2626',
          color: '#ffffff',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={20} color="#dc2626" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Emergency SOS & Medical ID
              </h2>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                Rapid Dispatch & Digital Health Identification
              </span>
            </div>
          </div>

          <button 
            onClick={() => setEmergencyModalOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.2rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-hover)'
        }}>
          <button
            onClick={() => setActiveTab('sos')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: activeTab === 'sos' ? 'var(--bg-card)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'sos' ? '3px solid #dc2626' : 'none',
              color: activeTab === 'sos' ? '#dc2626' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <ShieldAlert size={16} />
            <span>Instant SOS & GPS</span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: activeTab === 'card' ? 'var(--bg-card)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'card' ? '3px solid #dc2626' : 'none',
              color: activeTab === 'card' ? '#dc2626' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <HeartPulse size={16} />
            <span>Digital Medical ID Card</span>
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* TAB 1: INSTANT SOS & GEOLOCATION */}
          {activeTab === 'sos' && (
            <>
              {/* Geolocation Live Card */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontWeight: 700, fontSize: '0.9rem' }}>
                    <MapPin size={18} />
                    <span>Real-time GPS Location</span>
                  </div>

                  <button
                    onClick={fetchLocation}
                    disabled={locationState.loading}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <RefreshCw size={12} className={locationState.loading ? 'spin-slow' : ''} />
                    <span>{locationState.loading ? 'Acquiring...' : 'Refresh GPS'}</span>
                  </button>
                </div>

                {locationState.loading && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    📡 Fetching real-time satellite coordinates...
                  </p>
                )}

                {locationState.error && (
                  <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#dc2626' }}>
                    ⚠️ {locationState.error}
                  </div>
                )}

                {locationState.coords && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                      Coordinates: <span style={{ color: 'var(--primary-color)', fontFamily: 'monospace' }}>
                        {locationState.coords.latitude.toFixed(6)}, {locationState.coords.longitude.toFixed(6)}
                      </span> (±{locationState.coords.accuracy}m accuracy)
                    </div>
                    {mapsUrl && (
                      <a 
                        href={mapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary-color)', fontSize: '0.82rem', textDecoration: 'underline', fontWeight: 600 }}
                      >
                        📍 View on Google Maps
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* SOS Recipient & Message Broadcast */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Emergency Contact Phone Number:
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+94 77 123 4567"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9rem', fontWeight: 600 }}
                />
              </div>

              {/* Pre-configured SOS Message Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Pre-configured SOS Alert Message:
                </span>
                <div style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-line',
                  fontFamily: 'monospace'
                }}>
                  {sosMessage}
                </div>
              </div>

              {/* 1-Click Dispatch Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={sendWhatsAppSOS}
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 4px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  <Send size={18} />
                  <span>Send WhatsApp Alert</span>
                </button>

                <button
                  onClick={sendSmsSOS}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <MessageSquare size={18} />
                  <span>Send Direct SMS Alert</span>
                </button>
              </div>

              {/* Quick-Dial Hotline Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Direct Quick-Dial Emergency Numbers:
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
                  <a
                    href="tel:1990"
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#b91c1c',
                      borderRadius: '6px',
                      padding: '0.5rem 0.65rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      fontWeight: 700,
                      fontSize: '0.82rem'
                    }}
                  >
                    <PhoneCall size={14} />
                    <span>1990 (Suwa Seriya)</span>
                  </a>

                  <a
                    href="tel:911"
                    style={{
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.65rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      fontWeight: 700,
                      fontSize: '0.82rem'
                    }}
                  >
                    <PhoneCall size={14} />
                    <span>911 (Emergency)</span>
                  </a>

                  <a
                    href="tel:119"
                    style={{
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.65rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      fontWeight: 700,
                      fontSize: '0.82rem'
                    }}
                  >
                    <PhoneCall size={14} />
                    <span>119 (Police)</span>
                  </a>

                  {medicalProfile?.doctorPhone && (
                    <a
                      href={`tel:${cleanPhone(medicalProfile.doctorPhone)}`}
                      style={{
                        background: '#e0f2fe',
                        border: '1px solid #93c5fd',
                        color: '#0369a1',
                        borderRadius: '6px',
                        padding: '0.5rem 0.65rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        fontWeight: 700,
                        fontSize: '0.82rem'
                      }}
                    >
                      <PhoneCall size={14} />
                      <span>Doctor: Call</span>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: DIGITAL EMERGENCY MEDICAL ID CARD */}
          {activeTab === 'card' && (
            <>
              {isEditing ? (
                /* Edit Form */
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Full Name</label>
                      <input 
                        type="text" 
                        value={editForm.fullName || ''} 
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} 
                        style={{ width: '100%' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Age</label>
                      <input 
                        type="number" 
                        value={editForm.age || ''} 
                        onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} 
                        style={{ width: '100%' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Blood Group</label>
                      <select 
                        value={editForm.bloodGroup || 'O+'} 
                        onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })} 
                        style={{ width: '100%' }}
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Diabetes Condition</label>
                      <input 
                        type="text" 
                        value={editForm.diabetesType || ''} 
                        onChange={(e) => setEditForm({ ...editForm, diabetesType: e.target.value })} 
                        style={{ width: '100%' }} 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Critical Allergies</label>
                    <input 
                      type="text" 
                      value={editForm.allergies || ''} 
                      onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })} 
                      style={{ width: '100%' }} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Current Insulin & Medications</label>
                    <textarea 
                      rows={2} 
                      value={editForm.medications || ''} 
                      onChange={(e) => setEditForm({ ...editForm, medications: e.target.value })} 
                      style={{ width: '100%' }} 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Emergency Contact Name & Relation</label>
                      <input 
                        type="text" 
                        value={editForm.emergencyContactName || ''} 
                        onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })} 
                        style={{ width: '100%' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Emergency Contact Phone</label>
                      <input 
                        type="text" 
                        value={editForm.emergencyContactPhone || ''} 
                        onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })} 
                        style={{ width: '100%' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Primary Doctor Name</label>
                      <input 
                        type="text" 
                        value={editForm.doctorName || ''} 
                        onChange={(e) => setEditForm({ ...editForm, doctorName: e.target.value })} 
                        style={{ width: '100%' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Doctor Phone</label>
                      <input 
                        type="text" 
                        value={editForm.doctorPhone || ''} 
                        onChange={(e) => setEditForm({ ...editForm, doctorPhone: e.target.value })} 
                        style={{ width: '100%' }} 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Emergency Hypoglycemia Instructions</label>
                    <textarea 
                      rows={2} 
                      value={editForm.hypoInstructions || ''} 
                      onChange={(e) => setEditForm({ ...editForm, hypoInstructions: e.target.value })} 
                      style={{ width: '100%' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                    >
                      <Check size={16} />
                      <span>Save Medical Profile</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Printable / Displayable Medical ID Badge */
                <>
                  <div className="printable-medical-card-container">
                    <div 
                      id="printable-medical-card"
                      style={{
                        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
                        border: '2px solid #dc2626',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-md)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}
                    >
                      {/* Badge Top Header */}
                      <div style={{
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        borderBottom: '2px solid #dc2626',
                        paddingBottom: '0.65rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ShieldAlert size={24} color="#dc2626" />
                          <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>
                              EMERGENCY MEDICAL ID
                            </span>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                              {patientName}
                            </h3>
                          </div>
                        </div>

                        {/* Blood Group Badge */}
                        <div style={{
                          background: '#dc2626',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '0.3rem 0.75rem',
                          textAlign: 'center'
                        }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', display: 'block', opacity: 0.9 }}>BLOOD</span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{medicalProfile?.bloodGroup || 'O+'}</span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.84rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'block', fontSize: '0.75rem' }}>AGE / TYPE:</span>
                          <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                            {medicalProfile?.age ? `${medicalProfile.age} yrs` : 'N/A'} • {medicalProfile?.diabetesType || 'Type 1 Diabetes'}
                          </span>
                        </div>

                        <div>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'block', fontSize: '0.75rem' }}>LATEST GLUCOSE:</span>
                          <span style={{ color: latestGlucose && latestGlucose < 70 ? '#dc2626' : 'var(--primary-color)', fontWeight: 700 }}>
                            {glucoseText}
                          </span>
                        </div>
                      </div>

                      {/* Allergies & Medications */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                        <div style={{ background: 'rgba(220, 38, 38, 0.06)', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid #dc2626' }}>
                          <span style={{ fontWeight: 700, color: '#dc2626', display: 'block', fontSize: '0.75rem' }}>CRITICAL ALLERGIES:</span>
                          <span style={{ color: 'var(--text-main)' }}>{medicalProfile?.allergies || 'None specified'}</span>
                        </div>

                        <div style={{ background: 'var(--bg-hover)', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--primary-color)' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-color)', display: 'block', fontSize: '0.75rem' }}>INSULIN & MEDICATIONS:</span>
                          <span style={{ color: 'var(--text-main)' }}>{medicalProfile?.medications || 'None specified'}</span>
                        </div>
                      </div>

                      {/* Contacts & Doctor */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>PRIMARY EMERGENCY CONTACT:</span>
                          <span style={{ color: 'var(--text-main)', fontWeight: 700, display: 'block' }}>{medicalProfile?.emergencyContactName}</span>
                          <a href={`tel:${cleanPhone(medicalProfile?.emergencyContactPhone)}`} style={{ color: '#dc2626', fontWeight: 700, textDecoration: 'none' }}>
                            {medicalProfile?.emergencyContactPhone}
                          </a>
                        </div>

                        <div>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>PRIMARY DOCTOR / CLINIC:</span>
                          <span style={{ color: 'var(--text-main)', fontWeight: 700, display: 'block' }}>{medicalProfile?.doctorName}</span>
                          <a href={`tel:${cleanPhone(medicalProfile?.doctorPhone)}`} style={{ color: 'var(--primary-color)', fontWeight: 700, textDecoration: 'none' }}>
                            {medicalProfile?.doctorPhone}
                          </a>
                        </div>
                      </div>

                      {/* Hypo Emergency Instructions */}
                      <div style={{
                        background: '#fef3c7',
                        border: '1px solid #fde68a',
                        borderRadius: '6px',
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.78rem',
                        color: '#92400e'
                      }}>
                        <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem', color: '#b45309' }}>
                          <AlertTriangle size={14} />
                          <span>HYPOGLYCEMIA EMERGENCY INSTRUCTIONS</span>
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.3 }}>
                          {medicalProfile?.hypoInstructions || 'If unconscious, do not give liquids. Call 1990 immediately.'}
                        </p>
                      </div>

                      {/* Footer Badge & QR scanning mockup */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>GlucoCare AI Emergency System ID: GC-EMG-8921</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>SCAN FOR PARAMEDIC DATA</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-outline"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <Edit3 size={15} />
                      <span>Edit Medical Profile</span>
                    </button>

                    <button
                      onClick={handlePrintCard}
                      className="btn-primary"
                      style={{ background: '#0284c7', fontSize: '0.84rem' }}
                    >
                      <Printer size={15} />
                      <span>Print / Download Medical ID</span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
