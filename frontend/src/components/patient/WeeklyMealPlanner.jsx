import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, Calendar, Utensils, ShoppingBag, RefreshCw, Repeat, 
  PlusCircle, Copy, Download, Check, CheckSquare, Square, Info, 
  AlertCircle, ChevronRight, Zap, Filter, CheckCircle2, FileText
} from 'lucide-react';
import { 
  generateWeeklyMealPlan, 
  getMealAlternatives, 
  aggregateShoppingList 
} from '../../services/weeklyMealPlannerService';

export const WeeklyMealPlanner = () => {
  const { addMealLog, setToastAlert } = useApp();

  // User Target Preferences
  const [targetCalories, setTargetCalories] = useState(1800);
  const [targetCarbs, setTargetCarbs] = useState(150);
  const [cuisine, setCuisine] = useState('Sri Lankan & South Asian');
  const [dietaryNotes, setDietaryNotes] = useState('Low GI focus, High Fiber, Heart-Healthy');

  // Meal Plan State
  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    const saved = localStorage.getItem('glycopulse_weekly_plan');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'focused'

  // Shopping List State
  const [shoppingList, setShoppingList] = useState([]);
  const [tickedItems, setTickedItems] = useState(() => {
    const saved = localStorage.getItem('glycopulse_shopping_ticked');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Meal Swapper Modal State
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapTarget, setSwapTarget] = useState(null); // { dayName, mealType, currentMeal }
  const [swapAlternatives, setSwapAlternatives] = useState([]);
  const [isFetchingSwap, setIsFetchingSwap] = useState(false);

  // Auto-generate initial plan if none exists
  useEffect(() => {
    if (!weeklyPlan) {
      handleGeneratePlan();
    }
  }, []);

  // Update Shopping List whenever weeklyPlan changes
  useEffect(() => {
    if (weeklyPlan) {
      const items = aggregateShoppingList(weeklyPlan);
      setShoppingList(items);
      localStorage.setItem('glycopulse_weekly_plan', JSON.stringify(weeklyPlan));
    }
  }, [weeklyPlan]);

  // Persist ticked shopping items
  useEffect(() => {
    localStorage.setItem('glycopulse_shopping_ticked', JSON.stringify(tickedItems));
  }, [tickedItems]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const plan = await generateWeeklyMealPlan({
        targetCalories: Number(targetCalories) || 1800,
        targetCarbs: Number(targetCarbs) || 150,
        cuisine,
        dietaryNotes
      });
      setWeeklyPlan(plan);
      if (setToastAlert) {
        setToastAlert({
          type: 'success',
          title: '7-Day Meal Plan Generated',
          message: `Personalized ${cuisine} diabetic weekly plan is ready.`
        });
      }
    } catch (err) {
      console.error('[Weekly Meal Planner Error]:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Open Swap Modal & Fetch Alternatives
  const handleOpenSwapModal = async (dayName, mealType, currentMeal) => {
    setSwapTarget({ dayName, mealType, currentMeal });
    setSwapModalOpen(true);
    setIsFetchingSwap(true);
    setSwapAlternatives([]);

    try {
      const alts = await getMealAlternatives(dayName, mealType, currentMeal, cuisine);
      setSwapAlternatives(alts);
    } catch (err) {
      console.error('[Swap Fetch Error]:', err);
    } finally {
      setIsFetchingSwap(false);
    }
  };

  // Apply Selected Meal Swap to 7-Day Plan
  const handleApplySwap = (newMeal) => {
    if (!swapTarget || !weeklyPlan) return;

    const { dayName, mealType } = swapTarget;
    const updatedDays = weeklyPlan.days.map((dayObj) => {
      if (dayObj.day.toLowerCase() === dayName.toLowerCase()) {
        const updatedMeals = {
          ...dayObj.meals,
          [mealType.toLowerCase()]: newMeal
        };

        // Recalculate Day Totals
        const totalCals = Object.values(updatedMeals).reduce((acc, m) => acc + (m?.calories || 0), 0);
        const totalCarbs = Object.values(updatedMeals).reduce((acc, m) => acc + (m?.carbs || 0), 0);

        return {
          ...dayObj,
          totalCalories: totalCals,
          totalCarbs: totalCarbs,
          meals: updatedMeals
        };
      }
      return dayObj;
    });

    setWeeklyPlan({
      ...weeklyPlan,
      days: updatedDays
    });

    setSwapModalOpen(false);
    setSwapTarget(null);

    if (setToastAlert) {
      setToastAlert({
        type: 'success',
        title: 'Meal Swapped',
        message: `${newMeal.name} replaced ${swapTarget.currentMeal.name} for ${dayName}.`
      });
    }
  };

  // Log a planned meal directly into daily food logs
  const handleQuickLogMeal = (mealType, meal) => {
    addMealLog({
      mealType: mealType.charAt(0).toUpperCase() + mealType.slice(1),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      food: meal.name,
      calories: `${meal.calories} kcal`,
      carbs: meal.carbs,
      protein: meal.protein,
      fat: meal.fat,
      notes: `Planned from Weekly AI Meal Plan (${meal.glycemicIndex || 'Low'} GI)`
    });
  };

  // Toggle Shopping List Checkbox
  const toggleItemTicked = (itemId) => {
    setTickedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Copy Shopping List to Clipboard
  const handleCopyShoppingList = () => {
    if (!shoppingList || shoppingList.length === 0) return;

    const categories = ['Vegetables & Greens', 'Proteins & Seafood', 'Whole Grains & Carbs', 'Dairy, Healthy Fats & Spices'];
    let text = `🛒 GlycoPulse AI - 7-Day Diabetic Shopping List\nGenerated: ${new Date().toLocaleDateString()}\n\n`;

    categories.forEach((cat) => {
      const items = shoppingList.filter(i => i.category === cat);
      if (items.length > 0) {
        text += `--- ${cat.toUpperCase()} ---\n`;
        items.forEach((item) => {
          const isDone = tickedItems[item.id] ? '[x]' : '[ ]';
          text += `${isDone} ${item.name}\n`;
        });
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);

    if (setToastAlert) {
      setToastAlert({
        type: 'success',
        title: 'Shopping List Copied',
        message: 'Formatted shopping list copied to clipboard!'
      });
    }
  };

  // Download Shopping List as .txt File
  const handleDownloadShoppingList = () => {
    if (!shoppingList || shoppingList.length === 0) return;

    const categories = ['Vegetables & Greens', 'Proteins & Seafood', 'Whole Grains & Carbs', 'Dairy, Healthy Fats & Spices'];
    let text = `====================================================\n`;
    text += `GlycoPulse AI - Personalized Diabetic Shopping List\n`;
    text += `Target: ${targetCalories} kcal / ${targetCarbs}g Carbs daily | Cuisine: ${cuisine}\n`;
    text += `====================================================\n\n`;

    categories.forEach((cat) => {
      const items = shoppingList.filter(i => i.category === cat);
      if (items.length > 0) {
        text += `[ ${cat.toUpperCase()} ]\n`;
        items.forEach((item) => {
          const isDone = tickedItems[item.id] ? '[✓]' : '[ ]';
          text += ` ${isDone} ${item.name}\n`;
        });
        text += `\n`;
      }
    });

    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `GlycoPulse_Shopping_List_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Stats calculation for Shopping List Progress
  const totalShoppingItems = shoppingList.length;
  const purchasedCount = shoppingList.filter(i => tickedItems[i.id]).length;
  const purchasePercent = totalShoppingItems > 0 ? Math.round((purchasedCount / totalShoppingItems) * 100) : 0;

  // Filtered Shopping Items
  const filteredShoppingList = activeCategoryFilter === 'All'
    ? shoppingList
    : shoppingList.filter(i => i.category === activeCategoryFilter);

  const activeDayObj = weeklyPlan?.days?.find(d => d.day.toLowerCase() === selectedDay.toLowerCase()) || weeklyPlan?.days?.[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. TOP AI GENERATOR CONTROL PANEL */}
      <div className="glass-panel" style={{ padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <Sparkles size={22} color="#0284c7" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Personalized Weekly AI Meal Planner
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
              Generates 7-day diabetic-tailored meal plans with low-GI foods, customizable targets, and smart ingredient shopping lists.
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="btn-primary"
            style={{
              padding: '0.75rem 1.4rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              border: 'none',
              borderRadius: '10px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            <RefreshCw size={18} className={isGenerating ? 'spin-icon' : ''} style={{ animation: isGenerating ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isGenerating ? 'Generating AI Plan...' : 'AI Generate Weekly Plan'}</span>
          </button>
        </div>

        {/* Input Parameters Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Daily Calorie Target
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.45rem 0.75rem' }}>
              <input
                type="number"
                value={targetCalories}
                onChange={e => setTargetCalories(e.target.value)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }}>kcal/day</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Daily Carbohydrate Target
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.45rem 0.75rem' }}>
              <input
                type="number"
                value={targetCarbs}
                onChange={e => setTargetCarbs(e.target.value)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }}>g/day</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cuisine & Food Culture
            </label>
            <select
              value={cuisine}
              onChange={e => setCuisine(e.target.value)}
              style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.45rem 0.75rem', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', outline: 'none' }}
            >
              <option value="Sri Lankan & South Asian">Sri Lankan & South Asian</option>
              <option value="Western & International">Western & International</option>
              <option value="Asian Fusion & East Asian">Asian Fusion & East Asian</option>
              <option value="Vegetarian Diabetic">Vegetarian Diabetic</option>
              <option value="Low Sodium & Heart Healthy">Low Sodium & Heart Healthy</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Dietary Notes / Focus
            </label>
            <input
              type="text"
              value={dietaryNotes}
              onChange={e => setDietaryNotes(e.target.value)}
              placeholder="e.g. High protein, Low GI, Mild spice"
              style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.45rem 0.75rem', fontSize: '0.88rem', fontWeight: 500, color: '#0f172a', outline: 'none' }}
            />
          </div>

        </div>

      </div>

      {/* 2. INTERACTIVE 7-DAY CALENDAR VIEW */}
      {weeklyPlan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Calendar Header & View Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#0284c7" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                Interactive 7-Day Meal Schedule
              </h3>
            </div>

            {/* View Mode Switcher: Grid vs Focused Day */}
            <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '0.2rem' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#0284c7' : 'transparent',
                  color: viewMode === 'grid' ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                7-Day Matrix Grid
              </button>
              <button
                onClick={() => setViewMode('focused')}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'focused' ? '#0284c7' : 'transparent',
                  color: viewMode === 'focused' ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                Day-by-Day Focus
              </button>
            </div>

          </div>

          {/* DAY SELECTOR TABS (Monday to Sunday) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const dayData = weeklyPlan.days?.find(d => d.day.toLowerCase() === day.toLowerCase());
              const isSelected = selectedDay.toLowerCase() === day.toLowerCase();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: '0.65rem 0.4rem',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    color: isSelected ? '#0284c7' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{day.substring(0, 3)}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? '#0369a1' : '#64748b' }}>
                    {dayData?.totalCalories || 1780} kcal
                  </span>
                  <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 800 }}>
                    {dayData?.totalCarbs || 145}g carbs
                  </span>
                </button>
              );
            })}
          </div>

          {/* VIEW MODE 1: DAY-BY-DAY FOCUSED VIEW */}
          {viewMode === 'focused' && activeDayObj && (
            <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              
              {/* Day Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {activeDayObj.day} Meal Plan
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Target: ~{weeklyPlan.targetCalories} kcal | ~{weeklyPlan.targetCarbs}g carbs
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.55rem' }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800 }}>
                    🔥 {activeDayObj.totalCalories} kcal
                  </span>
                  <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800 }}>
                    🌾 {activeDayObj.totalCarbs}g carbs
                  </span>
                </div>
              </div>

              {/* Meals List for Active Day */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {[
                  { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: '#fff7ed', border: '#ffedd5' },
                  { key: 'lunch', label: 'Lunch', icon: '☀️', color: '#f0f9ff', border: '#bae6fd' },
                  { key: 'dinner', label: 'Dinner', icon: '🌙', color: '#faf5ff', border: '#e9d5ff' },
                  { key: 'snack', label: 'Snack', icon: '🍏', color: '#f0fdf4', border: '#bbf7d0' }
                ].map((slot) => {
                  const meal = activeDayObj.meals?.[slot.key];
                  if (!meal) return null;

                  return (
                    <MealCard
                      key={slot.key}
                      slotLabel={slot.label}
                      slotIcon={slot.icon}
                      bgColor={slot.color}
                      borderColor={slot.border}
                      meal={meal}
                      onSwap={() => handleOpenSwapModal(activeDayObj.day, slot.label, meal)}
                      onQuickLog={() => handleQuickLogMeal(slot.label, meal)}
                    />
                  );
                })}
              </div>

            </div>
          )}

          {/* VIEW MODE 2: 7-DAY MATRIX GRID VIEW */}
          {viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {weeklyPlan.days?.map((dayObj) => (
                <div
                  key={dayObj.day}
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    background: selectedDay.toLowerCase() === dayObj.day.toLowerCase() ? '#ffffff' : '#fafafa',
                    borderRadius: '16px',
                    border: selectedDay.toLowerCase() === dayObj.day.toLowerCase() ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  {/* Day Title Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{dayObj.day}</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                      {dayObj.totalCalories} kcal | {dayObj.totalCarbs}g carbs
                    </div>
                  </div>

                  {/* 4 Meal Cards in Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: '#fff7ed', border: '#ffedd5' },
                      { key: 'lunch', label: 'Lunch', icon: '☀️', color: '#f0f9ff', border: '#bae6fd' },
                      { key: 'dinner', label: 'Dinner', icon: '🌙', color: '#faf5ff', border: '#e9d5ff' },
                      { key: 'snack', label: 'Snack', icon: '🍏', color: '#f0fdf4', border: '#bbf7d0' }
                    ].map((slot) => {
                      const meal = dayObj.meals?.[slot.key];
                      if (!meal) return null;

                      return (
                        <MealCardCompact
                          key={slot.key}
                          slotLabel={slot.label}
                          slotIcon={slot.icon}
                          bgColor={slot.color}
                          borderColor={slot.border}
                          meal={meal}
                          onSwap={() => handleOpenSwapModal(dayObj.day, slot.label, meal)}
                          onQuickLog={() => handleQuickLogMeal(slot.label, meal)}
                        />
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* 3. SMART CATEGORIZED SHOPPING LIST GENERATOR */}
      <div className="glass-panel" style={{ padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        
        {/* Header & Export Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <ShoppingBag size={22} color="#0284c7" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Smart Categorized Shopping List Generator
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
              Aggregates raw ingredients from your 7-day meal plan into categorized grocery items with checkable boxes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyShoppingList}
              className="btn-outline"
              style={{ padding: '0.55rem 0.95rem', fontSize: '0.83rem', fontWeight: 700, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {copiedSuccess ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
              <span>{copiedSuccess ? 'Copied!' : 'Export / Copy List'}</span>
            </button>

            <button
              onClick={handleDownloadShoppingList}
              className="btn-outline"
              style={{ padding: '0.55rem 0.95rem', fontSize: '0.83rem', fontWeight: 700, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Download size={16} />
              <span>Download (.txt)</span>
            </button>

            <button
              onClick={() => setTickedItems({})}
              style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}
            >
              Reset Ticks
            </button>
          </div>
        </div>

        {/* Progress Bar & Category Filter Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
          
          {/* Progress Bar */}
          <div style={{ background: '#f1f5f9', padding: '0.85rem 1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                <span>Shopping Progress</span>
                <span style={{ color: '#0284c7' }}>{purchasedCount} of {totalShoppingItems} Purchased ({purchasePercent}%)</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${purchasePercent}%`, background: 'linear-gradient(90deg, #0284c7, #16a34a)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {['All', 'Vegetables & Greens', 'Proteins & Seafood', 'Whole Grains & Carbs', 'Dairy, Healthy Fats & Spices'].map((cat) => {
              const isCatActive = activeCategoryFilter === cat;
              const count = cat === 'All' ? shoppingList.length : shoppingList.filter(i => i.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    border: isCatActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    background: isCatActive ? '#0284c7' : '#ffffff',
                    color: isCatActive ? '#ffffff' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>{cat}</span>
                  <span style={{ background: isCatActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.7rem' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* SHOPPING ITEMS LIST BY CATEGORY */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {['Vegetables & Greens', 'Proteins & Seafood', 'Whole Grains & Carbs', 'Dairy, Healthy Fats & Spices'].map((category) => {
            if (activeCategoryFilter !== 'All' && activeCategoryFilter !== category) return null;

            const categoryItems = shoppingList.filter(i => i.category === category);
            if (categoryItems.length === 0) return null;

            const catIcons = {
              'Vegetables & Greens': '🥦',
              'Proteins & Seafood': '🥩',
              'Whole Grains & Carbs': '🌾',
              'Dairy, Healthy Fats & Spices': '🥛'
            };

            return (
              <div key={category} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.45rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{catIcons[category]}</span>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{category}</h4>
                  <span style={{ marginLeft: 'auto', fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>{categoryItems.length} items</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {categoryItems.map((item) => {
                    const isChecked = !!tickedItems[item.id];

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemTicked(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.5rem 0.65rem',
                          borderRadius: '8px',
                          background: isChecked ? '#f0fdf4' : '#ffffff',
                          border: isChecked ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare size={17} color="#16a34a" />
                        ) : (
                          <Square size={17} color="#94a3b8" />
                        )}
                        
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: isChecked ? '#166534' : '#1e293b',
                          textDecoration: isChecked ? 'line-through' : 'none'
                        }}>
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 4. MEAL SWAPPER ALTERNATIVES MODAL */}
      {swapModalOpen && swapTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Swap Meal: {swapTarget.dayName} ({swapTarget.mealType})
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Current: "{swapTarget.currentMeal.name}" ({swapTarget.currentMeal.calories} kcal)
                </p>
              </div>

              <button onClick={() => setSwapModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '0.4rem', color: '#64748b' }}>
                ✕
              </button>
            </div>

            {/* Fetching Spinner */}
            {isFetchingSwap && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2.5rem 1rem' }}>
                <RefreshCw size={26} color="#0284c7" className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Finding healthy diabetic-friendly alternatives...
                </span>
              </div>
            )}

            {/* Alternatives Cards List */}
            {!isFetchingSwap && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Select an Alternative Option ({swapAlternatives.length})
                </span>

                {swapAlternatives.map((altMeal, aIdx) => (
                  <div
                    key={aIdx}
                    style={{
                      background: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {altMeal.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.2rem 0 0 0' }}>
                          {altMeal.description}
                        </p>
                      </div>

                      <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        {altMeal.glycemicIndex || 'Low'} GI
                      </span>
                    </div>

                    {/* Macros pills */}
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#eff6ff', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                        {altMeal.calories} kcal
                      </span>
                      <span style={{ background: '#fffbeb', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                        {altMeal.carbs}g Carbs
                      </span>
                      <span style={{ background: '#ecfdf5', color: '#065f46', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                        {altMeal.protein}g Protein
                      </span>
                      <span style={{ background: '#fff1f2', color: '#9f1239', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                        {altMeal.fat}g Fat
                      </span>
                    </div>

                    <button
                      onClick={() => handleApplySwap(altMeal)}
                      className="btn-primary"
                      style={{
                        padding: '0.5rem',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        background: '#0284c7',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        justifyContent: 'center',
                        marginTop: '0.25rem'
                      }}
                    >
                      <Repeat size={14} />
                      <span>Select This Meal Swap</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

// Sub-component: Meal Card for Focused View
const MealCard = ({ slotLabel, slotIcon, bgColor, borderColor, meal, onSwap, onQuickLog }) => (
  <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    
    {/* Card Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{slotIcon}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{slotLabel}</span>
      </div>

      <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, color: '#16a34a' }}>
        {meal.glycemicIndex || 'Low'} GI
      </span>
    </div>

    {/* Title & Description */}
    <div>
      <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
        {meal.name}
      </h5>
      <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>
        {meal.description}
      </p>
    </div>

    {/* Macros Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem', background: 'rgba(255,255,255,0.7)', padding: '0.45rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', display: 'block' }}>KCAL</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7' }}>{meal.calories}</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', display: 'block' }}>CARBS</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b45309' }}>{meal.carbs}g</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', display: 'block' }}>PROT</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#047857' }}>{meal.protein}g</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', display: 'block' }}>FAT</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#be123c' }}>{meal.fat}g</span>
      </div>
    </div>

    {/* Ingredients list pills */}
    {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
        {meal.ingredients.map((ing, idx) => (
          <span key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
            {ing}
          </span>
        ))}
      </div>
    )}

    {/* Action Buttons */}
    <div style={{ display: 'flex', gap: '0.45rem', marginTop: 'auto', paddingTop: '0.35rem' }}>
      <button
        type="button"
        onClick={onSwap}
        style={{
          flex: 1,
          padding: '0.45rem',
          borderRadius: '6px',
          border: '1px solid #0284c7',
          background: '#ffffff',
          color: '#0284c7',
          fontWeight: 700,
          fontSize: '0.78rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.3rem'
        }}
      >
        <Repeat size={13} />
        <span>Swap</span>
      </button>

      <button
        type="button"
        onClick={onQuickLog}
        style={{
          flex: 1,
          padding: '0.45rem',
          borderRadius: '6px',
          border: 'none',
          background: '#0284c7',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.78rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.3rem'
        }}
      >
        <PlusCircle size={13} />
        <span>Log Meal</span>
      </button>
    </div>

  </div>
);

// Sub-component: Meal Card for Matrix Grid View
const MealCardCompact = ({ slotLabel, slotIcon, bgColor, borderColor, meal, onSwap, onQuickLog }) => (
  <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
        {slotIcon} {slotLabel}
      </span>
      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7' }}>{meal.calories} kcal</span>
        <button onClick={onSwap} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.15rem 0.35rem', cursor: 'pointer', color: '#0284c7' }} title="Swap Meal">
          <Repeat size={12} />
        </button>
        <button onClick={onQuickLog} style={{ background: '#0284c7', border: 'none', borderRadius: '4px', padding: '0.15rem 0.35rem', cursor: 'pointer', color: '#ffffff' }} title="Add to Log">
          <PlusCircle size={12} />
        </button>
      </div>
    </div>

    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
      {meal.name}
    </div>

    <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.7rem', color: '#475569', fontWeight: 700 }}>
      <span>Carbs: {meal.carbs}g</span> • 
      <span>Prot: {meal.protein}g</span> • 
      <span style={{ color: '#16a34a' }}>{meal.glycemicIndex || 'Low'} GI</span>
    </div>
  </div>
);
