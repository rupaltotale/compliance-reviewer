import { cn } from "@/lib/utils";

export function ExampleLanguage({
  examples,
  className,
}: {
  examples: string[];
  className?: string;
}) {
  if (examples.length === 0) return null;

  return (
    <div className={cn("rounded-lg border border-slate-200 bg-slate-50 p-3", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Example language
      </p>
      <ul className="mt-2 space-y-2">
        {examples.map((example) => (
          <li
            key={example}
            className="border-l-2 border-slate-300 px-3 py-1 text-xs font-medium leading-5 text-slate-700"
          >
            “{example}”
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-slate-500">
        Drafting aid only. Verify all terms and disclosures before use.
      </p>
    </div>
  );
}
