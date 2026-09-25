export const demoRoles = ["reviewer", "submitter"] as const;

export type DemoRole = (typeof demoRoles)[number];

export const demoUsers: Record<
  DemoRole,
  { name: string; initials: string; label: string }
> = {
  reviewer: {
    name: "Alex Morgan",
    initials: "AM",
    label: "Reviewer",
  },
  submitter: {
    name: "Sarah Chen",
    initials: "SC",
    label: "Submitter",
  },
};

export const demoRoleCookie = "clearpath_demo_role";
