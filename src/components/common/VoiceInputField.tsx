import React, { useState, useEffect } from 'react';
import { Mic, Square, AlertCircle, Send, Loader2 } from 'lucide-react';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

interface VoiceInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isTextArea?: boolean;
  rows?: number;
  className?: string;
  inputClassName?: string;
  onVoiceSubmit?: (isVoice?: boolean) => void;
  onVoiceClear?: () => void;
  label?: string;
  id?: string;
  defaultLang?: string;
}

export const VoiceInputField: React.FC<VoiceInputFieldProps> = ({
  value,
  onChange,
  placeholder = 'Type or speak your message...',
  isTextArea = false,
  rows = 3,
  className = '',
  inputClassName = '',
  onVoiceSubmit,
  onVoiceClear,
  label,
  id,
  defaultLang = 'en-US'
}) => {
  const fieldIdentifier = id || `field_${label?.replace(/\s+/g, '_').toLowerCase() || Math.random().toString(36).substr(2, 9)}`;

  const [hasUsedVoice, setHasUsedVoice] = useState(false);

  const {
    isListening,
    isStarting,
    interimText,
    errorMessage,
    speechLang,
    setSpeechLang,
    startListening,
    stopListening,
    isSupported
  } = useVoiceRecognition({
    fieldId: fieldIdentifier,
    initialValue: value,
    lang: defaultLang,
    onFinalTranscript: (text) => {
      setHasUsedVoice(true);
      const lower = text.trim().toLowerCase();
      if (lower.endsWith('clear input') || lower.endsWith('clear')) {
        onChange('');
        if (onVoiceClear) onVoiceClear();
        return;
      }
      if (lower.endsWith('stop listening') || lower.endsWith('cancel')) {
        stopListening();
        return;
      }

      // Populate recognized final text cleanly into the input box
      onChange(text);
    }
  });

  // Sync defaultLang prop changes
  useEffect(() => {
    if (defaultLang && defaultLang !== speechLang) {
      setSpeechLang(defaultLang);
    }
  }, [defaultLang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onVoiceSubmit && value.trim()) {
        onVoiceSubmit(hasUsedVoice);
        setHasUsedVoice(false);
      }
    }
  };

  const handleSendClick = () => {
    if (onVoiceSubmit && value.trim()) {
      onVoiceSubmit(hasUsedVoice);
      setHasUsedVoice(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-mono font-bold text-slate-300">
          {label}
        </label>
      )}

      <div className="relative group">
        {isTextArea ? (
          <textarea
            id={id}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={rows}
            className={`w-full p-3.5 pr-44 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs focus:outline-none transition-all placeholder:text-slate-500 ${inputClassName}`}
          />
        ) : (
          <input
            id={id}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full p-3.5 pr-44 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs focus:outline-none transition-all placeholder:text-slate-500 ${inputClassName}`}
          />
        )}

        {/* VOICE & SEND CONTROLS */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
          {/* LANGUAGE SELECTOR */}
          <div className="relative flex items-center">
            <select
              value={speechLang}
              onChange={e => setSpeechLang(e.target.value)}
              className="bg-slate-950/90 text-slate-300 font-mono text-[10px] font-bold pl-2 pr-1 py-1.5 rounded-xl border border-slate-800 focus:outline-none cursor-pointer hover:border-indigo-500/40"
              title="Select Voice Language"
            >
              <option value="en-US">EN (English)</option>
              <option value="te-IN">TE (తెలుగు)</option>
              <option value="hi-IN">HI (हिंदी)</option>
              <option value="ta-IN">TA (தமிழ்)</option>
              <option value="kn-IN">KN (ಕನ್ನಡ)</option>
              <option value="ml-IN">ML (മലയാളം)</option>
              <option value="mr-IN">MR (मराठी)</option>
              <option value="bn-IN">BN (বাংলা)</option>
              <option value="gu-IN">GU (ગુજરાતી)</option>
              <option value="pa-IN">PA (ਪੰਜਾਬੀ)</option>
            </select>
          </div>

          {/* MICROPHONE BUTTON (🎤 / ⏹) */}
          {isListening ? (
            <button
              type="button"
              onClick={stopListening}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1 text-[11px] font-mono font-bold animate-pulse"
              title="Stop listening"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : isStarting ? (
            <button
              type="button"
              disabled
              className="p-2 rounded-xl bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 cursor-wait flex items-center gap-1 text-[11px] font-mono"
              title="Starting microphone..."
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startListening}
              className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center gap-1 shadow-sm"
              title={isSupported ? "Click to speak (Voice Recognition)" : "Voice not supported in this browser"}
            >
              <Mic className="w-4 h-4 text-indigo-400" />
            </button>
          )}

          {/* SEND MESSAGE BUTTON (➤) */}
          {onVoiceSubmit && (
            <button
              id="btn-send-chat-message"
              type="button"
              onClick={handleSendClick}
              disabled={!value.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center shrink-0"
              title="Send Message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* LIVE PREVIEW & STATUS INDICATOR */}
      {isListening && (
        <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-indigo-200 font-bold tracking-wide flex items-center gap-1.5">
                <span>🔴 Listening...</span>
                <span className="text-slate-400 font-normal">Speak naturally in {speechLang}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="text-rose-400 hover:text-rose-300 underline cursor-pointer text-[10px]"
            >
              Finish speaking
            </button>
          </div>

          {/* TEMPORARY REAL-TIME LIVE INTERIM PREVIEW */}
          {interimText ? (
            <div className="text-xs text-amber-300 font-sans italic bg-slate-950/90 px-3 py-2 rounded-xl border border-amber-500/40 shadow-inner">
              <span className="font-bold text-amber-400 not-italic">Live Transcript: </span>
              <span>"{interimText}"</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              Listening for your voice input... (Speak now)
            </div>
          )}
        </div>
      )}

      {/* ERROR DISPLAY */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2.5 font-mono animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

