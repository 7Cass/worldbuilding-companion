export type Env = Record<string, string | undefined>;

export type AiProvider = "openai";

export type LocalConfig = {
  postgres: {
    databaseUrl: string;
  };
  notion: {
    token: string;
    parentPageId: string;
  };
  ai: {
    provider: AiProvider;
    model: string;
    apiKey: string;
  };
};

export type LocalConfigError = {
  field: string;
  message: string;
};

export type LocalConfigResult =
  | {
      ok: true;
      config: LocalConfig;
    }
  | {
      ok: false;
      errors: LocalConfigError[];
    };

export function loadLocalConfig(env: Env): LocalConfigResult {
  const errors: LocalConfigError[] = [];
  const databaseUrl = readEnv(env, "DATABASE_URL");
  const notionToken = readEnv(env, "NOTION_TOKEN");
  const notionParentPageId = readEnv(env, "NOTION_PARENT_PAGE_ID");
  const aiProvider = readEnv(env, "AI_PROVIDER");
  const aiModel = readEnv(env, "AI_MODEL");
  const openAiApiKey = readEnv(env, "OPENAI_API_KEY");

  if (!databaseUrl || !isPostgresUrl(databaseUrl)) {
    errors.push({
      field: "DATABASE_URL",
      message: "DATABASE_URL must be a valid Postgres connection URL.",
    });
  }

  if (!notionToken) {
    errors.push({
      field: "NOTION_TOKEN",
      message: "NOTION_TOKEN is required.",
    });
  }

  if (!notionParentPageId) {
    errors.push({
      field: "NOTION_PARENT_PAGE_ID",
      message: "NOTION_PARENT_PAGE_ID is required.",
    });
  }

  if (aiProvider !== "openai") {
    errors.push({
      field: "AI_PROVIDER",
      message: "AI_PROVIDER must be openai.",
    });
  }

  if (!aiModel) {
    errors.push({
      field: "AI_MODEL",
      message: "AI_MODEL is required.",
    });
  }

  if (!openAiApiKey) {
    errors.push({
      field: "OPENAI_API_KEY",
      message: "OPENAI_API_KEY is required for the configured AI provider.",
    });
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    config: {
      postgres: {
        databaseUrl,
      },
      notion: {
        token: notionToken,
        parentPageId: notionParentPageId,
      },
      ai: {
        provider: "openai",
        model: aiModel,
        apiKey: openAiApiKey,
      },
    },
  };
}

export function formatLocalConfigErrors(errors: LocalConfigError[]): string {
  return errors.map((error) => error.message).join("\n");
}

function readEnv(env: Env, name: string): string {
  return env[name]?.trim() ?? "";
}

function isPostgresUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "postgres:" || url.protocol === "postgresql:";
  } catch {
    return false;
  }
}
