import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Database,
  KeyRound,
  LockKeyhole,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DemoResetForm } from "@/components/demo-reset-form";
import { getCurrentProfile, getEnvironmentStatus } from "@/lib/data/workspace";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; error?: string }>;
}) {
  const [profile, query] = await Promise.all([
    getCurrentProfile(),
    searchParams,
  ]);
  const environment = getEnvironmentStatus();
  return (
    <AppShell active="Settings">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-7">
          <p className="mb-1 text-sm font-medium text-[#167d63]">
            Workspace administration
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#17362d] md:text-[30px]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#70817b]">
            Review your account, demo data, integrations, and safety controls.
          </p>
        </div>
        {query.demo && (
          <Notice
            success
            text="The fictional demo workspace was restored successfully."
          />
        )}
        {query.error && <Notice text={query.error} />}
        <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
          <section className="rounded-2xl border border-[#dfe8e4] bg-white p-6">
            <h2 className="font-bold text-[#18382f]">Your profile</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Display name"
                value={profile?.name ?? "Clinic user"}
              />
              <Field label="Email" value={profile?.email ?? ""} />
              <Field
                label="Workspace role"
                value={(profile?.role ?? "coordinator").replace("_", " ")}
              />
              <Field label="Account status" value="Active" />
            </div>
            <p className="mt-5 text-xs leading-5 text-[#71817b]">
              Every clinical record is isolated to this account by Supabase
              Row-Level Security.
            </p>
          </section>
          <section className="rounded-2xl border border-[#dfe8e4] bg-white p-6">
            <h2 className="font-bold text-[#18382f]">Environment</h2>
            <div className="mt-5 space-y-3">
              <Status
                icon={Database}
                label="Supabase database"
                text={environment.supabase ? "Connected" : "Not configured"}
                ready={environment.supabase}
              />
              <Status
                icon={LockKeyhole}
                label="Authentication and RLS"
                text="Enabled"
                ready
              />
              <Status
                icon={PhoneCall}
                label="CALL-E provider"
                text={
                  environment.provider === "mock"
                    ? "Simulation mode"
                    : "Live mode"
                }
                ready={
                  environment.provider === "mock" ||
                  (environment.callEKey && environment.webhookAdmin)
                }
              />
              <Status
                icon={KeyRound}
                label="Webhook receiver"
                text={
                  environment.webhookAdmin
                    ? "Server credential ready"
                    : "Not configured"
                }
                ready={environment.webhookAdmin}
              />
            </div>
            <p className="mt-4 text-[11px] leading-5 text-[#84928d]">
              Only readiness booleans are displayed. Secret values never leave
              the server.
            </p>
          </section>
        </div>
        <section className="mt-5 rounded-2xl border border-[#dfe8e4] bg-white p-6">
          <h2 className="font-bold text-[#18382f]">Demo data</h2>
          <p className="mt-1 text-sm text-[#71817b]">
            Prepare the same presentation scenario in seconds before recording.
          </p>
          <DemoResetForm />
        </section>
        <section className="mt-5 rounded-2xl border border-[#dfe8e4] bg-white p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck size={21} />
            </span>
            <div>
              <h2 className="font-bold text-[#18382f]">Clinical safety</h2>
              <p className="mt-1 text-sm leading-6 text-[#71817b]">
                Automated calls require recorded consent. CareLoop captures
                patient-reported information and escalates concerns; it never
                diagnoses, prescribes, or replaces emergency services.
              </p>
              <ul className="mt-4 space-y-2 text-sm font-medium text-[#435950]">
                <li>✓ Consent is checked again when a call starts.</li>
                <li>✓ New or worsening symptoms require human review.</li>
                <li>
                  ✓ Telephone numbers must use international E.164 format.
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section className="mt-5 rounded-2xl border border-[#dfe8e4] bg-white p-6">
          <div className="flex items-center gap-3">
            <Bell className="text-[#167d63]" size={20} />
            <h2 className="font-bold text-[#18382f]">Notifications</h2>
          </div>
          <p className="mt-2 text-sm text-[#71817b]">
            In-app review indicators are active. External notification delivery
            remains outside the hackathon demo scope.
          </p>
        </section>
      </div>
    </AppShell>
  );
}

function Notice({
  text,
  success = false,
}: {
  text: string;
  success?: boolean;
}) {
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={success ? "status" : "alert"}
      className={`mb-5 flex items-center gap-3 rounded-xl border p-4 text-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
    >
      <Icon size={18} />
      {text}
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-2 block text-xs font-semibold text-[#536860]">
        {label}
      </span>
      <p className="min-h-10 rounded-xl border border-[#dce6e2] bg-[#f9fbfa] px-3 py-2.5 text-sm capitalize text-[#354c44]">
        {value}
      </p>
    </div>
  );
}
function Status({
  icon: Icon,
  label,
  text,
  ready = false,
}: {
  icon: typeof Database;
  label: string;
  text: string;
  ready?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e5ece9] p-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf5f2] text-[#167d63]">
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-xs text-[#3d534b]">{label}</strong>
        <small className="text-[#81908b]">{text}</small>
      </span>
      <span
        aria-label={ready ? "Ready" : "Pending"}
        className={`h-2.5 w-2.5 rounded-full ${ready ? "bg-emerald-500" : "bg-amber-400"}`}
      />
    </div>
  );
}
