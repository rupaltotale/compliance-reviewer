import Link from "next/link";
import { ArrowRight, Clock3, FileCheck2, Plus, ShieldAlert, Timer } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { QueueTable } from "@/components/submissions/queue-table";
import { listSubmissions } from "@/lib/db/repository";
import {
  productTypes,
  riskLevels,
  submissionStatuses,
  type QueueFilters,
  type RiskLevel,
  type SubmissionStatus,
  type ProductType,
} from "@/lib/types";
import { humanize } from "@/lib/utils";

type HomeProps = {
  searchParams: Promise<{ status?: string; risk?: string; product?: string }>;
};

const isStatus = (value?: string): value is SubmissionStatus =>
  submissionStatuses.some((item) => item === value);
const isRisk = (value?: string): value is RiskLevel => riskLevels.some((item) => item === value);
const isProduct = (value?: string): value is ProductType =>
  productTypes.some((item) => item === value);

export default async function Home({ searchParams }: HomeProps) {
  const rawFilters = await searchParams;
  const filters: QueueFilters = {
    status: isStatus(rawFilters.status) ? rawFilters.status : undefined,
    risk: isRisk(rawFilters.risk) ? rawFilters.risk : undefined,
    product: isProduct(rawFilters.product) ? rawFilters.product : undefined,
  };
  const [submissions, allSubmissions] = await Promise.all([
    listSubmissions(filters),
    listSubmissions(),
  ]);
  const latestActivity = Math.max(
    ...allSubmissions.map((item) => new Date(item.updatedAt).getTime()),
  );
  const weekAgo = latestActivity - 7 * 24 * 60 * 60 * 1000;
  const decided = allSubmissions.filter(
    (item) => item.status === "approved" || item.status === "changes_requested",
  );
  const averageReviewMs =
    decided.reduce(
      (total, item) =>
        total + (new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime()),
      0,
    ) / Math.max(decided.length, 1);
  const averageHours = Math.max(1, Math.round(averageReviewMs / 3_600_000));
  const metrics = [
    {
      label: "Pending reviews",
      value: allSubmissions.filter((item) => item.status === "pending" || item.status === "in_review").length,
      detail: "Awaiting a final decision",
      icon: Clock3,
      tone: "text-blue-700 bg-blue-50",
    },
    {
      label: "High risk",
      value: allSubmissions.filter((item) => item.riskLevel === "high" && item.status !== "approved").length,
      detail: "Prioritize these submissions",
      icon: ShieldAlert,
      tone: "text-red-700 bg-red-50",
    },
    {
      label: "Approved this week",
      value: allSubmissions.filter(
        (item) => item.status === "approved" && new Date(item.updatedAt).getTime() >= weekAgo,
      ).length,
      detail: "Final decisions recorded",
      icon: FileCheck2,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Average review time",
      value: `${averageHours}h`,
      detail: "Submission to decision",
      icon: Timer,
      tone: "text-violet-700 bg-violet-50",
    },
  ];

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-teal-700">Compliance operations</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Review queue</h1>
            <p className="mt-2 text-sm text-slate-500">Prioritize risk, review AI findings, and record human decisions.</p>
          </div>
          <Link
            href="/submissions/new"
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            <Plus className="size-4" /> New submission
          </Link>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
                </div>
                <span className={`grid size-9 place-items-center rounded-lg ${metric.tone}`}>
                  <metric.icon className="size-4.5" />
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-400">{metric.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 rounded-t-xl border border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">All submissions</h2>
              <p className="mt-0.5 text-xs text-slate-500">{submissions.length} items in this view</p>
            </div>
            <form className="flex flex-wrap gap-2">
              <Filter name="status" label="All statuses" values={submissionStatuses} selected={filters.status} />
              <Filter name="risk" label="All risk levels" values={riskLevels} selected={filters.risk} />
              <Filter name="product" label="All products" values={productTypes} selected={filters.product} />
              <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Apply <ArrowRight className="size-3" />
              </button>
              {(filters.status || filters.risk || filters.product) && (
                <Link href="/" className="px-2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900">Clear</Link>
              )}
            </form>
          </div>
          <QueueTable submissions={submissions} />
        </section>
      </main>
    </AppShell>
  );
}

function Filter({
  name,
  label,
  values,
  selected,
}: {
  name: string;
  label: string;
  values: readonly string[];
  selected?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={selected ?? ""}
      aria-label={label}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-teal-600"
    >
      <option value="">{label}</option>
      {values.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
    </select>
  );
}
