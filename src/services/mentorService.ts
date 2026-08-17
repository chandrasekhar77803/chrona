/**
 * CHRONA MENTOR SERVICE
 *
 * Intelligent, context-aware AI Mentor & Well-being Guide.
 * Synchronizes with user's Firebase UID, Career GPS, Today's Mission,
 * Plan My Day, AI Calendar, Study Companion, and Mock Interviews.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  StudentProfile,
  MissionItem,
  CareerRoadmapNode,
  SkillGapItem,
  MentorProfile,
  MentorMessage,
  WellbeingCheckin
} from '../types/chrona';

export interface UserContextSnapshot {
  userId: string;
  profile: StudentProfile;
  missions: MissionItem[];
  roadmapNodes: CareerRoadmapNode[];
  skillGaps: SkillGapItem[];
  availableHours?: number;
  latestMood?: WellbeingCheckin['mood'];
  mockInterviewScore?: number;
}

export interface MentorRecommendationResult {
  headline: string;
  recommendation: string;
  rationale: string;
  targetTopic: string;
  actionButtons: Array<{
    label: string;
    actionType: 'add_mission' | 'plan_day' | 'open_gps' | 'start_mock' | 'start_revision' | 'view_skills';
    payload?: any;
  }>;
}

/**
 * Read user mentor profile from Firestore under `users/{userId}/mentorProfile`
 */
export async function getMentorProfile(userId: string): Promise<MentorProfile> {
  try {
    const docRef = doc(db, 'users', userId, 'mentor', 'profile');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MentorProfile;
    }
  } catch (err) {
    console.warn('[MentorService] Firestore read warning:', err);
  }

  return {
    userId,
    mentorName: 'Chrona AI Mentor',
    preferences: { checkinsEnabled: true, tone: 'supportive' },
    wellbeingCheckins: [],
    conversationHistory: [],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Save user mentor profile to Firestore under `users/{userId}/mentorProfile`
 */
export async function saveMentorProfile(userId: string, data: Partial<MentorProfile>): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'mentor', 'profile');
    const existing = await getMentorProfile(userId);
    const updated: MentorProfile = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, updated);
  } catch (err) {
    console.warn('[MentorService] Firestore write warning:', err);
  }
}

/**
 * Reset / Clear user mentor conversation memory in Firestore
 */
export async function clearMentorMemory(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'mentor', 'profile');
    await setDoc(docRef, {
      userId,
      mentorName: 'Chrona AI Mentor',
      preferences: { checkinsEnabled: true, tone: 'supportive' },
      wellbeingCheckins: [],
      conversationHistory: [],
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[MentorService] Memory clear error:', err);
  }
}

/**
 * "WHAT SHOULD I DO NEXT?" FEATURE (STEP 18)
 * Analyzes Career GPS, Today's Mission, Calendar, Skill Gaps & Available Time
 * to produce ONE single highest-value action recommendation.
 */
export function getWhatShouldIDoNext(context: UserContextSnapshot): MentorRecommendationResult {
  const role = context.profile.careerGoal || 'Software Engineer';
  const company = context.profile.dreamCompany || 'Target Company';
  const activeNode = context.roadmapNodes.find(n => n.status === 'in-progress') || context.roadmapNodes[0];
  const activeTopic = activeNode?.topics?.[0] || activeNode?.title || `${role} Fundamentals`;

  const pendingCritical = context.missions.find(m => !m.completed && m.impact === 'Critical');
  const pendingHigh = context.missions.find(m => !m.completed && m.impact === 'High');
  const activeMission = pendingCritical || pendingHigh || context.missions.find(m => !m.completed);

  const mood = context.latestMood || 'Okay';
  const isReducedWorkload = mood === 'Tired' || mood === 'Stressed' || mood === 'Low';

  let headline = `Focus on ${activeTopic}`;
  let recommendation = `Complete the core ${activeTopic} module for ${company} (${role}).`;
  let rationale = `This is your active Career GPS milestone. Completing it builds your Placement Readiness Score.`;

  if (activeMission) {
    recommendation = `Complete your pending task: "${activeMission.title}" (${activeMission.estimatedMinutes} min).`;
    rationale = `This is currently your highest-impact task aligned with your ${company} ${role} target.`;
  }

  if (isReducedWorkload) {
    headline = `Adjusted Focus for ${mood} Energy`;
    recommendation = `Complete a focused 30-minute revision of ${activeTopic} and take a structured rest break.`;
    rationale = `Sustainable progress is key. Pacing yourself today protects long-term retention.`;
  }

  return {
    headline,
    recommendation,
    rationale,
    targetTopic: activeTopic,
    actionButtons: [
      { label: '🎯 Open Career GPS', actionType: 'open_gps' },
      { label: '📅 Plan My Day', actionType: 'plan_day' },
      { label: '🎤 Start Mock Interview', actionType: 'start_mock' }
    ]
  };
}

/**
 * Generate AI Mentor Response using Gemini / Fallback Context Engine
 */
