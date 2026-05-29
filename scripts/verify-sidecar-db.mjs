import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

import pg from "pg";

const { Pool } = pg;

export async function verifySidecarConnection(client) {
  const result = await client.query("select current_database() as database_name");

  return {
    connected: true,
    databaseName: result.rows[0]?.database_name ?? "unknown",
    postgresRole: "derived sidecar state",
    canonicalSource: "Notion",
  };
}

export function formatSidecarVerification(result) {
  return [
    `Connected to Postgres database: ${result.databaseName}`,
    `Postgres role: ${result.postgresRole}`,
    `Canonical source: ${result.canonicalSource}`,
  ].join("\n");
}

export async function runSidecarVerification(env = process.env, cwd = process.cwd()) {
  loadLocalEnvFiles(cwd);

  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to verify the Postgres sidecar.");
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    const result = await verifySidecarConnection(pool);
    console.log(formatSidecarVerification(result));
  } finally {
    await pool.end();
  }
}

function loadLocalEnvFiles(cwd) {
  for (const envFile of [".env.local", ".env"]) {
    const path = join(cwd, envFile);

    if (existsSync(path)) {
      loadEnvFile(path);
    }
  }
}

function isMainModule() {
  return process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
}

if (isMainModule()) {
  runSidecarVerification().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
