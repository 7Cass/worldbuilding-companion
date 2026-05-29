// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventBrowserSurface } from "./event-browser";

describe("EventBrowserSurface", () => {
  it("lets the creator browse Events and open an Event workspace", () => {
    render(
      <EventBrowserSurface
        events={[
          {
            id: "event-1",
            name: "Battle of Glass Harbor",
            notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
            lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Events" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Battle of Glass Harbor" })).toHaveAttribute(
      "href",
      "/entity-workspace/events/event-1",
    );
    expect(screen.getByText("Last edited in Notion")).toBeInTheDocument();
  });
});
