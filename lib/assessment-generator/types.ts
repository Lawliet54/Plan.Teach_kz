export type AssessmentType = "bjb" | "tjb";

export type AssessmentDescriptor = {
  text: string;
  points: number;
};

export type AssessmentTask = {
  number: string;
  title: string;
  prompt: string;
  points: number;
  answer: string;
  descriptors: AssessmentDescriptor[];
};

export type AssessmentSpecificationRow = {
  section: string;
  learningObjectives: string;
  thinkingSkills: string;
  taskCount: number;
  taskNumbers: string;
  taskTypes: string;
  durationMinutes: number;
  points: number;
};

export type AssessmentAnswerRow = {
  taskNumber: string;
  answer: string;
  points: number;
  notes: string;
};

export type AssessmentRubricRow = {
  criterion: string;
  low: string;
  medium: string;
  high: string;
};

export type AssessmentDocument = {
  type: AssessmentType;
  title: string;
  grade: number;
  term: string;
  section: string;
  sections: string[];
  learningObjectives: string[];
  assessmentCriteria: string[];
  thinkingSkills: string[];
  durationMinutes: number;
  instructions: string[];
  specification: AssessmentSpecificationRow[];
  tasks: AssessmentTask[];
  totalPoints: number;
  answerKey: AssessmentAnswerRow[];
  rubric: AssessmentRubricRow[];
  qualityChecks: string[];
};

export type AssessmentGeneratorRequest = {
  type: AssessmentType;
  grade: number;
  term: string;
  section: string;
  learningObjectives: string[];
  taskCount: number;
  totalPoints: number;
  durationMinutes: number;
  additionalRequirements: string;
};
