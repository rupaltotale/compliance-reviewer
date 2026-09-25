"use client";

import { useRouter } from "next/navigation";
import { ClipboardCheck, FilePenLine } from "lucide-react";
import {
  demoRoleCookie,
  demoRoles,
  type DemoRole,
} from "@/lib/demo-roles";

export function DemoRoleToggle({ role }: { role: DemoRole }) {
  const router = useRouter();

  function selectRole(nextRole: DemoRole) {
    if (nextRole === role) return;
    document.cookie = `${demoRoleCookie}=${nextRole}; path=/; max-age=31536000; samesite=lax`;
    router.push("/");
    router.refresh();
  }

  return (
    <div
      className="flex rounded-lg border border-slate-200 bg-slate-100 p-1"
      aria-label="Demo role"
    >
      {demoRoles.map((value) => {
        const Icon = value === "reviewer" ? ClipboardCheck : FilePenLine;
        return (
          <button
            key={value}
            type="button"
            onClick={() => selectRole(value)}
            aria-pressed={role === value}
            className={
              role === value
                ? "inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold capitalize text-slate-900 shadow-sm"
                : "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium capitalize text-slate-500 hover:text-slate-900"
            }
          >
            <Icon className="size-3.5" />
            <span className="hidden lg:inline">{value}</span>
          </button>
        );
      })}
    </div>
  );
}
