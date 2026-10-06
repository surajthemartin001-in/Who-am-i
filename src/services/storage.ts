/**
 * WHO AM I? — Storage & State Persistence Engine
 * Supports local offline-first persistence with reactive subscriber events,
 * sample seed data for fast launch, and full schema synchronization.
 */

import {
  UserProfile,
  AppPermissions,
  Goal,
  ResourceDocument,
  Question,
  QuestionPack,
  QuestionAttempt,
  DailyPlan,
  IntensityLock,
  LyraMessage,
  NexoraProject,
  ExternalIntegration,
  LyraDocument,
  LyraTask,
  PendingLyraAction,
  LyraVoiceSettings,
} from '../types';

const KEYS = {
  USER: 'whoami_user_profile',
  PERMISSIONS: 'whoami_permissions',
  GOALS: 'whoami_goals',
  ACTIVE_GOAL_ID: 'whoami_active_goal_id',
  RESOURCES: 'whoami_resources',
  QUESTIONS: 'whoami_questions',
  QUESTION_PACKS: 'whoami_question_packs',
  ATTEMPTS: 'whoami_attempts',
  SAVED_QUESTION_IDS: 'whoami_saved_question_ids',
  DAILY_PLANS: 'whoami_daily_plans',
  INTENSITY_LOCK: 'whoami_intensity_lock',
  LYRA_MESSAGES: 'whoami_lyra_messages',
  NEXORA_PROJECTS: 'whoami_nexora_projects',
  INTEGRATIONS: 'whoami_integrations',
  LYRA_DOCUMENTS: 'whoami_lyra_documents',
  LYRA_TASKS: 'whoami_lyra_tasks',
  LYRA_ACTIONS: 'whoami_lyra_actions',
  VOICE_SETTINGS: 'whoami_lyra_voice_settings',
};

// Listeners for reactive updates
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
}

// Default Seed Data
const DEFAULT_USER: UserProfile = {
  id: 'usr_default_01',
  name: 'Alex Rivera',
  displayName: 'Alex',
  email: 'alex.rivera@example.com',
  interests: ['Artificial Intelligence', 'Autonomous Robotics', 'Cybersecurity', 'High Performance Systems'],
  learningInterests: ['Machine Learning', 'Reinforcement Learning', 'Embedded C++', 'Kernel Security'],
  dreams: ['Pioneer next-generation human-centered cognitive AI systems and build an autonomous robotics venture'],
  primaryGoalId: 'goal_ai_engineer_01',
  targetCareer: 'AI & Robotics Systems Architect',
  availableHoursPerDay: 4,
  currentLevel: 'intermediate',
  preferredLanguage: 'English',
  timezone: 'UTC-7',
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
  onboardingCompleted: true,
};

const DEFAULT_PERMISSIONS: AppPermissions = {
  microphone: 'prompt',
  camera: 'prompt',
  notifications: 'prompt',
  fileAccess: 'granted',
};

