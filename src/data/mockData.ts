import type {
  MissionItem,
  CareerRoadmapNode,
  SkillGapItem,
  ApplicationTrackerItem,
  StudyDocument,
  SmartNoteLecture,
  InterviewFeedback,
  GoalItem,
  CalendarEventItem,
  StudentProfile
} from '../types/chrona';

export const initialMissions: MissionItem[] = [
  {
    id: 'm1',
    title: 'Solve 2 Graph Problems (Dijkstra & Topological Sort)',
    category: 'Coding & LeetCode',
    estimatedMinutes: 45,
    impact: 'High',
    completed: true,
    aiRationale: {
      goal: 'Google Software Engineering Intern',
      deadline: 'Online Assessment in 12 Days',
      skillGap: 'Graph Traversal (Current 65% vs Target 90%)',
      energyLevel: 'Peak (94% Focus Readiness)',
      focusPrediction: 'High Deep Work Window 09:00 - 11:30',
      why: 'Graphs appear in 78% of Google technical rounds. Your graph speed is currently 22% lower than successful applicants. Completing Dijkstra practice today yields +1.2% placement readiness.'
    }
  },
  {
    id: 'm2',
    title: 'Revise Operating Systems Module 3 (Virtual Memory)',
    category: 'Core Theory',
    estimatedMinutes: 40,
    impact: 'High',
    completed: true,
    aiRationale: {
      goal: 'Semester Exams & Tech Interviews',
      deadline: 'OS Midterm in 5 Days',
      skillGap: 'Page Replacement Algorithms & TLB',
      energyLevel: 'Optimal (88% Focus Readiness)',
      focusPrediction: 'Mid-day Study Slot 14:00 - 15:30',
      why: 'Virtual Memory is weightage #1 in OS exams and frequently tested in round 1 technical interviews at Tier-1 companies.'
    }
  },
  {
    id: 'm3',
    title: 'Apply for Google SWE Summer Internship 2027',
    category: 'Career GPS',
    estimatedMinutes: 20,
    impact: 'Critical',
    completed: false,
    aiRationale: {
      goal: 'Target Company: Google',
      deadline: 'Application Window Closes in 48 Hours',
      skillGap: 'None (Resume ATS Score is 92%)',
      energyLevel: 'High',
      focusPrediction: 'Immediate Action Recommended',
      why: 'Applications submitted within the first 7 days have a 3.4x higher referral response rate according to Chrona candidate tracking dataset.'
    }
  },
  {
    id: 'm4',
    title: 'Complete Resume Improvements (Add KV Store Benchmarks)',
    category: 'Career Growth',
    estimatedMinutes: 45,
    impact: 'Medium',
    completed: false,
    aiRationale: {
      goal: 'Resume Optimization',
      deadline: 'This Weekend',
      skillGap: 'Quantified Metrics in Distributed Systems section',
      energyLevel: 'High',
      focusPrediction: 'Evening Focus Window 17:00 - 18:00',
      why: 'Adding latency metrics (e.g. "Reduced p99 latency by 34ms") will increase your resume matching score for Stripe and Google from 84% to 92%.'
    }
  }
];

export const initialRoadmapNodes: CareerRoadmapNode[] = [];

export const initialSkillGaps: SkillGapItem[] = [];

export const initialApplications: ApplicationTrackerItem[] = [];