export async function generateMentorResponse(
  userQuery: string,
  context: UserContextSnapshot,
  conversationHistory: MentorMessage[] = []
): Promise<MentorMessage> {
  const role = context.profile.careerGoal || 'Software Engineer';
  const company = context.profile.dreamCompany || 'Target Company';
  const activeNode = context.roadmapNodes.find(n => n.status === 'in-progress') || context.roadmapNodes[0];
  const activeTopic = activeNode?.topics?.[0] || activeNode?.title || `${role} Core`;
  const pendingTasks = context.missions.filter(m => !m.completed);
  const readiness = context.profile.placementReadiness || 78;

  // SAFETY BOUNDARY CHECK (STEP 13)
  const distressKeywords = ['hopeless', 'suicide', 'self harm', 'hurt myself', 'end my life', 'can\'t go on'];
  const isDistress = distressKeywords.some(kw => userQuery.toLowerCase().includes(kw));

  if (isDistress) {
    return {
      id: `men-${Date.now()}`,
      sender: 'mentor',
      text: `I hear how deeply overwhelmed you are feeling right now, and I care about your well-being. Please remember you do not have to carry this alone. I am an AI career assistant and not a medical or mental health professional. If you are experiencing severe distress, please reach out to a trusted family member, friend, or emergency support counselor immediately (e.g. Call/Text 988 in the US or your local crisis helpline). Your health and safety are what matter most.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wellbeingBadge: '🛡️ Supportive Care Notice'
    };
  }

  const geminiApiKey = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || (typeof localStorage !== 'undefined' ? localStorage.getItem('chrona_gemini_api_key') : '') || '';

  const systemContextText = `You are Chrona AI Mentor, a supportive, intelligent, practical, and non-judgmental AI career mentor and academic guide.
You are mentoring a student named ${context.profile.name}.

Student Profile & Journey Context:
- Target Role: ${role}
- Target Company: ${company}
- Current Career GPS Milestone: "${activeNode?.title || 'Month 1 Foundations'}" (Topic: ${activeTopic})
- Pending Tasks: ${pendingTasks.length} tasks remaining (${pendingTasks.map(t => t.title).slice(0, 3).join(', ')})
- Placement Readiness Score: ${readiness}%
- Current Mood / Energy Check-in: ${context.latestMood || 'Good'}

CRITICAL SAFETY & MENTOR BOUNDARIES:
- DO NOT diagnose mental health conditions.
- DO NOT claim to be a licensed psychologist, doctor or therapist.
- Provide actionable, supportive, concise, career-focused advice based on their ACTUAL Chrona data.
- Maintain multi-turn context cleanly and personalize to their specific role (${role}) and company (${company}).
- LANGUAGE: Always reply in the same natural language the student asks in. If the student asks in Telugu (తెలుగు), respond fluently in Telugu with Chrona guidance. If in Hindi (हिंदी), respond in Hindi. If in English, respond in English.`;

  let responseText = '';

  if (geminiApiKey) {
    try {
      // Build Multi-turn conversation contents for Gemini 3.1 Flash Lite
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      const historyTurns = (conversationHistory || []).slice(-6);
      if (historyTurns.length > 0) {
        contents.push({
          role: 'user',
          parts: [{ text: `${systemContextText}\n\n[START CONVERSATION HISTORY]` }]
        });
        contents.push({
          role: 'model',
          parts: [{ text: 'Understood. I have reviewed your Chrona journey context and previous conversation turns.' }]
        });

        for (const msg of historyTurns) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }

        if (historyTurns[historyTurns.length - 1]?.text !== userQuery) {
          contents.push({
            role: 'user',
            parts: [{ text: userQuery }]
          });
        }
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: `${systemContextText}\n\nUser Question: "${userQuery}"` }]
        });
      }

      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({ contents })
      });
      if (resp.ok) {
        const data = await resp.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch (err) {
      console.warn('[MentorService] Gemini 3.1 Flash Lite API response fallback:', err);
    }
  }

  if (!responseText) {
    // Check if query is in Telugu (Unicode \u0C00-\u0C7F)
    const isTelugu = /[\u0C00-\u0C7F]/.test(userQuery);

    if (isTelugu) {
      responseText = `నమస్కారం ${context.profile.name}! మీ **${company} (${role})** లక్ష్యం కోసం మీ Career GPS మరియు టాస్క్‌లను పరిశీలించాను. ఈ రోజు మీ ప్రాధాన్యత అంశం **${activeTopic}**. మీ ప్రస్తుత ప్లేస్‌మెంట్ సంసిద్ధత స్కోరు **${readiness}%**. ఈ రోజు మీ టాస్క్‌లను పూర్తి చేసి మరింత ముందుకు సాగండి!`;
    } else {
      // Deterministic personalized response fallback
      const qLower = userQuery.toLowerCase();
      if (qLower.includes('do today') || qLower.includes('prioritize') || qLower.includes('next')) {
        responseText = `Based on your Career GPS for **${company} (${role})**, your top priority today is mastering **${activeTopic}**. You have ${pendingTasks.length} pending tasks in Today's Mission. Completing "${pendingTasks[0]?.title || activeTopic}" will boost your Placement Readiness Score from ${readiness}%!`;
      } else if (qLower.includes('track') || qLower.includes('behind') || qLower.includes('progress')) {
        responseText = `You are currently in **${activeNode?.title || 'Month 1'}** of your **${role}** roadmap. Your Placement Readiness Score is **${readiness}%**. You are making steady progress toward ${company} interview readiness!`;
      } else if (qLower.includes('tired') || qLower.includes('stressed') || qLower.includes('overwhelmed')) {
        responseText = `I hear you. Preparing for ${role} is a marathon, not a sprint. Let's adjust your schedule today: focus on 1 priority task (${activeTopic}) for 40 minutes, and postpone lower-priority items to tomorrow. Rest is essential for long-term memory!`;
      } else {
        responseText = `Great question! As your Chrona AI Mentor, I recommend keeping your focus on **${activeTopic}** for your **${company} ${role}** roadmap. Let's execute your highest-impact task today!`;
      }
    }
  }

  return {
    id: `men-${Date.now()}`,
    sender: 'mentor',
    text: responseText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actionButtons: [
      { label: '🎯 Career GPS', actionType: 'open_gps' },
      { label: '📅 Plan My Day', actionType: 'plan_day' },
      { label: '🎤 Mock Interview', actionType: 'start_mock' }
    ]
  };
}
