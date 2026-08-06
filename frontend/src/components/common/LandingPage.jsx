import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, Sparkles, Brain, ShieldCheck, Heart, Users, Radio, Utensils, 
  FileSpreadsheet, Award, ArrowRight, CheckCircle2, Lock, UserCheck, Stethoscope, ShieldAlert 
} from 'lucide-react';

export const LandingPage = () => {
  const { setAuthModalOpen, loginUser } = useApp();

  const handleQuickDemo = (role) => {
    loginUser({ role });
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Section */}
      <section style={{ 
        padding: '5rem 2rem 4rem 2rem', textAlign: 'center', 
        background: 'radial-gradient(circle at top, rgba(6, 182, 212, 0.18) 0%, rgba(10, 16, 32, 0) 70%)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div className="badge badge-info" style={{ display: 'inline-flex', padding: '0.5rem 1.2rem', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid rgba(6,182,212,0.4)' }}>
            <Sparkles size={16} />
            <span>Next-Generation AI Clinical Diabetes Ecosystem</span>
          </div>

          <h1 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.2rem', background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Empowering Precision Diabetes Care with Live AI Telemetry
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
            GlycoPulse AI bridges continuous glucose monitoring (CGM), computer vision meal recognition, lab OCR parsing, and predictive neural trajectory modeling for Patients, Endocrinologists, Caregivers, and Health Admins.
          </p>

          {/* Primary Action CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button onClick={() => setAuthModalOpen(true)} className="btn-glow" style={{ padding: '1rem 2.2rem', fontSize: '1.05rem', borderRadius: '14px' }}>
              <span>Sign In / Create Account</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* 1-Click Instant Role Demo Previews */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'inline-block', maxWidth: '700px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ⚡ OR TEST INSTANT DEMO ACCESS IN ONE CLICK:
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => handleQuickDemo('patient')} className="btn-outline" style={{ borderColor: 'var(--accent-cyan)' }}>
                <Activity size={16} />
                <span>Patient Demo</span>
              </button>

              <button onClick={() => handleQuickDemo('doctor')} className="btn-outline" style={{ borderColor: 'var(--accent-emerald)' }}>
                <Stethoscope size={16} />
                <span>Doctor Demo</span>
              </button>

              <button onClick={() => handleQuickDemo('caregiver')} className="btn-outline" style={{ borderColor: 'var(--accent-amber)' }}>
                <Heart size={16} />
                <span>Caregiver Demo</span>
              </button>

              <button onClick={() => handleQuickDemo('admin')} className="btn-outline" style={{ borderColor: 'var(--accent-purple)' }}>
                <ShieldAlert size={16} />
                <span>Admin Demo</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* About The Platform Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.6rem' }}>Everything You Need for Total Diabetes Control</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Integrated smart algorithms engineered for daily decision support</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.8rem', borderLeft: '4px solid var(--accent-cyan)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Radio size={24} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Live CGM Telemetry Ticker</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Streams Dexcom G7 & FreeStyle Libre 3 blood sugar readings every 5 seconds with trend arrows and pharmacodynamic Insulin On Board (IOB) tracking.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.8rem', borderLeft: '4px solid var(--accent-purple)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Brain size={24} color="var(--accent-purple)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>4-Hour AI Predictive Trajectory</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Projects blood sugar curves 240 minutes ahead to catch impending hypoglycemia dips early and offer personalized micro-interventions.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.8rem', borderLeft: '4px solid var(--accent-emerald)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Utensils size={24} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Vision AI Food Recognition</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Upload meal photos to instantly calculate Carbs, Glycemic Load (GL), Glycemic Index (GI), and generate tailored low-GI grocery shopping lists.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.8rem', borderLeft: '4px solid var(--accent-amber)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <FileSpreadsheet size={24} color="var(--accent-amber)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Clinical Lab OCR Parser</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Automatically scans PDF blood test panels to extract HbA1c, Kidney eGFR, and Lipid Profiles for physician review.
            </p>
          </div>

        </div>
      </section>

      {/* User Portals Section */}
      <section style={{ padding: '4rem 2rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.6rem' }}>Multi-Role Care Coordination</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Tailored portals for every member of the care team</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Patient Portal</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Live CGM, meal logging, 4-7-8 breathing guide, device sync, and PDF reports.</p>
              <button onClick={() => handleQuickDemo('patient')} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Explore Patient View</button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>Doctor Portal</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Clinical roster, AI insulin dose calculators, E-prescriptions, and HD tele-health links.</p>
              <button onClick={() => handleQuickDemo('doctor')} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Explore Doctor View</button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>Caregiver Portal</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Remote vitals monitoring, emergency alert logs, and instant SMS check-ins.</p>
              <button onClick={() => handleQuickDemo('caregiver')} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Explore Caregiver View</button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>Admin Portal</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>System telemetry throughputs, AI model accuracy tracking, and user account directory.</p>
              <button onClick={() => handleQuickDemo('admin')} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Explore Admin View</button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div>GlycoPulse AI - Clinical Diabetes Care Platform &copy; 2026. All Rights Reserved.</div>
      </footer>

    </div>
  );
};
