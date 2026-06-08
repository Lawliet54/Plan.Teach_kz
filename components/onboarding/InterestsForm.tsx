"use client";

import { useState } from "react";
import {
  Atom,
  BrainCircuit,
  Check,
  FlaskConical,
  Sparkles,
} from "lucide-react";

import { physicsInterests } from "@/data/physics-interests";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type InterestsFormProps = {
  savedKeys: string[];
};

const icons = [Atom, FlaskConical, BrainCircuit, Sparkles];

export function InterestsForm({ savedKeys }: InterestsFormProps) {
  const [selectedKeys, setSelectedKeys] = useState(() => new Set(savedKeys));

  function toggleInterest(key: string) {
    setSelectedKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);

      if (nextKeys.has(key)) {
        nextKeys.delete(key);
      } else {
        nextKeys.add(key);
      }

      return nextKeys;
    });
  }

  return (
    <form action="/onboarding/interests/submit" method="post">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          Кемінде бір бағытты таңдаңыз.
        </p>

        <p className="text-xs font-extrabold text-[var(--primary)]">
          Таңдалды: {selectedKeys.size}
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {physicsInterests.map((interest, index) => {
          const Icon = icons[index % icons.length];
          const selected = selectedKeys.has(interest.key);

          return (
            <label
              key={interest.key}
              className={cn(
                "cursor-pointer rounded-[var(--radius-md)] border p-3 transition",
                selected
                  ? "border-[var(--primary)] bg-[var(--purple-soft)]"
                  : "border-[var(--border)] bg-white hover:border-[var(--border-accent)] hover:bg-[var(--surface-soft)]"
              )}
            >
              <input
                type="checkbox"
                name="interests"
                value={interest.key}
                checked={selected}
                onChange={() => toggleInterest(interest.key)}
                className="sr-only"
              />

              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-[var(--radius-sm)]",
                    selected
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-muted)] text-[var(--primary)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full border",
                    selected
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-white text-transparent"
                  )}
                >
                  <Check className="h-3 w-3" />
                </span>
              </div>

              <p className="mt-3 text-sm font-extrabold text-[var(--text)]">
                {interest.title}
              </p>

              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--primary)]">
                {interest.category}
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                {interest.description}
              </p>
            </label>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={selectedKeys.size === 0}>
          Таңдауды сақтау
        </Button>
      </div>
    </form>
  );
}