export default function Loading() {
  return (
    <div
      className="grid min-h-screen place-items-center bg-[#f4f7f6]"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-[#cfe0da] border-t-[#167d63]" />
        <p className="mt-4 text-sm font-medium text-[#60736b]">
          Loading care workspace…
        </p>
      </div>
    </div>
  );
}
