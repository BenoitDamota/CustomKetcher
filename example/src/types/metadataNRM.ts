export const NMR_TYPES = ['1H', '13C', 'Unknown'] as const;
export type NMRType = typeof NMR_TYPES[number];

export interface MetadataNRM {
  nucleusType: NMRType;
}
