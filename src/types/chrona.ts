export type NavSection = 
  | 'home'
  | 'chrona-mentor'
  | 'career-gps'
  | 'placement-hub'
  | 'study-companion'
  | 'smart-notes'
  | 'mock-interviews'
  | 'focus-bubble'
  | 'goals'
  | 'calendar'
  | 'analytics'
  | 'profile'
  | 'settings'
  | 'future-modules'
  | 'chrona-connect'
  | 'achievements';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  createdAt: string;
  branch: string;
  dreamCompany: string;
}

export interface UserSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface AIRationale {
  goal: string;
  deadline: string;
  skillGap: string;
  energyLevel: string;
  focusPrediction: string;
  why: string;
}

export interface SmartestAction {
  id: string;
  actionText: string;
  boostText: string;
  targetTopic: string;
  rationale: AIRationale;
  completed: boolean;
}

export interface MissionItem {
  id: string;
  title: string;
  category: string;
  estimatedMinutes: number;
  impact: 'High' | 'Medium' | 'Critical';
  completed: boolean;
  aiRationale: AIRationale;
  createdAt?: string;
  completedAt?: string;
  isUserCreated?: boolean;
}

export interface CareerRoadmapNode {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'locked';
  readinessBoost: string;
  skillsMastered: string[];
  estimatedDays: number;
  iconName: string;
  whyNext: string;
  topics?: string[];
  aiRecommendation?: string;
  dailyTask?: string;
  isCriticalPath?: boolean;
  estimatedWeeks?: number;
}

export interface SkillGapItem {
  skill: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  impact: 'Critical' | 'High' | 'Medium';
  status: 'Mastered' | 'In Progress' | 'Missing';
}

export interface ApplicationTrackerItem {
  id: string;
  company: string;
  role: string;
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Wishlist';
  matchScore: number;
  appliedDate: string;
}

