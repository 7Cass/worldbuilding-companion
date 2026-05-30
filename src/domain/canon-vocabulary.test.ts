import { describe, expect, it } from "vitest";

import {
  CANON_ELEMENT_TYPES,
  CANON_NAVIGATION_ITEMS,
  EVENT_TIMELINE_BOUNDARY,
  FACTION_LORE_ENTRY_BOUNDARY,
} from "./canon-vocabulary";

describe("Canon vocabulary", () => {
  it("keeps app navigation and Canon element names aligned with the glossary", () => {
    expect(CANON_NAVIGATION_ITEMS.map((item) => item.label)).toEqual([
      "Setup",
      "Canon Dashboard",
      "Characters",
      "Locations",
      "Factions",
      "Events",
      "Lore Entries",
      "Entity Workspace",
      "Review Queue",
    ]);

    expect(CANON_ELEMENT_TYPES).toEqual([
      "Character",
      "Location",
      "Faction",
      "Event",
      "Lore Entry",
      "Relationship",
      "Source",
    ]);

    const visibleLabels = [
      ...CANON_NAVIGATION_ITEMS.map((item) => item.label),
      ...CANON_ELEMENT_TYPES,
    ].join(" ");

    expect(visibleLabels).not.toContain("Project");
    expect(visibleLabels).not.toContain("Universe");
    expect(visibleLabels).not.toContain("Suggestion Inbox");
  });

  it("keeps the Faction and Lore Entry terminology boundary explicit", () => {
    expect(FACTION_LORE_ENTRY_BOUNDARY).toContain("organized group");
    expect(FACTION_LORE_ENTRY_BOUNDARY).toContain("Faction");
    expect(FACTION_LORE_ENTRY_BOUNDARY).toContain("religion as doctrine");
    expect(FACTION_LORE_ENTRY_BOUNDARY).toContain("Lore Entry");
    expect(FACTION_LORE_ENTRY_BOUNDARY).not.toContain("Organization");
  });

  it("keeps Timeline as a derived view over Events, not a stored Canon element", () => {
    expect(CANON_ELEMENT_TYPES).toContain("Event");
    expect(CANON_ELEMENT_TYPES).not.toContain("Timeline");
    expect(EVENT_TIMELINE_BOUNDARY).toContain("Timeline");
    expect(EVENT_TIMELINE_BOUNDARY).toContain("view over Events");
    expect(EVENT_TIMELINE_BOUNDARY).toContain("not a stored Canon element");
  });
});
