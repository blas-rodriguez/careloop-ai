import Link from "next/link";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  PhoneCall,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { SubmitButton } from "@/components/submit-button";
import {
  refreshFollowupCall,
  startFollowupCall,
} from "@/lib/actions/workspace";
import { getEnvironmentStatus, getFollowups } from "@/lib/data/workspace";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default async function FollowupsPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    simulated?: string;
    started?: string;
    refreshed?: string;
    error?: string;
  }>;
}) {
  const [items, query] = await Promise.all([getFollowups(), searchParams]);
  const environment = getEnvironmentStatus();
  const providerMode = environment.provider;
  const liveReady = environment.callEKey && environment.webhookAdmin;
  const scheduled = items.filter((item) => item.status === "scheduled").length;
  const completed = items.filter((item) => item.status === "completed").length;
  const needsReview = items.filter((item) => item.needsReview).length;
  return (
    <AppShell active="Follow-ups">
      <div className="mx-auto max-w-[1300px]">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-sm font-medium text-[#167d63]">
              Automated outreach
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#17362d] md:text-[30px]">
              Follow-ups
            </h1>
            <p className="mt-1 text-sm text-[#70817b]">
              Plan, simulate, and review patient calls.
            </p>
          </div>
          <Link
            href="/followups/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#167d63] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Schedule follow-up
          </Link>
        </div>
        {(query.created || query.simulated || query.started || query.refreshed) && (
          <Notice
            text={
              query.started
                ? "CALL-E accepted the call. Use Check CALL-E status if the result does not arrive automatically."
                : query.refreshed === "completed"
                  ? "CALL-E completed the call and the patient timeline was updated."
                  : query.refreshed === "failed"
                    ? "CALL-E reports that this attempt did not complete. You may review it and retry with a new attempt."
                    : query.refreshed
                      ? "The call is still open in CALL-E. Wait briefly, then check its status again."
                      : query.simulated
                        ? "Mock call completed and saved to the patient timeline."
                        : "Follow-up scheduled successfully."
            }
          />
        )}
        {query.error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={18} />
            {query.error}
          </div>
        )}
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <Summary label="Scheduled" value={scheduled} icon={CalendarClock} />
          <Summary label="Completed" value={completed} icon={PhoneCall} />
          <Summary
            label="Needs review"
            value={needsReview}
            icon={AlertCircle}
          />
        </div>
        <section className="rounded-2xl border border-[#dfe8e4] bg-white p-5 md:p-6">
          <div className="mb-5">
            <h2 className="font-bold text-[#18382f]">Call queue</h2>
            <p className="text-xs text-[#7a8a84]">
              {providerMode === "mock"
                ? "Mock calls create structured results without contacting a real patient."
                : liveReady
                  ? "Live CALL-E mode is active. Starting a call contacts the consented patient."
                  : "Live calling is blocked until the CALL-E key and webhook server credential are configured."}
            </p>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-[#e2eae7] p-4 sm:flex-row sm:items-center"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e6f2ee] text-xs font-bold text-[#176b55]">
                  {item.patient
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/patients/${item.patientId}`}
                    className="text-sm font-bold text-[#354c44] hover:text-[#167d63]"
                  >
                    {item.patient}
                  </Link>
                  <p className="mt-0.5 text-xs text-[#81908b]">
                    {item.doctor} · {formatDate(item.scheduledFor)} ·{" "}
                    {item.attemptCount} attempt
                    {item.attemptCount === 1 ? "" : "s"}
                  </p>
                  {item.summary && (
                    <p className="mt-2 line-clamp-1 text-xs text-[#60736b]">
                      {item.summary}
                    </p>
                  )}
                </div>
                <Status
                  status={item.needsReview ? "needs review" : item.status}
                />
                {["scheduled", "failed"].includes(item.status) &&
                item.consent &&
                (providerMode === "mock" || liveReady) ? (
                  <form
                    action={startFollowupCall.bind(null, item.id)}
                    className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
                  >
                    {providerMode === "mock" && (
                      <select
                        name="mock_scenario"
                        aria-label="Simulation scenario"
                        defaultValue="routine"
                        className="rounded-xl border border-[#dce6e2] bg-[#f9fbfa] px-3 py-2.5 text-xs font-medium text-[#536860] outline-none focus:border-[#58a992]"
                      >
                        <option value="routine">Routine improvement</option>
                        <option value="clinical_review">Clinical alert</option>
                        <option value="appointment">Appointment request</option>
                      </select>
                    )}
                    <SubmitButton>
                      {item.status === "failed"
                        ? `Retry ${providerMode === "mock" ? "simulation" : "call"}`
                        : providerMode === "mock"
                          ? "Run scenario"
                          : "Start CALL-E call"}
                    </SubmitButton>
                  </form>
                ) : ["scheduled", "failed"].includes(item.status) &&
                  item.consent &&
                  providerMode === "call-e" &&
                  !liveReady ? (
                  <Link
                    href="/settings"
                    className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-sm font-semibold text-amber-800 sm:w-auto"
                  >
                    Complete setup
                  </Link>
                ) : item.status === "in_progress" &&
                  providerMode === "call-e" ? (
                  <form
                    action={refreshFollowupCall.bind(null, item.id)}
                    className="w-full sm:w-auto"
                  >
                    <SubmitButton>Check CALL-E status</SubmitButton>
                  </form>
                ) : (
                  <Link
                    href={`/patients/${item.patientId}`}
                    className="w-full rounded-xl border border-[#b9d2ca] px-4 py-2.5 text-center text-sm font-semibold text-[#167d63] sm:w-auto"
                  >
                    View timeline
                  </Link>
                )}
              </article>
            ))}
            {!items.length && (
              <EmptyState
                icon={PhoneCall}
                title="No follow-ups yet"
                description="Schedule an outreach after recording a consultation and patient consent."
                actionHref="/followups/new"
                actionLabel="Schedule follow-up"
              />
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
      <CheckCircle2 size={18} />
      {text}
    </div>
  );
}
function Summary({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof PhoneCall;
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
function Status({ status }: { status: string }) {
  const tone =
    status === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "needs review"
        ? "bg-amber-50 text-amber-800"
        : status === "failed"
          ? "bg-rose-50 text-rose-700"
          : "bg-blue-50 text-blue-700";
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${tone}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
