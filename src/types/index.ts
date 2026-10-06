/**
 * WHO AM I? — Core Type System
 * Universal data models for goals, dreams, resources, question engine, planning,
 * LYRA AI assistant, themes, and integrations.
 */

export type IntensityMode = 'turtle' | 'rabbit' | 'cheetah' | 'tiger';
export type TrackStatus = 'green' | 'yellow' | 'red';
export type QuestionType =
  | 'single_mcq'
  | 'multi_mcq'
  | 'true_false'
  | 'assertion_reason'
  | 'short_answer'
  | 'numerical'
  | 'coding'
  | 'scenario';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type QuestionSourceType = 'imported_pdf' | 'imported_image' | 'ai_generated' | 'curriculum' | 'pyq' | 'user_created';
export type ProcessingStatus = 'uploading' | 'processing' | 'reading' | 'indexing' | 'ready' | 'partially_processed' | 'failed';

export interface UserProfile {
  id: string;
  name: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  interests: string[];
  learningInterests: string[];
  dreams: string[];
  primaryGoalId?: string;
  targetCareer: string;
  availableHoursPerDay: number;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLanguage: string;
  timezone: string;
  createdAt: string;
  lastActiveAt: string;
  onboardingCompleted: boolean;
}

export interface AppPermissions {
  microphone: 'granted' | 'denied' | 'prompt' | 'unsupported';
  camera: 'granted' | 'denied' | 'prompt' | 'unsupported';
  notifications: 'granted' | 'denied' | 'prompt' | 'unsupported';
  fileAccess: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

export interface GoalMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
  order: number;
}

export interface RequiredSkill {
  id: string;
  name: string;
  category: 'core' | 'technical' | 'tool' | 'foundation';
  currentMastery: number; // 0 to 100
  targetMastery: number;
  subtopics: string[];
}

export interface KnowledgeTopic {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopics: string[];
  prerequisites: string[];
  estimatedHours: number;
  masteryLevel: number; // 0 to 100
  isWeakArea?: boolean;
  status: 'locked' | 'available' | 'in_progress' | 'mastered' | 'needs_revision';
}

export interface Goal {
  id: string;
  title: string;
  dreamStatement: string;
  careerDirection: string;
  field: string;
  status: 'active' | 'completed' | 'paused';
  requiredSkills: RequiredSkill[];
  knowledgeTopics: KnowledgeTopic[];
  milestones: GoalMilestone[];
  targetDeadline: string;
  intensityMode: IntensityMode;
  trackStatus: TrackStatus;
  deviationReason?: string;
  recoverySuggestion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceDocument {
  id: string;
  title: string;
  originalFileName: string;
  fileType: 'pdf' | 'image' | 'text' | 'notes' | 'syllabus' | 'url';
  fileSize: number;
  extractedText: string;
  pageCount?: number;
  summary?: string;
  chapters: {
    number: number;
    title: string;
    summary: string;
    topics: string[];
  }[];
  detectedTopics: string[];
  processingStatus: ProcessingStatus;
  processingProgress: number;
  errorMessage?: string;
  tags: string[];
  sourceUrl?: string;
  uploadedAt: string;
}

export interface Question {
  id: string;
  questionText: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  field: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopic?: string;
  options?: string[]; // For MCQs
  correctAnswer: string; // Option index or text
  correctAnswers?: string[]; // For multi-choice
  explanation: string;
  distractorExplanations?: Record<string, string>;
  relatedConcepts: string[];
  sourceType: QuestionSourceType;
  sourceDocId?: string;
  sourceDocName?: string;
  sourcePage?: number;
  isAiGenerated: boolean;
  pyqYear?: number;
  createdAt: string;
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpentSeconds: number;
  timestamp: string;
  mode: 'practice' | 'quiz' | 'reassessment' | 'revision';
}

export interface QuestionPack {
  id: string;
  title: string;
  description: string;
  field: string;
  questionCount: number;
  difficulty: QuestionDifficulty | 'mixed';
  questions: Question[];
  category: 'quick_20' | 'pack_50' | 'pack_100' | 'chapter' | 'topic' | 'weak_topics' | 'pyq' | 'custom_exam';
  createdAt: string;
  lastAttemptedAt?: string;
  highScore?: number;
}

export interface DailyPlanItem {
  id: string;
  title: string;
  category: 'learn' | 'practice' | 'revision' | 'research' | 'project';
  targetMinutes: number;
  completedMinutes: number;
  isCompleted: boolean;
  topicId?: string;
  relatedDocId?: string;
  notes?: string;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  items: DailyPlanItem[];
  overallStatus: 'pending' | 'completed' | 'missed' | 'rebalanced';
  recoveryNotes?: string;
}

export interface IntensityLock {
  mode: IntensityMode;
  lockedUntil: string; // ISO date
  lockDurationDays: 7 | 30;
  reason: string;
  isLocked: boolean;
}

export interface ReassessmentResult {
  id: string;
  targetMode: IntensityMode;
  totalQuestions: number;
  score: number;
  passed: boolean;
  feedback: string;
  completedAt: string;
}

export interface LyraMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  reasoningText?: string;
  attachedSources?: {
    docName: string;
    pageOrChapter?: string;
    confidence?: number;
  }[];
  suggestedActions?: {
    label: string;
    actionType: string;
    payload?: any;
  }[];
}

