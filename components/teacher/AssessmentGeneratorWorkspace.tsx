"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import type {
  AssessmentDocument,
  AssessmentTask,
  AssessmentType,
} from "@/lib/assessment-generator/types";

type GeneratorForm = {
  grade: string;
  term: string;
  section: string;
  learningObjectivesText: string;
  taskCount: string;
  totalPoints: string;
  durationMinutes: string;
  additionalRequirements: string;
};

const defaultForm: GeneratorForm = {
  grade: "7",
  term: "1-тоқсан",
  section: "",
  learningObjectivesText: "",
  taskCount: "4",
  totalPoints: "12",
  durationMinutes: "20",
  additionalRequirements: "",
};

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function descriptorLines(task: AssessmentTask) {
  return task.descriptors
    .map((descriptor) => `${descriptor.text} | ${descriptor.points}`)
    .join("\n");
}

function parseDescriptorLines(value: string) {
  return splitLines(value).map((line) => {
    const separatorIndex = line.lastIndexOf("|");

    if (separatorIndex === -1) {
      return {
        text: line,
        points: 1,
      };
    }

    const points = Number(line.slice(separatorIndex + 1).trim());

    return {
      text: line.slice(0, separatorIndex).trim(),
      points: Number.isFinite(points) && points > 0 ? Math.round(points) : 1,
    };
  });
}

