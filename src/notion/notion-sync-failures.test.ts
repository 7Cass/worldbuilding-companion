import { describe, expect, it } from "vitest";

import { classifyNotionSyncFailure } from "./notion-sync-failures";

describe("classifyNotionSyncFailure", () => {
  it("classifies missing Notion permissions with an actionable message", () => {
    const failure = classifyNotionSyncFailure({
      code: "restricted_resource",
      message:
        "The integration cannot access this database with token secret_notion_token.",
    });

    expect(failure).toEqual({
      category: "missing_permissions",
      message:
        "Share the Characters database with the internal Notion integration, then retry sync.",
    });
    expect(failure.message).not.toContain("secret_notion_token");
  });

  it("classifies deleted Notion pages or databases with an actionable message", () => {
    const failure = classifyNotionSyncFailure({
      code: "object_not_found",
      message: "Could not find database characters-database-secret-id.",
    });

    expect(failure).toEqual({
      category: "deleted_page",
      message:
        "Restore the Characters database or update setup to the current Notion database, then retry sync.",
    });
    expect(failure.message).not.toContain("characters-database-secret-id");
  });

  it("classifies Character schema drift with an actionable message", () => {
    const failure = classifyNotionSyncFailure(
      new Error(
        "Character page is missing the required Name title property. Raw page token secret_notion_token.",
      ),
    );

    expect(failure).toEqual({
      category: "schema_drift",
      message:
        "Restore the required Character properties in Notion, including the Name title property, then retry sync.",
    });
    expect(failure.message).not.toContain("secret_notion_token");
  });

  it("classifies Notion rate limits with a retryable message", () => {
    const failure = classifyNotionSyncFailure({
      code: "rate_limited",
      message: "Rate limited request with authorization Bearer secret_notion_token.",
    });

    expect(failure).toEqual({
      category: "rate_limited",
      message: "Notion rate limited Character sync. Wait a moment, then retry sync.",
    });
    expect(failure.message).not.toContain("secret_notion_token");
  });
});
