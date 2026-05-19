import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <LogOut className="h-3.5 w-3.5" />
        Шығу
      </button>
    </form>
  );
}