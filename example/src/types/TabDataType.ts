import { SpectrumDataPoint } from './SpectrumDataType';

export interface TabDataType {
  id: number;
  smiles: string;
  spectrum: SpectrumDataPoint[];
}
