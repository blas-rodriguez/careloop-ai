"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-[#167d63] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d6852] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Saving..." : children}
    </button>
  );
}
