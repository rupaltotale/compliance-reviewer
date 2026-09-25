import "server-only";

import { cookies } from "next/headers";
import {
  demoRoleCookie,
  demoRoles,
  demoUsers,
  type DemoRole,
} from "@/lib/demo-roles";

export async function getDemoRole(): Promise<DemoRole> {
  const value = (await cookies()).get(demoRoleCookie)?.value;
  return demoRoles.find((role) => role === value) ?? "reviewer";
}

export async function getDemoUser() {
  const role = await getDemoRole();
  return { role, ...demoUsers[role] };
}

export async function requireDemoRole(expectedRole: DemoRole) {
  const user = await getDemoUser();
  if (user.role !== expectedRole) {
    throw new Error(
      expectedRole === "reviewer"
        ? "Switch to reviewer mode to take this action."
        : "Switch to submitter mode to take this action.",
    );
  }
  return user;
}
