import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  enrollVoiceProfile,
  getVoiceProfile,
  resetVoiceProfile,
  extractSpectralFeatures
} from '../../services/voiceBiometricsService';
import {
  Mic,
  CheckCircle2,
  X,
  RefreshCw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import type { VoiceBiometricsProfile } from '../../types/chrona';

interface VoiceBiometricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrolledSuccess?: (profile: VoiceBiometricsProfile) => void;
}

export const VoiceBiometricsModal: React.FC<VoiceBiometricsModalProps> = ({
  isOpen,
  onClose,
  onEnrolledSuccess
}) => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<VoiceBiometricsProfile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [audioLevel, setAudioLevel] = useState<number[]>(Array(8).fill(20));
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioSamplesRef = useRef<number[]>([]);

  const defaultPassphrase = `My name is ${currentUser?.name || 'Student'}, and Chrona is my personal AI mentor.`;

  useEffect(() => {
    if (!currentUser || !isOpen) return;
    const fetchProfile = async () => {
      const p = await getVoiceProfile(currentUser.id);
      setProfile(p);
    };
    fetchProfile();
  }, [currentUser, isOpen]);

  const startEnrolmentRecording = async () => {
    try {
      setIsRecording(true);
      setCountdown(5);
      setStatusMsg('Listening... Please speak the passphrase clearly.');
      audioSamplesRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        const levels = Array.from(dataArray.slice(0, 8)).map(val => Math.max(15, (val / 255) * 100));
        setAudioLevel(levels);

        // Store sample amplitudes for feature vector
        const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
        audioSamplesRef.current.push(avg / 100);

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // 5-second countdown timer
      let remaining = 5;
      const timer = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
          stopEnrolmentRecording();
        }
      }, 1000);

    } catch (err) {
      console.error('[VoiceModal] Microphone access error:', err);
      setIsRecording(false);
      setStatusMsg('Microphone permission denied. Please allow microphone access.');
    }
  };

  const stopEnrolmentRecording = async () => {
    setIsRecording(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (!currentUser) return;

    setIsSaving(true);
    setStatusMsg('Extracting voice spectrum biometrics...');

    const floatSamples = new Float32Array(audioSamplesRef.current);
    const featureVector = extractSpectralFeatures(floatSamples);

    const newProfile = await enrollVoiceProfile(currentUser.id, defaultPassphrase, featureVector);
    setProfile(newProfile);
    setIsSaving(false);
    setStatusMsg('🟢 Voice Profile Enrolled & Verified!');

    if (onEnrolledSuccess) {
      onEnrolledSuccess(newProfile);
    }
  };

  const handleReset = async () => {
    if (!currentUser) return;
    await resetVoiceProfile(currentUser.id);
    setProfile(null);
    setStatusMsg('Voice profile reset. Click "Start Recording" to re-enrol.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-950/95 space-y-6 shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base tracking-tight">Voice Biometrics Enrolment</h3>
              <p className="text-xs text-slate-400">Personalized Speaker Identification Profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PASSPHRASE CARD */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-xs">
          <span className="font-mono font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            RECORD YOUR PASSPHRASE (5 SECONDS):
          </span>
          <p className="text-white font-medium text-sm leading-relaxed p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-sans">
            "{defaultPassphrase}"
          </p>
        </div>

        {/* LIVE AUDIO WAVEFORM METER */}
        {isRecording && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-center animate-fadeIn">
            <div className="flex items-center justify-center gap-1.5 h-12">
              {audioLevel.map((lvl, idx) => (
                <div
                  key={idx}
                  style={{ height: `${lvl}%` }}
                  className="w-2.5 rounded-full bg-gradient-to-t from-indigo-600 via-purple-500 to-pink-500 transition-all duration-75"
                />
              ))}
            </div>
            <div className="text-xs font-mono font-bold text-indigo-300">
              ⏱️ Recording... <strong className="text-white text-sm">{countdown}s</strong> remaining
            </div>
          </div>
        )}

        {/* STATUS DISPLAY */}
        {statusMsg && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-center text-slate-200">
            {statusMsg}
          </div>
        )}

        {/* ENROLLED PROFILE SUMMARY */}
        {profile && profile.enrolled && !isRecording && (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Voice Profile Active & Enrolled</span>
            </div>
            <div className="text-slate-300 space-y-1 text-[11px]">
              <div>• Enrolled at: {new Date(profile.enrolledAt).toLocaleString()}</div>
              <div>• Vector dimension: {profile.audioFingerprint.length}D Spectral Fingerprint</div>
              <div>• Biometric status: 🟢 Active for {currentUser?.name}</div>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3 pt-2">
          {!profile?.enrolled ? (
            <button
              onClick={startEnrolmentRecording}
              disabled={isRecording || isSaving}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Mic className="w-4 h-4" />
              <span>{isRecording ? 'Recording Passphrase...' : 'Start 5s Voice Enrolment'}</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 font-mono text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-enrol Voice Profile</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
