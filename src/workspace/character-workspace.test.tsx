// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CharacterWorkspaceSurface } from "./character-workspace";

describe("CharacterWorkspaceSurface", () => {
  it("shows a Character workspace with core fields and reviewable placeholder areas", () => {
    render(
      <CharacterWorkspaceSurface
        character={{
          id: "character-1",
          name: "Mira Vale",
          notionPageId: "notion-character-page-1",
          notionUrl: "https://notion.so/notion-character-page-1",
          notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
          notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
          lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Mira Vale" })).toBeInTheDocument();
    expect(screen.getByText("Character")).toBeInTheDocument();
    expect(screen.getByText("notion-character-page-1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Relationships" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sources" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Diagnostics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review state" })).toBeInTheDocument();
  });
});
