// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FactionBrowserSurface } from "./faction-browser";

describe("FactionBrowserSurface", () => {
  it("lets the creator browse Factions and open a Faction workspace", () => {
    render(
      <FactionBrowserSurface
        factions={[
          {
            id: "faction-1",
            name: "Silver Flame Church",
            notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
            lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Factions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Silver Flame Church" })).toHaveAttribute(
      "href",
      "/entity-workspace/factions/faction-1",
    );
    expect(screen.getByText("Last edited in Notion")).toBeInTheDocument();
  });
});
