"use client";
import { Activity, Atom, Gauge, Waves } from "lucide-react";
export function PhysicsHero() {
  return <div className="relative min-h-[360px] overflow-hidden rounded-[8px] border border-white/10 bg-[#071522] text-white shadow-[0_24px_60px_rgba(7,21,34,.24)] sm:min-h-[410px]">
    <div className="absolute inset-0 opacity-60 physics-grid" />
    <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#5747e7]/35 blur-3xl" />
    <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#1687e8]/25 blur-3xl" />
    <div className="animate-scan absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <svg viewBox="0 0 520 420" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <g transform="translate(274 194)">
        <circle r="54" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1" />
        <circle r="14" fill="#9f96ff" />
        <circle r="7" fill="#ffffff" opacity=".78" />
        <g className="animate-orbit"><ellipse rx="152" ry="62" fill="none" stroke="rgba(147,197,253,.58)" strokeWidth="1.4" /><circle cx="151" cy="0" r="7" fill="#38bdf8" /></g>
        <g className="animate-orbit-reverse" transform="rotate(62)"><ellipse rx="150" ry="61" fill="none" stroke="rgba(196,181,253,.62)" strokeWidth="1.4" /><circle cx="-149" cy="0" r="7" fill="#a78bfa" /></g>
        <g className="animate-orbit" transform="rotate(-64)"><ellipse rx="150" ry="61" fill="none" stroke="rgba(110,231,183,.46)" strokeWidth="1.4" /><circle cx="150" cy="0" r="6" fill="#34d399" /></g>
      </g>
      <path className="animate-graph" d="M36 338 C104 318 112 348 172 300 C235 250 252 288 314 226 C365 176 414 178 486 122" fill="none" stroke="rgba(56,189,248,.86)" strokeWidth="2" />
      <path d="M36 338H486M36 338V92" fill="none" stroke="rgba(255,255,255,.18)" />
      {[80,172,262,352,444].map((x)=><circle key={x} cx={x} cy={x===80?326:x===172?300:x===262?280:x===352?196:148} r="4" fill="#ffffff" opacity=".85" />)}
    </svg>
    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-[4px] border border-white/12 bg-white/8 px-2.5 py-2 backdrop-blur"><Atom className="h-4 w-4 text-[#a99fff]"/><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/50">Live model</p><p className="text-xs font-extrabold">Атомдық орбита</p></div></div>
    <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
      {[{icon:Activity,label:"Mastery",value:"84%"},{icon:Gauge,label:"Деңгей",value:"Adaptive"},{icon:Waves,label:"Зертхана",value:"2D"}].map(({icon:Icon,label,value}) => <div key={label} className="rounded-[4px] border border-white/12 bg-white/8 p-2.5 backdrop-blur"><Icon className="h-3.5 w-3.5 text-[#93c5fd]"/><p className="mt-2 text-[9px] font-black uppercase tracking-[.12em] text-white/45">{label}</p><p className="mt-0.5 text-xs font-black text-white">{value}</p></div>)}
    </div>
  </div>;
}
