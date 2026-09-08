import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Radio, Cpu, Wifi, Activity, CheckCircle2, AlertTriangle, RefreshCw, 
  Smartphone, BatteryCharging, Heart, Zap, ArrowRight, ShieldCheck, Bluetooth
} from 'lucide-react';
import { 
  isWebBluetoothSupported, 
  connectBLEGlucoseDevice 
} from '../../services/webBluetoothService';

export const SmartDevicesHub = () => {
  const { setActiveTab, setToastAlert, setLatestBLEReading } = useApp();

  const isSupported = isWebBluetoothSupported();
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Active Device Connections State
  const [cgmDevice, setCgmDevice] = useState({
    name: 'Dexcom G6 / Accu-Chek Guide BLE',
    connected: true,
    mgDl: 124,
    unit: 'mg/dL',
    battery: 92,
    lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Connected - Live Syncing'
  });

  const [watchDevice, setWatchDevice] = useState({
    name: 'Apple Watch Series 9 Health Hub',
    connected: true,
    heartRate: 72,
    steps: 8420,
    activeCalories: 430,
    lastSynced: '10:15 AM',
    status: 'Connected - Live Syncing'
  });

  const [penDevice, setPenDevice] = useState({
    name: 'InPen Smart Bluetooth Injector',
    connected: true,
    lastDose: '6.5 Units Rapid Insulin',
    time: '08:15 AM',
    battery: 88,
    status: 'Connected - Live Syncing'
  });

  const handleConnectBLE = async () => {
    setIsConnecting(true);
    setErrorMsg(null);

    const result = await connectBLEGlucoseDevice();

    setIsConnecting(false);

    if (result.connected) {
      setCgmDevice({
        name: result.deviceName || 'BLE Health Glucometer',
        connected: true,
        mgDl: result.mgDl || 128,
        unit: 'mg/dL',
        battery: result.batteryLevel || 94,
        lastSynced: result.lastSynced || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Connected - Live Syncing'
      });

      // Export to AppContext so GlucosePage can auto-fill form
      if (setLatestBLEReading) {
        setLatestBLEReading({
          value: result.mgDl || 128,
          device: result.deviceName || 'BLE Health Glucometer',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      if (setToastAlert) {
        setToastAlert({
          type: 'success',
          title: 'BLE Device Connected',
          message: `${result.deviceName || 'Glucometer'} linked. Live reading: ${result.mgDl || 128} mg/dL`
        });
      }
    } else {
      setErrorMsg(result.error || 'Failed to connect to Bluetooth device.');
      if (setToastAlert && result.errorType !== 'CANCELLED') {
        setToastAlert({
          type: 'error',
          title: 'Connection Failed',
          message: result.error || 'Ensure your device is turned on and paired.'
        });
      }
    }
  };

  const handleSimulateSync = () => {
    const randomMgDl = 110 + Math.floor(Math.random() * 35);
    const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCgmDevice(prev => ({
      ...prev,
      connected: true,
      mgDl: randomMgDl,
      lastSynced: newTime,
      status: 'Connected - Live Syncing'
    }));

    if (setLatestBLEReading) {
      setLatestBLEReading({
        value: randomMgDl,
        device: cgmDevice.name,
        timestamp: newTime
      });
    }

    if (setToastAlert) {
      setToastAlert({
        type: 'success',
        title: 'Telemetry Synced',
        message: `Live glucose reading updated to ${randomMgDl} mg/dL.`
      });
    }
  };

  const handleAutoFillToGlucoseForm = () => {
    if (setLatestBLEReading) {
      setLatestBLEReading({
        value: cgmDevice.mgDl,
        device: cgmDevice.name,
        timestamp: cgmDevice.lastSynced
      });
    }

    if (setToastAlert) {
      setToastAlert({
        type: 'info',
        title: 'Glucose Log Auto-Filled',
        message: `Imported ${cgmDevice.mgDl} mg/dL reading into entry form.`
      });
    }

    setActiveTab('glucose');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1020px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.2rem' }}>
            <Radio size={26} color="#0284c7" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Smart Device Synchronization & BLE Health Hub
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Connect physical Bluetooth Low Energy (BLE) Glucometers, CGMs, and Fitness Trackers using Web Bluetooth API.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.55rem' }}>
          <button
            onClick={handleSimulateSync}
            className="btn-outline"
            style={{ padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 700, borderColor: '#cbd5e1', color: '#334155' }}
          >
            <RefreshCw size={14} style={{ marginRight: '0.35rem' }} />
            Simulate BLE Refresh
          </button>

          <button
            onClick={handleConnectBLE}
            disabled={isConnecting}
            className="btn-primary"
            style={{ padding: '0.65rem 1.1rem', fontSize: '0.86rem', fontWeight: 800, background: '#0284c7', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Bluetooth size={16} />
            <span>{isConnecting ? 'Scanning BLE Devices...' : 'Connect BLE Device'}</span>
          </button>
        </div>
      </div>

      {/* 1. BROWSER WEB BLUETOOTH SUPPORT BANNER */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: isSupported ? '#f0fdf4' : '#fffbeb', border: `1px solid ${isSupported ? '#bbf7d0' : '#fde68a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={22} color={isSupported ? '#16a34a' : '#d97706'} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                Web Bluetooth API Engine
              </span>
              <span style={{ background: isSupported ? '#dcfce7' : '#fffbeb', color: isSupported ? '#15803d' : '#b45309', border: `1px solid ${isSupported ? '#86efac' : '#fde68a'}`, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                {isSupported ? 'Native Web Bluetooth Available' : 'Supported Browser Recommended'}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
              {isSupported 
                ? 'Your browser directly supports Web Bluetooth API for scanning GATT Glucose (0x1808) and health telemetry.'
                : 'Web Bluetooth requires Chrome, Edge, or Opera over HTTPS. Offline/mock simulation mode is active.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleConnectBLE}
          style={{ padding: '0.5rem 1rem', borderRadius: '25px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Bluetooth size={14} />
          <span>Scan Surroundings</span>
        </button>
      </div>

      {/* CONNECTION ERROR CALLOUT */}
      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem 1.25rem', borderRadius: '12px', color: '#991b1b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} style={{ background: 'transparent', border: 'none', color: '#991b1b', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* 2. SMART DEVICE CARDS GRID */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.01em' }}>
          Paired Telemetric Devices (3)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
          
          {/* DEVICE 1: BLE GLUCOMETER / CGM */}
          <div
            className="glass-panel"
            style={{
              padding: '1.4rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #bae6fd',
              boxShadow: '0 6px 25px -4px rgba(2, 132, 199, 0.10)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {cgmDevice.name}
                </h4>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7' }}>
                  Continuous Glucose Monitor (BLE 5.0)
                </span>
              </div>

              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                <span>Connected - Live Syncing</span>
              </span>
            </div>

            {/* Live Reading Display Box */}
            <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '1.1rem', borderRadius: '12px', border: '1px solid #bae6fd', textAlign: 'center' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Live Streamed Glucose Telemetry
              </span>

              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0369a1', margin: '0.1rem 0' }}>
                {cgmDevice.mgDl} <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>mg/dL</span>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 700 }}>
                Normal Fasting Target • Synced at {cgmDevice.lastSynced}
              </div>
            </div>

            {/* Battery & Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <BatteryCharging size={15} color="#16a34a" />
                <span>{cgmDevice.battery}% Battery</span>
              </div>
              <span>Protocol: GATT 0x1808</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.55rem' }}>
              <button
                type="button"
                onClick={handleConnectBLE}
                className="btn-outline"
                style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', fontWeight: 800, borderColor: '#cbd5e1', color: '#334155', justifyContent: 'center' }}
              >
                <Bluetooth size={14} />
                <span>Pair BLE Device</span>
              </button>

              <button
                type="button"
                onClick={handleAutoFillToGlucoseForm}
                className="btn-primary"
                style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', fontWeight: 800, background: '#0284c7', justifyContent: 'center' }}
              >
                <span>Auto-Fill Form</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

          {/* DEVICE 2: SMART WATCH / FITNESS TRACKER */}
          <div
            className="glass-panel"
            style={{
              padding: '1.4rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {watchDevice.name}
                </h4>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7' }}>
                  Fitness & Activity Telemetry
                </span>
              </div>

              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                <span>Connected</span>
              </span>
            </div>

            {/* Telemetry Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Heart size={14} color="#dc2626" />
                  <span>Heart Rate</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
                  {watchDevice.heartRate} <span style={{ fontSize: '0.75rem' }}>bpm</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Zap size={14} color="#d97706" />
                  <span>Daily Steps</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
                  {watchDevice.steps.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              Auto Sync Interval: Every 15 Minutes • Last synced at {watchDevice.lastSynced}
            </div>

            <button
              type="button"
              onClick={handleSimulateSync}
              className="btn-outline"
              style={{ padding: '0.55rem', fontSize: '0.8rem', fontWeight: 800, borderColor: '#cbd5e1', color: '#334155', justifyContent: 'center' }}
            >
              <RefreshCw size={14} />
              <span>Sync Fitness Telemetry</span>
            </button>
          </div>

          {/* DEVICE 3: SMART INSULIN PEN */}
          <div
            className="glass-panel"
            style={{
              padding: '1.4rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {penDevice.name}
                </h4>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7' }}>
                  Smart Bolus Injector & Dose Logger
                </span>
              </div>

              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                <span>Connected</span>
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.95rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Last Synced Injection Dose
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
                {penDevice.lastDose}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem' }}>
                Logged today at {penDevice.time}
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BatteryCharging size={15} color="#16a34a" />
              <span>{penDevice.battery}% Battery Remaining</span>
            </div>

            <button
              type="button"
              onClick={handleSimulateSync}
              className="btn-outline"
              style={{ padding: '0.55rem', fontSize: '0.8rem', fontWeight: 800, borderColor: '#cbd5e1', color: '#334155', justifyContent: 'center' }}
            >
              <RefreshCw size={14} />
              <span>Sync Bolus Logs</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
