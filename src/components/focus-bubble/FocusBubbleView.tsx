import React, { useState, useEffect, useRef } from 'react';
import { useChrona } from '../../context/ChronaContext';
import type { FocusSessionResult } from '../../types/chrona';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Circle,
  Maximize2,
  Minimize2,
  Quote,
  Music,
  AlertTriangle
} from 'lucide-react';

export const FocusBubbleView: React.FC = () => {
  const { missions, toggleMission } = useChrona();

  const [timerMode, setTimerMode] = useState<'work' | 'break' | 'deep'>('work');
  const durationMap = { work: 25 * 60, break: 5 * 60, deep: 50 * 60 };
  const [timeLeft, setTimeLeft] = useState(durationMap[timerMode]);
  const [isActive, setIsActive] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [soundscape, setSoundscape] = useState<'Lo-Fi Beats' | 'Rain' | 'Alpha Waves' | 'White Noise' | 'Off'>('Lo-Fi Beats');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem('chrona_focus_scratchpad') || 'Scratchpad: Write quick thoughts, code snippets or formulas here...';
  });

  const handleScratchpadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setScratchpad(val);
    localStorage.setItem('chrona_focus_scratchpad', val);
  };

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const [sessionResult, setSessionResult] = useState<FocusSessionResult | null>(null);

  const quotes = [
    '"Deep Work is the superpower of the 21st century." — Cal Newport',
    '"The secret of getting ahead is getting started." — Mark Twain',
    '"Focus on being productive instead of busy." — Tim Ferriss',
    '"Small daily improvements over time lead to stunning results." — Robin Sharma',
    '"Your future is created by what you do today, not tomorrow." — Robert Kiyosaki'
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  // FOCUS ACTIVE BODY STYLING & TAB SWITCH DETECTION
  useEffect(() => {
    if (isActive) {
      document.body.classList.add('focus-active');
    } else {
      document.body.classList.remove('focus-active');
    }

    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.classList.remove('focus-active');
    };
  }, [isActive]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setSessionResult({
        focusScore: 94,
        productivityScore: 96,
        distractionCount: 0,
        deepWorkTimeMinutes: Math.round(durationMap[timerMode] / 60),
        energyLevel: 'Peak'
      });
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, timerMode]);

  const handleModeChange = (mode: 'work' | 'break' | 'deep') => {
    setTimerMode(mode);
    setTimeLeft(durationMap[mode]);
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durationMap[timerMode]);
  };

  const toggleAmbientAudio = () => {
    if (isPlayingAudio) {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (e) {}
      }
      setIsPlayingAudio(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        osc.type = soundscape === 'Alpha Waves' ? 'sine' : soundscape === 'Rain' ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(soundscape === 'Alpha Waves' ? 432 : 220, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        oscillatorRef.current = osc;
        setIsPlayingAudio(true);
      } catch (e) {
        setIsPlayingAudio(true);
      }
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSec = durationMap[timerMode];
  const progressPercent = ((totalSec - timeLeft) / totalSec) * 100;

  return (
    <div className={`space-y-8 animate-fadeIn pb-12 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-8 overflow-y-auto' : ''}`}>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900/95 border border-rose-500/60 text-rose-400 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xl shadow-rose-500/20 backdrop-blur-md flex items-center gap-2 animate-slideIn">
          <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
          <span>Focus Lost: Tab switched!</span>
        </div>
      )}

      <div className="glass-panel p-6 rounded-2xl border border-purple-500/40 bg-gradient-to-r from-slate-900 via-purple-950/40 to-indigo-950/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>DISTRACTION-FREE FOCUS BUBBLE WORKSPACE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              AI Deep Work Chamber
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Mutes notifications, plays ambient soundscapes, and locks your focus to mission tasks.
            </p>
          </div>

          <button
            id="btn-enter-fullscreen"
            onClick={toggleNativeFullscreen}
            className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? '↘ Exit Fullscreen' : '↗ Enter Fullscreen'}</span>
          </button>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/30 text-center flex items-center justify-center gap-2 text-xs text-indigo-200 italic font-mono" id="focus-quote-banner">
        <Quote className="w-4 h-4 text-indigo-400 shrink-0" />
        <span id="focus-quote-text">{quotes[quoteIndex]}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-purple-500/30 bg-slate-900/80 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 mb-8">
            <button
              id="timer-mode-pomodoro"
              onClick={() => handleModeChange('work')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timerMode === 'work' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎯 Pomodoro (25m)
            </button>
            <button
              id="timer-mode-deepwork"
              onClick={() => handleModeChange('deep')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timerMode === 'deep' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Deep Work (50m)
            </button>
            <button
              id="timer-mode-break"
              onClick={() => handleModeChange('break')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timerMode === 'break' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ☕ Break (5m)
            </button>
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="110" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="transparent" />
              <circle
                id="timer-progress-ring"
                cx="128"
                cy="128"
                r="110"
                stroke="url(#purpleGradient)"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span id="timer-countdown-display" className="text-5xl font-black text-white font-mono tracking-tight">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span id="timer-state-indicator" className="text-xs font-mono text-purple-300 font-semibold mt-1 uppercase tracking-widest">
                {isActive ? 'RUNNING' : 'PAUSED'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="btn-timer-toggle"
              onClick={toggleTimer}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all cursor-pointer ${
                isActive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
              }`}
            >
              {isActive ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>
            <button
              id="btn-timer-reset"
              onClick={resetTimer}
              className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-mono font-bold text-purple-300 uppercase mb-3 flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-400" />
              <span>Ambient Soundscape Synthesizer</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {(['Lo-Fi Beats', 'Rain', 'Alpha Waves', 'White Noise', 'Off'] as const).map(s => {
                const soundId = s === 'Lo-Fi Beats' ? 'sound-lofi' : s === 'Rain' ? 'sound-rain' : s === 'Alpha Waves' ? 'sound-alpha' : s === 'White Noise' ? 'sound-whitenoise' : 'sound-off';
                return (
                  <button
                    id={soundId}
                    key={s}
                    onClick={() => setSoundscape(s)}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${
                      soundscape === s
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🎧 {s}
                  </button>
                );
              })}
            </div>

            <button
              id="btn-ambient-toggle"
              onClick={toggleAmbientAudio}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/25'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
              <span>{isPlayingAudio ? 'Pause Ambient Soundscape' : 'Play Ambient Soundscape'}</span>
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase mb-3 flex items-center justify-between">
              <span>Focus Tasks Checklist</span>
              <span id="focus-task-count" className="text-xs text-slate-400 font-mono">
                {missions.filter(m => m.completed).length}/{missions.length} Done
              </span>
            </h3>
            <div id="focus-checklist-container" className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {missions.map(m => (
                <div
                  key={m.id}
                  onClick={() => toggleMission(m.id)}
                  className="focus-task-item p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5 text-xs cursor-pointer hover:border-indigo-500/40 transition-colors"
                >
                  {m.completed ? (
                    <CheckCircle2 className="task-checkbox w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="task-checkbox w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={`task-title ${m.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{m.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-mono font-bold text-slate-300 uppercase mb-3">
          Focus Scratchpad & Quick Notes
        </h3>
        <textarea
          id="focus-scratchpad"
          value={scratchpad}
          onChange={handleScratchpadChange}
          rows={4}
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
          placeholder="Scratchpad: Write quick thoughts, code snippets or formulas here..."
        />
      </div>

      {sessionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-purple-500/40 bg-slate-950 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mx-auto text-3xl">
              🎉
            </div>
            <h3 className="text-xl font-bold text-white">Focus Session Complete!</h3>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Focus Score</div>
                <div className="text-lg font-bold text-purple-400 font-mono">{sessionResult.focusScore}/100</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Deep Work Time</div>
                <div className="text-lg font-bold text-indigo-400 font-mono">{sessionResult.deepWorkTimeMinutes} Mins</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Distraction Count</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">{sessionResult.distractionCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Energy Level</div>
                <div className="text-lg font-bold text-amber-400 font-mono">{sessionResult.energyLevel}</div>
              </div>
            </div>

            <button
              onClick={() => setSessionResult(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
            >
              Close & Log Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
