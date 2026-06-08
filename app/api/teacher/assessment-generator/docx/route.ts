import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { createAssessmentDocx } from "@/lib/assessment-generator/docx";
import type { AssessmentDocument } from "@/lib/assessment-generator/types";

function sanitizeFilename(value: string) {
  return value
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 90);
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

  const body = (await request.json()) as {
    document?: AssessmentDocument;
  };

  if (!body.document) {
    return NextResponse.json(
      { error: "Құжат деректері берілмеген." },
      { status: 400 }
    );
  }

  try {
    const buffer = await createAssessmentDocx(body.document);

    const filename = sanitizeFilename(
      `${body.document.type.toUpperCase()}_${body.document.grade}_сынып_${body.document.section}`
    );

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          filename
        )}.docx`,
      },
    });
  } catch (error) {
    console.error("Assessment DOCX generation error:", error);

    return NextResponse.json(
      { error: "DOCX құжатын жасау мүмкін болмады." },
      { status: 500 }
    );
  }
}
