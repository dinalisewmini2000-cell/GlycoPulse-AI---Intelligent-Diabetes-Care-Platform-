import React from 'react';
import { useApp } from '../../context/AppContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Brain, ShieldAlert, Sparkles, TrendingUp, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const AIPredictions = () => {
  const { aiPrediction, currentGlucose } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(6, 182, 212, 0.12))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Brain size={26} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>AI Glucose Prediction & Trend Detection Engine</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Powered by deep machine learning models analyzing carbohydrate absorption rates, active insulin decay curves, and physical activity telemetry.
        </p>
      </div>

      {/* Risk Meters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem' }}>
        
        {/* Hypo Risk */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>HYPOGLYCEMIA RISK (LOW BLOOD SUGAR)</span>
            <ShieldAlert size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.5rem 0' }}>
            {aiPrediction.hypoglycemiaRisk}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Probability of dropping below 70 mg/dL in next 2 hours is minimal (&lt; 5%).</p>
        </div>

        {/* Hyper Risk */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>HYPERGLYCEMIA RISK (HIGH BLOOD SUGAR)</span>
            <TrendingUp size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.5rem 0' }}>
            {aiPrediction.hyperglycemiaRisk}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Spike risk above 180 mg/dL is low based on active basal insulin profile.</p>
        </div>

        {/* AI Confidence */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>MODEL CONFIDENCE SCORE</span>
            <Sparkles size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0.5rem 0' }}>
            {aiPrediction.confidenceScore}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Calculated over 4,200 personal CGM telemetry data points.</p>
        </div>

      </div>

      {/* Forecast Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>Next 2-Hour Predicted Trajectory</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Forecasted glucose curve from current reading ({currentGlucose} mg/dL) to predicted 120-minute horizon.
        </p>

        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aiPrediction.hourlyForecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
              <YAxis domain={[60, 200]} stroke="var(--text-muted)" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-purple)', borderRadius: '8px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGlucose)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explainable AI & Recommended Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.2rem' }}>
        
        {/* Why glucose changed */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <HelpCircle size={20} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Why did your blood sugar change?</h4>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
            "{aiPrediction.explanation}"
          </p>
        </div>

        {/* AI Actionable Recommendations */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <CheckCircle2 size={20} color="var(--accent-emerald)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Recommended AI Actions</h4>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
            "{aiPrediction.recommendation}"
          </p>
        </div>

      </div>

    </div>
  );
};
