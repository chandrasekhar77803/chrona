import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChrona } from '../../context/ChronaContext';
import { updateUserProfile } from '../../services/firebaseService';
import {
  Play,
  Pause,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Compass,
  BookOpen,
  Mic,
  Shield,
  Video,
  Radar,
  BarChart,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  autoLaunchTour?: boolean;
}

export const ChronaProductTourModal: React.FC<Props> = ({
  isOpen,
  onClose,
  autoLaunchTour = false
}) => {
  const { currentUser } = useAuth();
  const { updateStudentProfile } = useChrona();

  // Mode: 'welcome' (Welcome Dialog) or 'tour' (Cinematic Video Tour)
  const [mode, setMode] = useState<'welcome' | 'tour'>(autoLaunchTour ? 'tour' : 'welcome');
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [tourSpeed, setTourSpeed] = useState<number>(1); // 1x, 1.5x, 2x

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize or Reset when opened
  useEffect(() => {
    if (isOpen) {
      if (autoLaunchTour) {
        setMode('tour');
        setCurrentScene(1);
        setIsPlaying(true);
      } else {
        setMode('welcome');
      }
    }
  }, [isOpen, autoLaunchTour]);

  // Web Audio Synth for Sci-Fi Ambient Tone Effect
  const playFuturisticTone = (freq = 440) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Audio context fallback
    }
  };

  // Manual Navigation Helpers
  const handleNextScene = () => {
    setCurrentScene(prev => {
      if (prev >= 11) return 11;
      return prev + 1;
    });
  };

  const handlePrevScene = () => {
    setCurrentScene(prev => {
      if (prev <= 1) return 1;
      return prev - 1;
    });
  };

  // Scene Timer (Configurable speed per scene)
  useEffect(() => {
    if (mode !== 'tour' || !isPlaying) return;

    playFuturisticTone(300 + currentScene * 40);

    const durationMs = 4500 / tourSpeed;

    const timer = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= 11) {
          setIsPlaying(false);
          return 11;
        }
        return prev + 1;
      });
    }, durationMs);

    return () => clearInterval(timer);
  }, [mode, isPlaying, currentScene, isMuted, tourSpeed]);

  // Complete & Save Firestore `hasSeenIntro = true`
  const handleCompleteJourney = async () => {
    if (currentUser) {
      await updateUserProfile(currentUser.id, { hasSeenIntro: true });
      localStorage.setItem(`chrona_intro_seen_${currentUser.id}`, 'true');
    }
    updateStudentProfile({ hasSeenIntro: true });
    onClose();
  };

  if (!isOpen) return null;

  // ── 1. WELCOME DIALOG SCREEN ──
  if (mode === 'welcome') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-950 max-w-lg w-full text-center space-y-6 shadow-2xl relative">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 shadow-xl shadow-indigo-500/20 animate-pulse">
            <span className="text-4xl">🚀</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Welcome to Chrona
            </h2>
            <p className="text-xs md:text-sm text-indigo-300 font-mono font-bold uppercase tracking-wider">
              "Your AI-Powered Student Operating System"
            </p>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed pt-2">
              From daily mission tasks to securing your dream career offer—Chrona optimizes every minute of your academic journey.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                setMode('tour');
                setCurrentScene(1);
                setIsPlaying(true);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/30 transition-all transform hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>🎥 Discover Chrona (60 Seconds)</span>
            </button>

            <button
              onClick={handleCompleteJourney}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Start My Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. CINEMATIC 60-SECOND PRODUCT TOUR SHOWCASE ──
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-4 md:p-8 animate-fadeIn text-white">
      {/* TOP HEADER CONTROLS */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-sm">
            ⚡
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-widest">
              CHRONA CINEMATIC TOUR • SCENE 0{currentScene} / 11
            </div>
            <div className="text-[11px] text-slate-400">45-60 Seconds Product Experience</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PLAY / PAUSE TOGGLE */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              isPlaying
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                : 'bg-amber-600/30 border-amber-500 text-amber-200'
            }`}
            title={isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-indigo-400" /> : <Play className="w-4 h-4 text-amber-400" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* PLAYBACK SPEED SELECTOR */}
          <select
            value={tourSpeed}
            onChange={e => setTourSpeed(parseFloat(e.target.value))}
            className="bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-xs font-bold px-2.5 py-2 rounded-xl focus:outline-none cursor-pointer"
            title="Tour Playback Speed"
          >
            <option value={1}>1.0x Speed</option>
            <option value={1.5}>1.5x Fast</option>
            <option value={2}>2.0x Rapid</option>
          </select>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
              showCaptions ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            CC
          </button>

          <button
            onClick={() => {
              setCurrentScene(1);
              setIsPlaying(true);
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Replay Tour"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCompleteJourney}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Skip Tour</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CENTER ANIMATED SCENE DISPLAY WITH MANUAL SIDE ARROWS */}
      <div className="flex-1 flex items-center justify-between py-6 relative my-auto max-w-5xl mx-auto w-full">
        {/* MANUAL PREVIOUS SLIDE ARROW */}
        <button
          onClick={handlePrevScene}
          disabled={currentScene === 1}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xl z-30 shrink-0"
          title="Previous Slide (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* SCENE 1: OVERWHELMED STUDENT */}
        {currentScene === 1 && (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping" />
              <div className="w-24 h-24 rounded-3xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-4xl shadow-xl shadow-rose-500/20">
                📚
              </div>
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-3xl font-black text-white">Every student has dreams...</h2>
              <p className="text-base text-rose-300 font-semibold">But managing exams, assignments, internships, and career goals is overwhelming.</p>
            </div>
          </div>
        )}

        {/* SCENE 2: MEET CHRONA */}
        {currentScene === 2 && (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-2xl shadow-indigo-500/40 mx-auto animate-pulse">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-5xl">
                ⚡
              </div>
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-4xl font-black text-white">Meet Chrona.</h2>
              <p className="text-lg font-mono font-bold text-indigo-400">Your AI Student Operating System.</p>
            </div>
          </div>
        )}

        {/* SCENE 3: TODAY'S MISSION */}
        {currentScene === 3 && (
          <div className="text-center space-y-6 animate-fadeIn w-full max-w-md">
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-900/80 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-400 font-bold">
                <span>TODAY'S MISSION</span>
                <span>AI AUTO-PRIORITIZED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-left text-xs font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Complete OS Virtual Memory Module</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 text-left text-xs font-bold text-indigo-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Solve 2 Array LeetCode Problems</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-white">Every morning, AI creates your perfect mission.</h2>
          </div>
        )}

        {/* SCENE 4: CAREER GPS */}
        {currentScene === 4 && (
          <div className="text-center space-y-6 animate-fadeIn w-full max-w-md">
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 bg-purple-950/40 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between text-xs font-mono text-purple-300 font-bold">
                <Compass className="w-4 h-4" />
                <span>CAREER GPS</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 font-bold text-sm text-white">
                🎯 Target: Google SDE-1
              </div>
              <div className="text-xs font-mono text-emerald-400">Roadmap Automatically Generated • 92% Match</div>
            </div>
            <h2 className="text-2xl font-black text-white">Your personalized roadmap to your dream career.</h2>
          </div>
        )}

        {/* SCENE 5: STUDY COMPANION */}
        {currentScene === 5 && (
          <div className="text-center space-y-6 animate-fadeIn w-full max-w-md">
            <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 bg-slate-900/80 space-y-3 shadow-2xl">
              <BookOpen className="w-10 h-10 text-cyan-400 mx-auto" />
              <div className="flex justify-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">PDF Upload</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">AI Flashcards</span>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">AI Quiz</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-white">Study smarter, not harder.</h2>
          </div>
        )}

        {/* SCENE 6: SMART NOTES */}
        {currentScene === 6 && (
          <div className="text-center space-y-6 animate-fadeIn w-full max-w-md">
            <div className="glass-panel p-6 rounded-3xl border border-rose-500/40 bg-slate-900/80 space-y-3 shadow-2xl">
              <Mic className="w-10 h-10 text-rose-400 mx-auto animate-pulse" />
              <div className="text-xs font-mono text-rose-300">Speech Recognition → Executive Summary → 10 Revision Cards</div>
            </div>
            <h2 className="text-2xl font-black text-white">Turn every lecture into exam-ready notes.</h2>
          </div>
        )}

        {/* SCENE 7: FOCUS BUBBLE */}
        {currentScene === 7 && (
          <div className="text-center space-y-6 animate-fadeIn w-full max-w-md">
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-indigo-950/40 space-y-3 shadow-2xl">
              <Shield className="w-10 h-10 text-indigo-400 mx-auto" />
              <div className="text-xs font-mono text-indigo-200">Notifications Protected • Focus Timer Started • 98% Peak Attention</div>
            </div>
            <h2 className="text-2xl font-black text-white">When it's time to focus, Chrona protects your attention.</h2>
          </div>
        )}

        {/* SCENE 8: AI MOCK INTERVIEW */}
        {currentScene === 8 && (
          <div className="text-center space-y-6 animate-fadeIn w-full max-w-md">
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-slate-900/80 space-y-3 shadow-2xl">
              <Video className="w-10 h-10 text-amber-400 mx-auto" />
              <div className="flex justify-center gap-3 text-xs font-mono">
                <span className="text-amber-300">Interview Score: 88%</span>
                <span className="text-emerald-300">Communication: 91%</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-white">Practice interviews with your personal AI coach.</h2>
          </div>
        )}

        {/* SCENE 9: OPPORTUNITY RADAR */}
        {currentScene === 9 && (
          <div className="text-center space-y-6 animate-fadeIn w-full max-w-md">
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 bg-slate-900/80 space-y-3 shadow-2xl">
              <Radar className="w-10 h-10 text-emerald-400 mx-auto animate-spin-slow" />
              <div className="text-xs font-mono text-emerald-300">Hackathons • Internships • Scholarships Tracked</div>
            </div>
            <h2 className="text-2xl font-black text-white">Never miss another opportunity.</h2>
          </div>
        )}

        {/* SCENE 10: EVERYTHING CONNECTED */}
        {currentScene === 10 && (
          <div className="text-center space-y-6 animate-fadeIn w-full max-w-md">
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 space-y-3 shadow-2xl">
              <BarChart className="w-10 h-10 text-indigo-400 mx-auto" />
              <div className="text-xs font-mono text-indigo-200">Today's Mission ↔ Career GPS ↔ Placement Readiness</div>
            </div>
            <h2 className="text-2xl font-black text-white">Everything connected. Everything personalized.</h2>
          </div>
        )}

        {/* SCENE 11: DREAM TIMELINE & FINAL CTA */}
        {currentScene === 11 && (
          <div className="text-center space-y-6 animate-fadeIn w-full max-w-lg">
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 bg-slate-950/90 space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center mx-auto text-3xl">
                🚀
              </div>
              <div className="flex justify-between text-[11px] font-mono text-purple-300 border-t border-slate-800 pt-3">
                <span>Today</span>
                <span>→</span>
                <span>Semester</span>
                <span>→</span>
                <span>Internship</span>
                <span>→</span>
                <span className="text-emerald-400 font-bold">Google Offer</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">Don't just manage your time.</h2>
              <p className="text-xl font-extrabold text-purple-300 font-mono">Design your future.</p>
            </div>

            <button
              onClick={handleCompleteJourney}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm inline-flex items-center gap-2 shadow-2xl shadow-emerald-500/40 transition-all transform hover:scale-105 cursor-pointer"
            >
              <span>🚀 Start My Journey</span>
            </button>
          </div>
        )}
        </div>

        {/* MANUAL NEXT SLIDE ARROW */}
        <button
          onClick={handleNextScene}
          disabled={currentScene === 11}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xl z-30 shrink-0"
          title="Next Slide (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* BOTTOM CAPTION & SCENE DOTS SCRUBBER */}
      <div className="space-y-4 z-20 max-w-3xl mx-auto w-full">
        {showCaptions && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-center font-mono text-xs font-bold text-indigo-200 backdrop-blur-md shadow-xl">
            {currentScene === 1 && "Every student has dreams... But managing everything is overwhelming."}
            {currentScene === 2 && "Meet Chrona. Your AI Student Operating System."}
            {currentScene === 3 && "Every morning AI creates your perfect mission."}
            {currentScene === 4 && "Your personalized roadmap to your dream career."}
            {currentScene === 5 && "Study smarter, not harder."}
            {currentScene === 6 && "Turn every lecture into exam-ready notes."}
            {currentScene === 7 && "When it's time to focus, Chrona protects your attention."}
            {currentScene === 8 && "Practice interviews with your personal AI coach."}
            {currentScene === 9 && "Never miss another opportunity."}
            {currentScene === 10 && "Everything connected. Everything personalized."}
            {currentScene === 11 && "Every task brings you closer to your dream."}
          </div>
        )}

        {/* Scene Dots & Manual Navigation Scrubber */}
        <div className="flex items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 backdrop-blur-md">
          <button
            onClick={handlePrevScene}
            disabled={currentScene === 1}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600/40 text-slate-200 hover:text-white border border-slate-700 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev Slide</span>
          </button>

          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: 11 }).map((_, idx) => {
              const sc = idx + 1;
              return (
                <button
                  key={sc}
                  onClick={() => {
                    setCurrentScene(sc);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentScene === sc
                      ? 'w-7 bg-indigo-500 shadow-md shadow-indigo-500/50'
                      : sc < currentScene
                      ? 'w-2.5 bg-emerald-400'
                      : 'w-2.5 bg-slate-800 hover:bg-slate-700'
                  }`}
                  title={`Jump to Scene ${sc}`}
                />
              );
            })}
          </div>

          <button
            onClick={handleNextScene}
            disabled={currentScene === 11}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
