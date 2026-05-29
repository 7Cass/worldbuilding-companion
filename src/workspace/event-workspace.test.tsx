// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventWorkspaceSurface } from "./event-workspace";

describe("EventWorkspaceSurface", () => {
  it("shows an Event workspace with core fields and reviewable placeholder areas", () => {
    render(
      <EventWorkspaceSurface
        event={{
          id: "event-1",
          name: "Battle of Glass Harbor",
          notionPageId: "notion-event-page-1",
          notionUrl: "https://notion.so/notion-event-page-1",
          notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
          notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
          lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Battle of Glass Harbor" })).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();
    expect(screen.getByText("notion-event-page-1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Relationships" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sources" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Diagnostics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review state" })).toBeInTheDocument();
  });
});
