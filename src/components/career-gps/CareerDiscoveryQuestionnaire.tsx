import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateCareerRecommendations, saveUserCareerAssessment } from '../../services/careerRecommendationEngine';
import { VoiceInputField } from '../common/VoiceInputField';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Target,
  Clock,
  Briefcase,
  Zap
} from 'lucide-react';
import type { CareerAssessmentAnswers, UserCareerAssessmentRecord } from '../../types/chrona';

interface CareerDiscoveryQuestionnaireProps {
  onComplete: (record: UserCareerAssessmentRecord) => void;
  onCancel?: () => void;
}

export const CareerDiscoveryQuestionnaire: React.FC<CareerDiscoveryQuestionnaireProps> = ({
  onComplete,
  onCancel
}) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [answers, setAnswers] = useState<CareerAssessmentAnswers>({
    academicMajor: 'Computer Science / IT',
    enjoyedSubjects: ['Coding & Software', 'Mathematics & Logic'],
    strongestSubjects: ['Problem Solving', 'Data Structures'],
    preferredWorkTypes: ['Coding / Technology', 'Building products'],
    enjoyedActivities: ['Building web apps', 'Solving analytical puzzles'],
    currentSkills: ['Python', 'JavaScript', 'HTML/CSS'],
    skillsToDevelop: ['Machine Learning', 'System Design', 'React'],
    workStyle: 'Both',
    workEnvironment: 'Tech Startup or Innovative Product Company',
    careerPriorities: ['High-growth career', 'High salary', 'Creativity'],
    availablePreparationTime: '6 months',
    interestedIndustries: ['Artificial Intelligence', 'Software & Web Development']
  });

  const toggleArrayItem = (key: keyof CareerAssessmentAnswers, item: string) => {
    setAnswers(prev => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [key]: updated };
    });
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    const recommendations = generateCareerRecommendations(answers);
    const record: UserCareerAssessmentRecord = {
      userId: currentUser?.id || 'guest',
      answers,
      recommendations,
      assessmentUpdatedAt: new Date().toISOString()
    };

    if (currentUser) {
      await saveUserCareerAssessment(currentUser.id, record);
    }

    onComplete(record);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-slate-950/90 space-y-6 animate-fadeIn max-w-3xl mx-auto shadow-2xl">
      {/* HEADER & PROGRESS BAR */}
      <div className="space-y-3 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Career Discovery Questionnaire</h2>
              <p className="text-xs text-slate-400">Step {currentStep} of {totalSteps} — Help Chrona discover your optimal career match</p>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
            >
              Back to Choice
            </button>
          )}
        </div>

        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
          />
        </div>
      </div>

      {/* STEP 1: ACADEMIC BACKGROUND */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            1. What is your current academic major or field of study?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {[
              'Computer Science / IT',
              'Electronics & Electrical Eng',
              'Mechanical / Civil Eng',
              'Data Science & AI',
              'Business & Management',
              'Arts / Design / Humanities',
              'Basic Sciences (Math/Physics)',
              'Other / Self-Taught'
            ].map(major => (
              <button
                key={major}
                type="button"
                onClick={() => setAnswers({ ...answers, academicMajor: major })}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                  answers.academicMajor === major
                    ? 'bg-indigo-950/80 border-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {answers.academicMajor === major ? '✓ ' : ''}{major}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: ENJOYED & STRONGEST SUBJECTS */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-fadeIn">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            2. Which subjects & topics do you enjoy most? (Select multiple)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
            {[
              'Coding & Software',
              'Mathematics & Logic',
              'Design & UI/UX',
              'Data & Analytics',
              'Cybersecurity & Networks',
              'Business & Marketing',
              'Cloud & Infrastructure',
              'AI & Neural Networks',
              'Research & Analysis'
            ].map(sub => {
              const isSel = answers.enjoyedSubjects.includes(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleArrayItem('enjoyedSubjects', sub)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSel
                      ? 'bg-purple-950/80 border-purple-500 text-purple-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isSel ? '✓ ' : ''}{sub}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: WORK TYPES & ACTIVITIES */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            3. What types of work do you enjoy doing?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {[
              'Coding / Technology',
              'Mathematics / Analytics',
              'Designing / Creativity',
              'Research',
              'Communication',
              'Business / Management',
              'Problem Solving',
              'Working with people',
              'Building products'
            ].map(wt => {
              const isSel = answers.preferredWorkTypes.includes(wt);
              return (
                <button
                  key={wt}
                  type="button"
                  onClick={() => toggleArrayItem('preferredWorkTypes', wt)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSel
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {isSel ? '✓ ' : ''}{wt}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <VoiceInputField
              label="Describe any specific activities or hobbies you enjoy:"
              value={answers.additionalNotes || ''}
              onChange={(val) => setAnswers({ ...answers, additionalNotes: val })}
              placeholder="e.g. 'I enjoy creating mobile apps, playing chess, and solving data puzzles...'"
            />
          </div>
        </div>
      )}

      {/* STEP 4: CURRENT SKILLS & DESIRED SKILLS */}
      {currentStep === 4 && (
        <div className="space-y-5 animate-fadeIn">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            4. What skills do you already have, and what would you like to develop?
          </h3>

          <div className="space-y-3">
            <label className="text-xs font-mono text-slate-300 font-bold block">
              Current Skills (Select all that apply):
            </label>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {['Python', 'JavaScript', 'HTML/CSS', 'Java', 'C++', 'SQL', 'Figma', 'Linux', 'Excel'].map(skill => {
                const isSel = answers.currentSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleArrayItem('currentSkills', skill)}
                    className={`px-3 py-1.5 rounded-xl border cursor-pointer ${
                      isSel ? 'bg-indigo-600 text-white border-indigo-400 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isSel ? '✓ ' : ''}{skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono text-slate-300 font-bold block">
              Skills You Desire To Learn:
            </label>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {['Machine Learning', 'React / Next.js', 'System Design', 'Cybersecurity', 'Cloud / AWS', 'UI/UX Design'].map(skill => {
                const isSel = answers.skillsToDevelop.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleArrayItem('skillsToDevelop', skill)}
                    className={`px-3 py-1.5 rounded-xl border cursor-pointer ${
                      isSel ? 'bg-purple-600 text-white border-purple-400 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isSel ? '✓ ' : ''}{skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: WORK STYLE & CAREER PRIORITIES */}
      {currentStep === 5 && (
        <div className="space-y-5 animate-fadeIn">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            5. Work Style & Career Priorities
          </h3>

          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-300 font-bold block">Do you prefer:</span>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {(['Independent', 'Team', 'Both'] as const).map(ws => (
                <button
                  key={ws}
                  type="button"
                  onClick={() => setAnswers({ ...answers, workStyle: ws })}
                  className={`py-2.5 rounded-xl border text-center font-bold cursor-pointer ${
                    answers.workStyle === ws ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {ws}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono text-slate-300 font-bold block">Top Career Priorities (Select multiple):</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              {[
                'High-growth career',
                'High salary',
                'Job stability',
                'Creativity',
                'Social impact',
                'Entrepreneurship',
                'Work-life balance',
                'International opportunities'
              ].map(cp => {
                const isSel = answers.careerPriorities.includes(cp);
                return (
                  <button
                    key={cp}
                    type="button"
                    onClick={() => toggleArrayItem('careerPriorities', cp)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                      isSel ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isSel ? '✓ ' : ''}{cp}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: PREPARATION TIME & INTERESTED INDUSTRIES */}
      {currentStep === 6 && (
        <div className="space-y-5 animate-fadeIn">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            6. How much time are you willing to spend preparing for your goal?
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            {(['3 months', '6 months', '1 year', '2 years'] as const).map(time => (
              <button
                key={time}
                type="button"
                onClick={() => setAnswers({ ...answers, availablePreparationTime: time })}
                className={`p-4 rounded-2xl border text-center font-bold cursor-pointer transition-all ${
                  answers.availablePreparationTime === time
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-purple-400 shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {answers.availablePreparationTime === time ? '✓ ' : ''}{time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800 font-mono text-xs font-bold">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handleNextStep}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/30 transition-all"
        >
          <span>{currentStep === totalSteps ? 'Discover My Best Careers' : 'Next Step'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
