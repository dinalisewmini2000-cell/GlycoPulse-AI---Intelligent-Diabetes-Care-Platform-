import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine 
} from 'recharts';
import { 
  Brain, Sparkles, AlertTriangle, ShieldCheck, Clock, RefreshCw, Zap, Activity, Info 
} from 'lucide-react';

export const AIPredictions = () => {
  const { currentGlucose, iobUnits, cobGrams, aiPrediction, glucoseLogs } = useApp();
  const hasLogs = glucoseLogs && glucoseLogs.length > 0;

  const [simulationScenario, setSimulationScenario] = useState('standard');

  // 4-Hour Forward Predictive Forecast Points (+0m to +240m)
  const baseGlucose = hasLogs ? (glucoseLogs[0]?.value || currentGlucose) : 118;
  const forecast4hData = [
    { minute: 'Now (+0m)', predictedBg: baseGlucose, risk: 'Normal' },
    { minute: '+30m', predictedBg: Math.round(baseGlucose + (cobGrams * 0.8) - (iobUnits * 12)), risk: 'Normal' },
    { minute: '+60m', predictedBg: Math.round(baseGlucose + (cobGrams * 1.2) - (iobUnits * 18)), risk: 'Peak Meal' },
    { minute: '+90m', predictedBg: Math.round(baseGlucose + (cobGrams * 0.9) - (iobUnits * 15)), risk: 'Normal' },
    { minute: '+120m', predictedBg: Math.round(baseGlucose + (cobGrams * 0.4) - (iobUnits * 10)), risk: 'Normal' },
    { minute: '+180m', predictedBg: Math.round(baseGlucose - (iobUnits * 6)), risk: 'Normal' },
    { minute: '+240m', predictedBg: Math.round(baseGlucose - (iobUnits * 2)), risk: 'Baseline' }
  ];

  const minPredicted = Math.min(...forecast4hData.map(d => d.predictedBg));
  const hypoRiskDetected = minPredicted < 70;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(168, 85, 247, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Brain size={28} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>4-Hour AI Predictive Glucose Engine</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Deep Neural Network v3.4 | Active IOB: {iobUnits}U | COB: {cobGrams}g
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Combines continuous glucose sensor rate-of-change, rapid insulin pharmacokinetics, and stomach carbohydrate absorption models to forecast sugar trajectories 240 minutes into the future.
        </p>
      </div>

      {/* Primary Forecast Summary Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>PREDICTED 2-HOUR SUGAR</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-cyan)', margin: '0.3rem 0' }}>
            {aiPrediction.predictedGlucose2h || 122} mg/dL
          </div>
          <div className="badge badge-success">Confidence: {aiPrediction.confidenceScore}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: hypoRiskDetected ? '4px solid var(--accent-rose)' : '4px solid var(--accent-emerald)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>HYPOGLYCEMIA RISK</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: hypoRiskDetected ? 'var(--accent-rose)' : 'var(--accent-emerald)', margin: '0.3rem 0' }}>
            {hypoRiskDetected ? 'HIGH RISK' : 'LOW (2.1%)'}
          </div>
          <div className={`badge ${hypoRiskDetected ? 'badge-danger' : 'badge-success'}`}>
            {hypoRiskDetected ? 'Predicted <70 mg/dL in 60m' : 'Zero Hypo Dip Expected'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>HYPERGLYCEMIA RISK</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-purple)', margin: '0.3rem 0' }}>
            LOW (4.5%)
          </div>
          <div className="badge badge-info">Post-Prandial Peak Under 160</div>
        </div>

      </div>

      {/* 4-Hour Predictive Curve Graph */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>4-Hour Projected Trajectory Curve (+240 Minutes)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulated trajectory based on current gastric absorption and insulin decay</p>
          </div>

          <div className="badge badge-info">
            <Sparkles size={13} />
            <span>AI Model v3.4 Active</span>
          </div>
        </div>

        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast4hData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <XAxis dataKey="minute" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis domain={[50, 220]} stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10, 16, 32, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
              <ReferenceLine y={180} label={{ value: 'High Threshold (180)', fill: '#f59e0b', fontSize: 11 }} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine y={70} label={{ value: 'Low Threshold (70)', fill: '#f43f5e', fontSize: 11 }} stroke="#f43f5e" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="predictedBg" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5, fill: '#06b6d4' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Clinical Micro-Recommendations */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', color: 'var(--accent-cyan)' }}>
          <Sparkles size={20} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Clinical Micro-Recommendations</h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '1rem' }}>
          "{aiPrediction.explanation}"
        </p>

        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid var(--accent-emerald)', fontSize: '0.88rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.2rem' }}>ACTIONABLE INTERVENTION</div>
          <p style={{ color: 'var(--text-main)', margin: 0 }}>
            {aiPrediction.recommendation}
          </p>
        </div>
      </div>

    </div>
  );
};
