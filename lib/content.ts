import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LearningSection = {
  id: string;
  grade: number;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
};

export type Topic = {
  id: string;
  grade: number;
  section_id: string | null;
  title: string;
  normalized_title: string;
  slug: string;
  description: string | null;
  ktz_order: number | null;
  hours: number;
  content_type: "lesson" | "placeholder";
  content_status: "ready" | "partial" | "placeholder";
  level: "beginner" | "intermediate" | "advanced";
  has_bjb: boolean;
  source_note: string | null;
  is_active: boolean;
};

export type TopicContent = {
  id: string;
  topic_id: string;
  block_type: "theory" | "formula" | "example" | "video" | "ai_prompt" | "note";
  title: string | null;
  body: string | null;
  media_url: string | null;
  order_index: number;
  is_active: boolean;
};

export type Lab = {
  id: string;
  grade: number;
  topic_id: string | null;
  title: string;
  normalized_title: string;
  slug: string;
  description: string | null;
  instruction: string | null;
  requires_table: boolean;
  requires_graph: boolean;
  requires_conclusion: boolean;
  content_status: "ready" | "partial" | "placeholder";
  order_index: number;
};

export type ProjectTask = {
  id: string;
  grade: number;
  topic_id: string | null;
  title: string;
  normalized_title: string;
  slug: string;
  description: string | null;
  instruction: string | null;
  submission_type: "text" | "file" | "image" | "mixed";
  content_status: "ready" | "partial" | "placeholder";
  max_score: number;
  order_index: number;
};

export async function getLearningSections(grade?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("learning_sections")
    .select("*")
    .eq("is_active", true)
    .order("grade", { ascending: true })
    .order("order_index", { ascending: true });

  if (grade) {
    query = query.eq("grade", grade);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data as LearningSection[];
}

export async function getTopics(grade?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("topics")
    .select("*")
    .eq("is_active", true)
    .order("grade", { ascending: true })
    .order("ktz_order", { ascending: true });

  if (grade) {
    query = query.eq("grade", grade);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data as Topic[];
}

export async function getTopicBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Topic;
}

export async function getTopicContents(topicId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("topic_contents")
    .select("*")
    .eq("topic_id", topicId)
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as TopicContent[];
}

export async function getLabs(grade?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("labs")
    .select("*")
    .eq("is_active", true)
    .order("grade", { ascending: true })
    .order("order_index", { ascending: true });

  if (grade) {
    query = query.eq("grade", grade);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data as Lab[];
}

export async function getProjectTasks(grade?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("project_tasks")
    .select("*")
    .eq("is_active", true)
    .order("grade", { ascending: true })
    .order("order_index", { ascending: true });

  if (grade) {
    query = query.eq("grade", grade);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data as ProjectTask[];
}
export type TopicObjective = {
  id: string;
  topic_id: string;
  objective_code: string | null;
  objective_text: string;
  created_at: string;
};

export async function getTopicObjectives(topicId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("topic_objectives")
    .select("*")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as TopicObjective[];
}

export async function getSectionsWithTopics(grade?: number) {
  const sections = await getLearningSections(grade);
  const topics = await getTopics(grade);

  return sections.map((section) => ({
    ...section,
    topics: topics.filter((topic) => topic.section_id === section.id),
  }));
}

export const coreTopicSlugs = [
  "core-physics-phenomena",
  "core-measurement-units",
  "core-speed-motion",
  "core-density",
  "core-pressure",
];

export type TopicLevel = "beginner" | "intermediate" | "advanced";

export function normalizeStudentLevel(level?: string | null): TopicLevel {
  if (level === "advanced") return "advanced";
  if (level === "intermediate") return "intermediate";
  return "beginner";
}

export function getStudentLevelLabel(level?: string | null) {
  if (level === "advanced") return "Жоғары деңгей";
  if (level === "intermediate") return "Орта деңгей";
  return "Бастапқы деңгей";
}

export async function getCoreReadyTopics() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .in("slug", coreTopicSlugs)
    .eq("is_active", true)
    .eq("content_status", "ready")
    .order("ktz_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Topic[];
}

export async function getTopicContentsForLevel(
  topicId: string,
  level?: string | null
) {
  const safeLevel = normalizeStudentLevel(level);

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("topic_contents")
    .select("*")
    .eq("topic_id", topicId)
    .eq("is_active", true)
    .in("target_level", ["all", safeLevel])
    .order("order_index", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as (TopicContent & {
    target_level: "all" | "beginner" | "intermediate" | "advanced";
  })[];
}