import type { SyncFailureDetail } from "@/sync/canon-sync-state";

export function classifyNotionSyncFailure(
  error: unknown,
  labels: {
    pluralLabel: string;
    singularLabel: string;
  } = {
    pluralLabel: "Characters",
    singularLabel: "Character",
  },
): SyncFailureDetail {
  const code = readErrorCode(error);
  const message = readErrorMessage(error);

  if (code === "unauthorized" || code === "restricted_resource") {
    return {
      category: "missing_permissions",
      message:
        `Share the ${labels.pluralLabel} database with the internal Notion integration, then retry sync.`,
    };
  }

  if (code === "object_not_found") {
    return {
      category: "deleted_page",
      message:
        `Restore the ${labels.pluralLabel} database or update setup to the current Notion database, then retry sync.`,
    };
  }

  if (code === "rate_limited") {
    return {
      category: "rate_limited",
      message: `Notion rate limited ${labels.singularLabel} sync. Wait a moment, then retry sync.`,
    };
  }

  if (
    message.includes("required Name title property") ||
    message.includes("Name must not be empty")
  ) {
    return {
      category: "schema_drift",
      message:
        `Restore the required ${labels.singularLabel} properties in Notion, including the Name title property, then retry sync.`,
    };
  }

  if (
    labels.singularLabel === "Lore Entry" &&
    (message.includes("required Subtype select property") ||
      message.includes("supported Lore Entry subtype"))
  ) {
    return {
      category: "schema_drift",
      message:
        "Restore the required Lore Entry properties in Notion, including the Name title and Subtype select properties, then retry sync.",
    };
  }

  return {
    category: "unknown",
    message:
      `${labels.singularLabel} sync failed. Review the Notion integration settings, then retry sync.`,
  };
}

function readErrorCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : null;
}

function readErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "object" && error !== null && "message" in error
    ? String(error.message)
    : "";
}
