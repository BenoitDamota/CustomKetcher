export interface ModelParameterType {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  default?: string | number | boolean;
  value?: string | number | boolean;
}

export interface ModelParametersType {
  modelName: string;
  parameters: ModelParameterType[];
}

export type ModelParameters = ModelParametersType[];
