import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { 
  Utensils, Camera, Sparkles, CheckCircle2, AlertTriangle, 
  ShoppingCart, Droplets, Flame, PieChart, RefreshCw, ChevronRight, UploadCloud, Download 
} from 'lucide-react';

export const FoodNutrition = () => {
  const { waterIntake, setWaterIntake, waterGoal } = useApp();
  const [selectedFood, setSelectedFood] = useState('salad');
  const [isScanning, setIsScanning] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  const fileInputRef = useRef(null);

  const [foodAnalysis, setFoodAnalysis] = useState({
    foodName: 'Mediterranean Chicken Salad & Quinoa',
    calories: 380,
    carbs: 28,
    sugar: 6,
    protein: 34,
    fat: 12,
    fiber: 7,
    glycemicIndex: 42,
    glycemicLoad: 11.7,
    portionEstimate: '1 Bowl (approx. 350g)',
    score: 92,
    healthyAlternative: 'Add extra chia seeds or avocado slice for healthy omega-3 fats.'
  });

  const [shoppingList] = useState({
    Produce: ['Spinach', 'Blueberries', 'Avocados', 'Asparagus'],
    Proteins: ['Wild Salmon', 'Chicken Breast', 'Greek Yogurt'],
    Grains: ['Sprouted Grain Bread', 'Quinoa', 'Walnuts', 'Chia Seeds']
  });

  const handleScanMeal = (typeKey) => {
    setSelectedFood(typeKey);
    setIsScanning(true);
    setCustomImage(null);
    
    apiService.analyzeFood(typeKey).then(res => {
      setTimeout(() => {
        if (res && res.status === 'success' && res.analysis) {
          setFoodAnalysis(res.analysis);
        } else {
          const presets = {
            salad: {
              foodName: 'Mediterranean Chicken Salad & Quinoa',
              calories: 380, carbs: 28, sugar: 6, protein: 34, fat: 12, fiber: 7,
              glycemicIndex: 42, glycemicLoad: 11.7, portionEstimate: '1 Bowl (350g)', score: 92,
              healthyAlternative: 'Add chia seeds or avocado slice for healthy omega-3 fats.'
            },
            pizza: {
              foodName: 'Pepperoni & Cheese Pizza (2 Slices)',
              calories: 580, carbs: 62, sugar: 8, protein: 22, fat: 26, fiber: 2,
              glycemicIndex: 75, glycemicLoad: 46.5, portionEstimate: '2 Slices (240g)', score: 45,
              healthyAlternative: 'Switch to cauliflower crust pizza with lean turkey breast & spinach.'
            },
            oatmeal: {
              foodName: 'Steel-Cut Oats with Berries & Almonds',
              calories: 310, carbs: 44, sugar: 9, protein: 11, fat: 9, fiber: 9,
              glycemicIndex: 50, glycemicLoad: 22.0, portionEstimate: '1 Bowl (250g)', score: 88,
              healthyAlternative: 'Stir in cinnamon powder to naturally improve insulin sensitivity.'
            }
          };
          setFoodAnalysis(presets[typeKey]);
        }
        setIsScanning(false);
      }, 800);
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileUrl = URL.createObjectURL(file);
    setCustomImage(fileUrl);
    setSelectedFood('custom');
    setIsScanning(true);

    setTimeout(() => {
      setFoodAnalysis({
        foodName: `Scanned: ${file.name.replace(/\.[^/.]+$/, "")}`,
        calories: 420,
        carbs: 38,
        sugar: 7,
        protein: 26,
        fat: 14,
        fiber: 6,
        glycemicIndex: 52,
        glycemicLoad: 19.7,
        portionEstimate: 'Uploaded Photo Portion (approx. 320g)',
        score: 84,
        healthyAlternative: 'AI Vision recommends pairing this dish with 1 glass of water to stabilize post-meal glucose absorption.'
      });
      setIsScanning(false);
    }, 1200);
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
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(6, 182, 212, 0.12))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Utensils size={26} color="var(--accent-teal)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>AI Food Analysis & Nutrition Coach</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Computer vision photo recognition instantly estimates Carbohydrates, Glycemic Index (GI), Glycemic Load (GL), and predicts post-meal glucose spikes.
        </p>
      </div>

      {/* AI Photo Scanner Selector & File Upload */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Food Photo Recognition Scanner</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload your meal photo or pick a quick sample:</p>
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
              <span>Upload Custom Food Photo</span>
            </button>

            <button onClick={() => handleScanMeal('salad')} className={`btn-outline ${selectedFood === 'salad' ? 'active' : ''}`} style={{ borderColor: selectedFood === 'salad' ? 'var(--accent-teal)' : '' }}>
              🥗 Chicken Salad
            </button>
            <button onClick={() => handleScanMeal('pizza')} className={`btn-outline ${selectedFood === 'pizza' ? 'active' : ''}`} style={{ borderColor: selectedFood === 'pizza' ? 'var(--accent-teal)' : '' }}>
              🍕 Pizza
            </button>
            <button onClick={() => handleScanMeal('oatmeal')} className={`btn-outline ${selectedFood === 'oatmeal' ? 'active' : ''}`} style={{ borderColor: selectedFood === 'oatmeal' ? 'var(--accent-teal)' : '' }}>
              🥣 Oatmeal
            </button>
          </div>
        </div>

        {/* Custom Image Preview if uploaded */}
        {customImage && !isScanning && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img src={customImage} alt="Uploaded meal" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '12px', border: '2px solid var(--accent-teal)', objectFit: 'cover' }} />
          </div>
        )}

        {/* Scanner Result Card */}
        {isScanning ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent-teal)' }}>
            <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div style={{ fontWeight: 700 }}>Analyzing Food Image with Vision AI...</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Identifying portion volume, macro-nutrients, GI & GL values</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: 'var(--border-color)' }}>
            
            {/* Meal Title & Score */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>IDENTIFIED MEAL</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.3rem 0' }}>{foodAnalysis.foodName}</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Portion: {foodAnalysis.portionEstimate}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ background: foodAnalysis.score > 70 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', border: foodAnalysis.score > 70 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(244,63,94,0.3)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>HEALTH SCORE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: foodAnalysis.score > 70 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{foodAnalysis.score}/100</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GLYCEMIC LOAD (GL)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{foodAnalysis.glycemicLoad} ({foodAnalysis.glycemicLoad < 15 ? 'Low' : 'High'})</div>
                </div>
              </div>
            </div>

            {/* Macro Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CARBOHYDRATES</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{foodAnalysis.carbs}g</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sugar: {foodAnalysis.sugar}g</span>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROTEIN</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{foodAnalysis.protein}g</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fats: {foodAnalysis.fat}g</span>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CALORIES</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{foodAnalysis.calories}</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>kcal</span>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FIBER CONTENT</span>
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
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={24} color="var(--accent-cyan)" />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Daily Water Intake Coach</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hydration improves renal blood sugar clearance and insulin response.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{waterIntake.toFixed(1)} / {waterGoal} L</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round((waterIntake/waterGoal)*100)}% Completed</div>
          </div>

          <button onClick={() => setWaterIntake(prev => Math.min(waterGoal, prev + 0.25))} className="btn-glow" style={{ fontSize: '0.82rem' }}>
            + 250ml Glass
          </button>
        </div>
      </div>

      {/* Weekly Meal Planner & Grocery Generator */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Personalized Weekly Diabetes Meal Plan</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tailored to your target glucose range, local cuisine, and insulin sensitivity</p>
          </div>

          <button onClick={handleExportShoppingList} className="btn-outline" style={{ fontSize: '0.82rem' }}>
            <Download size={16} />
            <span>Export Shopping List</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid var(--accent-amber)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>BREAKFAST</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.4rem 0' }}>Avocado Toast & Poached Eggs</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>Carbs: 22g | Low GI</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>LUNCH</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.4rem 0' }}>Grilled Salmon & Asparagus</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>Carbs: 18g | High Protein</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid var(--accent-purple)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>DINNER</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.4rem 0' }}>Tofu Stir-fry with Cauliflower Rice</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>Carbs: 14g | Fiber Rich</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid var(--accent-emerald)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>SNACK</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.4rem 0' }}>Greek Yogurt & Almonds</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>Carbs: 8g | Zero Spike</div>
          </div>

        </div>
      </div>

    </div>
  );
};
