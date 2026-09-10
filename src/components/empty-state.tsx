import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="grid place-items-center px-5 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7f3ef] text-[#167d63]">
        <Icon size={22} />
      </span>
      <h3 className="mt-4 font-semibold text-[#29473e]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-[#74857f]">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 rounded-xl bg-[#167d63] px-4 py-2.5 text-sm font-semibold text-white"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
