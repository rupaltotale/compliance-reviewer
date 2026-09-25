import { cn, humanize } from "@/lib/utils";

const styles: Record<string, string> = {
  high: "bg-red-50 text-red-700 ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  in_review: "bg-blue-50 text-blue-700 ring-blue-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  open: "bg-amber-50 text-amber-800 ring-amber-200",
  resolved: "bg-teal-50 text-teal-700 ring-teal-200",
  dismissed: "bg-violet-50 text-violet-700 ring-violet-200",
};

const descriptions: Record<string, string> = {
  high: "High-priority risk that may materially mislead consumers.",
  medium: "A concern that needs qualification, context, or substantiation.",
  low: "A limited concern unlikely to materially change consumer understanding.",
  in_review: "Active review; findings and request comments can still be updated.",
  approved: "Final approval recorded; the submission and its review items are frozen.",
  open: "Requires review and must be addressed or dismissed before approval.",
  resolved: "The concern was addressed and no longer blocks approval.",
  dismissed: "The reviewer determined this item does not require a change.",
};

export function StatusBadge({ value, dot = false }: { value: string; dot?: boolean }) {
  const label = humanize(value);
  const description = descriptions[value];

  return (
    <span
      title={description}
      aria-label={description ? `${label}: ${description}` : label}
      className={cn(
        "inline-flex cursor-help items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        styles[value] ?? styles.open,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}
