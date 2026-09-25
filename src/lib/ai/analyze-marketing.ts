import "server-only";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { rulesFor } from "@/lib/compliance/rules";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { complianceAnalysisSchema, type ComplianceAnalysis } from "@/lib/schemas";
import type { Channel, ProductType, RiskLevel } from "@/lib/types";

type AnalysisInput = {
  productType: ProductType;
  channel: Channel;
  content: string;
  destinationUrl?: string | null;
};

const demoPatterns: Array<{
  pattern: RegExp;
  category: string;
  severity: RiskLevel;
  explanation: string;
  recommendation: string;
}> = [
  {
    pattern: /\b(?:guaranteed (?:approval|to qualify)|everyone qualifies|no one is denied)\b/i,
    category: "Approval and qualification claims",
    severity: "high",
    explanation:
      "This absolute wording may imply that underwriting or eligibility requirements do not apply.",
    recommendation:
      "Replace the guarantee with accurate conditional language and identify material eligibility criteria.",
  },
  {
    pattern: /\b0%\s+(?:interest|apr)\b/i,
    category: "Rates and APR context",
    severity: "high",
    explanation:
      "A 0% claim may be misleading without nearby context about duration, eligibility, and the rate after the promotional period.",
    recommendation:
      "State whether this is an introductory APR, its duration, who qualifies, and the applicable post-promotional APR.",
  },
  {
    pattern: /\b(?:lowest|best)\s+(?:mortgage\s+)?rate\b/i,
    category: "Comparative claims",
    severity: "high",
    explanation:
      "A superlative rate claim may lack a defined comparison set, time period, and substantiation.",
    recommendation:
      "Use a supportable, scoped comparison or describe the available rate without a superlative.",
  },
  {
    pattern: /\b(?:act now|last chance|limited time|apply today)\b/i,
    category: "Urgency and pressure",
    severity: "medium",
    explanation:
      "Urgency language may pressure consumers, especially if the stated deadline or scarcity is not substantiated.",
    recommendation:
      "Remove artificial urgency or clearly explain the factual deadline and its basis.",
  },
  {
    pattern: /\b(?:no fees|fee[- ]free|costs nothing)\b/i,
    category: "Fees and costs",
    severity: "medium",
    explanation:
      "This broad cost claim may obscure annual, origination, late, or third-party fees.",
    recommendation:
      "Name the specific fee that is waived and disclose other material costs clearly.",
  },
  {
    pattern: /\bup to \$[\d,]+\b/i,
    category: "Qualification disclosure",
    severity: "medium",
    explanation:
      "The maximum amount may not be available to all applicants and needs clear qualification context.",
    recommendation:
      "Add nearby language explaining that amounts depend on creditworthiness, underwriting, and applicable limits.",
  },
];

function demoAnalyze(input: AnalysisInput): ComplianceAnalysis {
  const findings = demoPatterns.flatMap((candidate) => {
    const match = input.content.match(candidate.pattern);
    return match
      ? [
          {
            category: candidate.category,
            severity: candidate.severity,
            flaggedText: match[0],
            explanation: candidate.explanation,
            recommendation: candidate.recommendation,
          },
        ]
      : [];
  });
  const riskLevel = findings.some((finding) => finding.severity === "high")
    ? "high"
    : findings.some((finding) => finding.severity === "medium")
      ? "medium"
      : "low";
  return complianceAnalysisSchema.parse({
    riskLevel,
    summary:
      findings.length > 0
        ? `The pre-review identified ${findings.length} potential issue${findings.length === 1 ? "" : "s"} for human review.`
        : "No clear issues were identified by the demonstration rules. A human review is still required.",
    findings,
  });
}

export async function analyzeMarketing(input: AnalysisInput): Promise<ComplianceAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    return demoAnalyze(input);
  }

  const rules = rulesFor(input.productType, input.channel);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.parse({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      { role: "system", content: buildSystemPrompt(rules) },
      {
        role: "user",
        content: JSON.stringify({
          productType: input.productType,
          channel: input.channel,
          marketingContent: input.content,
          destinationUrl: input.destinationUrl ?? null,
        }),
      },
    ],
    response_format: zodResponseFormat(complianceAnalysisSchema, "compliance_analysis"),
  });

  const parsed = completion.choices[0]?.message.parsed;
  if (!parsed) {
    throw new Error("The compliance analysis did not return a valid structured response.");
  }
  return complianceAnalysisSchema.parse(parsed);
}
