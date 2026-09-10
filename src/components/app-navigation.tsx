"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  Menu,
  PhoneCall,
  Settings,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

const nav = [
  ["Dashboard", "/", LayoutDashboard],
  ["Patients", "/patients", Users],
  ["Follow-ups", "/followups", PhoneCall],
  ["Appointments", "/appointments", CalendarDays],
  ["Care team", "/care-team", Stethoscope],
  ["Insights", "/insights", Activity],
] as const;

type NavigationProps = {
  active: string;
  profile: { name: string; email: string; role: string };
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CU";
}

function NavigationContent({ active, profile, close }: NavigationProps & { close?: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4 pt-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-emerald-100/40">Workspace</p>
        {nav.map(([label, href, Icon]) => (
          <Link key={label} href={href} onClick={close} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active === label ? "bg-white/12 text-white shadow-sm" : "text-emerald-50/65 hover:bg-white/7 hover:text-white"}`}>
            <Icon size={18} />{label}
          </Link>
        ))}
      </nav>
      <div className="shrink-0 border-t border-white/10 p-3 sm:p-4">
        <Link href="/settings" onClick={close} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${active === "Settings" ? "bg-white/12 text-white" : "text-emerald-50/65 hover:bg-white/7 hover:text-white"}`}><Settings size={18} />Settings</Link>
        <LogoutButton />
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/7 p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d9aa68] text-xs font-bold text-[#243d35]">{initials(profile.name)}</span>
          <span className="min-w-0 flex-1"><strong className="block truncate text-xs">{profile.name}</strong><small className="block truncate text-emerald-100/50">{profile.role.replace("_", " ")} · {profile.email}</small></span>
        </div>
      </div>
    </div>
  );
}

function Brand({ close }: { close?: () => void }) {
  return <div className="flex h-[68px] shrink-0 items-center border-b border-white/10 px-5"><Link href="/" onClick={close} className="flex min-w-0 flex-1 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#36b48d] shadow-lg shadow-black/15"><HeartPulse size={23} /></span><span className="min-w-0"><strong className="block truncate text-[17px] tracking-tight">CareLoop AI</strong><small className="block truncate text-xs text-emerald-100/60">Post-care, connected</small></span></Link>{close && <button type="button" onClick={close} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white"><X size={21} /></button>}</div>;
}

export function DesktopSidebar(props: NavigationProps) {
  return <aside className="sticky top-0 hidden h-dvh min-h-0 overflow-hidden border-r border-[#dbe5e1] bg-[#102f29] text-white lg:flex lg:flex-col"><Brand /><NavigationContent {...props} /></aside>;
}

export function MobileMenu(props: NavigationProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  return (
    <div className="flex min-w-0 items-center gap-3 lg:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mobile-navigation" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#dbe5e1] bg-white text-[#40564f]"><Menu size={20} /></button>
      <HeartPulse className="shrink-0 text-[#167d63]" size={23} />
      <strong className="truncate text-sm sm:text-base">CareLoop AI</strong>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-[#071b16]/55 backdrop-blur-[2px]" /><aside id="mobile-navigation" className="absolute inset-y-0 left-0 flex h-dvh w-[min(86vw,320px)] flex-col bg-[#102f29] text-white shadow-2xl"><Brand close={() => setOpen(false)} /><NavigationContent {...props} close={() => setOpen(false)} /></aside></div>}
    </div>
  );
}