export const initialStudyDocuments: StudyDocument[] = [
  {
    id: 'doc-1',
    title: 'Operating_Systems_Kernel_Architecture.pdf',
    type: 'PDF',
    size: '4.8 MB',
    uploadDate: '2026-07-25',
    estimatedStudyTime: '45 mins',
    difficulty: 'Challenging',
    pages: 48,
    importantTopics: ['Virtual Memory & Paging', 'TLB Architecture', 'Mutex vs Semaphore', 'Deadlock Detection'],
    smartNotes: [
      'Virtual Memory creates an illusion of a large memory space by swapping pages between RAM and disk.',
      'TLB (Translation Lookaside Buffer) acts as a hardware cache for Page Table Entries (PTE), drastically reducing memory lookup overhead.',
      'Preemptive scheduling allows high-priority processes to interrupt lower-priority running processes.',
      'Banker\'s Algorithm avoids deadlocks by ensuring safe allocation states.'
    ],
    flashcards: [
      { question: 'What is a Translation Lookaside Buffer (TLB)?', answer: 'A high-speed hardware cache used by the MMU to store recent virtual-to-physical address translations.', tag: 'Memory Management' },
      { question: 'Explain Page Fault handling steps.', answer: '1. Trap to OS. 2. Save registers. 3. Check page table for validity. 4. Find free frame on disk. 5. Read page into RAM. 6. Update page table. 7. Restart instruction.', tag: 'OS Internals' },
      { question: 'What is the main difference between Mutex and Semaphore?', answer: 'A Mutex is a locking mechanism for single ownership, whereas a Semaphore is a signaling mechanism supporting multiple permits.', tag: 'Concurrency' }
    ],
    mindMapNodes: [
      { id: '1', label: 'OS Kernel Architecture', children: ['2', '3', '4'] },
      { id: '2', label: 'Process Management', children: ['2a', '2b'] },
      { id: '2a', label: 'Scheduling Algorithms (Round Robin, priority)' },
      { id: '2b', label: 'Concurrency (Mutexes, Semaphores)' },
      { id: '3', label: 'Memory Management', children: ['3a', '3b'] },
      { id: '3a', label: 'Paging & Virtual Memory' },
      { id: '3b', label: 'TLB & Page Fault Handler' },
      { id: '4', label: 'Storage & I/O Systems' }
    ],
    revisionSchedule: [
      { day: 'Day 1 (Today)', topic: 'Virtual Memory & TLB Misses', status: 'Scheduled' },
      { day: 'Day 3', topic: 'Deadlock & Banker\'s Algorithm', status: 'Upcoming' },
      { day: 'Day 7', topic: 'Full Chapter Practice Test', status: 'Upcoming' }
    ],
    quizQuestions: [
      {
        question: 'Which component is responsible for translating virtual addresses into physical memory addresses?',
        options: ['ALU', 'Memory Management Unit (MMU)', 'L3 Cache Controller', 'Direct Memory Access (DMA)'],
        answerIndex: 1,
        explanation: 'The MMU (Memory Management Unit) handles virtual memory address translation assisted by the TLB.'
      },
      {
        question: 'What occurs when a process attempts to access a virtual page not currently present in RAM?',
        options: ['Segmentation Fault', 'Page Fault Interrupt', 'Bus Error', 'Kernel Panic'],
        answerIndex: 1,
        explanation: 'A Page Fault occurs, triggering the OS kernel to load the missing page from disk into a free RAM frame.'
      }
    ],
    probableExamQs: [
      { question: 'Derive the Effective Access Time (EAT) formula given TLB hit ratio α = 0.95, TLB lookup time = 20ns, RAM access = 100ns.', weightage: '10 Marks', probability: 94 },
      { question: 'Explain Page Replacement algorithms (LRU, FIFO, Optimal) withBelady\'s Anomaly example.', weightage: '12 Marks', probability: 89 }
    ]
  },
  {
    id: 'doc-2',
    title: 'Data_Structures_Advanced_Graphs.pdf',
    type: 'PDF',
    size: '3.2 MB',
    uploadDate: '2026-07-26',
    estimatedStudyTime: '60 mins',
    difficulty: 'Advanced',
    pages: 36,
    importantTopics: ['Dijkstra\'s Shortest Path', 'Topological Sort (Kahn\'s & DFS)', 'Tarjan\'s Strongly Connected Components', 'Disjoint Set Union (DSU)'],
    smartNotes: [
      'Dijkstra\'s algorithm finds shortest paths in non-negative weighted graphs using a Min-Heap in O((V + E) log V) time.',
      'Topological Sort requires a Directed Acyclic Graph (DAG) and can be solved using Kahn\'s indegree algorithm.',
      'Union-Find (DSU) with Path Compression and Rank optimization runs in near O(1) amortized time α(N).'
    ],
    flashcards: [
      { question: 'Why does Dijkstra algorithm fail on negative edge weights?', answer: 'Dijkstra assumes that adding an edge can never decrease path cost. Negative edges break greedy local optimality.', tag: 'Graph Theory' },
      { question: 'Time complexity of Union-Find with Path Compression & Rank?', answer: 'O(α(N)) amortized per operation, where α is the inverse Ackermann function.', tag: 'Data Structures' }
    ],
    mindMapNodes: [
      { id: '1', label: 'Advanced Graph Algorithms', children: ['2', '3'] },
      { id: '2', label: 'Shortest Path', children: ['Dijkstra', 'Bellman-Ford', 'Floyd-Warshall'] },
      { id: '3', label: 'Graph Connectivity', children: ['Tarjan SCC', 'Kruskal & Prim MST', 'DSU'] }
    ],
    revisionSchedule: [
      { day: 'Today', topic: 'Dijkstra & Min-Heap Implementation', status: 'Scheduled' },
      { day: 'Tomorrow', topic: 'Topological Sort & Kahn Algorithm', status: 'Upcoming' }
    ],
    quizQuestions: [
      {
        question: 'Which algorithm is best suited for detecting negative weight cycles in a directed graph?',
        options: ['Dijkstra', 'BFS', 'Bellman-Ford', 'Prim\'s Algorithm'],
        answerIndex: 2,
        explanation: 'Bellman-Ford algorithm can handle negative weights and detect negative cycle presence in O(V * E) time.'
      }
    ],
    probableExamQs: [
      { question: 'Write out the full pseudocode for Kahn\'s Topological Sorting algorithm using an In-Degree array and Queue.', weightage: '8 Marks', probability: 92 }
    ]
  }
];

