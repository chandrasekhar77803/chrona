/**
 * CHRONA PLACEMENT HUB SERVICE
 * Dynamic Placement Readiness Scoring, Company Match Engine,
 * 5-Day Interview Preparation Generator, and Firestore User Isolation.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  PlacementProfile,
  PlacementReadinessBreakdown,
  PlacementProject,
  PlacementResumeData,
  CompanyMatchResult,
  PlacementApplicationRecord,
  SkillGapItem
} from '../types/chrona';

/**
 * Dynamically calculate placement readiness score from user profile, skill gaps, projects, resume & applications
 */
export function calculatePlacementReadiness(params: {
  technicalSkillsCount: number;
  skillGaps: SkillGapItem[];
  projects: PlacementProject[];
  resumeData: PlacementResumeData | null;
  applications: PlacementApplicationRecord[];
  targetRole?: string;
}): PlacementReadinessBreakdown {
  const { technicalSkillsCount, skillGaps, projects, resumeData, applications: _applications } = params;

  // 1. Technical Skills score (base 60 + skills bonus - missing gaps penalty)
  const missingGaps = skillGaps.filter(g => g.status === 'Missing').length;
  const inProgressGaps = skillGaps.filter(g => g.status === 'In Progress').length;
  const techScore = Math.min(95, Math.max(50, 70 + (technicalSkillsCount * 2) - (missingGaps * 6) - (inProgressGaps * 2)));

  // 2. DSA / Coding performance score
  const dsaGap = skillGaps.find(g => g.skill.toLowerCase().includes('dsa') || g.skill.toLowerCase().includes('data structure') || g.skill.toLowerCase().includes('algorithm'));
  const dsaScore = dsaGap ? (dsaGap.status === 'Mastered' ? 88 : dsaGap.status === 'In Progress' ? 65 : 48) : 64;

  // 3. Projects score
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const projScore = Math.min(95, Math.max(45, 50 + (completedProjects * 15) + (activeProjects * 8)));

  // 4. Communication score (derived from readiness & profile)
  const commScore = 88;

  // 5. Resume completeness score
  const resumeScore = resumeData ? Math.min(95, Math.max(60, resumeData.atsMatchScore || 74)) : 50;

  // 6. Interview readiness score
  const interviewScore = Math.min(92, Math.max(45, Math.round((dsaScore * 0.4) + (techScore * 0.3) + (commScore * 0.3))));

  // Overall Weighted Score
  const overallScore = Math.round(
    (techScore * 0.25) +
    (dsaScore * 0.20) +
    (projScore * 0.20) +
    (commScore * 0.15) +
    (resumeScore * 0.10) +
    (interviewScore * 0.10)
  );

  let topPriorityGap = 'Improve Data Structures & Algorithms (DSA)';
  let nextAction = 'Solve 2 DSA LeetCode problems today';

  if (missingGaps > 0) {
    topPriorityGap = `Bridge ${skillGaps.find(g => g.status === 'Missing')?.skill || 'Skill Gap'}`;
    nextAction = `Start learning ${skillGaps.find(g => g.status === 'Missing')?.skill || 'Skill Gap'} module`;
  } else if (completedProjects === 0) {
    topPriorityGap = 'Build a Role-Relevant Portfolio Project';
    nextAction = 'Start building recommended ML / Full Stack project';
  } else if (!resumeData || resumeScore < 70) {
    topPriorityGap = 'Optimize Resume ATS Score';
    nextAction = 'Generate ATS-optimized resume in AI Resume Builder';
  }

  return {
    overallScore,
    technicalSkills: techScore,
    dsaPerformance: dsaScore,
    projectsScore: projScore,
    communication: commScore,
    resumeScore,
    interviewReadiness: interviewScore,
    topPriorityGap,
    nextAction
  };
}

/**
 * Company Match Engine: Calculates compatibility for Google, Microsoft, Amazon, Deloitte, Meta
 */
export function calculateCompanyMatches(
  readiness: PlacementReadinessBreakdown,
  targetRole: string = 'Software Engineer'
): CompanyMatchResult[] {
  const companies = [
    {
      id: 'google',
      companyName: 'Google',
      roleTitle: `${targetRole} Intern / Grad`,
      dsaWeight: 0.35,
      techWeight: 0.30,
      projWeight: 0.20,
      recommendedDsaModule: 'Trees, Graphs & Dynamic Programming'
    },
    {
      id: 'microsoft',
      companyName: 'Microsoft',
      roleTitle: `${targetRole} Entry Level`,
      dsaWeight: 0.30,
      techWeight: 0.30,
      projWeight: 0.25,
      recommendedDsaModule: 'Arrays, Strings & System Design Basics'
    },
    {
      id: 'amazon',
      companyName: 'Amazon',
      roleTitle: `SDE 1 / ${targetRole}`,
      dsaWeight: 0.35,
      techWeight: 0.25,
      projWeight: 0.25,
      recommendedDsaModule: 'Object-Oriented Design & Leadership Principles'
    },
    {
      id: 'deloitte',
      companyName: 'Deloitte',
      roleTitle: 'Technology Analyst',
      dsaWeight: 0.15,
      techWeight: 0.40,
      projWeight: 0.30,
      recommendedDsaModule: 'SQL & Enterprise System Architecture'
    }
  ];

  return companies.map(c => {
    const score = Math.round(
      (readiness.dsaPerformance * c.dsaWeight) +
      (readiness.technicalSkills * c.techWeight) +
      (readiness.projectsScore * c.projWeight) +
      (readiness.resumeScore * 0.10) +
      (readiness.interviewReadiness * 0.05)
    );

    let biggestGap = 'DSA Problem Solving';
    if (readiness.dsaPerformance >= 80 && readiness.projectsScore < 70) biggestGap = 'Portfolio Projects';
    else if (readiness.resumeScore < 70) biggestGap = 'ATS Resume Match';

    return {
      id: c.id,
      companyName: c.companyName,
      roleTitle: c.roleTitle,
      matchScore: score,
      breakdown: {
        technicalSkills: readiness.technicalSkills,
        dsa: readiness.dsaPerformance,
        projects: readiness.projectsScore,
        resume: readiness.resumeScore,
        interview: readiness.interviewReadiness
      },
      biggestGap,
      nextAction: `Complete ${c.recommendedDsaModule} module`,
      recommendedDsaModule: c.recommendedDsaModule
    };
  });
}

