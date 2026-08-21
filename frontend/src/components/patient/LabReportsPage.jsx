import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, Upload, X, ShieldAlert, CheckCircle2, AlertTriangle, 
  Info, Eye, Trash2, RefreshCw, FileCheck, Layers, ChevronDown, ChevronUp
} from 'lucide-react';
import { analyzeLabReportDocument } from '../../services/labReportService';

export const LabReportsPage = () => {
  const { labReports, addLabReport, deleteLabReport } = useApp();

  // Modal & File States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  
  // Extraction Result State
  const [analysisResult, setAnalysisResult] = useState(null);
  const [unreadableError, setUnreadableError] = useState('');
  const [showOriginalDoc, setShowOriginalDoc] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Reset Modal
  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setFileName('');
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setUnreadableError('');
    setShowOriginalDoc(false);
    setIsViewOnly(false);
  };

  // Handle File Selection & Process
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUnreadableError("Unsupported file type. Please upload a PDF, PNG, or JPG laboratory report.");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setUnreadableError('');
    setAnalysisResult(null);
    setIsViewOnly(false);

    // Trigger Extraction Analysis
    setIsAnalyzing(true);
    try {
      const result = await analyzeLabReportDocument(file, file.name);
      if (!result.isReadable) {
        setUnreadableError(result.errorMessage || "We couldn't clearly read this report. Please upload a higher-quality image or PDF.");
        setAnalysisResult(null);
      } else {
        setAnalysisResult(result);
        
        // Auto expand all categories
        const catMap = {};
        if (Array.isArray(result.categories) && result.categories.length > 0) {
          result.categories.forEach(c => { catMap[c.categoryName] = true; });
        } else if (Array.isArray(result.testResults)) {
          result.testResults.forEach(item => {
            catMap[item.category || 'General Biochemistry'] = true;
          });
        }
        setExpandedCategories(catMap);
      }
    } catch (err) {
      console.error('[Upload Analysis Error]:', err);
      setUnreadableError("We couldn't clearly read this report. Please upload a higher-quality image or PDF.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleCategory = (catName) => {
    setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const handleSaveToRecords = () => {
    if (!analysisResult) return;

    const mainTest = (analysisResult.testResults && analysisResult.testResults[0]) || 
                     (analysisResult.categories && analysisResult.categories[0] && analysisResult.categories[0].tests && analysisResult.categories[0].tests[0]);

    const summaryText = mainTest 
      ? `${mainTest.testName}: ${mainTest.result} ${mainTest.unit !== 'Not provided' ? mainTest.unit : ''}`.trim()
      : (analysisResult.overallSummary || 'Diagnostic Report');

    const totalCount = analysisResult.totalTestsFound || 
                       (analysisResult.testResults ? analysisResult.testResults.length : 0);

    const hasOut = analysisResult.testResults 
      ? analysisResult.testResults.some(t => t.status !== 'Within range')
      : false;

    const labName = analysisResult.labName || analysisResult.laboratoryName || 'Lab Report';

    addLabReport({
      name: `${labName} (${totalCount} tests)`,
      date: analysisResult.reportDate || new Date().toLocaleDateString('en-GB'),
      result: summaryText,
      status: hasOut ? 'Out of Range' : 'Within Target',
      fullReport: analysisResult,
      extractedData: analysisResult,
      fullPayload: analysisResult
    });

    handleCloseModal();
  };

  const handleViewSavedReport = (report) => {
    const fullData = report.fullReport || report.extractedData || report.fullPayload;

    let payload = null;

    if (fullData && typeof fullData === 'object' && (Array.isArray(fullData.categories) || Array.isArray(fullData.testResults))) {
      payload = fullData;
    } else {
      const cleanLabName = report.name ? report.name.replace(/\s*\(\d+\s*tests\)/i, '').trim() : 'Laboratory Report';
      payload = {
        labName: cleanLabName,
        laboratoryName: cleanLabName,
        patientName: 'Patient',
        reportDate: report.date,
        totalTestsFound: 1,
        overallSummary: report.result || 'Saved Laboratory Record',
        riskAssessment: {
          level: report.status === 'Out of Range' ? 'MODERATE RISK' : 'NORMAL',
          label: report.status === 'Out of Range' ? 'Moderate Risk — Clinical Attention Needed' : 'Low Risk — All Values Within Target Ranges',
          description: report.result || 'Summary of saved test findings.',
          color: report.status === 'Out of Range' ? '#b45309' : '#166534',
          bg: report.status === 'Out of Range' ? '#fffbeb' : '#f0fdf4',
          border: report.status === 'Out of Range' ? '#fde68a' : '#bbf7d0',
          withinRangeCount: report.status === 'Out of Range' ? 0 : 1,
          outOfRangeCount: report.status === 'Out of Range' ? 1 : 0
        },
        categories: [
          {
            categoryName: 'General Biochemistry',
            tests: [
              {
                testName: 'Laboratory Summary Record',
                result: report.result,
                unit: '',
                referenceRange: 'See lab printout',
                status: report.status === 'Out of Range' ? 'Above range' : 'Within range',
                explanation: `Saved diagnostic record: ${report.result}`
              }
            ]
          }
        ],
        testResults: [
          {
            testName: 'Laboratory Summary Record',
            result: report.result,
            unit: '',
            referenceRange: 'See lab printout',
            status: report.status === 'Out of Range' ? 'Above range' : 'Within range',
            category: 'General Biochemistry',
            explanation: `Saved diagnostic record: ${report.result}`
          }
        ]
      };
    }

    setAnalysisResult(payload);
    setIsViewOnly(true);

    const catMap = {};
    if (Array.isArray(payload.categories) && payload.categories.length > 0) {
      payload.categories.forEach(c => { catMap[c.categoryName] = true; });
    } else if (Array.isArray(payload.testResults)) {
      payload.testResults.forEach(t => { catMap[t.category || 'General Biochemistry'] = true; });
    }
    setExpandedCategories(catMap);
    setIsUploadModalOpen(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'Within range' || status === 'Within Target') {
      return (
        <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <CheckCircle2 size={13} />
          <span>Within range</span>
        </span>
      );
    }
    if (status === 'Critical') {
      return (
        <span style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertTriangle size={13} />
          <span>Critical</span>
        </span>
      );
    }
    return (
      <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <AlertTriangle size={13} />
        <span>{status}</span>
      </span>
    );
  };

  // Group results by category
  const groupedResults = {};
  if (analysisResult) {
    if (Array.isArray(analysisResult.categories) && analysisResult.categories.length > 0) {
      analysisResult.categories.forEach(cObj => {
        const cat = cObj.categoryName || 'General Biochemistry';
        groupedResults[cat] = cObj.tests || [];
      });
    } else if (Array.isArray(analysisResult.testResults)) {
      analysisResult.testResults.forEach(item => {
        const cat = item.category || 'General Biochemistry';
        if (!groupedResults[cat]) groupedResults[cat] = [];
        groupedResults[cat].push(item);
      });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header & Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
            Lab Report Reader & Educational Analysis
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Upload digital PDFs or scanned lab reports (PDF, PNG, JPG) to extract exact values, preserve reference ranges, and view educational explanations.
          </p>
        </div>

        <button 
          onClick={() => { setIsViewOnly(false); setAnalysisResult(null); setIsUploadModalOpen(true); }}
          className="btn-primary" 
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', background: 'linear-gradient(135deg, #0284c7, #2563eb)', border: 'none' }}
        >
          <Upload size={17} />
          <span>+ Upload Lab Report</span>
        </button>
      </div>

      {/* UPLOAD & ANALYSIS MODAL */}
      {isUploadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ maxWidth: '780px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '1.6rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                  <FileText size={18} color="#0284c7" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {isViewOnly ? 'Saved Laboratory Report Details' : 'Laboratory Report Extraction & Reader'}
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {isViewOnly ? 'Reviewing saved diagnostic findings and test values.' : 'Supports digital PDFs and scanned PNG/JPG reports. Exact extraction with laboratory reference range preservation.'}
                </p>
              </div>
              <button onClick={handleCloseModal} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '50%', padding: '0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            {/* STEP 1: FILE PICKER */}
            {!analysisResult && !isAnalyzing && !isViewOnly && (
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2.5rem 1rem', textAlign: 'center', background: '#f8fafc', marginBottom: '1rem' }}>
                <Upload size={34} color="#0284c7" style={{ marginBottom: '0.6rem' }} />
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Select Laboratory Report Document</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>Supports PDF, PNG, JPG, JPEG (Max 15MB)</div>
                <input 
                  type="file" 
                  accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  id="lab-report-file" 
                />
                <label htmlFor="lab-report-file" className="btn-primary" style={{ display: 'inline-flex', padding: '0.65rem 1.45rem', cursor: 'pointer', background: '#0284c7', borderRadius: '8px', fontSize: '0.88rem' }}>
                  Select File from Device
                </label>
              </div>
            )}

            {/* UNREADABLE / QUALITY ERROR BANNER */}
            {unreadableError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1.1rem', color: '#991b1b', textAlign: 'center', marginBottom: '1rem' }}>
                <ShieldAlert size={28} style={{ margin: '0 auto 0.4rem auto', color: '#dc2626' }} />
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Document Reading Error</div>
                <p style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>{unreadableError}</p>
                <button 
                  onClick={() => { setUnreadableError(''); setSelectedFile(null); }} 
                  className="btn-outline" 
                  style={{ marginTop: '0.85rem', borderColor: '#fca5a5', color: '#991b1b', fontSize: '0.8rem' }}
                >
                  Try Uploading Another File
                </button>
              </div>
            )}

            {/* ANALYZING IN PROGRESS */}
            {isAnalyzing && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '3rem 1rem' }}>
                <RefreshCw size={32} color="#0284c7" className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Reading & Analyzing Laboratory Report...</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Extracting exact numbers, units, and stated laboratory reference ranges.</div>
              </div>
            )}

            {/* STEP 2: PARSED REPORT REVIEW & PATIENT EXPLANATION */}
            {analysisResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Essential Report Details & Patient Risk Assessment Header Card */}
                <div style={{ background: '#ffffff', padding: '1.1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.85rem' }}>
                    <div>
                      <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', tracking: '0.05em', color: '#64748b', fontWeight: 700 }}>Essential Report Details</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{analysisResult.labName || analysisResult.laboratoryName}</div>
                      <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <span>Patient: <strong>{analysisResult.patientName || 'Patient'}</strong></span>
                        <span>Date: <strong>{analysisResult.reportDate}</strong></span>
                        <span>Tests Extracted: <strong>{analysisResult.totalTestsFound || (analysisResult.testResults ? analysisResult.testResults.length : 0)}</strong></span>
                      </div>
                    </div>

                    {/* Patient Risk Level Badge */}
                    {analysisResult.riskAssessment && (
                      <div style={{ background: analysisResult.riskAssessment.bg, border: `1px solid ${analysisResult.riskAssessment.border}`, padding: '0.5rem 0.85rem', borderRadius: '8px', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: analysisResult.riskAssessment.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Patient Risk Assessment
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 900, color: analysisResult.riskAssessment.color, marginTop: '0.1rem' }}>
                          {analysisResult.riskAssessment.level}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Level Description & Breakdown Pill */}
                  {analysisResult.riskAssessment && (
                    <div style={{ background: analysisResult.riskAssessment.bg, border: `1px solid ${analysisResult.riskAssessment.border}`, padding: '0.75rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', color: analysisResult.riskAssessment.color, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                      <div style={{ fontWeight: 600 }}>{analysisResult.riskAssessment.label} — {analysisResult.riskAssessment.description}</div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.76rem', fontWeight: 800 }}>
                        <span style={{ background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }}>
                          {analysisResult.riskAssessment.withinRangeCount} Within Range
                        </span>
                        {analysisResult.riskAssessment.outOfRangeCount > 0 && (
                          <span style={{ background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', color: '#dc2626' }}>
                            {analysisResult.riskAssessment.outOfRangeCount} Out of Range
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {analysisResult.imageSrc && (
                      <button 
                        type="button" 
                        onClick={() => setShowOriginalDoc(!showOriginalDoc)} 
                        className="btn-outline" 
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderColor: '#cbd5e1' }}
                      >
                        <Eye size={14} />
                        <span>{showOriginalDoc ? 'Hide Original Document' : 'View Original Report'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* OVERALL REPORT SUMMARY BANNER */}
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.85rem 1rem', borderRadius: '10px', color: '#0369a1', fontSize: '0.84rem', lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FileCheck size={16} />
                    <span>Overall Clinical Summary</span>
                  </div>
                  <div>{analysisResult.overallSummary}</div>
                </div>

                {/* OPTIONAL ORIGINAL DOCUMENT VIEWER */}
                {showOriginalDoc && analysisResult.imageSrc && (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem', background: '#0f172a', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 700 }}>ORIGINAL UPLOADED REPORT PREVIEW</div>
                    <img src={analysisResult.imageSrc} alt="Original Report" style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '6px', objectFit: 'contain' }} />
                  </div>
                )}

                {/* CATEGORIZED TEST RESULTS TABLES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Extracted Results & Stated Reference Ranges
                  </div>

                  {Object.keys(groupedResults).map(categoryName => (
                    <div key={categoryName} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                      
                      {/* Category Header */}
                      <div 
                        onClick={() => toggleCategory(categoryName)}
                        style={{ background: '#f8fafc', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: expandedCategories[categoryName] ? '1px solid #e2e8f0' : 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                          <Layers size={16} color="#0284c7" />
                          <span>{categoryName}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>({groupedResults[categoryName].length} tests)</span>
                        </div>
                        {expandedCategories[categoryName] ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                      </div>

                      {/* Category Table & Patient Explanations */}
                      {expandedCategories[categoryName] && (
                        <div style={{ padding: '0.75rem 1rem', background: '#ffffff' }}>
                          
                          <div style={{ overflowX: 'auto', marginBottom: '0.85rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                              <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: '#fafafa' }}>
                                  <th style={{ padding: '0.55rem', color: '#475569', fontWeight: 700 }}>TEST</th>
                                  <th style={{ padding: '0.55rem', color: '#475569', fontWeight: 700 }}>RESULT</th>
                                  <th style={{ padding: '0.55rem', color: '#475569', fontWeight: 700 }}>UNIT</th>
                                  <th style={{ padding: '0.55rem', color: '#475569', fontWeight: 700 }}>STATED REFERENCE RANGE</th>
                                  <th style={{ padding: '0.55rem', color: '#475569', fontWeight: 700 }}>STATUS</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupedResults[categoryName].map((testItem, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.65rem 0.55rem', fontWeight: 800, color: '#0f172a' }}>{testItem.testName}</td>
                                    <td style={{ padding: '0.65rem 0.55rem', fontWeight: 800, color: '#0284c7', fontSize: '0.95rem' }}>{testItem.result}</td>
                                    <td style={{ padding: '0.65rem 0.55rem', color: '#64748b' }}>{testItem.unit}</td>
                                    <td style={{ padding: '0.65rem 0.55rem', color: '#334155', fontWeight: 600 }}>{testItem.referenceRange}</td>
                                    <td style={{ padding: '0.65rem 0.55rem' }}>{getStatusBadge(testItem.status)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Patient Friendly Explanations Cards */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {groupedResults[categoryName].map((testItem, idx) => (
                              <div key={idx} style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid #0284c7', fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                                <strong style={{ color: '#0f172a' }}>{testItem.testName}:</strong> {testItem.explanation || `Reported value is ${testItem.result}`}
                              </div>
                            ))}
                          </div>

                        </div>
                      )}

                    </div>
                  ))}
                </div>

                {/* SAFETY & MEDICAL DISCLAIMER */}
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.85rem 1rem', borderRadius: '10px', color: '#92400e', fontSize: '0.78rem', lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#b45309', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Info size={15} />
                    <span>Important Clinical Safety Notice</span>
                  </div>
                  <div>{analysisResult.disclaimer || 'This information is provided to help you understand your laboratory report and is not a medical diagnosis.'}</div>
                </div>

                {/* MODAL ACTION BUTTONS */}
                <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                  {isViewOnly ? (
                    <button type="button" onClick={handleCloseModal} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#0284c7', padding: '0.65rem' }}>
                      Close Details
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => setAnalysisResult(null)} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}>
                        Upload Different Report
                      </button>
                      <button type="button" onClick={handleSaveToRecords} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#0284c7', padding: '0.65rem' }}>
                        <CheckCircle2 size={16} />
                        <span>Save Report to Health Records</span>
                      </button>
                    </>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* RECORDED LAB REPORTS TABLE */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
          Saved Laboratory Test Records
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>REPORT NAME</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>REPORT DATE</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>TEST SUMMARY</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {labReports.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No saved laboratory test records found. Click "+ Upload Lab Report" to add your first report.
                  </td>
                </tr>
              ) : (
                labReports.map((report) => (
                  <tr 
                    key={report.id} 
                    onClick={() => handleViewSavedReport(report)}
                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} color="#0284c7" />
                      <span>{report.name}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{report.date}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0284c7' }}>{report.result}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {getStatusBadge(report.status)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleViewSavedReport(report); }} 
                          className="btn-outline" 
                          style={{ fontSize: '0.76rem', padding: '0.25rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          title="View full report details"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteLabReport(report.id); }} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)', padding: '0.35rem', borderRadius: '4px' }}
                          title="Delete report"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
