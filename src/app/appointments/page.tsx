import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { getAppointments } from "@/lib/data/workspace";

const statusStyle: Record<string, string> = {
  requested: "bg-amber-50 text-amber-800 ring-amber-200",
  scheduled: "bg-blue-50 text-blue-700 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  const upcoming = appointments.filter(
    (item) => new Date(item.startsAt) >= new Date(),
  );
  return (
    <AppShell active="Appointments">
      <div className="mx-auto max-w-[1300px]">
        <Header />
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <Metric
            icon={CalendarDays}
            value={String(upcoming.length)}
            label="Upcoming"
          />
          <Metric
            icon={Clock3}
            value={String(
              appointments.filter((item) => item.status === "requested").length,
            )}
            label="Awaiting confirmation"
          />
          <Metric
            icon={CheckCircle2}
            value={String(
              appointments.filter((item) => item.status === "completed").length,
            )}
            label="Completed"
          />
        </div>
        <section className="overflow-hidden rounded-2xl border border-[#dfe8e4] bg-white">
          <div className="border-b border-[#e5ece9] px-6 py-5">
            <h2 className="font-bold text-[#18382f]">Appointment schedule</h2>
            <p className="text-xs text-[#7a8a84]">
              Visits created by staff and follow-up calls
            </p>
          </div>
          <div className="divide-y divide-[#edf1ef]">
            {appointments.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e8f4f0] text-[#167d63]">
                  <CalendarDays size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#29473e]">
                    {item.patient}
                  </h3>
                  <p className="mt-1 text-xs text-[#7b8b85]">
                    {item.doctor} · {item.specialty}
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-sm font-semibold text-[#40564f]">
                    {new Intl.DateTimeFormat("en", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(item.startsAt))}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#82918c]">
                    {item.source === "followup" && <Sparkles size={12} />}
                    Created by {item.source}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyle[item.status] ?? statusStyle.cancelled}`}
                >
                  {item.status}
                </span>
              </article>
            ))}
            {appointments.length === 0 && (
              <EmptyState
                icon={CalendarDays}
                title="No appointments yet"
                description="Create a visit after adding a patient and clinician to this workspace."
                actionHref="/appointments/new"
                actionLabel="Create appointment"
              />
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
function Header() {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-sm font-medium text-[#167d63]">
          Care coordination
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#17362d] md:text-[30px]">
          Appointments
        </h1>
        <p className="mt-1 text-sm text-[#70817b]">
          Coordinate visits requested during patient follow-up.
        </p>
      </div>
      <Link
        href="/appointments/new"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#167d63] px-4 py-2.5 text-sm font-semibold text-white"
      >
        <Plus size={17} />
        New appointment
      </Link>
    </div>
  );
}
function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof CalendarDays;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#dfe8e4] bg-white p-5">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e6f3ef] text-[#167d63]">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-bold text-[#18382f]">{value}</p>
        <p className="text-xs text-[#778781]">{label}</p>
      </div>
    </div>
  );
}
