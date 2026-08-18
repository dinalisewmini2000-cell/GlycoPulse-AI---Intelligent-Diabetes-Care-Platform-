import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Camera, Upload, Trash2, X, RefreshCw, CheckCircle2, AlertCircle, Info, Plus, Utensils, Crop, ShieldAlert, Edit2 } from 'lucide-react';
import { analyzeFoodImage, isEdibleFood } from '../../services/foodVisionService';
import { NUTRITION_DATABASE, calculateItemNutrition, calculateMealTotals, findNutritionDatabaseEntry } from '../../services/nutritionDatabase';
import { ImageCropModal } from './ImageCropModal';

export const MealsPage = () => {
  const { mealLogs, addMealLog, deleteMealLog } = useApp();

  // Modal States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Manual Form State
  const [manualMealType, setManualMealType] = useState('Breakfast');
  const [manualTime, setManualTime] = useState('8:00 AM');
  const [manualFood, setManualFood] = useState('');
  const [manualGramWeight, setManualGramWeight] = useState('150');
  const [manualNotes, setManualNotes] = useState('');

  // Scan / Upload State
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [rawImage, setRawImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Item List State (Itemized Food & Gram Portion Editor)
  const [detectedItemsList, setDetectedItemsList] = useState([]);
  const [newFoodInput, setNewFoodInput] = useState('');
  const [newFoodGrams, setNewFoodGrams] = useState(100);

  // Meal Summary Fields
  const [editFoodName, setEditFoodName] = useState('');
  const [editMealType, setEditMealType] = useState('Lunch');
  const [editTime, setEditTime] = useState('1:00 PM');
  
  // Mathematically calculated nutrition totals
  const [nutritionTotals, setNutritionTotals] = useState({
    calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Camera Management
  useEffect(() => {
    if (isScanModalOpen && activeTab === 'camera' && !rawImage && !croppedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isScanModalOpen, activeTab, rawImage, croppedImage]);

  // Recalculate Total Nutrition whenever detectedItemsList changes
  useEffect(() => {
    if (detectedItemsList && detectedItemsList.length > 0) {
      const totals = calculateMealTotals(detectedItemsList);
      setNutritionTotals(totals);
    }
  }, [detectedItemsList]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('[Camera Access Error]:', err);
      setCameraError('Camera access was not allowed. You can upload a food image from your device instead.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    stopCamera();
    setRawImage(dataUrl);
    setIsCropModalOpen(true); // Open Crop Modal first!
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setIsCropModalOpen(true); // Open Crop Modal first!
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmCrop = (croppedBase64) => {
    setCroppedImage(croppedBase64);
    setIsCropModalOpen(false);
    setAnalysisResult(null); // IMMEDIATELY CLEAR PREVIOUS RESULT
    setDetectedItemsList([]); // IMMEDIATELY CLEAR PREVIOUS ITEMS
    runAnalysisOnImage(croppedBase64);
  };

  const runAnalysisOnImage = async (imageToAnalyze) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setDetectedItemsList([]);

    try {
      const result = await analyzeFoodImage(imageToAnalyze);
      setAnalysisResult(result);

      if (result.isFood) {
        setDetectedItemsList(result.detectedItems || []);
        setEditFoodName(result.foodName || 'Recorded Meal');

        const hour = new Date().getHours();
        if (hour < 11) setEditMealType('Breakfast');
        else if (hour < 16) setEditMealType('Lunch');
        else setEditMealType('Dinner');

        setEditTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('[Analysis Error]:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Dynamic Item Modification & Instant Recalculation
  const handleItemGramChange = (index, newGrams) => {
    const validGrams = Math.max(5, Number(newGrams) || 50);
    const updated = [...detectedItemsList];
    const currentItem = updated[index];

    const nut = calculateItemNutrition(currentItem.food, validGrams);
    updated[index] = {
      ...currentItem,
      grams: validGrams,
      portion: `${validGrams} g`,
      calories: nut.calories,
      carbs: nut.carbs,
      protein: nut.protein,
      fat: nut.fat
    };

    setDetectedItemsList(updated);
  };

  const handleItemNameChange = (index, newName) => {
    const updated = [...detectedItemsList];
    const currentItem = updated[index];

    const nut = calculateItemNutrition(newName, currentItem.grams);
    updated[index] = {
      ...currentItem,
      food: newName,
      calories: nut.calories,
      carbs: nut.carbs,
      protein: nut.protein,
      fat: nut.fat
    };

    setDetectedItemsList(updated);
    setEditFoodName(updated.map(i => i.food).join(', '));
  };

  const handleApplyPreset = (preset) => {
    setEditFoodName(preset.label);
    const processed = preset.items.map(item => {
      const nut = calculateItemNutrition(item.food, item.grams);
      return {
        food: nut.foodName,
        grams: nut.grams,
        portion: `${nut.grams} g`,
        calories: nut.calories,
        carbs: nut.carbs,
        protein: nut.protein,
        fat: nut.fat,
        confidence: 100
      };
    });
    setDetectedItemsList(processed);
  };

  const handleRemoveItem = (index) => {
    const updated = detectedItemsList.filter((_, i) => i !== index);
    setDetectedItemsList(updated);
    if (updated.length > 0) {
      setEditFoodName(updated.map(i => i.food).join(', '));
    }
  };

  const handleAddFoodItem = (e) => {
    e.preventDefault();
    if (!newFoodInput.trim()) return;
    if (!isEdibleFood(newFoodInput)) {
      alert(`"${newFoodInput}" is not recognized as an edible food item.`);
      return;
    }

    const nut = calculateItemNutrition(newFoodInput.trim(), newFoodGrams);
    const newItem = {
      food: nut.foodName,
      grams: nut.grams,
      portion: `${nut.grams} g`,
      calories: nut.calories,
      carbs: nut.carbs,
      protein: nut.protein,
      fat: nut.fat,
      confidence: 100
    };

    const updated = [...detectedItemsList, newItem];
    setDetectedItemsList(updated);
    setNewFoodInput('');
    setNewFoodGrams(100);
    setEditFoodName(updated.map(i => i.food).join(', '));
  };

  const handleAddAnalyzedMealToLog = () => {
    if (!editFoodName || detectedItemsList.length === 0) return;

    addMealLog({
      mealType: editMealType,
      time: editTime,
      food: editFoodName,
      calories: `${nutritionTotals.calories} kcal`,
      carbs: nutritionTotals.carbs,
      protein: nutritionTotals.protein,
      fat: nutritionTotals.fat,
      notes: analysisResult?.confidenceLevel?.label || 'User Confirmed AI Log'
    });

    handleCloseScanModal();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFood) return;

    const nut = calculateItemNutrition(manualFood, Number(manualGramWeight) || 150);

    addMealLog({
      mealType: manualMealType,
      time: manualTime,
      food: nut.foodName,
      calories: `${nut.calories} kcal`,
      carbs: nut.carbs,
      protein: nut.protein,
      fat: nut.fat,
      notes: manualNotes || 'Manual log'
    });

    setManualFood('');
    setManualGramWeight('150');
    setManualNotes('');
    setIsManualModalOpen(false);
  };

  const handleCloseScanModal = () => {
    stopCamera();
    setIsScanModalOpen(false);
    setRawImage(null);
    setCroppedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setCameraError('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header & Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
            Meals & Nutrition Pipeline
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Accurate, food-only recognition supporting Sri Lankan, South Asian, and international meals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="btn-outline" 
            style={{ padding: '0.65rem 1.1rem', fontSize: '0.88rem' }}
          >
            <PlusCircle size={17} />
            <span>+ Enter Manually</span>
          </button>

          <button 
            onClick={() => { setIsScanModalOpen(true); setActiveTab('camera'); }}
            className="btn-primary" 
            style={{ padding: '0.65rem 1.15rem', fontSize: '0.88rem', background: 'linear-gradient(135deg, #0284c7, #2563eb)', border: 'none' }}
          >
            <Camera size={17} />
            <span>Scan Food Image</span>
          </button>
        </div>
      </div>

      {/* 1. INTERACTIVE CROP MODAL PRE-SCANNING STEP */}
      {isCropModalOpen && rawImage && (
        <ImageCropModal
          imageSrc={rawImage}
          onConfirmCrop={handleConfirmCrop}
          onCancel={() => { setIsCropModalOpen(false); setRawImage(null); }}
        />
      )}

      {/* 2. MANUAL ENTRY MODAL */}
      {isManualModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }}>
          <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '1.5rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Manual Meal Entry
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Meal Type</label>
                  <select value={manualMealType} onChange={e => setManualMealType(e.target.value)} style={{ width: '100%' }}>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Time</label>
                  <input type="text" required value={manualTime} onChange={e => setManualTime(e.target.value)} placeholder="e.g. 8:00 AM" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Food Name (e.g. Red Rice, Dhal Curry, Chicken)</label>
                <input type="text" required value={manualFood} onChange={e => setManualFood(e.target.value)} placeholder="e.g. White rice & Chicken curry" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Serving Weight (grams)</label>
                <input type="number" required value={manualGramWeight} onChange={e => setManualGramWeight(e.target.value)} placeholder="e.g. 180" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Note (optional)</label>
                <input type="text" value={manualNotes} onChange={e => setManualNotes(e.target.value)} placeholder="e.g. Low spice" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsManualModalOpen(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#0284c7' }}>Save Meal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MAIN SCAN & RECOGNITION PIPELINE MODAL */}
      {isScanModalOpen && !isCropModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', position: 'relative' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                  <Utensils size={18} color="#0284c7" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Food Recognition & Nutrition Pipeline
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Itemized food detection with adjustable portion sizes & Sri Lankan cuisine support.
                </p>
              </div>
              <button onClick={handleCloseScanModal} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '50%', padding: '0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            {/* TAB SELECTOR */}
            {!croppedImage && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f8fafc', padding: '0.3rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.1rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('camera')}
                  style={{
                    padding: '0.55rem', borderRadius: '6px', border: 'none',
                    background: activeTab === 'camera' ? '#0284c7' : 'transparent',
                    color: activeTab === 'camera' ? '#ffffff' : '#64748b',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem'
                  }}
                >
                  <Camera size={16} />
                  <span>Scan with Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  style={{
                    padding: '0.55rem', borderRadius: '6px', border: 'none',
                    background: activeTab === 'upload' ? '#0284c7' : 'transparent',
                    color: activeTab === 'upload' ? '#ffffff' : '#64748b',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem'
                  }}
                >
                  <Upload size={16} />
                  <span>Upload Image File</span>
                </button>
              </div>
            )}

            {/* CAMERA TAB */}
            {activeTab === 'camera' && !croppedImage && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'center' }}>
                {cameraError ? (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '10px', color: '#b91c1c', fontSize: '0.85rem', textAlign: 'center', width: '100%' }}>
                    <AlertCircle size={20} style={{ marginBottom: '0.35rem' }} />
                    <p>{cameraError}</p>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '260px', background: '#0f172a', borderRadius: '10px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div style={{ position: 'absolute', inset: '24px', border: '2px dashed rgba(255, 255, 255, 0.75)', borderRadius: '12px', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ background: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700 }}>
                        POSITION FULL MEAL INSIDE FRAME
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <button type="button" onClick={handleCloseScanModal} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  {!cameraError && (
                    <button type="button" onClick={handleCapturePhoto} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#0284c7' }}>
                      <Camera size={16} />
                      <span>Capture & Crop</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* UPLOAD TAB */}
            {activeTab === 'upload' && !croppedImage && (
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2.5rem 1rem', textAlign: 'center', background: '#f8fafc' }}>
                <Upload size={32} color="#0284c7" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Select food photo from device</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>Supports JPG, PNG, WEBP</div>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileUpload} style={{ display: 'none' }} id="food-file-input" />
                <label htmlFor="food-file-input" className="btn-primary" style={{ display: 'inline-flex', padding: '0.6rem 1.35rem', cursor: 'pointer', background: '#0284c7', borderRadius: '8px', fontSize: '0.85rem' }}>
                  Select Image File
                </label>
              </div>
            )}

            {/* ANALYSIS IN PROGRESS */}
            {isAnalyzing && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2.5rem 1rem' }}>
                <RefreshCw size={28} color="#0284c7" className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Analyzing food items & portion sizes...</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Checking image quality, itemizing ingredients & retrieving database nutrition.</div>
              </div>
            )}

            {/* RESULT CASE A: NO FOOD OR QUALITY ISSUE */}
            {analysisResult && !analysisResult.isFood && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', textAlign: 'center' }}>
                <AlertCircle size={36} style={{ margin: '0 auto', color: '#dc2626' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.35rem' }}>
                    {analysisResult.errorType === 'QUALITY_ISSUE' ? 'Unclear Image' : 'No Food Detected'}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.45 }}>
                    {analysisResult.statusText || 'We couldn\'t identify any edible food items in this image.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                  <button type="button" onClick={() => { setCroppedImage(null); setRawImage(null); setAnalysisResult(null); setActiveTab('camera'); }} className="btn-outline" style={{ background: '#ffffff', borderColor: '#fca5a5', color: '#991b1b', fontWeight: 600 }}>
                    Try Again
                  </button>
                  <button type="button" onClick={() => { handleCloseScanModal(); setIsManualModalOpen(true); }} className="btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                    Enter Manually
                  </button>
                </div>
              </div>
            )}

            {/* RESULT CASE B: VALIDATED FOOD ANALYSIS & PORTION EDITOR */}
            {analysisResult && analysisResult.isFood && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {/* Header & Confidence Badge */}
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <img src={croppedImage} alt="Cropped Meal" style={{ width: '68px', height: '68px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{editFoodName}</div>
                      <span style={{ background: analysisResult.confidenceLevel.bg, color: analysisResult.confidenceLevel.color, border: `1px solid ${analysisResult.confidenceLevel.border}`, padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {analysisResult.confidenceLevel.label} ({analysisResult.confidence || 88}%)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Itemized components & nutritional data calculated per gram.
                    </div>

                    {/* Quick Dish Presets bar */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.45rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700 }}>Quick Dish Presets:</span>
                      {[
                        { label: 'Herb Roasted Grilled Chicken', items: [{ food: 'grilled chicken breast', grams: 180 }, { food: 'steamed vegetables', grams: 100 }] },
                        { label: 'Sri Lankan Rice & Curry', items: [{ food: 'white rice', grams: 180 }, { food: 'chicken curry', grams: 120 }, { food: 'dhal curry (lentils)', grams: 100 }, { food: 'gotukola sambol', grams: 50 }] },
                        { label: 'Fresh Mixed Fruit Platter', items: [{ food: 'strawberries & berries', grams: 100 }, { food: 'sliced kiwi & orange', grams: 120 }, { food: 'banana & grapes', grams: 120 }] },
                        { label: 'Kottu Roti', items: [{ food: 'kottu roti', grams: 250 }] }
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0284c7', fontWeight: 700, cursor: 'pointer' }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PARTIAL VISIBILITY WARNING BANNER */}
                {analysisResult.isPartiallyVisible && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#b45309', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <AlertCircle size={16} />
                    <span><strong>Partial Image Warning:</strong> Food extends outside frame. Portion estimates are calculated for the visible serving only.</span>
                  </div>
                )}

                {/* UNCERTAIN CONFIDENCE WARNING BANNER */}
                {analysisResult.confidence < 60 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#991b1b', fontSize: '0.78rem' }}>
                    <strong>Uncertain AI Identification:</strong> Please confirm or edit the detected foods below to ensure an accurate calorie & nutrient total.
                  </div>
                )}

                {/* ITEMIZED DETECTED FOODS & GRAM PORTION EDITOR */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Itemized Foods ({detectedItemsList.length}) & Gram Portion Sizes
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '0.75rem' }}>
                    {detectedItemsList.map((item, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        
                        {/* Item Row 1: Food Name & Delete */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }}></span>
                            <input
                              type="text"
                              value={item.food}
                              onChange={e => handleItemNameChange(idx, e.target.value)}
                              style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', border: 'none', background: 'transparent', outline: 'none', padding: 0 }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7' }}>{item.calories} kcal</span>
                            <button type="button" onClick={() => handleRemoveItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Remove item">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Item Row 2: Gram Weight Input + Preset Portion Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px dashed #cbd5e1', paddingTop: '0.45rem' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Weight (g):</span>
                          <input
                            type="number"
                            value={item.grams}
                            onChange={e => handleItemGramChange(idx, e.target.value)}
                            style={{ width: '70px', padding: '0.2rem 0.4rem', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
                          />
                          
                          {/* Presets: 50g, 100g, 150g, 200g */}
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {[50, 100, 150, 200, 250].map(g => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => handleItemGramChange(idx, g)}
                                style={{
                                  padding: '0.15rem 0.4rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #cbd5e1',
                                  background: item.grams === g ? '#0284c7' : '#ffffff',
                                  color: item.grams === g ? '#ffffff' : '#475569',
                                  cursor: 'pointer'
                                }}
                              >
                                {g}g
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Add Missing Food Form */}
                  <form onSubmit={handleAddFoodItem} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Add missing food (e.g. Pol Sambol, Dhal, Curry)"
                      value={newFoodInput}
                      onChange={e => setNewFoodInput(e.target.value)}
                      style={{ flex: 2, padding: '0.5rem 0.75rem', fontSize: '0.83rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                    <input
                      type="number"
                      placeholder="Weight (g)"
                      value={newFoodGrams}
                      onChange={e => setNewFoodGrams(Number(e.target.value))}
                      style={{ flex: 1, minWidth: '70px', padding: '0.5rem 0.5rem', fontSize: '0.83rem', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}
                    />
                    <button type="submit" className="btn-outline" style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem', borderRadius: '6px' }}>
                      <Plus size={14} />
                      <span>Add Item</span>
                    </button>
                  </form>
                </div>

                {/* MATHEMATICALLY DERIVED NUTRITION TOTALS GRID */}
                <div style={{ background: '#fafafa', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Meal Nutrition (Calculated)
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                      Total Calories = Sum of Detected Items
                    </span>
                  </div>

                  {/* Macro Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.55rem' }}>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.5rem 0.6rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1d4ed8', display: 'block' }}>CALORIES</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e40af' }}>~{nutritionTotals.calories} kcal</span>
                    </div>

                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.5rem 0.6rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b45309', display: 'block' }}>CARBS</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400e' }}>~{nutritionTotals.carbs} g</span>
                    </div>

                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.5rem 0.6rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', display: 'block' }}>PROTEIN</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065f46' }}>~{nutritionTotals.protein} g</span>
                    </div>

                    <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '0.5rem 0.6rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#be123c', display: 'block' }}>FAT</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#9f1239' }}>~{nutritionTotals.fat} g</span>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 0.6rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'block' }}>FIBER</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#334155' }}>~{nutritionTotals.fiber} g</span>
                    </div>

                    <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '0.5rem 0.6rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6b21a8', display: 'block' }}>SUGAR</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#581c87' }}>~{nutritionTotals.sugar} g</span>
                    </div>
                  </div>
                </div>

                {/* DIABETES GUIDANCE BOX */}
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.75rem 0.85rem', borderRadius: '8px', color: '#0369a1', fontSize: '0.78rem', lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Info size={15} />
                    <span>Diabetes Guidance Note</span>
                  </div>
                  <div>
                    Estimated carbohydrate load: <strong>{nutritionTotals.carbs} g</strong>. {nutritionTotals.carbs > 45 ? 'High carbohydrate content detected. Monitor post-meal blood glucose levels.' : 'Moderate carbohydrate load.'}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button type="button" onClick={() => { setAnalysisResult(null); setCroppedImage(null); setRawImage(null); }} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}>
                    Scan New Image
                  </button>
                  <button type="button" onClick={handleAddAnalyzedMealToLog} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#0284c7', padding: '0.65rem' }}>
                    <CheckCircle2 size={16} />
                    <span>Confirm & Add to Log</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. RECORDED MEALS TABLE */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
          Recorded Meals
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>MEAL</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>TIME</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>FOOD</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>CALORIES</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>NOTE</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {mealLogs.map((meal) => (
                <tr key={meal.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{meal.mealType}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{meal.time}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-main)' }}>{meal.food}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#0284c7', fontWeight: 800 }}>{meal.calories || '—'}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-dim)' }}>{meal.notes || '—'}</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    <button onClick={() => deleteMealLog(meal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
