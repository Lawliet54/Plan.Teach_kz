import { createSupabaseServerClient } from "@/lib/supabase/server";
export type StudentSkillRow={id:string;student_id?:string;mastery_score:number;confidence:number;current_level:string;total_attempts:number;correct_attempts:number;consecutive_wrong:number;next_review_at:string|null;skill:{code:string;title:string;is_critical:boolean}|null};
export type AdaptiveRecommendationRow={id:string;recommendation_type:string;reason:string;status:string;created_at:string;skill:{title:string}|null};
export type ReviewQueueRow={id:string;scheduled_at:string;reason:string;status:string;skill:{title:string}|null};
export type LearningEventRow={id:string;event_type:string;entity_type:string;created_at:string;metadata:Record<string,unknown>};
export type LabSubmissionRow={id:string;lab_slug:string;score:number;status:string;created_at:string};
export type PackAttemptRow={id:string;pack_id:string;item_id:string;is_correct:boolean|null;score:number|null;review_status:string;created_at:string;pack:{title:string;grade:number}|null};
export type StudentAdaptiveSnapshot={skills:StudentSkillRow[];recommendations:AdaptiveRecommendationRow[];reviews:ReviewQueueRow[];events:LearningEventRow[];labs:LabSubmissionRow[];packAttempts:PackAttemptRow[]};
export async function getStudentAdaptiveSnapshot(studentId:string):Promise<StudentAdaptiveSnapshot>{const supabase=await createSupabaseServerClient();const [skills,recommendations,reviews,events,labs,packAttempts]=await Promise.all([
 supabase.from("student_skill_mastery").select("id,mastery_score,confidence,current_level,total_attempts,correct_attempts,consecutive_wrong,next_review_at,skill:skill_id(code,title,is_critical)").eq("student_id",studentId).order("mastery_score"),
 supabase.from("adaptive_recommendations").select("id,recommendation_type,reason,status,created_at,skill:skill_id(title)").eq("student_id",studentId).eq("status","active").order("created_at",{ascending:false}).limit(5),
 supabase.from("student_review_queue").select("id,scheduled_at,reason,status,skill:skill_id(title)").eq("student_id",studentId).eq("status","pending").order("scheduled_at").limit(8),
 supabase.from("learning_events").select("id,event_type,entity_type,created_at,metadata").eq("student_id",studentId).order("created_at",{ascending:false}).limit(24),
 supabase.from("lab_submissions").select("id,lab_slug,score,status,created_at").eq("student_id",studentId).order("created_at",{ascending:false}).limit(8),
 supabase.from("task_pack_attempts").select("id,pack_id,item_id,is_correct,score,review_status,created_at,pack:pack_id(title,grade)").eq("student_id",studentId).order("created_at",{ascending:false}).limit(80)
 ]);
 return {skills:(skills.data??[]) as unknown as StudentSkillRow[],recommendations:(recommendations.data??[]) as unknown as AdaptiveRecommendationRow[],reviews:(reviews.data??[]) as unknown as ReviewQueueRow[],events:(events.data??[]) as LearningEventRow[],labs:(labs.data??[]) as LabSubmissionRow[],packAttempts:(packAttempts.data??[]) as unknown as PackAttemptRow[]};}
export type TeacherAdaptiveSnapshot={skills:StudentSkillRow[];packAttempts:PackAttemptRow[];labs:LabSubmissionRow[];events:LearningEventRow[];recommendationCount:number;manualReviewCount:number};
export async function getTeacherAdaptiveSnapshot(studentIds:string[]):Promise<TeacherAdaptiveSnapshot>{if(!studentIds.length)return {skills:[],packAttempts:[],labs:[],events:[],recommendationCount:0,manualReviewCount:0};const supabase=await createSupabaseServerClient();const [skills,attempts,labs,events,recommendations,manual]=await Promise.all([
 supabase.from("student_skill_mastery").select("id,student_id,mastery_score,confidence,current_level,total_attempts,correct_attempts,consecutive_wrong,next_review_at,skill:skill_id(code,title,is_critical)").in("student_id",studentIds),
 supabase.from("task_pack_attempts").select("id,student_id,pack_id,item_id,is_correct,score,review_status,created_at,pack:pack_id(title,grade)").in("student_id",studentIds).order("created_at",{ascending:false}).limit(300),
 supabase.from("lab_submissions").select("id,student_id,lab_slug,score,status,created_at").in("student_id",studentIds).order("created_at",{ascending:false}).limit(100),
 supabase.from("learning_events").select("id,student_id,event_type,entity_type,created_at,metadata").in("student_id",studentIds).order("created_at",{ascending:false}).limit(100),
 supabase.from("adaptive_recommendations").select("id",{count:"exact",head:true}).in("student_id",studentIds).eq("status","active"),
 supabase.from("task_pack_attempts").select("id",{count:"exact",head:true}).in("student_id",studentIds).eq("review_status","pending_review")
 ]);return {skills:(skills.data??[]) as unknown as StudentSkillRow[],packAttempts:(attempts.data??[]) as unknown as PackAttemptRow[],labs:(labs.data??[]) as LabSubmissionRow[],events:(events.data??[]) as LearningEventRow[],recommendationCount:recommendations.count??0,manualReviewCount:manual.count??0};}
