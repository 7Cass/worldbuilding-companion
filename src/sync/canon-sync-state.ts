export const CANON_SYNC_SOURCES = ["Characters", "Locations", "Factions"] as const;

export type CanonSyncSource = (typeof CANON_SYNC_SOURCES)[number];

export type CanonSyncStatus = "idle" | "syncing" | "succeeded" | "failed";

export type CanonSyncFreshness = "fresh" | "stale" | "never_synced";

export type SyncFailureCategory =
  | "missing_permissions"
  | "deleted_page"
  | "schema_drift"
  | "rate_limited"
  | "unknown";

export type SyncFailureDetail = {
  category: SyncFailureCategory;
  message: string;
};

export type CanonSyncStateRecord = {
  source: CanonSyncSource;
  status: CanonSyncStatus;
  lastSucceededAt: Date | null;
  failure: SyncFailureDetail | null;
  updatedAt: Date;
};

export type DashboardSyncState = {
  source: CanonSyncSource;
  status: CanonSyncStatus;
  freshness: CanonSyncFreshness;
  lastSucceededAt: Date | null;
  failure: SyncFailureDetail | null;
  updatedAt: Date | null;
};

export function toDashboardSyncStates(
  records: CanonSyncStateRecord[],
): DashboardSyncState[] {
  return CANON_SYNC_SOURCES.map((source) => {
    const record = records.find((candidate) => candidate.source === source);

    if (!record) {
      return {
        source,
        status: "idle",
        freshness: "never_synced",
        lastSucceededAt: null,
        failure: null,
        updatedAt: null,
      };
    }

    return {
      ...record,
      freshness: classifyFreshness(record),
    };
  });
}

function classifyFreshness(record: CanonSyncStateRecord): CanonSyncFreshness {
  if (!record.lastSucceededAt) {
    return "never_synced";
  }

  if (record.status === "failed") {
    return "stale";
  }

  return "fresh";
}
