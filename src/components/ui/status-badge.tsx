import { cn, humanize } from "@/lib/utils";

const styles: Record<string, string> = {
  high: "bg-red-50 text-red-700 ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  in_review: "bg-blue-50 text-blue-700 ring-blue-200",
  changes_requested: "bg-orange-50 text-orange-700 ring-orange-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  open: "bg-slate-100 text-slate-700 ring-slate-200",
  requested: "bg-orange-50 text-orange-700 ring-orange-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  dismissed: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusBadge({ value, dot = false }: { value: string; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        styles[value] ?? styles.open,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {humanize(value)}
    </span>
  );
}