const DEFAULT_GOALS: Goal[] = [
  {
    id: 'goal_ai_engineer_01',
    title: 'AI & Robotics Systems Architect',
    dreamStatement: 'Build autonomous cognitive agents that safely manipulate physical reality and empower humanity.',
    careerDirection: 'Artificial Intelligence & Robotics Engineering',
    field: 'AI / Robotics',
    status: 'active',
    trackStatus: 'green',
    targetDeadline: '2027-12-31',
    intensityMode: 'cheetah',
    requiredSkills: [
      {
        id: 'sk_1',
        name: 'Mathematics & Linear Algebra',
        category: 'foundation',
        currentMastery: 78,
        targetMastery: 95,
        subtopics: ['Eigenvalues & Eigenvectors', 'Singular Value Decomposition (SVD)', 'Multivariate Calculus', 'Probability & Bayesian Inference'],
      },
      {
        id: 'sk_2',
        name: 'Modern Deep Learning & PyTorch',
        category: 'core',
        currentMastery: 65,
        targetMastery: 90,
        subtopics: ['Transformer Architectures', 'Diffusion Models', 'Quantization (AWQ/GGUF)', 'Distributed Training (FSDP)'],
      },
      {
        id: 'sk_3',
        name: 'Robotics Perception & Control',
        category: 'technical',
        currentMastery: 52,
        targetMastery: 85,
        subtopics: ['ROS2 / micro-ROS', 'Kinematics & Dynamics', 'SLAM & Sensor Fusion', 'Model Predictive Control (MPC)'],
      },
      {
        id: 'sk_4',
        name: 'Embedded Systems & C++',
        category: 'tool',
        currentMastery: 70,
        targetMastery: 90,
        subtopics: ['C++20 Concurrency', 'SIMD & TensorRT Acceleration', 'RTOS', 'Hardware Acceleration (NVIDIA Jetson)'],
      },
    ],
    knowledgeTopics: [
      {
        id: 'top_1',
        subject: 'Deep Learning Foundation',
        chapter: 'Attention Mechanisms',
        topic: 'FlashAttention & KV Caching Algorithms',
        subtopics: ['GPU SRAM Tiling', 'Memory Bound vs Compute Bound', 'PagedAttention'],
        prerequisites: ['Matrix Multiplication', 'CUDA Basics'],
        estimatedHours: 14,
        masteryLevel: 72,
        status: 'in_progress',
      },
      {
        id: 'top_2',
        subject: 'Robotics Perception',
        chapter: 'Spatial Geometry',
        topic: 'Quaternions, SO(3) and SE(3) Transformations',
        subtopics: ['Lie Algebra', 'Euler Angle Singularities', 'Transform Matrices'],
        prerequisites: ['Linear Algebra 101'],
        estimatedHours: 12,
        masteryLevel: 45,
        isWeakArea: true,
        status: 'needs_revision',
      },
      {
        id: 'top_3',
        subject: 'System Architecture',
        chapter: 'High-Throughput Inference',
        topic: 'vLLM and Continuous Batching',
        subtopics: ['Chunked Prefill', 'Speculative Decoding', 'Triton Kernels'],
        prerequisites: ['Transformer Architecture'],
        estimatedHours: 18,
        masteryLevel: 80,
        status: 'in_progress',
      },
    ],
    milestones: [
      {
        id: 'ms_1',
        title: 'Master Transformer Mechanics & GPU Kernel Optimization',
        description: 'Implement FlashAttention2 and custom Triton kernel with 80%+ peak compute utilization.',
        targetDate: '2026-11-15',
        isCompleted: true,
        order: 1,
      },
      {
        id: 'ms_2',
        title: 'Build Autonomous Mobile Robot Simulation with ROS2 & Isaac Sim',
        description: 'Full simulation stack with visual SLAM, nav2 navigation, and obstacle avoidance.',
        targetDate: '2027-02-28',
        isCompleted: false,
        order: 2,
      },
      {
        id: 'ms_3',
        title: 'Deploy Real-Time Multimodal Voice & Vision Agent on Jetson Orin',
        description: 'Sub-150ms speech-to-action loop with local edge inference.',
        targetDate: '2027-06-30',
        isCompleted: false,
        order: 3,
      },
    ],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'goal_cybersecurity_02',
    title: 'Lead Red Team & Offensive Security Specialist',
    dreamStatement: 'Safeguard global critical infrastructure by uncovering and neutralizing zero-day vulnerabilities.',
    careerDirection: 'Cybersecurity & Offensive Security',
    field: 'Cybersecurity',
    status: 'active',
    trackStatus: 'yellow',
    deviationReason: 'Missed 3 scheduled binary exploitation labs last week; revision buffer needs rebalancing.',
    recoverySuggestion: 'Dedicate 45 minutes today to Buffer Overflow ASLR bypass practice before resuming kernel modules.',
    targetDeadline: '2027-08-15',
    intensityMode: 'rabbit',
    requiredSkills: [
      {
        id: 'sk_sec_1',
        name: 'Binary Exploitation & Reverse Engineering',
        category: 'core',
        currentMastery: 48,
        targetMastery: 90,
        subtopics: ['GDB & Ghidra', 'ROP Chains', 'Heap Exploitation', 'ASLR / DEP Protections'],
      },
      {
        id: 'sk_sec_2',
        name: 'Web Application Security',
        category: 'technical',
        currentMastery: 82,
        targetMastery: 95,
        subtopics: ['OAuth2 Flaws', 'SSRF', 'SQL Injection & Blind Vectors', 'IDOR & API Security'],
      },
    ],
    knowledgeTopics: [
      {
        id: 'top_sec_1',
        subject: 'Binary Exploitation',
        chapter: 'Memory Corruptions',
        topic: 'Return-Oriented Programming (ROP) in x86_64',
        subtopics: ['Gadget Finding', 'Calling Conventions', 'Stack Pivoting'],
        prerequisites: ['x86_64 Assembly', 'Stack Anatomy'],
        estimatedHours: 20,
        masteryLevel: 42,
        isWeakArea: true,
        status: 'needs_revision',
      },
    ],
    milestones: [
      {
        id: 'ms_sec_1',
        title: 'Pass Offensive Security Certified Professional (OSCP)',
        description: 'Complete 40 challenge lab machines and pass 24-hr practical exam.',
        targetDate: '2027-01-30',
        isCompleted: false,
        order: 1,
      },
    ],
    createdAt: '2026-09-10T12:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_RESOURCES: ResourceDocument[] = [
  {
    id: 'res_ai_handbook_01',
    title: 'Deep Learning & Neural Network Foundations (Vol. 1)',
    originalFileName: 'Deep_Learning_System_Architecture.pdf',
    fileType: 'pdf',
    fileSize: 4820300,
    extractedText: 'Chapter 1: Matrix Calculus and Backpropagation. The chain rule enables automatic differentiation across computational graphs. Chapter 2: Convolutional and Recurrent Operations. Chapter 3: Self-Attention Mechanisms and Transformer Scaling Laws. Quadratic complexity of standard attention is computed as O(N^2 * d). Memory bandwidth constraints on modern GPUs necessitate fused kernel designs like FlashAttention.',
    pageCount: 342,
    summary: 'Comprehensive textbook covering foundational neural mathematics, hardware acceleration bottlenecks, and attention optimization.',
    chapters: [
      {
        number: 1,
        title: 'Matrix Calculus & Backpropagation',
        summary: 'Rigorous derivation of gradients through multidimensional tensors and automatic differentiation.',
        topics: ['Jacobians', 'Vector-Matrix Products', 'Autodiff Graphs'],
      },
      {
        number: 2,
        title: 'Transformer Architecture & Attention',
        summary: 'Deep dive into Scaled Dot-Product Attention, Multi-Head Attention, and positional encodings.',
        topics: ['Attention Matrix', 'RoPE Encodings', 'KV Cache Memory'],
      },
      {
        number: 3,
        title: 'GPU Memory Hierarchy & Kernel Tiling',
        summary: 'Analysis of HBM vs SRAM bandwidth, fused kernels, and compute-to-memory ratios.',
        topics: ['SRAM Tiling', 'FlashAttention', 'Tensor Cores'],
      },
    ],
    detectedTopics: ['Matrix Calculus', 'Transformer Architecture', 'Attention Tiling', 'KV Cache', 'Backprop'],
    processingStatus: 'ready',
    processingProgress: 100,
    tags: ['Core Textbook', 'AI/ML', 'Hardware'],
    uploadedAt: '2026-09-15T14:30:00.000Z',
  },
  {
    id: 'res_robotics_syllabus_02',
    title: 'Autonomous Mobile Robotics — University Master Syllabus',
    originalFileName: 'Robotics_Syllabus_Fall.pdf',
    fileType: 'syllabus',
    fileSize: 920400,
    extractedText: 'Course Outline: Unit 1: Rigid Body Kinematics, Forward and Inverse Kinematics, Denavit-Hartenberg parameters. Unit 2: Mobile robot odometry, Kalman Filters and Extended Kalman Filter (EKF) localization. Unit 3: Simultaneous Localization and Mapping (SLAM). Unit 4: Trajectory planning, dynamic window approach (DWA), A* and RRT* path planning.',
    pageCount: 28,
    summary: 'Standard graduate-level robotics curriculum outline with unit topics, reading lists, and lab milestones.',
    chapters: [
      {
        number: 1,
        title: 'Rigid Body Kinematics',
        summary: 'Spatial representation, rotation matrices, transformation chains.',
        topics: ['D-H Parameters', 'Inverse Kinematics', 'Jacobians'],
      },
      {
        number: 2,
        title: 'Probabilistic Robotics & SLAM',
        summary: 'Bayesian filtering, particle filters, visual and LiDAR SLAM.',
        topics: ['EKF Localization', 'Occupancy Grid Mapping', 'Loop Closure'],
      },
    ],
    detectedTopics: ['Kinematics', 'SLAM', 'Path Planning', 'ROS2', 'Control Systems'],
    processingStatus: 'ready',
    processingProgress: 100,
    tags: ['Syllabus', 'Robotics', 'Path Planning'],
    uploadedAt: '2026-09-18T09:15:00.000Z',
  },
];

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q_dl_001',
    questionText: 'In standard Scaled Dot-Product Attention, why is the dot product of Q and K divided by the square root of the head dimension d_k?',
    type: 'single_mcq',
    difficulty: 'medium',
    field: 'Artificial Intelligence',
    subject: 'Deep Learning',
    chapter: 'Transformer Architecture',
    topic: 'Scaled Dot-Product Attention',
    options: [
      'To normalize the output vector so its Euclidean norm equals 1',
      'To prevent the dot products from growing excessively large in magnitude, which pushes the softmax into regions with vanishingly small gradients',
      'To reduce the computational time complexity from O(N^2) to O(N log N)',
      'To ensure that the attention matrix remains strictly symmetric across rows and columns',
    ],
    correctAnswer: '1',
    explanation: 'For large values of d_k, the dot products grow large in magnitude, pulling the softmax function into regions where it has extremely small gradients. Dividing by sqrt(d_k) counteracts this variance growth (which is proportional to d_k assuming zero-mean unit-variance components).',
    distractorExplanations: {
      '0': 'Euclidean normalization is handled by LayerNorm or RMSNorm, not the 1/sqrt(d_k) factor.',
      '2': 'The division is a scalar scaling operation; it does not change the O(N^2 * d) asymptotic complexity.',
      '3': 'Attention matrices are generally asymmetric because query-key pairings are directional.',
    },
    relatedConcepts: ['Vanishing Gradients', 'Softmax Temperature', 'Attention Scaling Laws'],
    sourceType: 'imported_pdf',
    sourceDocId: 'res_ai_handbook_01',
    sourceDocName: 'Deep_Learning_System_Architecture.pdf',
    sourcePage: 48,
    isAiGenerated: false,
    createdAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'q_dl_002',
    questionText: 'What is the primary architectural innovation introduced by FlashAttention to accelerate transformer attention computation on GPUs?',
    type: 'single_mcq',
    difficulty: 'hard',
    field: 'Artificial Intelligence',
    subject: 'High-Performance Computing',
    chapter: 'Attention Mechanisms',
    topic: 'FlashAttention & GPU SRAM Tiling',
    options: [
      'It approximates the attention matrix with a low-rank decomposition using randomized SVD',
      'It tiles the computation into blocks to load blocks into fast GPU SRAM, computing softmax incrementally via online softmax without materializing the full N x N matrix in HBM',
      'It replaces the standard softmax activation with a linear ReLU attention kernel',
      'It uses asynchronous CPU offloading to bypass GPU PCIe bandwidth bottlenecks',
    ],
    correctAnswer: '1',
    explanation: 'FlashAttention is an exact attention algorithm (not an approximation) that reduces the number of memory reads/writes between slow GPU High Bandwidth Memory (HBM) and fast on-chip SRAM by tiling Q, K, and V matrices and using the online softmax trick to compute attention incrementally.',
    distractorExplanations: {
      '0': 'FlashAttention is mathematical exact attention; low-rank approximations are used by methods like Linformer.',
      '2': 'It retains standard exponential softmax using the online running max and running sum trick.',
      '3': 'CPU offloading would drastically increase latency; FlashAttention optimizes on-GPU memory transfers.',
    },
    relatedConcepts: ['Online Softmax', 'IO-Aware Algorithms', 'GPU Memory Hierarchy', 'SRAM Tiling'],
    sourceType: 'ai_generated',
    isAiGenerated: true,
    createdAt: '2026-09-22T11:30:00.000Z',
  },
  {
    id: 'q_rob_003',
    questionText: 'Which of the following statements regarding Extended Kalman Filter (EKF) vs Unscented Kalman Filter (UKF) in non-linear robot localization is TRUE?',
    type: 'single_mcq',
    difficulty: 'medium',
    field: 'Robotics',
    subject: 'Probabilistic Robotics',
    chapter: 'Spatial Localization',
    topic: 'Non-Linear State Estimation',
    options: [
      'EKF approximates probability distributions using deterministic sigma points, avoiding Taylor series expansions',
      'EKF linearizes non-linear motion and observation functions using first-order Taylor expansion (Jacobians), which can lead to divergence under high non-linearity, whereas UKF propagates sigma points through the true non-linear function',
      'UKF requires calculating complex analytical Jacobian matrices for both state transition and sensor measurement models',
      'EKF is mathematically exact for arbitrary multimodal non-Gaussian posterior distributions',
    ],
    correctAnswer: '1',
    explanation: 'EKF relies on calculating Jacobian matrices to linearize non-linear equations around the current estimate via first-order Taylor series. The UKF instead uses the Unscented Transform with carefully chosen sigma points propagated directly through the non-linear functions, achieving second-order accuracy without computing Jacobians.',
    distractorExplanations: {
      '0': 'Sigma points are the core technique of UKF, not EKF.',
      '2': 'UKF is derivative-free; only EKF requires analytical Jacobians.',
      '3': 'Neither EKF nor UKF handles multimodal distributions; Particle Filters (Monte Carlo Localization) are required for multimodal posteriors.',
    },
    relatedConcepts: ['Unscented Transform', 'Jacobian Linearization', 'Monte Carlo Localization', 'Covariance Propagation'],
    sourceType: 'curriculum',
    isAiGenerated: true,
    createdAt: '2026-09-23T14:15:00.000Z',
  },
  {
    id: 'q_sec_004',
    questionText: 'When crafting a Return-Oriented Programming (ROP) exploit on a 64-bit Linux binary with NX (No-Execute) enabled, what convention governs how arguments are passed to functions like system("/bin/sh")?',
    type: 'single_mcq',
    difficulty: 'hard',
    field: 'Cybersecurity',
    subject: 'Binary Exploitation',
    chapter: 'Memory Corruptions',
    topic: 'ROP Chains in x86_64',
    options: [
      'All arguments are pushed directly onto the stack in reverse order right before the CALL instruction',
      'The first argument must be placed into the RDI register using a "pop rdi; ret" gadget before jumping to the function address',
      'The first argument is placed in RAX and the syscall number is passed in RBX',
      'Arguments are passed via the segment registers DS and ES',
    ],
    correctAnswer: '1',
    explanation: 'System V AMD64 ABI convention specifies that the first six integer/pointer arguments are passed in registers: RDI, RSI, RDX, RCX, R8, and R9. To invoke system(const char *cmd), the address of "/bin/sh" must be loaded into RDI via a "pop rdi; ret" gadget before returning to system.',
    distractorExplanations: {
      '0': 'Passing arguments on the stack is the 32-bit x86 cdecl convention, not 64-bit System V ABI.',
      '2': 'RAX holds the syscall number in raw syscalls, not in standard library function calls like system().',
      '3': 'Segment registers are rarely used in modern 64-bit userland calling conventions.',
    },
    relatedConcepts: ['System V ABI', 'Gadgets', 'Return-to-libc', 'Stack Alignment (16-byte)'],
    sourceType: 'pyq',
    isAiGenerated: false,
    pyqYear: 2025,
    createdAt: '2026-09-24T16:00:00.000Z',
  },
];