export const initialSmartNoteLectures: SmartNoteLecture[] = [
  {
    id: 'lec-1',
    title: 'Distributed Systems & Consensus Protocols (Raft & Paxos)',
    course: 'CS-602 Advanced Computer Systems',
    date: '2026-07-27',
    duration: '42 mins',
    transcript: 'Welcome everyone. Today we discuss consensus in distributed systems. When nodes are distributed across servers, network partitions and node crashes happen. How do we ensure all healthy nodes agree on a single state log? We use Raft consensus protocol.',
    executiveSummary: {
      short: 'Raft protocol achieves consensus by separating leader election, log replication, and safety.',
      medium: [
        'Consensus mechanisms enable distributed nodes to agree on state logs.',
        'Raft nodes transition between Follower, Candidate, and Leader states.',
        'Randomized election timeouts prevent split-vote deadlocks.'
      ],
      detailed: 'The lecture covered distributed consensus principles, network partition fault tolerance, and the Raft Protocol architecture.'
    },
    keyConcepts: [
      { term: 'Consensus Protocol', checked: true },
      { term: 'Raft Node States', checked: true },
      { term: 'Split Vote Resolution', checked: false }
    ],
    formulas: 'Quorum Majority Q = floor(N / 2) + 1',
    revisionCards: [
      { question: 'What are the three Raft States?', answer: 'Follower, Candidate, Leader', tag: 'Architecture' }
    ],
    quiz: [
      { type: 'mcq', q: 'What happens if a Raft leader crashes?', options: ['New election', 'System stops'], correct: 0 }
    ],
    examQuestions: [
      { question: 'Explain Raft consensus leader election mechanism.', weightage: '10 Marks', probability: 92, modelAnswer: 'Follower times out -> Candidate -> RequestVote RPC -> Majority quorum' }
    ],
    studyTime: '25 mins',
    confidenceScore: 96
  }
];

export const initialMockInterviewFeedback: InterviewFeedback = {
  metrics: {
    confidence: 88,
    communication: 91,
    technicalAccuracy: 86,
    codingSkills: 90,
    problemSolving: 87,
    eyeContact: 89,
    speakingSpeedWpm: 138,
    grammar: 94,
    bodyLanguage: 92,
    overallScore: 89
  },
  weakAreas: [
    'System Design latency trade-offs (needs quantitative estimations)',
    'Edge case analysis before starting code implementation',
    'Conciseness when explaining complex graph space complexity'
  ],
  suggestions: [
    'State time and space complexity explicitly BEFORE writing code.',
    'Use the STAR framework (Situation, Task, Action, Result) for behavioral questions.',
    'Practice calculating p99 latencies for distributed storage questions.'
  ]
};

