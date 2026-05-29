import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {
  formatLocalConfigErrors,
  loadLocalConfig,
  type Env,
} from "@/config/local-config";

export function createSidecarDb(env: Env = process.env) {
  const configResult = loadLocalConfig(env);

  if (!configResult.ok) {
    throw new Error(formatLocalConfigErrors(configResult.errors));
  }

  const pool = new Pool({
    connectionString: configResult.config.postgres.databaseUrl,
  });

  return {
    db: drizzle(pool),
    pool,
  };
}
