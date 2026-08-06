import React, { useState } from 'react';
import { 
  Radio, Cpu, CheckCircle2, RefreshCw, Zap, BatteryCharging, 
  Smartphone, Activity, PlusCircle, AlertCircle, ShieldCheck 
} from 'lucide-react';

export const SmartDevicesHub = () => {
  const [devices, setDevices] = useState([
    { id: 'dev-1', name: 'Dexcom G7 CGM Sensor', category: 'Continuous Glucose Monitor', status: 'Connected & Streaming', battery: '98%', lifespan: '6 Days Remaining', signal: 'Strong (BLE 5.2)', icon: Radio, active: true },
    { id: 'dev-2', name: 'Omnipod 5 Automated Delivery System', category: 'Tubeless Insulin Pump', status: 'Active (Auto-Basal On)', battery: '85%', lifespan: '42 Hours Remaining (120U Reservoir)', signal: 'Paired', icon: Cpu, active: true },
    { id: 'dev-3', name: 'Companion InPen Smart Insulin Pen', category: 'Bluetooth Smart Pen', status: 'Ready for Bolus', battery: '92%', lifespan: '3 Months Remaining', signal: 'Paired', icon: Smartphone, active: true },
    { id: 'dev-4', name: 'FreeStyle Libre 3 Sensor', category: 'CGM Backup', status: 'Standby / NFC Scanned', battery: '100%', lifespan: '12 Days Remaining', signal: 'Standby', icon: Radio, active: false },
    { id: 'dev-5', name: 'Apple Health & Watch Series 9', category: 'Vitals & Activity Sync', status: 'Syncing Live Steps & HR', battery: '76%', lifespan: 'Continuous Background Sync', signal: 'Syncing', icon: Activity, active: true }
  ]);

  const [syncingId, setSyncingId] = useState(null);

  const handleSyncDevice = (deviceId) => {
    setSyncingId(deviceId);
    setTimeout(() => {
      setSyncingId(null);
    }, 1200);
  };

  const handleToggleDevice = (deviceId) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          active: !d.active,
          status: !d.active ? 'Connected & Streaming' : 'Disconnected'
        };
      }
      return d;
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Radio size={28} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Smart Medical Device & Closed-Loop Hub</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Automated Closed-Loop Integration | Bluetooth 5.2 Dual Band
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Pairs seamlessly with CGMs, automated insulin delivery (AID) pumps, smart insulin pens, and digital fitness wearables.
        </p>
      </div>

      {/* Connected Devices Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {devices.map(dev => {
          const IconComp = dev.icon;
          const isSyncing = syncingId === dev.id;

          return (
            <div key={dev.id} className="glass-panel" style={{ padding: '1.4rem', borderLeft: dev.active ? '4px solid var(--accent-emerald)' : '4px solid var(--text-muted)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: dev.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={22} color={dev.active ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{dev.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dev.category}</span>
                  </div>
                </div>

                <span className={`badge ${dev.active ? 'badge-success' : 'badge-danger'}`}>
                  {dev.active ? 'Active' : 'Offline'}
                </span>
              </div>

              {/* Specs */}
              <div style={{ background: 'var(--bg-secondary)', padding: '0.8rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>BATTERY:</span>
                  <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{dev.battery}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>LIFESPAN:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{dev.lifespan}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button onClick={() => handleSyncDevice(dev.id)} disabled={isSyncing || !dev.active} className="btn-glow" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}>
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Telemetry'}</span>
                </button>
                <button onClick={() => handleToggleDevice(dev.id)} className="btn-outline" style={{ fontSize: '0.8rem' }}>
                  {dev.active ? 'Disconnect' : 'Connect'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
