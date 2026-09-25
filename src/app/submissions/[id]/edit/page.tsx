import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FilePenLine } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { getSubmission, getSubmissionVersions } from "@/lib/db/repository";
import { getDemoUser } from "@/lib/demo-role-server";

type EditProps = { params: Promise<{ id: string }> };

export default async function EditSubmissionPage({ params }: EditProps) {
  const user = await getDemoUser();
  if (user.role !== "submitter") redirect("/");
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();
  if (submission.submittedBy !== user.name) redirect("/");
  const versions = await getSubmissionVersions(submission.submissionGroupId);
  const latest = versions[0];
  if (latest && latest.id !== submission.id) {
    redirect(`/submissions/${latest.id}/edit`);
  }
  if (submission.status === "approved") {
    redirect(`/submissions/${submission.id}`);
  }
  const outstandingFindings = submission.findings.filter(
    (finding) => finding.status === "open",
  );
  const outstandingRequestComments = submission.requestComments.filter(
    (requestComment) => requestComment.status === "open",
  );

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-6 py-8 lg:py-10">
        <Link
          href={`/submissions/${submission.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Back to submission
        </Link>
        <div className="mt-6 flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-700 text-white">
            <FilePenLine className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-teal-700">
              Editing version {submission.versionNumber}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
              Create a new submission version
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Your changes will become version {submission.versionNumber + 1}. Existing findings,
              decisions, and audit history remain attached to version {submission.versionNumber}.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <SubmissionForm
            sourceSubmissionId={submission.id}
            nextVersion={submission.versionNumber + 1}
            openFindings={outstandingFindings}
            openRequestComments={outstandingRequestComments}
            initialValues={{
              title: submission.title,
              productType: submission.productType,
              channel: submission.channel,
              affiliateName: submission.affiliateName ?? "",
              destinationUrl: submission.destinationUrl ?? "",
              content: submission.content,
            }}
          />
        </div>
      </main>
    </AppShell>
  );
}
