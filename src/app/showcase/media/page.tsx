import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  LayoutDashboard,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

const scenes = ["dashboard", "timeline", "followups", "workflow"] as const;
type Scene = (typeof scenes)[number];

export default async function ShowcaseMedia({
  searchParams,
}: {
  searchParams: Promise<{ scene?: string }>;
}) {
  const requested = (await searchParams).scene;
  const scene: Scene = scenes.includes(requested as Scene)
    ? (requested as Scene)
    : "dashboard";
  return (
    <main className="h-screen min-h-[720px] overflow-hidden bg-[#eef4f1] p-7 text-[#17362d]">
      <div className="mx-auto flex h-full max-w-[1440px] overflow-hidden rounded-[28px] border border-[#d8e5e0] bg-white shadow-[0_28px_90px_rgba(16,47,41,.14)]">
        <MediaSidebar active={scene} />
        <div className="min-w-0 flex-1 bg-[#f4f7f6]">
          <MediaHeader />
          <div className="h-[calc(100%-72px)] p-8">
            {scene === "dashboard" ? (
              <DashboardScene />
            ) : scene === "timeline" ? (
              <TimelineScene />
            ) : scene === "followups" ? (
              <FollowupsScene />
            ) : (
              <WorkflowScene />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function MediaSidebar({ active }: { active: Scene }) {
  return (
    <aside className="flex w-[230px] shrink-0 flex-col bg-[#102f29] p-5 text-white">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#36b48d]">
          <HeartPulse size={24} />
        </span>
        <div>
          <strong className="block">CareLoop AI</strong>
          <small className="text-emerald-100/55">Post-care, connected</small>
        </div>
      </div>
      <p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-emerald-100/35">
        Workspace
      </p>
      <div className="space-y-1">
        <Side
          icon={LayoutDashboard}
          text="Dashboard"
          selected={active === "dashboard"}
        />
        <Side icon={Users} text="Patients" selected={active === "timeline"} />
        <Side
          icon={PhoneCall}
          text="Follow-ups"
          selected={active === "followups"}
        />
        <Side
          icon={ShieldCheck}
          text="Care workflow"
          selected={active === "workflow"}
        />
      </div>
      <div className="mt-auto rounded-xl bg-white/7 p-3">
        <p className="text-xs font-semibold">Hackathon demo</p>
        <p className="mt-1 text-[10px] leading-4 text-emerald-100/45">
          Fictional records · Safe mock mode
        </p>
      </div>
    </aside>
  );
}
function Side({
  icon: Icon,
  text,
  selected,
}: {
  icon: typeof Users;
  text: string;
  selected: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${selected ? "bg-white/12 text-white" : "text-emerald-50/55"}`}
    >
      <Icon size={17} />
      {text}
    </div>
  );
}
function MediaHeader() {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#dbe5e1] bg-white px-8">
      <div>
        <strong className="text-sm">Care operations workspace</strong>
        <p className="text-[10px] text-[#84928d]">
          CALL-E Hackathon · September 2026
        </p>
      </div>
      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        ● Demo environment
      </span>
    </header>
  );
}

function DashboardScene() {
  return (
    <div>
      <Eyebrow text="Operational overview" />
      <h1 className="mt-1 text-3xl font-bold">Post-care at a glance</h1>
      <p className="mt-1 text-sm text-[#71817b]">
        Structured outcomes from every follow-up call.
      </p>
      <div className="mt-7 grid grid-cols-4 gap-4">
        <Metric value="24" label="Active patients" />
        <Metric value="18" label="Calls completed" />
        <Metric value="86%" label="Completion rate" />
        <Metric value="3" label="Needs review" warning />
      </div>
      <div className="mt-5 grid grid-cols-[1.4fr_1fr] gap-5">
        <section className="rounded-2xl border border-[#dfe8e4] bg-white p-6">
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold">Follow-up activity</h2>
              <p className="text-xs text-[#84928d]">
                Calls completed during the last 7 days
              </p>
            </div>
            <PhoneCall className="text-[#167d63]" size={20} />
          </div>
          <div className="mt-8 flex h-56 items-end gap-6 border-b border-l border-[#dfe8e4] px-6">
            {[36, 58, 45, 82, 68, 92, 76].map((height, index) => (
              <div
                key={index}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#167d63] to-[#55c7a4]"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-[#82918c]">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-[#dfe8e4] bg-white p-6">
          <h2 className="font-bold">Today&apos;s care queue</h2>
          <p className="text-xs text-[#84928d]">
            Actions created from patient calls
          </p>
          <div className="mt-5 space-y-3">
            <Queue
              name="Demo Patient A"
              detail="Synthetic concern · Review required"
              warning
            />
            <Queue
              name="Demo Patient B"
              detail="Synthetic appointment request"
              warning
            />
            <Queue
              name="Demo Patient C"
              detail="Synthetic improvement · No action needed"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function TimelineScene() {
  return (
    <div>
      <Eyebrow text="Patient record" />
      <div className="flex items-end justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-bold">Demo Patient A</h1>
          <p className="mt-1 text-sm text-[#71817b]">
            Synthetic record · Demo Clinician A · General Medicine
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
          Needs clinical review
        </span>
      </div>
      <div className="mt-7 grid grid-cols-[1.45fr_.75fr] gap-5">
        <section className="rounded-2xl border border-[#dfe8e4] bg-white p-6">
          <h2 className="font-bold">Patient timeline</h2>
          <div className="ml-4 mt-6 border-l-2 border-[#dce9e4] pl-8">
            <Timeline
              icon={Stethoscope}
              date="SEP 3 · 10:30 AM"
              title="Synthetic consultation"
            >
              <p>Demo recovery scenario</p>
              <div className="mt-3 rounded-xl bg-[#f5f8f7] p-3 text-xs">
                Synthetic recommendations created for demonstration only.
              </div>
            </Timeline>
            <Timeline
              icon={PhoneCall}
              date="TODAY · 9:42 AM"
              title="AI follow-up completed"
            >
              <div className="mt-2 flex gap-2">
                <Pill text="Recommendations followed" />
                <Pill text="New dizziness" warning />
                <Pill text="Rating 5/5" />
              </div>
              <div className="mt-3 rounded-xl border border-[#dfe8e4] p-3 text-xs leading-5">
                The synthetic scenario reports a new concern. Human review is
                demonstrated without real clinical information.
              </div>
            </Timeline>
            <Timeline
              icon={AlertTriangle}
              date="TODAY · 9:43 AM"
              title="Review requested"
              last
            >
              <p>Concern automatically routed to clinic staff.</p>
            </Timeline>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <AlertTriangle className="text-amber-800" />
            <h3 className="mt-3 font-bold text-amber-950">
              Needs clinical review
            </h3>
            <p className="mt-2 text-xs leading-5 text-amber-900/70">
              New patient-reported symptom. No diagnosis was made.
            </p>
            <button className="mt-4 rounded-lg bg-amber-900 px-3 py-2 text-xs font-bold text-white">
              Mark as reviewed
            </button>
          </div>
          <div className="rounded-2xl border border-[#dfe8e4] bg-white p-5">
            <h3 className="font-bold">Latest result</h3>
            <div className="mt-4 space-y-3">
              <KeyValue label="Outcome" value="Improving" />
              <KeyValue label="Appointment" value="Not requested" />
              <KeyValue label="Care rating" value="5 / 5" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FollowupsScene() {
  return (
    <div>
      <Eyebrow text="Automated outreach" />
      <h1 className="mt-1 text-3xl font-bold">Follow-up scenarios</h1>
      <p className="mt-1 text-sm text-[#71817b]">
        Demonstrate every care path safely before live calling.
      </p>
      <div className="mt-7 grid grid-cols-3 gap-4">
        <Metric value="3" label="Scheduled" />
        <Metric value="18" label="Completed" />
        <Metric value="3" label="Needs review" warning />
      </div>
      <section className="mt-5 rounded-2xl border border-[#dfe8e4] bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Call queue</h2>
            <p className="text-xs text-[#84928d]">
              Choose a structured mock outcome
            </p>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            Safe mock mode
          </span>
        </div>
        <div className="mt-5 space-y-3">
          <Followup
              name="Demo Patient A"
              doctor="Demo Clinician A"
            scenario="Clinical alert"
          />
          <Followup
              name="Demo Patient B"
              doctor="Demo Clinician B"
            scenario="Appointment request"
          />
          <Followup
              name="Demo Patient C"
              doctor="Demo Clinician A"
            scenario="Routine improvement"
          />
        </div>
      </section>
    </div>
  );
}

function WorkflowScene() {
  return (
    <div>
      <Eyebrow text="Safety-first architecture" />
      <h1 className="mt-1 max-w-3xl text-3xl font-bold">
        A phone call becomes a reliable care action
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#71817b]">
        CareLoop connects clinician-authored recommendations, CALL-E structured
        results, Supabase persistence, and human oversight.
      </p>
      <div className="mt-10 grid grid-cols-4 gap-4">
        {[
          [
            Stethoscope,
            "01",
            "Clinician guidance",
            "Recommendations originate with the care team.",
          ],
          [
            PhoneCall,
            "02",
            "CALL-E outreach",
            "The automated caller identifies itself and requests consent.",
          ],
          [
            CheckCircle2,
            "03",
            "Structured result",
            "Outcome, symptoms, rating, transcript, and requests.",
          ],
          [
            ShieldCheck,
            "04",
            "Human decision",
            "Concerns are reviewed by staff; CareLoop never diagnoses.",
          ],
        ].map(([Icon, number, title, text]) => {
          const C = Icon as typeof ShieldCheck;
          return (
            <article
              key={String(title)}
              className="rounded-2xl border border-[#dfe8e4] bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e6f3ef] text-[#167d63]">
                  <C size={20} />
                </span>
                <strong className="text-xs text-[#a0afa9]">
                  {String(number)}
                </strong>
              </div>
              <h2 className="mt-6 font-bold">{String(title)}</h2>
              <p className="mt-2 text-xs leading-5 text-[#71817b]">
                {String(text)}
              </p>
            </article>
          );
        })}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Safety text="Explicit automated-call consent" />
        <Safety text="Idempotent provider requests" />
        <Safety text="Verified and deduplicated webhooks" />
      </div>
      <div className="mt-6 rounded-2xl bg-[#102f29] p-6 text-white">
        <div className="flex items-center gap-3">
          <HeartPulse className="text-[#55d4ad]" />
          <div>
            <strong>CareLoop supports follow-up workflows.</strong>
            <p className="mt-1 text-xs text-emerald-50/55">
              It does not diagnose, prescribe, replace clinical judgment, or
              provide emergency assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ text }: { text: string }) {
  return <p className="text-sm font-bold text-[#167d63]">{text}</p>;
}
function Metric({
  value,
  label,
  warning = false,
}: {
  value: string;
  label: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#dfe8e4] bg-white p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-[#71817b]">{label}</p>
          <strong className="mt-2 block text-3xl">{value}</strong>
        </div>
        <span
          className={`h-3 w-3 rounded-full ${warning ? "bg-amber-400" : "bg-emerald-500"}`}
        />
      </div>
    </div>
  );
}
function Queue({
  name,
  detail,
  warning = false,
}: {
  name: string;
  detail: string;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e5ece9] p-3">
      <span
        className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${warning ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
      >
        {name
          .split(" ")
          .map((part) => part[0])
          .join("")}
      </span>
      <div>
        <strong className="block text-xs">{name}</strong>
        <small className="text-[10px] text-[#84928d]">{detail}</small>
      </div>
    </div>
  );
}
function Timeline({
  icon: Icon,
  date,
  title,
  children,
  last = false,
}: {
  icon: typeof PhoneCall;
  date: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`relative ${last ? "" : "pb-7"}`}>
      <span className="absolute -left-[47px] grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700 ring-4 ring-white">
        <Icon size={15} />
      </span>
      <p className="text-[9px] font-bold tracking-wider text-[#8b9994]">
        {date}
      </p>
      <h3 className="mt-1 text-sm font-bold">{title}</h3>
      <div className="mt-1 text-xs leading-5 text-[#71817b]">{children}</div>
    </div>
  );
}
function Pill({ text, warning = false }: { text: string; warning?: boolean }) {
  return (
    <span
      className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${warning ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}
    >
      {text}
    </span>
  );
}
function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[#edf1ef] pb-2 text-xs">
      <span className="text-[#7c8c86]">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function Followup({
  name,
  doctor,
  scenario,
}: {
  name: string;
  doctor: string;
  scenario: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#e5ece9] p-4">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e6f2ee] text-xs font-bold text-[#176b55]">
        {name
          .split(" ")
          .map((part) => part[0])
          .join("")}
      </span>
      <div className="flex-1">
        <strong className="block text-sm">{name}</strong>
        <small className="text-[#84928d]">{doctor} · Scheduled today</small>
      </div>
      <span className="rounded-xl border border-[#dce6e2] bg-[#f9fbfa] px-4 py-2.5 text-xs font-semibold text-[#536860]">
        {scenario}⌄
      </span>
      <span className="rounded-xl bg-[#167d63] px-4 py-2.5 text-xs font-bold text-white">
        Run scenario
      </span>
    </div>
  );
}
function Safety({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
      <CheckCircle2 size={17} />
      {text}
    </div>
  );
}
