import type { ComplianceFinding } from "@/lib/types";

export function HighlightedContent({
  content,
  findings,
}: {
  content: string;
  findings: ComplianceFinding[];
}) {
  const activeText = findings
    .filter((finding) => finding.status === "open")
    .map((finding) => finding.flaggedText)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (activeText.length === 0) return <p className="whitespace-pre-wrap">{content}</p>;

  const escaped = activeText.map((text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = content.split(new RegExp(`(${escaped.join("|")})`, "gi"));
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, index) =>
        activeText.some((text) => text.toLowerCase() === part.toLowerCase()) ? (
          <mark key={`${part}-${index}`} className="rounded bg-amber-200/80 px-0.5 text-slate-950">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </p>
  );
}
