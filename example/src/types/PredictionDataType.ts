import { SpectrumDataPoint } from './SpectrumDataType';

export interface PredictionDataType {
  smiles: string;
  spectrum: SpectrumDataPoint[];
}
