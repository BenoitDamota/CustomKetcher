export type SpectrumDataPoint = {
  ppm: number;
  intensity: number;
  atomID: number[];
};

export type SpectrumRegionMultiplicity = {
  ppm: number;
  intensity: number;
};

export type SpectrumRegion = {
  regionId: string;
  ppmMin: number;
  ppmMax: number;
  intensityMax: number;
  multiplicity: SpectrumRegionMultiplicity[];
  highestPpm: number;
  atomIds: number[];
};

export type RegionLookup = {
  start: number;
  end: number;
  regionId: string;
};

export interface RegionData {
  region: SpectrumRegion[];
  lookup: RegionLookup[];
}
