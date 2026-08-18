import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, RefreshCw, Move, Crop } from 'lucide-react';

export const ImageCropModal = ({ imageSrc, onConfirmCrop, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 }); // percentage based
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.7));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setCropBox({ x: 10, y: 10, width: 80, height: 80 });
  };

  const handleConfirm = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Crop coordinates calculation
      const cropX = (cropBox.x / 100) * img.naturalWidth;
      const cropY = (cropBox.y / 100) * img.naturalHeight;
      const cropW = (cropBox.width / 100) * img.naturalWidth;
      const cropH = (cropBox.height / 100) * img.naturalHeight;

      canvas.width = Math.max(100, cropW);
      canvas.height = Math.max(100, cropH);

      ctx.save();
      // Handle rotation
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(
          img,
          cropX, cropY, cropW, cropH,
          -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height
        );
      } else {
        ctx.drawImage(
          img,
          cropX, cropY, cropW, cropH,
          0, 0, canvas.width, canvas.height
        );
      }
      ctx.restore();

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      onConfirmCrop(croppedBase64);
    };
    img.src = imageSrc;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
      <div className="glass-panel" style={{ maxWidth: '580px', width: '100%', padding: '1.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Crop size={18} color="#0284c7" />
              <span>Adjust & Crop Food Photo</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Ensure your complete food plate is inside the selection frame before scanning.
            </p>
          </div>
          <button onClick={onCancel} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '50%', padding: '0.4rem' }}>
            <X size={16} />
          </button>
        </div>

        {/* Interactive Crop Viewport */}
        <div 
          ref={containerRef}
          style={{ width: '100%', height: '300px', background: '#0f172a', borderRadius: '12px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
        >
          <img 
            src={imageSrc} 
            alt="To crop" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              transform: `scale(${zoom}) rotate(${rotation}deg)`, 
              transition: 'transform 0.15s ease',
              objectFit: 'contain'
            }} 
          />

          {/* Interactive Crop Box Overlay */}
          <div 
            style={{
              position: 'absolute',
              left: `${cropBox.x}%`,
              top: `${cropBox.y}%`,
              width: `${cropBox.width}%`,
              height: `${cropBox.height}%`,
              border: '2px solid #0284c7',
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
              borderRadius: '8px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}
          >
            <span style={{ background: '#0284c7', color: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
              CROP SELECTION FRAME
            </span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button type="button" onClick={handleZoomOut} className="btn-outline" style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }} title="Zoom Out">
              <ZoomOut size={15} />
            </button>
            <button type="button" onClick={handleZoomIn} className="btn-outline" style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }} title="Zoom In">
              <ZoomIn size={15} />
            </button>
            <button type="button" onClick={handleRotate} className="btn-outline" style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }} title="Rotate 90°">
              <RotateCw size={15} />
            </button>
            <button type="button" onClick={handleReset} className="btn-outline" style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }} title="Reset Crop">
              <RefreshCw size={15} />
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
            Zoom: {Math.round(zoom * 100)}% | Rotation: {rotation}°
          </div>
        </div>

        {/* Expand / Fit Quick Presets */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button 
            type="button" 
            onClick={() => setCropBox({ x: 5, y: 5, width: 90, height: 90 })} 
            style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, cursor: 'pointer' }}
          >
            Expand Frame (Full Plate)
          </button>
          <button 
            type="button" 
            onClick={() => setCropBox({ x: 20, y: 20, width: 60, height: 60 })} 
            style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, cursor: 'pointer' }}
          >
            Center Crop
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.25rem' }}>
          <button type="button" onClick={onCancel} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}>
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#0284c7', padding: '0.65rem' }}>
            <Check size={16} />
            <span>Confirm & Scan Image</span>
          </button>
        </div>

      </div>
    </div>
  );
};
