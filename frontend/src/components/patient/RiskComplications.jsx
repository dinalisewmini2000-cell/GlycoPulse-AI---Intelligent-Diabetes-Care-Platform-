import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Footprints, Heart, Eye, Activity, CheckCircle2, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

export const RiskComplications = () => {
  const [footScanStatus, setFootScanStatus] = useState('normal'); // normal, scanning
  const [footScanResult, setFootScanResult] = useState({
    scanDate: '2026-08-01',
    perfusion: 'Normal / Healthy (100%)',
    ulcerDetected: false,
    aiAdvice: 'No micro-fissures or neuropathic hotspots detected. Continue daily inspections with seamless socks.'
  });

  const handleRunFootScan = () => {
    setFootScanStatus('scanning');
    setTimeout(() => {
      setFootScanStatus('normal');
      setFootScanResult({
        scanDate: new Date().toISOString().split('T')[0],
        perfusion: 'Normal / Optimal (99.4%)',
        ulcerDetected: false,
        aiAdvice: 'Camera thermal vision scan confirms clean tissue integrity and excellent capillary circulation.'
      });
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(245, 158, 11, 0.12))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <ShieldAlert size={26} color="var(--accent-rose)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Diabetes Complication Monitoring & Predictive Risk Engine</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Continuous assessment for diabetic foot neuropathy, micro-vascular renal function, cardiovascular risk, and diabetic retinopathy.
        </p>
      </div>

      {/* 10-Year Complication Risk Score Meters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>HEART DISEASE RISK</span>
            <Heart size={18} color="var(--accent-rose)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.4rem 0' }}>8%</div>
          <div className="badge badge-success">Low Risk (Under Control)</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>KIDNEY DISEASE (eGFR)</span>
            <Activity size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.4rem 0' }}>9%</div>
          <div className="badge badge-success">Optimal (eGFR 94)</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>STROKE RISK SCORE</span>
            <ShieldAlert size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.4rem 0' }}>5%</div>
          <div className="badge badge-success">Minimal Risk</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>HOSPITALIZATION RISK</span>
            <Activity size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.4rem 0' }}>3%</div>
          <div className="badge badge-success">Very Low</div>
        </div>

      </div>

      {/* Diabetic Foot Ulcer Photo Scanner Simulator */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Footprints size={22} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Diabetic Foot Ulcer Photo Scanner</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analyzes plantar foot photos to detect early pressure points, erythema, or ulcerations.</p>
          </div>

          <button onClick={handleRunFootScan} disabled={footScanStatus === 'scanning'} className="btn-glow">
            {footScanStatus === 'scanning' ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Scanning Foot Image...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Simulate Photo Foot Scan</span>
              </>
            )}
          </button>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: 'var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LAST SCAN DATE</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{footScanResult.scanDate}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)', marginTop: '0.4rem', fontWeight: 700 }}>
              Tissue Perfusion: {footScanResult.perfusion}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI CLINICAL RECOMMENDATION</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
              "{footScanResult.aiAdvice}"
            </p>
          </div>
        </div>
      </div>

      {/* Neuropathy, BP & Eye Examination Schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <Activity size={20} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Blood Pressure & Neuropathy Log</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Blood Pressure:</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>118 / 76 mmHg (Normal)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Peripheral Numbness:</span>
              <span style={{ fontWeight: 700 }}>0 / 10 (No symptoms)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <Eye size={20} color="var(--accent-purple)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Diabetic Retinopathy Screening</h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
            Annual dilated eye exam prevents sight-threatening retinopathy.
          </p>
          <div className="badge badge-info" style={{ fontSize: '0.85rem' }}>
            Next Due Exam: Nov 14, 2026 (Scheduled)
          </div>
        </div>

      </div>

    </div>
  );
};
