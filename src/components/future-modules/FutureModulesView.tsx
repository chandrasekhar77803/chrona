import React from 'react';
import { Rocket, Sparkles, Cpu, Globe, Award, Briefcase, Trophy, Zap, Users, Dna, Lock } from 'lucide-react';

interface FutureModuleCard {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  tag: string;
  gradient: string;
}

export const FutureModulesView: React.FC = () => {
  const modules: FutureModuleCard[] = [
    { title: 'AI Digital Twin', subtitle: 'Simulate your future self in technical interview scenarios and leadership decisions.', icon: Cpu, tag: 'v3.0 Alpha', gradient: 'from-purple-900/60 to-indigo-900/60' },
    { title: 'Future Simulator', subtitle: 'Predict career outcomes 5 years out based on current study trajectory and skill acquisition.', icon: Sparkles, tag: 'Predictive Engine', gradient: 'from-indigo-900/60 to-pink-900/60' },
    { title: 'Scholarship Finder', subtitle: 'Automated AI search for international research grants and university scholarships.', icon: Award, tag: 'Global Feed', gradient: 'from-emerald-900/60 to-teal-900/60' },
    { title: 'Internship Hub', subtitle: 'Direct AI candidate match matching your Chrona score to top YC & Tier-1 startups.', icon: Briefcase, tag: 'Direct Connect', gradient: 'from-amber-900/60 to-rose-900/60' },
    { title: 'Hackathon Hub', subtitle: 'Find AI co-founders and team members based on complementary skill gaps.', icon: Trophy, tag: 'Teaming Engine', gradient: 'from-indigo-900/60 to-cyan-900/60' },
    { title: 'Startup Builder', subtitle: 'Step-by-step AI guide to turning research capstone projects into funded startups.', icon: Zap, tag: 'Incubator', gradient: 'from-purple-900/60 to-amber-900/60' },
    { title: 'Opportunity Feed', subtitle: 'Real-time feed of referral slots, research openings and open-source bounties.', icon: Globe, tag: 'Live Radar', gradient: 'from-rose-900/60 to-purple-900/60' },
    { title: 'AI Mentor Marketplace', subtitle: '1-on-1 virtual mentoring sessions with AI clones of industry staff engineers.', icon: Users, tag: 'Staff AI', gradient: 'from-teal-900/60 to-indigo-900/60' },
    { title: 'Goal DNA', subtitle: 'Genetic algorithm deconstructing complex career goals into minimal action units.', icon: Dna, tag: 'Genetic AI', gradient: 'from-pink-900/60 to-purple-900/60' },
    { title: 'Career Community', subtitle: 'Peer leaderboard, cohort study rooms, and shared mock interview practices.', icon: Users, tag: 'Peer Network', gradient: 'from-indigo-900/60 to-emerald-900/60' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-purple-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Rocket className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Chrona Future Modules Lab</h1>
            <p className="text-xs text-slate-300">Next-generation features under active development for Chrona OS v3.0</p>
          </div>
        </div>
      </div>

      {/* MODULE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div
              key={idx}
              className={`glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-br ${mod.gradient} glass-card-hover relative overflow-hidden flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-purple-300 border border-purple-500/30">
                    {mod.tag}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white">{mod.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{mod.subtitle}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-purple-400" /> Planned Release
                </span>
                <span className="text-purple-300 font-bold">Chrona OS v3.0</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
