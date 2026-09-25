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
  submission_group_id?: string;
  version_number?: number;
  previous_version_id?: string | null;
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
  severity_rationale?: string;
  flagged_text: string;
  explanation: string;
  recommendation: string;
  suggested_rewrites?: string[];
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
  submissionGroupId: row.submission_group_id ?? row.id,
  versionNumber: row.version_number ?? 1,
  previousVersionId: row.previous_version_id ?? null,
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

const defaultSeverityRationale = (severity: ComplianceFinding["severity"]) => {
  if (severity === "high") {
    return "High because the claim could materially mislead consumers about approval, eligibility, pricing, cost, or comparative value.";
  }
  if (severity === "medium") {
    return "Medium because the claim needs qualification, context, or substantiation but is not an explicit material guarantee.";
  }
  return "Low because the concern is limited and is unlikely to materially change a reasonable consumer’s understanding.";
};

const mapFinding = (row: FindingRow): ComplianceFinding => ({
  id: row.id,
  submissionId: row.submission_id,
  category: row.category,
  severity: row.severity,
  severityRationale: row.severity_rationale ?? defaultSeverityRationale(row.severity),
  flaggedText: row.flagged_text,
  explanation: row.explanation,
  recommendation: row.recommendation,
  suggestedRewrites: row.suggested_rewrites ?? [],
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

function latestVersions(submissions: Submission[]) {
  return [...submissions]
    .sort((a, b) => b.versionNumber - a.versionNumber)
    .filter(
      (submission, index, sorted) =>
        sorted.findIndex((item) => item.submissionGroupId === submission.submissionGroupId) ===
        index,
    );
}

export async function listSubmissions(filters: QueueFilters = {}) {
  if (!isSupabaseConfigured()) {
    return latestVersions(demoStore.submissions)
      .filter((item) => !filters.status || item.status === filters.status)
      .filter((item) => !filters.risk || item.riskLevel === filters.risk)
      .filter((item) => !filters.product || item.productType === filters.product)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const { data, error } = await getSupabase()
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Unable to load submissions: ${error.message}`);
  return latestVersions((data as SubmissionRow[]).map(mapSubmission))
    .filter((item) => !filters.status || item.status === filters.status)
    .filter((item) => !filters.risk || item.riskLevel === filters.risk)
    .filter((item) => !filters.product || item.productType === filters.product);
}

export async function getSubmissionVersions(groupId: string) {
  if (!isSupabaseConfigured()) {
    return demoStore.submissions
      .filter((item) => item.submissionGroupId === groupId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }
  const { data, error } = await getSupabase()
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Unable to load submission versions: ${error.message}`);
  return (data as SubmissionRow[])
    .map(mapSubmission)
    .filter((item) => item.submissionGroupId === groupId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
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
  const eventDetail = (category: string) => {
    if (status === "requested") return `Added to change request: ${category}`;
    if (status === "open") return `Removed from change request: ${category}`;
    if (status === "dismissed") return `Finding dismissed: ${category}`;
    return `Finding resolved: ${category}`;
  };
  if (!isSupabaseConfigured()) {
    const finding = demoStore.findings.find((item) => item.id === findingId);
    if (!finding) throw new Error("Finding not found.");
    finding.status = status;
    demoStore.auditEvents.push({
      id: crypto.randomUUID(),
      submissionId: finding.submissionId,
      eventType: `finding_${status}`,
      actor,
      detail: eventDetail(finding.category),
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
    detail: eventDetail(data.category),
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

type VersionMetadata = {
  id: string;
  submissionGroupId: string;
  versionNumber: number;
  previousVersionId: string | null;
};

async function persistAnalyzedSubmission(
  input: NewSubmissionInput,
  analysis: ComplianceAnalysis,
  version: VersionMetadata,
) {
  const timestamp = new Date().toISOString();
  const creationDetail =
    version.versionNumber === 1
      ? "Submission created"
      : `Version ${version.versionNumber} created from version ${version.versionNumber - 1}`;
  if (!isSupabaseConfigured()) {
    demoStore.submissions.push({
      id: version.id,
      submissionGroupId: version.submissionGroupId,
      versionNumber: version.versionNumber,
      previousVersionId: version.previousVersionId,
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
        submissionId: version.id,
        status: "open" as const,
        createdAt: timestamp,
      })),
    );
    demoStore.auditEvents.push(
      {
        id: crypto.randomUUID(),
        submissionId: version.id,
        eventType: version.versionNumber === 1 ? "submission_created" : "version_created",
        actor: input.submittedBy,
        detail: creationDetail,
        createdAt: timestamp,
      },
      {
        id: crypto.randomUUID(),
        submissionId: version.id,
        eventType: "analysis_completed",
        actor: "ClearPath AI",
        detail: `Automated pre-review completed with ${analysis.findings.length} potential issues`,
        createdAt: new Date(Date.now() + 1).toISOString(),
      },
    );
    if (version.previousVersionId) {
      demoStore.auditEvents.push({
        id: crypto.randomUUID(),
        submissionId: version.previousVersionId,
        eventType: "new_version_created",
        actor: input.submittedBy,
        detail: `Version ${version.versionNumber} created`,
        createdAt: timestamp,
      });
    }
    return version.id;
  }

  const supabase = getSupabase();
  const { error: submissionError } = await supabase.from("submissions").insert({
    id: version.id,
    submission_group_id: version.submissionGroupId,
    version_number: version.versionNumber,
    previous_version_id: version.previousVersionId,
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
        submission_id: version.id,
        category: finding.category,
        severity: finding.severity,
        severity_rationale: finding.severityRationale,
        flagged_text: finding.flaggedText,
        explanation: finding.explanation,
        recommendation: finding.recommendation,
        suggested_rewrites: finding.suggestedRewrites,
      })),
    );
    if (findingsError) throw new Error(`Submission saved, but findings failed: ${findingsError.message}`);
  }
  const auditEvents = [
    {
      submission_id: version.id,
      event_type: version.versionNumber === 1 ? "submission_created" : "version_created",
      actor: input.submittedBy,
      detail: creationDetail,
    },
    {
      submission_id: version.id,
      event_type: "analysis_completed",
      actor: "ClearPath AI",
      detail: `Automated pre-review completed with ${analysis.findings.length} potential issues`,
    },
    ...(version.previousVersionId
      ? [
          {
            submission_id: version.previousVersionId,
            event_type: "new_version_created",
            actor: input.submittedBy,
            detail: `Version ${version.versionNumber} created`,
          },
        ]
      : []),
  ];
  const { error: auditError } = await supabase.from("audit_events").insert(auditEvents);
  if (auditError) throw new Error(`Submission saved, but audit logging failed: ${auditError.message}`);
  return version.id;
}

export async function createAnalyzedSubmission(
  input: NewSubmissionInput,
  analysis: ComplianceAnalysis,
) {
  const id = crypto.randomUUID();
  return persistAnalyzedSubmission(input, analysis, {
    id,
    submissionGroupId: id,
    versionNumber: 1,
    previousVersionId: null,
  });
}

export async function createSubmissionVersion(
  sourceSubmissionId: string,
  input: NewSubmissionInput,
  analysis: ComplianceAnalysis,
) {
  if (!isSupabaseConfigured()) {
    const source = demoStore.submissions.find((item) => item.id === sourceSubmissionId);
    if (!source) throw new Error("The source submission could not be found.");
    const versionNumber =
      Math.max(
        ...demoStore.submissions
          .filter((item) => item.submissionGroupId === source.submissionGroupId)
          .map((item) => item.versionNumber),
      ) + 1;
    return persistAnalyzedSubmission(input, analysis, {
      id: crypto.randomUUID(),
      submissionGroupId: source.submissionGroupId,
      versionNumber,
      previousVersionId: source.id,
    });
  }

  const supabase = getSupabase();
  const { data: sourceData, error: sourceError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", sourceSubmissionId)
    .maybeSingle();
  if (sourceError) throw new Error(`Unable to load the source submission: ${sourceError.message}`);
  if (!sourceData) throw new Error("The source submission could not be found.");
  const source = mapSubmission(sourceData as SubmissionRow);
  const { data: latestData, error: latestError } = await supabase
    .from("submissions")
    .select("version_number")
    .eq("submission_group_id", source.submissionGroupId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();
  if (latestError) throw new Error(`Unable to determine the next version: ${latestError.message}`);

  return persistAnalyzedSubmission(input, analysis, {
    id: crypto.randomUUID(),
    submissionGroupId: source.submissionGroupId,
    versionNumber: Number(latestData.version_number) + 1,
    previousVersionId: source.id,
  });
}
