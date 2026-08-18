import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

export const AIChatWidget = () => {
  const { role, currentUser, currentGlucose, glucoseLogs, iobUnits: iob = 0, cobGrams: cob = 0 } = useApp();
  
  // Show 24/7 AI Chatbot exclusively for Patient accounts
  if (role !== 'patient') return null;

  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Patient';
  const hasLogs = glucoseLogs && glucoseLogs.length > 0;
  const latestVal = hasLogs ? (glucoseLogs[0]?.value || currentGlucose) : null;

  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: `Hello ${userName}! I am your 24/7 AI Diabetes Health Assistant. How can I help you manage your glycemic health today?` 
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Update initial message if user changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'ai') {
      setMessages([
        { 
          sender: 'ai', 
          text: `Hello ${userName}! I am your 24/7 AI Diabetes Health Assistant. How can I help you manage your glycemic health today?` 
        }
      ]);
    }
  }, [userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'How am I doing today?',
    'Explain my HbA1c estimate',
    'What to eat during low blood sugar?',
    'How does sleep affect glucose?'
  ];

  const generateAiReply = (rawQuery) => {
    const q = rawQuery.toLowerCase().trim();

    // 1. Greetings
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|hihhi|sup|howdy)$/i.test(q) || q.startsWith('hi ') || q.startsWith('hello ')) {
      if (!hasLogs) {
        return `Hello ${userName}! 👋 How are you feeling today? You haven't recorded any blood sugar readings yet. Log your first reading under 'Blood Glucose & CGM' so I can analyze your health!`;
      }
      const statusStr = latestVal < 70 ? 'Low Warning' : latestVal > 180 ? 'Elevated' : 'Optimal Target';
      return `Hello ${userName}! 👋 How are you feeling today? Your latest logged glucose reading is ${latestVal} mg/dL (${statusStr}). How can I assist with your diabetes care today?`;
    }

    // 2. Status / Glucose check
    if (q.includes('how am i') || q.includes('my glucose') || q.includes('my level') || q.includes('my sugar') || q.includes('status') || q.includes('reading')) {
      if (!hasLogs) {
        return `You have not recorded any blood glucose readings yet, ${userName}! 📋\n\nPlease log your blood sugar reading under 'Blood Glucose & CGM' so I can give you an accurate analysis of your glycemic condition.`;
      }

      const targetState = latestVal >= 70 && latestVal <= 180 
        ? '🌟 You are currently in your optimal target glycemic range (70-180 mg/dL)!'
        : latestVal < 70 
        ? '⚠️ Caution: Your latest reading is below 70 mg/dL. Follow the 15-15 rule and consume fast-acting carbs!'
        : '📈 Your latest reading is elevated (>180 mg/dL). Check your active insulin (IOB) or consult your physician.';

      return `Your latest recorded glucose reading is ${latestVal} mg/dL.\nActive Insulin (IOB): ${iob} U | Carbs on Board (COB): ${cob} g.\n\n${targetState}`;
    }

    // 3. HbA1c & Lab Analysis
    if (q.includes('hba1c') || q.includes('a1c') || q.includes('lab') || q.includes('egfr') || q.includes('test')) {
      if (hasLogs) {
        const sum = glucoseLogs.reduce((acc, l) => acc + (l.value || 118), 0);
        const mean = Math.round(sum / glucoseLogs.length);
        const estA1c = (3.31 + 0.02392 * mean).toFixed(1);
        return `Based on your ${glucoseLogs.length} logged glucose reading(s):\n• Mean Glucose: ${mean} mg/dL\n• Estimated HbA1c (GMI): ${estA1c}%\n\nUpload your full diagnostic PDF under 'Lab OCR & Reports' to parse exact renal & lipid biomarkers!`;
      }
      return `No blood sugar readings recorded yet.\n\nTo view your personalized HbA1c estimate, log your readings under 'Blood Glucose & CGM' or upload a diagnostic PDF report under 'Lab OCR & Reports'.`;
    }

    // 4. Hypoglycemia / Low Blood Sugar
    if (q.includes('low') || q.includes('hypo') || q.includes('shaky') || q.includes('sweat') || q.includes('dizzy')) {
      return `🚨 For low blood sugar (< 70 mg/dL), follow the 15-15 Rule:\n1. Consume 15g fast-acting carbs (e.g., 4 oz fruit juice, 3-4 glucose tablets, or 1 tbsp honey).\n2. Wait 15 minutes and re-check your blood glucose.\n3. Repeat if still < 70 mg/dL.\n\nIf severe hypo symptoms persist, contact emergency services immediately!`;
    }

    // 5. Hyperglycemia / High Blood Sugar
    if (q.includes('high') || q.includes('hyper') || q.includes('spike') || q.includes('thirsty') || q.includes('ketone')) {
      return `📈 For elevated blood sugar (> 180 mg/dL):\n1. Check your Active Insulin on Board (IOB: ${iob}U) to avoid insulin stacking.\n2. Hydrate with plenty of water to assist renal clearance.\n3. If blood sugar exceeds 250 mg/dL, check for ketones and consult your medical practitioner.`;
    }

    // 6. Food / Meals / Carbs
    if (q.includes('food') || q.includes('meal') || q.includes('eat') || q.includes('carb') || q.includes('diet') || q.includes('lunch') || q.includes('dinner') || q.includes('breakfast')) {
      return `🥗 Low-GI Meal Guidance:\n• Prioritize complex carbs with high dietary fiber paired with lean protein.\n• Fiber slows gastric emptying, preventing post-prandial sugar spikes.\n• Use the 'AI Food Vision' tab to scan your plate and calculate exact carb ratios!`;
    }

    // 7. Insulin & Medication
    if (q.includes('insulin') || q.includes('bolus') || q.includes('basal') || q.includes('dose') || q.includes('medication')) {
      return `💉 Medication & Insulin Protocol:\n• Always consult your physician for individualized insulin-to-carb ratios and correction factors.\n• Check active IOB (${iob}U) before administering additional boluses.\n• Rotate injection sites to prevent lipohypertrophy. View 'E-Prescriptions' under the Doctor Portal for active prescriptions.`;
    }

    // 8. Exercise & Fitness
    if (q.includes('exercise') || q.includes('walk') || q.includes('workout') || q.includes('gym') || q.includes('running') || q.includes('fitness')) {
      return `🏃 Exercise & Glucose Sensitivity:\nPhysical movement stimulates GLUT-4 receptors in muscle tissue, enabling glucose uptake.\nA light 15-20 minute walk after meals can reduce peak sugar spikes by up to 25-40 mg/dL!`;
    }

    // 9. Sleep & Stress
    if (q.includes('sleep') || q.includes('stress') || q.includes('tired') || q.includes('cortisol') || q.includes('dawn')) {
      return `🌙 Sleep & Cortisol Impact:\nHigh stress or poor sleep triggers cortisol and epinephrine surges, inducing transient insulin resistance.\nTry the interactive 4-7-8 Breathing Guide under 'Fitness & Sleep' to relax!`;
    }

    // 10. Doctor / Telehealth
    if (q.includes('doctor') || q.includes('dr') || q.includes('appointment') || q.includes('consultation')) {
      return `👨‍⚕️ Tele-Health & Clinical Care:\n• You are connected to GlycoPulse Healthcare Network.\n• Your recorded logs are available for clinical review by your medical practitioner.\n• To request a consultation, switch to or contact your physician via the Doctor View!`;
    }

    // 11. Gratitude
    if (q.includes('thank') || q.includes('thanks') || q.includes('great') || q.includes('awesome') || q.includes('good bot')) {
      return `You are very welcome, ${userName}! 😊 I am always here 24/7 to assist with your glucose monitoring, meal logging, and health questions. Have a wonderful day!`;
    }

    // 12. Intelligent Smart Fallback
    const statusMsg = hasLogs ? `Your latest glucose reading is ${latestVal} mg/dL.` : 'You have no blood glucose logs recorded yet.';
    return `I am your AI Clinical Companion, ${userName}! 🤖\n\nI can help you with:\n• Live glucose telemetry & HbA1c breakdown\n• Insulin bolus & carb ratio calculations\n• Low/High blood sugar emergency steps\n• Meal guidance & Lab report explanations\n\n${statusMsg} What would you like to explore?`;
  };

  const handleSend = (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userEntry = { sender: 'user', text: query };
    setMessages(prev => [...prev, userEntry]);
    setInputMsg('');

    setTimeout(() => {
      const reply = generateAiReply(query);
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 350);
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999 }}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn-glow" 
          style={{ 
            borderRadius: '50%', width: '56px', height: '56px', padding: 0, 
            justifyContent: 'center', boxShadow: 'var(--shadow-lg)'
          }}
          title="Open AI Assistant"
        >
          <MessageSquare size={24} />
        </button>
      ) : (
        <div className="glass-panel" style={{ width: '380px', height: '520px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          
          {/* Header */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>AI Health Assistant</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Active • 24/7 Clinical Support</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'var(--bg-primary)' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: '12px', 
                  fontSize: '0.85rem', lineHeight: '1.45', whiteSpace: 'pre-line',
                  background: m.sender === 'user' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                  border: m.sender === 'ai' ? '1px solid var(--border-color)' : 'none'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div style={{ padding: '0.5rem 0.8rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
            {quickPrompts.map((p, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSend(p)}
                style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', padding: '0.35rem 0.65rem', borderRadius: '10px', background: 'var(--bg-primary)', color: 'var(--accent-cyan-light)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 600 }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <input 
              type="text" 
              value={inputMsg} 
              onChange={e => setInputMsg(e.target.value)} 
              placeholder="Ask about glucose, meals, or insulin..." 
              style={{ flex: 1, padding: '0.6rem 0.9rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 0.9rem' }}>
              <Send size={16} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
