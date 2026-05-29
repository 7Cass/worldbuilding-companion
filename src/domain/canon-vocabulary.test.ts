import { describe, expect, it } from "vitest";

import { CANON_ELEMENT_TYPES, CANON_NAVIGATION_ITEMS } from "./canon-vocabulary";

describe("Canon vocabulary", () => {
  it("keeps app navigation and Canon element names aligned with the glossary", () => {
    expect(CANON_NAVIGATION_ITEMS.map((item) => item.label)).toEqual([
      "Setup",
      "Canon Dashboard",
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
});
