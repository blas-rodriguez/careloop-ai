import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  HeartPulse,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const steps = [
  [Stethoscope, "Consultation", "A clinician records care recommendations."],
  [CalendarCheck2, "Follow-up", "Staff schedules a consented outreach."],
  [PhoneCall, "AI phone call", "CALL-E collects patient-reported outcomes."],
  [ShieldCheck, "Human action", "Concerns and appointment requests reach staff."],
] as const;

export const metadata = {
  title: "CareLoop AI | CALL-E Hackathon",
  description: "Consent-first AI phone follow-up that turns post-care conversations into safe, structured clinical workflows.",
};

export default function ShowcasePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f8f6] text-[#16372e]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/showcase" className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#167d63] text-white"><HeartPulse size={22} /></span><span><strong className="block leading-5">CareLoop AI</strong><small className="text-[11px] text-[#71817b]">Post-care, connected</small></span></Link>
        <div className="flex items-center gap-2"><a href="https://github.com/blas-rodriguez/careloop-ai" target="_blank" rel="noreferrer" className="hidden rounded-xl border border-[#cdded8] px-4 py-2.5 text-sm font-semibold text-[#426057] sm:inline-flex">Source code</a><Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl bg-[#167d63] px-4 py-2.5 text-sm font-semibold text-white">Open workspace <ArrowRight size={16} /></Link></div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-20">
        <div className="absolute -right-44 top-10 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-[#167d63]"><Sparkles size={14} />Built for the CALL-E Hackathon</span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.07] tracking-[-.045em] text-[#12352b] sm:text-5xl lg:text-6xl">Every patient deserves a follow-up after they leave.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#60756d] sm:text-lg sm:leading-8">CareLoop turns consented AI phone calls into structured outcomes, human-review alerts, and coordinated next steps—without diagnosing or replacing clinicians.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/auth/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#167d63] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/10">Try the working demo <ArrowRight size={17} /></Link><a href="#workflow" className="inline-flex items-center justify-center rounded-xl border border-[#cdded8] bg-white px-5 py-3 text-sm font-bold text-[#426057]">See how it works</a></div>
          <p className="mt-4 text-xs text-[#83928d]">Hackathon environment · All patient data is fictional</p>
        </div>
        <ProductPreview />
      </section>

      <section id="workflow" className="border-y border-[#dce7e3] bg-white/75">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl"><p className="text-sm font-bold text-[#167d63]">From conversation to action</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">One continuous post-care workflow</h2><p className="mt-3 leading-7 text-[#687a73]">The call is not an isolated voice demo. Its result becomes part of the clinic&apos;s operational workflow.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{steps.map(([Icon, title, text], index) => <article key={title} className="relative rounded-2xl border border-[#dfe8e4] bg-white p-5 shadow-[0_8px_30px_rgba(19,58,47,.04)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e4f3ee] text-[#167d63]"><Icon size={19} /></span><span className="absolute right-5 top-5 text-xs font-bold text-[#b0bdb8]">0{index + 1}</span><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#71817b]">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-16 sm:px-8 md:grid-cols-3 lg:py-20">
        <Feature icon={CheckCircle2} title="Structured outcomes" text="Follow-through, evolution, symptoms, ratings, appointment requests, summaries, and transcripts." />
        <Feature icon={AlertTriangle} title="Human review by design" text="New or worsening symptoms are routed to staff instead of being interpreted as a diagnosis." />
        <Feature icon={ShieldCheck} title="Consent and safety" text="Explicit call consent, provider idempotency, verified webhooks, and fictional demo records." />
      </section>

      <footer className="border-t border-[#dce7e3] bg-[#102f29] text-white"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8"><div className="flex items-center gap-2"><HeartPulse size={18} className="text-[#55d4ad]" /><strong>CareLoop AI</strong></div><p className="text-xs text-emerald-50/55">Patient-reported follow-up. Not medical advice or emergency assistance.</p></div></footer>
    </main>
  );
}

function ProductPreview() {
  return <div className="relative mx-auto w-full max-w-xl"><div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-200/60 to-blue-100/40 blur-2xl" /><div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white p-3 shadow-[0_30px_80px_rgba(18,57,46,.16)]"><div className="rounded-[1.25rem] bg-[#f3f7f5] p-4 sm:p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#167d63]">Synthetic patient timeline</p><h2 className="mt-1 text-lg font-bold">Demo Patient A</h2></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">Needs review</span></div><div className="mt-5 space-y-3"><PreviewRow icon={Stethoscope} title="Demo consultation completed" detail="Synthetic recommendations recorded" /><PreviewRow icon={PhoneCall} title="Simulated follow-up completed" detail="Synthetic scenario reports a new concern" warning /><PreviewRow icon={AlertTriangle} title="Demo review requested" detail="Synthetic concern routed to demo staff" warning /></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white p-3"><small className="text-[#82918c]">Outcome</small><strong className="mt-1 block text-sm">Improving</strong></div><div className="rounded-xl bg-white p-3"><small className="text-[#82918c]">Demo rating</small><strong className="mt-1 block text-sm">5 / 5</strong></div></div></div></div></div>;
}
function PreviewRow({ icon: Icon, title, detail, warning = false }: { icon: typeof PhoneCall; title: string; detail: string; warning?: boolean }) { return <div className="flex items-center gap-3 rounded-xl bg-white p-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${warning ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}><Icon size={16} /></span><span className="min-w-0"><strong className="block truncate text-xs text-[#354c44]">{title}</strong><small className="block truncate text-[10px] text-[#82918c]">{detail}</small></span></div>; }
function Feature({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) { return <article className="rounded-2xl border border-[#dfe8e4] bg-white p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e6f3ef] text-[#167d63]"><Icon size={20} /></span><h2 className="mt-5 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-[#71817b]">{text}</p></article>; }
