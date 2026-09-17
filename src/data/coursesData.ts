export type CourseCategory = 'All Skills' | 'Core Programming' | 'Placement & DSA' | 'AI & Systems' | 'Web & Cloud';

export interface RoadmapConcept {
  id: string;
  name: string;
  detail: string;
  estimatedMin: number;
}

export interface RoadmapStage {
  stageNumber: number;
  title: string;
  duration: string;
  description: string;
  focusArea: string;
  concepts: RoadmapConcept[];
  capstone: {
    name: string;
    description: string;
    tech: string[];
    deliverables: string[];
  };
  interviewDrills: string[];
  syncTasks: Array<{
    title: string;
    estimatedMinutes: number;
    impact: 'High' | 'Medium' | 'Critical';
    why: string;
  }>;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: 'Core Programming' | 'Placement & DSA' | 'AI & Systems' | 'Web & Cloud';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery';
  duration: string;
  techStack: string[];
  placementTier: string;
  ctcTarget: string;
  rating: number;
  enrolledCount: number;
  description: string;
  color: {
    primary: string;
    glow: string;
    border: string;
    badge: string;
  };
  stages: RoadmapStage[];
}

export const COURSES_DATA: Course[] = [
  {
    id: 'dsa-mastery',
    title: 'Data Structures & Algorithms (Mastery Edition)',
    subtitle: 'From zero to LeetCode Hard & FAANG Top-Tier Online Assessment Mastery',
    category: 'Placement & DSA',
    level: 'Mastery',
    duration: '120 Hours',
    techStack: ['C++', 'Java', 'Python', 'LeetCode Patterns', 'Bit Manipulation'],
    placementTier: 'FAANG / Tier-1 Ready',
    ctcTarget: '₹25 - 55+ LPA',
    rating: 4.9,
    enrolledCount: 14200,
    description: 'A comprehensive, pattern-driven curriculum covering all essential patterns: Sliding Window, Two Pointers, Monotonic Stacks, Dynamic Programming, and Graph Traversals.',
    color: {
      primary: 'text-indigo-400',
      glow: 'from-indigo-600/20 to-indigo-900/10',
      border: 'border-indigo-500/30 hover:border-indigo-400/60',
      badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: Core Linear Structures & Asymptotic Analysis',
        duration: 'Weeks 1 - 2',
        description: 'Master time/space complexity analysis (Big-O) and fundamental linear structures with two-pointer techniques.',
        focusArea: 'Complexity, Arrays, Strings, HashMaps, Two-Pointers, Sliding Window',
        concepts: [
          { id: 'dsa-1-1', name: 'Time & Space Complexity Proofs (Master Theorem, Recurrences)', detail: 'Analyze amortized costs and space footprints.', estimatedMin: 45 },
          { id: 'dsa-1-2', name: 'Two-Pointer & Sliding Window Master Class', detail: 'Solve 3Sum, Container With Most Water, Minimum Window Substring.', estimatedMin: 60 },
          { id: 'dsa-1-3', name: 'Fast & Slow Pointers (Floyd’s Cycle Detection)', detail: 'Linked list cycle start, palindrome lists, happy number.', estimatedMin: 45 },
          { id: 'dsa-1-4', name: 'Prefix Sums, Kadane’s Algorithm & Difference Arrays', detail: 'Subarray sum equals K, Maximum Subarray, Range Update Operations.', estimatedMin: 50 },
          { id: 'dsa-1-5', name: 'Monotonic Stacks & Circular Queues', detail: 'Next Greater Element, Daily Temperatures, Largest Rectangle in Histogram.', estimatedMin: 60 }
        ],
        capstone: {
          name: 'High-Throughput In-Memory LRU & LFU Cache Engine',
          description: 'Design and build a thread-safe hybrid LRU/LFU cache using doubly linked lists and hash maps with O(1) eviction.',
          tech: ['C++20 / Java', 'Doubly Linked List', 'Hash Maps', 'Concurrency Locks'],
          deliverables: ['O(1) get/put benchmarks', 'Unit test suite with 99% branch coverage', 'Memory leak sanitization']
        },
        interviewDrills: ['Trapping Rain Water (Hard)', 'Sliding Window Maximum', 'LRU Cache Design'],
        syncTasks: [
          { title: 'Master Two-Pointer & Sliding Window: Solve 3 LeetCode Mediums', estimatedMinutes: 60, impact: 'High', why: 'Essential pattern for 70% of product company coding rounds.' },
          { title: 'Implement Monotonic Stack: Largest Rectangle in Histogram', estimatedMinutes: 45, impact: 'Critical', why: 'Directly tests stack intuition and boundary handling in OAs.' },
          { title: 'Build and benchmark In-Memory LRU Cache with O(1) operations', estimatedMinutes: 50, impact: 'High', why: 'Top requested live coding interview question across Google, Microsoft & Amazon.' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Trees, Graphs, Dynamic Programming & Backtracking',
        duration: 'Weeks 3 - 5',
        description: 'Deep dive into non-linear hierarchies, graph traversals (BFS/DFS, Dijkstra, Kahn’s Algorithm) and DP patterns.',
        focusArea: 'Binary Trees, BST, Graphs, Topological Sort, 1D & 2D Dynamic Programming',
        concepts: [
          { id: 'dsa-2-1', name: 'Binary Tree Traversal, LCA & Diameter Calculations', detail: 'Lowest Common Ancestor, Maximum Path Sum, Serialize & Deserialize Tree.', estimatedMin: 60 },
          { id: 'dsa-2-2', name: 'Graph BFS/DFS, Cycle Detection & Topological Sort', detail: 'Course Schedule I/II, Alien Dictionary, Number of Connected Components.', estimatedMin: 65 },
          { id: 'dsa-2-3', name: 'Shortest Path Algorithms: Dijkstra, Bellman-Ford & Floyd-Warshall', detail: 'Network Delay Time, Cheapest Flights within K Stops.', estimatedMin: 70 },
          { id: 'dsa-2-4', name: 'Dynamic Programming: 1D, 2D Grid & 0/1 Knapsack Patterns', detail: 'House Robber, Coin Change, Target Sum, Unique Paths.', estimatedMin: 75 },
          { id: 'dsa-2-5', name: 'Advanced DP: Longest Common Subsequence & Edit Distance', detail: 'String transformations, matrix DP, space optimization to O(N).', estimatedMin: 70 }
        ],
        capstone: {
          name: 'Algorithmic Route Navigation & Shortest Path Simulator',
          description: 'Construct a multi-node transportation graph with dynamic road congestion weights and real-time Dijkstra A* queries.',
          tech: ['Graphs', 'Priority Queues', 'Dijkstra', 'A* Search'],
          deliverables: ['Real-time graph visualization', 'Dynamic edge weight updates', 'Sub-millisecond route latency']
        },
        interviewDrills: ['Course Schedule II (Cycle + Topo)', 'Edit Distance (Hard DP)', 'Word Break II (Backtracking)'],
        syncTasks: [
          { title: 'Solve 3 Core Tree Problems (LCA, Maximum Path Sum, Diameter)', estimatedMinutes: 60, impact: 'High', why: 'Tree traversals form the basis of hierarchical interview rounds.' },
          { title: 'Implement Kahn Algorithm for Topological Sort & Cycle Detection', estimatedMinutes: 50, impact: 'Critical', why: 'Crucial for dependency resolution and build systems interview rounds.' },
          { title: 'Master 0/1 Knapsack & Unbounded Knapsack DP Patterns', estimatedMinutes: 70, impact: 'Critical', why: 'DP problems separate top 5% candidates in tier-1 placement screenings.' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: Advanced Data Structures & Algorithmic Capstone',
        duration: 'Weeks 6 - 7',
        description: 'Tries, Segment Trees, Fenwick Trees (Binary Indexed Tree), Union-Find with Path Compression.',
        focusArea: 'Tries, Segment Trees, Disjoint Set Union (DSU), Hard Interval Queries',
        concepts: [
          { id: 'dsa-3-1', name: 'Trie (Prefix Tree) & Auto-Complete Systems', detail: 'Implement Trie, Word Search II, Replace Words with prefix checks.', estimatedMin: 55 },
          { id: 'dsa-3-2', name: 'Disjoint Set Union (DSU) with Path Compression & Rank', detail: 'Redundant Connection, Number of Provinces, Kruskal MST.', estimatedMin: 50 },
          { id: 'dsa-3-3', name: 'Segment Trees & Fenwick Trees for Range Sum/Min Queries', detail: 'Range Sum Query Mutable, Count of Smaller Numbers After Self.', estimatedMin: 75 },
          { id: 'dsa-3-4', name: 'Interval Scheduling & Sweep-Line Algorithm', detail: 'Merge Intervals, Meeting Rooms II, Employee Free Time.', estimatedMin: 55 }
        ],
        capstone: {
          name: 'High-Frequency Financial Order Book with Red-Black Tree Indexing',
          description: 'Engineered high-concurrency order matching engine utilizing AVL/Red-Black balance properties for sub-microsecond price matching.',
          tech: ['Self-Balancing Trees', 'Order Matching', 'B-Tree Indexing'],
          deliverables: ['Order match latency < 5μs', 'Bid/Ask depth aggregation', 'Stress test suite']
        },
        interviewDrills: ['Word Search II (Hard Trie + DFS)', 'Count of Smaller Numbers (Segment Tree)', 'Meeting Rooms II'],
        syncTasks: [
          { title: 'Implement Prefix Tree (Trie) with Wildcard Search', estimatedMinutes: 45, impact: 'High', why: 'Directly applicable to search suggest engine questions.' },
          { title: 'Solve 2 DSU Problems: Redundant Connection & Kruskal MST', estimatedMinutes: 50, impact: 'High', why: 'Essential for dynamic connectivity and network clustering.' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: FAANG Interview OA Simulation & Timed Drills',
        duration: 'Week 8',
        description: 'Timed mock coding assessments simulating Google, Uber, Amazon, and Microsoft hiring OA formats.',
        focusArea: 'Timed Mock Contests, Edge Case Handling, Clean Code Standards, Space-Time Tradeoffs',
        concepts: [
          { id: 'dsa-4-1', name: 'Timed 90-Minute 3-Problem Hard Contest Simulation', detail: 'Real OA constraints under strict timer and memory constraints.', estimatedMin: 90 },
          { id: 'dsa-4-2', name: 'Live Coding Explanation & Whiteboarding Methodology', detail: 'Thinking aloud, test case verification, modular writing.', estimatedMin: 45 },
          { id: 'dsa-4-3', name: 'Edge Case Audit Checklist (Integer Overflow, Null Pointers, Off-by-one)', detail: 'Zero errors during production OA submissions.', estimatedMin: 40 }
        ],
        capstone: {
          name: 'Chrona Certified DSA Readiness Audit',
          description: 'Complete 25 verified company-tagged problems across Top 50 LeetCode list with optimal time/space complexity.',
          tech: ['LeetCode Top 50', 'OA Simulator', 'Complexity Analysis'],
          deliverables: ['100% verified solutions', 'Complexity documentation', 'Certified Badge']
        },
        interviewDrills: ['Median of Two Sorted Arrays', 'Regular Expression Matching', 'Alien Dictionary'],
        syncTasks: [
          { title: 'Take 90-Minute Timed Mock OA Assessment', estimatedMinutes: 90, impact: 'Critical', why: 'Builds stamina, fast edge-case detection and reduces interview anxiety.' },
          { title: 'Conduct Whiteboard Walkthrough of Complex DP Solution', estimatedMinutes: 40, impact: 'High', why: 'Verbal communication is 50% of the FAANG tech interview score.' }
        ]
      }
    ]
  },
  {
    id: 'genai-llm',
    title: 'Generative AI & LLM Systems Engineering',
    subtitle: 'Build production RAG pipelines, Autonomous Agent workflows, and fine-tune models with vLLM & LangChain',
    category: 'AI & Systems',
    level: 'Advanced',
    duration: '90 Hours',
    techStack: ['Python', 'PyTorch', 'LangChain', 'Llama 3', 'Pinecone', 'vLLM', 'FastAPI'],
    placementTier: 'AI Engineer Standard',
    ctcTarget: '₹30 - 65+ LPA',
    rating: 4.95,
    enrolledCount: 11800,
    description: 'Learn modern Generative AI engineering: from Transformer mechanics and vector embeddings to hybrid RAG, LangGraph multi-agent orchestration, and LoRA/QLoRA fine-tuning.',
    color: {
      primary: 'text-emerald-400',
      glow: 'from-emerald-600/20 to-emerald-900/10',
      border: 'border-emerald-500/30 hover:border-emerald-400/60',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: Transformer Foundations & Advanced Prompt Engineering',
        duration: 'Weeks 1 - 2',
        description: 'Understand Attention mechanisms, tokenization, temperature, top-p, structured JSON outputs, and Chain-of-Thought prompting.',
        focusArea: 'Self-Attention, KV Cache, Prompt Engineering, Structured LLM Outputs',
        concepts: [
          { id: 'genai-1-1', name: 'Transformer Architecture & Scaled Dot-Product Attention Internals', detail: 'Query, Key, Value matrices, multi-head attention math.', estimatedMin: 60 },
          { id: 'genai-1-2', name: 'Tokenization, BPE, and Context Window Mechanics', detail: 'Token limits, positional encodings (RoPE, ALiBi), KV-cache memory usage.', estimatedMin: 45 },
          { id: 'genai-1-3', name: 'Prompt Engineering: ReAct, Chain-of-Thought & Self-Consistency', detail: 'System prompting, few-shot conditioning, structured schema enforcement.', estimatedMin: 50 },
          { id: 'genai-1-4', name: 'Instructor & Pydantic Schema Validation for LLM APIs', detail: 'Guaranteed JSON parsing with type safety and automatic retries.', estimatedMin: 45 }
        ],
        capstone: {
          name: 'Structured Intelligence Extraction Microservice',
          description: 'Production FastAPI service that ingests messy PDF contracts and outputs verified Pydantic schemas with zero hallucination rate.',
          tech: ['FastAPI', 'Pydantic', 'Gemini / Claude API', 'Regex Sanitizer'],
          deliverables: ['100% structured JSON API', 'Automated retry parser', 'Interactive Swagger UI']
        },
        interviewDrills: ['Explain KV-Cache Memory Formula', 'Describe Self-Attention vs Cross-Attention', 'Designing ReAct Loop'],
        syncTasks: [
          { title: 'Implement Structured Output Extraction with Pydantic & LLM', estimatedMinutes: 45, impact: 'High', why: 'Essential skill for building reliable AI backend services.' },
          { title: 'Build a ReAct Prompting Pipeline for Automated Reasoning', estimatedMinutes: 50, impact: 'High', why: 'Forms the backbone of modern autonomous agents.' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Enterprise RAG, Vector Databases & Hybrid Search',
        duration: 'Weeks 3 - 5',
        description: 'Design production Retrieval-Augmented Generation with chunking strategies, vector embeddings, reciprocal rank fusion, and semantic re-ranking.',
        focusArea: 'Vector Embeddings, ChromaDB / Pinecone, Chunking, BM25 + Dense Search, Cohere Re-ranker',
        concepts: [
          { id: 'genai-2-1', name: 'Semantic Embeddings & Distance Metrics (Cosine, Dot Product, L2)', detail: 'BGE, OpenAI, and Nomic embedding models comparison.', estimatedMin: 50 },
          { id: 'genai-2-2', name: 'Hierarchical & Semantic Chunking Strategies', detail: 'Sentence window retrieval, parent document retriever, Markdown parsing.', estimatedMin: 60 },
          { id: 'genai-2-3', name: 'Hybrid Retrieval: BM25 Keyword + Dense Vector Search', detail: 'Reciprocal Rank Fusion (RRF) for optimal recall across edge queries.', estimatedMin: 65 },
          { id: 'genai-2-4', name: 'Cross-Encoder Re-ranking & Context Compression', detail: 'Filter irrelevant context and boost Precision@K using Cohere / BGE Re-rankers.', estimatedMin: 55 }
        ],
        capstone: {
          name: 'Enterprise Codebase & Technical Documentation RAG Search Engine',
          description: 'End-to-end multi-tenant RAG search platform with AST-aware code parsing, hybrid search, and citation grounding.',
          tech: ['ChromaDB', 'FastAPI', 'LangChain', 'Streamlit UI'],
          deliverables: ['AST-aware chunker', 'Hybrid search with RRF', 'Interactive source citation badges']
        },
        interviewDrills: ['How do you resolve lost-in-the-middle context problem?', 'BM25 vs Vector Search Tradeoffs', 'Evaluating RAG with RAGAS'],
        syncTasks: [
          { title: 'Set up Vector DB with ChromaDB and Hybrid BM25 Search', estimatedMinutes: 60, impact: 'Critical', why: 'Top requirement for GenAI engineers in product startups.' },
          { title: 'Implement Cross-Encoder Re-ranking on Document Retrieval', estimatedMinutes: 45, impact: 'High', why: 'Dramatically improves retrieval precision and eliminates hallucinations.' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: Multi-Agent Systems & Tool Calling with LangGraph',
        duration: 'Weeks 6 - 7',
        description: 'Orchestrate collaborative AI agents with memory, state graphs, external API tool calling, and human-in-the-loop validation.',
        focusArea: 'LangGraph, State Machine Agents, Tool Calling, Function Execution, Long-term Memory',
        concepts: [
          { id: 'genai-3-1', name: 'Agent State Graphs & Cyclic Execution in LangGraph', detail: 'State transitions, conditional edge routing, checkpointers.', estimatedMin: 65 },
          { id: 'genai-3-2', name: 'Function Calling & Secure Tool Sandbox Execution', detail: 'Exposing Python repl, search APIs, database query tools to agents.', estimatedMin: 60 },
          { id: 'genai-3-3', name: 'Multi-Agent Collaboration: Planner, Researcher & Critic Pattern', detail: 'Supervised multi-agent architecture for automated code generation and review.', estimatedMin: 70 }
        ],
        capstone: {
          name: 'Autonomous GitHub PR Code Reviewer & Security Auditing Agent',
          description: 'Multi-agent system that hooks into GitHub webhooks, analyzes diffs, verifies test runs, and posts inline security suggestions.',
          tech: ['LangGraph', 'GitHub REST API', 'Docker Sandbox', 'FastAPI'],
          deliverables: ['Multi-agent workflow graph', 'Automated security linting', 'GitHub Webhook integration']
        },
        interviewDrills: ['Designing resilient agent fallback mechanisms', 'Preventing infinite loops in agent execution graphs'],
        syncTasks: [
          { title: 'Build a 3-Node Multi-Agent Workflow using LangGraph', estimatedMinutes: 60, impact: 'Critical', why: 'Agentic workflows are the highest-paying skill in modern AI engineering.' },
          { title: 'Integrate Dynamic Function Calling with Schema Validation', estimatedMinutes: 45, impact: 'High', why: 'Essential for connecting LLMs to internal enterprise APIs.' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: Model Fine-Tuning (LoRA/QLoRA) & High-Throughput vLLM Serving',
        duration: 'Week 8',
        description: 'Parameter-efficient fine-tuning (PEFT), dataset synthesis, quantization (AWQ/GGUF), and sub-10ms vLLM engine deployment.',
        focusArea: 'LoRA, QLoRA, Axolotl / Unsloth, Quantization, vLLM, PagedAttention',
        concepts: [
          { id: 'genai-4-1', name: 'Parameter-Efficient Fine-Tuning (LoRA & QLoRA) Mechanics', detail: 'Low-rank adapter matrices, 4-bit NormalFloat (NF4), memory scaling.', estimatedMin: 70 },
          { id: 'genai-4-2', name: 'High-Throughput LLM Serving with vLLM & PagedAttention', detail: 'Continuous batching, PagedAttention memory management, TTFT optimization.', estimatedMin: 60 },
          { id: 'genai-4-3', name: 'Model Evaluation, Benchmarking & Safety Guardrails (Llama-Guard)', detail: 'Evaluate domain accuracy, latency vs batch size, jailbreak protection.', estimatedMin: 55 }
        ],
        capstone: {
          name: 'Domain-Specialized Code Assistant Fine-Tuned on Llama 3',
          description: 'Fine-tune open-weights Llama 3 8B on custom API specs and serve using vLLM in Docker container with continuous batching.',
          tech: ['Unsloth / PyTorch', 'LoRA', 'vLLM', 'Docker GPU'],
          deliverables: ['LoRA adapter weights', 'vLLM continuous batching deployment', 'Latency benchmark report']
        },
        interviewDrills: ['How PagedAttention solves KV-Cache fragmentation', 'LoRA rank selection trade-offs'],
        syncTasks: [
          { title: 'Fine-tune a Llama 3 Model on Synthetic Dataset using Unsloth', estimatedMinutes: 75, impact: 'Critical', why: 'Demonstrates deep hands-on ML systems expertise.' },
          { title: 'Deploy a high-throughput vLLM server with continuous batching', estimatedMinutes: 60, impact: 'High', why: 'Slashes API hosting costs by 70% in real production systems.' }
        ]
      }
    ]
  },
  {
    id: 'core-python',
    title: 'Core Python for High-Performance Backend & Data',
    subtitle: 'Master Python 3.12 internals, AsyncIO concurrency, FastAPI architectures, and low-latency data pipelines',
    category: 'Core Programming',
    level: 'Intermediate',
    duration: '65 Hours',
    techStack: ['Python 3.12', 'AsyncIO', 'FastAPI', 'Pydantic v2', 'Polars', 'Pytest', 'Redis'],
    placementTier: 'High CTC Backend & Data SDE',
    ctcTarget: '₹18 - 38 LPA',
    rating: 4.85,
    enrolledCount: 9800,
    description: 'Go beyond syntax: understand the CPython GIL, bytecode execution, metaclasses, AsyncIO event loops, memory management, and build blazingly fast backend systems.',
    color: {
      primary: 'text-amber-400',
      glow: 'from-amber-600/20 to-amber-900/10',
      border: 'border-amber-500/30 hover:border-amber-400/60',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: Python Internals, Metaprogramming & Memory Model',
        duration: 'Weeks 1 - 2',
        description: 'Explore CPython internals, Garbage Collection (Reference Counting + Cyclic GC), Decorators, Descriptors, and Dunder methods.',
        focusArea: 'CPython Internals, Memory Management, Custom Decorators, Metaclasses',
        concepts: [
          { id: 'py-1-1', name: 'CPython Memory Architecture & Garbage Collection Internals', detail: 'Reference counting, generational cyclic GC, slots optimization.', estimatedMin: 55 },
          { id: 'py-1-2', name: 'Advanced Decorators, Parametric Wrappers & functools', detail: 'Preserving metadata, caching decorators, retry wrappers with exponential backoff.', estimatedMin: 50 },
          { id: 'py-1-3', name: 'Descriptors, Metaclasses & Dynamic Class Creation', detail: 'Implement custom ORM fields, validation descriptors, type enforcement.', estimatedMin: 60 }
        ],
        capstone: {
          name: 'Lightweight Mini-ORM with Custom Descriptors & Validation',
          description: 'Build a zero-dependency mini ORM that enforces type validations, primary key constraints, and SQL generation via metaclasses.',
          tech: ['Python 3.12', 'Descriptors', 'Metaclasses', 'SQLite'],
          deliverables: ['Custom field descriptors', 'Query builder syntax', 'Comprehensive test suite']
        },
        interviewDrills: ['Explain Python GIL & how it affects I/O vs CPU bound tasks', '__new__ vs __init__ difference'],
        syncTasks: [
          { title: 'Write an Exponential Backoff Retry Decorator from Scratch', estimatedMinutes: 45, impact: 'High', why: 'Essential resilience pattern for backend services.' },
          { title: 'Optimize Python memory usage by 40% using slots', estimatedMinutes: 40, impact: 'Medium', why: 'Common high-scale interview question.' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Asynchronous Concurrency with AsyncIO & Multiprocessing',
        duration: 'Weeks 3 - 4',
        description: 'Master async/await, event loops, tasks, semaphores, ProcessPoolExecutor, and handling non-blocking network I/O.',
        focusArea: 'AsyncIO, Event Loop, asyncio.gather, Semaphores, Multiprocessing vs Threading',
        concepts: [
          { id: 'py-2-1', name: 'AsyncIO Event Loop Architecture & Coroutine Execution', detail: 'How coroutines yield control, tasks vs futures, event loop scheduling.', estimatedMin: 60 },
          { id: 'py-2-2', name: 'Concurrency Primitives: Semaphores, Locks & Queues', detail: 'Rate limiting outgoing requests, producer-consumer queues.', estimatedMin: 50 },
          { id: 'py-2-3', name: 'Mixing CPU-Bound and I/O-Bound with ProcessPoolExecutor', detail: 'Bypassing the GIL for heavy data transformations in async services.', estimatedMin: 55 }
        ],
        capstone: {
          name: 'Distributed High-Throughput Web Crawler & Event Streamer',
          description: 'Asynchronous crawler scraping 1,000+ pages/sec with dynamic rate limiting, Redis deduplication, and asyncio worker pools.',
          tech: ['AsyncIO', 'aiohttp', 'Redis', 'Polars'],
          deliverables: ['Rate-limited crawler pool', 'Redis bloom filter for deduplication', 'Streaming metrics']
        },
        interviewDrills: ['AsyncIO vs Multi-threading vs Multiprocessing', 'Handling unhandled exceptions in asyncio.gather'],
        syncTasks: [
          { title: 'Build an AsyncIO Rate-Limited Worker Pool with Semaphores', estimatedMinutes: 50, impact: 'Critical', why: 'Critical for high-volume API integrations.' },
          { title: 'Implement Producer-Consumer Queue with asyncio.Queue', estimatedMinutes: 45, impact: 'High', why: 'Standard design pattern in asynchronous distributed systems.' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: Production FastAPI Microservice Architecture',
        duration: 'Weeks 5 - 6',
        description: 'Build enterprise-grade REST and WebSocket APIs with dependency injection, Pydantic v2, middleware, and Redis caching.',
        focusArea: 'FastAPI, Pydantic v2, Dependency Injection, Middleware, JWT Auth, Redis',
        concepts: [
          { id: 'py-3-1', name: 'FastAPI Dependency Injection System & Lifecycle Management', detail: 'Database session management, custom auth dependencies, context managers.', estimatedMin: 55 },
          { id: 'py-3-2', name: 'Pydantic v2 Custom Validators & Serialization Speedups', detail: 'Leveraging Rust-powered Pydantic core for high-throughput serialization.', estimatedMin: 45 },
          { id: 'py-3-3', name: 'Real-Time WebSockets & Background Task Workers with Celery/Redis', detail: 'Live bi-directional communication and asynchronous task delegation.', estimatedMin: 65 }
        ],
        capstone: {
          name: 'Scalable Fintech Transaction & Wallet API Service',
          description: 'Production FastAPI service with idempotent transaction processing, JWT authentication, and distributed Redis locking.',
          tech: ['FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
          deliverables: ['Idempotency-key middleware', 'Database migrations with Alembic', 'Complete OpenAPI docs']
        },
        interviewDrills: ['Explain FastAPI Dependency Injection Under the Hood', 'Database Connection Pooling Best Practices'],
        syncTasks: [
          { title: 'Build an Idempotent API Route with Redis Distributed Lock', estimatedMinutes: 55, impact: 'Critical', why: 'Mandatory standard for all financial transaction APIs.' },
          { title: 'Create Custom FastAPI Middleware for Request ID & Latency Logging', estimatedMinutes: 40, impact: 'High', why: 'Standard enterprise observability requirement.' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: High-Performance Profiling, Testing & Packaging',
        duration: 'Week 7',
        description: 'Optimize bottlenecks using cProfile, line_profiler, Py-Spy, write robust Pytest suites with mocks, and package for PyPI.',
        focusArea: 'cProfile, Py-Spy, Memory Profiling, Pytest, Mocking, Docker Containers',
        concepts: [
          { id: 'py-4-1', name: 'CPU & Memory Profiling (cProfile, memory_profiler, Py-Spy)', detail: 'Flamegraphs, finding memory leaks, eliminating hot-loop overhead.', estimatedMin: 55 },
          { id: 'py-4-2', name: 'Enterprise Pytest Suite with Fixtures, Parametrize & Mocks', detail: 'Mocking async dependencies, test coverage reports, property-based testing.', estimatedMin: 50 },
          { id: 'py-4-3', name: 'Dockerizing & Multi-Stage Production Container Builds', detail: 'Minimizing image size, non-root user security, gunicorn/uvicorn workers.', estimatedMin: 45 }
        ],
        capstone: {
          name: 'Chrona Certified Python Engineering Benchmark',
          description: 'Achieve 10,000 req/sec benchmark on a profiled FastAPI service with 95%+ Pytest code coverage.',
          tech: ['Pytest', 'Locust', 'Py-Spy', 'Docker'],
          deliverables: ['Flamegraph analysis report', '95%+ unit test coverage', 'Docker production image']
        },
        interviewDrills: ['How do you debug a memory leak in a running Python service?', 'Pytest fixture scopes and teardown'],
        syncTasks: [
          { title: 'Profile an Async Service using Py-Spy and Generate a Flamegraph', estimatedMinutes: 45, impact: 'High', why: 'Shows senior-level debugging and performance optimization skills.' },
          { title: 'Write a Parametrized Pytest Suite with Async Mock Fixtures', estimatedMinutes: 50, impact: 'High', why: 'Ensures zero regressions in enterprise codebases.' }
        ]
      }
    ]
  },
  {
    id: 'cpp-systems',
    title: 'Systems Programming with Modern C & C++ (C++20)',
    subtitle: 'Master low-level memory, RAII, move semantics, template metaprogramming, and lock-free concurrency',
    category: 'Core Programming',
    level: 'Mastery',
    duration: '110 Hours',
    techStack: ['C++20', 'Pointers', 'RAII', 'Templates', 'POSIX', 'CMake', 'Valgrind', 'GDB'],
    placementTier: 'Systems, HFT & Engine Developer',
    ctcTarget: '₹35 - 75+ LPA',
    rating: 4.92,
    enrolledCount: 7600,
    description: 'Designed for High-Frequency Trading (HFT), game engine, and operating system careers. Master RAII, modern smart pointers, templates, atomic memory ordering, and low-latency cache locality.',
    color: {
      primary: 'text-rose-400',
      glow: 'from-rose-600/20 to-rose-900/10',
      border: 'border-rose-500/30 hover:border-rose-400/60',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: Low-Level Memory, Pointers & Modern RAII Semantics',
        duration: 'Weeks 1 - 2',
        description: 'Understand the heap vs stack memory layout, raw pointers, custom allocators, unique/shared pointers, and the Rule of 5.',
        focusArea: 'Memory Layout, Pointers, Custom Smart Pointers, Move Semantics, Rule of 5',
        concepts: [
          { id: 'cpp-1-1', name: 'Stack vs Heap Memory Layout & Pointer Arithmetic', detail: 'Memory alignment, padding, structure packing, pointer casting.', estimatedMin: 60 },
          { id: 'cpp-1-2', name: 'Lvalues, Rvalues & Move Semantics (std::move, std::forward)', detail: 'Universal references, perfect forwarding, eliminating unnecessary copies.', estimatedMin: 65 },
          { id: 'cpp-1-3', name: 'Rule of Three, Five and Zero in Modern C++', detail: 'Copy constructors, move assignments, destructors, resource safety.', estimatedMin: 55 },
          { id: 'cpp-1-4', name: 'Custom Implementation of std::unique_ptr & std::shared_ptr', detail: 'Reference counting, control blocks, atomic incrementing.', estimatedMin: 60 }
        ],
        capstone: {
          name: 'Custom Fixed-Size Arena Memory Allocator',
          description: 'Build a high-speed pool/arena allocator that replaces malloc for 10x faster memory allocations with zero fragmentation.',
          tech: ['C++20', 'Memory Alignment', 'Pointer Math', 'Benchmark Suite'],
          deliverables: ['O(1) allocation/deallocation', 'Cache-friendly linear buffer', 'Valgrind clean audit']
        },
        interviewDrills: ['Explain Virtual Table (vtable) and Virtual Pointer (vptr) internals', 'Deep vs Shallow Copy and Move Semantics'],
        syncTasks: [
          { title: 'Implement custom unique_ptr and shared_ptr with reference counting', estimatedMinutes: 60, impact: 'Critical', why: 'Top HFT and systems engineering interview problem.' },
          { title: 'Write a Rule-of-Five Dynamic Vector Class from Scratch', estimatedMinutes: 50, impact: 'High', why: 'Validates strict mastery over manual memory management.' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Templates, Concepts & Modern C++20 Features',
        duration: 'Weeks 3 - 5',
        description: 'Master template metaprogramming, C++20 Concepts, SFINAE, constexpr computation, and std::ranges.',
        focusArea: 'Template Metaprogramming, C++20 Concepts, Constexpr, Ranges, Type Traits',
        concepts: [
          { id: 'cpp-2-1', name: 'Template Specialization & SFINAE (Substitution Failure Is Not An Error)', detail: 'std::enable_if, type traits, compile-time type deduction.', estimatedMin: 65 },
          { id: 'cpp-2-2', name: 'C++20 Concepts & Constraints Architecture', detail: 'Declaring custom concepts, simplifying compile-time constraints.', estimatedMin: 55 },
          { id: 'cpp-2-3', name: 'Compile-Time Computation with constexpr and consteval', detail: 'Precomputing lookup tables at compile time for zero runtime overhead.', estimatedMin: 60 }
        ],
        capstone: {
          name: 'Zero-Overhead Compile-Time Math & Linear Algebra Matrix Library',
          description: 'Header-only matrix library leveraging C++20 concepts and SIMD operations for sub-nanosecond matrix multiplication.',
          tech: ['C++20 Concepts', 'Templates', 'SIMD Intrinsics'],
          deliverables: ['Compile-time matrix dimension verification', 'SIMD AVX-256 vectorization', 'Benchmark graphs']
        },
        interviewDrills: ['What is the difference between concepts and SFINAE?', 'How does constexpr improve performance?'],
        syncTasks: [
          { title: 'Create a Type-Safe C++20 Concept for Numeric Containers', estimatedMinutes: 45, impact: 'High', why: 'Modern C++ industry standard for clean generic libraries.' },
          { title: 'Implement compile-time CRC32 / Hash generator using constexpr', estimatedMinutes: 50, impact: 'High', why: 'Crucial for low-latency network packet processing.' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: Multithreading, Atomics & Lock-Free Concurrency',
        duration: 'Weeks 6 - 7',
        description: 'Explore std::jthread, std::atomic, memory orderings (relaxed, acquire-release, sequential consistency), and lock-free ring buffers.',
        focusArea: 'std::atomic, Memory Fences, Lock-Free Queues, False Sharing, Cache Line Alignment',
        concepts: [
          { id: 'cpp-3-1', name: 'Atomic Operations & C++ Memory Ordering Models', detail: 'std::memory_order_relaxed vs acquire-release, preventing reordering.', estimatedMin: 70 },
          { id: 'cpp-3-2', name: 'Eliminating False Sharing with alignas(64) Cache Line Padding', detail: 'Optimizing multi-core throughput by preventing cache line thrashing.', estimatedMin: 55 },
          { id: 'cpp-3-3', name: 'Lock-Free Single-Producer Single-Consumer (SPSC) Ring Buffer', detail: 'Atomic head and tail indices, zero mutex overhead.', estimatedMin: 75 }
        ],
        capstone: {
          name: 'Ultra-Low Latency Lock-Free SPSC Order Queue',
          description: 'Construct a lock-free ring buffer achieving over 50 Million messages per second with sub-20ns latency.',
          tech: ['C++20', 'std::atomic', 'Lock-free Algorithms', 'Cache Optimization'],
          deliverables: ['Sub-20ns message latency', 'ThreadSanitizer clean audit', 'Benchmark charts']
        },
        interviewDrills: ['Explain Acquire-Release Memory Ordering with Example', 'What causes False Sharing in multi-threaded programs?'],
        syncTasks: [
          { title: 'Build a Lock-Free SPSC Queue using std::atomic indices', estimatedMinutes: 70, impact: 'Critical', why: 'Top interview question for High Frequency Trading & game engines.' },
          { title: 'Benchmark Cache Line Contention with and without alignas(64)', estimatedMinutes: 45, impact: 'High', why: 'Demonstrates deep hardware-level software engineering.' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: HFT Matching Engine Capstone & Low-Latency Profiling',
        duration: 'Week 8',
        description: 'Build a full limit order book matching engine and debug with GDB, Valgrind, and Linux Perf.',
        focusArea: 'Order Book, Linux Perf, Flamegraphs, AddressSanitizer, Low-Latency SDE',
        concepts: [
          { id: 'cpp-4-1', name: 'Limit Order Book (LOB) Architecture: Price Levels & Doubly Linked Orders', detail: 'O(1) insert, cancel, and execute operations on price levels.', estimatedMin: 75 },
          { id: 'cpp-4-2', name: 'Linux Perf, Valgrind, Cachegrind & Branch Prediction Tuning', detail: 'Reducing branch mispredictions and L1/L2 cache misses.', estimatedMin: 60 },
          { id: 'cpp-4-3', name: 'GDB Advanced Debugging (Core Dumps, Watchpoints, Multi-thread Tracking)', detail: 'Locating segmentation faults and deadlocks in production core dumps.', estimatedMin: 50 }
        ],
        capstone: {
          name: 'Sub-Microsecond Limit Order Book (LOB) Matching Engine',
          description: 'Production-ready financial exchange matching engine processing limit and market orders with sub-microsecond latency.',
          tech: ['C++20', 'Linux Perf', 'Valgrind', 'CMake'],
          deliverables: ['Complete matching engine repository', 'Deterministic latency report (<1μs)', 'Zero memory leaks audit']
        },
        interviewDrills: ['Design an Order Matching Engine from Scratch', 'How to optimize for CPU branch prediction?'],
        syncTasks: [
          { title: 'Construct Price-Level Doubly Linked List for Limit Order Book', estimatedMinutes: 60, impact: 'Critical', why: 'Core technical exercise for Tier-1 Quant and Fintech firms.' },
          { title: 'Profile C++ binary using Linux Perf to eliminate L1 cache misses', estimatedMinutes: 50, impact: 'High', why: 'Proves practical low-latency optimization capabilities.' }
        ]
      }
    ]
  },
  {
    id: 'enterprise-java',
    title: 'Enterprise Java & Spring Boot Microservices',
    subtitle: 'Master Java 21, Spring Boot 3, Apache Kafka event streams, Docker, and distributed microservices',
    category: 'Core Programming',
    level: 'Intermediate',
    duration: '95 Hours',
    techStack: ['Java 21', 'Spring Boot 3', 'Spring Cloud', 'Kafka', 'PostgreSQL', 'Docker', 'JUnit 5'],
    placementTier: 'Tier-1 MNC & Fintech Favorite',
    ctcTarget: '₹18 - 35 LPA',
    rating: 4.88,
    enrolledCount: 12400,
    description: 'The preferred stack for banking, fintech, and enterprise IT. Learn Java 21 Virtual Threads, Spring Boot 3, Spring Data JPA, Spring Security OAuth2, and Kafka event-driven architectures.',
    color: {
      primary: 'text-orange-400',
      glow: 'from-orange-600/20 to-orange-900/10',
      border: 'border-orange-500/30 hover:border-orange-400/60',
      badge: 'bg-orange-500/10 text-orange-300 border-orange-500/30'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: Java 21 Modern Syntax & JVM Concurrency',
        duration: 'Weeks 1 - 2',
        description: 'Explore Virtual Threads (Project Loom), Records, Pattern Matching, Sealed Classes, and JVM garbage collection internals.',
        focusArea: 'Java 21, Virtual Threads, Records, Sealed Classes, JVM GC Tuning',
        concepts: [
          { id: 'java-1-1', name: 'Virtual Threads (Project Loom) vs Platform Threads', detail: 'High-throughput I/O concurrency without reactive complexity.', estimatedMin: 55 },
          { id: 'java-1-2', name: 'Java Records, Sealed Classes & Pattern Matching for Switch', detail: 'Immutable domain models and exhaustive pattern matching.', estimatedMin: 45 },
          { id: 'java-1-3', name: 'JVM Memory Model, Garbage Collectors (G1, ZGC) & Tuning', detail: 'Heap sizing, generational GC phases, analyzing GC logs.', estimatedMin: 60 }
        ],
        capstone: {
          name: 'High-Throughput Virtual-Threaded Network Proxy',
          description: 'Build a non-blocking TCP/HTTP reverse proxy supporting 50,000 concurrent Virtual Threads on Java 21.',
          tech: ['Java 21', 'Virtual Threads', 'Sockets', 'JMH Benchmarks'],
          deliverables: ['50k concurrent connection benchmark', 'Memory footprint analysis', 'Zero thread exhaustion']
        },
        interviewDrills: ['How do Virtual Threads work under the hood with Carrier Threads?', 'G1GC vs ZGC tradeoffs'],
        syncTasks: [
          { title: 'Benchmark Java 21 Virtual Threads vs Platform Thread Pool', estimatedMinutes: 45, impact: 'High', why: 'Essential modern Java knowledge for senior technical interviews.' },
          { title: 'Refactor DTOs using Java Records and Sealed Interfaces', estimatedMinutes: 40, impact: 'Medium', why: 'Modern Java best practice for clean immutable code.' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Spring Boot 3 REST APIs, Spring Data JPA & Security',
        duration: 'Weeks 3 - 4',
        description: 'Build robust REST APIs, manage database transactions with Hibernate/JPA, and secure with JWT and Spring Security.',
        focusArea: 'Spring Boot 3, Spring Data JPA, Hibernate N+1 Problem, Spring Security, JWT',
        concepts: [
          { id: 'java-2-1', name: 'Spring Boot 3 Auto-Configuration & IoC Container Internals', detail: 'Bean life cycle, conditional beans, custom starter configuration.', estimatedMin: 55 },
          { id: 'java-2-2', name: 'Spring Data JPA: Solving Hibernate N+1 Query Problems', detail: 'Entity graphs, fetch joins, pagination, transaction isolation.', estimatedMin: 65 },
          { id: 'java-2-3', name: 'Spring Security 6 with Stateless JWT Authentication & RBAC', detail: 'Security filter chain, method-level security (@PreAuthorize).', estimatedMin: 60 }
        ],
        capstone: {
          name: 'Production E-Commerce REST API & Auth Service',
          description: 'Full-featured RESTful commerce backend with JWT auth, role-based permissions, and optimized JPA queries.',
          tech: ['Spring Boot 3', 'PostgreSQL', 'Spring Security', 'Flyway'],
          deliverables: ['Zero N+1 queries audit', 'Stateless JWT auth', 'Flyway database migrations']
        },
        interviewDrills: ['How to detect and fix Hibernate N+1 query issue?', 'Spring Bean lifecycle stages'],
        syncTasks: [
          { title: 'Implement Stateless JWT Auth Filter in Spring Security 6', estimatedMinutes: 55, impact: 'Critical', why: 'Standard requirement across all enterprise backend roles.' },
          { title: 'Optimize Spring Data JPA queries using Fetch Joins & EntityGraphs', estimatedMinutes: 50, impact: 'High', why: 'Prevents catastrophic database slowdowns in production.' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: Event-Driven Microservices with Apache Kafka',
        duration: 'Weeks 5 - 6',
        description: 'Design distributed microservices, message brokering with Apache Kafka, idempotent consumers, and the Saga pattern.',
        focusArea: 'Apache Kafka, Event-Driven Architecture, Saga Pattern, Distributed Transactions',
        concepts: [
          { id: 'java-3-1', name: 'Apache Kafka Architecture: Topics, Partitions & Consumer Groups', detail: 'Offset management, partition rebalancing, consumer lag monitoring.', estimatedMin: 65 },
          { id: 'java-3-2', name: 'Idempotent Producers & Exactly-Once Semantics (EOS)', detail: 'Transactional producers, deduplication strategies in consumer services.', estimatedMin: 60 },
          { id: 'java-3-3', name: 'Distributed Transactions with Choreography Saga Pattern', detail: 'Managing distributed rollbacks and compensating events across services.', estimatedMin: 70 }
        ],
        capstone: {
          name: 'Distributed Banking & Payment Processing Microservice',
          description: 'Multi-service event-driven banking engine with order, payment, and inventory services coordinating via Kafka Saga transactions.',
          tech: ['Spring Boot', 'Apache Kafka', 'PostgreSQL', 'Docker Compose'],
          deliverables: ['Saga orchestration graph', 'Compensating transaction tests', 'Dockerized multi-service env']
        },
        interviewDrills: ['How does Kafka achieve high write throughput?', 'Explain Saga pattern vs 2PC (Two-Phase Commit)'],
        syncTasks: [
          { title: 'Implement an Idempotent Kafka Consumer with Dead-Letter Topic', estimatedMinutes: 60, impact: 'Critical', why: 'Mandatory standard for resilient event processing.' },
          { title: 'Set up Multi-Service Docker Compose with Kafka and Zookeeper', estimatedMinutes: 45, impact: 'High', why: 'Shows full-lifecycle developer environment skills.' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: Resiliency, Distributed Tracing & Testing with Testcontainers',
        duration: 'Week 7 - 8',
        description: 'Implement Circuit Breakers (Resilience4j), distributed tracing with Zipkin/OpenTelemetry, and integration testing with Testcontainers.',
        focusArea: 'Resilience4j, Testcontainers, OpenTelemetry, Micrometer, Actuator',
        concepts: [
          { id: 'java-4-1', name: 'Resilience4j: Circuit Breakers, Rate Limiters & Retries', detail: 'Preventing cascading failures in distributed service meshes.', estimatedMin: 55 },
          { id: 'java-4-2', name: 'Integration Testing with Testcontainers and JUnit 5', detail: 'Spinning up real PostgreSQL and Kafka containers during unit tests.', estimatedMin: 50 },
          { id: 'java-4-3', name: 'Observability with Spring Boot Actuator, Prometheus & Grafana', detail: 'Custom business metrics, health endpoints, distributed trace correlation.', estimatedMin: 50 }
        ],
        capstone: {
          name: 'Production-Grade Cloud Microservice Deployment',
          description: 'Deploy fully instrumented microservice with circuit breaker fallbacks, Prometheus metrics, and automated Testcontainers integration test suite.',
          tech: ['Testcontainers', 'Resilience4j', 'Prometheus', 'Kubernetes'],
          deliverables: ['100% automated Testcontainers suite', 'Prometheus dashboard export', 'Circuit breaker resilience demo']
        },
        interviewDrills: ['How does a Circuit Breaker transition states?', 'Why Testcontainers are superior to H2 in-memory databases'],
        syncTasks: [
          { title: 'Write an Integration Test using Testcontainers for PostgreSQL & Kafka', estimatedMinutes: 50, impact: 'High', why: 'Eliminates environment disparity bugs before production.' },
          { title: 'Configure Resilience4j Circuit Breaker with Fallback Handler', estimatedMinutes: 45, impact: 'High', why: 'Essential for passing architecture & resilience rounds.' }
        ]
      }
    ]
  },
  {
    id: 'nextjs-fullstack',
    title: 'Full-Stack Next.js 15 & Distributed Web Architecture',
    subtitle: 'Master React 19 Server Components, Edge Routing, Tailwind CSS, Supabase, and distributed web applications',
    category: 'Web & Cloud',
    level: 'Intermediate',
    duration: '80 Hours',
    techStack: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Prisma', 'Redis'],
    placementTier: 'Modern Unicorn & Product Startup SDE',
    ctcTarget: '₹20 - 42 LPA',
    rating: 4.9,
    enrolledCount: 15600,
    description: 'Build hyper-fast modern web applications. Master React Server Components (RSC), Next.js 15 App Router, Server Actions, Edge Middleware, Real-time WebSockets, and Core Web Vitals optimization.',
    color: {
      primary: 'text-cyan-400',
      glow: 'from-cyan-600/20 to-cyan-900/10',
      border: 'border-cyan-500/30 hover:border-cyan-400/60',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: React 19 Architecture & Next.js 15 App Router',
        duration: 'Weeks 1 - 2',
        description: 'Understand React Server Components (RSC), Suspense streaming, Server Actions, and Next.js 15 caching paradigms.',
        focusArea: 'React Server Components, Next.js 15 App Router, Suspense Streaming, Server Actions',
        concepts: [
          { id: 'next-1-1', name: 'React Server Components (RSC) vs Client Components', detail: 'Zero bundle size benefits, data fetching directly on server.', estimatedMin: 55 },
          { id: 'next-1-2', name: 'Next.js 15 App Router & Granular Suspense Streaming', detail: 'loading.tsx, error.tsx, layout nesting, parallel routes.', estimatedMin: 50 },
          { id: 'next-1-3', name: 'Server Actions with Optimistic UI Updates (useOptimistic)', detail: 'Mutating data securely without client API boilerplate.', estimatedMin: 50 }
        ],
        capstone: {
          name: 'High-Performance SaaS Dashboard with Streaming RSC',
          description: 'Build an ultra-responsive analytics dashboard using React Server Components, Suspense skeletons, and optimistic actions.',
          tech: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Lucide'],
          deliverables: ['Zero client-bundle data fetchers', 'Sub-second initial paint', 'Optimistic UI feedback']
        },
        interviewDrills: ['When should you use Server Components vs Client Components?', 'How does Suspense streaming reduce TTFB?'],
        syncTasks: [
          { title: 'Build a Server Action with useOptimistic UI Mutation', estimatedMinutes: 45, impact: 'High', why: 'Key modern React 19 pattern for instantaneous user experience.' },
          { title: 'Implement Granular Suspense Data Streaming with Skeleton Loaders', estimatedMinutes: 40, impact: 'Medium', why: 'Drastically improves perceived load speed and Core Web Vitals.' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Edge Middleware, Authentication & Database Layer',
        duration: 'Weeks 3 - 4',
        description: 'Build secure authentication using NextAuth.js / Supabase, configure Edge Middleware, and optimize Prisma queries.',
        focusArea: 'Edge Middleware, Supabase Auth, Row-Level Security (RLS), Prisma ORM',
        concepts: [
          { id: 'next-2-1', name: 'Edge Middleware for Dynamic Routing & Geolocation', detail: 'Sub-millisecond route guarding, A/B testing at the Edge.', estimatedMin: 50 },
          { id: 'next-2-2', name: 'PostgreSQL with Supabase & Row-Level Security (RLS)', detail: 'Enforcing bulletproof security policies directly in the database layer.', estimatedMin: 60 },
          { id: 'next-2-3', name: 'Prisma ORM & Connection Pooling on Serverless Platforms', detail: 'Accelerate connection pools, preventing serverless database exhaustion.', estimatedMin: 55 }
        ],
        capstone: {
          name: 'Multi-Tenant Collaborative Workspace Platform',
          description: 'Full-stack workspace app with role-based team management, Row-Level Security (RLS), and Edge authentication.',
          tech: ['Next.js 15', 'Supabase', 'PostgreSQL', 'Prisma'],
          deliverables: ['RLS security audit verified', 'Edge middleware session guard', 'Multi-tenant organization switcher']
        },
        interviewDrills: ['How does Edge Middleware differ from standard Node.js Express middleware?', 'Why is database connection pooling critical in serverless Next.js?'],
        syncTasks: [
          { title: 'Configure Supabase Row-Level Security (RLS) Policies for Multi-Tenancy', estimatedMinutes: 50, impact: 'Critical', why: 'Essential security barrier against data leakage.' },
          { title: 'Write an Edge Middleware Route Guard with JWT Verification', estimatedMinutes: 45, impact: 'High', why: 'Protects private routes at the global edge network.' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: Real-Time WebSockets & Collaborative Document Sync',
        duration: 'Weeks 5 - 6',
        description: 'Implement real-time collaboration with WebSockets, CRDTs (Conflict-free Replicated Data Types), and live cursor presence.',
        focusArea: 'WebSockets, Live Presence, CRDTs, Redis Pub/Sub, Real-Time Sync',
        concepts: [
          { id: 'next-3-1', name: 'Real-Time Sync with WebSockets & Redis Pub/Sub', detail: 'Scaling real-time socket connections across multi-instance clusters.', estimatedMin: 60 },
          { id: 'next-3-2', name: 'Collaborative Conflict Resolution with CRDTs (Yjs)', detail: 'Multi-user concurrent text editing without data collision.', estimatedMin: 65 },
          { id: 'next-3-3', name: 'State Management with TanStack Query & Zustand', detail: 'Cache invalidation, background synchronization, persistent state.', estimatedMin: 50 }
        ],
        capstone: {
          name: 'Real-Time Collaborative Notion-Style Canvas Platform',
          description: 'Live interactive whiteboard/document canvas featuring multi-user live cursors, markdown blocks, and CRDT synchronization.',
          tech: ['Next.js 15', 'Yjs / WebSockets', 'Redis', 'Zustand'],
          deliverables: ['Multiplayer live cursors', 'Conflict-free offline sync', 'Sub-50ms WebSocket latency']
        },
        interviewDrills: ['How do CRDTs differ from Operational Transformation (OT)?', 'Scaling WebSockets with Redis Pub/Sub'],
        syncTasks: [
          { title: 'Implement Live Cursor Tracking with WebSockets & Redis', estimatedMinutes: 55, impact: 'High', why: 'Impressive interactive showcase feature for portfolio applications.' },
          { title: 'Set up TanStack Query with Optimistic Mutation & Cache Invalidation', estimatedMinutes: 45, impact: 'High', why: 'Standard state architecture across modern frontend engineering.' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: Core Web Vitals Optimization & Production Deployment',
        duration: 'Week 7',
        description: 'Achieve 100/100 Lighthouse score, optimize LCP, INP, CLS, configure CDN caching headers, and deploy to Vercel/AWS.',
        focusArea: 'Lighthouse 100/100, LCP, INP, CLS, CDN Caching, S3 Image Optimization',
        concepts: [
          { id: 'next-4-1', name: 'Largest Contentful Paint (LCP) & Interaction to Next Paint (INP) Tuning', detail: 'Font optimization, critical CSS inlining, removing long script tasks.', estimatedMin: 55 },
          { id: 'next-4-2', name: 'Next.js Image & Asset Optimization Pipelines', detail: 'AVIF/WebP conversion, responsive srcset, CDN cache-control headers.', estimatedMin: 45 },
          { id: 'next-4-3', name: 'CI/CD Automated Deployment & Vercel Preview Environments', detail: 'Automated Playwright E2E tests, preview branches, production rollback strategies.', estimatedMin: 45 }
        ],
        capstone: {
          name: 'Chrona Certified Production Full-Stack Application',
          description: 'Launch complete production application with 99+ Lighthouse performance scores, automated CI/CD, and monitoring.',
          tech: ['Next.js 15', 'Vercel / AWS', 'Playwright', 'Sentry'],
          deliverables: ['100/100 Lighthouse Performance Report', 'Automated GitHub Actions CI/CD', 'Sentry error telemetry']
        },
        interviewDrills: ['How do you debug high Interaction to Next Paint (INP)?', 'Stale-While-Revalidate caching mechanics'],
        syncTasks: [
          { title: 'Audit and Optimize Next.js App for 95+ Lighthouse Score', estimatedMinutes: 50, impact: 'High', why: 'Proves high-level performance engineering capabilities.' },
          { title: 'Write Playwright E2E Test Suite for Critical Auth & Checkout Flow', estimatedMinutes: 45, impact: 'High', why: 'Essential for continuous delivery in top product startups.' }
        ]
      }
    ]
  },
  {
    id: 'database-sql',
    title: 'High-Scale Database Engineering & SQL Mastery',
    subtitle: 'Master PostgreSQL internals, query optimization, indexing, ACID isolation levels, sharding, and Redis caching',
    category: 'AI & Systems',
    level: 'Intermediate',
    duration: '50 Hours',
    techStack: ['PostgreSQL', 'SQL', 'Redis', 'EXPLAIN ANALYZE', 'ClickHouse', 'Sharding'],
    placementTier: 'Database & Infrastructure Specialist',
    ctcTarget: '₹20 - 45 LPA',
    rating: 4.87,
    enrolledCount: 8900,
    description: 'Databases power everything. Learn how to write complex analytical SQL, read EXPLAIN ANALYZE query plans, design B-Tree/GIN/GiST indexes, prevent deadlocks, and shard databases for 100M+ rows.',
    color: {
      primary: 'text-teal-400',
      glow: 'from-teal-600/20 to-teal-900/10',
      border: 'border-teal-500/30 hover:border-teal-400/60',
      badge: 'bg-teal-500/10 text-teal-300 border-teal-500/30'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: Advanced Analytical SQL & Complex Queries',
        duration: 'Weeks 1 - 2',
        description: 'Window functions, Common Table Expressions (CTEs), recursive queries, lateral joins, and aggregate filtering.',
        focusArea: 'Window Functions (RANK, DENSE_RANK, LAG, LEAD), Recursive CTEs, Lateral Joins',
        concepts: [
          { id: 'db-1-1', name: 'Window Functions Master Class (PARTITION BY, ORDER BY, FRAMES)', detail: 'Running totals, moving averages, top N per category.', estimatedMin: 55 },
          { id: 'db-1-2', name: 'Recursive Common Table Expressions (CTEs) for Hierarchical Data', detail: 'Organizational hierarchies, graph path traversals in pure SQL.', estimatedMin: 50 },
          { id: 'db-1-3', name: 'LATERAL Joins, GROUPING SETS, ROLLUP & CUBE', detail: 'Multi-dimensional aggregate reporting in a single query pass.', estimatedMin: 50 }
        ],
        capstone: {
          name: 'Complex Financial Analytical Reporting Engine',
          description: 'A pure SQL analytics script generating multi-currency P&L reports, user cohort retention, and churn analysis.',
          tech: ['PostgreSQL', 'Window Functions', 'Recursive CTEs'],
          deliverables: ['Cohort retention matrix query', 'Sub-100ms multi-level aggregation', 'Zero temp table overhead']
        },
        interviewDrills: ['Difference between RANK, DENSE_RANK and ROW_NUMBER', 'How to find the 2nd highest salary across departments?'],
        syncTasks: [
          { title: 'Solve 3 Complex SQL LeetCode Hard Questions with Window Functions', estimatedMinutes: 60, impact: 'High', why: 'Essential for passing SQL live screening tests.' },
          { title: 'Write a Recursive CTE to traverse an Organizational Chart', estimatedMinutes: 45, impact: 'Medium', why: 'Tests depth of hierarchical query knowledge.' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Indexing Internals & EXPLAIN ANALYZE Optimization',
        duration: 'Weeks 3 - 4',
        description: 'Understand B-Tree, Hash, GIN, and GiST indexes, sequential scans vs index scans, and optimizing slow query plans.',
        focusArea: 'B-Tree, GIN, EXPLAIN ANALYZE, Cost-Based Optimizer, Vacuuming, Index Bloat',
        concepts: [
          { id: 'db-2-1', name: 'How B-Tree Indexing Works Internally (Leaf nodes, Root, Depth)', detail: 'Composite index column ordering, left-prefix rule, covering indexes.', estimatedMin: 60 },
          { id: 'db-2-2', name: 'Reading and Interpreting PostgreSQL EXPLAIN (ANALYZE, BUFFERS)', detail: 'Seq Scan vs Index Scan vs Index Only Scan, Bitmap Heap Scan.', estimatedMin: 65 },
          { id: 'db-2-3', name: 'GIN & GiST Indexes for Full-Text Search and JSONB Queries', detail: 'Indexing document columns, similarity searches, geospatial queries.', estimatedMin: 50 }
        ],
        capstone: {
          name: 'Slow Query Performance Refactoring Suite',
          description: 'Take 5 sluggish 50-second queries on a 10M row database and optimize them to under 15 milliseconds using proper indexing.',
          tech: ['PostgreSQL', 'EXPLAIN ANALYZE', 'B-Tree', 'Covering Indexes'],
          deliverables: ['Before/after query plan documentation', '99.9% latency reduction', 'Index size optimization report']
        },
        interviewDrills: ['Why does column order in composite indexes matter?', 'What causes a database optimizer to ignore an index?'],
        syncTasks: [
          { title: 'Profile a Slow Query with EXPLAIN (ANALYZE, BUFFERS) and Fix Indexing', estimatedMinutes: 50, impact: 'Critical', why: 'The #1 requested database skill for senior backend engineers.' },
          { title: 'Create a Covering Index to achieve Index-Only Scan', estimatedMinutes: 40, impact: 'High', why: 'Eliminates costly table heap lookups completely.' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: ACID Transactions, Lock Contention & Isolation Levels',
        duration: 'Weeks 5 - 6',
        description: 'Master Dirty Reads, Non-repeatable Reads, Phantom Reads, MVCC (Multi-Version Concurrency Control), and deadlock resolution.',
        focusArea: 'Read Committed, Repeatable Read, Serializable, MVCC, Row Locks, Deadlocks',
        concepts: [
          { id: 'db-3-1', name: 'Transaction Isolation Levels (Read Committed to Serializable)', detail: 'Anomalies prevented at each level, performance overhead vs safety.', estimatedMin: 60 },
          { id: 'db-3-2', name: 'PostgreSQL MVCC (xmin, xmax) & Autovacuum Architecture', detail: 'Dead tuples, table bloat, tuning autovacuum for high-write workloads.', estimatedMin: 55 },
          { id: 'db-3-3', name: 'Row-Level Locking (FOR UPDATE, FOR NO KEY UPDATE) & Deadlock Prevention', detail: 'Preventing race conditions in seat reservations and wallet deductions.', estimatedMin: 65 }
        ],
        capstone: {
          name: 'High-Concurrency Ticket Booking Engine with Zero Overselling',
          description: 'Build a ticket inventory system handling 5,000 concurrent purchase attempts on 100 seats with zero overselling and zero deadlocks.',
          tech: ['PostgreSQL', 'Pessimistic Locking', 'Advisory Locks', 'Python'],
          deliverables: ['Concurrency stress test with Locust', 'Zero seat oversell proof', 'Deadlock detection log']
        },
        interviewDrills: ['Explain MVCC in PostgreSQL', 'How do you detect and resolve database deadlocks?'],
        syncTasks: [
          { title: 'Implement Safe Inventory Deduction with SELECT FOR UPDATE', estimatedMinutes: 45, impact: 'Critical', why: 'Critical for all e-commerce and banking applications.' },
          { title: 'Simulate and Resolve a Database Deadlock Scenario', estimatedMinutes: 45, impact: 'High', why: 'Guarantees stability during high-traffic flash sales.' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: Partitioning, Sharding & Redis Caching Strategies',
        duration: 'Week 7',
        description: 'Table partitioning by range/list, horizontal sharding, Redis Cache-Aside, Write-Through, and invalidation strategies.',
        focusArea: 'Declarative Table Partitioning, Horizontal Sharding, Redis Cache-Aside, Write-Behind',
        concepts: [
          { id: 'db-4-1', name: 'PostgreSQL Declarative Table Partitioning (Range & Hash)', detail: 'Partition pruning, managing time-series log tables efficiently.', estimatedMin: 50 },
          { id: 'db-4-2', name: 'Redis Caching Patterns: Cache-Aside vs Write-Through vs Write-Back', detail: 'Handling cache stampede with mutex locks, probabilistic early expiration.', estimatedMin: 55 },
          { id: 'db-4-3', name: 'Database Replication, Read Replicas & Connection Pooling (PgBouncer)', detail: 'Handling replication lag, scaling read capacity 10x with PgBouncer.', estimatedMin: 50 }
        ],
        capstone: {
          name: 'High-Volume Time-Series Analytics Store with Partitioning & Redis',
          description: 'Architect a 100-million record partitioned database with PgBouncer connection pooling and sub-5ms Redis cache layer.',
          tech: ['PostgreSQL', 'PgBouncer', 'Redis', 'Docker'],
          deliverables: ['Partition pruning verification', 'Redis cache stampede protection', 'Load test benchmark']
        },
        interviewDrills: ['How do you handle Cache Stampede (Thundering Herd)?', 'Database Partitioning vs Sharding difference'],
        syncTasks: [
          { title: 'Set up Range Partitioning on a 10M Row Time-Series Table', estimatedMinutes: 50, impact: 'High', why: 'Dramatically speeds up analytical queries over date ranges.' },
          { title: 'Implement Redis Cache-Aside with Distributed Mutex Lock', estimatedMinutes: 45, impact: 'High', why: 'Protects backend databases from crashing under sudden viral spikes.' }
        ]
      }
    ]
  },
  {
    id: 'cloud-devops',
    title: 'Cloud DevOps, Kubernetes & CI/CD Pipelines',
    subtitle: 'Master Docker multi-stage builds, Kubernetes orchestration, AWS infrastructure, Terraform, and GitHub Actions',
    category: 'Web & Cloud',
    level: 'Intermediate',
    duration: '75 Hours',
    techStack: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'GitHub Actions', 'Prometheus', 'ArgoCD'],
    placementTier: 'Cloud Solutions & SRE Architect',
    ctcTarget: '₹22 - 45 LPA',
    rating: 4.89,
    enrolledCount: 10400,
    description: 'Learn modern Cloud DevOps engineering: containerizing services, orchestrating with Kubernetes, provisioning AWS infrastructure via Terraform, and automating zero-downtime CI/CD deployments.',
    color: {
      primary: 'text-sky-400',
      glow: 'from-sky-600/20 to-sky-900/10',
      border: 'border-sky-500/30 hover:border-sky-400/60',
      badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: Production Containerization with Docker',
        duration: 'Weeks 1 - 2',
        description: 'Multi-stage Dockerfiles, non-root security, layer caching optimization, and Linux namespaces & cgroups.',
        focusArea: 'Docker Multi-Stage, Image Shrinking, Non-Root Users, Docker Compose',
        concepts: [
          { id: 'dev-1-1', name: 'Multi-Stage Docker Builds for Ultra-Lightweight Images', detail: 'Shrinking 1GB images to <50MB using Alpine/Distroless bases.', estimatedMin: 50 },
          { id: 'dev-1-2', name: 'Container Security & Non-Root Execution', detail: 'Preventing container breakout, read-only root filesystems, vulnerability scanning with Trivy.', estimatedMin: 45 },
          { id: 'dev-1-3', name: 'Docker Compose Multi-Container Orchestration', detail: 'Networks, volume persistence, health checks, dependency startup order.', estimatedMin: 45 }
        ],
        capstone: {
          name: 'Secure Zero-Vulnerability Production Docker Image Suite',
          description: 'Build automated Docker build pipeline that compiles Go/Node apps into 20MB scratch images with 0 Trivy vulnerabilities.',
          tech: ['Docker', 'Trivy', 'Distroless', 'GitHub Actions'],
          deliverables: ['Sub-30MB container image', 'Trivy 0-vulnerability scan report', 'Automated build workflow']
        },
        interviewDrills: ['How does Docker layer caching work and how to order instructions?', 'CMD vs ENTRYPOINT difference'],
        syncTasks: [
          { title: 'Write a Multi-Stage Distroless Dockerfile for Node/Python', estimatedMinutes: 45, impact: 'High', why: 'Crucial for passing DevOps and backend screening checks.' },
          { title: 'Scan Container Images with Trivy and Fix All Critical CVEs', estimatedMinutes: 40, impact: 'Medium', why: 'Essential container hardening practice for enterprise security.' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Kubernetes Cluster Orchestration & Helm',
        duration: 'Weeks 3 - 5',
        description: 'Pods, Deployments, Services, Ingress Controllers, ConfigMaps, Secrets, Horizontal Pod Autoscaling (HPA), and Helm charts.',
        focusArea: 'Pods, Deployments, Ingress, HPA, Helm, Rolling Updates, Liveness Probes',
        concepts: [
          { id: 'dev-2-1', name: 'Deployments, ReplicaSets & Rolling Update Strategies', detail: 'Zero-downtime rolling deploys, rollback mechanics, maxSurge/maxUnavailable.', estimatedMin: 60 },
          { id: 'dev-2-2', name: 'Kubernetes Networking: ClusterIP, NodePort, LoadBalancer & Ingress', detail: 'Traffic routing, TLS termination with cert-manager, Nginx Ingress.', estimatedMin: 65 },
          { id: 'dev-2-3', name: 'Horizontal Pod Autoscaler (HPA) & Resource Quotas', detail: 'Autoscaling based on CPU/Memory and custom Prometheus metrics.', estimatedMin: 55 },
          { id: 'dev-2-4', name: 'Package Management with Helm Charts', detail: 'Template inheritance, values.yaml overrides, releasing charts.', estimatedMin: 50 }
        ],
        capstone: {
          name: 'Resilient Microservices Kubernetes Deployment with Auto-Healing',
          description: 'Deploy a 3-tier application to a local Minikube / K3s cluster with Ingress, TLS, HPA, and automated pod recovery.',
          tech: ['Kubernetes', 'Helm', 'Minikube / K3s', 'Nginx Ingress'],
          deliverables: ['Helm chart repository', 'HPA stress test simulation', 'Zero-downtime rolling update verification']
        },
        interviewDrills: ['Liveness vs Readiness vs Startup Probes in Kubernetes', 'How does Kubernetes handle Node failure?'],
        syncTasks: [
          { title: 'Create a Complete Helm Chart for a 3-Tier Web Application', estimatedMinutes: 55, impact: 'Critical', why: 'Standard deployment packaging method used across cloud companies.' },
          { title: 'Configure Kubernetes HPA and stress-test auto-scaling under load', estimatedMinutes: 45, impact: 'High', why: 'Proves practical understanding of cloud scalability and cost control.' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: Infrastructure as Code (IaC) with Terraform & AWS',
        duration: 'Weeks 6 - 7',
        description: 'Provision cloud infrastructure on AWS: VPCs, Subnets, Internet Gateways, Security Groups, RDS, and EKS using Terraform.',
        focusArea: 'Terraform, AWS VPC, Subnets, IAM Roles, S3 State Backend, EKS Cluster',
        concepts: [
          { id: 'dev-3-1', name: 'Terraform State Management & Remote S3 Backends with DynamoDB Locking', detail: 'Preventing state corruption, state migration, terraform import.', estimatedMin: 60 },
          { id: 'dev-3-2', name: 'Architecting a Multi-AZ AWS VPC from Scratch', detail: 'Public/private subnets, NAT gateways, route tables, security groups.', estimatedMin: 65 },
          { id: 'dev-3-3', name: 'Provisioning Managed Kubernetes (AWS EKS) with Terraform', detail: 'Node groups, IAM OIDC providers, EBS CSI drivers.', estimatedMin: 70 }
        ],
        capstone: {
          name: 'Automated Multi-Environment AWS Infrastructure with Terraform',
          description: 'Write reusable Terraform modules that provision staging and production environments on AWS with a single command.',
          tech: ['Terraform', 'AWS (VPC, EKS, RDS, S3)', 'DynamoDB State Lock'],
          deliverables: ['Modular Terraform codebase', 'Automated terraform plan/apply CI', 'Cost estimation report with Infracost']
        },
        interviewDrills: ['How does Terraform handle state drift?', 'Public Subnet vs Private Subnet routing rules in AWS'],
        syncTasks: [
          { title: 'Write Terraform Module for Multi-AZ VPC with NAT Gateway', estimatedMinutes: 60, impact: 'Critical', why: 'Fundamental building block of all cloud infrastructure architectures.' },
          { title: 'Set up Terraform Remote State with S3 and DynamoDB Locking', estimatedMinutes: 45, impact: 'High', why: 'Mandatory standard for multi-engineer DevOps teams.' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: GitOps CI/CD Pipelines & Observability (ArgoCD & Prometheus)',
        duration: 'Week 8',
        description: 'Automate deployments with GitHub Actions and ArgoCD GitOps, and set up monitoring with Prometheus and Grafana dashboards.',
        focusArea: 'GitHub Actions, ArgoCD, GitOps, Prometheus, Grafana Alerting',
        concepts: [
          { id: 'dev-4-1', name: 'End-to-End GitHub Actions CI/CD Pipeline', detail: 'Automated linting, testing, Docker build, and GitOps commit triggering.', estimatedMin: 55 },
          { id: 'dev-4-2', name: 'Declarative GitOps with ArgoCD', detail: 'Automated sync, self-healing clusters, canary deployments with Argo Rollouts.', estimatedMin: 60 },
          { id: 'dev-4-3', name: 'Observability & Alerting with Prometheus and Grafana', detail: 'PromQL queries, custom alerts, P99 latency monitoring, Grafana dashboards.', estimatedMin: 55 }
        ],
        capstone: {
          name: 'Full GitOps CI/CD Platform with Monitoring & Alerting',
          description: 'Complete automated deployment pipeline: commit code -> GitHub Actions builds image -> ArgoCD deploys to K8s -> Prometheus monitors health.',
          tech: ['GitHub Actions', 'ArgoCD', 'Prometheus', 'Grafana'],
          deliverables: ['Live GitOps repo sync', 'Grafana dashboard with P99 metrics', 'Automated Slack/Discord alert hook']
        },
        interviewDrills: ['Explain the GitOps paradigm and why it replaced push-based CI/CD', 'Writing PromQL for 99th percentile request latency'],
        syncTasks: [
          { title: 'Build GitHub Actions Workflow to Build and Push Docker Images', estimatedMinutes: 45, impact: 'High', why: 'Standard daily workflow across all modern engineering teams.' },
          { title: 'Set up ArgoCD Application Sync and verify self-healing cluster', estimatedMinutes: 50, impact: 'Critical', why: 'GitOps is the cutting-edge standard in top cloud companies.' }
        ]
      }
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Applied Cybersecurity & Penetration Testing Fundamentals',
    subtitle: 'Master OWASP Top 10 vulnerabilities, network traffic analysis, cryptography, exploit development, and defense hardening',
    category: 'AI & Systems',
    level: 'Advanced',
    duration: '70 Hours',
    techStack: ['Burp Suite', 'Wireshark', 'Python', 'OWASP Top 10', 'Nmap', 'Cryptography', 'Linux'],
    placementTier: 'InfoSec & Security Engineer',
    ctcTarget: '₹20 - 45 LPA',
    rating: 4.86,
    enrolledCount: 6900,
    description: 'Learn offensive penetration testing and defensive security. Hunt and exploit SQL Injection, XSS, SSRF, IDOR, audit TLS/cryptographic implementations, and harden enterprise architectures.',
    color: {
      primary: 'text-red-400',
      glow: 'from-red-600/20 to-red-900/10',
      border: 'border-red-500/30 hover:border-red-400/60',
      badge: 'bg-red-500/10 text-red-300 border-red-500/30'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: Network Protocols, Reconnaissance & Cryptography',
        duration: 'Weeks 1 - 2',
        description: 'Understand TCP/IP 3-way handshakes, TLS 1.3 encryption, Wireshark packet inspection, Nmap network mapping, and AES/RSA math.',
        focusArea: 'TCP/IP, TLS 1.3 Handshake, Wireshark, Nmap, AES/RSA, Digital Signatures',
        concepts: [
          { id: 'sec-1-1', name: 'TCP/IP Stack, Packet Analysis & Wireshark Inspection', detail: 'Analyzing packet streams, detecting MITM attacks, DNS spoofing.', estimatedMin: 55 },
          { id: 'sec-1-2', name: 'Modern Cryptography: Symmetric (AES-GCM) vs Asymmetric (RSA/ECC)', detail: 'Key exchange (Diffie-Hellman), digital certificates, public key infrastructure.', estimatedMin: 60 },
          { id: 'sec-1-3', name: 'Network Reconnaissance with Nmap & Port Scanning Mechanics', detail: 'SYN stealth scans, OS fingerprinting, script engine (NSE).', estimatedMin: 50 }
        ],
        capstone: {
          name: 'Automated Network Port & Vulnerability Reconnaissance Scanner',
          description: 'Build a multi-threaded Python scanner that discovers open ports, fingerprints running services, and flags outdated CVEs.',
          tech: ['Python', 'Sockets', 'Nmap NSE', 'Scapy'],
          deliverables: ['Custom multi-threaded socket scanner', 'CVE database cross-checker', 'Interactive HTML audit report']
        },
        interviewDrills: ['Walk through the TLS 1.3 Handshake Step-by-Step', 'How does AES-GCM provide authenticated encryption?'],
        syncTasks: [
          { title: 'Inspect TLS 1.3 Handshake in Wireshark and Document Key Exchange', estimatedMinutes: 45, impact: 'High', why: 'Essential networking fundamental for security engineers.' },
          { title: 'Write a Python Network Packet Sniffer with Scapy', estimatedMinutes: 50, impact: 'High', why: 'Deepens understanding of low-level packet construction.' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Web Application Penetration Testing & OWASP Top 10',
        duration: 'Weeks 3 - 5',
        description: 'Deep dive into SQL Injection, Cross-Site Scripting (XSS), Server-Side Request Forgery (SSRF), IDOR, and Broken Authentication.',
        focusArea: 'Burp Suite, SQL Injection, Stored/Reflected XSS, SSRF, IDOR, JWT Attacks',
        concepts: [
          { id: 'sec-2-1', name: 'Advanced SQL Injection (Blind, Time-Based & Out-of-Band)', detail: 'Bypassing WAFs, automated extraction with SQLMap, parameterized remedies.', estimatedMin: 65 },
          { id: 'sec-2-2', name: 'Cross-Site Scripting (XSS) & Content Security Policy (CSP) Bypasses', detail: 'DOM-based XSS, cookie stealing, strict CSP implementation.', estimatedMin: 60 },
          { id: 'sec-2-3', name: 'Server-Side Request Forgery (SSRF) & Cloud Metadata Exploitation', detail: 'Accessing AWS metadata endpoints (169.254.169.254), internal port pivoting.', estimatedMin: 60 },
          { id: 'sec-2-4', name: 'Insecure Direct Object References (IDOR) & Broken Object Level Auth', detail: 'Testing horizontal and vertical privilege escalation with Burp Repeater.', estimatedMin: 50 }
        ],
        capstone: {
          name: 'Full Web App Penetration Test & Security Audit Report',
          description: 'Perform a comprehensive black-box pen test on a vulnerable web application, documenting full exploit chains and fixes.',
          tech: ['Burp Suite Professional', 'OWASP Juice Shop / DVWA', 'SQLMap'],
          deliverables: ['Comprehensive vulnerability assessment report', 'Proof-of-concept exploit scripts', 'Remediation code diffs']
        },
        interviewDrills: ['How do you protect against SSRF in cloud environments?', 'Same-Origin Policy vs Cross-Origin Resource Sharing (CORS)'],
        syncTasks: [
          { title: 'Exploit and Fix a Blind Time-Based SQL Injection in Python/PostgreSQL', estimatedMinutes: 55, impact: 'Critical', why: 'Mandatory standard testing skill for application security.' },
          { title: 'Configure a Strict Content Security Policy (CSP) with Nonce Protection', estimatedMinutes: 40, impact: 'High', why: 'Eliminates 99% of XSS attack surfaces in modern web apps.' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: API Security & JWT Authentication Attacks',
        duration: 'Weeks 6 - 7',
        description: 'Hunt flaws in REST & GraphQL APIs: JWT signature bypasses, algorithmic confusion (none algorithm), rate limit bypasses, and mass assignment.',
        focusArea: 'OWASP API Top 10, JWT Attacks, GraphQL Introspection, Mass Assignment',
        concepts: [
          { id: 'sec-3-1', name: 'JWT Vulnerabilities: Algorithm Confusion & Weak Secret Cracking', detail: 'RS256 to HS256 downgrade attacks, cracking HMAC secrets with hashcat.', estimatedMin: 60 },
          { id: 'sec-3-2', name: 'GraphQL Security: Introspection, Batching Attacks & Depth Limits', detail: 'Preventing denial of service via circular recursive queries.', estimatedMin: 55 },
          { id: 'sec-3-3', name: 'Mass Assignment & Parameter Tampering in REST APIs', detail: 'Modifying user roles to admin through unvalidated schema binding.', estimatedMin: 45 }
        ],
        capstone: {
          name: 'Automated API Security & JWT Fuzzing Framework',
          description: 'Create a security test automation tool that parses OpenAPI specs and runs automated security checks against endpoints.',
          tech: ['Python', 'Requests', 'JWT Tools', 'Pytest'],
          deliverables: ['Automated OpenAPI fuzzing tool', 'JWT vulnerability detection suite', 'CI/CD security gate integration']
        },
        interviewDrills: ['Explain JWT Algorithm Confusion Attack', 'How to securely store tokens in browser: HttpOnly Cookies vs LocalStorage'],
        syncTasks: [
          { title: 'Write an Automated Script to Test JWT None-Algorithm Vulnerability', estimatedMinutes: 45, impact: 'High', why: 'Common authentication bypass vulnerability in poorly configured APIs.' },
          { title: 'Implement Rate Limiting & Query Depth Limiting on GraphQL Endpoint', estimatedMinutes: 45, impact: 'High', why: 'Protects backend APIs from denial of service and data scraping.' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: Defensive Hardening, SOC & Incident Response',
        duration: 'Week 8',
        description: 'Implement defensive security: Linux server hardening, SIEM log analysis, Web Application Firewalls (WAF), and incident response playbooks.',
        focusArea: 'Linux Hardening, fail2ban, ModSecurity WAF, SIEM Logs, Incident Response',
        concepts: [
          { id: 'sec-4-1', name: 'Linux OS Hardening (SSH keys, UFW Firewall, AppArmor/SELinux)', detail: 'Closing unused ports, disabling password auth, process isolation.', estimatedMin: 50 },
          { id: 'sec-4-2', name: 'WAF Rule Configuration (ModSecurity & AWS WAF)', detail: 'Writing custom regex rules to block SQLi and malicious bots.', estimatedMin: 50 },
          { id: 'sec-4-3', name: 'Incident Response & Threat Hunting in SIEM Logs', detail: 'Investigating brute force attempts, forensic analysis, MITRE ATT&CK framework.', estimatedMin: 55 }
        ],
        capstone: {
          name: 'Chrona Certified Enterprise Defensive Security Architecture',
          description: 'Harden an AWS Linux server cluster with automated intrusion detection, WAF rules, and central log alerting.',
          tech: ['AWS WAF', 'Fail2ban', 'Wazuh SIEM', 'Linux'],
          deliverables: ['Hardened server benchmark score (CIS standard)', 'WAF rule set', 'Incident response playbook']
        },
        interviewDrills: ['How does a Web Application Firewall differ from a Network Firewall?', 'Steps taken during an active data breach incident'],
        syncTasks: [
          { title: 'Harden a Linux Server according to CIS Benchmark Standards', estimatedMinutes: 50, impact: 'High', why: 'Essential practical knowledge for security administrators.' },
          { title: 'Draft an Incident Response Playbook for Stolen API Credentials', estimatedMinutes: 40, impact: 'Medium', why: 'Evaluates strategic and organizational security readiness.' }
        ]
      }
    ]
  },
  {
    id: 'system-design',
    title: 'System Design & Distributed Architecture (Low & High Level)',
    subtitle: 'Master Low-Level Design (LLD / Design Patterns) and High-Level Design (HLD / Scalability for 100M+ Users)',
    category: 'Placement & DSA',
    level: 'Mastery',
    duration: '85 Hours',
    techStack: ['Microservices', 'Load Balancers', 'Kafka', 'Redis', 'CDN', 'CAP Theorem', 'Consistent Hashing'],
    placementTier: 'Senior SDE & FAANG Placement Crucial',
    ctcTarget: '₹35 - 70+ LPA',
    rating: 4.96,
    enrolledCount: 16800,
    description: 'The definitive course for passing technical architecture interviews. Master SOLID principles, Gang of Four patterns, UML modeling, Consistent Hashing, Distributed Caching, Message Queues, and Sharding.',
    color: {
      primary: 'text-purple-400',
      glow: 'from-purple-600/20 to-purple-900/10',
      border: 'border-purple-500/30 hover:border-purple-400/60',
      badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
    },
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: Object-Oriented Low-Level Design (LLD) & Patterns',
        duration: 'Weeks 1 - 2',
        description: 'Master SOLID principles, GoF design patterns (Factory, Strategy, Observer, Decorator, State, Singleton), and UML class diagrams.',
        focusArea: 'SOLID Principles, Factory, Strategy, Observer, Decorator, State Machine, UML',
        concepts: [
          { id: 'sys-1-1', name: 'SOLID Principles with Real-World Code Refactoring', detail: 'Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.', estimatedMin: 55 },
          { id: 'sys-1-2', name: 'Creational & Structural Patterns: Factory, Builder, Decorator, Adapter', detail: 'Writing extensible code without modifying core classes.', estimatedMin: 60 },
          { id: 'sys-1-3', name: 'Behavioral Patterns: Strategy, Observer, Command & State Pattern', detail: 'Decoupling event handlers and dynamic state transitions.', estimatedMin: 60 }
        ],
        capstone: {
          name: 'Low-Level Design for Multi-Floor Smart Elevator System',
          description: 'Design and implement a clean, extensible multi-car elevator dispatching simulator adhering strictly to SOLID and State patterns.',
          tech: ['C++ / Java', 'State Pattern', 'Strategy Pattern', 'UML Diagram'],
          deliverables: ['Clean OOP class hierarchy', 'UML class & sequence diagrams', 'Unit tested dispatching algorithms']
        },
        interviewDrills: ['Design a Parking Lot System (LLD)', 'Design a Vending Machine using State Pattern', 'Design Chess Game'],
        syncTasks: [
          { title: 'Implement Low-Level Design for Parking Lot System in OOP', estimatedMinutes: 60, impact: 'Critical', why: 'The most commonly asked LLD interview question at Amazon & Microsoft.' },
          { title: 'Refactor Monolithic Payment Processor using Strategy & Factory Patterns', estimatedMinutes: 50, impact: 'High', why: 'Demonstrates clean enterprise software design.' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: High-Level Architecture Core Components',
        duration: 'Weeks 3 - 5',
        description: 'Understand Load Balancers (L4 vs L7), Consistent Hashing, Message Queues (Kafka vs RabbitMQ), CDNs, and Rate Limiters.',
        focusArea: 'Consistent Hashing, Load Balancers, Distributed Caching, Message Queues, Rate Limiters',
        concepts: [
          { id: 'sys-2-1', name: 'Consistent Hashing & Virtual Nodes Algorithm', detail: 'Minimizing key remapping during server additions/removals in distributed caches.', estimatedMin: 65 },
          { id: 'sys-2-2', name: 'Distributed Rate Limiter Algorithms (Token Bucket, Leaky Bucket, Sliding Window)', detail: 'Protecting downstream microservices from traffic surges.', estimatedMin: 60 },
          { id: 'sys-2-3', name: 'Message Queues vs Event Streams (RabbitMQ vs Apache Kafka)', detail: 'Push vs pull models, ordering guarantees, consumer backpressure.', estimatedMin: 60 },
          { id: 'sys-2-4', name: 'CAP Theorem, PACELC, and Eventual Consistency Realities', detail: 'Availability vs Consistency tradeoffs in real distributed networks.', estimatedMin: 55 }
        ],
        capstone: {
          name: 'Distributed Rate Limiting Engine with Sliding Window & Redis',
          description: 'Build a distributed rate limiter middleware supporting 100,000 req/sec with sub-millisecond overhead using Redis Lua scripts.',
          tech: ['Redis', 'Lua Scripts', 'Token Bucket', 'Python / Go'],
          deliverables: ['Sliding-window Lua script for atomic checks', 'Locust load test benchmark', 'Sub-millisecond latency']
        },
        interviewDrills: ['How Consistent Hashing prevents cache stampedes', 'Token Bucket vs Leaky Bucket algorithms'],
        syncTasks: [
          { title: 'Implement Consistent Hashing with Virtual Nodes from Scratch', estimatedMinutes: 55, impact: 'Critical', why: 'Top FAANG system design question for data partitioning.' },
          { title: 'Write a Redis Sliding Window Rate Limiter using Atomic Lua Script', estimatedMinutes: 50, impact: 'High', why: 'Essential architectural component for protecting public APIs.' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: Real-World High-Scale System Design Blueprints',
        duration: 'Weeks 6 - 7',
        description: 'Design world-class systems from scratch: TinyURL, YouTube Video Streaming, Uber Ride Matching, and WhatsApp Messenger.',
        focusArea: 'TinyURL, YouTube, Uber Geospatial, WhatsApp Real-Time, Twitter Feed',
        concepts: [
          { id: 'sys-3-1', name: 'Design URL Shortener (TinyURL) with 10 Billion URLs', detail: 'Base62 encoding, unique ID generation (Snowflake), caching, redirection latency.', estimatedMin: 60 },
          { id: 'sys-3-2', name: 'Design YouTube / Netflix Video Streaming Architecture', detail: 'Chunked video transcoding, Adaptive Bitrate Streaming (HLS/DASH), CDN edge caching.', estimatedMin: 70 },
          { id: 'sys-3-3', name: 'Design Uber / Lyft Geospatial Ride Matching Service', detail: 'QuadTrees, Google S2 / Uber H3 hexagonal indexing, location update pipelines.', estimatedMin: 75 },
          { id: 'sys-3-4', name: 'Design Real-Time Chat Platform (WhatsApp / Discord)', detail: 'WebSocket gateways, message storage in Cassandra, offline delivery queues.', estimatedMin: 70 }
        ],
        capstone: {
          name: 'Comprehensive System Design Document for Uber Geospatial Matching',
          description: 'Author an industry-standard RFC design doc detailing architecture, capacity estimation, API contracts, DB schema, and fault tolerance.',
          tech: ['System Architecture', 'Uber H3', 'WebSocket Gateways', 'Cassandra'],
          deliverables: ['Detailed Architecture Diagram', 'Capacity calculation spreadsheet (QPS, Storage, Bandwidth)', 'Failure mode analysis']
        },
        interviewDrills: ['Design Twitter/X News Feed System (Fan-out on write vs Fan-out on read)', 'Design Distributed Unique ID Generator (Snowflake)'],
        syncTasks: [
          { title: 'Complete Capacity Estimation (QPS, Storage, Bandwidth) for Video Platform', estimatedMinutes: 45, impact: 'High', why: 'The mandatory opening 10 minutes of every FAANG system design interview.' },
          { title: 'Design Geospatial Location Indexing Architecture using Uber H3', estimatedMinutes: 55, impact: 'Critical', why: 'Tests mastery over spatial data and high-frequency real-time updates.' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: Whiteboard System Design Interview Simulation',
        duration: 'Week 8',
        description: 'Practice the 45-minute structured interview framework: Requirements, Back-of-envelope estimations, High-level design, Deep-dives, and Bottlenecks.',
        focusArea: '45-Min Framework, Whiteboarding, Trade-off Justification, Single Points of Failure',
        concepts: [
          { id: 'sys-4-1', name: 'The 4-Step System Design Interview Framework', detail: 'Step 1: Scoping & Requirements. Step 2: High-Level Architecture. Step 3: Deep Dive. Step 4: Bottleneck Mitigation.', estimatedMin: 45 },
          { id: 'sys-4-2', name: 'Handling Single Points of Failure (SPOF) & Disaster Recovery', detail: 'Multi-region failover, circuit breakers, chaos engineering principles.', estimatedMin: 50 },
          { id: 'sys-4-3', name: 'Live Timed System Design Mock Walkthrough with Chrona Mentor', detail: 'Interactive verbal defense of design decisions and trade-offs.', estimatedMin: 60 }
        ],
        capstone: {
          name: 'Chrona Master System Design Certified Portfolio',
          description: 'Complete 5 verified System Design architectures reviewed and graded against FAANG Senior SDE rubrics.',
          tech: ['System Architecture', 'Capacity Estimation', 'Tradeoff Analysis'],
          deliverables: ['5 complete system blueprints', 'Verified Architecture Rating', 'Chrona Certified Badge']
        },
        interviewDrills: ['Design Distributed Web Crawler', 'Design Ticketmaster Live Concert Booking System'],
        syncTasks: [
          { title: 'Conduct a 45-Minute Timed System Design Whiteboard Mock with Chrona Mentor', estimatedMinutes: 45, impact: 'Critical', why: 'Builds communication confidence and structural interview discipline.' },
          { title: 'Audit an Architecture for Single Points of Failure and Cascading Breakdowns', estimatedMinutes: 40, impact: 'High', why: 'Proves high-level resilience thinking essential for Tier-1 offers.' }
        ]
      }
    ]
  }
];
