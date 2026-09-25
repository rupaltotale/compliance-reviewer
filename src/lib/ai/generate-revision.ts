import "server-only";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { revisionSystemPrompt } from "@/lib/ai/revision-prompt";
import { revisionDraftSchema } from "@/lib/schemas";
import type {
  Channel,
  ComplianceFinding,
  ProductType,
} from "@/lib/types";

type RevisionConcern = Pick<
  ComplianceFinding,
  "category" | "flaggedText" | "explanation" | "recommendation" | "suggestedRewrites"
>;

type RevisionInput = {
  productType: ProductType;
  channel: Channel;
  content: string;
  concerns: RevisionConcern[];
  reviewerComment?: string | null;
};

function deterministicRevision(input: RevisionInput) {
  let content = input.content;
  for (const concern of input.concerns) {
    const replacement = concern.suggestedRewrites[0];
    if (replacement && content.includes(concern.flaggedText)) {
      content = content.replace(concern.flaggedText, replacement);
    }
  }
  return revisionDraftSchema.parse({
    content,
    changeSummary:
      "Applied the available demonstration-rule examples to the requested source phrases.",
  });
}

export async function generateRevision(input: RevisionInput) {
  if (!process.env.OPENAI_API_KEY) {
    return deterministicRevision(input);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.parse({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      { role: "system", content: revisionSystemPrompt },
      {
        role: "user",
        content: JSON.stringify({
          productType: input.productType,
          channel: input.channel,
          sourceMarketingCopy: input.content,
          requestedChanges: input.concerns,
          reviewerComment: input.reviewerComment ?? null,
        }),
      },
    ],
    response_format: zodResponseFormat(revisionDraftSchema, "revision_draft"),
  });
  const parsed = completion.choices[0]?.message.parsed;
  if (!parsed) {
    throw new Error("The drafting assistant did not return a valid revision.");
  }
  return revisionDraftSchema.parse(parsed);
}
