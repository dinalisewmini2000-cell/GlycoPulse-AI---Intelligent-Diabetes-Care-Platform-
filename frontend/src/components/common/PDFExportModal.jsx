import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { jsPDF } from 'jspdf';
import { FileText, Download, CheckCircle2, X } from 'lucide-react';

export const PDFExportModal = () => {
  const { pdfModalOpen, setPdfModalOpen, glucoseLogs, mealLogs, labReports, currentUser } = useApp();
  const [downloaded, setDownloaded] = useState(false);
  const [dateRange, setDateRange] = useState('30');

  if (!pdfModalOpen) return null;

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    
    // Header & Branding
    doc.setFontSize(18);
    doc.setTextColor(2, 132, 199);
    doc.text('GlucoCare - Diabetes Health Summary Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Patient: ${currentUser?.name || 'Dinali Bhagya'} (${currentUser?.email || 'dinali@glucocare.ai'})`, 14, 30);
    doc.text(`Time Frame: Past ${dateRange} Days | Generated: ${new Date().toLocaleDateString()}`, 14, 36);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(14, 42, 196, 42);

    let y = 52;

    // Section 1: Glucose Readings Log
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Glucose Readings', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.text('Date', 14, y);
    doc.text('Time', 50, y);
    doc.text('Glucose (mg/dL)', 90, y);
    doc.text('Context', 140, y);
    
    doc.setFont('helvetica', 'normal');
    y += 6;

    (glucoseLogs || []).slice(0, 10).forEach(l => {
      doc.text(l.date || 'Today', 14, y);
      doc.text(l.time || '—', 50, y);
      doc.text(`${l.value} mg/dL`, 90, y);
      doc.text(l.context || 'General', 140, y);
      y += 7;
    });

    // Section 2: Recent Meals
    y += 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Meals Recorded', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.text('Meal', 14, y);
    doc.text('Time', 50, y);
    doc.text('Food Description', 90, y);
    
    doc.setFont('helvetica', 'normal');
    y += 6;

    (mealLogs || []).slice(0, 5).forEach(m => {
      doc.text(m.mealType || 'Meal', 14, y);
      doc.text(m.time || '—', 50, y);
      doc.text(m.food || '—', 90, y);
      y += 7;
    });

    // Section 3: Lab Reports Summary
    y += 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Lab Reports Summary', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.text('Report Name', 14, y);
    doc.text('Date', 80, y);
    doc.text('Result', 130, y);
    
    doc.setFont('helvetica', 'normal');
    y += 6;

    (labReports || []).forEach(r => {
      doc.text(r.name || 'Lab Report', 14, y);
      doc.text(r.date || '—', 80, y);
      doc.text(r.result || '—', 130, y);
      y += 7;
    });

    // Save PDF
    doc.save(`GlucoCare_Health_Summary_${currentUser?.name?.replace(' ', '_') || 'Patient'}.pdf`);
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      setPdfModalOpen(false);
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '1.5rem', background: 'var(--bg-secondary)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--primary-color)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Export Health Summary PDF</h3>
          </div>
          <button onClick={() => setPdfModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {downloaded ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={40} style={{ margin: '0 auto 0.6rem auto' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>PDF Export Completed!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Select Time Frame
              </label>
              <select 
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="7">Past 7 Days</option>
                <option value="30">Past 30 Days</option>
                <option value="90">Past 90 Days</option>
              </select>
            </div>

            <button onClick={handleGeneratePDF} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}>
              <Download size={16} />
              <span>Download PDF Summary</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
