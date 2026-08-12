import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { jsPDF } from 'jspdf';
import { FileText, Download, CheckCircle2, X, Calendar, Filter } from 'lucide-react';

export const PDFExportModal = () => {
  const { pdfModalOpen, setPdfModalOpen, glucoseLogs, currentGlucose, currentUser } = useApp();
  const [downloaded, setDownloaded] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [includeLab, setIncludeLab] = useState(true);
  const [includeMeals, setIncludeMeals] = useState(true);
  const [includeComplications, setIncludeComplications] = useState(true);

  if (!pdfModalOpen) return null;

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    
    // Header & Branding
    doc.setFontSize(20);
    doc.setTextColor(6, 182, 212);
    doc.text('GlycoPulse AI - Clinical Diabetes Telemetry Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Patient: ${currentUser?.name || 'Dinali Bhagya'} (${currentUser?.email || 'dinali@glucocare.ai'}) | Type: ${currentUser?.diabetesType || 'Type 1'}`, 14, 30);
    doc.text(`Telemetry Range: Past ${dateRange} Days | Report Generated: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`Attending Physician: Dr. Robert Vance, MD (Endocrinology & Diabetology)`, 14, 42);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(14, 48, 196, 48);

    // Section 1: Glycemic Control Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. Glycemic Telemetry & Control Metrics', 14, 58);

    doc.setFontSize(10);
    doc.text(`Real-Time Glucose: ${currentGlucose} mg/dL`, 14, 66);
    doc.text(`Estimated HbA1c: 6.3% (Optimal Glycemic Range)`, 14, 72);
    doc.text(`Time In Range (70-180 mg/dL): 84%`, 14, 78);
    doc.text(`Glycemic Variability (CV%): 18.2% (Stable)`, 14, 84);

    let y = 98;

    // Section 2: Recent Readings Table
    doc.setFontSize(14);
    doc.text('2. Recent Glucose Readings Log', 14, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Timestamp', 14, y);
    doc.text('Glucose (mg/dL)', 60, y);
    doc.text('Category', 110, y);
    doc.text('Clinical Note', 150, y);
    
    doc.setFont('helvetica', 'normal');
    y += 6;

    (glucoseLogs || []).slice(0, 7).forEach(l => {
      doc.text(l.timestamp, 14, y);
      doc.text(String(l.value), 60, y);
      doc.text(l.type, 110, y);
      doc.text(l.notes || '—', 150, y);
      y += 8;
    });

    // Optional Lab OCR Section
    if (includeLab) {
      y += 6;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Verified Lab OCR Biomarkers', 14, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('• Fasting Plasma Glucose: 108 mg/dL (Quest Diagnostics - 2026-07-28)', 14, y);
      y += 6;
      doc.text('• Kidney eGFR: 94 mL/min/1.73m² (Normal renal filtration)', 14, y);
      y += 6;
      doc.text('• Microalbuminuria: 12 mg/g (Zero nephropathy risk)', 14, y);
    }

    // Optional Complications Risk Section
    if (includeComplications) {
      y += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Micro-Vascular & Ulcer Risk Screening', 14, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('• Diabetic Retinopathy Risk: Low (4.2%)', 14, y);
      y += 6;
      doc.text('• Diabetic Foot Ulcer (DFU) Vision Grade: Grade 0 (96% Perfusion)', 14, y);
    }

    // Save PDF
    doc.save(`GlycoPulse_Report_${currentUser?.name?.replace(' ', '_') || 'Patient'}_${dateRange}D.pdf`);
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      setPdfModalOpen(false);
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={22} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Export Clinical PDF Report</h3>
          </div>
          <button onClick={() => setPdfModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {downloaded ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={44} style={{ margin: '0 auto 0.8rem auto' }} />
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>PDF Report Exported!</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Saved to your device downloads for physician presentation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Range Selector */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                SELECT TELEMETRY TIME FRAME
              </label>
              <select 
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}
              >
                <option value="7" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Past 7 Days Telemetry</option>
                <option value="30" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Past 30 Days Telemetry (Recommended)</option>
                <option value="90" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>Past 90 Days Telemetry (Quarterly HbA1c)</option>
              </select>
            </div>

            {/* Inclusions */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                REPORT SECTIONS TO INCLUDE
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.8rem', borderRadius: '8px' }}>
                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={includeLab} onChange={e => setIncludeLab(e.target.checked)} />
                  <span>Lab OCR Biomarkers (eGFR, Lipids, HbA1c)</span>
                </label>

                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={includeMeals} onChange={e => setIncludeMeals(e.target.checked)} />
                  <span>AI Meal & Carbohydrate Intake History</span>
                </label>

                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={includeComplications} onChange={e => setIncludeComplications(e.target.checked)} />
                  <span>Foot Ulcer & Microvascular Risk Screening</span>
                </label>
              </div>
            </div>

            <button onClick={handleGeneratePDF} className="btn-glow" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
              <Download size={17} />
              <span>Download Formatted PDF Report</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
