export interface ModelParameterType {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean';
  required: boolean;
  options?: string[];
  default?: string | number | boolean;
  value?: string | number | boolean;
}

export interface ModelParametersType {
  modelName: string;
  endpoint: string;
  parameters: ModelParameterType[];
}

export interface ModelParameters {
  currentModel: string;
  models: ModelParametersType[];
}