export function AssessmentGeneratorWorkspace() {
  const [type, setType] = useState<AssessmentType>("bjb");
  const [form, setForm] = useState<GeneratorForm>(defaultForm);
  const [document, setDocument] = useState<AssessmentDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const typeLabel = type === "bjb" ? "БЖБ" : "ТЖБ";

  const calculatedPoints = useMemo(
    () =>
      document?.tasks.reduce((sum, task) => sum + Number(task.points || 0), 0) ??
      0,
    [document]
  );

  function selectType(nextType: AssessmentType) {
    setType(nextType);
    setDocument(null);
    setError("");

    setForm((current) => ({
      ...current,
      taskCount: nextType === "bjb" ? "4" : "8",
      totalPoints: nextType === "bjb" ? "12" : "20",
      durationMinutes: nextType === "bjb" ? "20" : "40",
    }));
  }

  function updateForm<K extends keyof GeneratorForm>(
    key: K,
    value: GeneratorForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function generate() {
    setError("");

    if (!form.section.trim()) {
      setError("Бөлім немесе тақырып атауын енгізіңіз.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/teacher/assessment-generator/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            grade: Number(form.grade),
            term: form.term,
            section: form.section,
            learningObjectives: splitLines(form.learningObjectivesText),
            taskCount: Number(form.taskCount),
            totalPoints: Number(form.totalPoints),
            durationMinutes: Number(form.durationMinutes),
            additionalRequirements: form.additionalRequirements,
          }),
        }
      );

      const data = (await response.json()) as {
        document?: AssessmentDocument;
        error?: string;
      };

      if (!response.ok || !data.document) {
        throw new Error(data.error || "Құжат генерацияланбады.");
      }

      setDocument(data.document);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Құжат генерацияланбады."
      );
    } finally {
      setLoading(false);
    }
  }

  async function downloadDocx() {
    if (!document) return;

    setDownloading(true);
    setError("");

    try {
      const response = await fetch("/api/teacher/assessment-generator/docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as {
          error?: string;
        };

        throw new Error(data.error || "DOCX файлын жүктеу мүмкін болмады.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = url;
      link.download = `${typeLabel}_${document.grade}_сынып.docx`;

      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "DOCX файлын жүктеу мүмкін болмады."
      );
    } finally {
      setDownloading(false);
    }
  }

  function updateDocument(patch: Partial<AssessmentDocument>) {
    setDocument((current) =>
      current
        ? {
            ...current,
            ...patch,
          }
        : current
    );
  }

  function updateTask(index: number, patch: Partial<AssessmentTask>) {
    setDocument((current) => {
      if (!current) return current;

      return {
        ...current,
        tasks: current.tasks.map((task, taskIndex) =>
          taskIndex === index
            ? {
                ...task,
                ...patch,
              }
            : task
        ),
      };
    });
  }

  return (
    <div className="page-stack">
      <section className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => selectType("bjb")}
          className="text-left"
        >
          <Card
            className={
              type === "bjb"
                ? "h-full border-[var(--border-accent)] bg-[var(--purple-soft)]"
                : "h-full transition hover:border-[var(--border-accent)]"
            }
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-[10px] bg-white text-[var(--primary)] shadow-[var(--shadow-xs)]">
              <BookOpen className="h-5 w-5" />
            </div>

            <CardTitle>БЖБ генерациясы</CardTitle>

            <CardText className="mt-1">
              Бір бөлімге арналған тапсырмалар, дескрипторлар, жауаптар және
              рубрика құрастыру.
            </CardText>

            <Badge className="mt-3" variant={type === "bjb" ? "success" : "neutral"}>
              {type === "bjb" ? "Таңдалды" : "Таңдау"}
            </Badge>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => selectType("tjb")}
          className="text-left"
        >
          <Card
            className={
              type === "tjb"
                ? "h-full border-[var(--border-accent)] bg-[var(--purple-soft)]"
                : "h-full transition hover:border-[var(--border-accent)]"
            }
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-[10px] bg-white text-[var(--primary)] shadow-[var(--shadow-xs)]">
              <FileText className="h-5 w-5" />
            </div>

            <CardTitle>ТЖБ генерациясы</CardTitle>

            <CardText className="mt-1">
              Тоқсандық спецификация, тапсырмалар және балл қою кестесін
              автоматты түрде құрастыру.
            </CardText>

            <Badge className="mt-3" variant={type === "tjb" ? "success" : "neutral"}>
              {type === "tjb" ? "Таңдалды" : "Таңдау"}
            </Badge>
          </Card>
        </button>
      </section>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="data-label text-[var(--primary)]">
              Gemini AI генераторы
            </p>

            <CardTitle className="mt-1">
              {typeLabel} параметрлерін енгізіңіз
            </CardTitle>
          </div>

          <Badge variant="success">Серверлік Gemini API</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
            Сынып
            <select
              value={form.grade}
              onChange={(event) => updateForm("grade", event.target.value)}
              className="h-10 rounded-[8px] border border-[var(--border)] bg-white px-3 text-sm"
            >
              {[7, 8, 9, 10, 11].map((grade) => (
                <option key={grade} value={grade}>
                  {grade}-сынып
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
            Тоқсан
            <select
              value={form.term}
              onChange={(event) => updateForm("term", event.target.value)}
              className="h-10 rounded-[8px] border border-[var(--border)] bg-white px-3 text-sm"
            >
              {["1-тоқсан", "2-тоқсан", "3-тоқсан", "4-тоқсан"].map((term) => (
                <option key={term}>{term}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
            Тапсырма саны
            <input
              type="number"
              min="1"
              value={form.taskCount}
              onChange={(event) => updateForm("taskCount", event.target.value)}
              className="h-10 rounded-[8px] border border-[var(--border)] bg-white px-3 text-sm"
            />
          </label>

          <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
            Жалпы балл
            <input
              type="number"
              min="1"
              value={form.totalPoints}
              onChange={(event) => updateForm("totalPoints", event.target.value)}
              className="h-10 rounded-[8px] border border-[var(--border)] bg-white px-3 text-sm"
            />
          </label>
        </div>

        <label className="mt-3 grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
          Бөлім немесе тақырыптар
          <input
            value={form.section}
            onChange={(event) => updateForm("section", event.target.value)}
            placeholder={
              type === "bjb"
                ? "Мысалы: Тығыздық"
                : "Мысалы: Тығыздық; Денелердің өзара әрекеттесуі"
            }
            className="h-10 rounded-[8px] border border-[var(--border)] bg-white px-3 text-sm"
          />
        </label>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
            Оқу мақсаттары
            <textarea
              value={form.learningObjectivesText}
              onChange={(event) =>
                updateForm("learningObjectivesText", event.target.value)
              }
              placeholder={"Әр оқу мақсатын жаңа жолдан жазыңыз.\n7.2.2.13 — Тығыздықтың физикалық мағынасын түсіндіру"}
              className="min-h-28 rounded-[8px] border border-[var(--border)] bg-white p-3 text-sm leading-6"
            />
          </label>

          <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
            Қосымша талаптар
            <textarea
              value={form.additionalRequirements}
              onChange={(event) =>
                updateForm("additionalRequirements", event.target.value)
              }
              placeholder="Мысалы: есептеу тапсырмаларын көбірек қосу"
              className="min-h-28 rounded-[8px] border border-[var(--border)] bg-white p-3 text-sm leading-6"
            />
          </label>
        </div>

        <label className="mt-3 grid max-w-52 gap-1 text-xs font-extrabold text-[var(--text-soft)]">
          Орындау уақыты
          <input
            type="number"
            min="1"
            value={form.durationMinutes}
            onChange={(event) =>
              updateForm("durationMinutes", event.target.value)
            }
            className="h-10 rounded-[8px] border border-[var(--border)] bg-white px-3 text-sm"
          />
        </label>

        {error ? (
          <div className="mt-3 flex items-start gap-2 rounded-[8px] border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={generate} disabled={loading}>
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Генерация жүріп жатыр..." : `${typeLabel} генерациялау`}
          </Button>

          {document ? (
            <Button
              variant="secondary"
              onClick={downloadDocx}
              disabled={downloading}
            >
              {downloading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              DOCX жүктеу
            </Button>
          ) : null}
        </div>
      </Card>

      {document ? (
        <>
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="data-label text-[var(--primary)]">
                  Preview және өңдеу
                </p>

                <CardTitle className="mt-1">Құжат параметрлері</CardTitle>
              </div>

              <Badge variant={calculatedPoints === document.totalPoints ? "success" : "warning"}>
                Жалпы балл: {calculatedPoints}
              </Badge>
            </div>

            <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
              Құжат атауы
              <input
                value={document.title}
                onChange={(event) =>
                  updateDocument({
                    title: event.target.value,
                  })
                }
                className="h-10 rounded-[8px] border border-[var(--border)] bg-white px-3 text-sm"
              />
            </label>

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
                Оқу мақсаттары
                <textarea
                  value={document.learningObjectives.join("\n")}
                  onChange={(event) =>
                    updateDocument({
                      learningObjectives: splitLines(event.target.value),
                    })
                  }
                  className="min-h-28 rounded-[8px] border border-[var(--border)] bg-white p-3 text-sm leading-6"
                />
              </label>

              <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
                Бағалау критерийлері
                <textarea
                  value={document.assessmentCriteria.join("\n")}
                  onChange={(event) =>
                    updateDocument({
                      assessmentCriteria: splitLines(event.target.value),
                    })
                  }
                  className="min-h-28 rounded-[8px] border border-[var(--border)] bg-white p-3 text-sm leading-6"
                />
              </label>
            </div>
          </Card>

          <section className="space-y-3">
            {document.tasks.map((task, index) => (
              <Card key={`${task.number}-${index}`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>
                    {task.number}. {task.title}
                  </CardTitle>

                  <Badge>{task.points} балл</Badge>
                </div>

                <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
                  Тапсырма мәтіні
                  <textarea
                    value={task.prompt}
                    onChange={(event) =>
                      updateTask(index, {
                        prompt: event.target.value,
                      })
                    }
                    className="min-h-24 rounded-[8px] border border-[var(--border)] bg-white p-3 text-sm leading-6"
                  />
                </label>

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
                    Дұрыс жауап
                    <textarea
                      value={task.answer}
                      onChange={(event) =>
                        updateTask(index, {
                          answer: event.target.value,
                        })
                      }
                      className="min-h-24 rounded-[8px] border border-[var(--border)] bg-white p-3 text-sm leading-6"
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-extrabold text-[var(--text-soft)]">
                    Дескрипторлар: мәтін | балл
                    <textarea
                      value={descriptorLines(task)}
                      onChange={(event) =>
                        updateTask(index, {
                          descriptors: parseDescriptorLines(event.target.value),
                        })
                      }
                      className="min-h-24 rounded-[8px] border border-[var(--border)] bg-white p-3 text-sm leading-6"
                    />
                  </label>
                </div>
              </Card>
            ))}
          </section>

          {document.qualityChecks.length > 0 ? (
            <Card>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
                <CardTitle>AI сапа тексерісі</CardTitle>
              </div>

              <div className="space-y-2">
                {document.qualityChecks.map((item, index) => (
                  <p
                    key={`${item}-${index}`}
                    className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold leading-5 text-[var(--text-soft)]"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
