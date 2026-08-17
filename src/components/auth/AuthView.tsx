import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Star,
  BookOpen,
  GraduationCap,
  Laptop,
  Briefcase,
  Search,
  Rocket,
  Award,
  Wrench,
  ChevronLeft
} from 'lucide-react';
import { getUserDataStore, saveUserDataStore } from '../../utils/authStorage';
import { updateUserProfile } from '../../services/firebaseService';

interface CategoryCard {
  id: string;
  categoryName: string;
  title: string;
  icon: React.ElementType;
  badge: string;
  desc: string;
  color: string;
}

const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'school',
    categoryName: 'School Student',
    title: '📚 School Student',
    icon: BookOpen,
    badge: 'K-12 & Boards',
    desc: 'High school & secondary board exam prep, homework tracking & foundational subjects.',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
  },
  {
    id: 'college',
    categoryName: 'College Student',
    title: '🎓 College Student',
    icon: GraduationCap,
    badge: 'Undergrad & Postgrad',
    desc: 'Degree courses, GPA optimization, campus growth & skill building.',
    color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'engineering',
    categoryName: 'Engineering Student',
    title: '💻 Engineering Student',
    icon: Laptop,
    badge: 'CS/IT & Core',
    desc: 'Software placement prep, coding challenges, system design & FAANG roadmaps.',
    color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'graduate',
    categoryName: 'Graduate',
    title: '🧑‍🎓 Graduate',
    icon: Award,
    badge: 'Degree Holder',
    desc: 'Recent graduates preparing for job searches, higher studies or specialization.',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'professional',
    categoryName: 'Working Professional',
    title: '💼 Working Professional',
    icon: Briefcase,
    badge: 'Industry Expert',
    desc: 'Upskilling, promotions, career advancement & domain switches.',
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
  },
  {
    id: 'jobseeker',
    categoryName: 'Job Seeker / Unemployed',
    title: '🔍 Job Seeker / Unemployed',
    icon: Search,
    badge: 'Placement Ready',
    desc: 'Targeted skill acquisition, resume scoring & mock interview drills.',
    color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30'
  },
  {
    id: 'entrepreneur',
    categoryName: 'Entrepreneur / Startup Founder',
    title: '🚀 Entrepreneur / Founder',
    icon: Rocket,
    badge: 'Business Growth',
    desc: 'Product launching, business strategy, financial modeling & leadership.',
    color: 'from-amber-500/20 to-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  {
    id: 'exam',
    categoryName: 'Government Exam Aspirant',
    title: '📖 Competitive Exam Aspirant',
    icon: ShieldCheck,
    badge: 'UPSC / GATE / SSC',
    desc: 'UPSC, SSC, Banking, GATE, CAT, NEET PG & Govt Groups exam revision.',
    color: 'from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'learner',
    categoryName: 'Skill Learner / Career Switcher',
    title: '🛠️ Skill Learner / Switcher',
    icon: Wrench,
    badge: 'Self-Paced',
    desc: 'Self-paced learning, portfolio projects & transition into tech/new fields.',
    color: 'from-teal-500/20 to-indigo-500/20 text-teal-300 border-teal-500/30'
  }
];

