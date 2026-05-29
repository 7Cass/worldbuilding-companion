import { CANON_ELEMENT_TYPES } from "@/domain/canon-vocabulary";
import type { CanonElementType } from "@/notion/schema-provisioner";

export type DashboardCharacter = {
  id: string;
  name: string;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type CanonDashboardRepository = {
  listCharactersForDashboard(): Promise<DashboardCharacter[]>;
};

export type CanonDashboard = {
  elementCounts: Array<{
    elementType: CanonElementType;
    count: number;
  }>;
  recentActivity: Array<{
    elementType: "Character";
    entityId: string;
    label: string;
    happenedAt: Date;
  }>;
};

export async function getCanonDashboard(input: {
  repository: CanonDashboardRepository;
}): Promise<CanonDashboard> {
  const characters = await input.repository.listCharactersForDashboard();

  return {
    elementCounts: CANON_ELEMENT_TYPES.map((elementType) => ({
      elementType,
      count: elementType === "Character" ? characters.length : 0,
    })),
    recentActivity: [...characters]
      .sort((left, right) => right.notionLastEditedAt.getTime() - left.notionLastEditedAt.getTime())
      .slice(0, 5)
      .map((character) => ({
        elementType: "Character",
        entityId: character.id,
        label: character.name,
        happenedAt: character.notionLastEditedAt,
      })),
  };
}
