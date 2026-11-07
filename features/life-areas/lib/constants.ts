export interface DefaultLifeAreaDefinition {
  key: string;
  nameEn: string;
  nameFa: string;
  defaultDifficulty: number;
}

export const DEFAULT_LIFE_AREAS: readonly DefaultLifeAreaDefinition[] = [
  {
    key: 'career',
    nameEn: 'Career',
    nameFa: 'شغل و حرفه',
    defaultDifficulty: 4,
  },
  {
    key: 'lifestyle',
    nameEn: 'Lifestyle',
    nameFa: 'سبک زندگی',
    defaultDifficulty: 1,
  },
  {
    key: 'health',
    nameEn: 'Health',
    nameFa: 'سلامت',
    defaultDifficulty: 1,
  },
] as const;

export function getDefaultLifeAreaTitle(
  area: DefaultLifeAreaDefinition,
  locale?: string,
): string {
  return locale === 'fa' ? area.nameFa : area.nameEn;
}
