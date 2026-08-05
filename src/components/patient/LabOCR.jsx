import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { FileSpreadsheet, UploadCloud, CheckCircle2, FileText, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export const LabOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [labReport, setLabReport] = useState({
    reportDate: '2026-07-28',
    labName: 'Quest Diagnostics Central Lab',
    parameters: [
      { name: 'HbA1c (Glycated Hemoglobin)', value: '6.3 %', range: '< 5.7 % (Normal), 5.7-6.4% (Prediabetes)', status: 'Well-Controlled' },
      { name: 'Fasting Blood Glucose', value: '104 mg/dL', range: '70 - 99 mg/dL', status: 'Slightly Elevated' },
      { name: 'eGFR (Kidney Function)', value: '94 mL/min/1.73m2', range: '> 60 mL/min', status: 'Normal / Healthy' },
      { name: 'Serum Creatinine', value: '0.85 mg/dL', range: '0.60 - 1.10 mg/dL', status: 'Normal' },
      { name: 'Total Cholesterol', value: '165 mg/dL', range: '< 200 mg/dL', status: 'Optimal' },
      { name: 'LDL (Bad Cholesterol)', value: '88 mg/dL', range: '< 100 mg/dL', status: 'Optimal' },
      { name: 'HDL (Good Cholesterol)', value: '54 mg/dL', range: '> 50 mg/dL', status: 'Healthy' },
      { name: 'Triglycerides', value: '115 mg/dL', range: '< 150 mg/dL', status: 'Normal' }
    ],
    aiSummary: 'Your HbA1c has improved from 6.8% to 6.3%, demonstrating excellent glycemic control over the past 90 days. Kidney markers (eGFR 94, Creatinine 0.85) and lipid profiles are in optimal range, indicating low 5-year complication risk.'
  });

  const handleUploadSim = () => {
    setIsProcessing(true);
    apiService.getLabOCR().then(res => {
      setTimeout(() => {
        if (res && res.reports && res.reports[0]) {
          setLabReport(res.reports[0]);
        }
        setIsProcessing(false);
      }, 1000);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(20, 184, 166, 0.12))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <FileSpreadsheet size={26} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Laboratory Report OCR & AI Interpretation</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Optical Character Recognition (OCR) parses clinical PDF reports, automatically extracts blood markers, and translates complex medical jargon into actionable health summaries.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--accent-purple)' }}>
        {isProcessing ? (
          <div style={{ color: 'var(--accent-purple)' }}>
            <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Extracting Medical Text with Optical OCR AI...</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Analyzing HbA1c, Kidney Function (eGFR), Lipid Panel & Liver Enzymes</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
            <UploadCloud size={42} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Drag & Drop Lab PDF or Scan Image Here</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Supports PDF, JPG, PNG from Quest Diagnostics, LabCorp, or local clinics</p>
            <button onClick={handleUploadSim} className="btn-glow" style={{ marginTop: '0.5rem' }}>
              <FileText size={16} />
              <span>Simulate Upload & OCR Extraction</span>
            </button>
          </div>
        )}
      </div>

      {/* AI Interpretation Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <Sparkles size={20} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Plain-English Clinical Summary</h3>
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
          "{labReport.aiSummary}"
        </p>
      </div>

      {/* Extracted Parameters Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Extracted Clinical Parameters ({labReport.labName})</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Report Date: {labReport.reportDate}</p>
          </div>
          <div className="badge badge-success">
            <CheckCircle2 size={13} />
            <span>OCR Verified</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Biomarker / Test Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Result Value</th>
                <th style={{ padding: '0.75rem 1rem' }}>Reference Range</th>
                <th style={{ padding: '0.75rem 1rem' }}>Clinical Status</th>
              </tr>
            </thead>
            <tbody>
              {labReport.parameters.map((param, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{param.name}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>{param.value}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{param.range}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${param.status.includes('Normal') || param.status.includes('Optimal') || param.status.includes('Controlled') || param.status.includes('Healthy') ? 'badge-success' : 'badge-warning'}`}>
                      {param.status}
                    </span>
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