const DEFAULT_QUESTION_PACKS: QuestionPack[] = [
  {
    id: 'pack_ai_core_20',
    title: 'Transformer Mechanics & High-Performance AI Pack',
    description: '20 rigorous conceptual and mathematical questions testing attention scaling, KV caching, and kernel tiling.',
    field: 'Artificial Intelligence',
    questionCount: 20,
    difficulty: 'hard',
    questions: DEFAULT_QUESTIONS.slice(0, 2),
    category: 'quick_20',
    createdAt: '2026-09-25T10:00:00.000Z',
    highScore: 85,
  },
  {
    id: 'pack_weak_topics_01',
    title: 'Adaptive Recovery: Weak Topics & Mistakes Pack',
    description: 'Targeted reinforcement for Spatial Rotations, SO(3) Lie Algebra, and ROP Gadgets.',
    field: 'Cross-Domain Recovery',
    questionCount: 15,
    difficulty: 'mixed',
    questions: [DEFAULT_QUESTIONS[1], DEFAULT_QUESTIONS[2], DEFAULT_QUESTIONS[3]],
    category: 'weak_topics',
    createdAt: '2026-09-26T12:00:00.000Z',
  },
];

const DEFAULT_DAILY_PLAN: DailyPlan = {
  date: new Date().toISOString().split('T')[0],
  items: [
    {
      id: 'plan_item_1',
      title: 'Study FlashAttention-2 Forward Pass derivation and memory bandwidth arithmetic',
      category: 'learn',
      targetMinutes: 60,
      completedMinutes: 60,
      isCompleted: true,
      relatedDocId: 'res_ai_handbook_01',
      notes: 'Reviewed SRAM tiling equations; ready for practice.',
    },
    {
      id: 'plan_item_2',
      title: 'Practice 20-Question Pack: Attention & Transformer Scaling',
      category: 'practice',
      targetMinutes: 45,
      completedMinutes: 45,
      isCompleted: true,
    },
    {
      id: 'plan_item_3',
      title: 'Recovery Revision: Quaternions and SE(3) Transform matrices (Weak Topic)',
      category: 'revision',
      targetMinutes: 30,
      completedMinutes: 10,
      isCompleted: false,
      notes: 'Need to review Euler angle gimbal lock singularity comparison.',
    },
    {
      id: 'plan_item_4',
      title: 'NEXORA: Implement sensor fusion node in ROS2 simulation workspace',
      category: 'project',
      targetMinutes: 75,
      completedMinutes: 0,
      isCompleted: false,
    },
  ],
  overallStatus: 'pending',
};

