"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { analyzeMarketing } from "@/lib/ai/analyze-marketing";
import {
  createAnalyzedSubmission,
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

export async function updateFindingAction(formData: FormData) {
  const findingId = String(formData.get("findingId") ?? "");
  const requestedStatus = String(formData.get("status") ?? "");
  const status = findingStatuses.find((value) => value === requestedStatus);
  if (!findingId || !status || status === "open") {
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
  if (decision === "changes_requested" && comment.length < 10) {
    return { message: "Explain the requested changes in at least 10 characters." };
  }
  await recordDecision(submissionId, demoReviewer, decision, comment || null);
  revalidatePath("/");
  revalidatePath(`/submissions/${submissionId}`);
  return { success: true, message: "Decision recorded in the audit trail." };
}
