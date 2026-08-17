import type { UserAccount, UserSession, UserDataStore } from '../types/chrona';

const USERS_STORAGE_KEY = 'chrona_registered_users';
const SESSION_STORAGE_KEY = 'chrona_active_session';
const USER_DATA_PREFIX = 'chrona_user_data_';

// Get YYYY-MM-DD formatted date string
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Retrieve all registered users
export const getRegisteredUsers = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load registered users:', e);
    return [];
  }
};

// Save user account
export const saveUserAccount = (user: UserAccount): void => {
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Retrieve active session
export const getActiveSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: UserSession = JSON.parse(raw);
    
    // Check if session has expired
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      clearActiveSession();
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
};

// Save active session
export const saveActiveSession = (session: UserSession): void => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

// Clear active session & all cached user session data (logout)
export const clearActiveSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    // Clear all chrona user data keys from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(USER_DATA_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();
  } catch (err) {
    console.warn('Error clearing session cache:', err);
  }
};

// Retrieve isolated user data store
export const getUserDataStore = (userId: string): UserDataStore | null => {
  try {
    const raw = localStorage.getItem(`${USER_DATA_PREFIX}${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load data for user ${userId}:`, e);
    return null;
  }
};

// Save isolated user data store
export const saveUserDataStore = (userId: string, dataStore: UserDataStore): void => {
  try {
    localStorage.setItem(`${USER_DATA_PREFIX}${userId}`, JSON.stringify(dataStore));
  } catch (e) {
    console.error(`Failed to save data for user ${userId}:`, e);
  }
};

// Generate completely clean, empty initial workspace data for a newly registered student
export const createInitialUserData = (user: UserAccount): UserDataStore => {
  const targetCompany = user.dreamCompany || 'Google';
  const userBranch = user.branch || 'Computer Science & Engineering';

  // 100% Clean, Isolated Profile for New User
  const profile = {
    name: user.name || 'New Scholar',
    email: user.email || '',
    avatar: user.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    branch: userBranch,
    semester: 'Semester 1',
    cgpa: 0.0,
    dreamCompany: targetCompany,
    careerGoal: `Software Engineer at ${targetCompany}`,
    placementReadiness: 0.0,
    resumeScore: 0,
    interviewReadiness: 0,
    codingReadiness: 0,
    projectScore: 0,
    skills: [],
    projects: [],
    certifications: [],
    achievements: []
  };

  return {
    missions: [],
    roadmapNodes: [],
    skillGaps: [],
    applications: [],
    studyDocuments: [],
    smartNoteLectures: [],
    goals: [],
    calendarEvents: [],
    profile,
    lastResetDate: getTodayDateString(),
    completedHistory: []
  };
};
