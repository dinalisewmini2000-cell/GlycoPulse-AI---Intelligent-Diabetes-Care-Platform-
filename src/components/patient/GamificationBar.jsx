import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Flame, Zap, CheckCircle2, ShieldCheck, Trophy, Star } from 'lucide-react';

export const GamificationBar = () => {
  const { healthScore, streakDays } = useApp();

  const badges = [
    { title: 'CGM Master', desc: 'Maintained 80%+ Time In Range for 14 straight days', icon: Zap, unlocked: true },
    { title: 'Glycemic Ninja', desc: 'Logged 3 meals with Low Glycemic Index (<55)', icon: Trophy, unlocked: true },
    { title: 'Post-Meal Champion', desc: 'Completed 15-min post-meal walks 5 days in a row', icon: Flame, unlocked: true },
    { title: 'Hydration Hero', desc: 'Hit 2.5L water intake goal for 7 consecutive days', icon: Star, unlocked: true }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>DAILY HEALTH SCORE</div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.4rem 0' }}>
            {healthScore}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div className="badge badge-success">Top 5% Patients Platform-Wide</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>HEALTHY HABIT STREAK</div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '0.4rem 0' }}>
            🔥 {streakDays} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Days</span>
          </div>
          <div className="badge badge-warning">Streak Bonus: +250 Points</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUMULATIVE REWARD POINTS</div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.4rem 0' }}>
            1,480 <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>pts</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Redeemable for diabetic care supplies</div>
        </div>

      </div>

      {/* Badges Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Unlocked Achievement Badges</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: 'var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={24} color="var(--accent-cyan)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{b.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
