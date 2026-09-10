import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  PhoneCall,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DashboardChart } from "@/components/dashboard-chart";
import { StatusBadge } from "@/components/status-badge";
import { getPatients } from "@/lib/data/patients";
import { getDashboardStats } from "@/lib/data/workspace";
import { recentActivity } from "@/lib/demo-data";

export default async function Dashboard() {
  const [patients, stats] = await Promise.all([getPatients(), getDashboardStats()]);
  const completionRate = stats.calls ? Math.round((stats.completed / stats.calls) * 100) : 0;
  const dashboardMetrics = [
    { label: "Active patients", value: String(stats.patients || patients.length), note: "Connected to Supabase", icon: Users, color: "text-[#167d63] bg-emerald-50" },
    { label: "Follow-up calls", value: String(stats.calls), note: `${stats.completed} completed`, icon: PhoneCall, color: "text-blue-700 bg-blue-50" },
    { label: "Completion rate", value: `${completionRate}%`, note: "Across recorded calls", icon: CheckCircle2, color: "text-violet-700 bg-violet-50" },
    { label: "Needs review", value: String(stats.needsReview), note: "Human follow-up required", icon: AlertTriangle, color: "text-amber-700 bg-amber-50" },
  ];
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-sm font-medium text-[#167d63]">
              Friday, September 5
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#17362d] md:text-[30px]">
              Good morning, Ana
            </h1>
            <p className="mt-1 text-sm text-[#70817b]">
              Here&apos;s what&apos;s happening with your patients today.
            </p>
          </div>
          <Link
            href="/followups"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#167d63] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d6852]"
          >
            <Plus size={17} />
            Schedule follow-up
          </Link>
        </div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map(({ label, value, note, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_2px_10px_rgba(23,54,45,.035)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#687a73]">{label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#18382f]">
                    {value}
                  </p>
                </div>
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}
                >
                  <Icon size={20} />
                </span>
              </div>
              <p
                className={`mt-3 flex items-center gap-1 text-xs font-medium ${label === "Needs review" ? "text-amber-700" : "text-emerald-700"}`}
              >
                <TrendingUp size={13} />
                {note}
              </p>
            </div>
          ))}
        </section>
        <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
          <div className="rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_2px_10px_rgba(23,54,45,.035)] md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#18382f]">Follow-up calls</h2>
                <p className="text-xs text-[#7a8a84]">
                  Calls completed during the last 7 days
                </p>
              </div>
              <span className="rounded-lg border border-[#dfe8e4] px-3 py-1.5 text-xs font-medium text-[#52645e]">
                This week
              </span>
            </div>
            <DashboardChart />
          </div>
          <div className="rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_2px_10px_rgba(23,54,45,.035)] md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#18382f]">Today&apos;s queue</h2>
                <p className="text-xs text-[#7a8a84]">
                  4 calls waiting to start
                </p>
              </div>
              <Clock3 size={19} className="text-[#81918b]" />
            </div>
            <div className="mt-5 space-y-3">
              {patients.slice(0, 3).map((patient, index) => (
                <Link
                  href={`/patients/${patient.id}`}
                  key={patient.id}
                  className="flex items-center gap-3 rounded-xl border border-[#e5ece9] p-3 transition hover:border-[#a9d1c5] hover:bg-[#f8fbfa]"
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold ${index === 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
                  >
                    {patient.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-[#24433a]">
                      {patient.name}
                    </strong>
                    <small className="text-[#788983]">
                      {patient.nextFollowup}
                    </small>
                  </span>
                  <ArrowRight size={16} className="text-[#96a49f]" />
                </Link>
              ))}
            </div>
            <Link
              href="/followups"
              className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-[#167d63]"
            >
              View full queue <ArrowRight size={14} />
            </Link>
          </div>
        </section>
        <section className="mt-5 rounded-2xl border border-[#dfe8e4] bg-white shadow-[0_2px_10px_rgba(23,54,45,.035)]">
          <div className="flex items-center justify-between border-b border-[#e5ece9] px-5 py-4 md:px-6">
            <div>
              <h2 className="font-bold text-[#18382f]">Recent activity</h2>
              <p className="text-xs text-[#7a8a84]">
                Latest updates from automated follow-ups
              </p>
            </div>
            <Link
              href="/patients"
              className="text-xs font-semibold text-[#167d63]"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#edf1ef]">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center md:px-6"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf5f2] text-xs font-bold text-[#276d59]">
                  {item.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#24433a]">
                    {item.patient}{" "}
                    <span className="font-normal text-[#73847e]">
                      · {item.event}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-[#899691]">
                    {item.detail} · {item.time}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </section>
        <p className="mt-5 text-center text-[11px] text-[#8a9893]">
          CareLoop AI supports follow-up workflows. It does not diagnose,
          prescribe, or replace clinical judgment.
        </p>
      </div>
    </AppShell>
  );
}
