import "server-only";

import {
  demoAuditEvents,
  demoFindings,
  demoReviews,
  demoSubmissions,
} from "@/lib/db/demo-data";
import { getSupabase, isSupabaseConfigured } from "@/lib/db/supabase";
import type { ComplianceAnalysis, NewSubmissionInput } from "@/lib/schemas";
import type {
  AuditEvent,
  ComplianceFinding,
  FindingStatus,
  QueueFilters,
  Review,
  Submission,
  SubmissionDetail,
} from "@/lib/types";

type SubmissionRow = {
  id: string;
  title: string;
  product_type: Submission["productType"];
  channel: Submission["channel"];
  submitted_by: string;
  affiliate_name: string | null;
  content: string;
  destination_url: string | null;
  status: Submission["status"];
  risk_level: Submission["riskLevel"];
  analysis_summary: string | null;
  created_at: string;
  updated_at: string;
};

type FindingRow = {
  id: string;
  submission_id: string;
  category: string;
  severity: ComplianceFinding["severity"];
  flagged_text: string;
  explanation: string;
  recommendation: string;
  status: ComplianceFinding["status"];
  created_at: string;
};

type ReviewRow = {
  id: string;
  submission_id: string;
  reviewer: string;
  decision: Review["decision"];
  comment: string | null;
  created_at: string;
};

type AuditRow = {
  id: string;
  submission_id: string;
  event_type: string;
  actor: string;
  detail: string;
  created_at: string;
};

