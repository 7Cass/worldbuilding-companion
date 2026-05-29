// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SetupSurface } from "./setup-surface";

describe("SetupSurface", () => {
  it("exposes the local flow to create or register a Canon and provision Notion", () => {
    render(
      <SetupSurface
        configResult={{
          ok: true,
          config: {
            postgres: {
              databaseUrl:
                "postgresql://worldbuilding:worldbuilding@localhost:55432/worldbuilding_companion",
            },
            notion: {
              token: "secret_notion_token",
              parentPageId: "notion-parent-page",
            },
            ai: {
              provider: "openai",
              model: "gpt-5-mini",
              apiKey: "secret_openai_key",
            },
          },
        }}
        provisionAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Create or register Canon" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Canon name")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Provision Notion structure" }),
    ).toBeEnabled();
    expect(screen.getByText("Internal Notion integration")).toBeInTheDocument();
  });
});
