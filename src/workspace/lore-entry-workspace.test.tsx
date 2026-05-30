// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoreEntryWorkspaceSurface } from "./lore-entry-workspace";

describe("LoreEntryWorkspaceSurface", () => {
  it("shows a Lore Entry workspace with subtype, core fields, and reviewable placeholder areas", () => {
    render(
      <LoreEntryWorkspaceSurface
        loreEntry={{
          id: "lore-entry-1",
          name: "Silver Flame Doctrine",
          subtype: "Religion",
          notionPageId: "notion-lore-entry-page-1",
          notionUrl: "https://notion.so/notion-lore-entry-page-1",
          notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
          notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
          lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Silver Flame Doctrine" })).toBeInTheDocument();
    expect(screen.getByText("Lore Entry")).toBeInTheDocument();
    expect(screen.getByText("Subtype")).toBeInTheDocument();
    expect(screen.getByText("Religion")).toBeInTheDocument();
    expect(screen.getByText("notion-lore-entry-page-1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Relationships" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sources" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Diagnostics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review state" })).toBeInTheDocument();
  });
});
