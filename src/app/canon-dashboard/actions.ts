"use server";

import { revalidatePath } from "next/cache";

import { syncCharactersFromLocalSetup } from "@/characters/character-sync-flow";

export async function syncCharactersAction() {
  const result = await syncCharactersFromLocalSetup();

  revalidatePath("/canon-dashboard");
  revalidatePath("/characters");

  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
}
