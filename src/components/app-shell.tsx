import Link from "next/link";
import { ChevronDown, ShieldCheck } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
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
                Review queue
              </Link>
              <Link href="/submissions/new" className="font-medium text-slate-500 hover:text-slate-900">
                New submission
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="grid size-8 place-items-center rounded-full bg-slate-900 text-xs text-white">AM</span>
            <span className="hidden sm:inline">Alex Morgan</span>
            <ChevronDown className="size-4 text-slate-400" />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
