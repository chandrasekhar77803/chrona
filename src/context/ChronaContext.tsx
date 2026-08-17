import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { fetchLeetCodeStats, type LeetCodeStats } from '../services/leetcodeService';
import { type UserIntegrationRecord, subscribeUserIntegrations, connectProvider, disconnectProvider } from '../services/integrationService';
import { getMentorProfile, saveMentorProfile } from '../services/mentorService';
import type { WellbeingCheckin } from '../types/chrona';
import type {
  NavSection,
  MissionItem,
  CareerRoadmapNode,
  SkillGapItem,
  ApplicationTrackerItem,
  StudyDocument,
  SmartNoteLecture,
  GoalItem,
  CalendarEventItem,
  StudentProfile,
  UserDataStore,
  AIRationale,
  ChatMessage,
  SmartestAction
} from '../types/chrona';
import {
  getUserDataStore,
  saveUserDataStore,
  createInitialUserData,
  getTodayDateString
} from '../utils/authStorage';
import {
  getUserGoalsFromFirestore,
  saveGoalToFirestore,
  getUserMissionsFromFirestore,
  saveMissionToFirestore,
  deleteMissionFromFirestore,
  getUserStudyDocumentsFromFirestore,
  saveStudyDocumentToFirestore,
  deleteStudyDocumentFromFirestore,
  getCareerGpsFromFirestore,
  syncCareerGpsToFirestore,
  getUserProfile,
  updateUserProfile,
  getUserSmartNotesFromFirestore,
  saveSmartNoteToFirestore,
  listenUserSmartNotes,
  deleteSmartNoteFromFirestore,
  saveLanguageSettingsToFirestore,
  type FirestoreSmartNote
} from '../services/firebaseService';
import { initialMissions } from '../data/mockData';

interface ChronaContextType {
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
  
  missions: MissionItem[];
  toggleMission: (id: string) => void;
  addCustomMission: (title: string, category: string, estimatedMinutes: number, impact: 'High' | 'Medium' | 'Critical', why?: string) => void;
  replaceAllMissions: (newMissions: MissionItem[]) => void;
  deleteMission: (id: string) => void;
  regenerateMissions: () => void;
  showMissionSuccess: boolean;
  setShowMissionSuccess: (show: boolean) => void;
  
  activeWhyRationale: AIRationale | null;
  openWhyRationale: (rationale: AIRationale) => void;
  closeWhyRationale: () => void;

  activeSmartestAction: SmartestAction;
  completeSmartestAction: () => void;

  careerSetupCompleted: boolean;
  setCareerSetupCompleted: (completed: boolean) => void;
  roadmapNodes: CareerRoadmapNode[];
  skillGaps: SkillGapItem[];
  applications: ApplicationTrackerItem[];
  
  studyDocuments: StudyDocument[];
  addStudyDocument: (doc: StudyDocument) => void;
  deleteStudyDocument: (id: string) => void;
  clearAllStudyDocuments: () => void;
  activeDocument: StudyDocument | null;
  openDocumentWorkspace: (doc: StudyDocument) => void;
  closeDocumentWorkspace: () => void;

  smartNoteLectures: SmartNoteLecture[];
  addSmartNoteLecture: (lecture: SmartNoteLecture) => void;
  saveSmartNote: (note: SmartNoteLecture) => Promise<void>;
  deleteSmartNote: (id: string) => Promise<void>;
  activeSmartNote: SmartNoteLecture | null;
  setActiveSmartNote: (note: SmartNoteLecture | null) => void;

  goals: GoalItem[];
  addGoal: (goal: GoalItem) => void;

  calendarEvents: CalendarEventItem[];
  studentProfile: StudentProfile;
  updateStudentProfile: (updated: Partial<StudentProfile>) => void;
  syncLeetCodeStats: (username: string) => Promise<{ stats: LeetCodeStats; readinessIncreased: boolean }>;

  userIntegrations: Record<string, UserIntegrationRecord>;
  connectUserIntegration: (provider: string, accountIdentifier: string, scopes: string[], statsData?: any) => Promise<UserIntegrationRecord | null>;
  disconnectUserIntegration: (provider: string) => Promise<void>;

  saveWellbeingCheckin: (checkin: WellbeingCheckin) => void;

  isFocusBubbleActive: boolean;
  toggleFocusBubble: (active: boolean) => void;

  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  
  lastResetDate: string;
  nextMidnightFormatted: string;

  isProductTourOpen: boolean;
  openProductTour: () => void;
  closeProductTour: () => void;
}

const ChronaContext = createContext<ChronaContextType | undefined>(undefined);

