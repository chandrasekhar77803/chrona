import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type {
  GoalItem,
  MissionItem,
  CareerRoadmapNode,
  SkillGapItem,
  ApplicationTrackerItem,
  StudyDocument
} from '../types/chrona';

export interface FirestoreUserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  branch: string;
  semester: string;
  college: string;
  careerGoal: string;
  dreamCompany: string;
  dreamRole: string;
  createdAt: string;
  lastLogin: string;
  profileCompletion: number;
  placementReadiness: number;
  focusScore: number;
  leetcodeUsername?: string;
  leetcodeStats?: any;
  currentStreak: number;
  theme: 'dark' | 'light';
  language: string;
  hasSeenIntro?: boolean;
}

// ─── USER PROFILE FIRESTORE HELPERS ──────────────────────────────────────

export async function createUserProfileDocument(
  uid: string,
  data: Partial<FirestoreUserProfile>
): Promise<FirestoreUserProfile> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newProfile: FirestoreUserProfile = {
      uid,
      name: data.name || 'Chrona Scholar',
      email: data.email || '',
      photoURL: data.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      branch: data.branch || 'Computer Science & Engineering',
      semester: data.semester || 'Semester 6',
      college: data.college || 'Tier-1 Tech University',
      careerGoal: data.careerGoal || 'Software Engineer',
      dreamCompany: data.dreamCompany || 'Google',
      dreamRole: data.dreamRole || 'SDE-1',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileCompletion: 25,
      placementReadiness: data.placementReadiness || 0.0,
      focusScore: 0,
      currentStreak: 0,
      theme: 'dark',
      language: 'en'
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  } else {
    // Update lastLogin
    const existing = snap.data() as FirestoreUserProfile;
    const updated = { ...existing, lastLogin: new Date().toISOString() };
    await updateDoc(userRef, { lastLogin: updated.lastLogin });
    return updated;
  }
}

export async function getUserProfile(uid: string): Promise<FirestoreUserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as FirestoreUserProfile;
    }
  } catch (err) {
    console.warn('Error getting user profile from Firestore:', err);
  }
  return null;
}

export async function updateUserProfile(uid: string, updates: Partial<FirestoreUserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { ...updates, updatedAt: serverTimestamp() });
  } catch (err) {
    console.warn('Error updating user profile in Firestore:', err);
  }
}

// ─── GOALS COLLECTION FIRESTORE HELPERS ─────────────────────────────────

export async function saveGoalToFirestore(userId: string, goal: GoalItem): Promise<void> {
  try {
    const goalRef = doc(db, 'goals', goal.id);
    await setDoc(goalRef, {
      goalId: goal.id,
      userId,
      goalTitle: goal.title,
      goalDescription: goal.category,
      priority: 'High',
      targetDate: goal.targetDate,
      status: goal.progress >= 100 ? 'Completed' : 'In Progress',
      progress: goal.progress,
      createdAt: new Date().toISOString(),
      milestones: goal.milestones,
      dailyMissions: goal.dailyMissions,
      weeklyMissions: goal.weeklyMissions || [],
      predictedCompletionDate: goal.predictedCompletionDate || goal.targetDate,
      riskScore: goal.riskScore || 'Low Risk',
      riskFactor: goal.riskFactor || ''
    });
  } catch (err) {
    console.warn('Error saving goal to Firestore:', err);
  }
}

