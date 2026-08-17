import {
  generateMentorResponse,
  getWhatShouldIDoNext,
  UserContextSnapshot
} from '../src/services/mentorService';

async function runMentorPersonalizationTest() {
  console.log('====================================================');
  console.log('CHRONA MENTOR PERSONALIZATION TEST (USER A VS USER B)');
  console.log('====================================================\n');

  // USER A
  const userAContext: UserContextSnapshot = {
    userId: 'user_a_ai_eng',
    profile: {
      name: 'Alex Vance',
      email: 'alex@example.com',
      avatar: '',
      branch: 'CS AI',
      semester: 'Sem 3',
      cgpa: 8.5,
      dreamCompany: 'Google',
      careerGoal: 'AI Engineer',
      placementReadiness: 62,
      resumeScore: 70,
      interviewReadiness: 55,
      codingReadiness: 60,
      projectScore: 50
    },
    missions: [
      {
        id: 'task_a_1',
        title: 'Master Python Mathematics & NumPy',
        category: 'Career GPS Roadmap',
        estimatedMinutes: 60,
        impact: 'Critical',
        completed: false,
        aiRationale: {
          goal: 'Google AI Engineer Prep',
          deadline: 'Today',
          skillGap: 'Python & Math',
          energyLevel: 'High',
          focusPrediction: 'Deep Work',
          why: 'Foundational math for AI models'
        }
      }
    ],
    roadmapNodes: [
      {
        id: 'node_a_1',
        title: 'Month 1: Python Programming & Math Foundations',
        subtitle: 'AI Engineer Skills',
        timeframe: 'Month 1',
        status: 'in-progress',
        progress: 25,
        estimatedWeeks: 4,
        topics: ['Python Syntax', 'NumPy & Linear Algebra'],
        dailyTask: 'Practice Python Math',
        isCriticalPath: true
      }
    ],
    skillGaps: [{ skill: 'Machine Learning', priority: 'High', suggestedAction: 'Study ML Math' }]
  };

  // USER B
  const userBContext: UserContextSnapshot = {
    userId: 'user_b_fullstack',
    profile: {
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      avatar: '',
      branch: 'Information Technology',
      semester: 'Sem 5',
      cgpa: 9.1,
      dreamCompany: 'Microsoft',
      careerGoal: 'Full Stack Developer',
      placementReadiness: 84,
      resumeScore: 88,
      interviewReadiness: 80,
      codingReadiness: 85,
      projectScore: 82
    },
    missions: [
      {
        id: 'task_b_1',
        title: 'Build Express.js REST API & Auth Middleware',
        category: 'Career GPS Roadmap',
        estimatedMinutes: 45,
        impact: 'High',
        completed: false,
        aiRationale: {
          goal: 'Microsoft Full Stack Prep',
          deadline: 'Today',
          skillGap: 'Node & Express',
          energyLevel: 'High',
          focusPrediction: 'Deep Work',
          why: 'Backend API design'
        }
      }
    ],
    roadmapNodes: [
      {
        id: 'node_b_1',
        title: 'Month 2: Backend & API Development',
        subtitle: 'Full Stack Skills',
        timeframe: 'Month 2',
        status: 'in-progress',
        progress: 60,
        estimatedWeeks: 4,
        topics: ['Node.js', 'Express & JWT Auth'],
        dailyTask: 'Build API endpoints',
        isCriticalPath: true
      }
    ],
    skillGaps: [{ skill: 'System Design', priority: 'Medium', suggestedAction: 'Review Database Indexing' }]
  };

  console.log('--- TEST 1: User A ("What should I do today?") ---');
  const resA = await generateMentorResponse('What should I do today?', userAContext);
  console.log('User A Mentor Reply:\n', resA.text);

  console.log('\n--- TEST 2: User B ("What should I do today?") ---');
  const resB = await generateMentorResponse('What should I do today?', userBContext);
  console.log('User B Mentor Reply:\n', resB.text);

  console.log('\n--- TEST 3: "What Should I Do Next?" Calculation ---');
  const nextA = getWhatShouldIDoNext(userAContext);
  const nextB = getWhatShouldIDoNext(userBContext);
  console.log('User A Next Action:', nextA.recommendation);
  console.log('User B Next Action:', nextB.recommendation);

  console.log('\n--- ASSERTIONS & VERIFICATION ---');
  const isDifferentReplies = resA.text !== resB.text;
  const isUserAAiEng = resA.text.includes('AI Engineer') || resA.text.includes('Python') || resA.text.includes('Google');
  const isUserBFullStack = resB.text.includes('Full Stack') || resB.text.includes('Microsoft') || resB.text.includes('Express');
  const isNextDifferent = nextA.recommendation !== nextB.recommendation;

  console.log('Check 1 (User A & B Replies Are Distinct):', isDifferentReplies ? 'PASSED ✓' : 'FAILED ✗');
  console.log('Check 2 (User A Matches AI Engineer & Google Context):', isUserAAiEng ? 'PASSED ✓' : 'FAILED ✗');
  console.log('Check 3 (User B Matches Full Stack & Microsoft Context):', isUserBFullStack ? 'PASSED ✓' : 'FAILED ✗');
  console.log('Check 4 (What Should I Do Next Is Personalized):', isNextDifferent ? 'PASSED ✓' : 'FAILED ✗');

  if (isDifferentReplies && isUserAAiEng && isUserBFullStack && isNextDifferent) {
    console.log('\n✅ CHRONA MENTOR PERSONALIZATION VERIFICATION SUCCESSFUL!');
  } else {
    console.log('\n❌ VERIFICATION FAILED');
  }

  process.exit(0);
}

runMentorPersonalizationTest();
