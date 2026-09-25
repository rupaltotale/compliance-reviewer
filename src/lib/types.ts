export const productTypes = ["personal_loan", "credit_card", "mortgage"] as const;
export const channels = ["website", "email", "paid_social", "affiliate", "other"] as const;
export const submissionStatuses = ["pending", "in_review", "changes_requested", "approved"] as const;
export const riskLevels = ["low", "medium", "high"] as const;
export const findingStatuses = ["open", "requested", "resolved", "dismissed"] as const;

export type ProductType = (typeof productTypes)[number];
export type Channel = (typeof channels)[number];
export type SubmissionStatus = (typeof submissionStatuses)[number];
export type RiskLevel = (typeof riskLevels)[number];
export type FindingStatus = (typeof findingStatuses)[number];

export type Submission = {
  id: string;
  submissionGroupId: string;
  versionNumber: number;
  previousVersionId: string | null;
  title: string;
  productType: ProductType;
  channel: Channel;
  submittedBy: string;
  affiliateName: string | null;
  content: string;
  destinationUrl: string | null;
  status: SubmissionStatus;
  riskLevel: RiskLevel;
  analysisSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ComplianceFinding = {
  id: string;
  submissionId: string;
  category: string;
  severity: RiskLevel;
  severityRationale: string;
  flaggedText: string;
  explanation: string;
  recommendation: string;
  suggestedRewrites: string[];
  status: FindingStatus;
  createdAt: string;
};

export type Review = {
  id: string;
  submissionId: string;
  reviewer: string;
  decision: "approved" | "changes_requested";
  comment: string | null;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  submissionId: string;
  eventType: string;
  actor: string;
  detail: string;
  createdAt: string;
};

export type SubmissionDetail = Submission & {
  findings: ComplianceFinding[];
  reviews: Review[];
  auditEvents: AuditEvent[];
};

export type QueueFilters = {
  status?: SubmissionStatus;
  risk?: RiskLevel;
  product?: ProductType;
};
