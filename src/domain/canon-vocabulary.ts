export type CanonNavigationItem = {
  label:
    | "Setup"
    | "Canon Dashboard"
    | "Characters"
    | "Locations"
    | "Factions"
    | "Events"
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
    label: "Locations",
    href: "/locations",
  },
  {
    label: "Factions",
    href: "/factions",
  },
  {
    label: "Events",
    href: "/events",
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

export const FACTION_LORE_ENTRY_BOUNDARY =
  "A Faction is an organized group with identity, goals, and membership boundary; a religion as doctrine or belief system is a Lore Entry.";

export const EVENT_TIMELINE_BOUNDARY =
  "An Event is a meaningful occurrence in the Canon; a Timeline is a view over Events, not a stored Canon element.";
