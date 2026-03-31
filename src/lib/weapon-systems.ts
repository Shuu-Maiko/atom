
export const WEAPON_RANGES = {
  LONG_RANGE_RADAR: 400000,
  MEDIUM_RANGE_RADAR: 160000,
  SHORT_RANGE_RADAR: 50000,
  JAMMING_ZONE: 100000,
  COASTAL_RADAR: 80000,
} as const;

export type WeaponSystemType = keyof typeof WEAPON_RANGES;

export function getSensorProfile(baseType: string): { range: number; type: 'radar' | 'jamming' } | null {
  const type = baseType.toLowerCase();
  
  if (type.includes('air') || type.includes('missile')) {
    return { range: WEAPON_RANGES.LONG_RANGE_RADAR, type: 'radar' };
  }
  if (type.includes('naval') || type.includes('coast')) {
    return { range: WEAPON_RANGES.COASTAL_RADAR, type: 'radar' };
  }
  if (type.includes('jam') || type.includes('electronic')) {
    return { range: WEAPON_RANGES.JAMMING_ZONE, type: 'jamming' };
  }
  
  return { range: WEAPON_RANGES.SHORT_RANGE_RADAR, type: 'radar' };
}
