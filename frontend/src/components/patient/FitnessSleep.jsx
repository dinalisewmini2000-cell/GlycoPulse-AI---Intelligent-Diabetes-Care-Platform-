import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Flame, Moon, Activity, Heart, PlusCircle, CheckCircle2, Play, Pause, X 
} from 'lucide-react';

export const FitnessSleep = () => {
  const [workouts, setWorkouts] = useState([
    { id: 'w-1', type: 'Brisk Morning Walk', durationMinutes: 35, calories: 185, bgDropEstimate: '-18 mg/dL', date: 'Today 08:00 AM' },
    { id: 'w-2', type: 'Resistance & Weight Training', durationMinutes: 45, calories: 260, bgDropEstimate: '-24 mg/dL', date: 'Yesterday 05:30 PM' }
  ]);

  // Workout Modal
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutType, setWorkoutType] = useState('Cycling');
  const [duration, setDuration] = useState(30);

  // 4-7-8 Breathing Timer State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale (4s)');
  const [breathCountdown, setBreathCountdown] = useState(4);

  useEffect(() => {
    let timer;
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathCountdown(prev => {
          if (prev > 1) return prev - 1;

          // Phase transitions
          if (breathPhase.startsWith('Inhale')) {
            setBreathPhase('Hold Breath (7s)');
            return 7;
          } else if (breathPhase.startsWith('Hold')) {
            setBreathPhase('Exhale (8s)');
            return 8;
          } else {
            setBreathPhase('Inhale (4s)');
            return 4;
          }
        });
      }, 1000);
    } else {
      setBreathPhase('Inhale (4s)');
      setBreathCountdown(4);
    }

    return () => clearInterval(timer);
  }, [breathingActive, breathPhase]);

  const handleAddWorkout = (e) => {
    e.preventDefault();
    const calBurned = Math.round(duration * 6.5);
    const dropEst = Math.round(duration * 0.6);

    const newW = {
      id: 'w-' + Date.now(),
      type: workoutType,
      durationMinutes: duration,
      calories: calBurned,
      bgDropEstimate: `-${dropEst} mg/dL`,
      date: 'Just now'
    };

    setWorkouts(prev => [newW, ...prev]);
    setShowWorkoutModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(236, 72, 153, 0.12))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Flame size={26} color="var(--accent-amber)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Fitness, Sleep & Stress Optimization Engine</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Physical exercise enhances GLUT-4 receptor translocation into muscle cells, while restful sleep reduces nocturnal cortisol spikes.
        </p>
      </div>

      {/* Fitness Summary & Workout Logger */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Exercise Logs & Glucose Drop Forecasting</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tracks active burn and post-exercise insulin sensitivity boosts</p>
          </div>

          <button onClick={() => setShowWorkoutModal(true)} className="btn-glow">
            <PlusCircle size={16} />
            <span>Log Workout</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {workouts.map(w => (
            <div key={w.id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid var(--accent-amber)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{w.date}</span>
                <div className="badge badge-warning">{w.bgDropEstimate}</div>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.4rem 0 0.2rem 0' }}>{w.type}</h4>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Duration: {w.durationMinutes} mins | Burned: {w.calories} kcal
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sleep & 4-7-8 Stress Reliever */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Sleep Telemetry */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <Moon size={22} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Sleep Quality Index</h3>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>7 hrs 45 mins</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.3rem 0 1rem 0' }}>
            Deep REM: 1h 50m | Efficiency: 92% | Zero Nocturnal Hypo Events
          </p>

          <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>
            ✓ Dawn Phenomenon Suppressed (Morning Glucose stable at 108 mg/dL)
          </div>
        </div>

        {/* Interactive 4-7-8 Breathing Guide */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <Activity size={22} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>4-7-8 Cortisol Breathing Guide</h3>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))', 
              border: '2px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', margin: '0 auto 1rem auto', flexDirection: 'column',
              transition: 'all 1s ease', transform: breathPhase.startsWith('Inhale') ? 'scale(1.15)' : breathPhase.startsWith('Hold') ? 'scale(1.15)' : 'scale(0.9)'
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{breathCountdown}s</div>
            </div>

            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              {breathPhase}
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Lowers sympathetic nervous system arousal and stabilizes vagal tone.
            </p>

            <button 
              onClick={() => setBreathingActive(!breathingActive)} 
              className={breathingActive ? 'btn-outline' : 'btn-glow'} 
              style={{ padding: '0.6rem 1.4rem', justifyContent: 'center' }}
            >
              {breathingActive ? <Pause size={16} /> : <Play size={16} />}
              <span>{breathingActive ? 'Pause Exercise' : 'Start 4-7-8 Breathing'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Log Workout Modal */}
      {showWorkoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Log Fitness Activity</h3>
            <form onSubmit={handleAddWorkout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Activity Type</label>
                <select 
                  value={workoutType}
                  onChange={e => setWorkoutType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                >
                  <option value="Brisk Walking">Brisk Walking</option>
                  <option value="Running / Jogging">Running / Jogging</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Weight Training">Weight Training</option>
                  <option value="Yoga / Pilates">Yoga / Pilates</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Duration (Minutes)</label>
                <input 
                  type="number" 
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  required
                  min={5}
                  max={180}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'var(--border-color)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>Save Activity</button>
                <button type="button" onClick={() => setShowWorkoutModal(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
