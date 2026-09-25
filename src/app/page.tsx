import Link from "next/link";
import { Clock3, FileCheck2, Plus, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { QueueFilters } from "@/components/submissions/queue-filters";
import { QueueTable } from "@/components/submissions/queue-table";
import { listSubmissions } from "@/lib/db/repository";
import {
  channels,
  productTypes,
  riskLevels,
  submissionStatuses,
  type Channel,
  type ProductType,
  type QueueFilters as QueueFilterValues,
  type RiskLevel,
  type SubmissionStatus,
} from "@/lib/types";

type HomeProps = {
  searchParams: Promise<{
    status?: string;
    risk?: string;
    product?: string;
    channel?: string;
    submittedBy?: string;
  }>;
};

const isStatus = (value?: string): value is SubmissionStatus =>
  submissionStatuses.some((item) => item === value);
const isRisk = (value?: string): value is RiskLevel => riskLevels.some((item) => item === value);
const isProduct = (value?: string): value is ProductType =>
  productTypes.some((item) => item === value);
const isChannel = (value?: string): value is Channel =>
  channels.some((item) => item === value);

export default async function Home({ searchParams }: HomeProps) {
  const rawFilters = await searchParams;
  const filters: QueueFilterValues = {
    status: isStatus(rawFilters.status) ? rawFilters.status : undefined,
    risk: isRisk(rawFilters.risk) ? rawFilters.risk : undefined,
    product: isProduct(rawFilters.product) ? rawFilters.product : undefined,
    channel: isChannel(rawFilters.channel) ? rawFilters.channel : undefined,
    submittedBy: rawFilters.submittedBy?.trim() || undefined,
  };
  const [submissions, allSubmissions] = await Promise.all([
    listSubmissions(filters),
    listSubmissions(),
  ]);
  const latestActivity = Math.max(
    ...allSubmissions.map((item) => new Date(item.updatedAt).getTime()),
  );
  const weekAgo = latestActivity - 7 * 24 * 60 * 60 * 1000;
  const submitters = [...new Set(allSubmissions.map((item) => item.submittedBy))].sort();
  const metrics = [
    {
      label: "In review",
      value: allSubmissions.filter((item) => item.status === "in_review").length,
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

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            <QueueFilters
              filters={[
                { name: "status", label: "All statuses", values: submissionStatuses, selected: filters.status },
                { name: "risk", label: "All risk levels", values: riskLevels, selected: filters.risk },
                { name: "product", label: "All products", values: productTypes, selected: filters.product },
                { name: "channel", label: "All channels", values: channels, selected: filters.channel },
                {
                  name: "submittedBy",
                  label: "All submitters",
                  values: submitters,
                  selected: filters.submittedBy,
                  humanizeValues: false,
                },
              ]}
            />
          </div>
          <QueueTable submissions={submissions} />
        </section>
      </main>
    </AppShell>
  );
}
