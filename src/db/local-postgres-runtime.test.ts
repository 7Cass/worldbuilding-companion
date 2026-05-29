import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("local Postgres runtime", () => {
  it("starts a sidecar Postgres database with credentials matching .env.example", () => {
    const env = readEnvExample();
    const databaseUrl = new URL(requiredEnv(env, "DATABASE_URL"));
    const compose = readFileSync(
      new URL("../../docker-compose.yml", import.meta.url),
      "utf8",
    );

    expect(databaseUrl.protocol).toBe("postgresql:");
    expect(databaseUrl.username).toBe("worldbuilding");
    expect(databaseUrl.password).toBe("worldbuilding");
    expect(databaseUrl.hostname).toBe("localhost");
    expect(databaseUrl.port).toBe("55432");
    expect(databaseUrl.pathname).toBe("/worldbuilding_companion");

    expect(compose).toContain("image: postgres:");
    expect(compose).toContain("POSTGRES_USER: worldbuilding");
    expect(compose).toContain("POSTGRES_PASSWORD: worldbuilding");
    expect(compose).toContain("POSTGRES_DB: worldbuilding_companion");
    expect(compose).toContain('"55432:5432"');
    expect(compose).toContain("pg_isready");
    expect(compose).toContain("worldbuilding-postgres-data:");
  });

  it("documents the local database start, stop, reset, and migration workflow", () => {
    const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");

    expect(readme).toContain("docker compose up -d");
    expect(readme).toContain("pnpm db:migrate");
    expect(readme).toContain("docker compose down");
    expect(readme).toContain("docker compose down --volumes");
    expect(readme).toContain("Postgres is sidecar persistence for derived Canon state.");
    expect(readme).toContain("Notion remains the canonical source.");
  });

  it("exposes a lightweight command for verifying sidecar connectivity", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    ) as {
      scripts?: Record<string, string>;
    };
    const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");

    expect(packageJson.scripts?.["db:verify"]).toBe(
      "node scripts/verify-sidecar-db.mjs",
    );
    expect(readme).toContain("pnpm db:verify");
  });
});

function readEnvExample(): Record<string, string> {
  return Object.fromEntries(
    readFileSync(new URL("../../.env.example", import.meta.url), "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const [name, ...valueParts] = line.split("=");
        const value = valueParts.join("=");

        return [name, value.replace(/^"|"$/g, "")];
      }),
  );
}

function requiredEnv(env: Record<string, string>, name: string): string {
  const value = env[name];

  if (!value) {
    throw new Error(`${name} is missing from .env.example.`);
  }

  return value;
}
