import type { SyncFailureDetail } from "@/sync/canon-sync-state";

export function classifyNotionSyncFailure(error: unknown): SyncFailureDetail {
  const code = readErrorCode(error);
  const message = readErrorMessage(error);

  if (code === "unauthorized" || code === "restricted_resource") {
    return {
      category: "missing_permissions",
      message:
        "Share the Characters database with the internal Notion integration, then retry sync.",
    };
  }

  if (code === "object_not_found") {
    return {
      category: "deleted_page",
      message:
        "Restore the Characters database or update setup to the current Notion database, then retry sync.",
    };
  }

  if (code === "rate_limited") {
    return {
      category: "rate_limited",
      message: "Notion rate limited Character sync. Wait a moment, then retry sync.",
    };
  }

  if (
    message.includes("required Name title property") ||
    message.includes("Name must not be empty")
  ) {
    return {
      category: "schema_drift",
      message:
        "Restore the required Character properties in Notion, including the Name title property, then retry sync.",
    };
  }

  return {
    category: "unknown",
    message:
      "Character sync failed. Review the Notion integration settings, then retry sync.",
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
