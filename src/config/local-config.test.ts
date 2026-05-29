import { describe, expect, it } from "vitest";

import { loadLocalConfig } from "./local-config";

describe("loadLocalConfig", () => {
  it("returns actionable validation errors without exposing local secrets", () => {
    const secretNotionToken = "secret_notion_token";
    const secretOpenAiKey = "secret_openai_key";

    const result = loadLocalConfig({
      DATABASE_URL: "not-a-postgres-url",
      NOTION_TOKEN: secretNotionToken,
      AI_PROVIDER: "openai",
      AI_MODEL: "",
      OPENAI_API_KEY: secretOpenAiKey,
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected local configuration to be invalid.");
    }

    const messages = result.errors.map((error) => error.message).join("\n");

    expect(messages).toContain("DATABASE_URL must be a valid Postgres connection URL.");
    expect(messages).toContain("NOTION_PARENT_PAGE_ID is required.");
    expect(messages).toContain("AI_MODEL is required.");
    expect(messages).not.toContain(secretNotionToken);
    expect(messages).not.toContain(secretOpenAiKey);
  });
});