export type LyraAssistantMode = 'happy' | 'playful' | 'calm' | 'focused' | 'motivational' | 'serious' | 'adaptive';
export type LyraAvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'typing' | 'completed' | 'error';
export type VoiceConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
export type ActionPermissionLevel = 'read' | 'write' | 'sensitive' | 'destructive';
export type LyraSubTab = 'chat' | 'voice' | 'files' | 'create' | 'questions' | 'actions' | 'tasks';

export interface PendingLyraAction {
  id: string;
  title: string;
  description: string;
  level: ActionPermissionLevel;
  toolName: string;
  payload: any;
  status: 'pending' | 'confirmed' | 'rejected' | 'executed';
  executedResult?: string;
  timestamp: string;
}

export interface LyraTask {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'running' | 'thinking' | 'researching' | 'waiting' | 'completed' | 'failed' | 'needs_attention';
  progress: number;
  resultSummary?: string;
  createdAt: string;
  completedAt?: string;
  isDeepThinking?: boolean;
}

export interface LyraDocument {
  id: string;
  title: string;
  docType: 'note' | 'study_guide' | 'syllabus' | 'question_paper' | 'revision_sheet' | 'report';
  content: string;
  tags: string[];
  sourceDocId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceSettings {
  enabled: boolean;
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  speed: number; // 0.8 to 1.5
  pitch: number;
  volume: number; // 0 to 1
  autoSpeak: boolean;
  pushToTalk: boolean;
}

export interface NexoraProject {
  id: string;
  name: string;
  tagline: string;
  domain: 'ai_ml' | 'robotics' | 'cybersecurity' | 'systems' | 'embedded' | 'quantum' | 'enterprise';
  status: 'concept' | 'in_development' | 'testing' | 'deployed';
  progressPercentage: number;
  summary: string;
  architectureDetails: string;
  milestones: {
    id: string;
    title: string;
    deadline: string;
    isDone: boolean;
  }[];
  tasks: {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    isDone: boolean;
  }[];
  experiments: {
    id: string;
    hypothesis: string;
    result: string;
    status: 'planned' | 'running' | 'successful' | 'inconclusive';
  }[];
  updatedAt: string;
}

export type ThemePreset = 'futuristic' | 'cloud' | 'midnight' | 'minimal-light' | 'deep-space' | 'custom';
export type AnimationIntensity = 'minimal' | 'normal' | 'enhanced';
export type UIDensity = 'compact' | 'comfortable' | 'spacious';

export interface ThemeTokens {
  name: string;
  preset: ThemePreset;
  bgApp: string;
  bgCard: string;
  bgCardHover: string;
  borderCard: string;
  textMain: string;
  textMuted: string;
  textInverted: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  primaryLight: string;
  accent: string;
  accentGlow: string;
  statusGreen: string;
  statusYellow: string;
  statusRed: string;
  borderRadius: string; // e.g. "0.75rem"
  animationIntensity: AnimationIntensity;
  uiDensity: UIDensity;
  isDark: boolean;
  lyraGlowColor: string;
  lyraWandColor: string;
}

export interface ExternalIntegration {
  id: string;
  name: string;
  provider: 'openai' | 'gemini' | 'notebooklm' | 'firebase' | 'google_workspace';
  status: 'connected' | 'configured' | 'available_via_export' | 'not_configured';
  description: string;
  icon: string;
  capabilities: string[];
  lastSyncedAt?: string;
  notes?: string;
}

export interface LyraVoiceSettings {
  persona: 'sweet_fairy' | 'warm_mentor' | 'gentle_calm' | 'clear_guide';
  pitch: number; // 0.8 to 1.6 (default 1.25 for sweet fairy tone)
  rate: number;  // 0.8 to 1.3 (default 1.0)
  volume: number; // 0 to 1 (default 1.0)
  language: 'auto' | 'hi-IN' | 'en-US';
  preferredVoiceName?: string;
}
