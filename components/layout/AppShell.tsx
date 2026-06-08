"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Atom,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FlaskConical,
  Home,
  LineChart,
  LogOut,
  Menu,
  MessageCircle,
  PlayCircle,
  Search,
  Settings,
  ShieldCheck,
  User,
  UsersRound,
  X,
} from "lucide-react";

import { signOutAction } from "@/app/auth/actions";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type AppShellProps = {
  profile: Profile;
  active?: string;
  children: ReactNode;
  hideTopbar?: boolean;
  contentClassName?: string;
};

const SIDEBAR_STORAGE_KEY = "plan-teach-sidebar-collapsed";
const SIDEBAR_EVENT = "plan-teach-sidebar-updated";

const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Басты бет", icon: Home },
  { href: "/topics", label: "Тақырыптар", icon: BookOpen },
  { href: "/tasks", label: "Тапсырмалар", icon: ClipboardCheck },
  { href: "/labs", label: "Зертханалар", icon: FlaskConical },
  { href: "/videos", label: "Видео сабақтар", icon: PlayCircle },
  { href: "/results", label: "Нәтижелер", icon: LineChart },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/ai", label: "AI көмекші", icon: MessageCircle },
  { href: "/profile", label: "Жеке кабинет", icon: User },
];

const teacherNav: NavItem[] = [
  { href: "/teacher/dashboard", label: "Басты бет", icon: Home },
  { href: "/teacher/students", label: "Оқушылар", icon: UsersRound },
  { href: "/teacher/submissions", label: "Тексеру", icon: ClipboardCheck },
  { href: "/teacher/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/teacher/controls", label: "БЖБ / ТЖБ", icon: BookOpen },
  { href: "/profile", label: "Жеке кабинет", icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Админ панель", icon: ShieldCheck },
  { href: "/teacher/dashboard", label: "Мұғалім көрінісі", icon: UsersRound },
  { href: "/learn", label: "Контент", icon: BookOpen },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/profile", label: "Жеке кабинет", icon: Settings },
];

function getHomePath(role: Profile["role"]) {
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

function isActive(pathname: string, active: string | undefined, href: string) {
  return active === href || pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function getMobileNav(role: Profile["role"], nav: NavItem[]) {
  if (role === "student") return nav.filter((item) => ["/dashboard", "/topics", "/tasks", "/labs"].includes(item.href));
  if (role === "teacher") return nav.filter((item) => ["/teacher/dashboard", "/teacher/students", "/teacher/submissions", "/teacher/analytics"].includes(item.href));
  return nav.slice(0, 4);
}

function subscribeSidebar(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_EVENT, callback);
  };
}

function getSidebarSnapshot() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

function getServerSidebarSnapshot() {
  return false;
}

function Sidebar({
  profile,
  pathname,
  active,
  nav,
  collapsed,
  mobile = false,
  onClose,
}: {
  profile: Profile;
  pathname: string;
  active?: string;
  nav: NavItem[];
  collapsed: boolean;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const displayName = profile.full_name || profile.email || "Қолданушы";
  const roleLabel = profile.role === "teacher" ? "Мұғалім" : profile.role === "admin" ? "Әкімші" : "Оқушы";

  return (
    <aside
      className={cn(
        "app-sidebar flex h-full flex-col text-white",
        mobile ? "w-[264px]" : "fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 lg:flex",
        !mobile && (collapsed ? "w-[70px]" : "w-[236px]")
      )}
    >
      <div className="flex h-15 items-center border-b border-white/10 px-3">
        <Link href={getHomePath(profile.role)} className="flex min-w-0 items-center gap-2.5" onClick={onClose}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] border border-white/15 bg-white/10">
            <Atom className="h-4.5 w-4.5" />
          </span>
          {!collapsed || mobile ? (
            <span className="min-w-0">
              <b className="block truncate text-sm tracking-[-.02em]">Plan.Teach_kz</b>
              <span className="block truncate text-[9px] font-black uppercase tracking-[.14em] text-white/45">Physics OS</span>
            </span>
          ) : null}
        </Link>
        {mobile ? (
          <button onClick={onClose} className="ml-auto grid h-8 w-8 place-items-center rounded-[4px] border border-white/10" aria-label="Мәзірді жабу">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="border-b border-white/10 px-3 py-3">
        {!collapsed || mobile ? (
          <>
            <p className="text-[9px] font-black uppercase tracking-[.15em] text-white/42">{roleLabel} панелі</p>
            <p className="mt-1 truncate text-xs font-extrabold text-white/90">{displayName}</p>
          </>
        ) : (
          <div className="mx-auto grid h-8 w-8 place-items-center rounded-[4px] bg-white/10 text-xs font-black">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <nav className="small-scrollbar flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {nav.map((item) => {
          const selected = isActive(pathname, active, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed && !mobile ? item.label : undefined}
              onClick={onClose}
              className={cn(
                "group flex h-9 items-center gap-2 rounded-[4px] px-2 text-xs font-extrabold transition",
                selected ? "bg-white/14 text-white" : "text-white/68 hover:bg-white/8 hover:text-white"
              )}
            >
              <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-[3px] border", selected ? "border-white/20 bg-white/10" : "border-transparent")}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              {!collapsed || mobile ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <form action={signOutAction}>
          <button type="submit" className="flex h-9 w-full items-center gap-2 rounded-[4px] px-2 text-xs font-extrabold text-white/62 transition hover:bg-white/8 hover:text-white">
            <span className="grid h-6 w-6 shrink-0 place-items-center">
              <LogOut className="h-3.5 w-3.5" />
            </span>
            {!collapsed || mobile ? <span>Шығу</span> : null}
          </button>
        </form>
      </div>
    </aside>
  );
}

export function AppShell({ profile, active, children, hideTopbar = false, contentClassName }: AppShellProps) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const collapsed = useSyncExternalStore(subscribeSidebar, getSidebarSnapshot, getServerSidebarSnapshot);
  const nav = useMemo(() => (profile.role === "admin" ? adminNav : profile.role === "teacher" ? teacherNav : studentNav), [profile.role]);
  const mobileNav = useMemo(() => getMobileNav(profile.role, nav), [profile.role, nav]);
  const displayName = profile.full_name || profile.email || "Қолданушы";
  const roleLabel = profile.role === "teacher" ? "Мұғалім" : profile.role === "admin" ? "Әкімші" : "Оқушы";

  function toggleSidebar() {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!collapsed));
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  }

  return (
    <div className="min-h-dvh bg-[var(--app-bg)] text-[var(--text)]">
      {drawer ? (
        <>
          <button aria-label="Мәзірді жабу" className="fixed inset-0 z-40 bg-[#071522]/55 lg:hidden" onClick={() => setDrawer(false)} />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar profile={profile} pathname={pathname} active={active} nav={nav} collapsed={collapsed} mobile onClose={() => setDrawer(false)} />
          </div>
        </>
      ) : null}

      <Sidebar profile={profile} pathname={pathname} active={active} nav={nav} collapsed={collapsed} />

      <div className={cn("min-h-dvh transition-[padding]", collapsed ? "lg:pl-[70px]" : "lg:pl-[236px]")}>
        {!hideTopbar ? (
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/90 backdrop-blur-xl">
            <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
              <button className="grid h-8 w-8 place-items-center rounded-[4px] border border-[var(--border)] bg-white lg:hidden" onClick={() => setDrawer(true)} aria-label="Мәзірді ашу">
                <Menu className="h-4 w-4" />
              </button>
              <button className="hidden h-8 w-8 place-items-center rounded-[4px] border border-[var(--border)] bg-white text-[var(--text-muted)] lg:grid" onClick={toggleSidebar} aria-label="Sidebar күйін өзгерту">
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <div className="hidden h-8 max-w-sm flex-1 items-center gap-2 rounded-[4px] border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 text-xs text-[var(--text-muted)] md:flex">
                <Search className="h-3.5 w-3.5" />
                Тақырып, формула немесе зертхана іздеу
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="hidden text-right sm:block">
                  <b className="block max-w-[180px] truncate text-xs text-[var(--text)]">{displayName}</b>
                  <span className="block text-[10px] font-bold text-[var(--text-muted)]">{roleLabel}</span>
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-[4px] border border-[var(--border-accent)] bg-[var(--purple-soft)] text-xs font-black text-[var(--primary)]">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
              </div>
            </div>
          </header>
        ) : null}
        <main className={cn("px-3 pb-20 pt-4 sm:px-4 lg:pb-5", contentClassName)}>{children}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid border-t border-[var(--border)] bg-white/96 px-1 py-1 backdrop-blur-xl lg:hidden"
        style={{ gridTemplateColumns: `repeat(${mobileNav.length}, minmax(0,1fr))` }}
      >
        {mobileNav.map((item) => {
          const selected = isActive(pathname, active, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex min-w-0 flex-col items-center gap-1 rounded-[4px] px-1 py-1.5 text-[10px] font-extrabold", selected ? "bg-[var(--purple-soft)] text-[var(--primary)]" : "text-[var(--text-muted)]")}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
