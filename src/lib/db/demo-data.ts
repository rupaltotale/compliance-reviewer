import type {
  AuditEvent,
  ComplianceFinding,
  Review,
  Submission,
} from "@/lib/types";

const now = new Date();
const isoDaysAgo = (days: number, hour = 14) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const seededSubmissions: Array<
  Omit<Submission, "submissionGroupId" | "versionNumber" | "previousVersionId">
> = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Fast Funds affiliate landing page",
    productType: "personal_loan",
    channel: "affiliate",
    submittedBy: "Sarah Chen",
    affiliateName: "Fast Funds Network",
    content:
      "You’re guaranteed to qualify for up to $50,000. Act now and get the money you need as soon as tomorrow.",
    destinationUrl: "https://example.com/fast-funds",
    status: "in_review",
    riskLevel: "high",
    analysisSummary: "Three potential issues require human review before publication.",
    createdAt: isoDaysAgo(0, 10),
    updatedAt: isoDaysAgo(0, 10),
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Balance transfer launch email",
    productType: "credit_card",
    channel: "email",
    submittedBy: "Jordan Williams",
    affiliateName: null,
    content:
      "0% interest credit card — apply today! Move your balance and start saving with no fees.",
    destinationUrl: "https://example.com/balance-transfer",
    status: "in_review",
    riskLevel: "high",
    analysisSummary: "Rate, fee, and urgency claims need additional context.",
    createdAt: isoDaysAgo(1, 9),
    updatedAt: isoDaysAgo(1, 11),
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Spring mortgage search campaign",
    productType: "mortgage",
    channel: "paid_social",
    submittedBy: "Priya Patel",
    affiliateName: null,
    content:
      "Get the lowest mortgage rate available. See your options in minutes with no impact to your credit score.",
    destinationUrl: "https://example.com/mortgage",
    status: "in_review",
    riskLevel: "high",
    analysisSummary: "The comparative rate claim may require substantiation and clearer scope.",
    createdAt: isoDaysAgo(2, 15),
    updatedAt: isoDaysAgo(2, 15),
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    title: "Debt consolidation overview",
    productType: "personal_loan",
    channel: "website",
    submittedBy: "Miguel Santos",
    affiliateName: null,
    content:
      "Explore personal loan options for consolidating eligible debts. Rates and terms vary based on creditworthiness and other factors.",
    destinationUrl: "https://example.com/debt-consolidation",
    status: "approved",
    riskLevel: "low",
    analysisSummary: "No clear issues were identified by the demonstration rules.",
    createdAt: isoDaysAgo(3, 10),
    updatedAt: isoDaysAgo(2, 10),
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    title: "Travel card benefits page",
    productType: "credit_card",
    channel: "website",
    submittedBy: "Avery Brooks",
    affiliateName: null,
    content:
      "Earn rewards on eligible travel purchases. Review the rates, fees, reward terms, and eligibility requirements before applying.",
    destinationUrl: "https://example.com/travel-card",
    status: "approved",
    riskLevel: "low",
    analysisSummary: "No clear issues were identified by the demonstration rules.",
    createdAt: isoDaysAgo(5, 13),
    updatedAt: isoDaysAgo(4, 16),
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    title: "Homebuyer prequalification nurture",
    productType: "mortgage",
    channel: "email",
    submittedBy: "Nora Kim",
    affiliateName: null,
    content:
      "Understand how much home you may be able to afford. Prequalification is an estimate, not a commitment to lend.",
    destinationUrl: null,
    status: "in_review",
    riskLevel: "medium",
    analysisSummary: "One disclosure placement question was surfaced for reviewer attention.",
    createdAt: isoDaysAgo(6, 9),
    updatedAt: isoDaysAgo(5, 12),
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    title: "Weekend loan social creative",
    productType: "personal_loan",
    channel: "paid_social",
    submittedBy: "Ethan Reed",
    affiliateName: null,
    content:
      "A personal loan could help cover an unexpected expense. Check available terms with no obligation to accept an offer.",
    destinationUrl: "https://example.com/personal-loans",
    status: "in_review",
    riskLevel: "low",
    analysisSummary: "No clear issues were identified by the demonstration rules.",
    createdAt: isoDaysAgo(0, 8),
    updatedAt: isoDaysAgo(0, 9),
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    title: "Card comparison affiliate article",
    productType: "credit_card",
    channel: "affiliate",
    submittedBy: "Leah Morgan",
    affiliateName: "Wallet Weekly",
    content:
      "ClearPath is the best rewards card for every traveler. Limited time: apply today for our biggest welcome offer.",
    destinationUrl: "https://example.com/card-comparison",
    status: "in_review",
    riskLevel: "medium",
    analysisSummary: "Comparative and urgency language needs substantiation or revision.",
    createdAt: isoDaysAgo(8, 11),
    updatedAt: isoDaysAgo(7, 14),
  },
  {
    id: "99999999-9999-4999-8999-999999999999",
    title: "Mortgage education hub refresh",
    productType: "mortgage",
    channel: "website",
    submittedBy: "Olivia Martin",
    affiliateName: null,
    content:
      "Learn how down payments, loan terms, and credit profiles can affect mortgage pricing before you request prequalification.",
    destinationUrl: "https://example.com/mortgage-guide",
    status: "approved",
    riskLevel: "low",
    analysisSummary: "Educational content presents balanced qualification context.",
    createdAt: isoDaysAgo(9, 12),
    updatedAt: isoDaysAgo(8, 10),
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Preferred partner loan banner",
    productType: "personal_loan",
    channel: "affiliate",
    submittedBy: "Marcus Lee",
    affiliateName: "Credit Compass",
    content:
      "See personalized personal loan offers from ClearPath. Checking options does not guarantee approval; terms vary by applicant.",
    destinationUrl: "https://example.com/partner-loans",
    status: "in_review",
    riskLevel: "low",
    analysisSummary: "No clear issues were identified by the demonstration rules.",
    createdAt: isoDaysAgo(1, 16),
    updatedAt: isoDaysAgo(1, 16),
  },
];

