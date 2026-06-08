export type AdaptiveDifficulty = "basic" | "intermediate" | "advanced";
export type AdaptiveAction =
  | "advance_level"
  | "open_next_topic"
  | "continue_same_level"
  | "show_remediation"
  | "return_to_prerequisite"
  | "schedule_review"
  | "teacher_attention_required";
export type SkillMasteryState = {
  skillId: string;
  skillCode: string;
  title: string;
  masteryScore: number;
  confidence: number;
  currentLevel: AdaptiveDifficulty;
  totalAttempts: number;
  correctAttempts: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
};
export type MasteryUpdateInput = {
  oldMastery: number;
  isCorrect: boolean;
  difficulty: AdaptiveDifficulty;
  hintCount: number;
  attemptNumber: number;
  skillWeight: number;
};
export type AdaptiveRecommendationInput = {
  finalTopicScore: number;
  criticalSkillMinScore: number;
  prerequisiteMinScore: number;
  totalAttemptsForWeakSkill: number;
  weakSkillScore: number;
  consecutiveWrong: number;
  recentAttemptsCount: number;
};
