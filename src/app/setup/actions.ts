"use server";

import { revalidatePath } from "next/cache";

import { provisionCanonFromLocalSetup } from "@/setup/canon-setup-flow";
import type { ProvisionCanonActionState } from "./provision-canon-action-state";

export async function provisionCanonAction(
  _state: ProvisionCanonActionState,
  formData: FormData,
): Promise<ProvisionCanonActionState> {
  const canonName = String(formData.get("canonName") ?? "");
  const result = await provisionCanonFromLocalSetup({ canonName });

  revalidatePath("/setup");

  if (!result.ok) {
    return {
      status: "failed",
      errors: result.errors.map((error) => error.message),
    };
  }

  return {
    status: result.provisioning.status,
    canonName: result.provisioning.canon.name,
    databases: result.provisioning.databases.map((database) => ({
      elementType: database.elementType,
      status: database.status,
      attentionReason: database.attentionReason,
    })),
  };
}
