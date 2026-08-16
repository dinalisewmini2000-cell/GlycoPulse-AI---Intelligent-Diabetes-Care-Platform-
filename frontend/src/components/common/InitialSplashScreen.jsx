import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Sparkles } from 'lucide-react';

export const InitialSplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing GlycoPulse Clinical Core...');

  useEffect(() => {
    const startTime = Date.now();
    const duration = 5000; // Exactly 5 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed < 1800) {
        setStatusText('Initializing GlycoPulse Clinical Core...');
      } else if (elapsed < 3600) {
        setStatusText('Connecting to Firebase & SQL Telemetry Streams...');
      } else {
        setStatusText('Preparing Authentication Gateway...');
      }

      if (elapsed >= duration) {
        clearInterval(timer);
        onComplete();
      }
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 99999,
      background: 'radial-gradient(circle at center, #131b2e 0%, #0b0f19 80%)',
      color: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    }}>
      {/* Outer Glow Card */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '3rem 3.5rem',
        borderRadius: '28px',
        background: 'rgba(19, 27, 46, 0.85)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 182, 212, 0.15)',
        maxWidth: '480px',
        width: '90%',
        textAlign: 'center'
      }}>

        {/* Animated Pulsing Logo Container */}
        <div style={{ position: 'relative', marginBottom: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute',
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            border: '2px solid rgba(6, 182, 212, 0.4)',
            animation: 'sos-pulse 1.8s infinite',
            opacity: 0.6
          }}></div>
          
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 35px rgba(6, 182, 212, 0.6)'
          }}>
            <Activity size={40} color="#ffffff" />
          </div>
        </div>

        {/* Title */}
        <div style={{
          fontSize: '2rem',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.3rem'
        }}>
          GlycoPulse AI
        </div>

        <div style={{
          fontSize: '0.85rem',
          color: '#94a3b8',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: '2rem'
        }}>
          Intelligent Diabetes Care Platform
        </div>

        {/* Status Text */}
        <div style={{
          fontSize: '0.9rem',
          color: '#38bdf8',
          fontWeight: 600,
          marginBottom: '1rem',
          minHeight: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem'
        }}>
          <Sparkles size={16} color="#06b6d4" />
          <span>{statusText}</span>
        </div>

        {/* Progress Bar Container */}
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '0.7rem',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)',
            borderRadius: '10px',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.8)',
            transition: 'width 0.1s linear'
          }}></div>
        </div>

        {/* Percentage Counter & Security Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>256-bit Encrypted</span>
          </div>
          <span style={{ color: '#06b6d4' }}>{progress}%</span>
        </div>

      </div>
    </div>
  );
};
