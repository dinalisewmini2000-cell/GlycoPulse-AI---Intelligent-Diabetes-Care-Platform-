import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export const AIChatWidget = () => {
  const { currentUser, glucoseLogs } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Patient';
  const latestLog = glucoseLogs && glucoseLogs.length > 0 ? glucoseLogs[0] : null;

  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: `Hello ${userName}! I am your Health AI Assistant. Ask me any general questions about diabetes management, meal choices, or blood glucose tracking.` 
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const generateAiReply = (rawQuery) => {
    const q = rawQuery.toLowerCase().trim();

    if (q.includes('low') || q.includes('hypo') || q.includes('shaky')) {
      return `For low blood sugar (< 70 mg/dL), follow the 15-15 Rule:\n1. Consume 15g fast-acting carbs (e.g. 4 oz fruit juice or 3-4 glucose tablets).\n2. Wait 15 minutes and re-check your blood glucose.\n3. Repeat if still below 70 mg/dL.`;
    }

    if (q.includes('high') || q.includes('spike')) {
      return `For elevated blood sugar (> 180 mg/dL):\n1. Stay well hydrated with water.\n2. Engage in a light 15-minute walk if feeling okay.\n3. Review your recent meal intake.`;
    }

    if (q.includes('glucose') || q.includes('level') || q.includes('status')) {
      if (latestLog) {
        return `Your latest recorded glucose reading is ${latestLog.value} mg/dL (${latestLog.context}).`;
      }
      return `You can log your glucose readings in the Glucose page to keep track of your history.`;
    }

    return `As your Health AI Assistant, I recommend keeping regular daily logs of your glucose readings and meals. Always consult your official healthcare provider for medical prescriptions or clinical diagnosis.`;
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputMsg('');

    setTimeout(() => {
      const reply = generateAiReply(userText);
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 400);
  };

  return (
    <>
      {/* Subtle Floating AI Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            right: '1.25rem',
            zIndex: 900,
            background: 'var(--bg-secondary)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '0.5rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: 'var(--shadow-md)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600
          }}
        >
          <Sparkles size={15} color="var(--primary-color)" />
          <span>Health AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            right: '1.25rem',
            zIndex: 1000,
            width: '340px',
            maxHeight: '480px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={14} color="var(--primary-color)" />
                <span>Health AI Assistant</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Information tool only</div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{ padding: '0.85rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', minHeight: '220px', maxHeight: '320px', fontSize: '0.82rem' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: m.sender === 'user' ? 'var(--primary-color)' : 'var(--bg-primary)',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  maxWidth: '85%',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.4,
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)'
                }}
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{ padding: '0.6rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.4rem', background: 'var(--bg-primary)' }}>
            <input
              type="text"
              placeholder="Ask a general health question..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={{ flex: 1, padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.65rem' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
