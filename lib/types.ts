export type UserRole = "student" | "teacher" | "admin";

export type StudentLevel = "beginner" | "intermediate" | "advanced";

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  role: UserRole;
  teacher_id: string | null;
  level: StudentLevel | null;
  current_grade: number | null;
  diagnostic_completed: boolean;
  onboarding_completed: boolean;
  avatar_url: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TeacherStudentLink = {
  id: string;
  teacher_id: string;
  student_id: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
};

export const roleLabels: Record<UserRole, string> = {
  student: "Оқушы",
  teacher: "Мұғалім",
  admin: "Админ",
};

export const levelLabels: Record<StudentLevel, string> = {
  beginner: "Бастапқы деңгей",
  intermediate: "Орта деңгей",
  advanced: "Жоғары деңгей",
};