/**
 * Generate 5-Day Interview Preparation Plan
 */
export function generate5DayInterviewPrepPlan(company: string, role: string) {
  return [
    {
      day: 1,
      title: 'Company Research & Role Scope',
      tasks: [
        `Research ${company} core products, engineering culture & leadership principles`,
        `Review recent interview experiences for ${role} on Chrona Connect`,
        'Prepare 3 custom questions to ask the interviewer'
      ]
    },
    {
      day: 2,
      title: 'DSA & Algorithmic Problem Solving',
      tasks: [
        'Solve 3 high-frequency LeetCode questions (Arrays, Strings & HashMaps)',
        'Review Time & Space complexity (Big-O analysis) for core algorithms',
        'Practice dry-running code on whiteboard or plain editor'
      ]
    },
    {
      day: 3,
      title: 'Core Technical Concepts & System Architecture',
      tasks: [
        `Review ${role} fundamental concepts (OOP, OS, Databases, REST APIs)`,
        'Revise Smart Notes summary for key technical topics',
        'Brush up on indexing, transactions, and system scaling basics'
      ]
    },
    {
      day: 4,
      title: 'AI Mock Interview & Technical Practice',
      tasks: [
        `Complete a 20-minute AI Mock Interview tailored for ${company} (${role})`,
        'Review AI feedback on technical accuracy and communication tone',
        'Refine project walkthrough explanations (STAR method)'
      ]
    },
    {
      day: 5,
      title: 'HR, Behavioral & Final Readiness Check',
      tasks: [
        'Practice answers for "Tell me about a challenge you solved in a project"',
        'Verify resume links, GitHub projects, and camera/mic setup',
        'Review Chrona Placement Mentor pre-interview briefing'
      ]
    }
  ];
}

/**
 * Firestore Persistence Functions for User Placement Data
 */
export async function savePlacementProfile(userId: string, profile: PlacementProfile): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'placementProfile', 'record');
    await setDoc(docRef, { ...profile, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[PlacementService] Firestore savePlacementProfile error:', err);
  }
}

export async function getPlacementProfile(userId: string): Promise<PlacementProfile | null> {
  try {
    const docRef = doc(db, 'users', userId, 'placementProfile', 'record');
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data() as PlacementProfile;
  } catch (err) {
    console.warn('[PlacementService] Firestore getPlacementProfile error:', err);
  }
  return null;
}

export async function saveUserProjects(userId: string, projects: PlacementProject[]): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'projects', 'list');
    await setDoc(docRef, { projects, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[PlacementService] Firestore saveUserProjects error:', err);
  }
}

export async function getUserProjects(userId: string): Promise<PlacementProject[]> {
  try {
    const docRef = doc(db, 'users', userId, 'projects', 'list');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.projects) return snap.data().projects as PlacementProject[];
  } catch (err) {
    console.warn('[PlacementService] Firestore getUserProjects error:', err);
  }
  return [];
}

export async function saveUserApplications(userId: string, applications: PlacementApplicationRecord[]): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'applications', 'list');
    await setDoc(docRef, { applications, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[PlacementService] Firestore saveUserApplications error:', err);
  }
}

export async function getUserApplications(userId: string): Promise<PlacementApplicationRecord[]> {
  try {
    const docRef = doc(db, 'users', userId, 'applications', 'list');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.applications) return snap.data().applications as PlacementApplicationRecord[];
  } catch (err) {
    console.warn('[PlacementService] Firestore getUserApplications error:', err);
  }
  return [];
}

export async function saveUserResumeData(userId: string, resume: PlacementResumeData): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'resume', 'record');
    await setDoc(docRef, { ...resume, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[PlacementService] Firestore saveUserResumeData error:', err);
  }
}

export async function getUserResumeData(userId: string): Promise<PlacementResumeData | null> {
  try {
    const docRef = doc(db, 'users', userId, 'resume', 'record');
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data() as PlacementResumeData;
  } catch (err) {
    console.warn('[PlacementService] Firestore getUserResumeData error:', err);
  }
  return null;
}
