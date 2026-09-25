import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { DemoRoleToggle } from "@/components/demo-role-toggle";
import { getDemoUser } from "@/lib/demo-role-server";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getDemoUser();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
              <span className="grid size-8 place-items-center rounded-lg bg-teal-700 text-white">
                <ShieldCheck className="size-5" />
              </span>
              <span>ClearPath</span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span className="hidden font-medium text-slate-500 sm:inline">Compliance</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm md:flex">
              <Link href="/" className="font-semibold text-slate-950">
                {user.role === "reviewer" ? "Review queue" : "My submissions"}
              </Link>
              {user.role === "submitter" && (
                <Link href="/submissions/new" className="font-medium text-slate-500 hover:text-slate-900">
                  New submission
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <DemoRoleToggle role={user.role} />
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className="grid size-8 place-items-center rounded-full bg-slate-900 text-xs text-white">
                {user.initials}
              </span>
              <div className="hidden sm:block">
                <p className="leading-4">{user.name}</p>
                <p className="text-[11px] font-medium text-slate-400">{user.label} demo</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