export const AuthView: React.FC = () => {
  const { login, signup, loginWithGoogle, forgotPassword, currentUser } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Multi-step Registration State (1 to 5)
  const [signupStep, setSignupStep] = useState<number>(1);

  // STEP 1: USER CATEGORY
  const [selectedCategory, setSelectedCategory] = useState<string>('Engineering Student');

  // STEP 2: PERSONAL INFO
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [country, setCountry] = useState('India');
  const [stateName, setStateName] = useState('Andhra Pradesh');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');

  // STEP 3: CATEGORY-SPECIFIC FIELDS
  // School Student
  const [schoolGrade, setSchoolGrade] = useState('10th Standard');
  const [schoolBoard, setSchoolBoard] = useState('CBSE');
  const [favoriteSubjects, setFavoriteSubjects] = useState('Mathematics, Physics, Computer Science');

  // College Student
  const [collegeName, setCollegeName] = useState('');
  const [collegeCourse, setCollegeCourse] = useState('B.Tech / B.E.');
  const [collegeYear, setCollegeYear] = useState('3rd Year');
  const [collegeBranch, setCollegeBranch] = useState('Computer Science & Engineering');
  const [cgpa, setCgpa] = useState('8.5');

  // Working Professional
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentRole, setCurrentRole] = useState('Software Engineer');
  const [yearsExp, setYearsExp] = useState('1-3 Years');
  const [desiredRole, setDesiredRole] = useState('Senior AI Architect');

  // Competitive Exam Aspirant
  const [examName, setExamName] = useState('UPSC Civil Services');
  const [examDate, setExamDate] = useState('2026-06-15');
  const [examPrepLevel, setExamPrepLevel] = useState('Intermediate');

  // Entrepreneur
  const [startupStage, setStartupStage] = useState('MVP Stage');
  const [industry, setIndustry] = useState('AI & SaaS');

  // General & Shared
  const [dreamCompany, setDreamCompany] = useState('Google');
  const [dreamRole, setDreamRole] = useState('AI Engineer');
  const [studyHours, setStudyHours] = useState('4 Hours/Day');
  const [currentSkills, setCurrentSkills] = useState('Python, Data Structures, Git');

  // STEP 4: AI GOAL UNDERSTANDING
  const [ultimateGoal, setUltimateGoal] = useState('Become an AI Engineer at Google');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleCompleteSignUp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      setSignupStep(2);
      return;
    }

    setIsLoading(true);
    const finalBranch = collegeBranch || schoolBoard || currentRole || selectedCategory;
    const finalCompany = dreamCompany || 'Google';

    const res = await signup(name, email, password, finalBranch, finalCompany);
    if (res.success) {
      try {
        const uid = currentUser?.id || `user_${Date.now()}`;
        const existingStore = getUserDataStore(uid);
        const updatedProfile = {
          name,
          email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          branch: finalBranch,
          semester: collegeYear || 'Semester 1',
          cgpa: parseFloat(cgpa) || 8.0,
          dreamCompany: finalCompany,
          careerGoal: ultimateGoal || dreamRole || desiredRole || 'Continuous Professional Upskilling',
          userCategory: selectedCategory as any,
          currentRole,
          industry,
          yearsOfExperience: yearsExp,
          preferredLanguage,
          phone,
          country,
          state: stateName,
          timezone,
          educationDetails: {
            schoolGrade,
            schoolBoard,
            favoriteSubjects,
            collegeName,
            collegeCourse,
            collegeYear,
            collegeBranch,
            examName,
            examDate,
            examPrepLevel,
            startupStage
          },
          timeline: studyHours,
          personalizedPreferences: {
            currentSkills,
            ultimateGoal
          },
          placementReadiness: 65,
          resumeScore: 70,
          interviewReadiness: 60,
          codingReadiness: 65,
          projectScore: 70,
          skills: currentSkills.split(',').map(s => ({ name: s.trim(), rating: 75, category: 'General' })),
          projects: [],
          certifications: [],
          achievements: []
        };

        if (existingStore) {
          saveUserDataStore(uid, {
            ...existingStore,
            profile: updatedProfile
          });
        }
        await updateUserProfile(uid, updatedProfile);
      } catch (err) {
        console.warn('Onboarding profile save notice:', err);
      }
    }
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Account registration failed.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'Google Sign-In failed.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    const res = await forgotPassword(email);
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Orbs */}
      <div className="glow-orb-primary -top-40 -left-40 opacity-70" />
      <div className="glow-orb-secondary -bottom-40 -right-40 opacity-70" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 my-auto">
        
        {/* ── LEFT HERO BRANDING & FEATURE SHOWCASE (DESKTOP) ── */}
        <div className="lg:col-span-5 space-y-6 hidden lg:block pr-2">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold shadow-lg shadow-indigo-500/10">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
              <span>CHRONA UNIVERSAL AI PLATFORM v2.5</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
              Built for Every Learner. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Driven by AI Intelligence.
              </span>
            </h1>

            <p className="text-slate-300 text-xs leading-relaxed">
              Whether you are a school student, college scholar, engineering placement aspirant, working professional, or entrepreneur—Chrona tailors every roadmap, focus bubble, and daily mission specifically for your goals.
            </p>
          </div>

          {/* Category Showcase Chips */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-950/70 space-y-3">
            <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-wider block">Universal Category Adaptability</span>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-[11px] font-medium">📚 School K-12</span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[11px] font-medium">💻 SDE Coding</span>
              <span className="px-2.5 py-1 rounded-lg bg-pink-950/60 border border-pink-500/30 text-pink-200 text-[11px] font-medium">💼 Professionals</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-[11px] font-medium">📖 UPSC & Exams</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-200 text-[11px] font-medium">🚀 Founders</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 bg-gradient-to-r from-purple-950/30 to-indigo-950/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold shrink-0">
              ⚡
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[10px] text-slate-300 font-mono ml-1 font-bold">100% Tailored AI</span>
              </div>
              <p className="text-[11px] text-slate-200 font-medium italic">
                "Chrona adapted my daily schedule to match my UPSC GS prelims prep & working hours!"
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT AUTHENTICATION CARD (CARD CONTAINER) ── */}
        <div className="lg:col-span-7 w-full">
          <div className="glass-panel rounded-3xl border border-indigo-500/40 p-6 sm:p-8 shadow-2xl bg-slate-950/95 relative z-10 space-y-6 animate-fadeIn">
            
            {/* Header Logo & Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white font-mono">CHRONA AI</h1>
                  <p className="text-[10px] text-slate-400">Universal Time & Career Operating System</p>
                </div>
              </div>

              {authMode !== 'forgot' && (
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setSignupStep(1);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ── SIGN IN FORM ── */}
            {authMode === 'signin' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-200 flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Or Email Password</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="alex.vance@stanford.edu"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-mono font-bold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Chrona Platform</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── MULTI-STEP REGISTRATION FOR ALL USERS ── */}
            {authMode === 'signup' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Progress Bar Header */}
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    {signupStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setSignupStep(prev => prev - 1)}
                        className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <span className="font-bold text-white">Step {signupStep} of 4</span>
                  </div>
                  <span className="font-mono text-indigo-400 text-[11px] font-bold">
                    {signupStep === 1 && 'Step 1: User Category'}
                    {signupStep === 2 && 'Step 2: Personal Details'}
                    {signupStep === 3 && 'Step 3: Background & Prep'}
                    {signupStep === 4 && 'Step 4: Ultimate AI Goal'}
                  </span>
                </div>

                {/* ── STEP 1 : USER CATEGORY ("Who are you?") ── */}
                {signupStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-white">Who are you?</h3>
                      <p className="text-xs text-slate-400">Select your background so Chrona can tailor every feature specifically for you.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                      {CATEGORY_CARDS.map(card => {
                        const Icon = card.icon;
                        const isSelected = selectedCategory === card.categoryName;
                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => setSelectedCategory(card.categoryName)}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-950/90 via-purple-950/80 to-slate-900 border-indigo-400 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="font-bold text-xs text-white flex items-center gap-1.5">
                                <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                                <span>{card.title}</span>
                              </div>
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-indigo-300 border border-slate-800 shrink-0">
                                {card.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">{card.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSignupStep(2)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2"
                    >
                      <span>Continue with {selectedCategory} Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 2 : PERSONAL INFORMATION ── */}
                {signupStep === 2 && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-white">Personal Information</h3>
                      <p className="text-xs text-slate-400">Account security, localized language & region settings.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-slate-300">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Alex Vance"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-slate-300">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="alex@stanford.edu"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-slate-300">Phone (Optional)</label>
                        <input
                          type="tel"
                          placeholder="+91 9876543210"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-slate-300">Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={e => setCountry(e.target.value)}
                          placeholder="India"
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-slate-300">State / Region</label>
                        <input
                          type="text"
                          value={stateName}
                          onChange={e => setStateName(e.target.value)}
                          placeholder="Andhra Pradesh / Telangana"
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-slate-300">Timezone</label>
                        <select
                          value={timezone}
                          onChange={e => setTimezone(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
                        >
                          <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                          <option value="America/New_York (EST)">America/New_York (EST)</option>
                          <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                          <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT)</option>
                        </select>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-mono font-bold text-slate-300">Preferred Language</label>
                        <select
                          value={preferredLanguage}
                          onChange={e => setPreferredLanguage(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-mono font-bold focus:outline-none"
                        >
                          <option value="English">🌐 English</option>
                          <option value="Telugu">🌐 Telugu (తెలుగు)</option>
                          <option value="Hindi">🌐 Hindi (हिंदी)</option>
                          <option value="Tamil">🌐 Tamil (தமிழ்)</option>
                          <option value="Kannada">🌐 Kannada (కన్నడ)</option>
                          <option value="Malayalam">🌐 Malayalam (മലയാളം)</option>
                          <option value="Marathi">🌐 Marathi (मराठी)</option>
                          <option value="Bengali">🌐 Bengali (বাংলা)</option>
                          <option value="Gujarati">🌐 Gujarati (ગુજરાતી)</option>
                          <option value="Punjabi">🌐 Punjabi (ਪੰਜਾਬੀ)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-slate-300">Password *</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-slate-300">Confirm Password *</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!name || !email || !password) {
                          setErrorMessage('Please fill in Name, Email and Password.');
                          return;
                        }
                        setErrorMessage('');
                        setSignupStep(3);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2"
                    >
                      <span>Proceed to {selectedCategory} Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 3 : CATEGORY-SPECIFIC QUESTIONS ── */}
                {signupStep === 3 && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-white">{selectedCategory} Profile</h3>
                      <p className="text-xs text-slate-400">Tailoring your Chrona modules based on your category.</p>
                    </div>

                    {/* SCHOOL STUDENT */}
                    {selectedCategory === 'School Student' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Class / Grade</label>
                          <select
                            value={schoolGrade}
                            onChange={e => setSchoolGrade(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                          >
                            <option value="Class 8">Class 8th</option>
                            <option value="Class 9">Class 9th</option>
                            <option value="Class 10">Class 10th (SSC / Board)</option>
                            <option value="Class 11">Class 11th (Inter / High School)</option>
                            <option value="Class 12">Class 12th (Senior Secondary)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Education Board</label>
                          <select
                            value={schoolBoard}
                            onChange={e => setSchoolBoard(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                          >
                            <option value="CBSE">CBSE Board</option>
                            <option value="ICSE">ICSE / ISC Board</option>
                            <option value="State Board">State Board</option>
                            <option value="IB">IB / International</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Favorite Subjects</label>
                          <input
                            type="text"
                            value={favoriteSubjects}
                            onChange={e => setFavoriteSubjects(e.target.value)}
                            placeholder="e.g. Mathematics, Physics, Biology"
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* COLLEGE / ENGINEERING STUDENT */}
                    {(selectedCategory === 'College Student' || selectedCategory === 'Engineering Student') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">College / University</label>
                          <input
                            type="text"
                            placeholder="IIT / NIT / Stanford University"
                            value={collegeName}
                            onChange={e => setCollegeName(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Course Degree</label>
                          <input
                            type="text"
                            placeholder="B.Tech / B.E. / B.Sc / BBA"
                            value={collegeCourse}
                            onChange={e => setCollegeCourse(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Branch / Department</label>
                          <input
                            type="text"
                            placeholder="Computer Science / Mechanical / ECE"
                            value={collegeBranch}
                            onChange={e => setCollegeBranch(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Year of Study</label>
                          <select
                            value={collegeYear}
                            onChange={e => setCollegeYear(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                          >
                            <option value="1st Year">1st Year (Freshman)</option>
                            <option value="2nd Year">2nd Year (Sophomore)</option>
                            <option value="3rd Year">3rd Year (Junior)</option>
                            <option value="4th Year">4th Year (Senior)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">CGPA (Optional)</label>
                          <input
                            type="text"
                            placeholder="8.5"
                            value={cgpa}
                            onChange={e => setCgpa(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Current Skills</label>
                          <input
                            type="text"
                            placeholder="Python, React, Data Structures"
                            value={currentSkills}
                            onChange={e => setCurrentSkills(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* WORKING PROFESSIONAL */}
                    {selectedCategory === 'Working Professional' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Current Company</label>
                          <input
                            type="text"
                            placeholder="Google / TCS / Accenture / Startup"
                            value={currentCompany}
                            onChange={e => setCurrentCompany(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Current Role</label>
                          <input
                            type="text"
                            placeholder="Software Engineer / Analyst"
                            value={currentRole}
                            onChange={e => setCurrentRole(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Years of Experience</label>
                          <select
                            value={yearsExp}
                            onChange={e => setYearsExp(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                          >
                            <option value="0-1 Years">&lt; 1 Year (Junior)</option>
                            <option value="1-3 Years">1 - 3 Years (Mid-level)</option>
                            <option value="3-5 Years">3 - 5 Years (Senior)</option>
                            <option value="5+ Years">5+ Years (Lead / Principal)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Desired Target Role</label>
                          <input
                            type="text"
                            placeholder="AI Solutions Architect / Director"
                            value={desiredRole}
                            onChange={e => setDesiredRole(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* COMPETITIVE EXAM ASPIRANT */}
                    {selectedCategory === 'Government Exam Aspirant' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Target Exam Name</label>
                          <select
                            value={examName}
                            onChange={e => setExamName(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                          >
                            <option value="UPSC Civil Services">UPSC Civil Services (IAS/IPS)</option>
                            <option value="SSC CGL">SSC CGL / CHSL</option>
                            <option value="Banking IBPS PO">Banking (IBPS PO / SBI PO)</option>
                            <option value="GATE Computer Science">GATE CS / ECE</option>
                            <option value="CAT MBA Entrance">CAT MBA Entrance</option>
                            <option value="NEET PG">NEET PG Medical</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Target Exam Date</label>
                          <input
                            type="date"
                            value={examDate}
                            onChange={e => setExamDate(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Preparation Level</label>
                          <select
                            value={examPrepLevel}
                            onChange={e => setExamPrepLevel(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                          >
                            <option value="Beginner">Beginner (Starting Prep)</option>
                            <option value="Intermediate">Intermediate (Syllabus 50% Done)</option>
                            <option value="Advanced">Advanced (Revision & Mock Test Sprint)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* ENTREPRENEUR / FOUNDER */}
                    {selectedCategory === 'Entrepreneur / Startup Founder' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Startup Stage</label>
                          <select
                            value={startupStage}
                            onChange={e => setStartupStage(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                          >
                            <option value="Idea Phase">Idea & Market Research Phase</option>
                            <option value="MVP Stage">MVP / Prototype Building</option>
                            <option value="Early Revenue">Early Traction & Revenue</option>
                            <option value="Scaling Phase">Scaling & Growth Stage</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Industry / Sector</label>
                          <input
                            type="text"
                            placeholder="FinTech, HealthTech, AI & SaaS"
                            value={industry}
                            onChange={e => setIndustry(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* SHARED TARGET COMPANY, ROLE & HOURS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Target Role (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. AI Engineer / IAS Officer"
                          value={dreamRole}
                          onChange={e => setDreamRole(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Target Organization (Optional)</label>
                        <select
                          value={dreamCompany}
                          onChange={e => setDreamCompany(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                        >
                          <option value="Google">Google</option>
                          <option value="Microsoft">Microsoft</option>
                          <option value="OpenAI">OpenAI</option>
                          <option value="Amazon">Amazon</option>
                          <option value="Government Body">Government / Public Sector</option>
                          <option value="Self / Startup">Self / Startup</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">Daily Available Learning Hours</label>
                        <select
                          value={studyHours}
                          onChange={e => setStudyHours(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none"
                        >
                          <option value="2 Hours/Day">2 Hours / Day (Light)</option>
                          <option value="4 Hours/Day">4 Hours / Day (Optimal)</option>
                          <option value="6 Hours/Day">6 Hours / Day (Intensive)</option>
                          <option value="8+ Hours/Day">8+ Hours / Day (Full-Time Prep)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSignupStep(4)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2"
                    >
                      <span>Proceed to AI Ultimate Goal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 4 : AI GOAL UNDERSTANDING ("What is your ultimate goal?") ── */}
                {signupStep === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-white">What is your ultimate goal?</h3>
                      <p className="text-xs text-slate-400">Chrona AI will personalize your calendar, study companion, and daily missions around this exact vision.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-bold text-slate-300 block">Choose a Goal Preset or Type Custom Goal:</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Become an AI Engineer',
                          'Crack UPSC Exam',
                          'Become a Software Engineer',
                          'Get placed at Google',
                          'Clear GATE Exam',
                          'Complete Class 10 with distinction',
                          'Grow my Startup to $100k',
                          'Crack NEET PG'
                        ].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setUltimateGoal(preset)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                              ultimateGoal === preset
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                            }`}
                          >
                            🎯 {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-slate-300">Custom Ultimate Goal Statement</label>
                      <input
                        type="text"
                        value={ultimateGoal}
                        onChange={e => setUltimateGoal(e.target.value)}
                        placeholder="e.g. Become an AI Architect at Google by Q4"
                        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold font-mono"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 space-y-1">
                      <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Dashboard Adaptation Ready:
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Chrona will generate customized modules, focus bubble recommendations, and study roadmaps tailored to <strong className="text-white">{selectedCategory}</strong> pursuing <strong className="text-indigo-200">{ultimateGoal}</strong>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCompleteSignUp}
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                          <span>Generating Personalized Dashboard & Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <span>Create My {selectedCategory} Account & Launch Chrona</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authMode === 'forgot' && (
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
                  <p className="text-xs text-slate-400">Enter your email and we'll send password reset instructions.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-slate-300">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="alex.vance@stanford.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
