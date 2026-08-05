import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { AlertTriangle, MapPin, Phone, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export const EmergencySOSModal = () => {
  const { sosActive, setSosActive } = useApp();
  const [sosSent, setSosSent] = useState(false);

  if (!sosActive) return null;

  const handleTriggerSOS = () => {
    apiService.triggerEmergencySOS({ lat: 37.7749, lng: -122.4194 }).then(() => {
      setSosSent(true);
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2rem', border: '2px solid var(--accent-rose)', boxShadow: '0 0 40px rgba(244, 63, 94, 0.4)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={28} color="var(--accent-rose)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-rose)' }}>EMERGENCY SOS SYSTEM</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Low Glucose Emergency & Medical ID Broadcast</p>
            </div>
          </div>
          <button onClick={() => { setSosActive(false); setSosSent(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {sosSent ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={54} style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>LIVE EMERGENCY SOS BROADCASTED!</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
              SMS & GPS location sent to David Jenkins (Spouse) & Dr. Vance. EMS dispatch notified.
            </p>
            <div style={{ marginTop: '1.2rem', padding: '0.8rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              GPS Location: 37.7749 N, -122.4194 W (San Francisco, CA)
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Medical ID Preview */}
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: 'var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>DIGITAL MEDICAL ID</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.2rem 0' }}>Sarah Jenkins</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-rose)', fontWeight: 700 }}>Condition: Type 1 Diabetes Mellitus (Insulin Dependent)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Blood Group: O+ | Allergies: Penicillin, Peanuts</div>
            </div>

            {/* Hypo Emergency Protocol */}
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)' }}>⚠️ HYPOGLYCEMIA EMERGENCY ACTION:</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                If conscious, consume 15-20g fast-acting carbohydrates (e.g. 4 oz regular soda, fruit juice, or 4 glucose tabs). Do NOT inject insulin.
              </p>
            </div>

            <button onClick={handleTriggerSOS} className="btn-danger-glow" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}>
              <AlertTriangle size={22} />
              <span>BROADCAST LIVE SOS & LOCATION</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
