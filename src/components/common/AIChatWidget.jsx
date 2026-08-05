import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello Sarah! I am your 24/7 AI Diabetes Health Assistant. How can I help you today?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const quickPrompts = [
    'Explain my HbA1c of 6.3%',
    'What to eat during low blood sugar?',
    'How does sleep affect glucose spikes?'
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userEntry = { sender: 'user', text: query };
    setMessages(prev => [...prev, userEntry]);
    setInputMsg('');

    // Generate intelligent AI response simulation
    setTimeout(() => {
      let reply = "Glycemic control is looking strong today! Remember to balance rapid-acting insulin with complex fibers.";
      if (query.toLowerCase().includes('hba1c')) {
        reply = "An HbA1c of 6.3% corresponds to an Estimated Average Glucose (eAG) of ~134 mg/dL. This represents optimal glucose control for Type 1 Diabetes and minimizes microvascular risk!";
      } else if (query.toLowerCase().includes('low') || query.toLowerCase().includes('hypo')) {
        reply = "For low blood sugar (< 70 mg/dL), follow the 15-15 Rule: Eat 15g fast-acting carbs (e.g. 4 oz juice or 3 glucose tablets), wait 15 minutes, and re-test!";
      } else if (query.toLowerCase().includes('sleep')) {
        reply = "Restful sleep reduces cortisol and growth hormone surges, which prevents the morning 'Dawn Phenomenon' blood sugar rise.";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
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
        <div className="glass-panel" style={{ width: '380px', height: '520px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
          
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)', padding: '1rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Bot size={22} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>24/7 AI Health Assistant</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>GlycoPulse Clinical Coach</div>
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
                  maxWidth: '82%', padding: '0.75rem 1rem', borderRadius: '12px', 
                  fontSize: '0.85rem', lineHeight: '1.4',
                  background: m.sender === 'user' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                  color: m.sender === 'user' ? '#fff' : 'var(--text-main)',
                  border: m.sender === 'ai' ? 'var(--border-color)' : 'none'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompt Chips */}
          <div style={{ padding: '0.5rem 0.8rem', background: 'var(--bg-secondary)', borderTop: 'var(--border-color)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
            {quickPrompts.map((p, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSend(p)}
                style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', padding: '0.3rem 0.6rem', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', cursor: 'pointer' }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', display: 'flex', gap: '0.5rem', borderTop: 'var(--border-color)' }}>
            <input 
              type="text" 
              value={inputMsg} 
              onChange={e => setInputMsg(e.target.value)} 
              placeholder="Ask about diabetes, reports, or meals..." 
              style={{ flex: 1, padding: '0.6rem 0.9rem', borderRadius: '8px', background: 'var(--bg-primary)', border: 'var(--border-color)', color: '#fff', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn-glow" style={{ padding: '0.6rem' }}>
              <Send size={16} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
