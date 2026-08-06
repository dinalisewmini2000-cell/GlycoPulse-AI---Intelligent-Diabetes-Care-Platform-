import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { jsPDF } from 'jspdf';
import { 
  Award, Flame, Trophy, CheckCircle2, Download, Sparkles, Star, Target, ShieldCheck 
} from 'lucide-react';

export const GamificationBar = () => {
  const { streakDays, healthScore, currentUser } = useApp();
  const [downloadedCert, setDownloadedCert] = useState(false);

  const [xp, setXp] = useState(2450);
  const [level] = useState(8);
  const nextLevelXp = 3000;

  const badges = [
    { title: '7-Day TIR Master', desc: 'Maintained ≥70% Time-in-Range for 7 consecutive days', unlocked: true, icon: Trophy, color: '#f59e0b' },
    { title: 'Night Sentinel', desc: 'Zero nocturnal hypoglycemia events for 14 nights', unlocked: true, icon: ShieldCheck, color: '#06b6d4' },
    { title: 'Fiber Champion', desc: 'Logged 30g+ dietary fiber 5 days in a row', unlocked: true, icon: Star, color: '#10b981' },
    { title: 'Hydration Hero', desc: 'Met 2.5L daily hydration goal 10 days in a row', unlocked: true, icon: Target, color: '#a855f7' }
  ];

  const handleDownloadCertificate = () => {
    const doc = new jsPDF('landscape');
    
    doc.setLineWidth(2);
    doc.setDrawColor(6, 182, 212);
    doc.rect(10, 10, 277, 190);

    doc.setFontSize(26);
    doc.setTextColor(6, 182, 212);
    doc.text('GlycoPulse AI - Certificate of Glycemic Excellence', 148, 40, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('This clinical achievement award is officially presented to:', 148, 65, { align: 'center' });

    doc.setFontSize(22);
    doc.setTextColor(0);
    doc.text(currentUser?.name || 'Sarah Jenkins', 148, 85, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text(`For demonstrating outstanding self-management, maintaining an 84% Time-in-Range (TIR),`, 148, 110, { align: 'center' });
    doc.text(`and completing a ${streakDays}-Day Continuous Health Logging Streak.`, 148, 120, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`Issued: ${new Date().toLocaleDateString()} | Verified by GlycoPulse Clinical AI Engine`, 148, 155, { align: 'center' });
    doc.text(`Dr. Robert Vance, MD - Chief Endocrinologist`, 148, 165, { align: 'center' });

    doc.save(`GlycoPulse_Excellence_Certificate_${currentUser?.name?.replace(' ', '_') || 'Patient'}.pdf`);
    setDownloadedCert(true);
    setTimeout(() => setDownloadedCert(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Award size={28} color="var(--accent-amber)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Adherence Rewards & Clinical Milestones</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
              Level {level} Glycemic Champion | XP: {xp} / {nextLevelXp}
            </div>
          </div>
        </div>
      </div>

      {/* Streak & Level Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <Flame size={22} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>LOGGING STREAK</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-amber)' }}>{streakDays} Days</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Active Daily Streak</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <Trophy size={22} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>CLINICAL SCORE</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>{healthScore}/100</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Top 5% Adherence</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <Sparkles size={22} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>CERTIFICATE STATUS</span>
          </div>
          <button onClick={handleDownloadCertificate} className="btn-glow" style={{ marginTop: '0.4rem', fontSize: '0.82rem', width: '100%', justifyContent: 'center' }}>
            <Download size={15} />
            <span>{downloadedCert ? 'Certificate Saved!' : 'Download Diploma'}</span>
          </button>
        </div>

      </div>

      {/* Unlocked Clinical Badges */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Unlocked Clinical Badges</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: 'var(--border-color)', borderLeft: `4px solid ${b.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${b.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={b.color} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{b.title}</h4>
                    <span className="badge badge-success">Unlocked</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
