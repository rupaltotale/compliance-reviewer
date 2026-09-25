import type { Channel, ProductType, RiskLevel } from "@/lib/types";

export type ComplianceRule = {
  id: string;
  category: string;
  severity: RiskLevel;
  guidance: string;
  examples: string[];
  appliesTo?: ProductType[];
  channels?: Channel[];
};

// Demonstration rules only. Production rules require qualified legal and compliance ownership.
export const complianceRules: ComplianceRule[] = [
  {
    id: "absolute-approval-claims",
    category: "Approval and qualification claims",
    severity: "high",
    guidance:
      "Flag guarantees or broad claims that imply approval or qualification without underwriting or eligibility conditions.",
    examples: ["guaranteed approval", "everyone qualifies", "you're guaranteed to qualify"],
  },
  {
    id: "rate-context",
    category: "Rates and APR context",
    severity: "high",
    guidance:
      "Rate or APR claims should clearly distinguish introductory terms, ranges, duration, and qualification criteria.",
    examples: ["0% interest", "lowest rate", "rates as low as"],
  },
  {
    id: "missing-qualification",
    category: "Qualification disclosure",
    severity: "medium",
    guidance:
      "Prominent benefit claims should include nearby, understandable qualification language where eligibility varies.",
    examples: ["up to $50,000", "prequalified", "instant approval"],
  },
  {
    id: "pressure-language",
    category: "Urgency and pressure",
    severity: "medium",
    guidance:
      "Review artificial urgency, scarcity, or pressure that could impair a consumer's ability to evaluate the offer.",
    examples: ["act now", "last chance", "limited time", "apply today"],
  },
  {
    id: "fees-and-costs",
    category: "Fees and costs",
    severity: "medium",
    guidance:
      "Claims about affordability or no-cost products should not obscure origination fees, annual fees, or other material costs.",
    examples: ["no fees", "free", "costs nothing"],
  },
  {
    id: "comparative-claims",
    category: "Comparative claims",
    severity: "medium",
    guidance:
      "Superlative or comparative claims need a clear, supportable basis and appropriate scope.",
    examples: ["best", "lowest", "#1", "better than"],
  },
];

export function rulesFor(productType: ProductType, channel: Channel) {
  return complianceRules.filter(
    (rule) =>
      (!rule.appliesTo || rule.appliesTo.includes(productType)) &&
      (!rule.channels || rule.channels.includes(channel)),
  );
}
