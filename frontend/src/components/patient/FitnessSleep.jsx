import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Moon, Smile, Heart, Play, Pause, RefreshCw, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export const FitnessSleep = () => {
  const [steps] = useState(7420);
  const [stepGoal] = useState(10000);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins post meal walk

  const [breathingState, setBreathingState] = useState('Idle'); // Idle, Inhale, Hold, Exhale
  const [breathCount, setBreathCount] = useState(4);

  useEffect(() => {
    let timer = null;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const handleStartBreathing = () => {
    setBreathingState('Inhale');
    setBreathCount(4);
    setTimeout(() => {
      setBreathingState('Hold');
      setBreathCount(7);
      setTimeout(() => {
        setBreathingState('Exhale');
        setBreathCount(8);
        setTimeout(() => setBreathingState('Idle'), 8000);
      }, 7000);
    }, 4000);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(139, 92, 246, 0.12))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Flame size={26} color="var(--accent-amber)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Exercise, Sleep & Mental Stress Management Hub</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Physical activity accelerates glucose disposal in muscle cells, while restful REM sleep regulates cortisol levels and morning insulin sensitivity.
        </p>
      </div>

      {/* Fitness & Post-Meal Walk Timer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
        
        {/* Step Counter */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>DAILY STEP COUNTER</span>
            <Flame size={20} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '0.3rem 0' }}>
            {steps.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {stepGoal.toLocaleString()} steps</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
            <div style={{ width: `${(steps/stepGoal)*100}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #10b981)', borderRadius: '4px' }}></div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Approx. 340 kcal burned | 5.2 km covered</div>
        </div>

        {/* 15-Minute Post Meal Walk Timer */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>POST-MEAL WALK TIMECOUNT</span>
            <Clock size={20} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.3rem 0' }}>
            {formatTimer(timeLeft)}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={() => setTimerActive(!timerActive)} className="btn-glow" style={{ fontSize: '0.82rem' }}>
              {timerActive ? <Pause size={15} /> : <Play size={15} />}
              <span>{timerActive ? 'Pause Walk' : 'Start Post-Meal Walk'}</span>
            </button>
            <button onClick={() => { setTimerActive(false); setTimeLeft(900); }} className="btn-outline" style={{ fontSize: '0.82rem' }}>
              <RefreshCw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

      </div>

      {/* Sleep Analysis & Glucose Correlation */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Moon size={22} color="var(--accent-purple)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Sleep Quality & AI Glucose Correlation</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deep REM sleep reduces dawn phenomenon fasting spikes</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: 'var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SLEEP DURATION</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple)' }}>7.8 hrs</div>
            <div className="badge badge-success">88% Deep Sleep Quality</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI SLEEP VS FASTING GLUCOSE</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.3rem' }}>
              "7.5+ hours of uninterrupted sleep correlated with 14% lower fasting glucose (112 mg/dL vs 130 mg/dL baseline)."
            </p>
          </div>
        </div>
      </div>

      {/* Mental Stress & Guided Breathing */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Smile size={22} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Stress Detection & 4-7-8 Breathing Guide</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lowers epinephrine and cortisol to stabilize blood sugar spikes</p>
            </div>
          </div>

          <button onClick={handleStartBreathing} className="btn-glow">
            <Sparkles size={16} />
            <span>Start 4-7-8 Breathing Session</span>
          </button>
        </div>

        {breathingState !== 'Idle' && (
          <div style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{breathingState.toUpperCase()}</div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hold rhythm for {breathCount} seconds</div>
          </div>
        )}
      </div>

    </div>
  );
};
