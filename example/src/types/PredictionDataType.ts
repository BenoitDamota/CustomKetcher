import { MetadataNRM } from './metadataNRM';
import { PeaksInfosData } from './PeaksInfos';
import { SpectrumDataPoint } from './SpectrumDataType';

export interface PredictionDataType {
  smiles: string;
  spectrum: SpectrumDataPoint[];
  peaksInfos: PeaksInfosData;
  metadata: MetadataNRM;
}