export const ChronaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showMissionSuccess, setShowMissionSuccess] = useState<boolean>(false);
  const [activeWhyRationale, setActiveWhyRationale] = useState<AIRationale | null>(null);
  const [isProductTourOpen, setIsProductTourOpen] = useState<boolean>(false);

  const openProductTour = () => setIsProductTourOpen(true);
  const closeProductTour = () => setIsProductTourOpen(false);

  // Synchronously compute initial user data store to avoid initial render delay
  const initialStore = useMemo<UserDataStore>(() => {
    if (!currentUser) {
      return createInitialUserData({
        id: 'default',
        name: 'Alex Vance',
        email: 'alex@stanford.edu',
        passwordHash: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '',
        branch: 'Computer Science & Engineering',
        dreamCompany: 'Google'
      });
    }

    let store = getUserDataStore(currentUser.id);
    if (!store || !store.profile) {
      store = createInitialUserData(currentUser);
      saveUserDataStore(currentUser.id, store);
    }
    return store;
  }, [currentUser]);

  // Per-User State
  const [careerSetupCompleted, setCareerSetupCompleted] = useState<boolean>(false);
  const [missions, setMissions] = useState<MissionItem[]>(initialStore.missions || []);
  const [roadmapNodes, setRoadmapNodes] = useState<CareerRoadmapNode[]>(initialStore.roadmapNodes || []);
  const [skillGaps, setSkillGaps] = useState<SkillGapItem[]>(initialStore.skillGaps || []);
  const [applications, setApplications] = useState<ApplicationTrackerItem[]>(initialStore.applications || []);
  const [studyDocuments, setStudyDocuments] = useState<StudyDocument[]>(initialStore.studyDocuments || []);
  const [activeDocument, setActiveDocument] = useState<StudyDocument | null>(null);
  const [smartNoteLectures, setSmartNoteLectures] = useState<SmartNoteLecture[]>(initialStore.smartNoteLectures || []);
  const [goals, setGoals] = useState<GoalItem[]>(initialStore.goals || []);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(initialStore.calendarEvents || []);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(initialStore.profile);
  const [lastResetDate, setLastResetDate] = useState<string>(initialStore.lastResetDate || getTodayDateString());
  const [activeSmartestIndex, setActiveSmartestIndex] = useState<number>(initialStore.activeSmartestActionIndex || 0);

  const [isFocusBubbleActive, setIsFocusBubbleActive] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem('chrona_app_language') || 'English';
  });

  const changeLanguage = async (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('chrona_app_language', lang);

    if (currentUser) {
      const codeMap: Record<string, string> = {
        English: 'en-US',
        Telugu: 'te-IN',
        Hindi: 'hi-IN',
        Tamil: 'ta-IN',
        Kannada: 'kn-IN',
        Malayalam: 'ml-IN',
        Marathi: 'mr-IN',
        Bengali: 'bn-IN',
        Gujarati: 'gu-IN',
        Punjabi: 'pa-IN'
      };

      await saveLanguageSettingsToFirestore(currentUser.id, {
        preferredLanguage: lang,
        speechLanguageCode: codeMap[lang] || 'en-US',
        outputLanguage: lang,
        autoLanguageDetect: true,
        bilingualMode: false,
        updatedAt: new Date().toISOString()
      });

      updateStudentProfile({ preferredLanguage: lang });
    }
  };
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Welcome back ${currentUser?.name || 'Alex'}! Chrona AI has synchronized your ${initialStore.profile.dreamCompany} career roadmap. What would you like to accomplish today?`,
      timestamp: '09:00 AM'
    }
  ]);

  // Sequential AI Smartest Actions Queue tailored to user's dream company & study performance
  const smartestActionsQueue: SmartestAction[] = useMemo(() => {
    const targetComp = studentProfile?.dreamCompany || 'Google';
    return [
      {
        id: 'act_1',
        actionText: 'Solve 2 Graph Problems (Dijkstra)',
        boostText: '+1.8% Placement Readiness',
        targetTopic: 'Graph Algorithms',
        completed: false,
        rationale: {
          goal: `${targetComp} Online Assessment Round`,
          deadline: 'In 12 Days',
          skillGap: 'Graph Shortest Path (65% vs 90% benchmark)',
          energyLevel: 'Peak Energy Window (94% Focus)',
          focusPrediction: 'High Focus Window 09:00 - 11:30 AM',
          why: `Chrona AI predicted your peak cognitive energy occurs right now between 09:00 - 11:30 AM. Graphs make up 78% of ${targetComp} OA rounds. Completing today's Dijkstra problem moves your readiness from ${studentProfile?.placementReadiness || 88.4}% to ${(Number(studentProfile?.placementReadiness || 88.4) + 1.8).toFixed(1)}%.`
        }
      },
      {
        id: 'act_2',
        actionText: 'Master System Design Distributed Caching (Redis)',
        boostText: '+2.1% Placement Readiness',
        targetTopic: 'System Design',
        completed: false,
        rationale: {
          goal: `${targetComp} Technical System Design Interview`,
          deadline: 'In 12 Days',
          skillGap: 'Distributed Systems & Caching',
          energyLevel: 'Optimal Cognitive State',
          focusPrediction: 'High Focus Window 02:00 - 04:00 PM',
          why: `Distributed Caching with Redis is mandatory for ${targetComp} SDE-1 roles. Completing this module increases your technical interview benchmark.`
        }
      },
      {
        id: 'act_3',
        actionText: 'Refine Resume Metrics with Quantitative Quantiles',
        boostText: '+1.5% Placement Readiness',
        targetTopic: 'Resume ATS',
        completed: false,
        rationale: {
          goal: `${targetComp} Recruiter Screening`,
          deadline: 'In 12 Days',
          skillGap: 'Resume Impact Statements',
          energyLevel: 'Moderate Focus',
          focusPrediction: 'Evening Review',
          why: `Adding quantitative throughput numbers (e.g., 50k QPS in RaftKV) increases recruiter interview callbacks by 28%.`
        }
      },
      {
        id: 'act_4',
        actionText: 'Complete Behavioral STAR Mock Interview',
        boostText: '+2.4% Placement Readiness',
        targetTopic: 'Behavioral Round',
        completed: false,
        rationale: {
          goal: `${targetComp} Leadership Principles Round`,
          deadline: 'In 12 Days',
          skillGap: 'STAR Method Fluency',
          energyLevel: 'Peak Communication State',
          focusPrediction: 'Live Video Session',
          why: `Clear STAR method responses in video interviews score in the top 5th percentile for Google and OpenAI interviewer evaluations.`
        }
      }
    ];
  }, [studentProfile]);

  const activeSmartestAction = smartestActionsQueue[activeSmartestIndex % smartestActionsQueue.length];

  // COMPLETE SMARTEST ACTION HANDLER
  const completeSmartestAction = () => {
    const nextIdx = (activeSmartestIndex + 1) % smartestActionsQueue.length;
    setActiveSmartestIndex(nextIdx);

    // Boost placement readiness
    const currentReadiness = studentProfile.placementReadiness || 88.4;
    const newReadiness = Math.min(100, Number((currentReadiness + 1.8).toFixed(1)));
    const updatedProfile = { ...studentProfile, placementReadiness: newReadiness };
    setStudentProfile(updatedProfile);

    // Play celebration confetti
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.2 }
    });

    // Save to store & Firestore
    if (currentUser) {
      const currentStore = getUserDataStore(currentUser.id);
      if (currentStore) {
        saveUserDataStore(currentUser.id, {
          ...currentStore,
          profile: updatedProfile,
          activeSmartestActionIndex: nextIdx
        });
      }
      updateUserProfile(currentUser.id, { placementReadiness: newReadiness });
    }
  };

  // ── 100% Strict User-Isolated Workspace Loader ──
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState<boolean>(false);

  // User Integrations State
  const [userIntegrations, setUserIntegrations] = useState<Record<string, UserIntegrationRecord>>({});

  useEffect(() => {
    if (!currentUser) {
      setUserIntegrations({});
      setMissions([]);
      setRoadmapNodes([]);
      setSkillGaps([]);
      setApplications([]);
      setStudyDocuments([]);
      setSmartNoteLectures([]);
      setGoals([]);
      setCalendarEvents([]);
      setStudentProfile({
        name: 'Scholar',
        email: '',
        avatar: '',
        branch: 'Computer Science & Engineering',
        semester: 'Semester 1',
        cgpa: 0,
        dreamCompany: 'Google',
        careerGoal: 'Software Engineer',
        placementReadiness: 0,
        resumeScore: 0,
        interviewReadiness: 0,
        codingReadiness: 0,
        projectScore: 0,
        skills: [],
        projects: [],
        certifications: [],
        achievements: []
      });
      return;
    }

    const loadUserWorkspace = async () => {
      setIsLoadingWorkspace(true);
      try {
        // First check local user store
        let store = getUserDataStore(currentUser.id);
        if (!store || !store.profile) {
          store = createInitialUserData(currentUser);
          saveUserDataStore(currentUser.id, store);
        }

        // Set baseline user store
        setMissions(store.missions || []);
        setRoadmapNodes(store.roadmapNodes || []);
        setSkillGaps(store.skillGaps || []);
        setApplications(store.applications || []);
        setStudyDocuments(store.studyDocuments || []);
        setSmartNoteLectures(store.smartNoteLectures || []);
        setGoals(store.goals || []);
        setCalendarEvents(store.calendarEvents || []);
        setStudentProfile(store.profile);
        setLastResetDate(store.lastResetDate || getTodayDateString());
        setActiveSmartestIndex(store.activeSmartestActionIndex || 0);

        // Fetch user-isolated records from Cloud Firestore (where userId == auth.currentUser.uid)
        const [fsGoals, fsMissions, fsDocs, fsNotes, fsGps, fsProfile] = await Promise.all([
          getUserGoalsFromFirestore(currentUser.id),
          getUserMissionsFromFirestore(currentUser.id),
          getUserStudyDocumentsFromFirestore(currentUser.id),
          getUserSmartNotesFromFirestore(currentUser.id),
          getCareerGpsFromFirestore(currentUser.id),
          getUserProfile(currentUser.id)
        ]);

        setGoals(fsGoals);
        setMissions(fsMissions);
        setStudyDocuments(fsDocs);
        if (fsNotes.length > 0) {
          setSmartNoteLectures(fsNotes as any);
        }

        if (fsGps && (fsGps.careerSetupCompleted || fsGps.hasCompletedOnboarding)) {
          setCareerSetupCompleted(true);
          setRoadmapNodes(fsGps.roadmapNodes || []);
          setSkillGaps(fsGps.skillGaps || []);
          setApplications(fsGps.applications || []);
        } else {
          setCareerSetupCompleted(false);
          setRoadmapNodes([]);
          setSkillGaps([]);
          setApplications([]);
        }

        if (fsProfile) {
          setStudentProfile(prev => ({
            ...prev,
            name: fsProfile.name || prev.name,
            email: fsProfile.email || prev.email,
            avatar: fsProfile.photoURL || prev.avatar,
            branch: fsProfile.branch || prev.branch,
            dreamCompany: fsProfile.dreamCompany || prev.dreamCompany,
            placementReadiness: fsProfile.placementReadiness ?? prev.placementReadiness
          }));
        }
      } catch (err) {
        console.warn('Workspace loading error:', err);
      } finally {
        setIsLoadingWorkspace(false);
      }
    };

        loadUserWorkspace();

    const unsubscribeNotes = listenUserSmartNotes(currentUser.id, (notes) => {
      if (notes) {
        setSmartNoteLectures(notes as any);
      }
    });

    const unsubscribeIntegrations = subscribeUserIntegrations(currentUser.id, (records) => {
      setUserIntegrations(records);
    });

    return () => {
      if (unsubscribeNotes) unsubscribeNotes();
      if (unsubscribeIntegrations) unsubscribeIntegrations();
    };
  }, [currentUser]);

  // AUTOMATIC 12 AM MIDNIGHT TASK RESET CHECK
  useEffect(() => {
    const checkMidnightReset = () => {
      const today = getTodayDateString();
      if (today !== lastResetDate) {
        const activeRemaining = missions.filter(m => !m.completed);
        const completedToArchive = missions.filter(m => m.completed).map(m => ({
          id: m.id,
          title: m.title,
          category: m.category,
          completedAt: new Date().toISOString()
        }));

        const updatedMissions = activeRemaining.length > 0 ? activeRemaining : initialMissions.map(m => ({ ...m, completed: false }));

        setMissions(updatedMissions);
        setLastResetDate(today);
        setShowMissionSuccess(false);

        if (currentUser && studentProfile) {
          const currentStore = getUserDataStore(currentUser.id);
          const history = currentStore?.completedHistory || [];
          saveUserDataStore(currentUser.id, {
            ...currentStore!,
            missions: updatedMissions,
            lastResetDate: today,
            completedHistory: [...history, ...completedToArchive]
          });
        }
      }
    };

    checkMidnightReset();
    const timer = setInterval(checkMidnightReset, 30000);
    return () => clearInterval(timer);
  }, [lastResetDate, missions, currentUser, studentProfile]);

  // Persist user data store helper
  const syncStore = (updatedStore: Partial<UserDataStore>) => {
    if (!currentUser || !studentProfile) return;
    const currentStore: UserDataStore = {
      missions,
      roadmapNodes,
      skillGaps,
      applications,
      studyDocuments,
      smartNoteLectures,
      goals,
      calendarEvents,
      profile: studentProfile,
      lastResetDate,
      activeSmartestActionIndex: activeSmartestIndex,
      ...updatedStore
    };
    saveUserDataStore(currentUser.id, currentStore);
  };

  // Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleMission = (id: string) => {
    const updated = missions.map(m => {
      if (m.id === id) {
        const item = {
          ...m,
          completed: !m.completed,
          completedAt: !m.completed ? new Date().toISOString() : undefined
        };
        if (currentUser) {
          saveMissionToFirestore(currentUser.id, item);
        }
        return item;
      }
      return m;
    });

    setMissions(updated);
    syncStore({ missions: updated });

    const allDone = updated.length > 0 && updated.every(m => m.completed);
    if (allDone && !showMissionSuccess) {
      setShowMissionSuccess(true);
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  };

  // USER-DEFINED CUSTOM MISSION CREATION
  const addCustomMission = (
    title: string,
    category: string,
    estimatedMinutes: number,
    impact: 'High' | 'Medium' | 'Critical',
    why?: string
  ) => {
    const newMission: MissionItem = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      category: category || 'Custom Goal',
      estimatedMinutes: estimatedMinutes || 30,
      impact: impact || 'High',
      completed: false,
      isUserCreated: true,
      createdAt: new Date().toISOString(),
      aiRationale: {
        goal: `${studentProfile?.dreamCompany || 'Career'} Direct Milestone`,
        deadline: 'User Scheduled Today',
        skillGap: `${category} Focus Task`,
        energyLevel: 'Self-Assigned Focus',
        focusPrediction: 'High Priority Goal',
        why: why || `Custom task added by ${studentProfile?.name || 'Student'} to accelerate ${studentProfile?.dreamCompany || 'career'} readiness.`
      }
    };

    const updated = [newMission, ...missions];
    setMissions(updated);
    setShowMissionSuccess(false);
    syncStore({ missions: updated });

    if (currentUser) {
      saveMissionToFirestore(currentUser.id, newMission);
    }
  };

  const replaceAllMissions = (newMissions: MissionItem[]) => {
    setMissions(newMissions);
    setShowMissionSuccess(false);
    syncStore({ missions: newMissions });

    if (currentUser) {
      newMissions.forEach(m => saveMissionToFirestore(currentUser.id, m));
    }
  };

  const deleteMission = (id: string) => {
    const updated = missions.filter(m => m.id !== id);
    setMissions(updated);
    syncStore({ missions: updated });
    if (currentUser) {
      deleteMissionFromFirestore(id);
    }
  };

  const regenerateMissions = () => {
    const nextRoadmapNode = roadmapNodes.find(n => n.status === 'in-progress' || n.status === 'upcoming');
    const company = studentProfile.dreamCompany || 'Target Company';
    const role = studentProfile.careerGoal || 'Software Engineer';

    const topic = nextRoadmapNode?.topics?.[0] || nextRoadmapNode?.title || 'Data Structures & Core SDE Prep';

    const nextSet: MissionItem[] = [
      {
        id: `gps_task_1_${Date.now()}`,
        title: `Master ${topic} (${company} ${role} Prep)`,
        category: 'Career GPS Roadmap',
        estimatedMinutes: 60,
        impact: 'Critical',
        completed: false,
        aiRationale: {
          goal: `${company} ${role} Placement Readiness`,
          deadline: 'Current Roadmap Phase',
          skillGap: topic,
          energyLevel: 'Peak Focus',
          focusPrediction: 'Deep Work Window',
          why: `Learning ${topic} today increases your readiness for ${company} coding & technical interview rounds.`
        }
      },
      {
        id: `gps_task_2_${Date.now()}`,
        title: `Solve 5 Practice Questions on ${topic}`,
        category: 'Career GPS Practice',
        estimatedMinutes: 45,
        impact: 'High',
        completed: false,
        aiRationale: {
          goal: `${company} Technical Interview`,
          deadline: 'Today',
          skillGap: `Applied Problem Solving in ${topic}`,
          energyLevel: 'Medium Energy',
          focusPrediction: 'Practice Window',
          why: `Solving targeted problem patterns for ${topic} builds practical speed and accuracy for ${company}.`
        }
      }
    ];

    setMissions(prev => [...prev.filter(m => !m.completed), ...nextSet]);
    setShowMissionSuccess(false);
    syncStore({ missions: [...missions, ...nextSet] });

    if (currentUser) {
      nextSet.forEach(m => saveMissionToFirestore(currentUser.id, m));
    }
  };

  const openWhyRationale = (rationale: AIRationale) => {
    setActiveWhyRationale(rationale);
  };

  const closeWhyRationale = () => {
    setActiveWhyRationale(null);
  };

  const addStudyDocument = (docItem: StudyDocument) => {
    const updated = [docItem, ...studyDocuments];
    setStudyDocuments(updated);
    syncStore({ studyDocuments: updated });

    if (currentUser) {
      saveStudyDocumentToFirestore(currentUser.id, docItem);
    }
  };

  const deleteStudyDocument = (id: string) => {
    const updated = studyDocuments.filter(d => d.id !== id);
    setStudyDocuments(updated);
    syncStore({ studyDocuments: updated });
    if (activeDocument?.id === id) {
      setActiveDocument(updated[0] || null);
    }
    if (currentUser) {
      deleteStudyDocumentFromFirestore(id);
    }
  };

  const clearAllStudyDocuments = () => {
    setStudyDocuments([]);
    syncStore({ studyDocuments: [] });
    setActiveDocument(null);
  };

  const openDocumentWorkspace = (docItem: StudyDocument) => {
    setActiveDocument(docItem);
  };

  const closeDocumentWorkspace = () => {
    setActiveDocument(null);
  };

  const [activeSmartNote, setActiveSmartNote] = useState<SmartNoteLecture | null>(null);

  const addSmartNoteLecture = (lecture: SmartNoteLecture) => {
    const updated = [lecture, ...smartNoteLectures];
    setSmartNoteLectures(updated);
    syncStore({ smartNoteLectures: updated });
    if (currentUser) {
      saveSmartNoteToFirestore(currentUser.id, lecture as any);
    }
  };

  const saveSmartNote = async (note: SmartNoteLecture) => {
    if (!currentUser) return;
    const firestoreNote: FirestoreSmartNote = {
      noteId: note.id,
      userId: currentUser.id,
      title: note.title || 'Smart Voice Note',
      audioFileURL: note.audioFileURL || '',
      transcript: note.transcript || '',
      executiveSummary: note.executiveSummary || { short: '', medium: '', detailed: '' },
      keyConcepts: note.keyConcepts || [],
      definitions: note.definitions || [],
      formulas: note.formulas || '',
      keywords: note.keywords || [],
      importantDatesAndFacts: note.importantDatesAndFacts || [],
      actionItems: note.actionItems || [],
      revisionCards: note.revisionCards || [],
      quiz: note.quiz || [],
      examQuestions: note.examQuestions || [],
      studyTime: note.studyTime || '15 mins',
      confidenceScore: note.confidenceScore || 95,
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSmartNoteLectures((prev) => {
      const idx = prev.findIndex((n) => n.id === note.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = note;
        return copy;
      }
      return [note, ...prev];
    });

    setActiveSmartNote(note);
    await saveSmartNoteToFirestore(currentUser.id, firestoreNote);
  };

  const deleteSmartNote = async (id: string) => {
    if (!currentUser) return;
    setSmartNoteLectures((prev) => prev.filter((n) => n.id !== id));
    if (activeSmartNote?.id === id) {
      setActiveSmartNote(null);
    }
    await deleteSmartNoteFromFirestore(currentUser.id, id);
  };

  const addGoal = (goal: GoalItem) => {
    const updated = [goal, ...goals];
    setGoals(updated);
    syncStore({ goals: updated });

    if (currentUser) {
      saveGoalToFirestore(currentUser.id, goal);
    }
  };

  const updateStudentProfile = (updated: Partial<StudentProfile>) => {
    if (!studentProfile) return;
    const newProfile = { ...studentProfile, ...updated };
    setStudentProfile(newProfile);
    syncStore({ profile: newProfile });

    if (currentUser) {
      updateUserProfile(currentUser.id, {
        branch: newProfile.branch,
        dreamCompany: newProfile.dreamCompany,
        placementReadiness: newProfile.placementReadiness,
        leetcodeUsername: newProfile.leetcodeUsername,
        leetcodeStats: newProfile.leetcodeStats
      });
      syncCareerGpsToFirestore(currentUser.id, {
        roadmapNodes,
        skillGaps,
        applications,
        placementReadiness: newProfile.placementReadiness
      });
    }
  };

  // LEETCODE STATS SYNC & READINESS BOOST HANDLER
  const syncLeetCodeStats = async (username: string): Promise<{ stats: LeetCodeStats; readinessIncreased: boolean }> => {
    const newStats = await fetchLeetCodeStats(username);
    const oldMedium = studentProfile?.leetcodeStats?.mediumSolved || 0;
    const isIncrease = newStats.mediumSolved > oldMedium || !studentProfile?.leetcodeStats;

    let updatedReadiness = studentProfile?.placementReadiness || 88.4;
    if (isIncrease) {
      updatedReadiness = Math.min(100, Number((updatedReadiness + 1.2).toFixed(1)));

      // Auto-complete active LeetCode / DSA / Coding missions in Today's Mission (#tab-home)
      const updatedMissions = missions.map(m => {
        const lowerCat = (m.category || '').toLowerCase();
        const lowerTitle = (m.title || '').toLowerCase();
        if (
          !m.completed &&
          (lowerCat.includes('leetcode') ||
           lowerCat.includes('dsa') ||
           lowerCat.includes('coding') ||
           lowerCat.includes('problem solving') ||
           lowerTitle.includes('leetcode') ||
           lowerTitle.includes('dsa') ||
           lowerTitle.includes('coding'))
        ) {
          const item = { ...m, completed: true, completedAt: new Date().toISOString() };
          if (currentUser) saveMissionToFirestore(currentUser.id, item);
          return item;
        }
        return m;
      });

      setMissions(updatedMissions);
      syncStore({ missions: updatedMissions });

      // Celebration Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.3 }
      });
    }

    updateStudentProfile({
      leetcodeUsername: username,
      leetcodeStats: newStats,
      placementReadiness: updatedReadiness
    });

    return { stats: newStats, readinessIncreased: isIncrease };
  };

  const connectUserIntegration = async (
    provider: string,
    accountIdentifier: string,
    scopes: string[],
    statsData?: any
  ): Promise<UserIntegrationRecord | null> => {
    if (!currentUser) return null;
    const record = await connectProvider(currentUser.id, provider, accountIdentifier, scopes, statsData);
    setUserIntegrations(prev => ({ ...prev, [provider]: record }));

    if (provider === 'leetcode' && accountIdentifier) {
      await syncLeetCodeStats(accountIdentifier);
    }

    return record;
  };

  const disconnectUserIntegration = async (provider: string): Promise<void> => {
    if (!currentUser) return;
    await disconnectProvider(currentUser.id, provider);
    setUserIntegrations(prev => {
      const copy = { ...prev };
      delete copy[provider];
      return copy;
    });

    if (provider === 'leetcode') {
      updateStudentProfile({ leetcodeUsername: undefined, leetcodeStats: undefined });
    }
  };

  const saveWellbeingCheckin = async (checkin: WellbeingCheckin) => {
    if (!currentUser) return;
    try {
      const profile = await getMentorProfile(currentUser.id);
      const updatedCheckins = [checkin, ...(profile.wellbeingCheckins || [])];
      await saveMentorProfile(currentUser.id, { wellbeingCheckins: updatedCheckins });
    } catch (err) {
      console.warn('Error saving well-being checkin:', err);
    }
  };

  const toggleFocusBubble = (active: boolean) => {
    setIsFocusBubbleActive(active);
  };

  const sendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    const now = new Date();
    const currentDateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const profile = studentProfile || { name: 'Student', dreamCompany: 'Target Tech Company', targetRole: 'Software Engineer', placementReadiness: 88 };
    const activeTasks = missions.map(m => `• [${m.completed ? 'COMPLETED' : 'PENDING'}] ${m.title} (${m.category}, ${m.estimatedMinutes}m, Impact: ${m.impact})`).slice(0, 8).join('\n');
    const activeGoalsList = goals.map(g => `• ${g.title} (Target: ${g.targetDate})`).slice(0, 5).join('\n');
    const activeDocTitle = activeDocument ? activeDocument.title : (studyDocuments[0]?.title || 'None uploaded yet');
    const roadmapOverview = roadmapNodes.map(r => `• ${r.title} (${r.status})`).slice(0, 3).join('\n');

    const systemPrompt = `You are Chrona AI, an intelligent, precise academic & career AI co-pilot built directly inside the Chrona web application.

REAL-TIME SYSTEM TIMINGS & DATE:
- Current System Date: ${currentDateStr}
- Current Local Time: ${currentTimeStr}
- User Timezone: ${userTimezone}

AUTHENTICATED STUDENT PROFILE & CONTEXT:
- Student Name: ${profile.name}
- Target Goal & Role: ${profile.careerGoal || 'Software Engineer'}
- Target Dream Company: ${profile.dreamCompany || 'Google'}
- Placement Readiness Score: ${profile.placementReadiness}%
- Today's Missions & Tasks (Real-time Status):
${activeTasks || 'No active missions listed.'}
- Career GPS Roadmap Phases:
${roadmapOverview || 'Roadmap pending setup.'}
- Active Long-Term Goals:
${activeGoalsList || 'No active goals listed.'}
- Active Study Document: ${activeDocTitle}

CHRONA PLATFORM MODULES & CAPABILITIES:
1. Today's Mission & Smartest Action: Daily micro-task manager with AI rationale ("Why" modal), midnight reset, and placement readiness booster.
2. AI Master Calendar: Interactive month, week, and day calendar synchronized with missions, deadlines, birthdays, and schedules.
3. AI Study Companion: Document intelligence engine parsing PDF, PPTX, DOCX, TXT, and images. Generates flashcards, summaries, and exam questions.
4. Career GPS: Target role skill gap analyzer, placement readiness metric tracker, and application pipeline.
5. AI Mock Interviews: Real-time voice & coding interview simulator with dynamic company-specific questions.
6. Focus Bubble: Distraction-free Pomodoro focus timer with ambient soundscapes.

BEHAVIOR INSTRUCTIONS:
- You must always be aware of the real-time system date (${currentDateStr}) and current time (${currentTimeStr}).
- If asked about time, dates, schedule, or tasks, provide precise, truthful answers based strictly on the Real-Time Student Context provided above.
- Maintain multi-turn context and refer directly to ${profile.name}'s real-time missions, target company (${profile.dreamCompany}), or active documents.
- Keep responses concise, clear, accurate, and markdown-formatted.`;

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('chrona_gemini_api_key') || '';
    const nvidiaKey = import.meta.env.VITE_NVIDIA_API_KEY || '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';

    let aiAnswer = '';

    // Multi-turn contents payload for Gemini API
    const contentsArray = [
      {
        role: 'user',
        parts: [{ text: `System Context & Instructions:\n${systemPrompt}` }]
      },
      {
        role: 'model',
        parts: [{ text: `Understood. I am Chrona AI, fully synchronized with real-time system date (${currentDateStr}), current time (${currentTimeStr}), and ${profile.name}'s context.` }]
      }
    ];

    chatMessages.slice(-8).forEach(msg => {
      contentsArray.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    contentsArray.push({
      role: 'user',
      parts: [{ text }]
    });

    // ── Attempt 1: Google Gemini API (gemini-3.1-flash-lite) ──
    if (geminiKey) {
      try {
        const primaryConfiguredModel = import.meta.env.VITE_GEMINI_PRIMARY_MODEL || 'gemini-3.1-flash-lite';
        const modelsToTry = Array.from(new Set([
          primaryConfiguredModel,
          'gemini-3.1-flash-lite',
          'gemini-2.5-flash-lite',
          'gemini-2.0-flash-lite',
          'gemini-1.5-flash-lite'
        ]));
        for (const modelName of modelsToTry) {
          if (aiAnswer) break;
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
            const res = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: contentsArray,
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 1024
                }
              })
            });

            if (res.ok) {
              const data = await res.json();
              aiAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            }
          } catch (err) {
            console.warn(`Gemini model ${modelName} chat error:`, err);
          }
        }
      } catch (err) {
        console.warn('Gemini Chat API call error:', err);
      }
    }

    // ── Attempt 2: NVIDIA API (meta/llama-3.2-90b-vision-instruct) ──
    if (!aiAnswer && nvidiaKey) {
      try {
        const nvidiaMessages = [
          { role: 'system', content: systemPrompt }
        ];

        chatMessages.slice(-6).forEach(m => {
          nvidiaMessages.push({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          });
        });

        nvidiaMessages.push({ role: 'user', content: text });

        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${nvidiaKey}`
          },
          body: JSON.stringify({
            model: 'meta/llama-3.2-90b-vision-instruct',
            messages: nvidiaMessages,
            temperature: 0.3,
            max_tokens: 1024
          })
        });

        if (res.ok) {
          const data = await res.json();
          aiAnswer = data.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.warn('NVIDIA Chat API call error:', err);
      }
    }

    // Context-Aware Fallback with Real-Time Timings
    if (!aiAnswer) {
      const lower = text.toLowerCase();
      if (lower.includes('time') || lower.includes('date') || lower.includes('day') || lower.includes('clock')) {
        aiAnswer = `The current system date is **${currentDateStr}** and the current local time is **${currentTimeStr}** (${userTimezone}).`;
      } else if (lower.includes('mission') || lower.includes('task') || lower.includes('today')) {
        const pendingMissions = missions.filter(m => !m.completed);
        if (pendingMissions.length > 0) {
          aiAnswer = `You currently have **${pendingMissions.length} pending missions** for today (${currentDateStr}):\n\n${pendingMissions.map(m => `• **${m.title}** (${m.estimatedMinutes} mins, ${m.category})`).join('\n')}\n\nFocus on completing your top priority task to boost your placement readiness for **${profile.dreamCompany}**!`;
        } else {
          aiAnswer = `All your missions for today (**${currentDateStr}**) are completed! Great job! 🎉`;
        }
      } else if (lower.includes('document') || lower.includes('pdf') || lower.includes('study')) {
        aiAnswer = `Your active study document is **"${activeDocTitle}"**. Open the **Study Companion** tab to solve AI-generated flashcards and exam questions.`;
      } else {
        aiAnswer = `As of **${currentDateStr}** at **${currentTimeStr}**, your placement readiness score for **${profile.dreamCompany}** is **${profile.placementReadiness}%**. Focus on your daily high-impact missions to keep improving your score!`;
      }
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: aiAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, aiMsg]);
  };

  // Next Midnight Calculation
  const nextMidnightFormatted = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    return tomorrow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <ChronaContext.Provider
      value={{
        activeSection,
        setActiveSection,
        theme,
        setTheme,
        toggleTheme,
        currentLanguage,
        changeLanguage,
        missions,
        toggleMission,
        addCustomMission,
        replaceAllMissions,
        deleteMission,
        regenerateMissions,
        showMissionSuccess,
        setShowMissionSuccess,
        activeWhyRationale,
        openWhyRationale,
        closeWhyRationale,
        activeSmartestAction,
        completeSmartestAction,
        careerSetupCompleted,
        setCareerSetupCompleted,
        roadmapNodes,
        skillGaps,
        applications,
        studyDocuments,
        addStudyDocument,
        deleteStudyDocument,
        clearAllStudyDocuments,
        activeDocument,
        openDocumentWorkspace,
        closeDocumentWorkspace,
        smartNoteLectures,
        addSmartNoteLecture,
        saveSmartNote,
        deleteSmartNote,
        activeSmartNote,
        setActiveSmartNote,
        goals,
        addGoal,
        calendarEvents,
        studentProfile,
        updateStudentProfile,
        syncLeetCodeStats,
        userIntegrations,
        connectUserIntegration,
        disconnectUserIntegration,
        saveWellbeingCheckin,
        isFocusBubbleActive,
        toggleFocusBubble,
        isAssistantOpen,
        setIsAssistantOpen,
        chatMessages,
        sendChatMessage,
        lastResetDate,
        nextMidnightFormatted,
        isProductTourOpen,
        openProductTour,
        closeProductTour
      }}
    >
      {isLoadingWorkspace && (
        <div className="fixed inset-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-3 p-6 rounded-2xl glass-panel border border-indigo-500/30">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 animate-spin font-bold">
              ⚡
            </div>
            <p className="text-xs font-mono text-slate-300 font-semibold">Synchronizing Private User Workspace...</p>
          </div>
        </div>
      )}
      {children}
    </ChronaContext.Provider>
  );
};

export const useChrona = () => {
  const context = useContext(ChronaContext);
  if (!context) {
    throw new Error('useChrona must be used within a ChronaProvider');
  }
  return context;
};
