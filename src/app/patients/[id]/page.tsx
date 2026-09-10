import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, MessageSquareText, PhoneCall, Star } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { markCallReviewed } from "@/lib/actions/workspace";
import { getPatientTimeline, type TimelineEvent } from "@/lib/data/workspace";
import { getPatient } from "@/lib/data/patients";
import { maskPhoneNumber } from "@/lib/validation";

const formatDate = (value: string) => new Intl.DateTimeFormat("en", {
  month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
}).format(new Date(value));

export default async function PatientDetail({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reviewed?: string; consultation?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [patient, timeline] = await Promise.all([getPatient(id), getPatientTimeline(id)]);
  if (!patient) notFound();
  const pendingReview = timeline.latestResult?.needsReview && !timeline.latestResult.reviewedAt;
  return (
    <AppShell active="Patients">
      <div className="mx-auto max-w-[1280px]">
        <Link href="/patients" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#63756e] hover:text-[#167d63]"><ArrowLeft size={16} />Back to patients</Link>
        {(query.reviewed || query.consultation) && <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 size={18} />{query.reviewed ? "Clinical alert marked as reviewed." : "Consultation saved to the patient timeline."}</div>}
        {query.error && <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={18} />{query.error}</div>}
        <section className="rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_2px_10px_rgba(23,54,45,.035)] md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#dff0ea] text-lg font-bold text-[#176b55]">{patient.initials}</span>
            <div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight text-[#17362d]">{patient.name}</h1><StatusBadge status={patient.status} /></div><p className="mt-1 text-sm text-[#71827c]">{patient.age === null ? "Age unavailable" : `${patient.age} years`} · ID {id.slice(0, 8).toUpperCase()} · {maskPhoneNumber(patient.phone)}</p></div>
            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Link href={`/patients/${id}/edit`} className="inline-flex items-center justify-center rounded-xl border border-[#b9d2ca] px-4 py-2.5 text-sm font-semibold text-[#167d63]">Edit patient</Link>
              <Link href={`/consultations/new?patient=${id}`} className="inline-flex items-center justify-center rounded-xl border border-[#b9d2ca] px-4 py-2.5 text-sm font-semibold text-[#167d63]">Add consultation</Link>
              <Link href={`/followups/new?patient=${id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#167d63] px-4 py-2.5 text-sm font-semibold text-white"><PhoneCall size={17} />Schedule follow-up</Link>
            </div>
          </div>
          <div className="mt-6 grid gap-3 border-t border-[#e8eeeb] pt-5 sm:grid-cols-3"><Info label="Primary doctor" value={patient.doctor} /><Info label="Specialty" value={patient.specialty} /><Info label="Next follow-up" value={patient.nextFollowup} /></div>
        </section>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_.8fr]">
          <section className="rounded-2xl border border-[#dfe8e4] bg-white p-5 md:p-6">
            <div className="mb-6"><h2 className="font-bold text-[#18382f]">Patient timeline</h2><p className="text-xs text-[#7a8a84]">Consultations and structured call outcomes from Supabase</p></div>
            {timeline.events.length ? <div className="relative ml-4 border-l-2 border-[#dce9e4] pl-7">{timeline.events.map((event, index) => <Event key={`${event.kind}-${event.id}`} event={event} last={index === timeline.events.length - 1} />)}</div> : <div className="rounded-xl bg-[#f6f9f8] p-8 text-center text-sm text-[#71817b]">No clinical activity recorded yet. <Link className="font-semibold text-[#167d63]" href={`/consultations/new?patient=${id}`}>Add the first consultation</Link>.</div>}
          </section>
          <div className="space-y-5">
            {pendingReview && timeline.latestResult && <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800"><AlertTriangle size={19} /></span><div><h3 className="font-bold text-amber-950">Needs clinical review</h3><p className="mt-1 text-sm leading-6 text-amber-900/70">A patient-reported outcome was escalated. CareLoop has not made a diagnosis.</p><form action={markCallReviewed.bind(null, timeline.latestResult.id, id)}><button className="mt-3 rounded-lg bg-amber-900 px-3 py-2 text-xs font-semibold text-white">Mark as reviewed</button></form></div></div></section>}
            <section className="rounded-2xl border border-[#dfe8e4] bg-white p-5"><h3 className="font-bold text-[#18382f]">Latest call result</h3>{timeline.latestResult ? <div className="mt-4 space-y-3 text-sm"><Info label="Outcome" value={timeline.latestResult.outcome} /><Info label="Care rating" value={timeline.latestResult.doctorRating ? `${timeline.latestResult.doctorRating}/5` : "Not provided"} /><Info label="Appointment" value={timeline.latestResult.appointmentRequested ? "Requested" : "Not requested"} /><Info label="Escalation" value={pendingReview ? "Human review" : "None pending"} />{timeline.latestResult.transcript && <details className="rounded-xl border border-[#dfe8e4] p-3"><summary className="cursor-pointer font-semibold text-[#167d63]">View transcript</summary><p className="mt-3 whitespace-pre-line text-xs leading-5 text-[#667871]">{timeline.latestResult.transcript}</p></details>}</div> : <p className="mt-3 text-sm text-[#71817b]">No completed call yet.</p>}</section>
            <section className="rounded-2xl border border-[#dfe8e4] bg-white p-5"><h3 className="font-bold text-[#18382f]">Safety boundary</h3><p className="mt-2 text-xs leading-5 text-[#778781]">This demo records patient-reported outcomes and routes concerns to people. It does not provide medical advice or emergency assistance.</p></section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Event({ event, last }: { event: TimelineEvent; last: boolean }) {
  const Icon = event.kind === "consultation" ? CalendarDays : PhoneCall;
  const result = event.result;
  return <div className={last ? "relative" : "relative pb-8"}><span className={`absolute -left-[46px] grid h-9 w-9 place-items-center rounded-full ring-4 ring-white ${event.kind === "consultation" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}><Icon size={17} /></span><p className="text-[11px] font-semibold uppercase tracking-wide text-[#87958f]">{formatDate(event.date)}</p><h3 className="mt-1 text-sm font-bold text-[#354c44]">{event.title}</h3><div className="mt-2 text-sm leading-6 text-[#71817b]">{event.detail && <p>{event.detail}</p>}{event.recommendations.length > 0 && <div className="mt-3 rounded-xl bg-[#f5f8f7] p-3"><strong className="text-[#354c44]">Recommendations</strong><ul className="mt-1 list-inside list-disc">{event.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></div>}{result && <><div className="mt-3 flex flex-wrap gap-2"><Tag icon={CheckCircle2} text={`Outcome: ${result.outcome}`} /><Tag icon={CheckCircle2} text={result.recommendationsFollowed ? "Recommendations followed" : "Follow-through not confirmed"} />{result.newSymptoms && <Tag icon={AlertTriangle} text={`New symptoms: ${result.newSymptoms}`} warning />}{result.appointmentRequested && <Tag icon={CalendarDays} text="Appointment requested" warning />}{result.doctorRating && <Tag icon={Star} text={`Rating ${result.doctorRating}/5`} />}</div>{result.summary && <div className="mt-3 rounded-xl border border-[#dfe8e4] p-3"><MessageSquareText size={15} className="mr-2 inline text-[#167d63]" /><strong className="text-[#354c44]">Call summary:</strong> {result.summary}</div>}</>}</div></div>;
}
function Tag({ icon: Icon, text, warning = false }: { icon: typeof CheckCircle2; text: string; warning?: boolean }) { return <span className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${warning ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}><Icon size={15} />{text}</span>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-[#84938e]">{label}</p><p className="mt-1 text-sm font-semibold capitalize text-[#3f554d]">{value}</p></div>; }
