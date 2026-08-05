import React from 'react';
import { Radio, Wifi, Smartphone, Watch, Activity, Scale, CheckCircle2 } from 'lucide-react';

export const SmartDevicesHub = () => {
  const devices = [
    { name: 'Dexcom G7 Continuous Glucose Monitor', type: 'CGM Sensor', status: 'Live Syncing (118 mg/dL)', battery: '84%', icon: Radio, active: true },
    { name: 'Contour Next One Bluetooth Glucometer', type: 'Fingerstick Meter', status: 'Paired via Bluetooth 5.2', battery: '92%', icon: Wifi, active: true },
    { name: 'Apple Watch Series 9', type: 'Smartwatch & Heart Rate', status: 'Active (72 bpm, 7,420 steps)', battery: '68%', icon: Watch, active: true },
    { name: 'Omron Evolv Wireless BP Monitor', type: 'Blood Pressure Monitor', status: 'Last sync: 2 hours ago (118/76)', battery: '100%', icon: Activity, active: true },
    { name: 'Withings Body Smart Scale', type: 'Smart Body Composition', status: 'Last weight: 64.0 kg (BMI 22.7)', battery: '95%', icon: Scale, active: true }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.12))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Radio size={26} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Smart Medical Device Integration Hub</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Seamless Bluetooth Low Energy (BLE) and Cloud API integration with CGMs, Smartwatches, BP Cuffs, and Smart Scales.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
        {devices.map((d, i) => {
          const Icon = d.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Icon size={20} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>{d.type.toUpperCase()}</span>
                </div>
                <div className="badge badge-success">
                  <CheckCircle2 size={12} />
                  <span>Connected</span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.6rem 0 0.2rem 0' }}>{d.name}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{d.status}</p>

              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.8rem', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Battery Status: {d.battery}</span>
                <span style={{ color: 'var(--accent-cyan)', cursor: 'pointer' }}>Configure Sync</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
