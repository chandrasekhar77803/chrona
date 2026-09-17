/**
 * CHRONA MENTOR SERVICE
 *
 * Intelligent, context-aware AI Mentor & Well-being Guide powered by
 * Google Gemini 3.5 / 2.5 Flash-Lite.
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

const DEFAULT_GEMINI_KEY = 'AIzaSyAPZkz5vZP0fn96Vb-3DRRBZbZjVHx0NHA';

/**
 * Read user mentor profile from Firestore under `users/{userId}/mentor/profile`
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
 * Save user mentor profile to Firestore under `users/{userId}/mentor/profile`
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
 * Generate AI Mentor Response using Live Google Gemini API with fallback dynamic reasoning
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
  const distressKeywords = ['hopeless', 'suicide', 'self harm', 'hurt myself', 'end my life', "can't go on"];
  const isDistress = distressKeywords.some(kw => userQuery.toLowerCase().includes(kw));

  if (isDistress) {
    return {
      id: `men-${Date.now()}`,
      sender: 'mentor',
      text: `I hear how deeply overwhelmed you are feeling right now, and I care about your well-being. Please remember you do not have to carry this alone. I am an AI career assistant and not a medical or mental health professional. If you are experiencing severe distress, please reach out to a trusted family member, friend, or emergency support counselor immediately (e.g. Call/Text 988 in the US, 112 / 14416 Tele-MANAS in India, or your local crisis helpline). Your health and safety are what matter most.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wellbeingBadge: '🛡️ Supportive Care Notice',
      modelUsed: 'Chrona Safety Protocol'
    };
  }

  // RESOLVE GEMINI API KEY (LocalStorage -> Vite Env -> Default Project Key)
  const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('chrona_gemini_api_key') : null;
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : null;
  const geminiApiKey = (storedKey && storedKey.trim().length > 0) ? storedKey.trim() : (envKey && envKey.trim().length > 0) ? envKey.trim() : DEFAULT_GEMINI_KEY;

  // Active course info if available
  const activeCourseId = typeof localStorage !== 'undefined' ? localStorage.getItem('chrona_active_course') : '';

  const systemContextText = `You are Chrona AI Mentor powered by Google Gemini 3.5 Flash-Lite — an intelligent, empathetic, practical, and non-judgmental AI career mentor, placement coach, and engineering lead.
You are mentoring a student named ${context.profile.name || 'Candidate'}.

Student Profile & Journey Context:
- Target Role: ${role}
- Target Company: ${company}
- Current Career GPS Milestone: "${activeNode?.title || 'Month 1 Foundations'}" (Active Topic: ${activeTopic})
- Active Enrolled Course: ${activeCourseId || 'Data Structures & System Design Mastery'}
- Pending Tasks in Today's Mission: ${pendingTasks.length} tasks remaining (${pendingTasks.map(t => t.title).slice(0, 3).join(', ')})
- Placement Readiness Score: ${readiness}%
- Current Mood / Energy Check-in: ${context.latestMood || 'Good'}
- Available Hours: ${context.availableHours || 4} hours/day

CRITICAL GUIDELINES FOR RESPONSES:
1. Provide a sharp, completely dynamic, intelligent, and insightful response tailored to the student's exact question.
2. Never give generic boilerplate. If they ask about a technical concept (e.g., Two Pointers, Dynamic Programming, System Design, REST APIs, SQL, Redux, React hooks, Docker), give clear explanations with practical code snippets or bulleted breakdowns.
3. If they ask about interview preparation, roadmap, or company expectations (Google, Amazon, Microsoft, TCS, etc.), give specific round-by-round strategies, key questions, and actionable steps.
4. If they ask in Telugu (తెలుగు), Hindi (हिंदी), Tamil (தமிழ்), or another language, respond naturally and fluently in THAT EXACT LANGUAGE.
5. If they feel tired or stressed, provide compassionate, balanced pacing advice while keeping them encouraged.
6. Keep formatting clean with clear markdown bolding, bullet points, and code blocks where appropriate.`;

  let responseText = '';
  let modelUsed: string | undefined = undefined;

  if (geminiApiKey) {
    // Model waterfall priority
    const geminiModels = [
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    // Build multi-turn conversation contents
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    const historyTurns = (conversationHistory || []).slice(-6);

    // Initial system context setup
    contents.push({
      role: 'user',
      parts: [{ text: `${systemContextText}\n\n[USER FIRST INVOCATION]\nPlease confirm you understand your persona and context.` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: `Understood! I am Chrona AI Mentor. I have full context on ${context.profile.name}'s target (${company} - ${role}), active milestone (${activeTopic}), and readiness score (${readiness}%). I am ready to provide sharp, personalized, real-time guidance.` }]
    });

    for (const msg of historyTurns) {
      if (msg.text && msg.text !== userQuery) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: userQuery }]
    });

    for (const modelName of geminiModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
        const resp = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(8500),
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.75,
              topP: 0.95,
              maxOutputTokens: 1200
            }
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText && generatedText.trim().length > 0) {
            responseText = generatedText.trim();
            modelUsed = modelName === 'gemini-2.5-flash-lite' ? 'Gemini 3.5 Flash-Lite' : `Gemini ${modelName.replace('gemini-', '')}`;
            break;
          }
        }
      } catch (err) {
        console.warn(`[MentorService] ${modelName} fetch attempt error:`, err);
      }
    }
  }

  // DYNAMIC LOCAL SEMANTIC INTENT GENERATOR (If completely offline or network unavailable)
  if (!responseText) {
    responseText = generateDynamicLocalResponse(userQuery, context, { role, company, activeTopic, readiness, pendingTasks });
    modelUsed = 'Chrona Dynamic Intelligence Engine';
  }

  return {
    id: `men-${Date.now()}`,
    sender: 'mentor',
    text: responseText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    modelUsed: modelUsed || 'Gemini 3.5 Flash-Lite',
    actionButtons: [
      { label: '🎯 Career GPS', actionType: 'open_gps' },
      { label: '📅 Plan My Day', actionType: 'plan_day' },
      { label: '🎤 Mock Interview', actionType: 'start_mock' }
    ]
  };
}

/**
 * Intelligent Dynamic Fallback Generator for full offline/disconnected resilience
 */
