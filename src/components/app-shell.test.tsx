// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";
import { CANON_NAVIGATION_ITEMS } from "@/domain/canon-vocabulary";

describe("AppShell", () => {
  it("renders the local app navigation for the primary Canon surfaces", () => {
    render(
      <AppShell>
        <main>Current surface</main>
      </AppShell>,
    );

    for (const item of CANON_NAVIGATION_ITEMS) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }

    expect(screen.getByText("Current surface")).toBeInTheDocument();
  });
});
