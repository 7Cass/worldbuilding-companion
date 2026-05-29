// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CharacterBrowserSurface } from "./character-browser";

describe("CharacterBrowserSurface", () => {
  it("lets the creator browse Characters and open a Character workspace", () => {
    render(
      <CharacterBrowserSurface
        characters={[
          {
            id: "character-1",
            name: "Mira Vale",
            notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
            lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Characters" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mira Vale" })).toHaveAttribute(
      "href",
      "/entity-workspace/characters/character-1",
    );
    expect(screen.getByText("Last edited in Notion")).toBeInTheDocument();
  });
});
