import React, { useState } from 'react';
import { useChrona } from '../../context/ChronaContext';
import type { GoalItem } from '../../types/chrona';
import { CheckCircle2, Circle, Plus, ChevronRight, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, addCustomMission } = useChrona();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<'Career Expansion' | 'Higher Studies & Competitive Exams' | 'Startup & Entrepreneurship'>('Career Expansion');
  const [newGoalDeadline, setNewGoalDeadline] = useState('2027-06-30');
  const [isDeconstructing, setIsDeconstructing] = useState(false);
  const [syncedMissions, setSyncedMissions] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const nvidiaApiKey =
    import.meta.env.VITE_NVIDIA_API_KEY ||
    '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';
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('chrona_gemini_api_key') || '';

  // ── AI Goal DNA Deconstructor using NVIDIA Meta Llama 3.2 90B Vision Instruct & Gemini ──
  const generateAIGoalRoadmap = async (title: string, category: string, deadline: string) => {
    const targetDateObj = new Date(deadline);
    const now = new Date();
    const diffDays = Math.max(14, Math.round((targetDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const formatDate = (daysToAdd: number) => {
      const d = new Date();
      d.setDate(d.getDate() + daysToAdd);
      return d.toISOString().split('T')[0];
    };

    const d1 = formatDate(Math.round(diffDays * 0.25));
    const d2 = formatDate(Math.round(diffDays * 0.50));
    const d3 = formatDate(Math.round(diffDays * 0.75));
    const d4 = deadline;

    const systemPrompt = `You are Chrona AI, an elite System Architect and Career Placement Strategist.
Deconstruct the user's high-level goal into an absolute, highly tailored 4-phase milestone roadmap, AI risk factor prediction, and daily micro-missions.

User Goal: "${title}"
Category: "${category}"
Deadline: "${deadline}" (Total Days Available: ${diffDays} days)

Return ONLY valid JSON with this exact structure:
{
  "milestones": [
    { "title": "Phase 1: Specific foundation milestone for ${title}", "dueDate": "${d1}" },
    { "title": "Phase 2: Specific core build/mastery milestone for ${title}", "dueDate": "${d2}" },
    { "title": "Phase 3: Specific capstone/mock drill milestone for ${title}", "dueDate": "${d3}" },
    { "title": "Phase 4: Specific launch/assessment milestone for ${title}", "dueDate": "${d4}" }
  ],
  "riskScore": "Medium Risk",
  "riskFactor": "Goal-specific risk analysis detailing bottleneck, delay probability, or key recommendations for ${title} given the ${diffDays}-day window.",
  "dailyMissions": [
    "Actionable 45-min daily mission task 1 specifically for ${title}",
    "Actionable 45-min daily mission task 2 specifically for ${title}"
  ]
}`;

    let parsed: any = null;

    // ── Attempt 1: NVIDIA API (meta/llama-3.2-90b-vision-instruct) ──
    if (nvidiaApiKey) {
      try {
        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${nvidiaApiKey}`
          },
          body: JSON.stringify({
            model: 'meta/llama-3.2-90b-vision-instruct',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Deconstruct goal "${title}" into AI roadmap JSON.` }
            ],
            temperature: 0.2,
            max_tokens: 1024
          })
        });

        if (res.ok) {
          const data = await res.json();
          const raw = data.choices?.[0]?.message?.content || '';
          const codeFence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
          const jsonStr = codeFence ? codeFence[1].trim() : (raw.match(/\{[\s\S]*\}/)?.[0] || '');
          if (jsonStr) {
            parsed = JSON.parse(jsonStr);
          }
        }
      } catch (err) {
        console.warn('NVIDIA API call for Goal DNA failed:', err);
      }
    }

    // ── Attempt 2: Google Gemini API (gemini-3.1-flash-lite) ──
    if (!parsed && geminiApiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const codeFence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
          const jsonStr = codeFence ? codeFence[1].trim() : (raw.match(/\{[\s\S]*\}/)?.[0] || '');
          if (jsonStr) {
            parsed = JSON.parse(jsonStr);
          }
        }
      } catch (err) {
        console.warn('Gemini API call for Goal DNA failed:', err);
      }
    }

    // Fallback if APIs offline
    if (!parsed) {
      const t = title.toUpperCase();
      let fallbackMs = [
        { title: `Phase 1: Fundamental Skill Setup (${category})`, dueDate: d1 },
        { title: 'Phase 2: Core Project Build & Implementation', dueDate: d2 },
        { title: 'Phase 3: Applied Practice & Comprehensive Drills', dueDate: d3 },
        { title: 'Phase 4: Final Launch & Assessment Readiness', dueDate: d4 }
      ];
      let fallbackMissions = [
        `Complete 1 Hour Focus Block for ${title}`,
        `Review weekly metrics & target benchmarks for ${title}`
      ];

      if (t.includes('AI') || t.includes('LLM') || t.includes('MACHINE LEARNING')) {
        fallbackMs = [
          { title: 'Math & PyTorch Fundamentals (Linear Algebra, Backprop)', dueDate: d1 },
          { title: 'Transformer Architecture & Fine-Tuning (LoRA, HuggingFace)', dueDate: d2 },
          { title: 'RAG & Vector Search Systems (FAISS, Pinecone)', dueDate: d3 },
          { title: 'Production MLOps & vLLM Deployment Pipelines', dueDate: d4 }
        ];
        fallbackMissions = [
          'Implement Scaled Dot-Product Attention in PyTorch',
          'Build vector index for 10k documents using FAISS'
        ];
      }

      parsed = {
        milestones: fallbackMs,
        riskScore: diffDays < 60 ? 'High Risk' : diffDays < 120 ? 'Medium Risk' : 'Low Risk',
        riskFactor: `Delay Warning: Timeline of ${diffDays} days for "${title}" requires disciplined daily execution.`,
        dailyMissions: fallbackMissions
      };
    }

    return parsed;
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !newGoalDeadline) return;

    setIsDeconstructing(true);

    try {
      const roadmapData = await generateAIGoalRoadmap(newGoalTitle, newGoalCategory, newGoalDeadline);

      const created: GoalItem = {
        id: `g-${Date.now()}`,
        title: newGoalTitle,
        category: newGoalCategory,
        targetDate: newGoalDeadline,
        progress: 0,
        milestones: (roadmapData.milestones || []).map((m: any) => ({
          title: m.title || 'Phase Milestone',
          completed: false,
          dueDate: m.dueDate || newGoalDeadline
        })),
        dependencies: ['DSA Mastery', 'System Design Basics'],
        dailyMissions: Array.isArray(roadmapData.dailyMissions)
          ? roadmapData.dailyMissions.map((dm: any) => typeof dm === 'string' ? dm : dm.task || String(dm))
          : [`Complete 1 Hour Focus Block for ${newGoalTitle}`],
        weeklyMissions: ['Build 1 capstone module', 'Review weekly progress log'],
        predictedCompletionDate: newGoalDeadline,
        riskScore: roadmapData.riskScore || 'Medium Risk',
        riskFactor: roadmapData.riskFactor || `Delay Warning: Timeline requires disciplined daily execution.`
      };

      addGoal(created);
      setNewGoalTitle('');
      setShowGoalModal(false);
      triggerToast('✨ NVIDIA AI Goal DNA Deconstructed & Added!');
    } catch (err) {
      console.error('Goal creation failed:', err);
    } finally {
      setIsDeconstructing(false);
    }
  };

  // ── Sync Daily Mission to Today's Mission Tab ──
  const handleSyncMissionToToday = (taskTitle: string, goalCategory: string) => {
    addCustomMission(
      taskTitle,
      goalCategory,
      45,
      'High',
      `Synced directly from Goal Roadmap: ${goalCategory}`
    );
    setSyncedMissions(prev => ({ ...prev, [taskTitle]: true }));
    triggerToast(`✅ Synced '${taskTitle}' to Today's Mission Tab!`);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12 relative">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-purple-950/95 border border-purple-500/60 text-purple-200 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-slideIn">
          {toastMessage}
        </div>
      )}

      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-purple-950/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
              <span>NVIDIA API • Meta Llama 3.2 90B Vision Instruct Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Goals into Executable Timelines
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              NVIDIA AI automatically breaks user ambitions (GATE, Google, AI Startup) into absolute roadmaps, AI risk factor predictions & syncable daily missions.
            </p>
          </div>

          <button
            id="btn-create-goal"
            onClick={() => setShowGoalModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>➕ Create Long-Term Goal</span>
          </button>
        </div>
      </div>

      {showGoalModal && (
        <div id="modal-create-goal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-purple-500/40 bg-slate-950 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                🚀 NVIDIA AI Goal DNA Deconstructor
              </h3>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 font-semibold mb-1">Goal Ambition Title</label>
                <input
                  id="input-goal-title"
                  type="text"
                  required
                  placeholder="e.g. Crack Google SWE 2027, Build AI Agent Startup, Crack GATE AIR < 100"
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 font-semibold mb-1">Category</label>
                <select
                  id="select-goal-category"
                  value={newGoalCategory}
                  onChange={e => setNewGoalCategory(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-purple-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Career Expansion">Career Expansion</option>
                  <option value="Higher Studies & Competitive Exams">Higher Studies & Competitive Exams</option>
                  <option value="Startup & Entrepreneurship">Startup & Entrepreneurship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 font-semibold mb-1">Target Deadline Date</label>
                <input
                  id="input-goal-deadline"
                  type="date"
                  required
                  value={newGoalDeadline}
                  onChange={e => setNewGoalDeadline(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  disabled={isDeconstructing}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-goal"
                  type="submit"
                  disabled={isDeconstructing || !newGoalTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isDeconstructing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                      <span>Deconstructing with NVIDIA AI...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀 Deconstruct Goal into AI DNA Roadmap</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div id="goals-list-container" className="space-y-6">
        {goals.length === 0 ? (
          <div className="text-center py-12 glass-panel p-8 rounded-3xl border border-purple-500/20 bg-slate-950/60 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Long-Term Goals Created Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Create your first long-term target (GATE, Google, AI Startup). NVIDIA AI will automatically deconstruct it into a 4-phase milestone roadmap & syncable daily missions.
              </p>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Goal</span>
            </button>
          </div>
        ) : (
          goals.map(goal => (
          <div key={goal.id} className="goal-card glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold mb-1">
                  <span>{goal.category}</span>
                  <span>•</span>
                  <span>Target: {goal.targetDate}</span>
                </div>
                <h3 className="goal-title text-xl font-bold text-white">{goal.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">Predicted Completion</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">{goal.predictedCompletionDate}</div>
                </div>
                <span className={`goal-risk-badge text-xs px-3 py-1 rounded-full font-bold font-mono ${
                  goal.riskScore === 'Low Risk'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : goal.riskScore === 'Medium Risk'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {goal.riskScore}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Milestone Progress</span>
                <span className="milestone-progress-pct text-indigo-400 font-bold">{goal.progress}% Completed</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="milestone-progress-fill bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Absolute Milestone Roadmap
                </h4>
                <div className="milestones-list space-y-2">
                  {goal.milestones.map((ms, idx) => (
                    <div key={idx} className="milestone-item p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:border-indigo-500/40 transition-colors">
                      <div className="flex items-center gap-2">
                        {ms.completed ? (
                          <CheckCircle2 className="ms-checkbox w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="ms-checkbox w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={`ms-title ${ms.completed ? 'line-through text-slate-400' : 'text-slate-200 font-semibold'}`}>{ms.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{ms.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono font-bold text-amber-400 uppercase mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> AI Risk Factor Prediction
                  </h4>
                  <div className="risk-prediction-box p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                    <span className="risk-text">⚠️ {goal.riskFactor}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase mb-2">⚡ Auto-Generated Daily Missions</h4>
                  <div className="space-y-2">
                    {goal.dailyMissions.map((dm, idx) => {
                      const isSynced = syncedMissions[dm];
                      return (
                        <div key={idx} className="daily-mission-item p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-300">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{dm}</span>
                          </div>
                          <button
                            onClick={() => handleSyncMissionToToday(dm, goal.category)}
                            disabled={isSynced}
                            className={`btn-sync-mission px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition-colors shrink-0 cursor-pointer ${
                              isSynced
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-default'
                                : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border-purple-500/40'
                            }`}
                          >
                            {isSynced ? 'Synced to Today\'s Mission ✅' : '➕ Sync to Today\'s Mission'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
};
