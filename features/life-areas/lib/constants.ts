export const LIFE_AREA_DEFAULT_DIFFICULTY = 1;

export interface DefaultLifeAreaDefinition {
  key: string;
  nameEn: string;
  nameFa: string;
  defaultDifficulty: number;
}

export const DEFAULT_LIFE_AREAS: readonly DefaultLifeAreaDefinition[] = [
  {
    key: 'lifestyle',
    nameEn: 'Lifestyle',
    nameFa: 'سبک زندگی',
    defaultDifficulty: 2,
  },
  {
    key: 'health',
    nameEn: 'Health',
    nameFa: 'سلامت',
    defaultDifficulty: 2,
  },
  {
    key: 'career',
    nameEn: 'Career',
    nameFa: 'شغل و حرفه',
    defaultDifficulty: 2,
  },
  {
    key: 'social-connections',
    nameEn: 'Social Connections',
    nameFa: 'روابط اجتماعی',
    defaultDifficulty: 2,
  },
] as const;

export function getDefaultLifeAreaTitle(
  area: DefaultLifeAreaDefinition,
  locale?: string,
): string {
  return locale === 'fa' ? area.nameFa : area.nameEn;
}