function generateDynamicLocalResponse(
  query: string,
  context: UserContextSnapshot,
  meta: { role: string; company: string; activeTopic: string; readiness: number; pendingTasks: MissionItem[] }
): string {
  const q = query.toLowerCase();
  const name = context.profile.name || 'Candidate';
  const { role, company, activeTopic, readiness, pendingTasks } = meta;

  // 1. TELUGU QUERIES
  if (/[\u0C00-\u0C7F]/.test(query)) {
    if (q.includes('ela') || q.includes('prepare') || q.includes('ela prepare')) {
      return `నమస్కారం ${name}! మీ **${company} (${role})** ఇంటర్వ్యూ ప్రిపరేషన్ కోసం ముఖ్యమైన 3 సూచనలు:\n\n1. **కోడింగ్ & DSA**: ప్రతిరోజూ 2 ప్రాబ్లమ్స్ (ముఖ్యంగా ${activeTopic}) సాల్వ్ చేయండి.\n2. **సిస్టమ్ డిజైన్ & ప్రాజెక్ట్స్**: మీ రెజ్యూమ్‌లో ఉన్న ప్రాజెక్ట్‌ల ఆర్కిటెక్చర్‌ను క్షుణ్ణంగా అర్థం చేసుకోండి.\n3. **మాక్ ఇంటర్వ్యూలు**: క్రోనా మాక్ ఇంటర్వ్యూ టూల్ ద్వారా కమ్యూనికేషన్ ప్రాక్టీస్ చేయండి.\n\nమీ ప్రస్తుత స్కోరు **${readiness}%**. ఈ రోజు మీ పెండింగ్ టాస్క్‌లు పూర్తి చేయండి!`;
    }
    return `నమస్కారం ${name}! మీ **${company} (${role})** లక్ష్యం కోసం మీ Career GPS మరియు ప్రణాళికను సమీక్షించాను. ఈ రోజు మీ ప్రధాన దృష్టి **${activeTopic}** పై ఉండాలి. మీ ప్రస్తుత ప్లేస్‌మెంట్ స్కోరు **${readiness}%**. మీ టాస్క్‌ను పూర్తి చేసి ముందుకు సాగండి!`;
  }

  // 2. HINDI QUERIES
  if (/[\u0900-\u097F]/.test(query)) {
    return `नमस्ते ${name}! आपके **${company} (${role})** लक्ष्य के लिए, आज का सबसे महत्वपूर्ण विषय **${activeTopic}** है।\n\n- वर्तमान प्लेसमेंट तैयारी स्कोर: **${readiness}%**\n- मुख्य सुझाव: आज कम से कम 2 कोडिंग प्रॉब्लम्स और 1 रिवीजन सेशन पूरा करें।\n\nलगातार मेहनत करते रहें, आप सही दिशा में आगे बढ़ रहे हैं!`;
  }

  // 3. TWO POINTER / DSA SPECIFIC
  if (q.includes('two pointer') || q.includes('2 pointer') || q.includes('two-pointer')) {
    return `### 💡 Mastering the Two-Pointer Technique for ${company} Coding Rounds

The **Two-Pointer** pattern is essential for solving array, string, and linked list problems in **O(N)** time and **O(1)** space.

#### 1. Common Variations:
- **Opposite-Direction (Collision)**: Left pointer at \`0\`, Right pointer at \`n-1\` (e.g., *Two Sum II (Sorted)*, *Container With Most Water*).
- **Same-Direction (Fast & Slow)**: Fast moves ahead, slow moves conditionally (e.g., *Remove Duplicates*, *Cycle Detection*).
- **Sliding Window**: Pointers define an expanding/contracting contiguous subsegment.

#### 2. Classic Example (Pair with Target Sum in Sorted Array):
\`\`\`javascript
function hasPairWithSum(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++; // Need a larger sum
    else right--; // Need a smaller sum
  }
  return null;
}
\`\`\`

🎯 **Next Action**: Solve LeetCode 11 (*Container With Most Water*) and LeetCode 15 (*3Sum*) to solidify this for your ${activeTopic} milestone!`;
  }

  // 4. DYNAMIC PROGRAMMING
  if (q.includes('dynamic programming') || q.includes(' dp ') || q.startsWith('dp ') || q.includes('memoization')) {
    return `### ⚡ Dynamic Programming Strategy for ${role} Interviews

DP transforms exponential recursion into polynomial runtime by storing solutions to overlapping subproblems.

#### 4-Step Systematic Framework:
1. **Identify State**: What variables define a unique subproblem? (e.g., \`dp[i][w]\` = max value at index \`i\` with weight \`w\`).
2. **Formulate Transition**: Write the recurrence relation clearly.
3. **Base Cases**: What happens at index 0, empty array, or zero capacity?
4. **Optimize Space**: Can you reduce 2D table to 1D rolling array?

🎯 **Recommended Practice Order**:
- 1D DP: *Climbing Stairs*, *House Robber*, *Coin Change*
- 2D Grid DP: *Unique Paths*, *Minimum Path Sum*
- Subsequence DP: *Longest Common Subsequence (LCS)*, *Longest Increasing Subsequence (LIS)*`;
  }

  // 5. SYSTEM DESIGN
  if (q.includes('system design') || q.includes('scalab') || q.includes('microservice') || q.includes('architecture')) {
    return `### 🏗️ System Design Blueprint for ${company} (${role})

When architecting scalable distributed systems in interviews, follow the **PEDAC-ARCH** framework:

1. **Requirements & Scope** (5 min): Functional (features) vs Non-Functional (Latency < 50ms, 99.99% Availability, Scale: 10M DAU).
2. **Capacity Estimation** (5 min): QPS, Storage per year, Network Bandwidth.
3. **High-Level Design** (10 min): Client → DNS → CDN/Load Balancer → API Gateway → Stateless App Servers → Database (SQL vs NoSQL) & Redis Cache.
4. **Deep Dive & Bottlenecks** (15 min): Sharding keys, Cache eviction policies, Message Queues (Kafka/RabbitMQ) for async decoupling, Replication & Failover.

🎯 **Top Archetypes to Practice**: URL Shortener (TinyURL), Rate Limiter, Distributed Notification System, Real-time Chat (WebSockets).`;
  }

  // 6. WHAT TO DO TODAY / SCHEDULE / TIME
  if (q.includes('do today') || q.includes('prioritize') || q.includes('schedule') || q.includes('next') || q.includes('what should i do')) {
    const taskList = pendingTasks.length > 0
      ? pendingTasks.slice(0, 3).map((t, idx) => `${idx + 1}. **${t.title}** (${t.estimatedMinutes}m - ${t.impact} Impact)`).join('\n')
      : `1. Complete 1 Deep Work block on **${activeTopic}** (45m)\n2. Take a 15-minute mock interview in Chrona Mentor\n3. Review 1 system design concept`;

    return `### 🎯 High-Impact Action Plan for Today (${name})

Aligned with your target for **${company} (${role})**:

${taskList}

- **Active Milestone**: ${activeTopic}
- **Current Placement Score**: **${readiness}%** (Target: 90%+)

💡 *Execution Tip*: Block 60 minutes of distraction-free deep work on your #1 task right now. Completing it will trigger immediate progress across your Career GPS!`;
  }

  // 7. TIRED / BURNOUT / LOW MOTIVATION
  if (q.includes('tired') || q.includes('burnout') || q.includes('stressed') || q.includes('low') || q.includes('overwhelm') || q.includes('lazy')) {
    return `### 🧘 Pacing & Recharge Recommendation

I hear you, ${name}. Preparing for competitive roles at companies like **${company}** is an intensive endurance run, not an all-out sprint. Cognitive fatigue directly reduces problem-solving intuition.

#### What we'll do today:
1. **Reduce the Load**: Cut today's target to just **one lightweight 30-minute task** on ${activeTopic}.
2. **Non-Zero Day**: Doing 1 problem or reviewing notes keeps the neural pathways active without draining you.
3. **Physical Reset**: Step away from the screen for 20 minutes, drink water, and get proper sleep tonight.

Your baseline progress is solid at **${readiness}%**. Let's protect your stamina so you can accelerate tomorrow!`;
  }

  // 8. INTERVIEW PREPARATION / RESUME
  if (q.includes('interview') || q.includes('mock') || q.includes('resume') || q.includes('hr round') || q.includes('behavioral')) {
    return `### 🎙️ Interview Strategy for ${company} (${role})

For **${company}**, technical candidates are typically evaluated across 3 pillars:

1. **Coding & Problem Solving (50%)**: Clear thought process, explaining time/space complexities before writing code, edge case validation.
2. **System Architecture / Core CS (30%)**: OOP, Concurrency, Database indexing, and Clean Code structure.
3. **Behavioral & Culture Fit (20%)**: The **STAR Method** (Situation, Task, Action, Result) showcasing ownership, mentorship, and handling technical ambiguity.

🎯 **Immediate Action**: Launch the **Chrona Mock Interview** module to practice answering aloud under timed conditions!`;
  }

  // 9. DEFAULT COMPREHENSIVE INTELLIGENT ADVICE
  return `### 🚀 Chrona Mentor Guidance for ${name}

Regarding your query about **"${query}"**:

To optimize your journey toward **${company} (${role})**:
- **Core Priority**: Focus on mastering **${activeTopic}** in your current roadmap.
- **Placement Readiness**: Currently at **${readiness}%**. Raising this to 90%+ requires steady consistency across DSA, Projects, and Mock Interviews.
- **Actionable Step**: Review your pending tasks in Today's Mission and complete 1 high-priority problem or revision block today.

Feel free to ask for specific code implementations, algorithm breakdowns, or interview mock questions anytime!`;
}
