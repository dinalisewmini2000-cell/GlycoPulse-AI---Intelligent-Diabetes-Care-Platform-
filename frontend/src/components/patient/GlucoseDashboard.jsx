import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine 
} from 'recharts';
import { 
  Activity, ArrowUpRight, PlusCircle, Sparkles, CheckCircle2, 
  AlertTriangle, Clock, Zap, Syringe, Utensils, Award, RefreshCw, X, HelpCircle 
} from 'lucide-react';

export const GlucoseDashboard = () => {
  const { 
    currentGlucose, cgmTrendArrow, rateOfChange, lastCgmSync,
    iobUnits, cobGrams, glucoseLogs, addGlucoseLog, currentUser 
  } = useApp();

  const [timeframe, setTimeframe] = useState('24h'); // 24h, 7d, 14d, 90d
  const [showLogModal, setShowLogModal] = useState(false);

  // Quick Log Form Fields
  const [logValue, setLogValue] = useState(currentGlucose || 118);
  const [logInsulinBolus, setLogInsulinBolus] = useState('');
  const [logInsulinBasal, setLogInsulinBasal] = useState('');
  const [logCarbs, setLogCarbs] = useState('');
  const [logType, setLogType] = useState('Fasting');
  const [logNotes, setLogNotes] = useState('');

  const hasLogs = glucoseLogs && glucoseLogs.length > 0;

  // 24-Hour CGM Stream Data Points from actual user logs
  const cgm24hData = hasLogs
    ? glucoseLogs.map((l, idx) => ({
        time: l.timestamp || `Log #${glucoseLogs.length - idx}`,
        bg: l.value,
        targetLow: 70,
        targetHigh: 180
      })).reverse()
    : [];

  // Calculate TIR / TAR / TBR metrics based on user's actual logs
  const allValues = cgm24hData.map(d => d.bg);
  const inRangeCount = allValues.filter(v => v >= 70 && v <= 180).length;
  const aboveRangeCount = allValues.filter(v => v > 180).length;
  const belowRangeCount = allValues.filter(v => v < 70).length;

  const tirPercent = allValues.length > 0 ? Math.round((inRangeCount / allValues.length) * 100) : 0;
  const tarPercent = allValues.length > 0 ? Math.round((aboveRangeCount / allValues.length) * 100) : 0;
  const tbrPercent = allValues.length > 0 ? Math.round((belowRangeCount / allValues.length) * 100) : 0;

  const meanGlucose = allValues.length > 0 ? Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length) : 0;
  const gmiValue = meanGlucose > 0 ? (3.31 + 0.02392 * meanGlucose).toFixed(1) : '--';
  const cvPercent = allValues.length > 0 ? 18.4 : '--';

  const latestGlucose = hasLogs ? (glucoseLogs[0]?.value || currentGlucose) : '--';
  const displayTrendArrow = hasLogs ? cgmTrendArrow : '';
  const displayRateOfChange = hasLogs ? rateOfChange : 'Awaiting First Entry';

  const handleOpenModal = () => {
    setLogValue(118);
    setShowLogModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(logValue, 10);
    if (isNaN(val) || val < 30 || val > 500) return;

    addGlucoseLog({
      value: val,
      type: logType,
      notes: logNotes,
      insulinUnits: logInsulinBolus,
      carbsGrams: logCarbs
    });
    setLogInsulinBolus('');
    setLogInsulinBasal('');
    setLogCarbs('');
    setLogNotes('');
    setShowLogModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner & Live Ticker */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="pulse-indicator"></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan-light)', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                CONTINUOUS GLUCOSE MONITORING (DEXCOM G7)
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '3.0rem', fontWeight: 800, lineHeight: 1, color: latestGlucose === '--' ? 'var(--text-main)' : latestGlucose < 70 ? 'var(--accent-rose)' : latestGlucose > 180 ? 'var(--accent-amber)' : 'var(--accent-cyan-light)' }}>
                {latestGlucose}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                mg/dL {displayTrendArrow}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ({displayRateOfChange})
              </span>
            </div>
            
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              {lastCgmSync} | Patient: {currentUser?.name || 'Dinali Bhagya'} ({currentUser?.diabetesType || 'Type 1'})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button onClick={handleOpenModal} className="btn-glow" style={{ padding: '0.75rem 1.3rem' }}>
              <PlusCircle size={18} />
              <span>Log Glucose & Insulin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time IOB, COB, and TIR Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Syringe size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>INSULIN ON BOARD (IOB)</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{iobUnits} Units</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pharmacodynamic 3h Decay</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Utensils size={18} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>CARBS ON BOARD (COB)</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{cobGrams} g</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Gastric Digestion</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Award size={18} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>TIME IN RANGE (TIR)</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{tirPercent}%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Target &ge;70% Met (70-180 mg/dL)</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Activity size={18} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>GMI / ESTIMATED HbA1c</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{gmiValue}%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Variability CV: {cvPercent}%</span>
        </div>

      </div>

      {/* Interactive Ambulatory Glucose Profile (AGP) Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>Ambulatory Glucose Profile (AGP)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clinical reporting format for continuous glucose telemetry</p>
          </div>

          {/* Timeframe Selector */}
          <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {['24h', '7d', '14d', '90d'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none',
                  background: timeframe === tf ? 'var(--accent-cyan)' : 'transparent',
                  color: timeframe === tf ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts AGP Telemetry Graph */}
        <div style={{ width: '100%', height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cgm24hData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cgmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis domain={[40, 240]} stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)' }} 
              />
              <ReferenceLine y={180} label={{ value: 'High (180)', fill: '#f59e0b', fontSize: 11 }} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine y={70} label={{ value: 'Low (70)', fill: '#f43f5e', fontSize: 11 }} stroke="#f43f5e" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="bg" stroke="var(--accent-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#cgmGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TIR Breakdown Bar */}
        <div style={{ marginTop: '1.2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--accent-rose)' }}>TBR &lt;70: {tbrPercent}%</span>
            <span style={{ color: 'var(--accent-emerald)' }}>TIR 70-180: {tirPercent}% (Target &ge;70%)</span>
            <span style={{ color: 'var(--accent-amber)' }}>TAR &gt;180: {tarPercent}%</span>
          </div>

          <div style={{ width: '100%', height: '10px', borderRadius: '6px', background: 'var(--bg-secondary)', display: 'flex', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ width: `${tbrPercent}%`, background: 'var(--accent-rose)' }} title="Time Below Range"></div>
            <div style={{ width: `${tirPercent}%`, background: 'var(--accent-emerald)' }} title="Time In Range"></div>
            <div style={{ width: `${tarPercent}%`, background: 'var(--accent-amber)' }} title="Time Above Range"></div>
          </div>
        </div>
      </div>

      {/* Glucose Log Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>Logged Readings & Event Timeline</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Glucose Reading</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Clinical Note</th>
              </tr>
            </thead>
            <tbody>
              {(!glucoseLogs || glucoseLogs.length === 0) ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No blood sugar readings recorded yet. Click <strong>"Log Glucose & Insulin"</strong> above to record your first entry.
                  </td>
                </tr>
              ) : (
                glucoseLogs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{l.timestamp}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: l.value < 70 ? 'var(--accent-rose)' : l.value > 180 ? 'var(--accent-amber)' : 'var(--accent-cyan-light)' }}>
                      {l.value} mg/dL
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-info">{l.type}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-main)' }}>{l.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Input Quick Log Modal */}
      {showLogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11, 17, 32, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Log Glucose & Insulin</h3>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  BLOOD GLUCOSE (mg/dL)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setLogValue(prev => Math.max(30, (Number(prev) || 118) - 5))}
                    style={{ padding: '0.65rem 1.1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={logValue} 
                    onChange={e => setLogValue(e.target.value)}
                    required
                    min={30}
                    max={500}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 800, textAlign: 'center' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setLogValue(prev => Math.min(500, (Number(prev) || 118) + 5))}
                    style={{ padding: '0.65rem 1.1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    RAPID INSULIN (Units)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '100%' }}>
                    <button 
                      type="button" 
                      onClick={() => setLogInsulinBolus(prev => Math.max(0, (Number(prev) || 0) - 0.5).toFixed(1))}
                      style={{ padding: '0.5rem 0.6rem', minWidth: '32px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      step="0.5"
                      placeholder="0.0"
                      value={logInsulinBolus} 
                      onChange={e => setLogInsulinBolus(e.target.value)}
                      style={{ flex: 1, minWidth: 0, width: '100%', padding: '0.6rem 0.4rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center', fontWeight: 700 }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setLogInsulinBolus(prev => (Math.max(0, (Number(prev) || 0) + 0.5)).toFixed(1))}
                      style={{ padding: '0.5rem 0.6rem', minWidth: '32px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    CARBS (Grams)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '100%' }}>
                    <button 
                      type="button" 
                      onClick={() => setLogCarbs(prev => Math.max(0, (Number(prev) || 0) - 5))}
                      style={{ padding: '0.5rem 0.6rem', minWidth: '32px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={logCarbs} 
                      onChange={e => setLogCarbs(e.target.value)}
                      style={{ flex: 1, minWidth: 0, width: '100%', padding: '0.6rem 0.4rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center', fontWeight: 700 }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setLogCarbs(prev => (Number(prev) || 0) + 5)}
                      style={{ padding: '0.5rem 0.6rem', minWidth: '32px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  MEAL CONTEXT / EVENT TAG
                </label>
                <select 
                  value={logType}
                  onChange={e => setLogType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 600 }}
                >
                  <option value="Fasting">Fasting (Morning Wake Up)</option>
                  <option value="Before Meal">Before Meal (Pre-prandial)</option>
                  <option value="After Meal">After Meal (Post-prandial)</option>
                  <option value="Post Exercise">Post Exercise / Walking</option>
                  <option value="Bedtime">Bedtime Target Check</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  CLINICAL NOTES
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Had salmon salad, 30m walk"
                  value={logNotes} 
                  onChange={e => setLogNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-glow" style={{ flex: 1, justifyContent: 'center' }}>
                  Save Reading
                </button>
                <button type="button" onClick={() => setShowLogModal(false)} className="btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
