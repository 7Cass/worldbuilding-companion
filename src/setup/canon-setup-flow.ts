import { Client } from "@notionhq/client";

import { loadLocalConfig, type Env, type LocalConfigError } from "@/config/local-config";
import { createSidecarDb } from "@/db/client";
import { createDrizzleCanonProvisioningRepository } from "@/db/canon-provisioning-repository";
import { createNotionSdkProvisioningClient } from "@/notion/notion-sdk-provisioning-client";
import {
  provisionCanonNotionStructure,
  type CanonProvisioningResult,
} from "@/notion/schema-provisioner";

export type CanonSetupFlowResult =
  | {
      ok: true;
      provisioning: CanonProvisioningResult;
    }
  | {
      ok: false;
      errors: LocalConfigError[];
    };

export async function provisionCanonFromLocalSetup(input: {
  canonName: string;
  env?: Env;
}): Promise<CanonSetupFlowResult> {
  const canonName = input.canonName.trim();
  const env = input.env ?? process.env;
  const configResult = loadLocalConfig(env);

  if (!configResult.ok) {
    return {
      ok: false,
      errors: configResult.errors,
    };
  }

  if (!canonName) {
    return {
      ok: false,
      errors: [
        {
          field: "canonName",
          message: "Canon name is required.",
        },
      ],
    };
  }

  const { db, pool } = createSidecarDb(env);

  try {
    const repository = createDrizzleCanonProvisioningRepository(db);
    const notion = createNotionSdkProvisioningClient(
      new Client({
        auth: configResult.config.notion.token,
      }),
    );

    return {
      ok: true,
      provisioning: await provisionCanonNotionStructure({
        canonName,
        notionParentPageId: configResult.config.notion.parentPageId,
        notion,
        repository,
      }),
    };
  } finally {
    await pool.end();
  }
}
