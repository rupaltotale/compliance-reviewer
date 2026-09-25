import { z } from "zod";
import { channels, productTypes, riskLevels } from "@/lib/types";

export const findingAnalysisSchema = z.object({
  category: z.string().min(1),
  severity: z.enum(riskLevels),
  severityRationale: z.string().min(1),
  flaggedText: z.string().min(1),
  explanation: z.string().min(1),
  recommendation: z.string().min(1),
  suggestedRewrites: z.array(z.string().min(1)).min(1).max(3),
});

export const modelComplianceAnalysisSchema = z.object({
  summary: z.string().min(1),
  findings: z.array(findingAnalysisSchema).max(12),
});

export const complianceAnalysisSchema = modelComplianceAnalysisSchema.extend({
  riskLevel: z.enum(riskLevels),
});

export const newSubmissionSchema = z
  .object({
    title: z.string().trim().min(3, "Enter a descriptive title.").max(120),
    productType: z.enum(productTypes, { error: "Select a product." }),
    channel: z.enum(channels, { error: "Select a channel." }),
    submittedBy: z.string().trim().min(2, "Enter the submitter's name.").max(80),
    affiliateName: z.string().trim().max(120).optional(),
    content: z.string().trim().min(20, "Marketing copy must be at least 20 characters.").max(20000),
    destinationUrl: z.union([z.url("Enter a valid URL."), z.literal("")]).optional(),
  })
  .superRefine((value, context) => {
    if (value.channel === "affiliate" && !value.affiliateName) {
      context.addIssue({
        code: "custom",
        path: ["affiliateName"],
        message: "Affiliate name is required for affiliate submissions.",
      });
    }
  });

export type ComplianceAnalysis = z.infer<typeof complianceAnalysisSchema>;
export type NewSubmissionInput = z.infer<typeof newSubmissionSchema>;
