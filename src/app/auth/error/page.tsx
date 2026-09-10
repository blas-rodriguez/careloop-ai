import Link from "next/link";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f7f6] p-6">
      <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl shadow-rose-950/5">
        <p className="text-sm font-semibold text-rose-700">
          Authentication error
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#17362d]">
          We couldn&apos;t confirm your account
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#71817b]">
          {message ??
            "The link may have expired. Please try signing in or creating the account again."}
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-flex rounded-xl bg-[#167d63] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Return to sign in
        </Link>
      </div>
    </main>
  );
}
