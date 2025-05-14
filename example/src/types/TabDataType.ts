import { SpectrumDataPoint } from './SpectrumDataType';

export interface TabDataType {
  id: number;
  status?: 'ready' | 'waiting';
  smiles: string;
  spectrum: SpectrumDataPoint[];
}
