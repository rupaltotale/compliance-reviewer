"use client";

import Link from "next/link";
import { humanize } from "@/lib/utils";

type FilterDefinition = {
  name: string;
  label: string;
  values: readonly string[];
  selected?: string;
  humanizeValues?: boolean;
};

export function QueueFilters({ filters }: { filters: FilterDefinition[] }) {
  const hasActiveFilters = filters.some((filter) => filter.selected);

  return (
    <form
      className="flex flex-wrap gap-2"
      onChange={(event) => event.currentTarget.requestSubmit()}
    >
      {filters.map((filter) => (
        <select
          key={filter.name}
          name={filter.name}
          defaultValue={filter.selected ?? ""}
          aria-label={filter.label}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-teal-600"
        >
          <option value="">{filter.label}</option>
          {filter.values.map((value) => (
            <option key={value} value={value}>
              {filter.humanizeValues === false ? value : humanize(value)}
            </option>
          ))}
        </select>
      ))}
      {hasActiveFilters && (
        <Link
          href="/"
          className="px-2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
