import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChrona } from '../../context/ChronaContext';
import { syncCareerGpsToFirestore } from '../../services/firebaseService';
import { generateCareerGpsRoadmap } from '../../services/careerGpsEngine';
import type { MissionItem } from '../../types/chrona';
import { VoiceInputField } from '../common/VoiceInputField';
import {
  Compass,
  ArrowRight,
  Target,
  Building2,
  Upload,
  ChevronLeft,
  GitBranch,
  Globe,
  User,
  Sparkles,
  Loader2,
  Clock,
  Briefcase,
  Award
} from 'lucide-react';

const USER_CATEGORIES = [
  'School Student',
  'College Student',
  'Engineering Student',
  'Medical Student',
  'Law Student',
  'Arts & Science Student',
  'MBA Student',
  'Government Exam Aspirant',
  'Working Professional',
  'Freelancer',
  'Entrepreneur',
  'Teacher',
  'Research Scholar',
  'Other'
];

const DREAM_CAREERS = [
  'AI Engineer',
  'Software Engineer',
  'Data Scientist',
  'Data Analyst',
  'Cybersecurity Engineer',
  'Cloud Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Other'
];

const DREAM_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'Adobe',
  'NVIDIA',
  'Oracle',
  'Deloitte',
  'Accenture',
  'TCS',
  'Infosys',
  'Custom Company'
];

const POPULAR_SKILLS = [
  'Python',
  'Java',
  'C++',
  'JavaScript',
  'TypeScript',
  'SQL',
  'HTML & CSS',
  'React',
  'Node.js',
  'Machine Learning',
  'Deep Learning',
  'Data Structures',
  'Algorithms',
  'Git & GitHub',
  'Docker',
  'AWS & Cloud'
];