export interface Flashcard {
  question: string;
  answer: string;
  tag: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface ProbableExamQuestion {
  question: string;
  weightage: string;
  probability: number;
  ans?: string;
  modelAnswer?: string;
}

export interface StudyDocument {
  id: string;
  title: string;
  type: 'PDF' | 'PowerPoint' | 'Book' | 'Lecture Notes' | 'Previous Question Paper' | 'Research Paper';
  size: string;
  uploadDate: string;
  fileUrl?: string;
  estimatedStudyTime: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Advanced';
  pages: number;
  smartNotes: string[];
  flashcards: Flashcard[];
  mindMapNodes: MindMapNode[];
  revisionSchedule: { day: string; topic: string; status: string }[];
  quizQuestions: QuizQuestion[];
  probableExamQs: ProbableExamQuestion[];
  importantTopics: string[];
  formulaSheet?: string;
  hasFormulas?: boolean;
}

export interface FormulaItem {
  name: string;
  formula: string;
  context: string;
}

export interface SmartNoteLecture {
  id: string;
  userId?: string;
  title: string;
  course?: string;
  date?: string;
  duration?: string;
  audioFileURL?: string;
  transcript: string;
  executiveSummary: {
    short: string;
    medium: string | string[];
    detailed: string;
  };
  keyConcepts: { term: string; checked: boolean }[];
  definitions?: { term: string; definition: string }[];
  formulas?: string;
  keywords?: string[];
  importantDatesAndFacts?: string[];
  actionItems?: string[];
  revisionCards: { question: string; answer: string; tag?: string }[];
  quiz: {
    type: 'mcq' | 'tf' | 'short';
    q: string;
    options?: string[];
    correct?: number | boolean | string;
    selected?: number | boolean | string | null;
  }[];
  examQuestions: {
    question: string;
    weightage: string;
    probability: number;
    modelAnswer: string;
  }[];
  studyTime: string;
  confidenceScore: number;
  createdAt?: string;
  updatedAt?: string;
}

// ROLE-BASED MOCK INTERVIEW TYPES
export type JobRoleOption = 
  | 'Software Engineer'
  | 'AI/ML Engineer'
  | 'Data Scientist'
  | 'Data Analyst'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'DevOps Engineer'
  | 'Cloud Engineer'
  | 'Cybersecurity Analyst'
  | 'UI/UX Designer'
  | 'Product Manager'
  | 'Business Analyst'
  | 'QA Engineer'
  | 'Mobile App Developer'
  | 'Embedded Systems Engineer'
  | 'Custom';

export type ExperienceLevel = 'Student' | 'Fresher' | 'Experienced';

export type InterviewType = 
  | 'Technical Interview'
  | 'HR Interview'
  | 'Coding Interview'
  | 'Behavioral Interview'
  | 'System Design Interview'
  | 'Aptitude Round'
  | 'Group Discussion'
  | 'Mixed Interview';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Company-Level';

export interface InterviewSetupConfig {
  company: string;
  role: string;
  experienceLevel: ExperienceLevel;
  type: InterviewType;
  difficulty: DifficultyLevel;
}

export interface RoleQuestion {
  id: string;
  question: string;
  category: string;
  expectedTopics: string[];
  codeTemplate?: string;
  userAnswer?: string;
  userCode?: string;
  timeSpentSeconds?: number;
  aiScore?: number;
  aiFeedback?: string;
}

export interface InterviewReport {
  id: string;
  timestamp: string;
  config: InterviewSetupConfig;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  roleReadiness: string;
  strengths: string[];
  weaknesses: string[];
  questions: RoleQuestion[];
}

export interface InterviewMetric {
  confidence: number;
  communication: number;
  technicalAccuracy: number;
  codingSkills: number;
  problemSolving: number;
  eyeContact: number;
  speakingSpeedWpm: number;
  grammar: number;
  bodyLanguage: number;
  overallScore: number;
}

export interface InterviewFeedback {
  metrics: InterviewMetric;
  weakAreas: string[];
  suggestions: string[];
}

export interface FocusSessionResult {
  focusScore: number;
  productivityScore: number;
  distractionCount: number;
  deepWorkTimeMinutes: number;
  energyLevel: 'Peak' | 'Optimal' | 'Medium';
}

export interface GoalItem {
  id: string;
  title: string;
  category: string;
  targetDate: string;
  progress: number;
  milestones: { title: string; completed: boolean; dueDate: string }[];
  dependencies: string[];
  dailyMissions: string[];
  weeklyMissions: string[];
  predictedCompletionDate: string;
  riskScore: 'Low Risk' | 'Medium Risk' | 'High Risk';
  riskFactor: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  day: string;
  category: 'Study' | 'Interview Prep' | 'Project' | 'Revision' | 'Rest';
  isPeakFocus: boolean;
  burnoutWarning?: boolean;
  aiSuggestedAction?: string;
}

export type UserCategory = 
  | 'School Student'
  | 'College Student'
  | 'Engineering Student'
  | 'Medical Student'
  | 'Law Student'
  | 'Arts & Science Student'
  | 'MBA Student'
  | 'Government Exam Aspirant'
  | 'Working Professional'
  | 'Freelancer'
  | 'Entrepreneur'
  | 'Teacher'
  | 'Research Scholar'
  | 'Other';

export interface StudentProfile {
  name: string;
  email: string;
  avatar: string;
  branch: string;
  semester: string;
  cgpa: number;
  dreamCompany: string;
  careerGoal: string;
  userCategory?: UserCategory;
  currentRole?: string;
  industry?: string;
  yearsOfExperience?: string;
  preferredLanguage?: string;
  phone?: string;
  country?: string;
  state?: string;
  timezone?: string;
  educationDetails?: Record<string, any>;
  timeline?: string;
  personalizedPreferences?: Record<string, any>;
  ultimateGoal?: string;
  placementReadiness: number;
  resumeScore: number;
  interviewReadiness: number;
  codingReadiness: number;
  projectScore: number;
  skills: { name: string; rating: number; category: string }[];
  projects: { title: string; desc: string; tech: string[]; link: string }[];
  certifications: string[];
  achievements: string[];
  hasSeenIntro?: boolean;
  leetcodeUsername?: string;
  leetcodeStats?: {
    username: string;
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    ranking: number;
    acceptanceRate?: number;
    contributionPoints?: number;
    streakDays?: number;
    lastSyncedAt: string;
  };
}

export interface UserDataStore {
  missions: MissionItem[];
  roadmapNodes: CareerRoadmapNode[];
  skillGaps: SkillGapItem[];
  applications: ApplicationTrackerItem[];
  studyDocuments: StudyDocument[];
  smartNoteLectures: SmartNoteLecture[];
  goals: GoalItem[];
  calendarEvents: CalendarEventItem[];
  profile: StudentProfile;
  lastResetDate?: string;
  completedHistory?: { id: string; title: string; category: string; completedAt: string }[];
  activeSmartestActionIndex?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionPrompt?: string;
}

export interface WellbeingCheckin {
  id: string;
  timestamp: string;
  mood: 'Great' | 'Okay' | 'Stressed' | 'Tired' | 'Low';
  notes?: string;
  recommendedAdjustment?: string;
}

export interface MentorMessageAction {
  label: string;
  actionType: 'add_mission' | 'plan_day' | 'open_gps' | 'start_mock' | 'start_revision' | 'view_skills' | 'retry_last' | 'enrol_voice';
  payload?: any;
}

export interface MentorMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
  actionButtons?: MentorMessageAction[];
  wellbeingBadge?: string;
  recommendationTopic?: string;
  speakerVerificationBadge?: {
    status: 'verified' | 'unrecognized' | 'not_enrolled';
    confidenceScore: number;
    speakerName?: string;
  };
}