export async function getUserGoalsFromFirestore(userId: string): Promise<GoalItem[]> {
  try {
    const q = query(collection(db, 'goals'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const goals: GoalItem[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      goals.push({
        id: data.goalId || docSnap.id,
        title: data.goalTitle || 'Goal',
        category: data.goalDescription || 'Career',
        targetDate: data.targetDate || '',
        progress: data.progress || 0,
        milestones: data.milestones || [],
        dependencies: ['DSA Mastery', 'System Design'],
        dailyMissions: data.dailyMissions || [],
        weeklyMissions: data.weeklyMissions || [],
        predictedCompletionDate: data.predictedCompletionDate || data.targetDate,
        riskScore: data.riskScore || 'Low Risk',
        riskFactor: data.riskFactor || ''
      });
    });
    return goals;
  } catch (err) {
    console.warn('Error loading user goals from Firestore:', err);
    return [];
  }
}

// ─── TASKS / MISSIONS COLLECTION FIRESTORE HELPERS ──────────────────────

export async function saveMissionToFirestore(userId: string, mission: MissionItem): Promise<void> {
  try {
    const taskRef = doc(db, 'tasks', mission.id);
    await setDoc(taskRef, {
      taskId: mission.id,
      missionId: mission.id,
      userId,
      title: mission.title,
      description: mission.aiRationale?.why || mission.category,
      priority: mission.impact || 'High',
      deadline: 'Today',
      status: mission.completed ? 'Completed' : 'Pending',
      category: mission.category,
      estimatedTime: mission.estimatedMinutes || 30,
      completedTime: mission.completed ? (mission.estimatedMinutes || 30) : 0,
      completed: mission.completed,
      aiRationale: mission.aiRationale || null,
      isUserCreated: Boolean(mission.isUserCreated),
      createdAt: mission.createdAt || new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error saving mission/task to Firestore:', err);
  }
}

export async function getUserMissionsFromFirestore(userId: string): Promise<MissionItem[]> {
  try {
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const missions: MissionItem[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      missions.push({
        id: d.taskId || d.missionId || docSnap.id,
        title: d.title || 'Task',
        category: d.category || 'General',
        estimatedMinutes: d.estimatedTime || 30,
        impact: d.priority || 'High',
        completed: Boolean(d.completed || d.status === 'Completed'),
        isUserCreated: Boolean(d.isUserCreated),
        createdAt: d.createdAt,
        aiRationale: d.aiRationale || {
          goal: 'Career Target',
          deadline: 'Today',
          skillGap: d.category,
          energyLevel: 'Optimal',
          focusPrediction: 'High Deep Work',
          why: d.description || 'Actionable task to boost placement readiness.'
        }
      });
    });
    return missions;
  } catch (err) {
    console.warn('Error loading tasks/missions from Firestore:', err);
    return [];
  }
}

export async function deleteMissionFromFirestore(taskId: string): Promise<void> {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (err) {
    console.warn('Error deleting task from Firestore:', err);
  }
}

// ─── STUDY COMPANION & STORAGE FIRESTORE HELPERS ─────────────────────────

export async function uploadStudyDocumentFile(
  userId: string,
  docId: string,
  file: File
): Promise<string> {
  try {
    const storageRef = ref(storage, `documents/${userId}/${docId}_${file.name}`);
    const snap = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snap.ref);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase Storage upload failed:', err);
    return '';
  }
}

export async function saveStudyDocumentToFirestore(userId: string, docData: StudyDocument): Promise<void> {
  try {
    const docRef = doc(db, 'studyDocuments', docData.id);
    await setDoc(docRef, {
      id: docData.id,
      userId,
      title: docData.title,
      type: docData.type,
      size: docData.size,
      uploadDate: docData.uploadDate,
      fileUrl: docData.fileUrl || '',
      estimatedStudyTime: docData.estimatedStudyTime || '30 mins',
      difficulty: docData.difficulty || 'Moderate',
      pages: docData.pages || 1,
      smartNotes: docData.smartNotes || [],
      flashcards: docData.flashcards || [],
      importantTopics: docData.importantTopics || [],
      formulaSheet: docData.formulaSheet || '',
      hasFormulas: docData.hasFormulas || false,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error saving study document to Firestore:', err);
  }
}

export async function getUserStudyDocumentsFromFirestore(userId: string): Promise<StudyDocument[]> {
  try {
    const q = query(collection(db, 'studyDocuments'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const docs: StudyDocument[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      docs.push({
        id: d.id || docSnap.id,
        title: d.title || 'Document',
        type: d.type || 'PDF',
        size: d.size || '1.0 MB',
        uploadDate: d.uploadDate || 'Recently',
        fileUrl: d.fileUrl || '',
        estimatedStudyTime: d.estimatedStudyTime || '30 mins',
        difficulty: d.difficulty || 'Moderate',
        pages: d.pages || 1,
        smartNotes: d.smartNotes || [],
        flashcards: d.flashcards || [],
        mindMapNodes: d.mindMapNodes || [],
        revisionSchedule: d.revisionSchedule || [],
        quizQuestions: d.quizQuestions || [],
        probableExamQs: d.probableExamQs || [],
        importantTopics: d.importantTopics || [],
        formulaSheet: d.formulaSheet || '',
        hasFormulas: d.hasFormulas || false
      });
    });
    return docs;
  } catch (err) {
    console.warn('Error loading study documents from Firestore:', err);
    return [];
  }
}

export async function deleteStudyDocumentFromFirestore(docId: string): Promise<void> {
  try {
    const docRef = doc(db, 'studyDocuments', docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Error deleting study document from Firestore:', err);
  }
}

// ─── CAREER GPS FIRESTORE HELPERS ─────────────────────────────────────────

export async function syncCareerGpsToFirestore(userId: string, data: {
  roadmapNodes: CareerRoadmapNode[];
  skillGaps: SkillGapItem[];
  monthlyPlans?: any[];
  roadmapVersion?: number;
  applications: ApplicationTrackerItem[];
  placementReadiness: number;
  hasCompletedOnboarding?: boolean;
  careerSetupCompleted?: boolean;
  journeyLevel?: string;
  estimatedJourney?: string;
  aiConfidence?: number;
  nextBestAction?: string;
  projectedTimeline?: Array<{ month: string; topic: string }>;
  targetTime?: string;
  dailyHours?: number;
  weeklyDays?: number;
  planPace?: string;
  dreamCareer?: string;
  dreamCompany?: string;
}): Promise<void> {
  try {
    const gpsRef = doc(db, 'careerGps', userId);
    await setDoc(gpsRef, {
      userId,
      roadmapNodes: data.roadmapNodes,
      skillGaps: data.skillGaps,
      monthlyPlans: data.monthlyPlans || [],
      roadmapVersion: data.roadmapVersion || Date.now(),
      applications: data.applications,
      placementReadiness: data.placementReadiness,
      hasCompletedOnboarding: data.hasCompletedOnboarding ?? true,
      careerSetupCompleted: data.careerSetupCompleted ?? true,
      journeyLevel: data.journeyLevel || 'Beginner',
      estimatedJourney: data.estimatedJourney || '18 Months',
      aiConfidence: data.aiConfidence || 78,
      nextBestAction: data.nextBestAction || 'Learn Python Basics',
      projectedTimeline: data.projectedTimeline || [],
      targetTime: data.targetTime || '6 Months',
      dailyHours: data.dailyHours || 4,
      weeklyDays: data.weeklyDays || 6,
      planPace: data.planPace || 'Intensive Plan',
      dreamCareer: data.dreamCareer || 'AI Engineer',
      dreamCompany: data.dreamCompany || 'Google',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error syncing Career GPS to Firestore:', err);
  }
}

export async function getCareerGpsFromFirestore(userId: string): Promise<{
  roadmapNodes?: CareerRoadmapNode[];
  skillGaps?: SkillGapItem[];
  applications?: ApplicationTrackerItem[];
  placementReadiness?: number;
  hasCompletedOnboarding?: boolean;
  careerSetupCompleted?: boolean;
  journeyLevel?: string;
  estimatedJourney?: string;
  aiConfidence?: number;
  nextBestAction?: string;
  projectedTimeline?: Array<{ month: string; topic: string }>;
  targetTime?: string;
  dailyHours?: number;
  weeklyDays?: number;
  planPace?: string;
} | null> {
  try {
    const gpsRef = doc(db, 'careerGps', userId);
    const snap = await getDoc(gpsRef);
    if (snap.exists()) {
      return snap.data() as any;
    }
  } catch (err) {
    console.warn('Error loading Career GPS from Firestore:', err);
  }
  return null;
}

export async function syncDailyPlannerToFirestore(userId: string, data: {
  dailySchedule: Array<{ timeSlot: string; activity: string; category?: string }>;
  planningPreferences: {
    wakeTime: string;
    sleepTime: string;
    energyLevel: string;
    urgentDeadline: string;
    availableHours: number;
  };
  completedMissions: string[];
  skippedMissions: string[];
}): Promise<void> {
  try {
    const plannerRef = doc(db, 'dailyPlanner', userId);
    await setDoc(plannerRef, {
      userId,
      dailySchedule: data.dailySchedule,
      planningPreferences: data.planningPreferences,
      completedMissions: data.completedMissions,
      skippedMissions: data.skippedMissions,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error syncing Daily Planner to Firestore:', err);
  }
}

export async function getDailyPlannerFromFirestore(userId: string): Promise<{
  dailySchedule?: Array<{ timeSlot: string; activity: string; category?: string }>;
  planningPreferences?: {
    wakeTime: string;
    sleepTime: string;
    energyLevel: string;
    urgentDeadline: string;
    availableHours: number;
  };
  completedMissions?: string[];
  skippedMissions?: string[];
} | null> {
  try {
    const plannerRef = doc(db, 'dailyPlanner', userId);
    const snap = await getDoc(plannerRef);
    if (snap.exists()) {
      return snap.data() as any;
    }
  } catch (err) {
    console.warn('Error loading Daily Planner from Firestore:', err);
  }
  return null;
}

// ─── SMART NOTES SUBCOLLECTION FIRESTORE HELPERS (users/{userId}/smartNotes) ─────────

export interface FirestoreSmartNote {
  noteId: string;
  userId: string;
  title: string;
  audioFileURL?: string;
  transcript: string;
  executiveSummary: {
    short: string;
    medium: string | string[];
    detailed: string;
  };
  keyConcepts: Array<{ term: string; checked: boolean }>;
  definitions?: Array<{ term: string; definition: string }>;
  formulas?: string;
  keywords?: string[];
  importantDatesAndFacts?: string[];
  actionItems?: string[];
  revisionCards: Array<{ question: string; answer: string; tag?: string }>;
  quiz: Array<{
    type: 'mcq' | 'tf' | 'short';
    q: string;
    options?: string[];
    correct?: number | boolean | string;
    selected?: number | boolean | string | null;
  }>;
  examQuestions: Array<{
    question: string;
    weightage: string;
    probability: number;
    modelAnswer: string;
  }>;
  studyTime: string;
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export async function saveSmartNoteToFirestore(userId: string, note: FirestoreSmartNote): Promise<void> {
  try {
    const noteRef = doc(db, 'users', userId, 'smartNotes', note.noteId);
    await setDoc(noteRef, {
      ...note,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving Smart Note to Firestore:', err);
  }
}

export async function getUserSmartNotesFromFirestore(userId: string): Promise<FirestoreSmartNote[]> {
  try {
    const notesRef = collection(db, 'users', userId, 'smartNotes');
    const snap = await getDocs(notesRef);
    const notes: FirestoreSmartNote[] = [];
    snap.forEach((docSnap) => {
      notes.push(docSnap.data() as FirestoreSmartNote);
    });
    return notes;
  } catch (err) {
    console.warn('Error fetching Smart Notes from Firestore:', err);
    return [];
  }
}

export function listenUserSmartNotes(
  userId: string,
  onUpdate: (notes: FirestoreSmartNote[]) => void
) {
  try {
    const notesRef = collection(db, 'users', userId, 'smartNotes');
    return onSnapshot(notesRef, (snap) => {
      const notes: FirestoreSmartNote[] = [];
      snap.forEach((docSnap) => {
        notes.push(docSnap.data() as FirestoreSmartNote);
      });
      onUpdate(notes);
    }, (err) => {
      console.warn('Smart Notes onSnapshot error:', err);
    });
  } catch (err) {
    console.warn('Error setting up Smart Notes real-time listener:', err);
    return () => {};
  }
}

export async function deleteSmartNoteFromFirestore(userId: string, noteId: string): Promise<void> {
  try {
    const noteRef = doc(db, 'users', userId, 'smartNotes', noteId);
    await deleteDoc(noteRef);
  } catch (err) {
    console.warn('Error deleting Smart Note from Firestore:', err);
  }
}

export async function uploadSmartNoteAudioFile(userId: string, noteId: string, file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `smart_notes/${userId}/${noteId}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    console.warn('Error uploading Smart Note audio file:', err);
    return '';
  }
}

// ─── MOCK INTERVIEWS FIRESTORE HELPERS ───────────────────────────────────

export interface FirestoreMockInterview {
  interviewId: string;
  userId: string;
  interviewType: string;
  difficulty: string;
  company: string;
  role: string;
  duration: string;
  questionsAsked: string[];
  transcripts: Array<{ question: string; answer: string; feedback?: any }>;
  codeSolution?: string;
  codeAnalysis?: any;
  report: {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
    problemSolvingScore: number;
    domainKnowledgeScore: number;
    grammarScore: number;
    vocabularyScore: number;
    fluencyScore: number;
    interviewReadiness: number;
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
    aiSuggestions: string[];
    recommendedResources: string[];
  };
  createdAt: string;
}

export async function saveMockInterviewToFirestore(userId: string, session: FirestoreMockInterview): Promise<void> {
  try {
    const mainRef = doc(db, 'mockInterviews', session.interviewId);
    const subRef = doc(db, `users/${userId}/mockInterviews`, session.interviewId);
    await setDoc(mainRef, session, { merge: true });
    await setDoc(subRef, session, { merge: true });
  } catch (err) {
    console.warn('Error saving mock interview to Firestore:', err);
  }
}

export async function getUserMockInterviewsFromFirestore(userId: string): Promise<FirestoreMockInterview[]> {
  try {
    const q = query(collection(db, `users/${userId}/mockInterviews`));
    const snap = await getDocs(q);
    const items: FirestoreMockInterview[] = [];
    snap.forEach(docSnap => {
      items.push(docSnap.data() as FirestoreMockInterview);
    });
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Error fetching user mock interviews:', err);
    return [];
  }
}

export async function deleteMockInterviewFromFirestore(userId: string, interviewId: string): Promise<void> {
  try {
    const mainRef = doc(db, 'mockInterviews', interviewId);
    const subRef = doc(db, `users/${userId}/mockInterviews`, interviewId);
    await deleteDoc(mainRef);
    await deleteDoc(subRef);
  } catch (err) {
    console.warn('Error deleting mock interview from Firestore:', err);
  }
}

// ─── CALENDAR FIRESTORE HELPERS ───────────────────────────────────────────

export interface FirestoreCalendarEvent {
  eventId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  category: 'Study' | 'Assignment' | 'Project' | 'Exam' | 'Meeting' | 'Personal' | 'Workout' | 'Internship' | 'Hackathon' | 'Birthday' | 'Reminder' | 'Custom';
  type: 'Task' | 'Deadline' | 'Birthday' | 'Reminder' | 'Note';
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  estimatedMinutes?: number;
  dueTime?: string;
  repeat?: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  notes?: string;
  createdAt: string;
}

export async function saveCalendarEventToFirestore(userId: string, event: FirestoreCalendarEvent): Promise<void> {
  try {
    const mainRef = doc(db, 'calendar', event.eventId);
    const subRef = doc(db, `users/${userId}/calendar`, event.eventId);
    await setDoc(mainRef, event, { merge: true });
    await setDoc(subRef, event, { merge: true });
  } catch (err) {
    console.warn('Error saving calendar event to Firestore:', err);
  }
}

export async function getUserCalendarEventsFromFirestore(userId: string): Promise<FirestoreCalendarEvent[]> {
  try {
    const q = query(collection(db, `users/${userId}/calendar`));
    const snap = await getDocs(q);
    const items: FirestoreCalendarEvent[] = [];
    snap.forEach(docSnap => {
      items.push(docSnap.data() as FirestoreCalendarEvent);
    });
    return items;
  } catch (err) {
    console.warn('Error loading user calendar events:', err);
    return [];
  }
}

export async function deleteCalendarEventFromFirestore(userId: string, eventId: string): Promise<void> {
  try {
    const mainRef = doc(db, 'calendar', eventId);
    const subRef = doc(db, `users/${userId}/calendar`, eventId);
    await deleteDoc(mainRef);
    await deleteDoc(subRef);
  } catch (err) {
    console.warn('Error deleting calendar event from Firestore:', err);
  }
}

// ─── CHRONA CONNECT FIRESTORE HELPERS ──────────────────────────────────────

export interface FirestoreConnectPlatform {
  platformId: string;
  platformName: string;
  connected: boolean;
  grantedPermissions: string[];
  syncStatus: 'Synced' | 'Pending' | 'Paused' | 'Error';
  lastSyncedAt?: string;
  metadata?: any;
  whatsappSettings?: {
    monitoredGroups: string[];
    monitoredCategories: string[];
  };
}

export async function saveConnectPlatformToFirestore(userId: string, platform: FirestoreConnectPlatform): Promise<void> {
  try {
    const subRef = doc(db, `users/${userId}/connectPlatforms`, platform.platformId);
    await setDoc(subRef, platform, { merge: true });
  } catch (err) {
    console.warn('Error saving Chrona Connect platform:', err);
  }
}

export async function getUserConnectPlatformsFromFirestore(userId: string): Promise<Record<string, FirestoreConnectPlatform>> {
  try {
    const q = query(collection(db, `users/${userId}/connectPlatforms`));
    const snap = await getDocs(q);
    const map: Record<string, FirestoreConnectPlatform> = {};
    snap.forEach(docSnap => {
      map[docSnap.id] = docSnap.data() as FirestoreConnectPlatform;
    });
    return map;
  } catch (err) {
    console.warn('Error loading Chrona Connect platforms:', err);
    return {};
  }
}

export async function deleteConnectPlatformFromFirestore(userId: string, platformId: string): Promise<void> {
  try {
    const subRef = doc(db, `users/${userId}/connectPlatforms`, platformId);
    await deleteDoc(subRef);
  } catch (err) {
    console.warn('Error deleting Chrona Connect platform:', err);
  }
}

// ─── CERTIFICATES FIRESTORE HELPERS ───────────────────────────────────────

export interface FirestoreCertificate {
  certificateId: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  achievementType: 'Streak' | 'Career GPS Milestone' | 'Roadmap Complete' | 'Placement Readiness' | 'Mock Interview' | 'Coding Challenge' | 'Study Plan';
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  issueDate: string;
  verificationCode: string;
  certificateURL?: string;
  earnedFrom: string;
  streak: number;
  careerGoal: string;
  dreamCompany?: string;
  placementReadiness: number;
  status: 'Issued' | 'Verified';
}

export async function saveCertificateToFirestore(userId: string, cert: FirestoreCertificate): Promise<void> {
  try {
    const mainRef = doc(db, 'certificates', cert.certificateId);
    const subRef = doc(db, `users/${userId}/certificates`, cert.certificateId);
    await setDoc(mainRef, cert, { merge: true });
    await setDoc(subRef, cert, { merge: true });
  } catch (err) {
    console.warn('Error saving certificate to Firestore:', err);
  }
}

export async function getUserCertificatesFromFirestore(userId: string): Promise<FirestoreCertificate[]> {
  try {
    const q = query(collection(db, `users/${userId}/certificates`));
    const snap = await getDocs(q);
    const items: FirestoreCertificate[] = [];
    snap.forEach(docSnap => {
      items.push(docSnap.data() as FirestoreCertificate);
    });
    return items.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  } catch (err) {
    console.warn('Error fetching user certificates:', err);
    return [];
  }
}

export async function deleteCertificateFromFirestore(userId: string, certificateId: string): Promise<void> {
  try {
    const mainRef = doc(db, 'certificates', certificateId);
    const subRef = doc(db, `users/${userId}/certificates`, certificateId);
    await deleteDoc(mainRef);
    await deleteDoc(subRef);
  } catch (err) {
    console.warn('Error deleting certificate from Firestore:', err);
  }
}

// ─── MULTILINGUAL LANGUAGE FIRESTORE HELPERS ───────────────────────────────

export interface FirestoreLanguageSettings {
  preferredLanguage: string;
  speechLanguageCode: string;
  outputLanguage: string;
  autoLanguageDetect: boolean;
  bilingualMode: boolean;
  updatedAt: string;
}

export async function saveLanguageSettingsToFirestore(userId: string, settings: FirestoreLanguageSettings): Promise<void> {
  try {
    const subRef = doc(db, `users/${userId}/settings`, 'language');
    await setDoc(subRef, settings, { merge: true });
  } catch (err) {
    console.warn('Error saving language settings to Firestore:', err);
  }
}

export async function getUserLanguageSettingsFromFirestore(userId: string): Promise<FirestoreLanguageSettings | null> {
  try {
    const subRef = doc(db, `users/${userId}/settings`, 'language');
    const snap = await getDoc(subRef);
    if (snap.exists()) {
      return snap.data() as FirestoreLanguageSettings;
    }
    return null;
  } catch (err) {
    console.warn('Error loading language settings from Firestore:', err);
    return null;
  }
}

export interface VoiceSessionRecord {
  id?: string;
  userId: string;
  fieldId: string;
  language: string;
  finalTranscript: string;
  timestamp: string;
}

export const saveVoiceTranscriptSessionToFirestore = async (
  userId: string,
  fieldId: string,
  language: string,
  finalTranscript: string
): Promise<boolean> => {
  if (!userId || !finalTranscript.trim()) return false;
  try {
    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const sessionRef = doc(db, 'users', userId, 'voiceSessions', sessionId);
    await setDoc(sessionRef, {
      id: sessionId,
      userId,
      fieldId,
      language,
      finalTranscript: finalTranscript.trim(),
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn('Firestore saveVoiceTranscriptSession notice:', err);
    return false;
  }
};