export const CareerSetupWizardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { setCareerSetupCompleted, updateStudentProfile, replaceAllMissions } = useChrona();

  // Step state (1 through 10)
  const [step, setStep] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisPhase, setAnalysisPhase] = useState<number>(1);

  // Question 0: User Category Selection
  const [userCategory, setUserCategory] = useState<string>('Engineering Student');

  // Working Professional Extra Fields
  const [currentRole, setCurrentRole] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [yearsExperience, setYearsExperience] = useState<string>('1-3 Years');

  // Question 1: Dream Career (OPTIONAL)
  const [isGoalSkipped, setIsGoalSkipped] = useState<boolean>(false);
  const [careerGoal, setCareerGoal] = useState<string>('AI Engineer');
  const [customGoal, setCustomGoal] = useState<string>('');

  // Question 2: Dream Company (OPTIONAL)
  const [dreamCompany, setDreamCompany] = useState<string>('Google');
  const [customCompany, setCustomCompany] = useState<string>('');

  // Question 3: Available Time (Mandatory)
  const [targetTime, setTargetTime] = useState<string>('6 Months');

  // Question 4: Daily Study Hours
  const [dailyHours, setDailyHours] = useState<number>(4);

  // Question 5: Current Skill Level
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  // Question 6: Current Skills (Multi-select)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Python', 'Git & GitHub']);
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  // Question 7: Projects
  const [hasProjects, setHasProjects] = useState<boolean>(true);
  const [projectDetails, setProjectDetails] = useState<string>('');

  // Question 8: Resume (Optional)
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Question 9: GitHub (Optional)
  const [githubUrl, setGithubUrl] = useState<string>('');

  // Question 10: LinkedIn (Optional)
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills(prev => [...prev, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const handleFinish = async () => {
    setIsAnalyzing(true);
    setAnalysisPhase(1);

    setTimeout(() => setAnalysisPhase(2), 900);
    setTimeout(() => setAnalysisPhase(3), 1800);
    setTimeout(() => setAnalysisPhase(4), 2700);
    setTimeout(() => setAnalysisPhase(5), 3600);

    setTimeout(async () => {
      const finalGoal = isGoalSkipped ? 'Continuous Upskilling & Growth' : (careerGoal === 'Other' ? customGoal || 'Professional Growth' : careerGoal);
      const finalCompany = dreamCompany === 'Custom Company' ? customCompany || 'General Milestone' : dreamCompany;

      // Update student profile state
      updateStudentProfile({
        dreamCompany: finalCompany,
        careerGoal: finalGoal,
        userCategory: userCategory as any,
        currentRole,
        industry,
        yearsOfExperience: yearsExperience,
        placementReadiness: skillLevel === 'Advanced' ? 75 : skillLevel === 'Intermediate' ? 55 : 35,
        skills: selectedSkills.map(s => ({ name: s, rating: 80, category: 'Technical' }))
      });

      // Generate Personalized Roadmap Nodes & Skill Gaps dynamically
      const generatedResult = await generateCareerGpsRoadmap({
        careerGoal: finalGoal,
        targetCompany: finalCompany,
        targetTime,
        dailyHours,
        currentSkills: selectedSkills
      });

      // Save to Firestore under users/{uid}/careerGPS
      if (currentUser) {
        await syncCareerGpsToFirestore(currentUser.id, {
          careerSetupCompleted: true,
          hasCompletedOnboarding: true,
          dreamCareer: finalGoal,
          dreamCompany: finalCompany,
          targetTime,
          dailyHours,
          roadmapNodes: generatedResult.roadmapNodes,
          skillGaps: generatedResult.skillGaps,
          monthlyPlans: generatedResult.monthlyPlans,
          journeyLevel: generatedResult.journeyLevel,
          aiConfidence: generatedResult.aiConfidence,
          nextBestAction: generatedResult.nextBestAction,
          projectedTimeline: generatedResult.projectedTimeline,
          applications: [],
          placementReadiness: skillLevel === 'Advanced' ? 75 : skillLevel === 'Intermediate' ? 55 : 35
        });
      }

      // Generate Today's Mission tasks
      const initialMissions: MissionItem[] = [
        {
          id: `task_init_1_${Date.now()}`,
          title: `Learn ${selectedSkills[0] || 'Python'} Core Fundamentals (${finalCompany} Prep)`,
          category: 'Career GPS',
          estimatedMinutes: 60,
          impact: 'Critical',
          completed: false,
          isUserCreated: true,
          createdAt: new Date().toISOString(),
          aiRationale: {
            goal: `${finalCompany} Technical Round`,
            deadline: 'Today',
            skillGap: 'Language Fundamentals',
            energyLevel: 'High',
            focusPrediction: 'Morning Focus',
            why: `Core requirement to build foundation for ${finalCompany}.`
          }
        },
        {
          id: `task_init_2_${Date.now()}`,
          title: `Solve 5 Array & String Practice Questions`,
          category: 'Practice',
          estimatedMinutes: 45,
          impact: 'High',
          completed: false,
          isUserCreated: true,
          createdAt: new Date().toISOString(),
          aiRationale: {
            goal: `${finalCompany} Coding OA`,
            deadline: 'Today',
            skillGap: 'DSA Practice',
            energyLevel: 'Medium',
            focusPrediction: 'Afternoon Practice',
            why: `Daily coding practice to sharpen accuracy.`
          }
        }
      ];

      replaceAllMissions(initialMissions);

      // Navigate to Career GPS Dashboard
      setCareerSetupCompleted(true);
    }, 4500);
  };

  if (isAnalyzing) {
    return (
      <div className="py-24 text-center space-y-6 animate-fadeIn max-w-lg mx-auto glass-panel p-10 rounded-3xl border border-indigo-500/40 bg-slate-950/95 shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 text-3xl shadow-xl shadow-indigo-500/20">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-black text-white">Chrona AI Career Mentor</h2>
          
          {analysisPhase === 1 && (
            <p className="text-sm font-mono text-indigo-300 animate-fadeIn">🔍 Analyzing your profile...</p>
          )}
          {analysisPhase === 2 && (
            <p className="text-sm font-mono text-purple-300 animate-fadeIn">🏢 Matching company requirements for {dreamCompany}...</p>
          )}
          {analysisPhase === 3 && (
            <p className="text-sm font-mono text-amber-300 animate-fadeIn">📊 Calculating skill gaps...</p>
          )}
          {analysisPhase === 4 && (
            <p className="text-sm font-mono text-emerald-300 animate-fadeIn">🛣️ Building roadmap...</p>
          )}
          {analysisPhase === 5 && (
            <p className="text-sm font-mono text-teal-300 animate-fadeIn">📆 Generating learning schedule...</p>
          )}
        </div>

        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(analysisPhase / 5) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-2xl mx-auto glass-panel p-6 sm:p-10 rounded-3xl border border-indigo-500/30 bg-slate-950/95 shadow-2xl space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Career Setup Wizard</h2>
            <p className="text-xs text-slate-400">Question {step} of 10 • Dedicated AI Onboarding</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(sNum => (
            <div
              key={sNum}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                sNum === step
                  ? 'bg-indigo-500 scale-125'
                  : sNum < step
                  ? 'bg-emerald-400'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* QUESTION 1: USER CATEGORY */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <span>Question 1: Which category describes you best?</span>
            </h3>
            <p className="text-xs text-slate-400">Chrona tailors roadmaps for students, professionals, freelancers & aspirants.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
            {USER_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setUserCategory(cat)}
                className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  userCategory === cat
                    ? 'bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {userCategory === 'Working Professional' && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3 pt-3">
              <span className="font-mono text-indigo-300 text-xs font-bold block">Professional Details:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <VoiceInputField
                  label="Current Job Role"
                  placeholder="e.g. Senior Analyst / Frontend Dev"
                  value={currentRole}
                  onChange={setCurrentRole}
                />
                <VoiceInputField
                  label="Industry / Domain"
                  placeholder="e.g. FinTech / HealthCare / IT"
                  value={industry}
                  onChange={setIndustry}
                />
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">Years of Experience</label>
                  <select
                    value={yearsExperience}
                    onChange={e => setYearsExperience(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none"
                  >
                    <option value="0-1 Years">&lt; 1 Year (Junior)</option>
                    <option value="1-3 Years">1 - 3 Years (Mid)</option>
                    <option value="3-5 Years">3 - 5 Years (Senior)</option>
                    <option value="5+ Years">5+ Years (Lead / Principal)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUESTION 2: DREAM CAREER (OPTIONAL) */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <span>Question 2: What is your dream career? (Optional)</span>
              </h3>
              <p className="text-xs text-slate-400">Target role to focus your personalized learning roadmap.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsGoalSkipped(true);
                setCareerGoal('Continuous Professional Upskilling');
                setStep(4);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold cursor-pointer shrink-0"
            >
              Skip / Decide Later →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DREAM_CAREERS.map(career => (
              <button
                key={career}
                type="button"
                onClick={() => {
                  setCareerGoal(career);
                  setIsGoalSkipped(false);
                }}
                className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  careerGoal === career && !isGoalSkipped
                    ? 'bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {career}
              </button>
            ))}
          </div>

          {careerGoal === 'Other' && (
            <VoiceInputField
              placeholder="Speak or type your custom dream career (e.g. Robotics Engineer)..."
              value={customGoal}
              onChange={setCustomGoal}
            />
          )}

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            ℹ️ You can skip this question. "You can add your dream career later from Career GPS."
          </div>
        </div>
      )}

      {/* QUESTION 2: DREAM COMPANY */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span>Question 2: Which company do you dream of joining?</span>
            </h3>
            <p className="text-xs text-slate-400">Target company for interview pattern alignment.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DREAM_COMPANIES.map(comp => (
              <button
                key={comp}
                onClick={() => setDreamCompany(comp)}
                className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  dreamCompany === comp
                    ? 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>

          {dreamCompany === 'Custom Company' && (
            <VoiceInputField
              placeholder="Speak or type your custom dream company (e.g. OpenAI)..."
              value={customCompany}
              onChange={setCustomCompany}
            />
          )}
        </div>
      )}

      {/* QUESTION 3: TARGET TIME (MANDATORY) */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Question 3: How much time do you have to achieve this goal? (Mandatory)</span>
            </h3>
            <p className="text-xs text-slate-400">Chrona AI will generate a day-by-day roadmap matching this exact deadline.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['3 Months', '6 Months', '12 Months', '18 Months', '24 Months'].map(time => (
              <button
                key={time}
                onClick={() => setTargetTime(time)}
                className={`p-4 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  targetTime === time
                    ? 'bg-gradient-to-r from-amber-900/80 to-indigo-900/80 border-amber-400 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUESTION 4: DAILY STUDY HOURS */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Question 4: How many hours can you study each day?</span>
            </h3>
            <p className="text-xs text-slate-400">Determines daily task volume and practice problem allocation.</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(hrs => (
              <button
                key={hrs}
                onClick={() => setDailyHours(hrs)}
                className={`p-4 rounded-2xl border text-xs font-extrabold text-center transition-all cursor-pointer ${
                  dailyHours === hrs
                    ? 'bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {hrs === 5 ? '5+ Hours' : `${hrs} Hour${hrs > 1 ? 's' : ''}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUESTION 5: CURRENT SKILL LEVEL */}
      {step === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span>Question 5: What is your current skill level?</span>
            </h3>
            <p className="text-xs text-slate-400">Sets the initial starting depth for theory and DSA.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSkillLevel(lvl)}
                className={`p-5 rounded-2xl border text-xs font-extrabold text-center transition-all cursor-pointer ${
                  skillLevel === lvl
                    ? 'bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUESTION 6: TECHNOLOGIES & SKILLS */}
      {step === 6 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              <span>Question 6: Which programming languages and technologies do you already know?</span>
            </h3>
            <p className="text-xs text-slate-400">Select all that apply.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {POPULAR_SKILLS.map(sk => {
              const isSel = selectedSkills.includes(sk);
              return (
                <button
                  key={sk}
                  onClick={() => toggleSkill(sk)}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    isSel
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isSel ? `✓ ${sk}` : sk}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <VoiceInputField
                placeholder="Speak or type custom skill..."
                value={customSkillInput}
                onChange={setCustomSkillInput}
                onVoiceSubmit={addCustomSkill}
              />
            </div>
            <button onClick={addCustomSkill} className="px-4 py-3.5 rounded-2xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-xs font-bold text-purple-300 cursor-pointer">
              + Add
            </button>
          </div>
        </div>
      )}

      {/* QUESTION 7: PROJECTS */}
      {step === 7 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span>Question 7: Have you completed any projects?</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setHasProjects(true)}
              className={`p-5 rounded-2xl border text-xs font-extrabold cursor-pointer ${
                hasProjects ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Yes, I have completed projects
            </button>
            <button
              onClick={() => setHasProjects(false)}
              className={`p-5 rounded-2xl border text-xs font-extrabold cursor-pointer ${
                !hasProjects ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              No, I need to build projects
            </button>
          </div>

          {hasProjects && (
            <VoiceInputField
              isTextArea
              rows={3}
              placeholder="Speak or type your project details (e.g. Built a full-stack e-commerce app with React and Firebase)..."
              value={projectDetails}
              onChange={setProjectDetails}
            />
          )}
        </div>
      )}

      {/* QUESTION 8: RESUME UPLOAD (OPTIONAL) */}
      {step === 8 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              <span>Question 8: Would you like to upload your Resume? (Optional)</span>
            </h3>
            <p className="text-xs text-slate-400">Extracts skills & experience automatically.</p>
          </div>

          <div className="p-8 rounded-3xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/60 text-center space-y-3">
            <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-xs text-slate-300">
              {resumeFile ? `Selected: ${resumeFile.name}` : 'Drag & Drop PDF or Click to Select'}
            </p>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={e => setResumeFile(e.target.files?.[0] || null)}
              className="hidden"
              id="resume-input-wizard"
            />
            <label htmlFor="resume-input-wizard" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer">
              Choose File
            </label>
          </div>
        </div>
      )}

      {/* QUESTION 9: GITHUB (OPTIONAL) */}
      {step === 9 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              <span>Question 9: Would you like to connect GitHub? (Optional)</span>
            </h3>
          </div>

          <input
            type="url"
            placeholder="https://github.com/your-username"
            value={githubUrl}
            onChange={e => setGithubUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white"
          />
        </div>
      )}

      {/* QUESTION 10: LINKEDIN (OPTIONAL) */}
      {step === 10 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              <span>Question 10: Would you like to connect LinkedIn? (Optional)</span>
            </h3>
          </div>

          <input
            type="url"
            placeholder="https://linkedin.com/in/your-profile"
            value={linkedinUrl}
            onChange={e => setLinkedinUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white"
          />
        </div>
      )}

      {/* NAVIGATION FOOTER */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        {step > 1 ? (
          <button
            onClick={() => setStep(prev => prev - 1)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : <div />}

        {step < 10 ? (
          <button
            onClick={() => setStep(prev => prev + 1)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-xl shadow-emerald-500/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>🚀 Complete Setup & Build My Career GPS</span>
          </button>
        )}
      </div>
    </div>
  );
};
