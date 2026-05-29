export type CanonNavigationItem = {
  label:
    | "Setup"
    | "Canon Dashboard"
    | "Characters"
    | "Entity Workspace"
    | "Review Queue";
  href: string;
};

export const CANON_NAVIGATION_ITEMS = [
  {
    label: "Setup",
    href: "/setup",
  },
  {
    label: "Canon Dashboard",
    href: "/canon-dashboard",
  },
  {
    label: "Characters",
    href: "/characters",
  },
  {
    label: "Entity Workspace",
    href: "/entity-workspace",
  },
  {
    label: "Review Queue",
    href: "/review-queue",
  },
] as const satisfies readonly CanonNavigationItem[];

export const CANON_ELEMENT_TYPES = [
  "Character",
  "Location",
  "Faction",
  "Event",
  "Lore Entry",
  "Relationship",
  "Source",
] as const;
