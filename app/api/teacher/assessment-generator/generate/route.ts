import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { generateAssessmentDocument } from "@/lib/assessment-generator/gemini";
import type {
  AssessmentGeneratorRequest,
  AssessmentType,
} from "@/lib/assessment-generator/types";

function isAssessmentType(value: unknown): value is AssessmentType {
  return value === "bjb" || value === "tjb";
}

function toPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.round(parsed);
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Кіру қажет." }, { status: 401 });
  }

  if (profile.role !== "teacher" && profile.role !== "admin") {
    return NextResponse.json(
      { error: "Бұл бөлімге қолжетімділік жоқ." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as Partial<AssessmentGeneratorRequest>;

  if (!isAssessmentType(body.type)) {
    return NextResponse.json(
      { error: "Құжат түрі дұрыс таңдалмаған." },
      { status: 400 }
    );
  }

  const section = body.section?.trim();

  if (!section) {
    return NextResponse.json(
      { error: "Бөлім немесе тақырып енгізілмеген." },
      { status: 400 }
    );
  }

  const payload: AssessmentGeneratorRequest = {
    type: body.type,
    grade: toPositiveInteger(body.grade, 7),
    term: body.term?.trim() || "1-тоқсан",
    section,
    learningObjectives: Array.isArray(body.learningObjectives)
      ? body.learningObjectives.map((item) => item.trim()).filter(Boolean)
      : [],
    taskCount: toPositiveInteger(body.taskCount, body.type === "bjb" ? 4 : 8),
    totalPoints: toPositiveInteger(body.totalPoints, body.type === "bjb" ? 12 : 20),
    durationMinutes: toPositiveInteger(
      body.durationMinutes,
      body.type === "bjb" ? 20 : 40
    ),
    additionalRequirements: body.additionalRequirements?.trim() || "",
  };

  try {
    const document = await generateAssessmentDocument(payload);

    return NextResponse.json({
      document,
    });
  } catch (error) {
    console.error("Assessment generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Құжатты генерациялау кезінде белгісіз қате шықты.",
      },
      { status: 500 }
    );
  }
}