const mapSubmission = (row: SubmissionRow): Submission => ({
  id: row.id,
  title: row.title,
  productType: row.product_type,
  channel: row.channel,
  submittedBy: row.submitted_by,
  affiliateName: row.affiliate_name,
  content: row.content,
  destinationUrl: row.destination_url,
  status: row.status,
  riskLevel: row.risk_level,
  analysisSummary: row.analysis_summary,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapFinding = (row: FindingRow): ComplianceFinding => ({
  id: row.id,
  submissionId: row.submission_id,
  category: row.category,
  severity: row.severity,
  flaggedText: row.flagged_text,
  explanation: row.explanation,
  recommendation: row.recommendation,
  status: row.status,
  createdAt: row.created_at,
});

const mapReview = (row: ReviewRow): Review => ({
  id: row.id,
  submissionId: row.submission_id,
  reviewer: row.reviewer,
  decision: row.decision,
  comment: row.comment,
  createdAt: row.created_at,
});

const mapAudit = (row: AuditRow): AuditEvent => ({
  id: row.id,
  submissionId: row.submission_id,
  eventType: row.event_type,
  actor: row.actor,
  detail: row.detail,
  createdAt: row.created_at,
});

type DemoStore = {
  submissions: Submission[];
  findings: ComplianceFinding[];
  reviews: Review[];
  auditEvents: AuditEvent[];
};

const globalWithDemo = globalThis as typeof globalThis & { clearPathDemo?: DemoStore };
const demoStore =
  globalWithDemo.clearPathDemo ??
  structuredClone({
    submissions: demoSubmissions,
    findings: demoFindings,
    reviews: demoReviews,
    auditEvents: demoAuditEvents,
  });
globalWithDemo.clearPathDemo = demoStore;

export async function listSubmissions(filters: QueueFilters = {}) {
  if (!isSupabaseConfigured()) {
    return demoStore.submissions
      .filter((item) => !filters.status || item.status === filters.status)
      .filter((item) => !filters.risk || item.riskLevel === filters.risk)
      .filter((item) => !filters.product || item.productType === filters.product)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  let query = getSupabase().from("submissions").select("*").order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.risk) query = query.eq("risk_level", filters.risk);
  if (filters.product) query = query.eq("product_type", filters.product);
  const { data, error } = await query;
  if (error) throw new Error(`Unable to load submissions: ${error.message}`);
  return (data as SubmissionRow[]).map(mapSubmission);
}

export async function getSubmission(id: string): Promise<SubmissionDetail | null> {
  if (!isSupabaseConfigured()) {
    const submission = demoStore.submissions.find((item) => item.id === id);
    return submission
      ? {
          ...submission,
          findings: demoStore.findings.filter((item) => item.submissionId === id),
          reviews: demoStore.reviews.filter((item) => item.submissionId === id),
          auditEvents: demoStore.auditEvents
            .filter((item) => item.submissionId === id)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        }
      : null;
  }

  const supabase = getSupabase();
  const [submissionResult, findingsResult, reviewsResult, auditResult] = await Promise.all([
    supabase.from("submissions").select("*").eq("id", id).maybeSingle(),
    supabase.from("compliance_findings").select("*").eq("submission_id", id).order("created_at"),
    supabase.from("reviews").select("*").eq("submission_id", id).order("created_at", { ascending: false }),
    supabase.from("audit_events").select("*").eq("submission_id", id).order("created_at", { ascending: false }),
  ]);
  const error =
    submissionResult.error ?? findingsResult.error ?? reviewsResult.error ?? auditResult.error;
  if (error) throw new Error(`Unable to load submission: ${error.message}`);
  if (!submissionResult.data) return null;
  return {
    ...mapSubmission(submissionResult.data as SubmissionRow),
    findings: (findingsResult.data as FindingRow[]).map(mapFinding),
    reviews: (reviewsResult.data as ReviewRow[]).map(mapReview),
    auditEvents: (auditResult.data as AuditRow[]).map(mapAudit),
  };
}

export async function setFindingStatus(
  findingId: string,
  status: FindingStatus,
  actor: string,
) {
  if (!isSupabaseConfigured()) {
    const finding = demoStore.findings.find((item) => item.id === findingId);
    if (!finding) throw new Error("Finding not found.");
    finding.status = status;
    demoStore.auditEvents.push({
      id: crypto.randomUUID(),
      submissionId: finding.submissionId,
      eventType: `finding_${status}`,
      actor,
      detail: `Finding ${status}: ${finding.category}`,
      createdAt: new Date().toISOString(),
    });
    return finding.submissionId;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("compliance_findings")
    .update({ status })
    .eq("id", findingId)
    .select("submission_id, category")
    .single();
  if (error) throw new Error(`Unable to update finding: ${error.message}`);
  const { error: auditError } = await supabase.from("audit_events").insert({
    submission_id: data.submission_id,
    event_type: `finding_${status}`,
    actor,
    detail: `Finding ${status}: ${data.category}`,
  });
  if (auditError) throw new Error(`Finding changed, but audit logging failed: ${auditError.message}`);
  return data.submission_id as string;
}

export async function recordDecision(
  submissionId: string,
  reviewer: string,
  decision: Review["decision"],
  comment: string | null,
) {
  if (!isSupabaseConfigured()) {
    const submission = demoStore.submissions.find((item) => item.id === submissionId);
    if (!submission) throw new Error("Submission not found.");
    submission.status = decision;
    submission.updatedAt = new Date().toISOString();
    demoStore.reviews.push({
      id: crypto.randomUUID(),
      submissionId,
      reviewer,
      decision,
      comment,
      createdAt: new Date().toISOString(),
    });
    demoStore.auditEvents.push({
      id: crypto.randomUUID(),
      submissionId,
      eventType: decision,
      actor: reviewer,
      detail: decision === "approved" ? "Submission approved" : "Changes requested",
      createdAt: new Date().toISOString(),
    });
    return;
  }

  const supabase = getSupabase();
  const { error: reviewError } = await supabase.from("reviews").insert({
    submission_id: submissionId,
    reviewer,
    decision,
    comment,
  });
  if (reviewError) throw new Error(`Unable to record decision: ${reviewError.message}`);
  const { error: statusError } = await supabase
    .from("submissions")
    .update({ status: decision })
    .eq("id", submissionId);
  if (statusError) throw new Error(`Decision recorded, but status update failed: ${statusError.message}`);
  const { error: auditError } = await supabase.from("audit_events").insert({
    submission_id: submissionId,
    event_type: decision,
    actor: reviewer,
    detail: decision === "approved" ? "Submission approved" : "Changes requested",
  });
  if (auditError) throw new Error(`Decision recorded, but audit logging failed: ${auditError.message}`);
}

export async function createAnalyzedSubmission(
  input: NewSubmissionInput,
  analysis: ComplianceAnalysis,
) {
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    demoStore.submissions.push({
      id,
      title: input.title,
      productType: input.productType,
      channel: input.channel,
      submittedBy: input.submittedBy,
      affiliateName: input.affiliateName || null,
      content: input.content,
      destinationUrl: input.destinationUrl || null,
      status: "pending",
      riskLevel: analysis.riskLevel,
      analysisSummary: analysis.summary,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    demoStore.findings.push(
      ...analysis.findings.map((finding) => ({
        ...finding,
        id: crypto.randomUUID(),
        submissionId: id,
        status: "open" as const,
        createdAt: timestamp,
      })),
    );
    demoStore.auditEvents.push(
      {
        id: crypto.randomUUID(),
        submissionId: id,
        eventType: "submission_created",
        actor: input.submittedBy,
        detail: "Submission created",
        createdAt: timestamp,
      },
      {
        id: crypto.randomUUID(),
        submissionId: id,
        eventType: "analysis_completed",
        actor: "ClearPath AI",
        detail: `Automated pre-review completed with ${analysis.findings.length} potential issues`,
        createdAt: new Date(Date.now() + 1).toISOString(),
      },
    );
    return id;
  }

  const supabase = getSupabase();
  const { error: submissionError } = await supabase.from("submissions").insert({
    id,
    title: input.title,
    product_type: input.productType,
    channel: input.channel,
    submitted_by: input.submittedBy,
    affiliate_name: input.affiliateName || null,
    content: input.content,
    destination_url: input.destinationUrl || null,
    status: "pending",
    risk_level: analysis.riskLevel,
    analysis_summary: analysis.summary,
  });
  if (submissionError) throw new Error(`Unable to save submission: ${submissionError.message}`);

  if (analysis.findings.length > 0) {
    const { error: findingsError } = await supabase.from("compliance_findings").insert(
      analysis.findings.map((finding) => ({
        submission_id: id,
        category: finding.category,
        severity: finding.severity,
        flagged_text: finding.flaggedText,
        explanation: finding.explanation,
        recommendation: finding.recommendation,
      })),
    );
    if (findingsError) throw new Error(`Submission saved, but findings failed: ${findingsError.message}`);
  }
  const { error: auditError } = await supabase.from("audit_events").insert([
    {
      submission_id: id,
      event_type: "submission_created",
      actor: input.submittedBy,
      detail: "Submission created",
    },
    {
      submission_id: id,
      event_type: "analysis_completed",
      actor: "ClearPath AI",
      detail: `Automated pre-review completed with ${analysis.findings.length} potential issues`,
    },
  ]);
  if (auditError) throw new Error(`Submission saved, but audit logging failed: ${auditError.message}`);
  return id;
}
