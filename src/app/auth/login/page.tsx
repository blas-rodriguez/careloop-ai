import Link from "next/link";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return <main className="grid min-h-screen bg-[#f4f7f6] lg:grid-cols-[1.05fr_.95fr]">
    <section className="hidden bg-[#102f29] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#36b48d]"><HeartPulse size={25}/></span><div><strong className="block text-xl">CareLoop AI</strong><small className="text-emerald-100/60">Post-care, connected</small></div></div>
      <div className="max-w-xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[#55d4ad]">AI-powered follow-up</p><h1 className="mt-5 text-5xl font-bold leading-[1.08] tracking-tight">Every patient deserves to feel cared for after they leave.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-emerald-50/65">Automated calls collect patient-reported outcomes and give care teams clear, actionable follow-up insights.</p></div>
      <p className="text-xs text-emerald-100/45">Hackathon demo · All patient records are fictional</p>
    </section>
    <section className="flex items-center justify-center p-6 md:p-12"><div className="w-full max-w-md"><Link href="/showcase" className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#60736b] hover:text-[#167d63]"><ArrowLeft size={14}/>Back to project overview</Link><div className="mb-9 lg:hidden"><div className="flex items-center gap-2 text-[#167d63]"><HeartPulse/><strong className="text-lg text-[#17362d]">CareLoop AI</strong></div></div><LoginForm/></div></section>
  </main>;
}
