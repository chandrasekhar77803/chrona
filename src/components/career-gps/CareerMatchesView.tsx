import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Sliders,
  RotateCcw,
  ShieldAlert,
  X,
  Target
} from 'lucide-react';
import type { CareerRecommendationMatch, UserCareerAssessmentRecord } from '../../types/chrona';

interface CareerMatchesViewProps {
  assessmentRecord: UserCareerAssessmentRecord;
  onSelectCareer: (selectedRole: string, duration: '3 months' | '6 months' | '1 year' | '2 years') => void;
  onRetakeAssessment: () => void;
}

export const CareerMatchesView: React.FC<CareerMatchesViewProps> = ({
  assessmentRecord,
  onSelectCareer,
  onRetakeAssessment
}) => {
  const [selectedWhyMatch, setSelectedWhyMatch] = useState<CareerRecommendationMatch | null>(null);
  const [selectedExploreMatch, setSelectedExploreMatch] = useState<CareerRecommendationMatch | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedCareerForChoice, setSelectedCareerForChoice] = useState<CareerRecommendationMatch | null>(null);
  const [chosenDuration, setChosenDuration] = useState<'3 months' | '6 months' | '1 year' | '2 years'>(
    assessmentRecord.answers?.availablePreparationTime || '6 months'
  );

  const matches = assessmentRecord.recommendations || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER & DISCLAIMER */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>Your Personal Career Matches</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">
              {matches.length} Paths Discovered
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Analyzed from your academic background, coding/math affinity, work style, and career priorities.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {matches.length >= 2 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Compare Careers</span>
            </button>
          )}

          <button
            onClick={onRetakeAssessment}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4 text-indigo-400" />
            <span>Retake Assessment</span>
          </button>
        </div>
      </div>

      {/* MANDATORY DISCLAIMER STRIP */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 font-mono text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          These recommendations represent fields that match your preferences and strengths based on your answers. You always retain the final choice.
        </span>
      </div>

      {/* RECOMMENDED CAREERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((item, idx) => {
          const rankBadge = idx === 0 ? '🥇 Top Match' : idx === 1 ? '🥈 Strong Match' : idx === 2 ? '🥉 Great Match' : '⭐ Compatible Path';
          const rankBg = idx === 0 ? 'from-amber-500 to-yellow-600' : idx === 1 ? 'from-slate-400 to-slate-500' : 'from-amber-700 to-amber-800';

          return (
            <div
              key={item.id}
              className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 flex flex-col justify-between space-y-5 hover:border-indigo-500/60 transition-all shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 group"
            >
              <div className="space-y-4">
                {/* CARD TOP BADGES */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-white font-mono text-[10px] font-bold bg-gradient-to-r ${rankBg} shadow-md`}>
                    {rankBadge}
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-400 font-mono">{item.matchPercentage}%</span>
                    <span className="text-[10px] font-mono text-slate-400 block">Match Score</span>
                  </div>
                </div>

                {/* ROLE TITLE & CATEGORY */}
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-[11px] font-mono text-indigo-400 block mt-0.5">
                    Category: {item.category} • {item.learningDifficulty}
                  </span>
                </div>

                {/* WHY IT SUITS YOU SUMMARY */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs leading-relaxed text-slate-300 font-mono">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Why it suits you:</span>
                  <p className="line-clamp-3">• {item.whyItSuitsYou[0]}</p>
                </div>

                {/* REQUIRED SKILLS CHIPS */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Core Skills Required:</span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {item.skillsRequired.slice(0, 4).map((sk, sIdx) => (
                      <span key={sIdx} className="px-2.5 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-300">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS STRIP */}
              <div className="space-y-2 pt-3 border-t border-slate-800 font-mono text-xs font-bold">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedWhyMatch(item)}
                    className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Why this?</span>
                  </button>

                  <button
                    onClick={() => setSelectedExploreMatch(item)}
                    className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Explore</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedCareerForChoice(item)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20 transition-all"
                >
                  <Target className="w-4 h-4" />
                  <span>Choose This Career →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: WHY THIS CAREER DETAILED BREAKDOWN */}
      {selectedWhyMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-950 max-w-xl w-full space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  Why {selectedWhyMatch.role}? ({selectedWhyMatch.matchPercentage}% Match)
                </h3>
                <span className="text-xs text-slate-400 font-mono">Detailed suitability report based on your assessment answers</span>
              </div>
              <button onClick={() => setSelectedWhyMatch(null)} className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono text-slate-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                <span className="font-bold text-indigo-300 block text-xs">🎯 Key Suitability Factors:</span>
                {selectedWhyMatch.whyItSuitsYou.map((reason, rIdx) => (
                  <div key={rIdx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <span className="font-bold text-amber-300 block text-xs">💪 Strengths Supporting This Match:</span>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  {selectedWhyMatch.strengthsSupporting.map((str, sIdx) => (
                    <div key={sIdx}>• {str}</div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-purple-300 block text-xs">🛠️ Skills Required & Current Gaps:</span>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-slate-400">
                  <div>• Required: {selectedWhyMatch.skillsRequired.join(', ')}</div>
                  <div>• Gaps to bridge: {selectedWhyMatch.currentSkillGaps.join(', ')}</div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-300 block">Typical Responsibilities:</span>
                <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">{selectedWhyMatch.typicalWork}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  const item = selectedWhyMatch;
                  setSelectedWhyMatch(null);
                  setSelectedCareerForChoice(item);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Select {selectedWhyMatch.role} →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EXPLORE CAREER DEEP DIVE */}
      {selectedExploreMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-950 max-w-2xl w-full space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-black text-white font-mono flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Explore Career: {selectedExploreMatch.title}
                </h3>
                <span className="text-xs text-slate-400 font-mono">Learning Roadmap & Skill Tree Overview</span>
              </div>
              <button onClick={() => setSelectedExploreMatch(null)} className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono text-slate-300 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* SKILL PROGRESSION TREE */}
              <div className="space-y-3">
                <span className="font-bold text-indigo-300 text-xs block">🌱 Skill Progression Tree:</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                    <span className="font-bold text-emerald-400 block text-[11px]">Beginner:</span>
                    {selectedExploreMatch.skillProgression.beginner.map((s, idx) => (
                      <div key={idx} className="text-[10px] text-emerald-200">• {s}</div>
                    ))}
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                    <span className="font-bold text-indigo-400 block text-[11px]">Intermediate:</span>
                    {selectedExploreMatch.skillProgression.intermediate.map((s, idx) => (
                      <div key={idx} className="text-[10px] text-indigo-200">• {s}</div>
                    ))}
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                    <span className="font-bold text-purple-400 block text-[11px]">Advanced:</span>
                    {selectedExploreMatch.skillProgression.advanced.map((s, idx) => (
                      <div key={idx} className="text-[10px] text-purple-200">• {s}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SUGGESTED PROJECTS */}
              <div className="space-y-2">
                <span className="font-bold text-amber-300 text-xs block">🚀 Suggested Real-World Projects:</span>
                {selectedExploreMatch.suggestedProjects.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                    • {p}
                  </div>
                ))}
              </div>

              {/* GROWTH DIRECTION */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-slate-300 block text-xs">📈 Career Growth Trajectory:</span>
                <p className="text-slate-400">{selectedExploreMatch.growthDirection}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  const item = selectedExploreMatch;
                  setSelectedExploreMatch(null);
                  setSelectedCareerForChoice(item);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                <span>Select {selectedExploreMatch.role} →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SIDE-BY-SIDE CAREER COMPARISON */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-950 max-w-4xl w-full space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-black text-white font-mono flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  Career Option Comparison Matrix
                </h3>
                <span className="text-xs text-slate-400 font-mono">Side-by-side evaluation of your recommended career paths</span>
              </div>
              <button onClick={() => setShowComparisonModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar font-mono text-xs max-h-[65vh]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3">Metric / Career</th>
                    {matches.slice(0, 3).map(m => (
                      <th key={m.id} className="p-3 text-white font-bold">{m.role}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-3 font-bold text-slate-400">Match Score</td>
                    {matches.slice(0, 3).map(m => (
                      <td key={m.id} className="p-3 font-bold text-emerald-400">{m.matchPercentage}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-400">Learning Difficulty</td>
                    {matches.slice(0, 3).map(m => (
                      <td key={m.id} className="p-3 text-indigo-300">{m.learningDifficulty}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-400">Primary Skills</td>
                    {matches.slice(0, 3).map(m => (
                      <td key={m.id} className="p-3 text-slate-300">{m.skillsRequired.slice(0, 3).join(', ')}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-400">Suggested Next Step</td>
                    {matches.slice(0, 3).map(m => (
                      <td key={m.id} className="p-3 text-slate-400">{m.suggestedNextSteps[0]}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs font-bold cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM CHOICE & DURATION BEFORE GENERATING CAREER GPS ROADMAP */}
      {selectedCareerForChoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-slate-950 max-w-md w-full space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Confirm Career Choice
                </h3>
                <span className="text-xs text-slate-400 font-mono">Connect to Career GPS Roadmap Engine</span>
              </div>
              <button onClick={() => setSelectedCareerForChoice(null)} className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-1">
                <span className="text-indigo-300 font-bold block text-sm">
                  You selected: {selectedCareerForChoice.title}
                </span>
                <p className="text-slate-300">
                  Career GPS will generate a genuine, progressive multi-month roadmap specifically tailored for {selectedCareerForChoice.role}.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">Select Available Preparation Period:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['3 months', '6 months', '1 year', '2 years'] as const).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setChosenDuration(d)}
                      className={`p-3 rounded-xl border text-center font-bold cursor-pointer ${
                        chosenDuration === d
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-purple-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {chosenDuration === d ? '✓ ' : ''}{d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setSelectedCareerForChoice(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const role = selectedCareerForChoice.role;
                  const duration = chosenDuration;
                  setSelectedCareerForChoice(null);
                  onSelectCareer(role, duration);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Generate GPS Roadmap →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
