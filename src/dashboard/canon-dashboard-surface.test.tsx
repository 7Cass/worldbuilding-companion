// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CanonDashboardSurface } from "./canon-dashboard-surface";

describe("CanonDashboardSurface", () => {
  it("shows recent Event activity with a link to the Event workspace", () => {
    render(
      <CanonDashboardSurface
        dashboard={{
          elementCounts: [
            { elementType: "Character", count: 0 },
            { elementType: "Location", count: 0 },
            { elementType: "Faction", count: 0 },
            { elementType: "Event", count: 1 },
            { elementType: "Lore Entry", count: 0 },
            { elementType: "Relationship", count: 0 },
            { elementType: "Source", count: 0 },
          ],
          recentActivity: [
            {
              elementType: "Event",
              entityId: "event-1",
              label: "Battle of Glass Harbor",
              happenedAt: new Date("2026-05-29T11:30:00.000Z"),
            },
          ],
          syncStates: [],
        }}
        syncCharactersAction={vi.fn()}
        syncLocationsAction={vi.fn()}
        syncFactionsAction={vi.fn()}
        syncEventsAction={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Sync Events/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse Events/ })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(screen.getByText("Battle of Glass Harbor")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open workspace/ })).toHaveAttribute(
      "href",
      "/entity-workspace/events/event-1",
    );
    expect(screen.getAllByText("Derived from Notion sync")).toHaveLength(4);
  });

  it("shows recent Faction activity with a link to the Faction workspace", () => {
    render(
      <CanonDashboardSurface
        dashboard={{
          elementCounts: [
            { elementType: "Character", count: 0 },
            { elementType: "Location", count: 0 },
            { elementType: "Faction", count: 1 },
            { elementType: "Event", count: 0 },
            { elementType: "Lore Entry", count: 0 },
            { elementType: "Relationship", count: 0 },
            { elementType: "Source", count: 0 },
          ],
          recentActivity: [
            {
              elementType: "Faction",
              entityId: "faction-1",
              label: "Silver Flame Church",
              happenedAt: new Date("2026-05-29T11:30:00.000Z"),
            },
          ],
          syncStates: [],
        }}
        syncCharactersAction={vi.fn()}
        syncLocationsAction={vi.fn()}
        syncFactionsAction={vi.fn()}
        syncEventsAction={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Sync Factions/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse Factions/ })).toHaveAttribute(
      "href",
      "/factions",
    );
    expect(screen.getByText("Silver Flame Church")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open workspace/ })).toHaveAttribute(
      "href",
      "/entity-workspace/factions/faction-1",
    );
    expect(screen.getAllByText("Derived from Notion sync")).toHaveLength(4);
  });

  it("shows recent Location activity with a link to the Location workspace", () => {
    render(
      <CanonDashboardSurface
        dashboard={{
          elementCounts: [
            { elementType: "Character", count: 0 },
            { elementType: "Location", count: 1 },
            { elementType: "Faction", count: 0 },
            { elementType: "Event", count: 0 },
            { elementType: "Lore Entry", count: 0 },
            { elementType: "Relationship", count: 0 },
            { elementType: "Source", count: 0 },
          ],
          recentActivity: [
            {
              elementType: "Location",
              entityId: "location-1",
              label: "The Glass Harbor",
              happenedAt: new Date("2026-05-29T11:30:00.000Z"),
            },
          ],
          syncStates: [],
        }}
        syncCharactersAction={vi.fn()}
        syncLocationsAction={vi.fn()}
        syncFactionsAction={vi.fn()}
        syncEventsAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Recent Canon activity")).toBeInTheDocument();
    expect(screen.getByText("The Glass Harbor")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open workspace/ })).toHaveAttribute(
      "href",
      "/entity-workspace/locations/location-1",
    );
  });

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
        syncLocationsAction={vi.fn()}
        syncFactionsAction={vi.fn()}
        syncEventsAction={vi.fn()}
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
