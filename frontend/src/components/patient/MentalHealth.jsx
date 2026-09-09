import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Smile, Frown, Meh, AlertCircle, Heart, Sparkles, Activity, 
  Play, Pause, RefreshCw, CheckCircle2, Clock, Calendar, Info, ShieldCheck, Zap
} from 'lucide-react';
import { 
  subscribeUserMentalHealthLogs, 
  saveMentalHealthLogToFirestore 
} from '../../services/firebase';
import { generateAIStressGuidance } from '../../services/mentalHealthService';

export const MentalHealth = () => {
  const { currentUser, setToastAlert } = useApp();

  // Logger Form States
  const [selectedMood, setSelectedMood] = useState('Stressed');
  const [stressLevel, setStressLevel] = useState(7);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Firestore Sync Logs State
  const [logs, setLogs] = useState([]);

  // AI Wellness Card State
  const [aiGuidance, setAiGuidance] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Breathing Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // 'Inhale' | 'Hold' | 'Exhale' | 'Rest'
  const [secondsLeft, setSecondsLeft] = useState(4);

  // Mood Options
  const moodOptions = [
    { label: 'Happy', emoji: '😊', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Neutral', emoji: '😐', color: '#0284c7', bg: '#f0f9ff' },
    { label: 'Sad', emoji: '😔', color: '#7c3aed', bg: '#faf5ff' },
    { label: 'Anxious', emoji: '😰', color: '#d97706', bg: '#fffbeb' },
    { label: 'Stressed', emoji: '😫', color: '#dc2626', bg: '#fef2f2' }
  ];

  // Real-time Firestore Sync
  useEffect(() => {
    const targetUid = currentUser?.uid || currentUser?.id || auth?.currentUser?.uid;
    const targetEmail = currentUser?.email || auth?.currentUser?.email;

    if (!targetEmail && !targetUid) {
      setLogs([]);
      return;
    }

    const unsubscribe = subscribeUserMentalHealthLogs(targetUid, targetEmail, (cloudLogs) => {
      setLogs(cloudLogs || []);
    });

    return () => unsubscribe();
  }, [currentUser?.uid, currentUser?.email, auth?.currentUser?.uid]);

  // Trigger AI Stress Guidance automatically when initial stressLevel > 6 or on mount
  useEffect(() => {
    if (stressLevel > 6 && !aiGuidance && !isGeneratingAI) {
      fetchAIStressGuidance(selectedMood, stressLevel, notes);
    }
  }, [stressLevel]);

  // Breathing Timer Interval Loop
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev > 1) return prev - 1;
          
          // Rotate phases: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Rest (4s)
          setBreathPhase((currentPhase) => {
            if (currentPhase === 'Inhale') return 'Hold';
            if (currentPhase === 'Hold') return 'Exhale';
            if (currentPhase === 'Exhale') return 'Rest';
            return 'Inhale';
          });
          return 4;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const fetchAIStressGuidance = async (mood, level, userNote) => {
    setIsGeneratingAI(true);
    try {
      const result = await generateAIStressGuidance(mood, level, userNote);
      setAiGuidance(result);
    } catch (err) {
      console.error('[Mental Health AI Error]:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const moodItem = moodOptions.find(m => m.label === selectedMood) || moodOptions[4];

    const logEntry = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: selectedMood,
      emoji: moodItem.emoji,
      stressLevel: Number(stressLevel),
      notes: notes.trim(),
      aiGuided: stressLevel > 6
    };

    // Optimistic UI Update
    setLogs((prev) => [{ id: 'mhl-' + Date.now(), ...logEntry }, ...prev]);

    // Save to Firestore
    const targetUid = currentUser?.uid || currentUser?.id;
    const targetEmail = currentUser?.email;
    await saveMentalHealthLogToFirestore(targetUid, targetEmail, logEntry);

    // If stress is high (> 6), generate new AI Guidance card
    if (stressLevel > 6) {
      await fetchAIStressGuidance(selectedMood, stressLevel, notes);
    }

    setNotes('');
    setIsSubmitting(false);

    if (setToastAlert) {
      setToastAlert({
        type: 'success',
        title: 'Mood & Stress Logged',
        message: `Stress Level ${stressLevel}/10 recorded successfully.`
      });
    }
  };

  // Helper for stress score badges
  const getStressBadge = (level) => {
    if (level <= 3) return { label: 'Low / Restful', bg: '#dcfce7', color: '#15803d', border: '#86efac' };
    if (level <= 6) return { label: 'Moderate', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
    return { label: 'High / Elevated', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
  };

  const activeStressBadge = getStressBadge(stressLevel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '960px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.2rem' }}>
          <Smile size={24} color="#0284c7" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Stress & Mental Health Tracker
          </h1>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          Track daily mood and stress levels to understand your mind-body connection and prevent stress-induced glucose spikes.
        </p>
      </div>

      {/* 1. DAILY MOOD & STRESS LOGGER FORM */}
      <div className="glass-panel" style={{ padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)' }}>
        
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.25rem 0', letterSpacing: '-0.01em' }}>
          Log Today's Mood & Stress Level
        </h3>

        <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          
          {/* Mood Emoji Selector Buttons */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Current Mood
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.65rem' }}>
              {moodOptions.map((item) => {
                const isSelected = selectedMood === item.label;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSelectedMood(item.label)}
                    style={{
                      padding: '0.85rem 0.5rem',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${item.color}` : '1px solid #e2e8f0',
                      background: isSelected ? item.bg : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>{item.emoji}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? item.color : '#475569' }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stress Level Slider (1 - 10) */}
          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Stress Level (1 - 10)
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: activeStressBadge.color }}>
                  {stressLevel} / 10
                </span>
                <span style={{ background: activeStressBadge.bg, color: activeStressBadge.color, border: `1px solid ${activeStressBadge.border}`, padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                  {activeStressBadge.label}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={e => setStressLevel(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                outline: 'none',
                accentColor: activeStressBadge.color,
                cursor: 'pointer'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginTop: '0.35rem' }}>
              <span>1 - Completely Relaxed</span>
              <span>5 - Moderate Pressure</span>
              <span>10 - Severely Stressed</span>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              What's on your mind today? (Optional Note)
            </label>
            <input
              type="text"
              placeholder="e.g. Busy workday, skipped morning exercise, or family stress..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              padding: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              border: 'none',
              borderRadius: '10px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              justifyContent: 'center'
            }}
          >
            {isSubmitting ? 'Saving Log...' : 'Log Mood & Stress Level'}
          </button>

        </form>

      </div>

      {/* 2. AI STRESS ANALYSIS & SOOTHING BREATHING WELLNESS CARD (Triggered when stress > 6) */}
      {stressLevel > 6 && (
        <div
          className="glass-panel"
          style={{
            padding: '1.6rem',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '16px',
            border: '1px solid #bae6fd',
            boxShadow: '0 8px 30px -5px rgba(2, 132, 199, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {/* Card Title Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <Sparkles size={22} color="#0284c7" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0369a1', margin: 0, letterSpacing: '-0.01em' }}>
                  {aiGuidance?.title || 'AI Stress Analysis & Guided Relaxation'}
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
                High Stress Level Detected ({stressLevel}/10) • Gemini AI Personalized Guidance
              </span>
            </div>

            <button
              onClick={() => fetchAIStressGuidance(selectedMood, stressLevel, notes)}
              disabled={isGeneratingAI}
              style={{ background: '#ffffff', border: '1px solid #7dd3fc', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={14} className={isGeneratingAI ? 'spin-icon' : ''} style={{ animation: isGeneratingAI ? 'spin 1s linear infinite' : 'none' }} />
              <span>Regenerate AI Guide</span>
            </button>
          </div>

          {isGeneratingAI ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', gap: '0.65rem' }}>
              <RefreshCw size={26} color="#0284c7" className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0369a1' }}>
                Generating personalized 3-minute relaxation guidance with Gemini AI...
              </span>
            </div>
          ) : (
            <>
              {/* Clinical Insight Banner */}
              {aiGuidance?.clinicalInsight && (
                <div style={{ background: '#ffffff', padding: '0.95rem 1.1rem', borderRadius: '12px', border: '1px solid #bae6fd', fontSize: '0.86rem', color: '#0f172a', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Info size={16} />
                    <span>Clinical Mind-Glucose Connection</span>
                  </div>
                  {aiGuidance.clinicalInsight}
                </div>
              )}

              {/* Positive Affirmation Banner */}
              {aiGuidance?.positiveAffirmation && (
                <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '0.75rem 1rem', borderRadius: '10px', borderLeft: '4px solid #0284c7', fontSize: '0.85rem', fontWeight: 700, color: '#0369a1', fontStyle: 'italic' }}>
                  "{aiGuidance.positiveAffirmation}"
                </div>
              )}

              {/* ANIMATED 3-MINUTE BREATHING EXERCISE */}
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #bae6fd', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Guided 3-Minute Box Breathing Session
                </span>

                {/* Animated Pulsing Breathing Circle */}
                <div
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: breathPhase === 'Inhale' 
                      ? 'radial-gradient(circle, #38bdf8 0%, #0284c7 100%)' 
                      : breathPhase === 'Hold' 
                      ? 'radial-gradient(circle, #fbbf24 0%, #d97706 100%)' 
                      : breathPhase === 'Exhale'
                      ? 'radial-gradient(circle, #4ade80 0%, #16a34a 100%)'
                      : 'radial-gradient(circle, #cbd5e1 0%, #64748b 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justify: 'center',
                    color: '#ffffff',
                    boxShadow: '0 10px 25px rgba(2, 132, 199, 0.3)',
                    transform: isTimerRunning && (breathPhase === 'Inhale' || breathPhase === 'Hold') ? 'scale(1.18)' : 'scale(1.0)',
                    transition: 'transform 4s ease-in-out, background 0.5s ease'
                  }}
                >
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    {isTimerRunning ? breathPhase : 'Ready'}
                  </span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.1rem' }}>
                    {isTimerRunning ? `${secondsLeft}s` : '3 Min'}
                  </span>
                </div>

                {/* Start / Pause Timer Control */}
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="btn-primary"
                  style={{
                    padding: '0.55rem 1.35rem',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    background: isTimerRunning ? '#dc2626' : '#0284c7',
                    border: 'none',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isTimerRunning ? 'Pause Breathing Session' : 'Start 3-Minute Breathing'}</span>
                </button>

                {/* Step-by-step Relaxation Guidance List */}
                {Array.isArray(aiGuidance?.relaxationSteps) && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.4rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.85rem' }}>
                    {aiGuidance.relaxationSteps.map((stepText, sIdx) => (
                      <div key={sIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: '#334155' }}>
                        <CheckCircle2 size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                        <span>{stepText}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </>
          )}

        </div>
      )}

      {/* 3. HISTORICAL MOOD & STRESS LOGS TIMELINE */}
      <div className="glass-panel" style={{ padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', letterSpacing: '-0.01em' }}>
          Mood & Stress Log History ({logs.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {logs.map((log) => {
            const badge = getStressBadge(log.stressLevel);

            return (
              <div
                key={log.id}
                style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '2rem' }}>{log.emoji}</span>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{log.mood}</span>
                      <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                        Stress {log.stressLevel}/10 ({badge.label})
                      </span>
                    </div>

                    {log.notes && (
                      <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.2rem 0 0 0' }}>
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    <Calendar size={13} />
                    <span>{log.date} {log.time}</span>
                  </div>

                  {log.aiGuided && (
                    <span style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800 }}>
                      ✨ AI Guided
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
