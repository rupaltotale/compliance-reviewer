"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { analyzeMarketing } from "@/lib/ai/analyze-marketing";
import { generateRevision } from "@/lib/ai/generate-revision";
import {
  createAnalyzedSubmission,
  createSubmissionVersion,
  getSubmission,
  recordDecision,
  setFindingStatus,
} from "@/lib/db/repository";
import { newSubmissionSchema } from "@/lib/schemas";
import { findingStatuses } from "@/lib/types";

const demoReviewer = "Alex Morgan";

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
    const submission = await getSubmission(submissionId);
    if (!submission) return { message: "The source submission could not be found." };
    const requestedFindings = submission.findings.filter(
      (finding) => finding.status === "requested",
    );
    if (requestedFindings.length === 0) {
      return { message: "Select at least one requested change before generating a revision." };
    }
    const reviewerComment = submission.reviews.find(
      (review) => review.decision === "changes_requested",
    )?.comment;
    const firstDraft = await generateRevision({
      productType: submission.productType,
      channel: submission.channel,
      content: submission.content,
      concerns: requestedFindings,
      reviewerComment,
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
        reviewerComment:
          "This is an internal corrective pass. Address the remaining pre-review findings without inventing product terms.",
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
  const parsed = newSubmissionSchema.safeParse({
    title: formData.get("title"),
    productType: formData.get("productType"),
    channel: formData.get("channel"),
    submittedBy: formData.get("submittedBy"),
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
  const parsed = newSubmissionSchema.safeParse({
    title: formData.get("title"),
    productType: formData.get("productType"),
    channel: formData.get("channel"),
    submittedBy: formData.get("submittedBy"),
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
  const findingId = String(formData.get("findingId") ?? "");
  const requestedStatus = String(formData.get("status") ?? "");
  const status = findingStatuses.find((value) => value === requestedStatus);
  if (!findingId || !status) {
    throw new Error("A valid finding and resolution are required.");
  }
  const submissionId = await setFindingStatus(findingId, status, demoReviewer);
  revalidatePath("/");
  revalidatePath(`/submissions/${submissionId}`);
}

export type DecisionActionState = { message?: string; success?: boolean };

export async function submitDecisionAction(
  submissionId: string,
  _previousState: DecisionActionState,
  formData: FormData,
): Promise<DecisionActionState> {
  const decision = formData.get("decision");
  const comment = String(formData.get("comment") ?? "").trim();
  if (decision !== "approved" && decision !== "changes_requested") {
    return { message: "Choose a review decision." };
  }
  const submission = await getSubmission(submissionId);
  if (!submission) {
    return { message: "The submission could not be found." };
  }
  const requestedFindings = submission.findings.filter(
    (finding) => finding.status === "requested",
  );
  if (decision === "approved" && requestedFindings.length > 0) {
    return {
      message: "Remove or dismiss requested changes before approving this submission.",
    };
  }
  if (decision === "changes_requested" && comment.length < 10) {
    return { message: "Explain the requested changes in at least 10 characters." };
  }
  await recordDecision(submissionId, demoReviewer, decision, comment || null);
  revalidatePath("/");
  revalidatePath(`/submissions/${submissionId}`);
  return { success: true, message: "Decision recorded in the audit trail." };
}