export const initialGoals: GoalItem[] = [
  {
    id: 'g1',
    title: 'Crack GATE Computer Science 2027 (AIR < 100)',
    category: 'Higher Studies & Competitive Exams',
    targetDate: '2027-02-14',
    progress: 68,
    milestones: [
      { title: 'Complete OS & DBMS Syllabus', completed: true, dueDate: '2026-06-30' },
      { title: 'Finish Algorithms & Data Structures', completed: true, dueDate: '2026-08-15' },
      { title: 'Attempt 20 Full-Length Mock Exams', completed: false, dueDate: '2026-12-01' },
      { title: 'Targeted Revision of Weak Topics (Maths & Theory)', completed: false, dueDate: '2027-01-20' }
    ],
    dependencies: ['OS Theory Notes', 'DSA Mastery', 'Gate Previous Year Questions'],
    dailyMissions: ['Solve 10 GATE PyQs daily', 'Revise 1 formula sheet'],
    weeklyMissions: ['Attempt 1 Topic Mock Test', 'Review wrong questions log'],
    predictedCompletionDate: '2027-02-10',
    riskScore: 'Low Risk',
    riskFactor: 'On track! 12% probability of delay in Engineering Mathematics topic.'
  },
  {
    id: 'g2',
    title: 'Land Google SWE Summer Internship 2027',
    category: 'Career Dream Goal',
    targetDate: '2027-05-01',
    progress: 82,
    milestones: [
      { title: 'LeetCode 300+ Problems Solved', completed: true, dueDate: '2026-07-01' },
      { title: 'Distributed Systems Capstone Project', completed: true, dueDate: '2026-07-20' },
      { title: 'Google Employee Referral Secured', completed: false, dueDate: '2026-08-10' },
      { title: 'Ace Technical Interview Rounds', completed: false, dueDate: '2026-09-30' }
    ],
    dependencies: ['Graph Algorithms', 'System Design Basics', 'Resume ATS Score 90%+'],
    dailyMissions: ['Solve 2 LeetCode Medium/Hard', '1 Mock Interview practice'],
    weeklyMissions: ['Reach out to 3 Google Alum for referrals', '1 System Design case study'],
    predictedCompletionDate: '2027-04-15',
    riskScore: 'Low Risk',
    riskFactor: 'High momentum! Placement readiness is at 88.4%.'
  }
];

export const initialCalendarEvents: CalendarEventItem[] = [
  { id: 'c1', title: '🚀 Peak Focus Deep Work: Graph Algorithms', startTime: '09:00', endTime: '11:00', day: 'Today', category: 'Study', isPeakFocus: true },
  { id: 'c2', title: '📚 OS Module 3 Virtual Memory Revision', startTime: '11:30', endTime: '12:30', day: 'Today', category: 'Revision', isPeakFocus: false },
  { id: 'c3', title: '💼 AI Mock Interview Simulation (Google Technical)', startTime: '14:30', endTime: '15:30', day: 'Today', category: 'Interview Prep', isPeakFocus: true },
  { id: 'c4', title: '⚠️ Heavy Study Load Alert: 6 Hours Scheduled', startTime: '16:00', endTime: '18:00', day: 'Tomorrow', category: 'Study', isPeakFocus: false, burnoutWarning: true, aiSuggestedAction: 'AI recommends shifting 1h System Design study to Friday morning.' }
];

export const initialStudentProfile: StudentProfile = {
  name: 'Alex Vance',
  email: 'alex.vance@stanford.edu',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  branch: 'Computer Science & Engineering',
  semester: '6th Semester',
  cgpa: 3.92,
  dreamCompany: 'Google',
  careerGoal: 'Staff AI/Systems Engineer',
  placementReadiness: 88.4,
  resumeScore: 92,
  interviewReadiness: 86,
  codingReadiness: 94,
  projectScore: 90,
  skills: [
    { name: 'Data Structures & Algorithms', rating: 94, category: 'Coding' },
    { name: 'System Design & Distributed Systems', rating: 85, category: 'Architecture' },
    { name: 'React / Next.js / TypeScript', rating: 92, category: 'Frontend' },
    { name: 'Go / Python / C++', rating: 88, category: 'Languages' },
    { name: 'Operating Systems & Linux Kernel', rating: 82, category: 'Core' }
  ],
  projects: [
    {
      title: 'Chrona - AI Time Intelligence OS',
      desc: 'Billion-dollar AI operating system predicting student study paths, career roadmaps, and peak focus intervals.',
      tech: ['React', 'TypeScript', 'Tailwind', 'Web Audio API', 'Recharts'],
      link: 'https://github.com/alexvance/chrona'
    },
    {
      title: 'RaftKV - Distributed Consensus Store',
      desc: 'High-throughput fault-tolerant key-value database implementing Raft consensus in Go with 50k QPS.',
      tech: ['Go', 'Raft Protocol', 'gRPC', 'Protobuf', 'Docker'],
      link: 'https://github.com/alexvance/raft-kv'
    }
  ],
  certifications: [
    'AWS Certified Solutions Architect Associate',
    'Google Cloud Professional Cloud Architect',
    'DeepLearning.AI Machine Learning Specialization'
  ],
  achievements: [
    'Global Rank #142 - LeetCode Weekly Contest 388',
    'Winner - Stanford AI & Systems Hackathon 2026',
    'Published Research Paper on Distributed Memory Cache'
  ]
};
