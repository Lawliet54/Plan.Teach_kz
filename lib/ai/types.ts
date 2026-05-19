import type { Profile, StudentLevel } from "@/lib/types";

// ============================================================================
// AI Service Types
// ============================================================================

export type HintLevel = 1 | 2 | 3 | 4;

export type AiChat = {
  id: string;
  student_id: string;
  topic_id: string | null;
  title: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
};

export type AiChatMessage = {
  id: string;
  chat_id: string;
  student_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  intent: string | null;
  created_at: string;
};

export type AiTaskHint = {
  id: string;
  student_id: string;
  task_id: string;
  hint_level: HintLevel;
  hint_text: string;
  created_at: string;
};

export type AiSolutionReview = {
  id: string;
  student_id: string;
  task_id: string;
  attempt_id: string | null;
  input_text: string;
  formula_feedback: string | null;
  unit_feedback: string | null;
  logic_feedback: string | null;
  final_answer_feedback: string | null;
  overall_feedback: string | null;
  score: number | null;
  created_at: string;
};

export type AiRouteRecommendation = {
  id: string;
  student_id: string;
  diagnostic_result_id: string | null;
  level: StudentLevel | null;
  weak_topics: string[];
  strong_topics: string[];
  interests: string[];
  recommended_topics: string[];
  recommended_tasks: string[];
  summary: string | null;
  created_at: string;
  updated_at: string;
};

export type AiStudentMemory = {
  id: string;
  student_id: string;
  memory_key: string;
  memory_value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// AI Request/Response Types
// ============================================================================

export type GenerateTopicTutorParams = {
  profile: Profile;
  topic: { id: string; title: string };
  contents: Array<{ content_type: string; content_text: string }>;
  chatHistory: AiChatMessage[];
  userMessage: string;
};

export type GenerateTaskHintParams = {
  profile: Profile;
  task: {
    id: string;
    title: string;
    body: string;
    answer_type: string;
    difficulty: string;
  };
  hintLevel: HintLevel;
};

export type AnalyzeSolutionParams = {
  profile: Profile;
  task: {
    id: string;
    title: string;
    answer_type: string;
    correct_answer: string | null;
    solution: string | null;
  };
  answerText: string;
};

export type GenerateDiagnosticSummaryParams = {
  profile: Profile;
  diagnosticResult: {
    id: string;
    grade_score: number;
  };
  gradeScores: Record<string, { correct: number; total: number }>;
  weakTopics: string[];
  strongTopics: string[];
};

export type GenerateRouteRecommendationParams = {
  profile: Profile;
  diagnosticResult: {
    id: string;
    grade_score: number;
  };
  interests: string[];
  topics: Array<{ id: string; title: string; grade: number }>;
  tasks: Array<{ id: string; title: string; difficulty: string }>;
};

// ============================================================================
// AI Provider Config
// ============================================================================

export type AiProviderType = "openai" | "local";

export type AiServiceConfig = {
  provider: AiProviderType;
  model?: string;
  apiKey?: string;
};

// ============================================================================
// AI Response
// ============================================================================

export type AiResponse = {
  content: string;
  confidence?: number;
  sourceType: "openai" | "local";
  timestamp: string;
};
