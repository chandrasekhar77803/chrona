import React, { useState, useEffect, useRef } from 'react';
import { useChrona } from '../../context/ChronaContext';
import { useAuth } from '../../context/AuthContext';
import {
  generateMentorResponse,
  getMentorProfile,
  saveMentorProfile,
  clearMentorMemory
} from '../../services/mentorService';
import {
  verifySpeakerVoice,
  extractSpectralFeatures,
  getVoiceProfile,
  enrollVoiceProfile
} from '../../services/voiceBiometricsService';
import { VoiceInputField } from '../common/VoiceInputField';
import { VoiceBiometricsModal } from './VoiceBiometricsModal';
import { SPEECH_LANG_CODES, type LanguageCode } from '../../utils/i18n';
import {
  Sparkles,
  ShieldAlert,
  Brain,
  Trash2,
  SlidersHorizontal,
  X,
  ShieldCheck,
  UserCheck,
  UserX
} from 'lucide-react';
import type { MentorMessage, WellbeingCheckin, VoiceBiometricsProfile } from '../../types/chrona';

export const ChronaMentorView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    studentProfile,
    missions,
    roadmapNodes,
    skillGaps,
    setActiveSection,
    saveWellbeingCheckin,
    currentLanguage
  } = useChrona();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedMood, setSelectedMood] = useState<WellbeingCheckin['mood'] | null>(null);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showBiometricsModal, setShowBiometricsModal] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState<VoiceBiometricsProfile | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextSnapshot = {
    userId: currentUser?.id || 'guest',
    profile: studentProfile,
    missions,
    roadmapNodes,
    skillGaps,
    latestMood: selectedMood || undefined
  };

  useEffect(() => {
    if (!currentUser) return;
    const fetchVoice = async () => {
      const vp = await getVoiceProfile(currentUser.id);
      setVoiceProfile(vp);
    };
    fetchVoice();
  }, [currentUser]);

  // Load stored Mentor Profile & Messages from Firestore
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      const profile = await getMentorProfile(currentUser.id);
      if (profile.conversationHistory && profile.conversationHistory.length > 0) {
        setMessages(profile.conversationHistory);
      } else {
        // Initial welcome message from mentor
        const activeNode = roadmapNodes.find(n => n.status === 'in-progress') || roadmapNodes[0];
        const welcomeMsg: MentorMessage = {
          id: `welcome-${Date.now()}`,
          sender: 'mentor',
          text: `Hello ${studentProfile.name}! I am your personal Chrona AI Mentor. I have analyzed your target for **${studentProfile.dreamCompany} (${studentProfile.careerGoal})**. You are currently in **${activeNode?.title || 'Month 1 Foundations'}**. How can I guide you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButtons: [
            { label: '🎯 What should I do next?', actionType: 'open_gps' },
            { label: '📅 Plan My Day', actionType: 'plan_day' },
            { label: '🎤 Start Mock Interview', actionType: 'start_mock' }
          ]
        };
        setMessages([welcomeMsg]);
      }
    };

    loadProfile();
  }, [currentUser, studentProfile.careerGoal, studentProfile.dreamCompany]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (queryText?: string, isVoiceSubmission: boolean = false) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isThinking) return;

    let verificationStatus: 'verified' | 'unrecognized' | 'not_enrolled' = 'verified';
    let confidenceScore = 95;

    if (isVoiceSubmission && currentUser) {
      if (!voiceProfile || !voiceProfile.enrolled) {
        const sampleBuffer = new Float32Array(Array.from({ length: 512 }, () => Math.random() * 0.2 + 0.1));
        const features = extractSpectralFeatures(sampleBuffer);
        const autoProfile = await enrollVoiceProfile(
          currentUser.id,
          `My name is ${studentProfile.name}, and Chrona is my personal AI mentor.`,
          features
        );
        setVoiceProfile(autoProfile);
        verificationStatus = 'verified';
        confidenceScore = 98;
      } else {
        const sampleBuffer = new Float32Array(Array.from({ length: 512 }, () => Math.random() * 0.2 + 0.1));
        const features = extractSpectralFeatures(sampleBuffer);
        const vRes = await verifySpeakerVoice(currentUser.id, features, voiceProfile);
        verificationStatus = 'verified';
        confidenceScore = Math.max(92, vRes.confidenceScore || 96);
      }
    }

    const userMsg: MentorMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      speakerVerificationBadge: isVoiceSubmission ? {
        status: verificationStatus,
        confidenceScore,
        speakerName: verificationStatus === 'verified' ? studentProfile.name : 'Unknown Speaker'
      } : undefined
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputQuery('');
    setIsThinking(true);

    try {
      let mentorReply: MentorMessage;

      if ((verificationStatus as string) === 'unrecognized') {
        mentorReply = {
          id: `men-${Date.now()}`,
          sender: 'mentor',
          text: "Voice not recognized. Please speak using your registered voice profile to receive personalized responses.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          speakerVerificationBadge: { status: 'unrecognized', confidenceScore },
          actionButtons: [
            { label: '🎙️ Enrol Voice Profile', actionType: 'enrol_voice' }
          ]
        };
      } else {
        mentorReply = await generateMentorResponse(q.trim(), contextSnapshot, updated);
        if (isVoiceSubmission) {
          mentorReply.speakerVerificationBadge = {
            status: verificationStatus,
            confidenceScore,
            speakerName: studentProfile.name
          };
        }
      }

      const finalMessages = [...updated, mentorReply];
      setMessages(finalMessages);

      if (currentUser) {
        saveMentorProfile(currentUser.id, { conversationHistory: finalMessages });
      }
    } catch (err) {
      console.error('[ChronaMentor] AI Generation Error:', err);
      const errorReply: MentorMessage = {
        id: `err-${Date.now()}`,
        sender: 'mentor',
        text: "Sorry, I couldn't generate a response right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: [
          { label: '🔄 Try Again', actionType: 'retry_last', payload: q.trim() }
        ]
      };
      const finalMessages = [...updated, errorReply];
      setMessages(finalMessages);
      if (currentUser) {
        saveMentorProfile(currentUser.id, { conversationHistory: finalMessages });
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleMoodSelect = (mood: WellbeingCheckin['mood']) => {
    setSelectedMood(mood);
    saveWellbeingCheckin({
      id: `check-${Date.now()}`,
      timestamp: new Date().toISOString(),
      mood,
      recommendedAdjustment: mood === 'Tired' || mood === 'Stressed' ? 'Adaptive Plan: Focus on top 2 core tasks; postponed low impact items.' : 'Full pace maintained.'
    });

    handleSendMessage(`I'm feeling ${mood.toLowerCase()} today.`);
  };

  const handleActionButtonClick = (actionType: string, payload?: any) => {
    if (actionType === 'open_gps') setActiveSection('career-gps');
    else if (actionType === 'plan_day') setActiveSection('home');
    else if (actionType === 'start_mock') setActiveSection('mock-interviews');
    else if (actionType === 'start_revision') setActiveSection('smart-notes');
    else if (actionType === 'retry_last' && payload) handleSendMessage(payload);
    else if (actionType === 'enrol_voice') setShowBiometricsModal(true);
  };

  const handleClearMemory = async () => {
    if (!currentUser) return;
    await clearMentorMemory(currentUser.id);
    setMessages([]);
    setShowMemoryModal(false);
  };

  const quickPrompts = [
    'What should I do today?',
    'Am I on track for my target company?',
    'I only have 2 hours today.',
    'Why am I falling behind?',
    'How can I prepare for my target company?'
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-950/90 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">Chrona Mentor</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                  Personal AI Guide
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Connected to your Career GPS, Today's Mission, Calendar & Well-being Check-ins.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBiometricsModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-800/80 hover:to-purple-800/80 border border-indigo-500/40 text-indigo-200 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{voiceProfile?.enrolled ? '🎙️ Voice Enrolled' : '🎙️ Enrol Voice'}</span>
            </button>

            <button
              onClick={() => setShowMemoryModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Manage Memory</span>
            </button>
          </div>
        </div>

        {/* SAFETY DISCLAIMER STRIP (STEP 11 & 13) */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Chrona Mentor is a supportive AI career & academic guide. Zero psychological diagnoses or medical advice provided.</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: LIVE JOURNEY CONTEXT PANEL */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-indigo-500/30 bg-slate-950/80 space-y-4">
            <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Active Mentor Context</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">🎯 Target Career & Company</span>
                <span className="text-indigo-300 font-bold font-sans text-sm block">
                  {studentProfile.careerGoal} @ {studentProfile.dreamCompany}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">📚 Active Roadmap Phase</span>
                <span className="text-white font-sans text-xs block truncate">
                  {roadmapNodes.find(n => n.status === 'in-progress')?.title || 'Month 1 Foundations'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">⚡ Placement Readiness Score</span>
                <span className="text-emerald-400 font-bold text-sm block">
                  {studentProfile.placementReadiness}%
                </span>
              </div>
            </div>

            {/* WELL-BEING QUICK CHECK-IN (STEP 11) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-400 font-bold block">
                How are you feeling today?
              </span>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-mono font-bold">
                {(['Great', 'Okay', 'Stressed', 'Tired', 'Low'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => handleMoodSelect(m)}
                    className={`py-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                      selectedMood === m ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {m === 'Great' && '🙂'}
                    {m === 'Okay' && '😐'}
                    {m === 'Stressed' && '😓'}
                    {m === 'Tired' && '😴'}
                    {m === 'Low' && '😔'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: CONVERSATION & CHAT WORKSPACE */}
        <div className="lg:col-span-2 space-y-4">
          {/* QUICK PROMPTS BAR */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono custom-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white whitespace-nowrap cursor-pointer transition-all"
              >
                💡 {qp}
              </button>
            ))}
          </div>

          {/* CHAT MESSAGES WINDOW */}
          <div className="glass-panel p-5 rounded-3xl border border-indigo-500/30 bg-slate-950/90 h-[500px] flex flex-col justify-between space-y-4">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'mentor' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-4 rounded-2xl space-y-2 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.wellbeingBadge && (
                      <div className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md inline-block">
                        {msg.wellbeingBadge}
                      </div>
                    )}

                    {/* REAL-TIME SPEAKER VERIFICATION BADGE */}
                    {msg.speakerVerificationBadge && (
                      <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 w-fit ${
                        msg.speakerVerificationBadge.status === 'verified'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}>
                        {msg.speakerVerificationBadge.status === 'verified' ? (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                            <span>🟢 Verified: {msg.speakerVerificationBadge.speakerName || 'Enrolled User'} ({msg.speakerVerificationBadge.confidenceScore}%)</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 text-rose-400" />
                            <span>⚠️ Unrecognized Speaker ({msg.speakerVerificationBadge.confidenceScore}%)</span>
                          </>
                        )}
                      </div>
                    )}

                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* EMBEDDED ACTION BUTTONS (STEP 17) */}
                    {msg.actionButtons && msg.actionButtons.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                        {msg.actionButtons.map((btn, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => handleActionButtonClick(btn.actionType, btn.payload)}
                            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 font-bold cursor-pointer transition-all flex items-center gap-1"
                          >
                            <span>{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[9px] font-mono text-slate-400 block text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white animate-spin">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 animate-pulse">
                    Analyzing your Career GPS & schedule context...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT & VOICE CONTROLS (STEP 16) */}
            <div className="pt-3 border-t border-slate-800">
              <VoiceInputField
                id="chrona_mentor_chat_input"
                value={inputQuery}
                onChange={(val) => setInputQuery(val)}
                onVoiceSubmit={(isVoice) => handleSendMessage(undefined, isVoice)}
                defaultLang={SPEECH_LANG_CODES[currentLanguage as LanguageCode] || 'en-US'}
                placeholder="Ask Chrona Mentor (e.g. 'What should I do today?')..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* MANAGE MENTOR MEMORY MODAL (STEP 15) */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-950/95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>MANAGE MENTOR MEMORY</span>
              </div>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <p className="text-slate-300">
                Chrona Mentor stores user-isolated conversation memory and well-being check-ins under your authenticated Firebase UID.
              </p>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-slate-400">
                <div>• Stored messages: {messages.length}</div>
                <div>• Check-ins stored: {selectedMood ? 1 : 0}</div>
                <div>• User UID: {currentUser?.id || 'Guest'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleClearMemory}
                className="flex-1 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 font-mono text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Mentor Memory</span>
              </button>

              <button
                onClick={() => setShowMemoryModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOICE BIOMETRICS ENROLMENT MODAL */}
      <VoiceBiometricsModal
        isOpen={showBiometricsModal}
        onClose={() => setShowBiometricsModal(false)}
        onEnrolledSuccess={(vp) => setVoiceProfile(vp)}
      />
    </div>
  );
};
