import { AlertTriangle, CalendarPlus, Check, Clock3, PhoneOff, TrendingUp } from "lucide-react";
import type { FollowupStatus } from "@/lib/types";

const config: Record<FollowupStatus, { className: string; icon: typeof Check }> = {
  "Improving": { className: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: TrendingUp },
  "Requires Review": { className: "bg-amber-50 text-amber-800 ring-amber-200", icon: AlertTriangle },
  "Appointment Requested": { className: "bg-blue-50 text-blue-700 ring-blue-200", icon: CalendarPlus },
  "Follow-up Completed": { className: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: Check },
  "Call Failed": { className: "bg-rose-50 text-rose-700 ring-rose-200", icon: PhoneOff },
  "Scheduled": { className: "bg-slate-50 text-slate-700 ring-slate-200", icon: Clock3 },
};

export function StatusBadge({ status }: { status: FollowupStatus }) {
  const item = config[status]; const Icon = item.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${item.className}`}><Icon size={13} />{status}</span>;
}
