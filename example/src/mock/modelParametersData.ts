import { ModelParameters } from '../types/ModelParametersType';

export const mockPredictionParameters: ModelParameters = [
  {
    modelName: 'modelA',
    parameters: [
      {
        key: 'param1',
        label: 'Parameter 1',
        type: 'number',
        required: false,
        default: '0',
      },
      {
        key: 'param2',
        label: 'Parameter 2',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    modelName: 'modelB',
    parameters: [
      {
        key: 'param1',
        label: 'Parameter 1',
        type: 'text',
        required: true,
      },
      {
        key: 'param2',
        label: 'Parameter 2',
        type: 'number',
        required: true,
        value: 3,
      },
      {
        key: 'param3',
        label: 'Parameter 3',
        type: 'boolean',
        required: true,
      },
    ],
  },
];
