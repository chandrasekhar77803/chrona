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
 * Generate AI Mentor Response using Gemini 3.5 Flash-Lite / Fallback Context Engine
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

  // SAFETY BOUNDARY CHECK
  const distressKeywords = ['hopeless', 'suicide', 'self harm', 'hurt myself', 'end my life', 'can\'t go on'];
  const isDistress = distressKeywords.some(kw => userQuery.toLowerCase().includes(kw));

  if (isDistress) {
    return {
      id: `men-${Date.now()}`,
      sender: 'mentor',
      text: `I hear how deeply overwhelmed you are feeling right now, and I care about your well-being. Please remember you do not have to carry this alone. I am an AI career assistant and not a medical or mental health professional. If you are experiencing severe distress, please reach out to a trusted family member, friend, or emergency support counselor immediately (e.g. Call/Text 988 in the US or your local crisis helpline). Your health and safety are what matter most.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wellbeingBadge: '🛡️ Supportive Care Notice',
      modelUsed: 'Chrona Safety Protocol'
    };
  }

  const geminiApiKey = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || (typeof localStorage !== 'undefined' ? localStorage.getItem('chrona_gemini_api_key') : '') || '';

  // Get active course info if available
  const activeCourseId = typeof localStorage !== 'undefined' ? localStorage.getItem('chrona_active_course') : '';

  const systemContextText = `You are Chrona AI Mentor powered by Google Gemini 3.5 Flash-Lite — an intelligent, empathetic, practical, and non-judgmental AI career mentor and academic engineering guide.
You are mentoring a student named ${context.profile.name}.

Student Profile & Journey Context:
- Target Role: ${role}
- Target Company: ${company}
- Current Career GPS Milestone: "${activeNode?.title || 'Month 1 Foundations'}" (Topic: ${activeTopic})
- Active Enrolled Course: ${activeCourseId || 'Data Structures & System Design Mastery'}
- Pending Tasks: ${pendingTasks.length} tasks remaining (${pendingTasks.map(t => t.title).slice(0, 3).join(', ')})
- Placement Readiness Score: ${readiness}%
- Current Mood / Energy Check-in: ${context.latestMood || 'Good'}

CRITICAL INSTRUCTIONS & BOUNDARIES:
- Provide sharp, concise, actionable advice tailored to their exact career goal (${role}) and company (${company}).
- If asking about roadmap, technical concepts, DSA, AI, system design, or interview preparation, give high-impact bullet points with clear next steps.
- DO NOT diagnose mental health conditions.
- LANGUAGE: Always respond fluently in the EXACT language the student used (English, Telugu తెలుగు, Hindi हिंदी, Tamil தமிழ், Kannada ಕನ್ನಡ, etc.).`;

  let responseText = '';
  let modelUsed: string | undefined = undefined;

  if (geminiApiKey) {
    // Model waterfall priority starting with Gemini 3.5 Flash-Lite
    const primaryConfiguredModel = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_PRIMARY_MODEL : '') || 'gemini-3.5-flash-lite';
    const geminiModels = Array.from(new Set([
      primaryConfiguredModel,
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ]));

    // Build multi-turn conversation history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    const historyTurns = (conversationHistory || []).slice(-8);

    if (historyTurns.length > 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `${systemContextText}\n\n[START CONVERSATION HISTORY]` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I am Chrona Mentor with full awareness of your journey context, targets, and history.' }]
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

    for (const modelName of geminiModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
        const resp = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(7000),
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 1024
            }
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText && generatedText.trim().length > 0) {
            responseText = generatedText.trim();
            modelUsed = modelName;
            break;
          }
        }
      } catch (err) {
        console.warn(`[MentorService] ${modelName} attempt error, falling back:`, err);
      }
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
      } else if (qLower.includes('course') || qLower.includes('learn') || qLower.includes('roadmap')) {
        responseText = `For your target at **${company}**, I recommend diving into the **Learn Courses** module. Focusing on Data Structures & Algorithms, System Design, and hands-on capstone projects will accelerate your hiring readiness.`;
      } else {
        responseText = `Great question! As your Chrona AI Mentor powered by Gemini, I recommend keeping your focus on **${activeTopic}** for your **${company} ${role}** roadmap. Let's execute your highest-impact task today!`;
      }
    }
  }

  return {
    id: `men-${Date.now()}`,
    sender: 'mentor',
    text: responseText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    modelUsed: modelUsed || 'Gemini 3.5 Flash-Lite Engine',
    actionButtons: [
      { label: '🎯 Career GPS', actionType: 'open_gps' },
      { label: '📅 Plan My Day', actionType: 'plan_day' },
      { label: '🎤 Mock Interview', actionType: 'start_mock' }
    ]
  };
}
