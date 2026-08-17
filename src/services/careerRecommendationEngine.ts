/**
 * CHRONA CAREER RECOMMENDATION & DISCOVERY ENGINE
 *
 * Evaluates student preferences, academic strengths, skill affinities, and career priorities
 * to generate 3-5 personalized career recommendations with detailed explanations,
 * skill progressions, and comparison matrices.
 * Stores records under Cloud Firestore `users/{userId}/careerAssessment`.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  CareerAssessmentAnswers,
  CareerRecommendationMatch,
  UserCareerAssessmentRecord
} from '../types/chrona';

/**
 * Save career assessment & recommendations to Firestore under `users/{userId}/careerAssessment/record`
 */
export async function saveUserCareerAssessment(
  userId: string,
  record: UserCareerAssessmentRecord
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'careerAssessment', 'record');
    await setDoc(docRef, {
      ...record,
      assessmentUpdatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[CareerRecommendationEngine] Firestore write error:', err);
  }
}

/**
 * Read career assessment from Firestore
 */
export async function getUserCareerAssessment(
  userId: string
): Promise<UserCareerAssessmentRecord | null> {
  try {
    const docRef = doc(db, 'users', userId, 'careerAssessment', 'record');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserCareerAssessmentRecord;
    }
  } catch (err) {
    console.warn('[CareerRecommendationEngine] Firestore read error:', err);
  }
  return null;
}

/**
 * Analyze student questionnaire answers and calculate 3-5 personalized career matches
 */
