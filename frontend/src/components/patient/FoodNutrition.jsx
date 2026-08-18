import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { analyzeFoodImage } from '../../services/foodVisionService';
import { 
  Utensils, Camera, Sparkles, CheckCircle2, AlertTriangle, 
  ShoppingCart, Droplets, Flame, PieChart, RefreshCw, ChevronRight, UploadCloud, Download, AlertCircle, RotateCcw 
} from 'lucide-react';

export const FoodNutrition = () => {
  const appData = useApp();
  const waterIntake = appData?.waterIntake ?? 0.0;
  const setWaterIntake = appData?.setWaterIntake || (() => {});
  const waterGoal = appData?.waterGoal ?? 2.5;

  const [selectedFood, setSelectedFood] = useState('salad');
  const [isScanning, setIsScanning] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  const fileInputRef = useRef(null);

  const [foodAnalysis, setFoodAnalysis] = useState(null);

  const handleResetFoodScan = () => {
    setCustomImage(null);
    setFoodAnalysis(null);
    setSelectedFood('salad');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [shoppingList] = useState({
    Produce: ['Spinach', 'Blueberries', 'Avocados', 'Asparagus'],
    Proteins: ['Wild Salmon', 'Chicken Breast', 'Greek Yogurt'],
    Grains: ['Sprouted Grain Bread', 'Quinoa', 'Walnuts', 'Chia Seeds']
  });

  const handleScanMeal = async (typeKey) => {
    setSelectedFood(typeKey);
    setIsScanning(true);
    setCustomImage(null);
    
    try {
      const result = await analyzeFoodImage(null, typeKey);
      setFoodAnalysis(result);
    } catch (err) {
      console.error('Food scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileUrl = URL.createObjectURL(file);
    setCustomImage(fileUrl);
    setSelectedFood('custom');
    setIsScanning(true);

    try {
      const result = await analyzeFoodImage(file);
      setFoodAnalysis(result);
    } catch (err) {
      console.error('Food upload error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportShoppingList = () => {
    const lines = [
      "==============================================",
      " GLYCOPULSE AI - PERSONALIZED SHOPPING LIST",
      " Date: " + new Date().toLocaleDateString(),
      "==============================================",
      "",
      "PRODUCE:",
      ...shoppingList.Produce.map(item => " [ ] " + item),
      "",
      "PROTEINS:",
      ...shoppingList.Proteins.map(item => " [ ] " + item),
      "",
      "GRAINS & NUTS:",
      ...shoppingList.Grains.map(item => " [ ] " + item),
      "",
      "==============================================",
      " Recommended for low glycemic impact & peak TIR."
    ].join("\n");

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GlycoPulse_Diabetes_Shopping_List.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
          <Utensils size={24} color="var(--accent-teal)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>AI Food Analysis & Nutrition Coach</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Computer vision photo recognition instantly estimates Carbohydrates, Glycemic Index (GI), Glycemic Load (GL), and predicts post-meal glucose spikes.
        </p>
      </div>

      {/* AI Photo Scanner Selector & File Upload */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>AI Food Recognition Scanner</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload your meal photo or select a sample meal:</p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            <button onClick={() => fileInputRef.current?.click()} className="btn-glow" style={{ fontSize: '0.82rem' }}>
              <UploadCloud size={16} />
              <span>Upload Meal Photo</span>
            </button>

            {(customImage || foodAnalysis) && (
              <button onClick={handleResetFoodScan} className="btn-outline" style={{ fontSize: '0.82rem' }}>
                <RotateCcw size={16} />
                <span>Reset Scan</span>
              </button>
            )}

            <button onClick={() => handleScanMeal('salad')} className="btn-outline" style={{ borderColor: selectedFood === 'salad' ? 'var(--accent-teal)' : '' }}>
              🥗 Chicken Salad
            </button>
            <button onClick={() => handleScanMeal('pizza')} className="btn-outline" style={{ borderColor: selectedFood === 'pizza' ? 'var(--accent-teal)' : '' }}>
              🍕 Pizza
            </button>
            <button onClick={() => handleScanMeal('oatmeal')} className="btn-outline" style={{ borderColor: selectedFood === 'oatmeal' ? 'var(--accent-teal)' : '' }}>
              🥣 Oatmeal
            </button>
          </div>
        </div>

        {/* Custom Image Preview if uploaded */}
        {customImage && (
          <div style={{ marginBottom: '1rem', textAlign: 'center', position: 'relative' }}>
            <img src={customImage} alt="Uploaded meal scan" style={{ maxWidth: '220px', maxHeight: '160px', borderRadius: '12px', border: '2px solid var(--accent-teal)', objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => fileInputRef.current?.click()} className="btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}>
                <RotateCcw size={14} />
                <span>Change Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Scanner Result Card */}
        {isScanning ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent-teal)' }}>
            <RefreshCw size={36} className="spin-slow" style={{ margin: '0 auto 1rem auto' }} />
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>Analyzing Meal with AI...</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Calculating portion volume, glycemic load, and carbohydrate impact...</p>
          </div>
        ) : !foodAnalysis ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <Utensils size={36} color="var(--accent-teal)" style={{ margin: '0 auto 0.8rem auto', opacity: 0.8 }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--text-main)' }}>No Meal Scanned Yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
              Upload a meal photo or select a sample meal to estimate carbohydrates, glycemic load, and glucose impact.
            </p>
          </div>
        ) : foodAnalysis.isFood === false ? (
          <div style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(244, 63, 94, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-rose)' }}>
                <AlertCircle size={22} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  {foodAnalysis.statusText || 'No Food Detected'}
                </h4>
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="btn-glow" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                <RotateCcw size={14} />
                <span>Upload New Photo</span>
              </button>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: 0 }}>
              {foodAnalysis.subText || 'The uploaded image appears to be a mobile screenshot, document, or non-food image.'}
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
              💡 <strong>Instruction:</strong> {foodAnalysis.recommendation || 'Please upload a clear photograph of a real meal or food item to perform food nutrition recognition.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            
            {/* Meal Title & Score */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>IDENTIFIED MEAL</span>
                <button onClick={handleResetFoodScan} className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                  <RotateCcw size={13} />
                  <span>Scan Different Meal</span>
                </button>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.3rem 0', color: 'var(--text-main)' }}>{foodAnalysis.foodName}</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Portion: {foodAnalysis.portionEstimate}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>HEALTH SCORE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: foodAnalysis.score > 70 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{foodAnalysis.score}/100</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>GLYCEMIC LOAD (GL)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{foodAnalysis.glycemicLoad} ({foodAnalysis.glycemicLoad < 15 ? 'Low' : 'High'})</div>
                </div>
              </div>
            </div>

            {/* Macro Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>CARBOHYDRATES</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{foodAnalysis.carbs}g</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sugar: {foodAnalysis.sugar}g</span>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PROTEIN</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{foodAnalysis.protein}g</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fats: {foodAnalysis.fat}g</span>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>CALORIES</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{foodAnalysis.calories}</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>kcal</span>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>FIBER CONTENT</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{foodAnalysis.fiber}g</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GI: {foodAnalysis.glycemicIndex}</span>
              </div>
            </div>

            {/* AI Recommendation */}
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', marginTop: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-teal)', fontWeight: 700, fontSize: '0.85rem' }}>
                <Sparkles size={16} />
                <span>AI HEALTHY ALTERNATIVE SUGGESTION</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {foodAnalysis.healthyAlternative}
              </p>
            </div>

          </div>
        )}
      </div>

      {/* Water & Hydration Coach */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(2, 132, 199, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={22} color="var(--accent-cyan)" />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Daily Hydration Coach</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Proper hydration improves renal glucose clearance and insulin response.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{waterIntake.toFixed(1)} / {waterGoal} L</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round((waterIntake/waterGoal)*100)}% Goal</div>
          </div>

          <button onClick={() => setWaterIntake(prev => Math.min(waterGoal, prev + 0.25))} className="btn-glow" style={{ fontSize: '0.82rem' }}>
            + 250ml Glass
          </button>
        </div>
      </div>

      {/* Weekly Meal Planner */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Weekly Diabetes Meal Plan</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tailored to your target glucose range and glycemic goals</p>
          </div>

          <button onClick={handleExportShoppingList} className="btn-outline" style={{ fontSize: '0.82rem' }}>
            <Download size={16} />
            <span>Export Shopping List</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid var(--accent-amber)', border: '1px solid var(--border-color)', borderLeftWidth: '3px' }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>BREAKFAST</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-main)' }}>Avocado Toast & Poached Eggs</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Carbs: 22g | Low GI</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid var(--accent-cyan)', border: '1px solid var(--border-color)', borderLeftWidth: '3px' }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>LUNCH</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-main)' }}>Grilled Salmon & Asparagus</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Carbs: 18g | High Protein</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid var(--accent-purple)', border: '1px solid var(--border-color)', borderLeftWidth: '3px' }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>DINNER</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-main)' }}>Tofu Stir-fry with Cauliflower Rice</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Carbs: 14g | Fiber Rich</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid var(--accent-emerald)', border: '1px solid var(--border-color)', borderLeftWidth: '3px' }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700 }}>SNACK</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-main)' }}>Greek Yogurt & Almonds</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Carbs: 8g | Zero Spike</div>
          </div>

        </div>
      </div>

    </div>
  );
};
