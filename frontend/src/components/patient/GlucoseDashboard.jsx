import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine 
} from 'recharts';
import { 
  Activity, PlusCircle, Syringe, Utensils, Award, X, Sparkles, Brain, FileSpreadsheet, Camera
} from 'lucide-react';

export const GlucoseDashboard = () => {
  const { 
    currentGlucose, cgmTrendArrow, rateOfChange, lastCgmSync,
    iobUnits, cobGrams, glucoseLogs, addGlucoseLog, currentUser, setActiveTab 
  } = useApp();

  const [timeframe, setTimeframe] = useState('24h');
  const [showLogModal, setShowLogModal] = useState(false);

  // Form Fields
  const [logValue, setLogValue] = useState(currentGlucose || 118);
  const [logInsulinBolus, setLogInsulinBolus] = useState('');
  const [logInsulinBasal, setLogInsulinBasal] = useState('');
  const [logCarbs, setLogCarbs] = useState('');
  const [logType, setLogType] = useState('Fasting');
  const [logNotes, setLogNotes] = useState('');

  const hasLogs = glucoseLogs && glucoseLogs.length > 0;

  // 24-Hour CGM Stream Data Points
  const cgm24hData = hasLogs
    ? glucoseLogs.map((l, idx) => ({
        time: l.timestamp || `Log #${glucoseLogs.length - idx}`,
        bg: l.value,
        targetLow: 70,
        targetHigh: 180
      })).reverse()
    : [];

  // Metrics
  const allValues = cgm24hData.map(d => d.bg);
  const inRangeCount = allValues.filter(v => v >= 70 && v <= 180).length;
  const aboveRangeCount = allValues.filter(v => v > 180).length;
  const belowRangeCount = allValues.filter(v => v < 70).length;

  const tirPercent = allValues.length > 0 ? Math.round((inRangeCount / allValues.length) * 100) : 0;
  const tarPercent = allValues.length > 0 ? Math.round((aboveRangeCount / allValues.length) * 100) : 0;
  const tbrPercent = allValues.length > 0 ? Math.round((belowRangeCount / allValues.length) * 100) : 0;

  const meanGlucose = allValues.length > 0 ? Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length) : 0;
  const gmiValue = meanGlucose > 0 ? (3.31 + 0.02392 * meanGlucose).toFixed(1) : '--';

  const latestGlucose = hasLogs ? (glucoseLogs[0]?.value || currentGlucose) : '--';
  const displayTrendArrow = hasLogs ? cgmTrendArrow : '';
  const displayRateOfChange = hasLogs ? rateOfChange : 'Awaiting First Entry';

  const getGlucoseStatusText = (val) => {
    if (val === '--') return 'No reading recorded yet';
    if (val < 70) return 'Low (Hypoglycemia) — Action Required';
    if (val > 180) return 'High (Hyperglycemia) — Monitor Closely';
    return 'Normal Target Range (70–180 mg/dL)';
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner & Main Live Reading */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span className="pulse-indicator"></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                BLOOD GLUCOSE MONITORING
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: latestGlucose === '--' ? 'var(--text-main)' : latestGlucose < 70 ? 'var(--accent-rose)' : latestGlucose > 180 ? 'var(--accent-amber)' : 'var(--primary-color)' }}>
                {latestGlucose}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                mg/dL {displayTrendArrow}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ({displayRateOfChange})
              </span>
            </div>
            
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge ${latestGlucose < 70 ? 'badge-danger' : latestGlucose > 180 ? 'badge-warning' : 'badge-success'}`}>
                {getGlucoseStatusText(latestGlucose)}
              </span>
              <span>• {lastCgmSync}</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div>
            <button onClick={handleOpenModal} className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
              <PlusCircle size={17} />
              <span>+ Log Blood Sugar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Metrics Cards with Plain English Tooltips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Syringe size={16} color="var(--primary-color)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>INSULIN ON BOARD (IOB)</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{iobUnits} Units</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Active insulin remaining from recent doses
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-amber)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Utensils size={16} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>CARBS ON BOARD (COB)</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{cobGrams} g</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Carbohydrates currently being digested
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Award size={16} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TIME IN RANGE (TIR)</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{tirPercent}%</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Time blood sugar was within 70–180 mg/dL
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-purple)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Activity size={16} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ESTIMATED HbA1c (GMI)</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{gmiValue}%</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Estimated 3-month average glucose level
          </p>
        </div>

      </div>

      {/* Ambulatory Glucose Profile (AGP) Chart */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Blood Glucose Trend Chart (AGP)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visual trajectory of your recent readings over time</p>
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-primary)', padding: '0.2rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {['24h', '7d', '14d', '90d'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '0.35rem 0.65rem', borderRadius: '4px', border: 'none',
                  background: timeframe === tf ? 'var(--primary-color)' : 'transparent',
                  color: timeframe === tf ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer'
                }}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cgm24hData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cgmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis domain={[40, 240]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.82rem' }} 
              />
              <ReferenceLine y={180} label={{ value: 'High (180 mg/dL)', fill: '#d97706', fontSize: 11 }} stroke="#d97706" strokeDasharray="3 3" />
              <ReferenceLine y={70} label={{ value: 'Low (70 mg/dL)', fill: '#dc2626', fontSize: 11 }} stroke="#dc2626" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="bg" stroke="var(--primary-color)" strokeWidth={2} fillOpacity={1} fill="url(#cgmGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TIR Breakdown Bar */}
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--accent-rose)' }}>Low (&lt;70): {tbrPercent}%</span>
            <span style={{ color: 'var(--accent-emerald)' }}>In Target (70–180): {tirPercent}%</span>
            <span style={{ color: 'var(--accent-amber)' }}>High (&gt;180): {tarPercent}%</span>
          </div>

          <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--bg-primary)', display: 'flex', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ width: `${tbrPercent}%`, background: 'var(--accent-rose)' }}></div>
            <div style={{ width: `${tirPercent}%`, background: 'var(--accent-emerald)' }}></div>
            <div style={{ width: `${tarPercent}%`, background: 'var(--accent-amber)' }}></div>
          </div>
        </div>
      </div>

      {/* Glucose Log Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Blood Glucose Log History</h3>
          <button onClick={handleOpenModal} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <PlusCircle size={14} />
            <span>+ Add New Reading</span>
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Time Logged</th>
                <th>Glucose Reading</th>
                <th>Event Category</th>
                <th>Notes & Context</th>
              </tr>
            </thead>
            <tbody>
              {(!glucoseLogs || glucoseLogs.length === 0) ? (
                <tr>
                  <td colSpan="4" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No readings logged yet. Click <strong>"+ Add New Reading"</strong> to enter your first blood sugar check.
                  </td>
                </tr>
              ) : (
                glucoseLogs.map(l => (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{l.timestamp}</td>
                    <td style={{ fontWeight: 700, color: l.value < 70 ? 'var(--accent-rose)' : l.value > 180 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                      {l.value} mg/dL
                    </td>
                    <td>
                      <span className="badge badge-info">{l.type}</span>
                    </td>
                    <td style={{ color: 'var(--text-main)' }}>{l.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Input Quick Log Modal */}
      {showLogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '1.5rem', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Log Blood Glucose Reading</h3>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Blood Glucose Reading (mg/dL)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setLogValue(prev => Math.max(30, (Number(prev) || 118) - 5))}
                    style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}
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
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setLogValue(prev => Math.min(500, (Number(prev) || 118) + 5))}
                    style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                    Rapid Insulin (Units)
                  </label>
                  <input 
                    type="number" 
                    step="0.5"
                    placeholder="0.0"
                    value={logInsulinBolus} 
                    onChange={e => setLogInsulinBolus(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                    Carbs (Grams)
                  </label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={logCarbs} 
                    onChange={e => setLogCarbs(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Meal Event Category
                </label>
                <select 
                  value={logType}
                  onChange={e => setLogType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Fasting">Fasting (Morning Wake Up)</option>
                  <option value="Before Meal">Before Meal (Pre-prandial)</option>
                  <option value="After Meal">After Meal (Post-prandial)</option>
                  <option value="Post Exercise">Post Exercise / Walking</option>
                  <option value="Bedtime">Bedtime Target Check</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Notes (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Had lunch, 20m walk after"
                  value={logNotes} 
                  onChange={e => setLogNotes(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Save Log Entry
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