const DEFAULT_INTENSITY_LOCK: IntensityLock = {
  mode: 'cheetah',
  lockedUntil: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
  lockDurationDays: 7,
  reason: 'Committed to accelerate deep learning & robotics system deployment ahead of milestone 1.',
  isLocked: true,
};

const DEFAULT_NEXORA_PROJECTS: NexoraProject[] = [
  {
    id: 'nex_proj_01',
    name: 'Project Aether: Autonomous Vision-Language-Action (VLA) Quadruped',
    tagline: 'Edge-native embodiment with sub-100ms sensory-motor policy loop.',
    domain: 'robotics',
    status: 'in_development',
    progressPercentage: 64,
    summary: 'Building a quadruped robotic testbed running an integrated visual perception, topological map generator, and real-time obstacle avoidance policy using Jetson Orin Nano.',
    architectureDetails: 'Perception: Stereo RealSense D435i + micro-ROS. Policy: PyTorch 2.4 quantized INT8 engine. Simulation: Isaac Sim with domain randomization.',
    milestones: [
      { id: 'm1', title: 'URDF model validation & torque limit simulation', deadline: '2026-10-20', isDone: true },
      { id: 'm2', title: 'Terrain classification with depth CNN', deadline: '2026-11-15', isDone: true },
      { id: 'm3', title: 'Real-time gait control on physical hardware', deadline: '2027-01-10', isDone: false },
    ],
    tasks: [
      { id: 't1', title: 'Calibrate IMU zero-drift offset in ROS2 node', priority: 'high', isDone: true },
      { id: 't2', title: 'Benchmark TensorRT latency on Jetson Orin', priority: 'critical', isDone: false },
      { id: 't3', title: 'Test obstacle avoidance in dynamic room corridor', priority: 'medium', isDone: false },
    ],
    experiments: [
      { id: 'e1', hypothesis: 'Quantizing policy weights from FP16 to INT8 reduces inference latency by 45% with <2% gait drift.', result: 'Verified: Latency dropped from 28ms to 14.2ms with unnoticeable trajectory deviation.', status: 'successful' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nex_proj_02',
    name: 'ZeroShield: Autonomous Vulnerability Discovery Engine',
    tagline: 'AI-guided hybrid fuzzing and symbolic execution for C/C++ libraries.',
    domain: 'cybersecurity',
    status: 'concept',
    progressPercentage: 35,
    summary: 'Developing an automated fuzzing harness that uses LLM semantic analysis of source code to generate structured test cases targeting edge conditions in memory parsers.',
    architectureDetails: 'Engine: AFL++ integrated with LLM prompt feedback loop for seed corpus mutator.',
    milestones: [
      { id: 'zm1', title: 'Build harness for image decoder benchmarks (libpng/libjpeg)', deadline: '2026-11-30', isDone: true },
      { id: 'zm2', title: 'Autonomous crash triage & ROP chain feasibility analyzer', deadline: '2027-02-15', isDone: false },
    ],
    tasks: [
      { id: 'zt1', title: 'Implement ASan (AddressSanitizer) trace parser', priority: 'high', isDone: false },
    ],
    experiments: [],
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_INTEGRATIONS: ExternalIntegration[] = [
  {
    id: 'int_gemini',
    name: 'Google Gemini AI',
    provider: 'gemini',
    status: 'connected',
    description: 'Server-side high-throughput reasoning, search grounding, and speech processing via official @google/genai SDK.',
    icon: 'Sparkles',
    capabilities: ['gemini-3.1-pro-preview with HIGH Thinking', 'gemini-3.5-flash Grounded Research', 'gemini-3.1-flash-lite Fast Responses', 'gemini-3.8-flash-lite-tts Voice Synthesis'],
    lastSyncedAt: new Date().toISOString(),
    notes: 'Configured securely via server environment.',
  },
  {
    id: 'int_openai',
    name: 'OpenAI / ChatGPT Adapter',
    provider: 'openai',
    status: 'configured',
    description: 'Official connector architecture for user-provided API credentials or custom model routing.',
    icon: 'Cpu',
    capabilities: ['Multi-turn Assistant Routing', 'Context Isolation', 'Model Choice Adapter'],
    notes: 'Ready for user API key in Settings > AI Connections.',
  },
  {
    id: 'int_notebooklm',
    name: 'NotebookLM & Research Export',
    provider: 'notebooklm',
    status: 'available_via_export',
    description: 'Structured markdown, source citation, and note package exporter compatible with Google NotebookLM workflows.',
    icon: 'BookOpen',
    capabilities: ['Structured Knowledge Export', 'Source Citations Package', 'One-Click Note Export'],
    notes: 'Direct public API not currently provided by Google; export workflow fully active.',
  },
  {
    id: 'int_firebase',
    name: 'Firebase Auth & Cloud Storage',
    provider: 'firebase',
    status: 'configured',
    description: 'Google Sign-in and persistent user database storage architecture.',
    icon: 'Database',
    capabilities: ['Google Identity Sign-in', 'Firestore User-Data Isolation', 'Multi-Device Sync'],
    notes: 'Offline-first persistence active; cloud sync available.',
  },
  {
    id: 'int_workspace',
    name: 'Google Workspace Connections',
    provider: 'google_workspace',
    status: 'configured',
    description: 'Connectors for Google Calendar (study schedules), Google Tasks, Google Drive, Google Docs & Keep.',
    icon: 'Globe',
    capabilities: ['Calendar Sync', 'Drive Resource Import', 'Tasks & Reminders'],
    notes: 'Client-side OAuth ready.',
  },
];

const DEFAULT_LYRA_MESSAGES: LyraMessage[] = [
  {
    id: 'msg_01',
    role: 'assistant',
    content: `Hello Alex! I am LYRA, your personal AI operating system. 🌟

I have analyzed your active goal: **AI & Robotics Systems Architect**. 

Here is where you stand today:
• **Success Track Status:** 🟢 Green (On Track)
• **Current Focus:** FlashAttention & KV Caching algorithms, and Quaternion spatial geometry
• **Weak Area to reinforce:** SO(3) & Lie Algebra rotations (45% mastery)
• **Intensity Mode:** Cheetah (4 hrs/day committed)

What would you like to accomplish today? You can ask me to solve a problem, generate a 20-question practice test, analyze an uploaded PDF, or review your schedule!`,
    timestamp: new Date().toISOString(),
    modelUsed: 'gemini-3.5-flash',
    suggestedActions: [
      { label: 'Start 20-Question Practice', actionType: 'START_PRACTICE', payload: { packId: 'pack_ai_core_20' } },
      { label: 'Review Weak Topic (Quaternions)', actionType: 'NAVIGATE', payload: { view: 'revision' } },
      { label: 'Explore Uploaded Documents', actionType: 'NAVIGATE', payload: { view: 'resources' } },
      { label: 'Launch Voice Call with LYRA', actionType: 'START_VOICE_CALL' },
    ],
  },
];

const DEFAULT_LYRA_DOCUMENTS: LyraDocument[] = [
  {
    id: 'ldoc_01',
    title: 'FlashAttention-2 Memory Tiling & Online Softmax Guide',
    docType: 'study_guide',
    content: `# FlashAttention-2 Derivation & Kernel Tiling Notes
*Author: LYRA AI Studio Studio*
*Goal Reference: AI & Robotics Systems Architect*

## 1. Executive Summary
Standard scaled dot-product attention scales quadratically with sequence length $O(N^2 d)$. Standard GPU attention materializes the intermediate $N \times N$ attention matrix in High Bandwidth Memory (HBM), resulting in severe IO memory bottlenecks.

## 2. FlashAttention-2 Core Axiom
By tiling query, key, and value matrices into blocks that fit within fast on-chip SRAM (approx. 192KB per Streaming Multiprocessor), FlashAttention eliminates redundant memory transfers using the **Online Softmax** incremental rescaling algorithm.

### Online Softmax Algorithm:
For blocks $B_1, B_2$:
$$m_{\text{new}} = \max(m_{\text{prev}}, m_{\text{curr}})$$
$$P_{\text{scaled}} = e^{S - m_{\text{new}}}$$
$$l_{\text{new}} = e^{m_{\text{prev}} - m_{\text{new}}} l_{\text{prev}} + \sum P_{\text{scaled}}$$

## 3. Practical Implications
1. 2x to 4x wall-clock training speedup on modern GPUs (H100/A100).
2. Enables 16k–128k sequence length context windows without Out-of-Memory (OOM) failures.
3. Essential building block for modern Large Language Models and Vision-Language-Action policies.`,
    tags: ['AI/ML', 'GPU Architecture', 'Transformers'],
    createdAt: '2026-09-28T14:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ldoc_02',
    title: 'Autonomous Mobile Robotics: Kinematics & SLAM Syllabus Blueprint',
    docType: 'syllabus',
    content: `# Master Syllabus: Autonomous Mobile Robotics
*Generated by LYRA AI Operating System*

### Module 1: Spatial Geometry & Transformations (Weeks 1–3)
- Rotation Matrices, Euler Angles, and Gimbal Lock Singularities
- Quaternions, Lie Algebra $SO(3)$ and $SE(3)$ Transformations
- Forward and Inverse Kinematics for Differential Drive and Omnidirectional Bases

### Module 2: State Estimation & Probabilistic Robotics (Weeks 4–7)
- Multivariate Gaussian Filtering and Covariance Propagation
- Extended Kalman Filter (EKF) Localization with Odometry and IMU
- Unscented Kalman Filter (UKF) and Particle Filters (Monte Carlo Localization)

### Module 3: Simultaneous Localization & Mapping (SLAM) (Weeks 8–11)
- 2D LiDAR Graph SLAM & Loop Closure Detection
- Visual SLAM: Feature-based (ORB-SLAM) vs Direct Formulations
- Point Cloud Processing with PCL and Voxel Downsampling

### Module 4: Trajectory Planning & Real-Time Control (Weeks 12–14)
- Global Planners: $A^*$ and $RRT^*$ (Rapidly-exploring Random Trees)
- Local Planners: Dynamic Window Approach (DWA) & TEB Local Planner
- Model Predictive Control (MPC) on NVIDIA Jetson Edge Hardware`,
    tags: ['Robotics', 'Curriculum', 'SLAM'],
    createdAt: '2026-09-29T10:30:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_LYRA_TASKS: LyraTask[] = [
  {
    id: 'task_01',
    title: 'Synthesize Attention Mechanism Knowledge Map',
    description: 'Deep hierarchical breakdown of GPU SRAM tiling, FlashAttention-2, and online softmax.',
    status: 'completed',
    progress: 100,
    resultSummary: 'Synthesized 3 core chapters, 12 topics, and 4 prerequisite dependencies.',
    createdAt: '2026-09-27T08:00:00.000Z',
    completedAt: '2026-09-27T08:02:15.000Z',
  },
  {
    id: 'task_02',
    title: 'Autonomous Curriculum & Practice Bank Cross-Correlation',
    description: 'Cross-correlate uploaded Robotics syllabus with 50-Question Practice Bank.',
    status: 'completed',
    progress: 100,
    resultSummary: 'Mapped 15 practice questions to spatial transformation modules.',
    createdAt: '2026-09-29T11:00:00.000Z',
    completedAt: '2026-09-29T11:01:45.000Z',
  },
  {
    id: 'task_03',
    title: 'Deep Research: Lie Algebra & Quaternions in Robotics Perception',
    description: 'High-reasoning synthesis of non-linear state estimation and singular value decomposition.',
    status: 'running',
    progress: 68,
    resultSummary: 'Evaluating first-order Taylor expansion vs sigma points.',
    isDeepThinking: true,
    createdAt: new Date().toISOString(),
  },
];

// Helper to read / write
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notify();
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

// Public API
export const StorageService = {
  getUserProfile(): UserProfile {
    return load<UserProfile>(KEYS.USER, DEFAULT_USER);
  },
  saveUserProfile(profile: UserProfile) {
    save(KEYS.USER, profile);
  },

  getPermissions(): AppPermissions {
    return load<AppPermissions>(KEYS.PERMISSIONS, DEFAULT_PERMISSIONS);
  },
  savePermissions(perms: AppPermissions) {
    save(KEYS.PERMISSIONS, perms);
  },

  getGoals(): Goal[] {
    return load<Goal[]>(KEYS.GOALS, DEFAULT_GOALS);
  },
  saveGoals(goals: Goal[]) {
    save(KEYS.GOALS, goals);
  },
  getActiveGoal(): Goal {
    const goals = this.getGoals();
    const activeId = localStorage.getItem(KEYS.ACTIVE_GOAL_ID);
    const found = goals.find((g) => g.id === activeId);
    return found || goals[0] || DEFAULT_GOALS[0];
  },
  setActiveGoalId(id: string) {
    localStorage.setItem(KEYS.ACTIVE_GOAL_ID, id);
    notify();
  },
  addGoal(goal: Goal) {
    const goals = this.getGoals();
    const updated = [goal, ...goals];
    this.saveGoals(updated);
    this.setActiveGoalId(goal.id);
  },
  updateGoal(updatedGoal: Goal) {
    const goals = this.getGoals().map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
    this.saveGoals(goals);
  },
  deleteGoal(id: string) {
    const goals = this.getGoals().filter((g) => g.id !== id);
    this.saveGoals(goals);
  },

  getResources(): ResourceDocument[] {
    return load<ResourceDocument[]>(KEYS.RESOURCES, DEFAULT_RESOURCES);
  },
  saveResources(resources: ResourceDocument[]) {
    save(KEYS.RESOURCES, resources);
  },
  addResource(resource: ResourceDocument) {
    const resources = [resource, ...this.getResources()];
    this.saveResources(resources);
  },
  deleteResource(id: string) {
    const resources = this.getResources().filter((r) => r.id !== id);
    this.saveResources(resources);
  },

  getQuestions(): Question[] {
    return load<Question[]>(KEYS.QUESTIONS, DEFAULT_QUESTIONS);
  },
  saveQuestions(questions: Question[]) {
    save(KEYS.QUESTIONS, questions);
  },
  addQuestions(newQuestions: Question[]) {
    const existing = this.getQuestions();
    const combined = [...newQuestions, ...existing];
    this.saveQuestions(combined);
  },

  getQuestionPacks(): QuestionPack[] {
    return load<QuestionPack[]>(KEYS.QUESTION_PACKS, DEFAULT_QUESTION_PACKS);
  },
  saveQuestionPacks(packs: QuestionPack[]) {
    save(KEYS.QUESTION_PACKS, packs);
  },
  addQuestionPack(pack: QuestionPack) {
    const packs = [pack, ...this.getQuestionPacks()];
    this.saveQuestionPacks(packs);
  },

  getAttempts(): QuestionAttempt[] {
    return load<QuestionAttempt[]>(KEYS.ATTEMPTS, []);
  },
  recordAttempt(attempt: QuestionAttempt) {
    const attempts = [attempt, ...this.getAttempts()];
    save(KEYS.ATTEMPTS, attempts);
  },

  getSavedQuestionIds(): string[] {
    return load<string[]>(KEYS.SAVED_QUESTION_IDS, ['q_dl_002']);
  },
  toggleSaveQuestion(id: string) {
    const saved = new Set(this.getSavedQuestionIds());
    if (saved.has(id)) {
      saved.delete(id);
    } else {
      saved.add(id);
    }
    save(KEYS.SAVED_QUESTION_IDS, Array.from(saved));
  },

  getDailyPlan(): DailyPlan {
    const today = new Date().toISOString().split('T')[0];
    const plans = load<Record<string, DailyPlan>>(KEYS.DAILY_PLANS, { [today]: DEFAULT_DAILY_PLAN });
    if (!plans[today]) {
      plans[today] = { ...DEFAULT_DAILY_PLAN, date: today };
      save(KEYS.DAILY_PLANS, plans);
    }
    return plans[today];
  },
  saveDailyPlan(plan: DailyPlan) {
    const plans = load<Record<string, DailyPlan>>(KEYS.DAILY_PLANS, {});
    plans[plan.date] = plan;
    save(KEYS.DAILY_PLANS, plans);
  },

  getIntensityLock(): IntensityLock {
    return load<IntensityLock>(KEYS.INTENSITY_LOCK, DEFAULT_INTENSITY_LOCK);
  },
  saveIntensityLock(lock: IntensityLock) {
    save(KEYS.INTENSITY_LOCK, lock);
  },

  getLyraMessages(): LyraMessage[] {
    return load<LyraMessage[]>(KEYS.LYRA_MESSAGES, DEFAULT_LYRA_MESSAGES);
  },
  addLyraMessage(msg: LyraMessage) {
    const messages = [...this.getLyraMessages(), msg];
    save(KEYS.LYRA_MESSAGES, messages);
  },
  clearLyraMessages() {
    save(KEYS.LYRA_MESSAGES, DEFAULT_LYRA_MESSAGES);
  },

  getNexoraProjects(): NexoraProject[] {
    return load<NexoraProject[]>(KEYS.NEXORA_PROJECTS, DEFAULT_NEXORA_PROJECTS);
  },
  saveNexoraProjects(projects: NexoraProject[]) {
    save(KEYS.NEXORA_PROJECTS, projects);
  },
  addNexoraProject(proj: NexoraProject) {
    const projects = [proj, ...this.getNexoraProjects()];
    this.saveNexoraProjects(projects);
  },

  getIntegrations(): ExternalIntegration[] {
    return load<ExternalIntegration[]>(KEYS.INTEGRATIONS, DEFAULT_INTEGRATIONS);
  },
  updateIntegration(updated: ExternalIntegration) {
    const integrations = this.getIntegrations().map((i) => (i.id === updated.id ? updated : i));
    save(KEYS.INTEGRATIONS, integrations);
  },

  getLyraDocuments(): LyraDocument[] {
    return load<LyraDocument[]>(KEYS.LYRA_DOCUMENTS, DEFAULT_LYRA_DOCUMENTS);
  },
  saveLyraDocuments(docs: LyraDocument[]) {
    save(KEYS.LYRA_DOCUMENTS, docs);
  },
  addLyraDocument(doc: LyraDocument) {
    const docs = [doc, ...this.getLyraDocuments()];
    this.saveLyraDocuments(docs);
  },
  updateLyraDocument(updated: LyraDocument) {
    const docs = this.getLyraDocuments().map((d) => (d.id === updated.id ? updated : d));
    this.saveLyraDocuments(docs);
  },
  deleteLyraDocument(id: string) {
    const docs = this.getLyraDocuments().filter((d) => d.id !== id);
    this.saveLyraDocuments(docs);
  },

  getLyraTasks(): LyraTask[] {
    return load<LyraTask[]>(KEYS.LYRA_TASKS, DEFAULT_LYRA_TASKS);
  },
  saveLyraTasks(tasks: LyraTask[]) {
    save(KEYS.LYRA_TASKS, tasks);
  },
  addLyraTask(task: LyraTask) {
    const tasks = [task, ...this.getLyraTasks()];
    this.saveLyraTasks(tasks);
  },
  updateLyraTask(updated: LyraTask) {
    const tasks = this.getLyraTasks().map((t) => (t.id === updated.id ? updated : t));
    this.saveLyraTasks(tasks);
  },

  getLyraActions(): PendingLyraAction[] {
    return load<PendingLyraAction[]>(KEYS.LYRA_ACTIONS, []);
  },
  saveLyraActions(actions: PendingLyraAction[]) {
    save(KEYS.LYRA_ACTIONS, actions);
  },
  addLyraAction(action: PendingLyraAction) {
    const actions = [action, ...this.getLyraActions()];
    this.saveLyraActions(actions);
  },

  getVoiceSettings(): LyraVoiceSettings {
    return load<LyraVoiceSettings>(KEYS.VOICE_SETTINGS, {
      persona: 'sweet_fairy',
      pitch: 1.25,
      rate: 1.0,
      volume: 1.0,
      language: 'auto',
    });
  },
  saveVoiceSettings(settings: LyraVoiceSettings) {
    save(KEYS.VOICE_SETTINGS, settings);
  },

  resetAllData() {
    localStorage.clear();
    notify();
  },
};
