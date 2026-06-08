export const assessmentResponseSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["bjb", "tjb"],
    },
    title: {
      type: "string",
    },
    grade: {
      type: "integer",
    },
    term: {
      type: "string",
    },
    section: {
      type: "string",
    },
    sections: {
      type: "array",
      items: {
        type: "string",
      },
    },
    learningObjectives: {
      type: "array",
      items: {
        type: "string",
      },
    },
    assessmentCriteria: {
      type: "array",
      items: {
        type: "string",
      },
    },
    thinkingSkills: {
      type: "array",
      items: {
        type: "string",
      },
    },
    durationMinutes: {
      type: "integer",
    },
    instructions: {
      type: "array",
      items: {
        type: "string",
      },
    },
    specification: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: { type: "string" },
          learningObjectives: { type: "string" },
          thinkingSkills: { type: "string" },
          taskCount: { type: "integer" },
          taskNumbers: { type: "string" },
          taskTypes: { type: "string" },
          durationMinutes: { type: "integer" },
          points: { type: "integer" },
        },
        required: [
          "section",
          "learningObjectives",
          "thinkingSkills",
          "taskCount",
          "taskNumbers",
          "taskTypes",
          "durationMinutes",
          "points",
        ],
      },
    },
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "string" },
          title: { type: "string" },
          prompt: { type: "string" },
          points: { type: "integer" },
          answer: { type: "string" },
          descriptors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                points: { type: "integer" },
              },
              required: ["text", "points"],
            },
          },
        },
        required: [
          "number",
          "title",
          "prompt",
          "points",
          "answer",
          "descriptors",
        ],
      },
    },
    totalPoints: {
      type: "integer",
    },
    answerKey: {
      type: "array",
      items: {
        type: "object",
        properties: {
          taskNumber: { type: "string" },
          answer: { type: "string" },
          points: { type: "integer" },
          notes: { type: "string" },
        },
        required: ["taskNumber", "answer", "points", "notes"],
      },
    },
    rubric: {
      type: "array",
      items: {
        type: "object",
        properties: {
          criterion: { type: "string" },
          low: { type: "string" },
          medium: { type: "string" },
          high: { type: "string" },
        },
        required: ["criterion", "low", "medium", "high"],
      },
    },
    qualityChecks: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: [
    "type",
    "title",
    "grade",
    "term",
    "section",
    "sections",
    "learningObjectives",
    "assessmentCriteria",
    "thinkingSkills",
    "durationMinutes",
    "instructions",
    "specification",
    "tasks",
    "totalPoints",
    "answerKey",
    "rubric",
    "qualityChecks",
  ],
} as const;
