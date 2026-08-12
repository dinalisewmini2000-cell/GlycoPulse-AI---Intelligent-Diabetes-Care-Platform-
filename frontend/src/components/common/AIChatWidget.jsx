import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

export const AIChatWidget = () => {
  const { role, currentUser, currentGlucose, glucoseLogs, iobUnits: iob = 1.4, cobGrams: cob = 18 } = useApp();
  
  if (role === 'admin') return null;

  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Patient';

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
    'Explain my HbA1c of 6.3%',
    'What to eat during low blood sugar?',
    'How does sleep affect glucose?'
  ];

  const generateAiReply = (rawQuery) => {
    const q = rawQuery.toLowerCase().trim();

    // 1. Greetings
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|hihhi|sup|howdy)$/i.test(q) || q.startsWith('hi ') || q.startsWith('hello ')) {
      const statusStr = currentGlucose < 70 ? 'Low Warning' : currentGlucose > 180 ? 'Elevated' : 'Optimal Target';
      return `Hello ${userName}! 👋 How are you feeling today? Your live glucose is currently ${currentGlucose} mg/dL (${statusStr}). How can I assist with your diabetes care or meal planning today?`;
    }

    // 2. Status / Glucose check
    if (q.includes('how am i') || q.includes('my glucose') || q.includes('my level') || q.includes('my sugar') || q.includes('status') || q.includes('reading')) {
      const targetState = currentGlucose >= 70 && currentGlucose <= 180 
        ? '🌟 You are currently in your optimal target glycemic range (70-180 mg/dL)!'
        : currentGlucose < 70 
        ? '⚠️ Caution: Your glucose level is below 70 mg/dL. Please follow the 15-15 rule and consume fast-acting carbs!'
        : '📈 Your glucose level is elevated (>180 mg/dL). Consider checking your active insulin (IOB) or taking a correction dose as prescribed by your doctor.';

      return `Your latest glucose reading is ${currentGlucose} mg/dL.\nActive Insulin (IOB): ${iob} U | Carbs on Board (COB): ${cob} g.\n\n${targetState}`;
    }

    // 3. HbA1c & Lab OCR
    if (q.includes('hba1c') || q.includes('a1c') || q.includes('lab') || q.includes('egfr') || q.includes('test')) {
      return `Your current estimated HbA1c is 6.3%, corresponding to an Estimated Average Glucose (eAG) of ~134 mg/dL.\n\nKey Lab Biomarkers:\n• Fasting Plasma Glucose: 108 mg/dL\n• Kidney eGFR: 94 mL/min/1.73m² (Normal renal filtration)\n• Microalbuminuria: 12 mg/g (Zero nephropathy risk)`;
    }

    // 4. Hypoglycemia / Low Blood Sugar
    if (q.includes('low') || q.includes('hypo') || q.includes('shaky') || q.includes('sweat') || q.includes('dizzy')) {
      return `🚨 For low blood sugar (< 70 mg/dL), follow the 15-15 Rule:\n1. Eat/drink 15g fast-acting carbs (e.g., 4 oz fruit juice, 3-4 glucose tablets, or 1 tbsp honey).\n2. Wait 15 minutes and re-check your blood glucose.\n3. Repeat if still < 70 mg/dL.\n\nIf you feel faint or severe hypo symptoms persist, click the red 'SOS EMERGENCY' button at the top of the screen immediately!`;
    }

    // 5. Hyperglycemia / High Blood Sugar
    if (q.includes('high') || q.includes('hyper') || q.includes('spike') || q.includes('thirsty') || q.includes('ketone')) {
      return `📈 For elevated blood sugar (> 180 mg/dL):\n1. Check your Active Insulin on Board (IOB: ${iob}U) to avoid insulin stacking.\n2. Hydrate with plenty of water to help your kidneys clear glucose.\n3. If blood sugar is over 250 mg/dL, check for urine/blood ketones and contact Dr. Robert Vance.`;
    }

    // 6. Food / Meals / Carbs
    if (q.includes('food') || q.includes('meal') || q.includes('eat') || q.includes('carb') || q.includes('diet') || q.includes('lunch') || q.includes('dinner') || q.includes('breakfast')) {
      return `🥗 Nutritious Low-GI Meal Advice:\n• Prioritize complex carbs with high dietary fiber (quinoa, brown rice, steel-cut oats) paired with lean protein.\n• Fiber slows gastric emptying, preventing sharp post-meal sugar spikes.\n• Use the AI Food Vision tab to scan your plate and calculate exact carb ratios!`;
    }

    // 7. Insulin & Medication
    if (q.includes('insulin') || q.includes('bolus') || q.includes('basal') || q.includes('lantus') || q.includes('novolog') || q.includes('dose') || q.includes('medication')) {
      return `💉 Medication & Insulin Guidelines:\n• Rapid Insulin (Novolog): Ratio 1:10g Carbs.\n• Basal Insulin (Lantus): 18 Units nightly at 10:00 PM.\n• Metformin: 500mg twice daily with meals.\n\nAlways rotate injection sites to prevent lipohypertrophy. Use the Doctor Portal if you need an updated e-Prescription.`;
    }

    // 8. Exercise & Fitness
    if (q.includes('exercise') || q.includes('walk') || q.includes('workout') || q.includes('gym') || q.includes('running') || q.includes('fitness')) {
      return `🏃 Exercise & Insulin Sensitivity:\nPhysical movement stimulates GLUT-4 receptors in muscle tissue, allowing glucose uptake without extra insulin.\nA light 15-20 minute walk after meals can reduce peak post-prandial glucose spikes by up to 25-40 mg/dL!`;
    }

    // 9. Sleep & Stress
    if (q.includes('sleep') || q.includes('stress') || q.includes('tired') || q.includes('cortisol') || q.includes('dawn')) {
      return `🌙 Sleep & Cortisol Impact:\nPoor sleep or high stress triggers cortisol and epinephrine surges, inducing insulin resistance and the morning 'Dawn Phenomenon'.\nTry the interactive 4-7-8 Breathing Guide under Fitness & Sleep to calm your vagal tone!`;
    }

    // 10. Doctor / Telehealth
    if (q.includes('doctor') || q.includes('dr') || q.includes('vance') || q.includes('appointment') || q.includes('consultation')) {
      return `👨‍⚕️ Tele-Health & Clinical Oversight:\nYour primary endocrinologist is Dr. Robert Vance, MD.\n• Next Scheduled Review: In 14 days\n• E-Prescriptions: Active\n• You can request a live video consultation through the Doctor View tab at the top!`;
    }

    // 11. Gratitude
    if (q.includes('thank') || q.includes('thanks') || q.includes('great') || q.includes('awesome') || q.includes('good bot')) {
      return `You are very welcome, ${userName}! 😊 I am always here 24/7 to assist with your glucose monitoring, meal logging, and health questions. Have a wonderful day!`;
    }

    // 12. Intelligent Smart Fallback
    return `I am your AI Clinical Companion, ${userName}! 🤖\n\nI can help you with:\n• Live glucose telemetry & HbA1c breakdown\n• Insulin bolus & carb ratio calculations\n• Low/High blood sugar emergency steps\n• Meal guidance & Lab report explanations\n\nYour current glucose is ${currentGlucose} mg/dL. What would you like to explore?`;
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
    }, 450);
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999 }}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn-glow" 
          style={{ 
            borderRadius: '50%', width: '60px', height: '60px', padding: 0, 
            justifyContent: 'center', boxShadow: '0 8px 25px rgba(6, 182, 212, 0.5)' 
          }}
        >
          <MessageSquare size={26} />
        </button>
      ) : (
        <div className="glass-panel" style={{ width: '390px', height: '540px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
          
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)', padding: '1rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Bot size={22} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>24/7 AI Health Assistant</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>GlycoPulse Clinical Coach • Active</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={20} />
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
                  color: m.sender === 'user' ? '#fff' : 'var(--text-main)',
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
                style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', padding: '0.35rem 0.65rem', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', cursor: 'pointer', fontWeight: 600 }}
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
            <button type="submit" className="btn-glow" style={{ padding: '0.6rem 0.9rem' }}>
              <Send size={16} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
