// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocationWorkspaceSurface } from "./location-workspace";

describe("LocationWorkspaceSurface", () => {
  it("shows a Location workspace with core fields and reviewable placeholder areas", () => {
    render(
      <LocationWorkspaceSurface
        location={{
          id: "location-1",
          name: "The Glass Harbor",
          notionPageId: "notion-location-page-1",
          notionUrl: "https://notion.so/notion-location-page-1",
          notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
          notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
          lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "The Glass Harbor" })).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("notion-location-page-1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Relationships" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sources" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Diagnostics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review state" })).toBeInTheDocument();
  });
});