export function generateCareerRecommendations(
  answers: CareerAssessmentAnswers
): CareerRecommendationMatch[] {
  const allSubjects = [...(answers.enjoyedSubjects || []), ...(answers.strongestSubjects || [])].map(s => s.toLowerCase());
  const workTypes = (answers.preferredWorkTypes || []).map(w => w.toLowerCase());
  const priorities = (answers.careerPriorities || []).map(p => p.toLowerCase());
  const industries = (answers.interestedIndustries || []).map(i => i.toLowerCase());

  const recommendations: CareerRecommendationMatch[] = [];

  // 1. AI / MACHINE LEARNING ENGINEER
  let aiScore = 65;
  if (allSubjects.some(s => s.includes('ai') || s.includes('neural') || s.includes('machine learning'))) aiScore += 20;
  else if (allSubjects.some(s => s.includes('algorithm') || s.includes('coding'))) aiScore += 10;
  if (workTypes.some(w => w.includes('coding') || w.includes('problem'))) aiScore += 10;
  if (priorities.some(p => p.includes('growth') || p.includes('research'))) aiScore += 5;
  if (industries.some(i => i.includes('ai') || i.includes('ml'))) aiScore += 5;

  recommendations.push({
    id: 'ai-engineer',
    role: 'AI Engineer',
    title: 'AI / Machine Learning Engineer',
    category: 'Artificial Intelligence',
    matchPercentage: Math.min(96, Math.max(65, aiScore)),
    whyItSuitsYou: [
      'Strong alignment with analytical problem solving and algorithmic reasoning',
      'Matches interest in high-growth, cutting-edge technology domains',
      'Ideal for building intelligent autonomous systems and AI models'
    ],
    strengthsSupporting: [
      'Comfort with mathematics and logical structured thinking',
      'Affinity for software programming and continuous learning'
    ],
    skillsRequired: ['Python', 'Linear Algebra & Calculus', 'Data Structures', 'PyTorch / TensorFlow'],
    skillsToDevelop: ['Machine Learning Fundamentals', 'Deep Learning Architectures', 'Model Deployment & MLOps'],
    currentSkillGaps: ['Neural Network Tuning', 'ML Model Optimization', 'Vector Databases'],
    typicalWork: 'Designing, training, evaluating, and deploying machine learning models into production systems.',
    learningDifficulty: 'Challenging',
    growthDirection: 'Senior AI Engineer → Lead AI Architect → Chief AI Officer (CAIO)',
    suggestedNextSteps: [
      'Master Python data science stack (NumPy, Pandas, Scikit-Learn)',
      'Build a hands-on Machine Learning project (e.g. Image Classifier or NLP Assistant)',
      'Practice core Data Structures & Algorithms'
    ],
    suggestedProjects: [
      'AI Student Study Partner Assistant',
      'Predictive Analytics Pipeline for Placement Readiness',
      'Neural Network Image Recognition Web Service'
    ],
    skillProgression: {
      beginner: ['Python Basics', 'NumPy & Pandas', 'Basic Probability & Math'],
      intermediate: ['Scikit-Learn', 'Feature Engineering', 'PyTorch Basics'],
      advanced: ['Transformer Architectures', 'LLM Fine-tuning', 'MLOps & Kubernetes']
    }
  });

  // 2. DATA SCIENTIST / DATA ANALYST
  let dataScore = 68;
  if (allSubjects.some(s => s.includes('math') || s.includes('stat') || s.includes('data') || s.includes('analytics'))) dataScore += 16;
  if (workTypes.some(w => w.includes('analytics') || w.includes('research') || w.includes('problem'))) dataScore += 10;
  if (priorities.some(p => p.includes('stability') || p.includes('salary'))) dataScore += 5;

  recommendations.push({
    id: 'data-scientist',
    role: 'Data Scientist',
    title: 'Data Scientist & Statistical Analyst',
    category: 'Data & Analytics',
    matchPercentage: Math.min(94, Math.max(62, dataScore)),
    whyItSuitsYou: [
      'High compatibility with data analysis, statistical modeling, and pattern discovery',
      'Suits individuals who enjoy turning raw numbers into actionable business insights',
      'Strong overlap with your analytical and mathematical strengths'
    ],
    strengthsSupporting: [
      'Curiosity for uncovering trends and statistical relationships',
      'Clear structured data communication skills'
    ],
    skillsRequired: ['Python / R', 'SQL & Database Queries', 'Applied Statistics', 'Data Visualization (Tableau/Seaborn)'],
    skillsToDevelop: ['Statistical Hypothesis Testing', 'Predictive Modeling', 'A/B Testing Methodology'],
    currentSkillGaps: ['Advanced SQL Queries', 'Statistical Inference', 'Dashboard Storytelling'],
    typicalWork: 'Analyzing complex data sets, building predictive statistical models, and delivering business intelligence reports.',
    learningDifficulty: 'Moderate',
    growthDirection: 'Data Scientist → Lead Data Scientist → Head of Data & Analytics',
    suggestedNextSteps: [
      'Master SQL queries and relational database schemas',
      'Practice data cleaning and exploratory data analysis (EDA) in Python',
      'Build a data visualization dashboard using real-world public datasets'
    ],
    suggestedProjects: [
      'E-commerce Customer Churn Prediction Engine',
      'Interactive Global Placement & Salary Analytics Dashboard',
      'Automated Financial Stock Market Sentiment Analyzer'
    ],
    skillProgression: {
      beginner: ['SQL Fundamentals', 'Excel Data Analysis', 'Python Plotting'],
      intermediate: ['Exploratory Data Analysis', 'Regression & Classification', 'Tableau Dashboards'],
      advanced: ['Time Series Forecasting', 'Big Data (Spark/Hadoop)', 'Experimentation & A/B Testing']
    }
  });

  // 3. FULL STACK DEVELOPER
  let devScore = 72;
  if (allSubjects.some(s => s.includes('code') || s.includes('web') || s.includes('java') || s.includes('computer'))) devScore += 15;
  if (workTypes.some(w => w.includes('coding') || w.includes('product') || w.includes('building'))) devScore += 10;
  if (priorities.some(p => p.includes('growth') || p.includes('entrepreneurship') || p.includes('stability'))) devScore += 5;

  recommendations.push({
    id: 'full-stack-developer',
    role: 'Full Stack Developer',
    title: 'Full Stack Web & Application Engineer',
    category: 'Software Engineering',
    matchPercentage: Math.min(95, Math.max(68, devScore)),
    whyItSuitsYou: [
      'Strong match for building complete end-to-end web applications',
      'Combines creative user interface building with robust backend system logic',
      'High industry demand across startups and major tech companies'
    ],
    strengthsSupporting: [
      'Practical problem-solving mindset and passion for product creation',
      'Versatility across both client-side UI and server-side APIs'
    ],
    skillsRequired: ['HTML/CSS & JavaScript', 'React / Next.js', 'Node.js & Express', 'Databases (MongoDB/PostgreSQL)'],
    skillsToDevelop: ['RESTful API Design', 'State Management & Authentication', 'Web Application Security'],
    currentSkillGaps: ['Backend Database Indexing', 'API Rate Limiting', 'Cloud Deployment (Vite/Vercel/Docker)'],
    typicalWork: 'Developing user interfaces, engineering REST/GraphQL APIs, managing databases, and shipping web features.',
    learningDifficulty: 'Beginner Friendly',
    growthDirection: 'Full Stack Developer → Senior Software Engineer → Technical Lead / CTO',
    suggestedNextSteps: [
      'Build dynamic single-page web applications with React and TypeScript',
      'Create custom REST API backend servers with Node.js and Express',
      'Deploy full-stack web applications with cloud database hosting'
    ],
    suggestedProjects: [
      'Real-Time Student Collaboration & Task Management Platform',
      'E-Commerce Marketplace with Secure Payment Gateway',
      'Developer Portfolio & Interactive Resume Builder'
    ],
    skillProgression: {
      beginner: ['HTML5, CSS3 & Modern JS', 'React Basics', 'Git Version Control'],
      intermediate: ['TypeScript & Next.js', 'Node.js REST APIs', 'PostgreSQL & ORMs'],
      advanced: ['Microservices Architecture', 'Docker & CI/CD Pipelines', 'Performance & Caching']
    }
  });

  // 4. CYBERSECURITY ENGINEER
  let secScore = 65;
  if (allSubjects.some(s => s.includes('sec') || s.includes('net') || s.includes('linux') || s.includes('system'))) secScore += 18;
  if (workTypes.some(w => w.includes('problem') || w.includes('research') || w.includes('analysis'))) secScore += 10;
  if (priorities.some(p => p.includes('stability') || p.includes('high salary'))) secScore += 5;

  recommendations.push({
    id: 'cybersecurity-engineer',
    role: 'Cybersecurity Engineer',
    title: 'Cybersecurity & Network Security Engineer',
    category: 'Information Security',
    matchPercentage: Math.min(92, Math.max(60, secScore)),
    whyItSuitsYou: [
      'Ideal for individuals fascinated by system defence, cryptography, and network protocols',
      'Protects critical infrastructure, corporate assets, and user privacy',
      'High job security and critical importance across all tech sectors'
    ],
    strengthsSupporting: [
      'Methodical investigative thinking and attention to security detail',
      'Deep curiosity for how networks and operating systems operate under the hood'
    ],
    skillsRequired: ['Networking Protocols (TCP/IP)', 'Linux Systems Administration', 'Ethical Hacking Fundamentals', 'Python/Bash Scripting'],
    skillsToDevelop: ['Vulnerability Assessment', 'Penetration Testing', 'SIEM & Threat Monitoring'],
    currentSkillGaps: ['Network Traffic Inspection (Wireshark)', 'Web App Vulnerabilities (OWASP Top 10)', 'Cloud Security'],
    typicalWork: 'Auditing security posture, performing penetration testing, monitoring network threats, and hardening server infrastructure.',
    learningDifficulty: 'Moderate',
    growthDirection: 'Security Engineer → Lead Security Architect → Chief Information Security Officer (CISO)',
    suggestedNextSteps: [
      'Master Linux terminal operations and TCP/IP networking fundamentals',
      'Study OWASP Top 10 web application vulnerabilities and remediation',
      'Practice on TryHackMe or HackTheBox platforms'
    ],
    suggestedProjects: [
      'Automated Vulnerability Scanner & Port Inspector Tool',
      'Secure Encrypted Chat Application with End-to-End Cryptography',
      'Network Intrusion Detection System (IDS) Log Analyzer'
    ],
    skillProgression: {
      beginner: ['CompTIA Security+ Concepts', 'Linux CLI', 'Basic Networking'],
      intermediate: ['OWASP Top 10 Web Security', 'Wireshark & Packet Analysis', 'Python Security Scripts'],
      advanced: ['Penetration Testing (OSCP)', 'Cloud Security Hardening', 'Incident Response & Forensics']
    }
  });

  // 5. UI/UX DESIGNER
  let uiScore = 60;
  if (allSubjects.some(s => s.includes('design') || s.includes('art') || s.includes('creativ') || s.includes('ui'))) uiScore += 22;
  if (workTypes.some(w => w.includes('design') || w.includes('creativ') || w.includes('people'))) uiScore += 12;
  if (priorities.some(p => p.includes('creativ') || p.includes('work-life'))) uiScore += 5;

  recommendations.push({
    id: 'ui-ux-designer',
    role: 'UI/UX Designer',
    title: 'User Interface & User Experience Designer',
    category: 'Design & Product',
    matchPercentage: Math.min(93, Math.max(58, uiScore)),
    whyItSuitsYou: [
      'Perfect match for visual creativity, empathy, and user-centered design',
      'Transforms complex product workflows into intuitive, beautiful user experiences',
      'Combines design aesthetics with user research and psychology'
    ],
    strengthsSupporting: [
      'Strong eye for visual layout, typography, and color harmony',
      'Empathy for user pain points and intuitive interface flows'
    ],
    skillsRequired: ['Figma / Adobe XD', 'Wireframing & Prototyping', 'User Research & Persona Design', 'Visual Hierarchy & Typography'],
    skillsToDevelop: ['Interactive Design Systems', 'Usability Testing', 'Frontend HTML/CSS Basics'],
    currentSkillGaps: ['Design System Architecture', 'Interactive Component Micro-animations', 'User Journey Mapping'],
    typicalWork: 'Conducting user research, crafting wireframes and interactive prototypes, building design systems, and testing usability.',
    learningDifficulty: 'Beginner Friendly',
    growthDirection: 'UI/UX Designer → Product Designer → Head of Design / VP of User Experience',
    suggestedNextSteps: [
      'Master Figma components, auto-layout, and interactive prototyping',
      'Redesign an existing mobile app to improve usability and visual hierarchy',
      'Build a portfolio displaying full case studies from user research to final UI'
    ],
    suggestedProjects: [
      'Student Academic & Daily Planner Mobile App Redesign',
      'Fintech Mobile Wallet App Wireframe & Interactive Prototype',
      'Comprehensive Glassmorphic Web UI Design System in Figma'
    ],
    skillProgression: {
      beginner: ['Figma Basics', 'Color Theory & Typography', 'Wireframing'],
      intermediate: ['Interactive Prototyping', 'User Research & Personas', 'Usability Testing'],
      advanced: ['Design Systems at Scale', 'Design Tokens & Micro-interactions', 'UX Strategy & Metrics']
    }
  });

  // Sort descending by match percentage
  recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return recommendations;
}
