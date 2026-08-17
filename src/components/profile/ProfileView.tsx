import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChrona } from '../../context/ChronaContext';
import { getUserCertificatesFromFirestore, type FirestoreCertificate } from '../../services/firebaseService';
import { Award, Code2, ExternalLink, CheckCircle2, Star } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser } = useAuth();
  const { studentProfile } = useChrona();
  const [userCertificates, setUserCertificates] = useState<FirestoreCertificate[]>([]);

  useEffect(() => {
    const loadCerts = async () => {
      if (!currentUser) return;
      const data = await getUserCertificatesFromFirestore(currentUser.id);
      setUserCertificates(data);
    };

    loadCerts();
  }, [currentUser]);

  const hasSkills = studentProfile.skills && studentProfile.skills.length > 0;
  const hasProjects = studentProfile.projects && studentProfile.projects.length > 0;
  const hasCerts = studentProfile.certifications && studentProfile.certifications.length > 0;
  const hasAchieved = studentProfile.achievements && studentProfile.achievements.length > 0;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* PROFILE HEADER */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-purple-950/30">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={studentProfile.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`}
            alt={studentProfile.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-white">{studentProfile.name || 'Chrona Scholar'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {studentProfile.dreamCompany || 'Google'} Target candidate
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium">
              {studentProfile.branch || 'Computer Science & Engineering'} • {studentProfile.semester || 'Semester 1'} • <span className="text-amber-400 font-bold">CGPA: {studentProfile.cgpa || 0.0} / 4.0</span>
            </p>

            <p className="text-xs text-purple-300 font-mono mt-1">
              Goal: {studentProfile.careerGoal || `Software Engineer at ${studentProfile.dreamCompany || 'Google'}`}
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-emerald-500/40">
              <div className="text-[10px] text-slate-400 font-mono">Placement Readiness</div>
              <div className="text-xl font-black text-emerald-400 font-mono">{studentProfile.placementReadiness || 0}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SKILLS */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span>Mastered Technical Skills</span>
          </h3>

          {hasSkills ? (
            <div className="space-y-3">
              {studentProfile.skills.map((sk, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold text-white mb-1">
                    <span>{sk.name}</span>
                    <span className="font-mono text-indigo-400">{sk.rating}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: `${sk.rating}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              No skills recorded yet. Complete missions & study materials to master technical skills.
            </div>
          )}
        </div>

        {/* PROJECTS */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            <span>Featured Portfolio Projects</span>
          </h3>

          {hasProjects ? (
            <div className="space-y-4">
              {studentProfile.projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{proj.title}</span>
                    <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-white">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-300">{proj.desc}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tech.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              No portfolio projects added yet. Complete AI goal roadmaps to record your projects.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CERTIFICATIONS & VERIFIED AI CREDENTIALS */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Verified AI Certificates ({userCertificates.length})</span>
            </h3>
            {userCertificates.length > 0 && (
              <span className="text-xs font-mono text-emerald-400 font-bold">100% Verified</span>
            )}
          </div>

          {userCertificates.length > 0 ? (
            <div className="space-y-3">
              {userCertificates.map(cert => (
                <div key={cert.certificateId} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{cert.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {cert.level} Tier
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic">{cert.description}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                    <span>ID: {cert.verificationCode}</span>
                    <span>Date: {cert.issueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : hasCerts ? (
            <div className="space-y-2">
              {studentProfile.certifications.map((cert, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              No verified certificates earned yet. Complete streaks & Career GPS milestones to generate certificates!
            </div>
          )}
        </div>

        {/* ACHIEVEMENTS */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-3">Key Achievements</h3>
          {hasAchieved ? (
            <div className="space-y-2">
              {studentProfile.achievements.map((ach, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{ach}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              No achievements unlocked yet. Complete daily missions to unlock achievements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
