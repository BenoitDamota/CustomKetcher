import { MetadataNRM } from './metadataNRM';
import { PeaksInfosData } from './PeaksInfos';
import { SpectrumDataPoint } from './SpectrumDataType';

export interface TabDataType {
  id: number;
  status?: 'ready' | 'waiting';
  smiles: string;
  inChIKey: string;
  spectrum: SpectrumDataPoint[];
  peaksInfos: PeaksInfosData;
  metadata: MetadataNRM;
}
