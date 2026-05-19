"use server";

import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { aiService } from "@/lib/ai/ai-service";
import type { AiChatMessage } from "@/lib/ai/types";
import { redirect } from "next/navigation";

/**
 * Create or get an active AI chat for a topic
 */
export async function createOrGetTopicChat(topicId: string, topicTitle: string) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can create chats");
  }

  const supabase = await createSupabaseServerClient();

  // Try to find existing active chat for this topic
  const { data: existingChat } = await supabase
    .from("ai_chats")
    .select("id, status")
    .eq("student_id", profile.id)
    .eq("topic_id", topicId)
    .eq("status", "active")
    .maybeSingle();

  if (existingChat) {
    return { id: existingChat.id };
  }

  // Create new chat
  const { data: newChat, error } = await supabase
    .from("ai_chats")
    .insert({
      student_id: profile.id,
      topic_id: topicId,
      title: `Сұхбат: ${topicTitle}`,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create chat: ${error.message}`);
  }

  return { id: newChat.id };
}

/**
 * Send a message to AI tutor and save chat history
 */
export async function sendTopicMessageAction(
  chatId: string,
  userMessage: string,
  topicId: string,
  topicTitle: string,
  contents: Array<{ content_type: string; content_text: string }>
) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can send messages");
  }

  const supabase = await createSupabaseServerClient();

  // Save user message
  const { error: userMsgError } = await supabase
    .from("ai_chat_messages")
    .insert({
      chat_id: chatId,
      student_id: profile.id,
      role: "user",
      content: userMessage,
    });

  if (userMsgError) {
    throw new Error(`Failed to save user message: ${userMsgError.message}`);
  }

  // Get chat history
  const { data: messages } = await supabase
    .from("ai_chat_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  const chatHistory = (messages || []) as AiChatMessage[];

  // Generate AI response
  let aiResponse;
  try {
    aiResponse = await aiService.generateTopicTutorResponse({
      profile,
      topic: { id: topicId, title: topicTitle },
      contents,
      chatHistory,
      userMessage,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    aiResponse = {
      content:
        "Өзіме өхта, қазір AI жұмыс істемейді. Кейін қайталап көріңіз.",
      sourceType: "local" as const,
      timestamp: new Date().toISOString(),
    };
  }

  // Save AI message
  const { error: aiMsgError } = await supabase
    .from("ai_chat_messages")
    .insert({
      chat_id: chatId,
      student_id: profile.id,
      role: "assistant",
      content: aiResponse.content,
    });

  if (aiMsgError) {
    throw new Error(`Failed to save AI message: ${aiMsgError.message}`);
  }

  return {
    message: aiResponse.content,
    sourceType: aiResponse.sourceType,
  };
}

/**
 * Archive a chat
 */
export async function archiveChatAction(chatId: string) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can archive chats");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("ai_chats")
    .update({ status: "archived" })
    .eq("id", chatId)
    .eq("student_id", profile.id);

  if (error) {
    throw new Error(`Failed to archive chat: ${error.message}`);
  }

  return { success: true };
}

/**
 * Generate and save task hint
 */
export async function generateTaskHintAction(
  taskId: string,
  taskTitle: string,
  taskBody: string,
  answerType: string,
  difficulty: string,
  hintLevel: 1 | 2 | 3 | 4
) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can generate hints");
  }

  const supabase = await createSupabaseServerClient();

  // Generate hint
  let hintResponse;
  try {
    hintResponse = await aiService.generateTaskHint({
      profile,
      task: {
        id: taskId,
        title: taskTitle,
        body: taskBody,
        answer_type: answerType,
        difficulty,
      },
      hintLevel,
    });
  } catch (error) {
    console.error("Hint generation error:", error);
    hintResponse = {
      content:
        "Өзіме өхта, кеңес құра алмадым. Кейін қайталап көріңіз.",
      sourceType: "local" as const,
      timestamp: new Date().toISOString(),
    };
  }

  // Save hint
  const { data: hint, error } = await supabase
    .from("ai_task_hints")
    .insert({
      student_id: profile.id,
      task_id: taskId,
      hint_level: hintLevel,
      hint_text: hintResponse.content,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save hint: ${error.message}`);
  }

  return hint;
}

/**
 * Analyze student solution
 */
