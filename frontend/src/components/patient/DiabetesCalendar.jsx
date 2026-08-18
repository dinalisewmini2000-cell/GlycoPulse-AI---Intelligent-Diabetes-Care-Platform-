import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar as CalendarIcon, Stethoscope, PlusCircle, CheckCircle2, 
  Sparkles, Clock, FileText, AlertCircle, Bookmark, Award
} from 'lucide-react';
import { analyzeDoctorResultsWithGemini } from '../../services/geminiCalendarService';

export const DiabetesCalendar = () => {
  const { currentUser, addHealthHistoryLog } = useApp();

  // Marked Measurement Dates State
  const [markedDates, setMarkedDates] = useState(() => {
    const saved = localStorage.getItem('glycopulse_calendar_dates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 'c-1', date: '2026-08-18', category: 'Fasting Sugar Check', notes: 'Fasting reading 115 mg/dL', status: 'Completed' },
      { id: 'c-2', date: '2026-08-15', category: 'HbA1c Lab Test', notes: 'Quarterly blood draw at General Lab', status: 'Completed' },
      { id: 'c-3', date: '2026-08-10', category: 'Doctor Consultation', notes: 'Routine diabetes checkup with Dr. Perera', status: 'Completed' }
    ];
  });

  // Saved Doctor Visit Reports State
  const [doctorVisits, setDoctorVisits] = useState(() => {
    const saved = localStorage.getItem('glycopulse_doctor_visits');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'dv-1',
        doctorName: 'Dr. Kasun Perera (Endocrinologist)',
        visitDate: '2026-08-10',
        targetRange: '80-140 mg/dL',
        nextVisitDate: '2026-11-10',
        doctorNotes: 'HbA1c test result was 6.5%. Excellent glycemic control. Maintained Metformin 500mg BD. Recommended 30 mins brisk walking daily.',
        aiAnalysis: {
          summary: 'Doctor visit on Aug 10 confirmed HbA1c of 6.5% with optimal glycemic stability.',
          actionSteps: ['Maintain current Metformin dosage', 'Continue 30 min daily walking', 'Keep logging fasting glucose'],
          reminders: ['Next doctor visit: Nov 10, 2026', 'Target range: 80-140 mg/dL'],
          glycemicGoalStatus: 'Target Met'
        }
      }
    ];
  });

  // Mark Measurement Date Form State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [measurementCategory, setMeasurementCategory] = useState('Fasting Sugar Check');
  const [dateNotes, setDateNotes] = useState('');

  // Log Doctor Results Form State
  const [doctorName, setDoctorName] = useState('Dr. Kasun Perera');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetRange, setTargetRange] = useState('70-140 mg/dL');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);

  const handleMarkDateSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: 'c-' + Date.now(),
      date: selectedDate,
      category: measurementCategory,
      notes: dateNotes || 'Measurement marked on calendar',
      status: 'Marked'
    };

    const updated = [newEntry, ...markedDates];
    setMarkedDates(updated);
    localStorage.setItem('glycopulse_calendar_dates', JSON.stringify(updated));

    addHealthHistoryLog({
      category: 'Calendar Measurement',
      value: measurementCategory,
      status: 'Marked',
      notes: `Date: ${selectedDate} — ${dateNotes || 'No notes'}`
    });

    setDateNotes('');
  };

  const handleDoctorResultSubmit = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);

    const payload = {
      doctorName,
      visitDate,
      targetRange,
      nextVisitDate: nextVisitDate || 'In 3 Months',
      doctorNotes
    };

    const aiResult = await analyzeDoctorResultsWithGemini(payload);

    const newVisitRecord = {
      id: 'dv-' + Date.now(),
      ...payload,
      aiAnalysis: aiResult
    };

    const updatedVisits = [newVisitRecord, ...doctorVisits];
    setDoctorVisits(updatedVisits);
    localStorage.setItem('glycopulse_doctor_visits', JSON.stringify(updatedVisits));

    // Also mark doctor visit date on measurement calendar
    const calendarEntry = {
      id: 'c-' + Date.now(),
      date: visitDate,
      category: 'Doctor Consultation Result',
      notes: `${doctorName}: ${doctorNotes.slice(0, 60)}...`,
      status: 'Completed'
    };
    const updatedDates = [calendarEntry, ...markedDates];
    setMarkedDates(updatedDates);
    localStorage.setItem('glycopulse_calendar_dates', JSON.stringify(updatedDates));

    addHealthHistoryLog({
      category: 'Doctor Consultation',
      value: doctorName,
      status: 'Result Recorded',
      notes: `Date: ${visitDate} — ${doctorNotes}`
    });

    setActiveAnalysis(aiResult);
    setIsAnalyzing(false);
    setDoctorNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <CalendarIcon size={24} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Diabetes Measurement Calendar & Doctor Consultation Log
          </h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Mark your measurement dates, record doctor consultation feedback after visits, and receive Gemini AI clinical reminders.
        </p>
      </div>

      {/* Main Grid: Left Column = Mark Date & Log Results | Right Column = Gemini AI Advice & History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* 1. Mark Measurement Date Form */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Bookmark size={18} color="var(--primary-color)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Mark Diabetes Measurement Date
            </h3>
          </div>

          <form onSubmit={handleMarkDateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Measurement Date
              </label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Measurement Type
              </label>
              <select 
                value={measurementCategory}
                onChange={e => setMeasurementCategory(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Fasting Sugar Check">Fasting Sugar Check</option>
                <option value="Post-Meal Sugar Check">Post-Meal Sugar Check</option>
                <option value="HbA1c Lab Test">HbA1c Lab Test</option>
                <option value="Doctor Consultation">Doctor Consultation Visit</option>
                <option value="Insulin Dose Adjustment">Insulin Dose Adjustment</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Notes / Measured Value
              </label>
              <input 
                type="text" 
                placeholder="e.g. Fasting result 110 mg/dL or Lab check"
                value={dateNotes}
                onChange={e => setDateNotes(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.2rem' }}>
              <PlusCircle size={15} />
              <span>Mark Date on Calendar</span>
            </button>
          </form>
        </div>

        {/* 2. Log Doctor Consultation Results Form */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Stethoscope size={18} color="var(--accent-teal)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Log Doctor Consultation Results
            </h3>
          </div>

          <form onSubmit={handleDoctorResultSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Doctor Name
                </label>
                <input 
                  type="text" 
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Kasun Perera"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Visit Date
                </label>
                <input 
                  type="date" 
                  value={visitDate}
                  onChange={e => setVisitDate(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Target Range
                </label>
                <input 
                  type="text" 
                  value={targetRange}
                  onChange={e => setTargetRange(e.target.value)}
                  placeholder="e.g. 70-140 mg/dL"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Next Visit Date
                </label>
                <input 
                  type="date" 
                  value={nextVisitDate}
                  onChange={e => setNextVisitDate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Doctor Advice & Test Results
              </label>
              <textarea 
                rows="3"
                required
                placeholder="Type the advice/results from your doctor visit (e.g. HbA1c was 6.5%, doctor increased Metformin to 500mg BD, recommended 30 min daily walk)"
                value={doctorNotes}
                onChange={e => setDoctorNotes(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={isAnalyzing} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-teal)' }}>
              <Sparkles size={15} />
              <span>{isAnalyzing ? 'Analyzing with Gemini AI...' : 'Save & Analyze with Gemini AI'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Gemini AI Clinical Guidance Box (Displays when doctor results are analyzed) */}
      {(activeAnalysis || (doctorVisits.length > 0 && doctorVisits[0].aiAnalysis)) && (() => {
        const analysis = activeAnalysis || doctorVisits[0].aiAnalysis;
        return (
          <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary-color)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Sparkles size={18} color="var(--primary-color)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Gemini AI Calendar Clinical Summary
              </h3>
              <span className={`badge ${analysis.glycemicGoalStatus === 'Target Met' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: 'auto' }}>
                {analysis.glycemicGoalStatus}
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
              {analysis.summary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Recommended Action Steps
                </h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {(analysis.actionSteps || []).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Calendar Reminders
                </h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--primary-color)', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontWeight: 600 }}>
                  {(analysis.reminders || []).map((rem, idx) => (
                    <li key={idx}>{rem}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. Marked Measurement Dates Calendar Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
          Marked Diabetes Measurement Dates
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Measurement Category</th>
                <th>Notes / Values</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {markedDates.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{item.date}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.category}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.notes}</td>
                  <td>
                    <span className="badge badge-success">{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Doctor Visit Results Log History */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
          Recorded Doctor Visit Results & Prescriptions
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {doctorVisits.map(visit => (
            <div key={visit.id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {visit.doctorName}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Visit Date: {visit.visitDate} | Next: {visit.nextVisitDate}
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                <strong>Results & Advice:</strong> "{visit.doctorNotes}"
              </p>

              {visit.aiAnalysis && (
                <div style={{ fontSize: '0.78rem', color: 'var(--primary-color)', background: 'var(--primary-light)', padding: '0.4rem 0.65rem', borderRadius: '4px', fontWeight: 600 }}>
                  ✨ Gemini Summary: {visit.aiAnalysis.summary}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
