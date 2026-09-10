"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function authenticate(mode: "login" | "signup") {
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/confirm`,
            },
          });
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setMessage(
        "Account created. Check your email to confirm it, then sign in.",
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-[#dce6e2] bg-white p-7 shadow-[0_20px_70px_rgba(22,58,48,.09)] sm:p-9">
      <p className="text-sm font-semibold text-[#167d63]">Clinic workspace</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17362d]">
        Welcome back
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#71817b]">
        Sign in to manage follow-ups and patient-reported outcomes.
      </p>
      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void authenticate("login");
        }}
      >
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-[#445a52]">
            Email address
          </span>
          <span className="relative block">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#82918c]"
              size={17}
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              autoComplete="email"
              placeholder="you@clinic.com"
              className="w-full rounded-xl border border-[#dce6e2] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#58a992] focus:ring-2 focus:ring-[#58a992]/15"
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-[#445a52]">
            Password
          </span>
          <span className="relative block">
            <LockKeyhole
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#82918c]"
              size={17}
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-[#dce6e2] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#58a992] focus:ring-2 focus:ring-[#58a992]/15"
            />
          </span>
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700"
          >
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
            {message}
          </p>
        )}
        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#167d63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d6852] disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Sign in"}
          <ArrowRight size={17} />
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void authenticate("signup")}
          className="w-full rounded-xl border border-[#b9d2ca] px-4 py-3 text-sm font-semibold text-[#167d63] hover:bg-[#f4f9f7]"
        >
          Create demo account
        </button>
      </form>
      <p className="mt-6 text-center text-[11px] leading-5 text-[#899691]">
        Authorized clinic staff only. CareLoop does not provide medical advice
        or emergency assistance.
      </p>
    </div>
  );
}
