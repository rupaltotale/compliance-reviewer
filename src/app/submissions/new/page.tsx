import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { getDemoRole } from "@/lib/demo-role-server";

export default async function NewSubmissionPage() {
  if ((await getDemoRole()) !== "submitter") redirect("/");

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-6 py-8 lg:py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4" /> Back to review queue
        </Link>
        <div className="mt-6 flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-700 text-white">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">New marketing submission</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Submit consumer-facing copy for an automated first pass. Findings will enter the queue for human review.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <SubmissionForm />
        </div>
      </main>
    </AppShell>
  );
}
