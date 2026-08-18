import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Upload, X } from 'lucide-react';

export const LabReportsPage = () => {
  const { labReports, addLabReport } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportName, setReportName] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [result, setResult] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    if (!reportName) {
      setReportName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reportName) return;

    addLabReport({
      name: reportName,
      date,
      result: result || (fileName ? `Attached: ${fileName}` : 'Within Target'),
      status: 'Within Target'
    });

    setReportName('');
    setResult('');
    setFileName('');
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
            Lab Reports
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Upload and view your lab test reports.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary" 
          style={{ padding: '0.7rem 1.25rem', fontSize: '0.9rem' }}
        >
          <Upload size={17} />
          <span>+ Upload lab report</span>
        </button>
      </div>

      {/* Upload Lab Report Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '1.5rem', background: 'var(--bg-secondary)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Upload lab report
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Select Lab Document (PDF or Image)</label>
                <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} style={{ fontSize: '0.82rem' }} />
                {fileName && <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: '0.25rem' }}>Selected: {fileName}</div>}
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Report Name</label>
                <input type="text" required value={reportName} onChange={e => setReportName(e.target.value)} placeholder="e.g. HbA1c Lab Report" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Report Date</label>
                  <input type="text" required value={date} onChange={e => setDate(e.target.value)} placeholder="e.g. 18 Aug 2026" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Test Result</label>
                  <input type="text" required value={result} onChange={e => setResult(e.target.value)} placeholder="e.g. 6.5%" style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lab Reports Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Lab test results
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Report Name</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Result</th>
                <th style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {labReports.map((report) => (
                <tr key={report.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--primary-color)" />
                    <span>{report.name}</span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{report.date}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{report.result}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                    <span className="badge badge-success">{report.status}</span>
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
