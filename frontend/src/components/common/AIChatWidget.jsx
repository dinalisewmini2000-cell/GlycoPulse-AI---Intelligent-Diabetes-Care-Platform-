import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, Mic, MicOff, Volume2, VolumeX, Send, X, Sparkles, MessageSquare, RefreshCw
} from 'lucide-react';

export const AIChatWidget = ({ isEmbedded = false }) => {
  const { currentUser } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your GlycoPulse AI Clinical Assistant. Tap the microphone or type below for instant voice-assisted diabetes guidance.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('[Voice Recognition Transcript]:', transcript);
          setInputQuery(transcript);
          setIsListening(false);
          // Auto-send spoken query
          handleSendMessage(transcript);
        };

        recognition.onerror = (event) => {
          console.warn('[Speech Recognition Error]:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const speakTextOutLoud = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !isVoiceEnabled) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const cleanedText = text.replace(/[\*\_\`]/g, '').slice(0, 300); // Strip markdown formatting
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert('Web Speech Recognition API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputQuery('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('[Speech Start Error]:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query || typeof query !== 'string' || !query.trim()) return;

    const userMsg = {
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_VISION_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY;

    let botResponseText = 'I am monitoring your glycemic health parameters. For personal medical emergencies, please consult your primary physician immediately.';

    if (apiKey) {
      const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
      for (const model of modelsToTry) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are GlycoPulse AI, an empathetic clinical diabetes assistant. Provide a concise, clear 2-sentence response to the patient's voice query: "${query}"`
                }]
              }]
            })
          });

          if (response.ok) {
            const data = await response.json();
            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiText) {
              botResponseText = aiText.trim();
              break;
            }
          }
        } catch (err) {
          console.warn(`[Voice AI Gemini (${model}) Error]:`, err);
        }
      }
    } else {
      if (query.toLowerCase().includes('sugar') || query.toLowerCase().includes('glucose')) {
        botResponseText = 'Maintaining blood glucose between 70 to 140 mg/dL minimizes long-term microvascular complications. Regular exercise and balanced meals help keep readings stable.';
      } else if (query.toLowerCase().includes('eat') || query.toLowerCase().includes('food') || query.toLowerCase().includes('diet')) {
        botResponseText = 'Choosing low glycemic index foods like leafy greens, pulses, and lean proteins helps prevent sharp postprandial glucose spikes.';
      }
    }

    const botMsg = {
      sender: 'bot',
      text: botResponseText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);

    // Speak response out loud
    speakTextOutLoud(botResponseText);
  };

  // RENDER EMBEDDED OR FLOATING WIDGET
  const content = (
    <div
      className="glass-panel"
      style={{
        width: isEmbedded ? '100%' : '360px',
        height: isEmbedded ? '440px' : '480px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #bae6fd',
        boxShadow: isEmbedded ? 'none' : '0 12px 35px -5px rgba(2, 132, 199, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '1rem 1.25rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="#ffffff" />
          </div>

          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.2 }}>Voice-to-Voice AI</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.88, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
              <span>{isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Web Speech & Gemini AI'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            type="button"
            onClick={() => {
              setIsVoiceEnabled(!isVoiceEnabled);
              if (isSpeaking) window.speechSynthesis?.cancel();
            }}
            style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', borderRadius: '6px', width: '28px', height: '28px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={isVoiceEnabled ? 'Disable Voice Speech' : 'Enable Voice Speech'}
          >
            {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {!isEmbedded && (
            <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Thread */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: msg.sender === 'user' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : '#ffffff',
              color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
              padding: '0.75rem 0.95rem',
              borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              fontSize: '0.85rem',
              lineHeight: 1.45
            }}
          >
            <div>{msg.text}</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.75, textAlign: 'right', marginTop: '0.25rem' }}>{msg.time}</div>
          </div>
        ))}

        {isLoading && (
          <div style={{ alignSelf: 'flex-start', background: '#ffffff', padding: '0.6rem 0.9rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <RefreshCw size={14} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
            <span>AI Thinking & Voice Processing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Controls Bar */}
      <div style={{ padding: '0.75rem 1rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        {/* Microphone Voice Button */}
        <button
          type="button"
          onClick={handleToggleListening}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: isListening ? '#dc2626' : '#f0f9ff',
            color: isListening ? '#ffffff' : '#0284c7',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: isListening ? '0 0 0 4px rgba(220, 38, 38, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
          title={isListening ? 'Stop Listening' : 'Speak to AI (Voice-to-Voice)'}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          placeholder={isListening ? 'Listening to your voice...' : 'Ask AI or tap microphone...'}
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          style={{ flex: 1, padding: '0.6rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '20px', outline: 'none' }}
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          style={{ width: '38px', height: '38px', borderRadius: '50%', border: 'none', background: '#0284c7', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7, #2563eb)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 25px rgba(2, 132, 199, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease'
          }}
          title="Open Voice-to-Voice AI Assistant"
        >
          <Sparkles size={26} />
        </button>
      ) : content}
    </div>
  );
};