export const demoSubmissions: Submission[] = seededSubmissions.map((submission) => ({
  ...submission,
  submissionGroupId: submission.id,
  versionNumber: 1,
  previousVersionId: null,
}));

const seededFindings: Array<
  Omit<ComplianceFinding, "severityRationale" | "suggestedRewrites">
> = [
  {
    id: "f1111111-1111-4111-8111-111111111111",
    submissionId: demoSubmissions[0].id,
    category: "Approval and qualification claims",
    severity: "high",
    flaggedText: "guaranteed to qualify",
    explanation: "This absolute wording may imply that underwriting or eligibility requirements do not apply.",
    recommendation: "Replace the guarantee with conditional language and identify material eligibility criteria.",
    status: "open",
    createdAt: isoDaysAgo(0, 10),
  },
  {
    id: "f1111111-1111-4111-8111-111111111112",
    submissionId: demoSubmissions[0].id,
    category: "Qualification disclosure",
    severity: "medium",
    flaggedText: "up to $50,000",
    explanation: "The maximum amount may not be available to all applicants.",
    recommendation: "Explain that amounts depend on underwriting, creditworthiness, and applicable limits.",
    status: "open",
    createdAt: isoDaysAgo(0, 10),
  },
  {
    id: "f1111111-1111-4111-8111-111111111113",
    submissionId: demoSubmissions[0].id,
    category: "Urgency and pressure",
    severity: "medium",
    flaggedText: "Act now",
    explanation: "Urgency may pressure consumers if no genuine deadline exists.",
    recommendation: "Remove the phrase or clearly support the factual deadline.",
    status: "open",
    createdAt: isoDaysAgo(0, 10),
  },
  {
    id: "f2222222-2222-4222-8222-222222222221",
    submissionId: demoSubmissions[1].id,
    category: "Rates and APR context",
    severity: "high",
    flaggedText: "0% interest",
    explanation: "The claim lacks duration, eligibility, and post-promotional APR context.",
    recommendation: "State the introductory period, eligibility requirements, and applicable APR after it ends.",
    status: "open",
    createdAt: isoDaysAgo(1, 9),
  },
  {
    id: "f3333333-3333-4333-8333-333333333331",
    submissionId: demoSubmissions[2].id,
    category: "Comparative claims",
    severity: "high",
    flaggedText: "lowest mortgage rate available",
    explanation: "The superlative claim lacks a comparison set, time period, and substantiation.",
    recommendation: "Scope and substantiate the comparison or remove the superlative.",
    status: "open",
    createdAt: isoDaysAgo(2, 15),
  },
  {
    id: "f6666666-6666-4666-8666-666666666661",
    submissionId: demoSubmissions[5].id,
    category: "Qualification disclosure",
    severity: "medium",
    flaggedText: "Prequalification is an estimate, not a commitment to lend.",
    explanation: "The disclosure is present, but its placement should remain prominent and near the associated affordability claim.",
    recommendation: "Keep the disclosure visually connected to the primary prequalification claim.",
    status: "resolved",
    createdAt: isoDaysAgo(6, 9),
  },
  {
    id: "f8888888-8888-4888-8888-888888888881",
    submissionId: demoSubmissions[7].id,
    category: "Comparative claims",
    severity: "medium",
    flaggedText: "best rewards card for every traveler",
    explanation: "This broad superlative lacks a defined comparison set and may not be supportable for every consumer.",
    recommendation: "Define and substantiate a narrower comparison or remove the superlative.",
    status: "open",
    createdAt: isoDaysAgo(8, 11),
  },
  {
    id: "f8888888-8888-4888-8888-888888888882",
    submissionId: demoSubmissions[7].id,
    category: "Urgency and pressure",
    severity: "medium",
    flaggedText: "Limited time: apply today",
    explanation: "The copy creates urgency without stating the offer deadline or basis for the limitation.",
    recommendation: "State the factual end date and applicable conditions, or remove the urgency language.",
    status: "open",
    createdAt: isoDaysAgo(8, 11),
  },
];

