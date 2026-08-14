import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { analyzeDFUFootImage } from '../../services/dfuVisionService';
import { 
  ShieldAlert, UploadCloud, RefreshCw, CheckCircle2, Info, AlertCircle, RotateCcw
} from 'lucide-react';

export const RiskComplications = () => {
  const { 
    dfuScanResult, setDfuScanResult, 
    dfuPhotoUrl, setDfuPhotoUrl
  } = useApp();

  const [isScanning, setIsScanning] = useState(false);
  const footInputRef = useRef(null);

  const handleResetDfuScan = () => {
    setDfuPhotoUrl(null);
    setDfuScanResult(null);
    if (footInputRef.current) footInputRef.current.value = '';
  };

  // Foot Photo Upload Handler
  const handleFootScanUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setDfuPhotoUrl(fileUrl);
    setIsScanning(true);

    try {
      const result = await analyzeDFUFootImage(file);
      setDfuScanResult(result);
    } catch (err) {
      console.error('DFU Upload Error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const getBadgeStyle = (resultCode) => {
    switch (resultCode) {
      case 'NO OBVIOUS VISIBLE ABNORMALITY':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399' };
      case 'VISIBLE SKIN CHANGE':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' };
      case 'VISIBLE SWELLING / REDNESS':
        return { bg: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.5)', color: '#f59e0b' };
      case 'VISIBLE WOUND / ULCER-LIKE AREA':
      case 'MULTIPLE VISIBLE ABNORMALITIES':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#f87171' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#cbd5e1' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(6, 182, 212, 0.12))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <ShieldAlert size={26} color="var(--accent-rose)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Diabetic Foot Ulcer (DFU) Vision Inspection</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Real-time visual screening for foot skin integrity, lesions, and localized erythema using computer vision photo analysis.
        </p>
      </div>

      {/* Diabetic Foot Ulcer Main Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Foot Photo Vision Inspection</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload a foot photo for visual skin integrity, lesion, and erythema screening</p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <input 
              type="file" 
              ref={footInputRef} 
              accept="image/*" 
              onChange={handleFootScanUpload} 
              style={{ display: 'none' }} 
            />
            <button onClick={() => footInputRef.current?.click()} className="btn-glow">
              <UploadCloud size={16} />
              <span>Upload Foot Photo</span>
            </button>

            {(dfuPhotoUrl || dfuScanResult) && (
              <button onClick={handleResetDfuScan} className="btn-outline" style={{ borderColor: 'var(--accent-cyan)' }}>
                <RotateCcw size={16} />
                <span>Upload New Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* Uploaded Foot Image Display */}
        {dfuPhotoUrl && (
          <div style={{ marginBottom: '1.2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <img 
                src={dfuPhotoUrl} 
                alt="Uploaded foot inspection photo" 
                style={{ maxWidth: '280px', maxHeight: '200px', borderRadius: '14px', border: '2px solid var(--accent-cyan)', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }} 
              />
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.75)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>
                Uploaded Image
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => footInputRef.current?.click()} className="btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}>
                <RotateCcw size={14} />
                <span>Change / Re-upload Foot Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Processing Spinner */}
        {isScanning ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent-cyan)' }}>
            <RefreshCw size={38} className="spin-slow" style={{ margin: '0 auto 1rem auto' }} />
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Analyzing Image Pixels & Skin Integrity...</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Evaluating image quality, foot detection, surface erythema, and dark lesion clusters...
            </div>
          </div>
        ) : !dfuScanResult ? (
          /* Empty State */
          <div style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '14px', border: '1px dashed var(--border-color)' }}>
            <ShieldAlert size={38} color="var(--accent-rose)" style={{ margin: '0 auto 0.8rem auto', opacity: 0.7 }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem' }}>No Foot Inspection Photo Uploaded</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto' }}>
              Upload a clear foot photograph above to perform AI visual screening for visible lesions, skin discoloration, or localized redness.
            </p>
          </div>
        ) : (
          /* Structured UI Result Card */
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Title Badge Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    AI VISUAL FOOT SCREENING
                  </span>
                  <button onClick={handleResetDfuScan} className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}>
                    <RotateCcw size={12} />
                    <span>Upload Different Photo</span>
                  </button>
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {dfuScanResult.statusText || dfuScanResult.screeningResult}
                </h4>
                {dfuScanResult.subText && (
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {dfuScanResult.subText}
                  </p>
                )}
              </div>

              {/* Dynamic Status Pill */}
              <div style={{
                padding: '0.45rem 1rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem',
                ...getBadgeStyle(dfuScanResult.screeningResult)
              }}>
                {dfuScanResult.screeningResult}
              </div>
            </div>

            {/* Assessment Confidence Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Assessment Confidence:
              </span>
              <span style={{
                fontSize: '0.82rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px',
                background: dfuScanResult.confidence === 'High' ? 'rgba(16, 185, 129, 0.2)' : dfuScanResult.confidence === 'Moderate' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                color: dfuScanResult.confidence === 'High' ? '#34d399' : dfuScanResult.confidence === 'Moderate' ? '#fbbf24' : '#94a3b8'
              }}>
                {dfuScanResult.confidence}
              </span>
            </div>

            {/* Visible Findings Section */}
            <div>
              <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="var(--accent-cyan)" />
                <span>Visible Findings</span>
              </h5>

              {dfuScanResult.findings && dfuScanResult.findings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dfuScanResult.findings.map((f, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          • {f.type}
                        </span>
                        <span style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          Location: {f.location} | Confidence: {f.confidence}
                        </span>
                      </div>
                      {f.description && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                          {f.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No visible findings available for this image.
                </div>
              )}
            </div>

            {/* Limitations Section */}
            {dfuScanResult.limitations && dfuScanResult.limitations.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Info size={15} color="var(--accent-cyan)" />
                  <span>Assessment Limitations</span>
                </h5>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {dfuScanResult.limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Action */}
            {dfuScanResult.recommendation && (
              <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.2rem' }}>
                  💡 RECOMMENDED ACTION
                </span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0, fontWeight: 500 }}>
                  {dfuScanResult.recommendation}
                </p>
              </div>
            )}

            {/* Medical Safety Disclaimer Notice */}
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.78rem', color: '#fca5a5', margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
                {dfuScanResult.disclaimer || "Important: This AI feature provides image-based visual screening support only. It cannot diagnose diabetic foot ulcers, neuropathy, infection, or circulation problems. A healthcare professional should perform a clinical assessment when medically appropriate."}
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
