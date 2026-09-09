import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, Activity, Mic, Utensils, RefreshCw, AlertTriangle, CheckCircle2, 
  TrendingUp, TrendingDown, Clock, Info, ShieldAlert, ArrowRight, BookOpen, Flame
} from 'lucide-react';
import { 
  simulateGlucoseDigitalTwin, 
  generateSmartGroceryRecipe 
} from '../../services/premiumAIService';
import { AIChatWidget } from '../common/AIChatWidget';

export const PremiumAIHub = () => {
  const { setToastAlert } = useApp();

  const [activeTab, setActiveTab] = useState('digital-twin'); // 'digital-twin' | 'voice-assistant' | 'grocery-planner'

  // DIGITAL TWIN FORM & RESULT STATE
  const [currentGlucose, setCurrentGlucose] = useState(120);
  const [carbsGrams, setCarbsGrams] = useState(60);
  const [insulinUnits, setInsulinUnits] = useState(4);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // SMART GROCERY FORM & RESULT STATE
  const [pantryIngredients, setPantryIngredients] = useState('eggs, spinach, tomatoes, olive oil, garlic');
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [recipeResult, setRecipeResult] = useState(null);

  // Digital Twin Simulation Handler
  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setIsSimulating(true);

    try {
      const result = await simulateGlucoseDigitalTwin(
        Number(currentGlucose),
        Number(carbsGrams),
        Number(insulinUnits)
      );
      setSimulationResult(result);

      if (setToastAlert) {
        setToastAlert({
          type: 'success',
          title: 'Digital Twin Simulation Complete',
          message: `4-Hour Trajectory calculated. Peak: ${result.peakGlucose} mg/dL.`
        });
      }
    } catch (err) {
      console.error('[Digital Twin Error]:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Smart Grocery Recipe Generator Handler
  const handleGenerateRecipe = async (e) => {
    e.preventDefault();
    setIsGeneratingRecipe(true);

    try {
      const result = await generateSmartGroceryRecipe(pantryIngredients);
      setRecipeResult(result);

      if (setToastAlert) {
        setToastAlert({
          type: 'success',
          title: 'Smart Recipe Generated',
          message: `${result.recipeTitle} created using your pantry ingredients.`
        });
      }
    } catch (err) {
      console.error('[Grocery Recipe Error]:', err);
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  // SVG Chart Geometry Builder for 4-Hour Trajectory Line Graph
  const renderSVGTrajectoryChart = (curve) => {
    if (!Array.isArray(curve) || curve.length < 5) return null;

    const width = 600;
    const height = 200;
    const minVal = 50;
    const maxVal = 220;

    const points = curve.map((pt, i) => {
      const x = 50 + (i * 125);
      const y = height - 25 - (((pt.mgDl - minVal) / (maxVal - minVal)) * (height - 50));
      return { x, y, mgDl: pt.mgDl, hour: pt.hour, label: pt.label };
    });

    const pathD = points.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');

    // Target range Y coordinates (70 - 140 mg/dL)
    const targetMinY = height - 25 - (((70 - minVal) / (maxVal - minVal)) * (height - 50));
    const targetMaxY = height - 25 - (((140 - minVal) / (maxVal - minVal)) * (height - 50));

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        {/* Target Range Band (70 - 140 mg/dL) */}
        <rect
          x="40"
          y={targetMaxY}
          width="520"
          height={targetMinY - targetMaxY}
          fill="rgba(22, 163, 74, 0.08)"
          stroke="rgba(22, 163, 74, 0.25)"
          strokeDasharray="4 4"
        />
        <text x="45" y={targetMaxY + 14} fill="#16a34a" fontSize="10" fontWeight="800">
          Target Window (70 - 140 mg/dL)
        </text>

        {/* Path Line */}
        <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data Points */}
        {points.map((pt, idx) => {
          const isHigh = pt.mgDl > 140;
          const isLow = pt.mgDl < 70;
          const dotColor = isHigh ? '#dc2626' : isLow ? '#d97706' : '#16a34a';

          return (
            <g key={idx}>
              <circle cx={pt.x} cy={pt.y} r="6" fill={dotColor} stroke="#ffffff" strokeWidth="2.5" />
              <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">
                {pt.mgDl}
              </text>
              <text x={pt.x} y={height - 5} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
                {pt.hour}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1020px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.2rem' }}>
          <Sparkles size={26} color="#0284c7" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Future Premium AI Features & Innovation Hub
          </h1>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          Next-generation precision endocrinology: AI Digital Twin 4-Hour Simulation, Voice-to-Voice Assistant, and Smart Grocery Recipe Planner.
        </p>
      </div>

      {/* FEATURE TAB SWITCHER */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem' }}>
        {[
          { id: 'digital-twin', label: '🧬 AI Digital Twin Simulator', icon: Activity },
          { id: 'voice-assistant', label: '🎙️ Voice-to-Voice Assistant', icon: Mic },
          { id: 'grocery-planner', label: '🍳 AI Smart Grocery Planner', icon: Utensils }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.65rem 1.1rem',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                background: isActive ? '#0284c7' : 'transparent',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI DIGITAL TWIN SIMULATOR */}
      {activeTab === 'digital-twin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Inputs Panel */}
          <div className="glass-panel" style={{ padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.2rem 0' }}>
              Simulate 4-Hour Postprandial Glucose Curve
            </h3>

            <form onSubmit={handleRunSimulation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem', alignItems: 'end' }}>
              
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Current Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  max="400"
                  value={currentGlucose}
                  onChange={e => setCurrentGlucose(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Planned Carbohydrates (Grams)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="200"
                  value={carbsGrams}
                  onChange={e => setCarbsGrams(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Rapid-Acting Insulin (Units)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="50"
                  value={insulinUnits}
                  onChange={e => setInsulinUnits(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="btn-primary"
                style={{ padding: '0.75rem', fontSize: '0.88rem', fontWeight: 800, background: '#0284c7', border: 'none', borderRadius: '10px', justifyContent: 'center' }}
              >
                {isSimulating ? 'Simulating Trajectory...' : 'Run Digital Twin Simulation'}
              </button>

            </form>
          </div>

          {/* SIMULATION RESULT VISUALIZATION */}
          {simulationResult && (
            <div className="glass-panel" style={{ padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #bae6fd', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0369a1', margin: 0 }}>
                    Projected 4-Hour Glucose Curve
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
                    Gemini AI Pharmacokinetic Simulation Model
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                    Peak: {simulationResult.peakGlucose} mg/dL
                  </span>
                  <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                    Hypo Risk: {simulationResult.hypoRisk}
                  </span>
                </div>
              </div>

              {/* SVG Line Graph */}
              <div style={{ background: '#f8fafc', padding: '1.25rem 1rem 0.5rem 1rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                {renderSVGTrajectoryChart(simulationResult.predictedCurve)}
              </div>

              {/* Clinical Summary Banner */}
              <div style={{ background: '#f0f9ff', padding: '1rem 1.1rem', borderRadius: '12px', border: '1px solid #bae6fd', fontSize: '0.86rem', color: '#0f172a', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Info size={16} />
                  <span>Clinical Simulation Insights</span>
                </div>
                <p style={{ margin: '0 0 0.35rem 0' }}>{simulationResult.summaryNote}</p>
                <div style={{ fontWeight: 700, color: '#0369a1', fontStyle: 'italic', fontSize: '0.82rem' }}>
                  "{simulationResult.clinicalRecommendation}"
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: VOICE-TO-VOICE ASSISTANT */}
      {activeTab === 'voice-assistant' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '680px' }}>
            <AIChatWidget isEmbedded={true} />
          </div>
        </div>
      )}

      {/* TAB 3: AI SMART GROCERY PLANNER */}
      {activeTab === 'grocery-planner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              AI Pantry & Smart Grocery Recipe Planner
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Enter what ingredients you currently have at home. Gemini AI will craft a personalized low-glycemic meal recipe.
            </p>

            <form onSubmit={handleGenerateRecipe} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Available Pantry Ingredients at Home
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. eggs, spinach, tomatoes, olive oil, dhal, garlic, chicken"
                  value={pantryIngredients}
                  onChange={e => setPantryIngredients(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', fontSize: '0.9rem', border: '1px solid #cbd5e1', borderRadius: '10px', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingRecipe}
                className="btn-primary"
                style={{ padding: '0.75rem 1.35rem', fontSize: '0.88rem', fontWeight: 800, background: '#0284c7', border: 'none', borderRadius: '10px', alignSelf: 'flex-start' }}
              >
                {isGeneratingRecipe ? 'Generating Low-GI Recipe...' : 'Generate Diabetic Recipe'}
              </button>
            </form>
          </div>

          {/* GENERATED RECIPE CARD */}
          {recipeResult && (
            <div className="glass-panel" style={{ padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', margin: 0 }}>
                    {recipeResult.recipeTitle}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                    Glycemic Index: {recipeResult.glycemicIndex} • Prep Time: {recipeResult.prepTimeMinutes} Mins
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.55rem' }}>
                  <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {recipeResult.nutritionPerServing?.calories || 240} kcal
                  </span>
                  <span style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {recipeResult.nutritionPerServing?.carbs || 8}g Carbs
                  </span>
                </div>
              </div>

              {/* Ingredients List */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.5rem 0' }}>
                  Ingredients Used
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {recipeResult.ingredientsList?.map((ing, iIdx) => (
                    <span key={iIdx} style={{ background: '#f1f5f9', color: '#334155', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.55rem 0' }}>
                  Cooking Instructions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {recipeResult.instructions?.map((step, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.86rem', color: '#0f172a', lineHeight: 1.45 }}>
                      <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Tip Banner */}
              {recipeResult.clinicalTip && (
                <div style={{ background: '#f0fdf4', padding: '0.95rem 1.1rem', borderRadius: '12px', border: '1px solid #86efac', fontSize: '0.84rem', color: '#14532d', fontStyle: 'italic' }}>
                  💡 <strong>Clinical Nutrition Tip:</strong> "{recipeResult.clinicalTip}"
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};
