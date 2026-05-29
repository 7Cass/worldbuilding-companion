// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CanonDashboardSurface } from "./canon-dashboard-surface";

describe("CanonDashboardSurface", () => {
  it("shows stale sync state and actionable failure detail without leaking secrets", () => {
    render(
      <CanonDashboardSurface
        dashboard={{
          elementCounts: [
            { elementType: "Character", count: 1 },
            { elementType: "Location", count: 0 },
            { elementType: "Faction", count: 0 },
            { elementType: "Event", count: 0 },
            { elementType: "Lore Entry", count: 0 },
            { elementType: "Relationship", count: 0 },
            { elementType: "Source", count: 0 },
          ],
          recentActivity: [],
          syncStates: [
            {
              source: "Characters",
              status: "failed",
              freshness: "stale",
              lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
              updatedAt: new Date("2026-05-29T13:00:00.000Z"),
              failure: {
                category: "missing_permissions",
                message:
                  "Share the Characters database with the internal Notion integration, then retry sync.",
              },
            },
          ],
        }}
        syncCharactersAction={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Canon shape" })).toBeInTheDocument();
    expect(screen.getByText("Sync freshness")).toBeInTheDocument();
    expect(screen.getByText("Stale")).toBeInTheDocument();
    expect(screen.getByText("Current status")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Last successful sync")).toBeInTheDocument();
    expect(screen.getByText(/May 29, 2026/)).toBeInTheDocument();
    expect(
      screen.getByText(
        "Share the Characters database with the internal Notion integration, then retry sync.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/secret_notion_token/)).not.toBeInTheDocument();
  });
});