export const demoFindings: ComplianceFinding[] = seededFindings.map((finding) => ({
  ...finding,
  severityRationale:
    finding.severity === "high"
      ? "High because the claim could materially mislead consumers about approval, eligibility, pricing, cost, or comparative value."
      : finding.severity === "medium"
        ? "Medium because the claim needs qualification, context, or substantiation but is not an explicit material guarantee."
        : "Low because the concern is limited and is unlikely to materially change a reasonable consumer’s understanding.",
  suggestedRewrites:
    finding.category === "Approval and qualification claims"
      ? [
          "Check your eligibility for a personal loan. Approval and available terms depend on underwriting and creditworthiness.",
        ]
      : finding.category === "Qualification disclosure"
        ? [
            "Explore loan amounts up to $50,000. Available amounts and terms vary based on creditworthiness and underwriting.",
          ]
        : finding.category === "Rates and APR context"
          ? [
              "Qualified applicants may receive a 0% introductory APR for [duration]. After that, a variable APR of [APR range] applies.",
            ]
          : finding.category === "Comparative claims"
            ? [
                "Explore competitive rates available based on the applicant’s details and qualifications.",
              ]
            : finding.category === "Urgency and pressure"
              ? ["Apply by [date] to be considered for this offer. Eligibility and terms apply."]
              : [],
}));

export const demoReviews: Review[] = [
  {
    id: "r4444444-4444-4444-8444-444444444444",
    submissionId: demoSubmissions[3].id,
    reviewer: "Alex Morgan",
    decision: "approved",
    comment: "Qualification language is clear and appropriately placed.",
    createdAt: isoDaysAgo(2, 10),
  },
];

export const demoAuditEvents: AuditEvent[] = [
  ...demoSubmissions.flatMap((submission) => [
    {
      id: crypto.randomUUID(),
      submissionId: submission.id,
      eventType: "submission_created",
      actor: submission.submittedBy,
      detail: "Submission created",
      createdAt: submission.createdAt,
    },
    {
      id: crypto.randomUUID(),
      submissionId: submission.id,
      eventType: "analysis_completed",
      actor: "ClearPath AI",
      detail: `Automated pre-review completed with ${demoFindings.filter((finding) => finding.submissionId === submission.id).length} potential issues`,
      createdAt: new Date(new Date(submission.createdAt).getTime() + 60_000).toISOString(),
    },
  ]),
  ...demoReviews.map((review) => ({
    id: crypto.randomUUID(),
    submissionId: review.submissionId,
    eventType: review.decision,
    actor: review.reviewer,
    detail: "Submission approved",
    createdAt: review.createdAt,
  })),
];