export async function analyzeSolutionAction(
  taskId: string,
  taskTitle: string,
  answerType: string,
  correctAnswer: string | null,
  solution: string | null,
  studentAnswer: string,
  attemptId: string | null
) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can analyze solutions");
  }

  const supabase = await createSupabaseServerClient();

  // Generate analysis
  let analysisResponse;
  try {
    analysisResponse = await aiService.analyzeSolution({
      profile,
      task: {
        id: taskId,
        title: taskTitle,
        answer_type: answerType,
        correct_answer: correctAnswer,
        solution,
      },
      answerText: studentAnswer,
    });
  } catch (error) {
    console.error("Solution analysis error:", error);
    analysisResponse = {
      content:
        "Өзіме өхта, талдау құра алмадым. Кейін қайталап көріңіз.",
      sourceType: "local" as const,
      timestamp: new Date().toISOString(),
    };
  }

  // Try to parse JSON response if it's a valid JSON
  let feedbackData = {
    formula_feedback: null,
    unit_feedback: null,
    logic_feedback: null,
    final_answer_feedback: null,
    overall_feedback: analysisResponse.content,
    score: null,
  };

  try {
    const parsed = JSON.parse(analysisResponse.content);
    if (typeof parsed === "object" && parsed !== null) {
      feedbackData = { ...feedbackData, ...parsed };
    }
  } catch {
    // Response is not JSON, use as-is
  }

  // Save review
  const { data: review, error } = await supabase
    .from("ai_solution_reviews")
    .insert({
      student_id: profile.id,
      task_id: taskId,
      attempt_id: attemptId,
      input_text: studentAnswer,
      formula_feedback: feedbackData.formula_feedback,
      unit_feedback: feedbackData.unit_feedback,
      logic_feedback: feedbackData.logic_feedback,
      final_answer_feedback: feedbackData.final_answer_feedback,
      overall_feedback: feedbackData.overall_feedback,
      score: feedbackData.score,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save review: ${error.message}`);
  }

  return review;
}

/**
 * Get latest solution review for a task
 */
export async function getLatestSolutionReviewAction(taskId: string) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can view their reviews");
  }

  const supabase = await createSupabaseServerClient();

  const { data: review } = await supabase
    .from("ai_solution_reviews")
    .select("*")
    .eq("student_id", profile.id)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return review;
}

/**
 * Get latest task hint
 */
export async function getLatestTaskHintAction(taskId: string) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can view their hints");
  }

  const supabase = await createSupabaseServerClient();

  const { data: hint } = await supabase
    .from("ai_task_hints")
    .select("*")
    .eq("student_id", profile.id)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return hint;
}

/**
 * Get chat history for a topic
 */
export async function getChatHistoryAction(chatId: string) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can view their chats");
  }

  const supabase = await createSupabaseServerClient();

  // Verify ownership
  const { data: chat } = await supabase
    .from("ai_chats")
    .select("*")
    .eq("id", chatId)
    .eq("student_id", profile.id)
    .maybeSingle();

  if (!chat) {
    throw new Error("Chat not found");
  }

  const { data: messages } = await supabase
    .from("ai_chat_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  return messages || [];
}

/**
 * Generate AI diagnostic summary and save to diagnostic_results
 */
export async function generateDiagnosticSummaryAction(
  diagnosticResultId: string
) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can generate diagnostic summaries");
  }

  const supabase = await createSupabaseServerClient();

  // Get diagnostic result
  const { data: result } = await supabase
    .from("diagnostic_results")
    .select("*")
    .eq("id", diagnosticResultId)
    .eq("student_id", profile.id)
    .maybeSingle();

  if (!result) {
    throw new Error("Diagnostic result not found");
  }

  // Parse grade scores
  const gradeScores = result.grade_scores || {};
  const weakTopics = result.weak_topics || [];
  const strongTopics = result.strong_topics || [];

  // Generate summary
  let summaryResponse;
  try {
    summaryResponse = await aiService.generateDiagnosticSummary({
      profile,
      diagnosticResult: {
        id: result.id,
        grade_score: result.total_score,
      },
      gradeScores,
      weakTopics,
      strongTopics,
    });
  } catch (error) {
    console.error("Diagnostic summary generation error:", error);
    summaryResponse = {
      content:
        "Өзіме өхта, қорытындылау құра алмадым. Кейін қайталап көріңіз.",
      sourceType: "local" as const,
      timestamp: new Date().toISOString(),
    };
  }

  // Update diagnostic result with summary
  const { data: updated, error } = await supabase
    .from("diagnostic_results")
    .update({
      ai_summary: summaryResponse.content,
    })
    .eq("id", diagnosticResultId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save summary: ${error.message}`);
  }

  return updated;
}

/**
 * Generate and save route recommendation
 */
export async function generateRouteRecommendationAction(
  diagnosticResultId: string
) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can generate route recommendations");
  }

  const supabase = await createSupabaseServerClient();

  // Get diagnostic result
  const { data: result } = await supabase
    .from("diagnostic_results")
    .select("*")
    .eq("id", diagnosticResultId)
    .eq("student_id", profile.id)
    .maybeSingle();

  if (!result) {
    throw new Error("Diagnostic result not found");
  }

  // Get student interests
  const { data: interests } = await supabase
    .from("student_interests")
    .select("topic_title")
    .eq("student_id", profile.id);

  const interestTopics = (interests || []).map((i) => i.topic_title);

  // Get available topics
  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, grade");

  // Get available tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, difficulty")
    .eq("is_active", true);

  // Generate recommendation
  let recommendationResponse;
  try {
    recommendationResponse = await aiService.generateRouteRecommendation({
      profile,
      diagnosticResult: {
        id: result.id,
        grade_score: result.total_score,
      },
      interests: interestTopics,
      topics: topics || [],
      tasks: tasks || [],
    });
  } catch (error) {
    console.error("Route recommendation generation error:", error);
    recommendationResponse = {
      content:
        "Өзіме өхта, маршрут ұсыну құра алмадым. Кейін қайталап көріңіз.",
      sourceType: "local" as const,
      timestamp: new Date().toISOString(),
    };
  }

  // Create route recommendation record
  const { data: recommendation, error } = await supabase
    .from("ai_route_recommendations")
    .insert({
      student_id: profile.id,
      diagnostic_result_id: diagnosticResultId,
      level: result.level,
      weak_topics: result.weak_topics || [],
      strong_topics: result.strong_topics || [],
      interests: interestTopics,
      recommended_topics: [], // Will be parsed from AI response
      recommended_tasks: [], // Will be parsed from AI response
      summary: recommendationResponse.content,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save recommendation: ${error.message}`);
  }

  return recommendation;
}

/**
 * Get route recommendation for student
 */
export async function getRouteRecommendationAction() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    throw new Error("Only students can view recommendations");
  }

  const supabase = await createSupabaseServerClient();

  const { data: recommendation } = await supabase
    .from("ai_route_recommendations")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return recommendation;
}

