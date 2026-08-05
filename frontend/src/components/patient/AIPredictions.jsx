import React from 'react';
import { useApp } from '../../context/AppContext';
import { ForecastTrajectoryCard } from './prediction/ForecastTrajectoryCard';
import { Brain, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

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

      {/* Forecast & Explainable AI Component */}
      <ForecastTrajectoryCard aiPrediction={aiPrediction} currentGlucose={currentGlucose} />

    </div>
  );
};
