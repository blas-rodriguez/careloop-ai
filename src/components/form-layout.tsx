import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export function FormLayout({
  title,
  eyebrow,
  description,
  backHref,
  error,
  children,
  active,
}: {
  title: string;
  eyebrow: string;
  description: string;
  backHref: string;
  error?: string;
  children: React.ReactNode;
  active: string;
}) {
  return (
    <AppShell active={active}>
      <div className="mx-auto max-w-3xl">
        <Link
          href={backHref}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#63756e] hover:text-[#167d63]"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="mb-7">
          <p className="mb-1 text-sm font-medium text-[#167d63]">{eyebrow}</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#17362d] md:text-[30px]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[#70817b]">{description}</p>
        </div>
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        <section className="rounded-2xl border border-[#dfe8e4] bg-white p-4 shadow-[0_2px_10px_rgba(23,54,45,.035)] sm:p-6 md:p-8">
          {children}
        </section>
      </div>
    </AppShell>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-[#dce6e2] bg-[#f9fbfa] px-3 py-2.5 text-sm text-[#354c44] outline-none focus:border-[#58a992] focus:ring-2 focus:ring-[#58a992]/15";
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-xs font-semibold text-[#536860]">
      {children}
    </span>
  );
}
