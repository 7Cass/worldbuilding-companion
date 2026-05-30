"use server";

import { revalidatePath } from "next/cache";

import { syncCharactersFromLocalSetup } from "@/characters/character-sync-flow";
import { syncEventsFromLocalSetup } from "@/events/event-sync-flow";
import { syncFactionsFromLocalSetup } from "@/factions/faction-sync-flow";
import { syncLoreEntriesFromLocalSetup } from "@/lore-entries/lore-entry-sync-flow";
import { syncLocationsFromLocalSetup } from "@/locations/location-sync-flow";

export async function syncCharactersAction() {
  const result = await syncCharactersFromLocalSetup();

  revalidatePath("/canon-dashboard");
  revalidatePath("/characters");

  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
}

export async function syncLocationsAction() {
  const result = await syncLocationsFromLocalSetup();

  revalidatePath("/canon-dashboard");
  revalidatePath("/locations");

  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
}

export async function syncFactionsAction() {
  const result = await syncFactionsFromLocalSetup();

  revalidatePath("/canon-dashboard");
  revalidatePath("/factions");

  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
}

export async function syncEventsAction() {
  const result = await syncEventsFromLocalSetup();

  revalidatePath("/canon-dashboard");
  revalidatePath("/events");

  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
}

export async function syncLoreEntriesAction() {
  const result = await syncLoreEntriesFromLocalSetup();

  revalidatePath("/canon-dashboard");
  revalidatePath("/lore-entries");

  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
}
