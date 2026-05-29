import type {
  CanonElementType,
  ProvisioningDatabaseStatus,
} from "@/notion/schema-provisioner";

export type ProvisionCanonActionState =
  | {
      status: "idle";
    }
  | {
      status: "failed";
      errors: string[];
    }
  | {
      status: "succeeded" | "needs_attention";
      canonName: string;
      databases: Array<{
        elementType: CanonElementType;
        status: ProvisioningDatabaseStatus;
        attentionReason: string | null;
      }>;
    };

export type ProvisionCanonAction = (
  state: ProvisionCanonActionState,
  formData: FormData,
) => Promise<ProvisionCanonActionState>;
