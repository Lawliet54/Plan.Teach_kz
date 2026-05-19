import { redirect } from "next/navigation";
import { BrainCircuit, Send } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";

export default async function AiPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role === "student" && !profile.teacher_id) redirect("/onboarding/teacher-select");
  if (profile.role === "student" && !profile.diagnostic_completed) redirect("/onboarding/diagnostic");
  if (profile.role === "student" && !profile.onboarding_completed) redirect("/onboarding/interests");

  return (
    <AppShell profile={profile} active="/ai">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          AI көмекші
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Физика бойынша көмек
        </h1>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1efff]">
              <BrainCircuit className="h-5 w-5 text-[#5b4ce6]" />
            </div>
            <div>
              <CardTitle>AI Tutor MVP</CardTitle>
              <CardText>Қазір бұл demo чат. API қосылғанда толық жауап береді.</CardText>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ddd6ff] bg-[#f1efff] p-4 text-sm leading-6 text-slate-700">
            Сәлем, {profile.full_name}! Физикадан сұрағыңызды жазыңыз. MVP-де
            жауап үлгісі көрсетіледі, кейін OpenAI/Supabase chat history қосамыз.
          </div>

          <form className="mt-4 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5b4ce6]"
              placeholder="Мысалы: Ом заңын түсіндір"
            />
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#5b4ce6] px-4 text-sm font-bold text-white"
            >
              <Send className="h-4 w-4" />
              Жіберу
            </button>
          </form>
        </Card>

        <Card>
          <CardTitle>Жылдам сұрақтар</CardTitle>
          <div className="mt-3 grid gap-2">
            {["Формуланы түсіндір", "Мысал есеп бер", "Қате жерімді тап"].map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-slate-700 hover:border-[#5b4ce6]/40"
                >
                  {item}
                </button>
              )
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
