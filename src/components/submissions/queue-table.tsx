import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Submission } from "@/lib/types";
import { formatDate, humanize } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

export function QueueTable({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <div className="grid min-h-52 place-items-center rounded-b-xl border border-t-0 border-slate-200 bg-white text-sm text-slate-500">
        No submissions match these filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-b-xl border border-t-0 border-slate-200 bg-white">
      <table className="w-full min-w-[950px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Submission</th>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Channel</th>
            <th className="px-4 py-3">Submitted by</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="w-10 px-4 py-3"><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {submissions.map((submission) => (
            <tr key={submission.id} className="group hover:bg-slate-50/80">
              <td className="max-w-xs px-5 py-4">
                <Link href={`/submissions/${submission.id}`} className="font-semibold text-slate-900 hover:text-teal-700">
                  {submission.title}
                </Link>
                {submission.affiliateName && (
                  <p className="mt-0.5 truncate text-xs text-slate-500">{submission.affiliateName}</p>
                )}
              </td>
              <td className="px-4 py-4 text-slate-600">{humanize(submission.productType)}</td>
              <td className="px-4 py-4 text-slate-600">{humanize(submission.channel)}</td>
              <td className="px-4 py-4 text-slate-600">{submission.submittedBy}</td>
              <td className="px-4 py-4"><StatusBadge value={submission.riskLevel} dot /></td>
              <td className="px-4 py-4"><StatusBadge value={submission.status} /></td>
              <td className="px-4 py-4 text-slate-500">{formatDate(submission.createdAt, { year: undefined })}</td>
              <td className="px-4 py-4">
                <ArrowUpRight className="size-4 text-slate-300 group-hover:text-teal-700" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
