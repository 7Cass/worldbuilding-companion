// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocationBrowserSurface } from "./location-browser";

describe("LocationBrowserSurface", () => {
  it("lets the creator browse Locations and open a Location workspace", () => {
    render(
      <LocationBrowserSurface
        locations={[
          {
            id: "location-1",
            name: "The Glass Harbor",
            notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
            lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Locations" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "The Glass Harbor" })).toHaveAttribute(
      "href",
      "/entity-workspace/locations/location-1",
    );
    expect(screen.getByText("Last edited in Notion")).toBeInTheDocument();
  });
});
