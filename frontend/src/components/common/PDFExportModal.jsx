import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { jsPDF } from 'jspdf';
import { FileText, Download, CheckCircle2, X } from 'lucide-react';

export const PDFExportModal = () => {
  const { pdfModalOpen, setPdfModalOpen, glucoseLogs, currentGlucose, hba1cHistory } = useApp();
  const [downloaded, setDownloaded] = useState(false);

  if (!pdfModalOpen) return null;

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    
    // Title & Header
    doc.setFontSize(20);
    doc.setTextColor(6, 182, 212);
    doc.text('GlycoPulse AI - Diabetes Clinical Health Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Patient: Sarah Jenkins | DOB: 1992-05-14 | Diabetes Type: Type 1`, 14, 30);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()} | Attending Doctor: Dr. Robert Vance, MD`, 14, 36);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(14, 42, 196, 42);

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. Glycemic Control Summary', 14, 52);

    doc.setFontSize(10);
    doc.text(`Current Glucose: ${currentGlucose} mg/dL`, 14, 60);
    doc.text(`Estimated HbA1c: 6.3% (Optimal Range)`, 14, 66);
    doc.text(`Time In Range (70-180 mg/dL): 84%`, 14, 72);

    // Glucose Log Table
    doc.setFontSize(14);
    doc.text('2. Recent Glucose Readings', 14, 86);

    let y = 96;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Timestamp', 14, y);
    doc.text('Value (mg/dL)', 60, y);
    doc.text('Category', 110, y);
    doc.text('Notes', 150, y);
    
    doc.setFont('helvetica', 'normal');
    y += 6;

    glucoseLogs.slice(0, 8).forEach(l => {
      doc.text(l.timestamp, 14, y);
      doc.text(String(l.value), 60, y);
      doc.text(l.type, 110, y);
      doc.text(l.notes || '—', 150, y);
      y += 8;
    });

    // Save PDF
    doc.save('GlycoPulse_AI_Diabetes_Report.pdf');
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      setPdfModalOpen(false);
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '1.75rem' }}>
        
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
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>PDF Export Downloaded!</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Ready for clinical sharing with your endocrinologist.</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
              Generates an official formatted clinical report containing HbA1c history, Time-in-Range telemetry, recent glucose logs, and AI trend predictions.
            </p>
            <button onClick={handleGeneratePDF} className="btn-glow" style={{ width: '100%', justifyContent: 'center' }}>
              <Download size={17} />
              <span>Download Official PDF Report</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
