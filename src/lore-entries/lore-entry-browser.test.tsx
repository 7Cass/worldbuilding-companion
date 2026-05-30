// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoreEntryBrowserSurface } from "./lore-entry-browser";

describe("LoreEntryBrowserSurface", () => {
  it("lets the creator browse Lore Entries and open a Lore Entry workspace", () => {
    render(
      <LoreEntryBrowserSurface
        loreEntries={[
          {
            id: "lore-entry-1",
            name: "Silver Flame Doctrine",
            subtype: "Religion",
            notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
            lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Lore Entries" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Silver Flame Doctrine" })).toHaveAttribute(
      "href",
      "/entity-workspace/lore-entries/lore-entry-1",
    );
    expect(screen.getByText("Subtype")).toBeInTheDocument();
    expect(screen.getByText("Religion")).toBeInTheDocument();
    expect(screen.getByText("Last edited in Notion")).toBeInTheDocument();
  });
});
