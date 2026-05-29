import { describe, expect, it } from "vitest";

import {
  formatSidecarVerification,
  verifySidecarConnection,
} from "./verify-sidecar-db.mjs";

describe("verify-sidecar-db", () => {
  it("checks the sidecar connection with a read-only query and preserves Notion as canonical source", async () => {
    const queries = [];

    const result = await verifySidecarConnection({
      async query(sql) {
        queries.push(sql);

        return {
          rows: [{ database_name: "worldbuilding_companion" }],
        };
      },
    });

    expect(queries).toEqual([
      "select current_database() as database_name",
    ]);
    expect(queries.join("\n")).not.toMatch(
      /\b(insert|update|delete|create|drop|alter|truncate)\b/i,
    );
    expect(result).toEqual({
      connected: true,
      databaseName: "worldbuilding_companion",
      postgresRole: "derived sidecar state",
      canonicalSource: "Notion",
    });
    expect(formatSidecarVerification(result)).toContain(
      "Postgres role: derived sidecar state",
    );
    expect(formatSidecarVerification(result)).toContain(
      "Canonical source: Notion",
    );
  });
});
