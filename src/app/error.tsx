"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f7f6] p-6">
      <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm">
        <AlertTriangle className="mx-auto text-rose-600" size={32} />
        <h2 className="mt-4 text-xl font-bold text-[#17362d]">
          We couldn&apos;t load this view
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#71817b]">
          Your information was not changed. Try again, or return to the
          dashboard if the problem continues.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-xl bg-[#167d63] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
