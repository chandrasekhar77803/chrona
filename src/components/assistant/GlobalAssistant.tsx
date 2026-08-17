import React, { useState, useEffect } from 'react';
import { useChrona } from '../../context/ChronaContext';
import { Bot, X, Send, Key, Sparkles, Check, Loader2 } from 'lucide-react';

export const GlobalAssistant: React.FC = () => {
  const { isAssistantOpen, setIsAssistantOpen, chatMessages, sendChatMessage, studentProfile } = useChrona();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  useEffect(() => {
    const existingKey = localStorage.getItem('chrona_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    setGeminiKeyInput(existingKey);
  }, []);

  const handleSaveGeminiKey = () => {
    localStorage.setItem('chrona_gemini_api_key', geminiKeyInput.trim());
    setSavedKeySuccess(true);
    setTimeout(() => {
      setSavedKeySuccess(false);
      setShowKeyConfig(false);
    }, 1200);
  };

  if (!isAssistantOpen) {
    return (
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all group flex items-center gap-2 font-bold text-xs cursor-pointer"
      >
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="hidden sm:inline">Ask Chrona AI</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white animate-ping" />
      </button>
    );
  }

  const quickPrompts = [
    'What should I study today?',
    'Explain my active study document',
    'How do I increase placement readiness?',
    'What long-term goals are pending?',
    'Prepare mock interview questions',
    'Explain Chrona Focus Bubble'
  ];

  const handleSend = async (textToSend?: string) => {
    const msg = textToSend || input;
    if (!msg.trim() || isSending) return;
    setInput('');
    setIsSending(true);

    try {
      await sendChatMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  // Helper to render bold markdown and newlines cleanly
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <React.Fragment key={lIdx}>
          {renderedParts}
          {lIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const hasGeminiKey = Boolean(geminiKeyInput.trim() || import.meta.env.VITE_GEMINI_API_KEY);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md glass-panel rounded-2xl border border-indigo-500/40 shadow-2xl bg-slate-950/95 flex flex-col h-[540px] animate-fadeIn">
      {/* ── HEADER ── */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-indigo-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              Chrona AI Assistant
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono text-emerald-300">
                {hasGeminiKey ? 'Gemini Flash ⚡' : 'Meta Llama 3.2'}
              </span>
            </h3>
            <p className="text-[10px] text-indigo-300 font-mono">
              Target: {studentProfile?.dreamCompany || 'Google'} • {studentProfile?.placementReadiness || 88}% Readiness
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            title="Configure Gemini API Key"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAssistantOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── GEMINI API KEY CONFIG MODAL / OVERLAY ── */}
      {showKeyConfig && (
        <div className="p-3.5 bg-slate-900 border-b border-slate-800 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Google Gemini API Key Settings
            </span>
            <button onClick={() => setShowKeyConfig(false)} className="text-[10px] text-slate-400 hover:text-white">
              Close
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Paste your Google Gemini API Key below to enable <strong>gemini-2.0-flash / gemini-1.5-flash</strong> for real-time Chrona AI responses.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKeyInput}
              onChange={e => setGeminiKeyInput(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleSaveGeminiKey}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              {savedKeySuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ── CHAT MESSAGES ── */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl text-xs max-w-[88%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              {renderFormattedText(msg.text)}
            </div>
            <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono p-2 bg-indigo-500/10 rounded-xl w-fit animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chrona AI is processing...
          </div>
        )}
      </div>

      {/* ── QUICK PROMPTS ── */}
      <div className="p-2 border-t border-slate-800 bg-slate-900/60 overflow-x-auto flex gap-1.5 shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            disabled={isSending}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-900/50 text-[10px] text-indigo-200 border border-indigo-500/30 font-semibold shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* ── INPUT BOX ── */}
      <div className="p-3 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask Chrona AI about tasks, goals, PDFs..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={isSending}
          className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={isSending || !input.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