export interface VoiceBiometricsProfile {
  userId: string;
  enrolled: boolean;
  passphrase: string;
  audioFingerprint: number[]; // Spectral feature vector [centroid, energy, zcr, lowBand, midBand, highBand]
  enrolledAt: string;
  updatedAt: string;
}

export interface MentorProfile {
  userId: string;
  mentorName: string;
  preferences: {
    checkinsEnabled: boolean;
    tone: 'supportive' | 'direct' | 'structured';
  };
  wellbeingCheckins: WellbeingCheckin[];
  conversationHistory: MentorMessage[];
  voiceBiometrics?: VoiceBiometricsProfile;
  lastBriefingDate?: string;
  updatedAt: string;
}

export interface CareerAssessmentAnswers {
  academicMajor: string;
  enjoyedSubjects: string[];
  strongestSubjects: string[];
  preferredWorkTypes: string[];
  enjoyedActivities: string[];
  currentSkills: string[];
  skillsToDevelop: string[];
  workStyle: 'Independent' | 'Team' | 'Both';
  workEnvironment: string;
  careerPriorities: string[];
  availablePreparationTime: '3 months' | '6 months' | '1 year' | '2 years';
  interestedIndustries: string[];
  additionalNotes?: string;
}

export interface CareerRecommendationMatch {
  id: string;
  role: string;
  title: string;
  category: string;
  matchPercentage: number;
  whyItSuitsYou: string[];
  strengthsSupporting: string[];
  skillsRequired: string[];
  skillsToDevelop: string[];
  currentSkillGaps: string[];
  typicalWork: string;
  learningDifficulty: 'Beginner Friendly' | 'Moderate' | 'Challenging';
  growthDirection: string;
  suggestedNextSteps: string[];
  suggestedProjects: string[];
  skillProgression: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
  };
}

export interface UserCareerAssessmentRecord {
  userId: string;
  answers: CareerAssessmentAnswers;
  recommendations: CareerRecommendationMatch[];
  selectedCareer?: string;
  assessmentUpdatedAt: string;
}

export interface PlacementReadinessBreakdown {
  overallScore: number;
  technicalSkills: number;
  dsaPerformance: number;
  projectsScore: number;
  communication: number;
  resumeScore: number;
  interviewReadiness: number;
  topPriorityGap: string;
  nextAction: string;
}

export interface PlacementProject {
  id: string;
  name: string;
  description: string;
  technologyUsed: string[];
  skillsDemonstrated: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: 'Idea' | 'Planning' | 'In Progress' | 'Completed';
  startDate?: string;
  completionDate?: string;
  isRecommended?: boolean;
}

export interface PlacementResumeData {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  education: Array<{ degree: string; institution: string; year: string; gpa?: string }>;
  skills: string[];
  projects: Array<{ title: string; tech: string; bullets: string[] }>;
  certifications: string[];
  achievements: string[];
  atsMatchScore: number;
  missingKeywords: string[];
  improvementSuggestions: string[];
  updatedAt: string;
}

export interface CompanyMatchResult {
  id: string;
  companyName: string;
  roleTitle: string;
  matchScore: number;
  breakdown: {
    technicalSkills: number;
    dsa: number;
    projects: number;
    resume: number;
    interview: number;
  };
  biggestGap: string;
  nextAction: string;
  recommendedDsaModule: string;
}

export interface PlacementApplicationRecord {
  id: string;
  company: string;
  role: string;
  status: 'Interested' | 'Preparing' | 'Applied' | 'Assessment' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  matchScore: number;
  appliedDate: string;
  deadline?: string;
  assessmentDate?: string;
  interviewDate?: string;
  notes?: string;
  preparationPlanAdded?: boolean;
}

export interface PlacementProfile {
  userId: string;
  targetRole: string;
  targetCompany: string;
  availablePreparationTime: '3 months' | '6 months' | '1 year' | '2 years';
  readiness: PlacementReadinessBreakdown;
  updatedAt: string;
}
