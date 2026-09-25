"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { analyzeMarketing } from "@/lib/ai/analyze-marketing";
import { generateRevision } from "@/lib/ai/generate-revision";
import { requireDemoRole } from "@/lib/demo-role-server";
import {
  createAnalyzedSubmission,
  createRequestComment,
  createSubmissionVersion,
  getSubmission,
  recordApproval,
  setFindingStatus,
  setRequestCommentStatus,
} from "@/lib/db/repository";
import { newSubmissionSchema } from "@/lib/schemas";

export type SubmissionActionState = {
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export type RevisionDraftActionState = {
  draft?: string;
  changeSummary?: string;
  riskLevel?: "low" | "medium" | "high";
  analysisSummary?: string;
  remainingFindings?: Array<{
    category: string;
    severity: "low" | "medium" | "high";
    explanation: string;
  }>;
  passes?: number;
  message?: string;
};

export async function generateRevisionDraftAction(
  submissionId: string,
): Promise<RevisionDraftActionState> {
  try {
    const submitter = await requireDemoRole("submitter");
    const submission = await getSubmission(submissionId);
    if (!submission) return { message: "The source submission could not be found." };
    if (submission.submittedBy !== submitter.name) {
      return { message: "Submitters can only revise their own submissions." };
    }
    if (submission.status === "approved") {
      return { message: "Approved submissions are frozen." };
    }
    const outstandingFindings = submission.findings.filter(
      (finding) => finding.status === "open",
    );
    const outstandingComments = submission.requestComments.filter(
      (requestComment) => requestComment.status === "open",
    );
    if (outstandingFindings.length === 0 && outstandingComments.length === 0) {
      return { message: "There are no open findings or request comments to include." };
    }
    const firstDraft = await generateRevision({
      productType: submission.productType,
      channel: submission.channel,
      content: submission.content,
      concerns: outstandingFindings,
      requestComments: outstandingComments.map((requestComment) => requestComment.comment),
    });
    let finalDraft = firstDraft;
    let analysis = await analyzeMarketing({
      productType: submission.productType,
      channel: submission.channel,
      content: firstDraft.content,
      destinationUrl: submission.destinationUrl,
    });
    let passes = 1;

    if (analysis.findings.length > 0 && process.env.OPENAI_API_KEY) {
      finalDraft = await generateRevision({
        productType: submission.productType,
        channel: submission.channel,
        content: firstDraft.content,
        concerns: analysis.findings,
        requestComments: outstandingComments.map((requestComment) => requestComment.comment),
      });
      analysis = await analyzeMarketing({
        productType: submission.productType,
        channel: submission.channel,
        content: finalDraft.content,
        destinationUrl: submission.destinationUrl,
      });
      passes = 2;
    }

    return {
      draft: finalDraft.content,
      changeSummary: finalDraft.changeSummary,
      riskLevel: analysis.riskLevel,
      analysisSummary: analysis.summary,
      remainingFindings: analysis.findings.map((finding) => ({
        category: finding.category,
        severity: finding.severity,
        explanation: finding.explanation,
      })),
      passes,
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "The revision could not be generated.",
    };
  }
}

export async function createSubmissionAction(
  _previousState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const submitter = await requireDemoRole("submitter");
  const parsed = newSubmissionSchema.safeParse({
    title: formData.get("title"),
    productType: formData.get("productType"),
    channel: formData.get("channel"),
    submittedBy: submitter.name,
    affiliateName: formData.get("affiliateName"),
    content: formData.get("content"),
    destinationUrl: formData.get("destinationUrl"),
  });
  if (!parsed.success) {
    return {
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let id: string;
  try {
    const analysis = await analyzeMarketing({
      productType: parsed.data.productType,
      channel: parsed.data.channel,
      content: parsed.data.content,
      destinationUrl: parsed.data.destinationUrl,
    });
    id = await createAnalyzedSubmission(parsed.data, analysis);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "The submission could not be analyzed.",
    };
  }
  revalidatePath("/");
  redirect(`/submissions/${id}`);
}

export async function createSubmissionVersionAction(
  sourceSubmissionId: string,
  _previousState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const submitter = await requireDemoRole("submitter");
  const sourceSubmission = await getSubmission(sourceSubmissionId);
  if (!sourceSubmission) {
    return { message: "The source submission could not be found." };
  }
  if (sourceSubmission.status === "approved") {
    return { message: "Approved submissions are frozen and cannot have new versions." };
  }
  if (sourceSubmission.submittedBy !== submitter.name) {
    return { message: "Submitters can only revise their own submissions." };
  }
  const parsed = newSubmissionSchema.safeParse({
    title: formData.get("title"),
    productType: formData.get("productType"),
    channel: formData.get("channel"),
    submittedBy: submitter.name,
    affiliateName: formData.get("affiliateName"),
    content: formData.get("content"),
    destinationUrl: formData.get("destinationUrl"),
  });
  if (!parsed.success) {
    return {
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let id: string;
  try {
    const analysis = await analyzeMarketing({
      productType: parsed.data.productType,
      channel: parsed.data.channel,
      content: parsed.data.content,
      destinationUrl: parsed.data.destinationUrl,
    });
    id = await createSubmissionVersion(sourceSubmissionId, parsed.data, analysis);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "The new version could not be analyzed.",
    };
  }
  revalidatePath("/");
  revalidatePath(`/submissions/${sourceSubmissionId}`);
  redirect(`/submissions/${id}`);
}

export async function updateFindingAction(formData: FormData) {
  const reviewer = await requireDemoRole("reviewer");
  const findingId = String(formData.get("findingId") ?? "");
  const requestedStatus = String(formData.get("status") ?? "");
  const status =
    requestedStatus === "resolved" || requestedStatus === "dismissed"
      ? requestedStatus
      : undefined;
  if (!findingId || !status) {
    throw new Error("A valid finding and resolution are required.");
  }
  const submissionId = await setFindingStatus(findingId, status, reviewer.name);
  revalidatePath("/");
  revalidatePath(`/submissions/${submissionId}`);
}

export async function createRequestCommentAction(
  submissionId: string,
  formData: FormData,
) {
  const reviewer = await requireDemoRole("reviewer");
  const comment = String(formData.get("comment") ?? "").trim();
  if (comment.length < 3 || comment.length > 2000) {
    throw new Error("Request comments must be between 3 and 2,000 characters.");
  }
  await createRequestComment(submissionId, comment, reviewer.name);
  revalidatePath(`/submissions/${submissionId}`);
}

export async function updateRequestCommentAction(formData: FormData) {
  const reviewer = await requireDemoRole("reviewer");
  const commentId = String(formData.get("commentId") ?? "");
  const requestedStatus = String(formData.get("status") ?? "");
  const status =
    requestedStatus === "resolved" || requestedStatus === "dismissed"
      ? requestedStatus
      : undefined;
  if (!commentId || !status) {
    throw new Error("A valid request comment and resolution are required.");
  }
  const submissionId = await setRequestCommentStatus(commentId, status, reviewer.name);
  revalidatePath(`/submissions/${submissionId}`);
}

export type DecisionActionState = { message?: string; success?: boolean };

export async function submitDecisionAction(
  submissionId: string,
  _previousState: DecisionActionState,
  formData: FormData,
): Promise<DecisionActionState> {
  const reviewer = await requireDemoRole("reviewer");
  const comment = String(formData.get("comment") ?? "").trim();
  const submission = await getSubmission(submissionId);
  if (!submission) {
    return { message: "The submission could not be found." };
  }
  const outstandingFindings = submission.findings.filter(
    (finding) => finding.status === "open",
  );
  const outstandingComments = submission.requestComments.filter(
    (requestComment) => requestComment.status === "open",
  );
  if (outstandingFindings.length > 0 || outstandingComments.length > 0) {
    return {
      message: "Address or dismiss every open finding and request comment before approving.",
    };
  }
  try {
    await recordApproval(submissionId, reviewer.name, comment || null);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "The approval could not be recorded.",
    };
  }
  revalidatePath("/");
  revalidatePath(`/submissions/${submissionId}`);
  return { success: true, message: "Decision recorded in the audit trail." };
}
