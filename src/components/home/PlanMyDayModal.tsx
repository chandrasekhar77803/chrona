import React, { useState } from 'react';
import { Clock, Battery, AlertCircle, Calendar, Sparkles, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useChrona } from '../../context/ChronaContext';
import { useAuth } from '../../context/AuthContext';
import { syncDailyPlannerToFirestore } from '../../services/firebaseService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanMyDayModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { studentProfile, roadmapNodes, replaceAllMissions } = useChrona();

  // Step state (1 through 6)
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Question 1: Wake Up Time
  const [wakeTime, setWakeTime] = useState<string>('07:00');

  // Question 2: Sleep Time
  const [sleepTime, setSleepTime] = useState<string>('23:00');

  // Question 3: Fixed Commitments
  const [commitments, setCommitments] = useState<Array<{ name: string; startTime: string; endTime: string }>>([
    { name: 'College / Classes', startTime: '09:00', endTime: '17:00' }
  ]);
  const [newCommitmentName, setNewCommitmentName] = useState<string>('Gym / Travel');
  const [newStartTime, setNewStartTime] = useState<string>('18:00');
  const [newEndTime, setNewEndTime] = useState<string>('19:30');

  // Question 4: Free Time Hours
  const [freeHours, setFreeHours] = useState<number>(4);

  // Question 5: Energy Level
  const [energyLevel, setEnergyLevel] = useState<'High' | 'Medium' | 'Low'>('High');

  // Question 6: Urgent Deadline
  const [urgentDeadline, setUrgentDeadline] = useState<string>('None');

  // Generated Timetable Result
  const [generatedSchedule, setGeneratedSchedule] = useState<Array<{ timeSlot: string; activity: string; category?: string }> | null>(null);

  if (!isOpen) return null;

  const addCommitment = () => {
    if (newCommitmentName.trim()) {
      setCommitments(prev => [...prev, { name: newCommitmentName.trim(), startTime: newStartTime, endTime: newEndTime }]);
      setNewCommitmentName('');
    }
  };

  const removeCommitment = (index: number) => {
    setCommitments(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleGenerateDayPlan = async () => {
    setIsGenerating(true);

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('chrona_gemini_api_key') || '';
    const company = studentProfile.dreamCompany || 'Target Company';
    const role = studentProfile.careerGoal || 'Software Engineer';
    const activeRoadmapStep = roadmapNodes.find(n => n.status === 'in-progress' || n.status === 'upcoming')?.title || 'DSA & System Design Fundamentals';

    const systemPrompt = `You are Chrona AI, an elite AI Day Planner & Academic Coach.
Generate a realistic, optimal daily timetable for a student aiming for ${company} (${role}).

Student Preferences & Constraints:
- Wake Up Time: ${wakeTime} | Sleep Time: ${sleepTime}
- Fixed Commitments: ${JSON.stringify(commitments)}
- Calculated Free Time: ${freeHours} Hours
- Energy Level Today: ${energyLevel}
- Urgent Deadline: ${urgentDeadline}
- Career GPS Focus: "${activeRoadmapStep}" for ${company}

Return ONLY valid JSON array with 6-8 timetable slots:
[
  { "timeSlot": "08:00 AM - 09:00 AM", "activity": "Breakfast & Day Review", "category": "Routine" },
  { "timeSlot": "09:00 AM - 10:30 AM", "activity": "Deep Work: ${activeRoadmapStep}", "category": "Career GPS" },
  { "timeSlot": "10:30 AM - 10:45 AM", "activity": "Hydration & Micro-Break", "category": "Break" },
  { "timeSlot": "10:45 AM - 12:00 PM", "activity": "Solve 5 LeetCode Coding Problems", "category": "Practice" },
  { "timeSlot": "01:00 PM - 02:00 PM", "activity": "Lunch & Relaxation", "category": "Routine" },
  { "timeSlot": "02:00 PM - 03:30 PM", "activity": "System Architecture / Capstone Project", "category": "Project" }
]`;

    let scheduleData: Array<{ timeSlot: string; activity: string; category?: string }> = [];

    if (geminiKey) {
      try {
        const primaryModel = import.meta.env.VITE_GEMINI_PRIMARY_MODEL || 'gemini-3.1-flash-lite';
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const codeFence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
          const jsonStr = codeFence ? codeFence[1].trim() : (raw.match(/\[[\s\S]*\]/)?.[0] || '');
          if (jsonStr) scheduleData = JSON.parse(jsonStr);
        }
      } catch (err) {
        console.warn('Gemini day planner failed, using fallback:', err);
      }
    }

    if (!scheduleData || scheduleData.length === 0) {
      scheduleData = [
        { timeSlot: `${wakeTime} - 08:30 AM`, activity: 'Morning Refreshment & Planning', category: 'Routine' },
        { timeSlot: '09:00 AM - 10:30 AM', activity: `Deep Focus: ${activeRoadmapStep}`, category: 'Career GPS' },
        { timeSlot: '10:30 AM - 10:45 AM', activity: 'Short Rest & Hydration', category: 'Break' },
        { timeSlot: '10:45 AM - 12:15 PM', activity: `Practice Problems for ${company} Interview`, category: 'Practice' },
        { timeSlot: '01:00 PM - 02:00 PM', activity: 'Lunch Break', category: 'Routine' },
        { timeSlot: '03:00 PM - 04:30 PM', activity: `Capstone Portfolio Project Development`, category: 'Project' }
      ];
    }

    setGeneratedSchedule(scheduleData);
    setIsGenerating(false);

    // Push ALL generated tasks to Today's Mission
    const newMissions = scheduleData.map((slot, sIdx) => ({
      id: `plan_task_${Date.now()}_${sIdx}`,
      title: slot.activity,
      category: slot.category || 'AI Day Plan',
      estimatedMinutes: 45,
      impact: (slot.category === 'Career GPS' || slot.category === 'Practice' || slot.category === 'Project' ? 'Critical' : 'High') as 'Critical' | 'High',
      completed: false,
      isUserCreated: true,
      createdAt: new Date().toISOString(),
      aiRationale: {
        goal: `${company} Day Schedule`,
        deadline: 'Today',
        skillGap: slot.category || 'Daily Focus',
        energyLevel: energyLevel,
        focusPrediction: slot.timeSlot,
        why: `Scheduled during ${slot.timeSlot} based on energy level (${energyLevel}) and ${urgentDeadline} priorities.`
      }
    }));

    replaceAllMissions(newMissions);

    // Sync to Firestore
    if (currentUser) {
      syncDailyPlannerToFirestore(currentUser.id, {
        dailySchedule: scheduleData,
        planningPreferences: {
          wakeTime,
          sleepTime,
          energyLevel,
          urgentDeadline,
          availableHours: freeHours
        },
        completedMissions: [],
        skippedMissions: []
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-slate-950/95 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">📅 Plan My Day — AI Assistant</h2>
              <p className="text-xs text-slate-400">Step {step} of 6 • Personalized schedule calculation</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP CONTENT */}
        {!generatedSchedule ? (
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>1. What time did you wake up today?</span>
                </h3>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={e => setWakeTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-mono text-base focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>2. What time will you sleep?</span>
                </h3>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={e => setSleepTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-mono text-base focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-400" />
                  <span>3. What are your fixed commitments today?</span>
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {commitments.map((c, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="text-slate-400 font-mono ml-2">({c.startTime} - {c.endTime})</span>
                      </div>
                      <button onClick={() => removeCommitment(idx)} className="text-rose-400 hover:text-rose-300 font-bold">✕</button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Commitment Name"
                    value={newCommitmentName}
                    onChange={e => setNewCommitmentName(e.target.value)}
                    className="col-span-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                  />
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <button
                  onClick={addCommitment}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-indigo-300 cursor-pointer"
                >
                  + Add Commitment
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>4. How many hours are actually free today?</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Available Study Time</span>
                    <span className="font-extrabold text-emerald-400">{freeHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={freeHours}
                    onChange={e => setFreeHours(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Battery className="w-4 h-4 text-amber-400" />
                  <span>5. What is your energy level today?</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['High', 'Medium', 'Low'] as const).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setEnergyLevel(lvl)}
                      className={`py-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
                        energyLevel === lvl
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {lvl === 'High' ? '⚡ High' : lvl === 'Medium' ? '🔋 Medium' : '🪫 Low'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>6. Is there anything urgent today?</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Assignments', 'Exams', 'Interview', 'Project Deadline', 'None'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setUrgentDeadline(opt)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                        urgentDeadline === opt
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {step > 1 ? (
                <button
                  onClick={() => setStep(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Back
                </button>
              ) : <div />}

              {step < 6 ? (
                <button
                  onClick={() => setStep(prev => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleGenerateDayPlan}
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  <span>{isGenerating ? 'AI Planning Schedule...' : '⚡ Generate Timetable'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* GENERATED TIMETABLE DISPLAY */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between">
              <span>✨ Timetable generated & synced to Today's Mission!</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {generatedSchedule.map((slot, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-mono font-bold text-indigo-400">{slot.timeSlot}</div>
                    <div className="font-bold text-white">{slot.activity}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {slot.category || 'Focus'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs cursor-pointer shadow-xl shadow-indigo-500/20"
            >
              Done & Start My Day 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
