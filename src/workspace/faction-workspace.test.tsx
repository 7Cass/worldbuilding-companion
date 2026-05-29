// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FactionWorkspaceSurface } from "./faction-workspace";

describe("FactionWorkspaceSurface", () => {
  it("shows a Faction workspace with core fields and reviewable placeholder areas", () => {
    render(
      <FactionWorkspaceSurface
        faction={{
          id: "faction-1",
          name: "Silver Flame Church",
          notionPageId: "notion-faction-page-1",
          notionUrl: "https://notion.so/notion-faction-page-1",
          notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
          notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
          lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Silver Flame Church" })).toBeInTheDocument();
    expect(screen.getByText("Faction")).toBeInTheDocument();
    expect(screen.getByText("notion-faction-page-1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Relationships" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sources" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Diagnostics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review state" })).toBeInTheDocument();
  });
});
