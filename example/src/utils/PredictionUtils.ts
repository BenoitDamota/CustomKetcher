import axios, { AxiosError } from 'axios';
import {
  ModelParameters,
  ModelParameterType,
} from '../types/ModelParametersType';
import { PredictionDataType } from '../types/PredictionDataType';
import { SnackbarMessage } from '../types/SnackbarMessage';
import { TabDataType } from '../types/TabDataType';
import { NMR_TYPES, NMRType } from '../types/metadataNRM';

const apiUrl = process.env.REACT_APP_INTERN_API_PATH || '';

const PREDICTION_MODEL_TIMEOUT = 300000;

export const startPrediction = async (
  newTab: (data: Omit<TabDataType, 'id'>) => Promise<number>,
  updateTab: (id: number, data: Omit<TabDataType, 'id'>) => Promise<boolean>,
  closeTab: (tabId: number, skipWarning?: boolean) => void,
  modelsParameters: ModelParameters,
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>,
  smilesArg?: string,
  type?: '1H' | '13C' | undefined,
): Promise<PredictionDataType | null> => {
  let newTabId: number | null = null;

  try {
    let smiles = smilesArg || '';

    if (!smilesArg) {
      if (!window.ketcher) {
        console.error('Ketcher is not loaded');
        setSnackbarMessages({
          severity: 'error',
          message: 'Ketcher is not loaded',
        });
        return null;
      }

      smiles = await window.ketcher.getSmiles();

      if (!smiles) {
        console.warn('No SMILES found in Ketcher');
        setSnackbarMessages({
          severity: 'warning',
          message: 'No molecules found in Ketcher',
        });
        return null;
      }
    }

    const modelParameters = modelsParameters.models.find(
      (model) => model.modelName === modelsParameters.currentModel,
    );

    if (!modelParameters) {
      console.error(
        'Could not find parameters for the selected prediction model',
      );
      setSnackbarMessages({
        severity: 'error',
        message:
          'Unable to find the prediction parameters. Please ensure you have selected a prediction model.',
      });
      return null;
    }

    let nmrType: NMRType = 'Unknown';

    const updatedParameters: ModelParameterType[] =
      modelParameters.parameters.map((param) => {
        if (param.key === 'type') {
          if (type !== undefined) {
            nmrType = type === '1H' || type === '13C' ? type : 'Unknown';
            return {
              ...param,
              value: type,
            };
          } else {
            if (param.value === '1H' || param.value === '13C') {
              nmrType = param.value as NMRType;
            } else {
              nmrType = 'Unknown';
            }
            return { ...param };
          }
        }
        return { ...param };
      });

    const typeExists = modelParameters.parameters.some(
      (param) => param.key === 'type',
    );

    if (!typeExists && type !== undefined) {
      nmrType = type === '1H' || type === '13C' ? type : 'Unknown';
      const newParamType: ModelParameterType = {
        key: 'type',
        label: 'NMR Type',
        required: true,
        type: 'text',
        value: type,
      };
      updatedParameters.push(newParamType);
    }

    newTabId = await newTab({
      status: 'waiting',
      smiles,
      inChIKey: '',
      spectrum: [],
      peaksInfos: [],
      metadata: {
        nucleusType: NMR_TYPES.includes(nmrType) ? nmrType : 'Unknown',
      },
    });

    // Molecule SMILES is kekulized in the backend via RDKIT
    const response = await axios.post(
      `${apiUrl}/api/predict`,
      {
        smiles,
        endpoint: modelParameters.endpoint,
        ...updatedParameters,
      },
      {
        timeout: PREDICTION_MODEL_TIMEOUT,
      },
    );

    if (
      response.data &&
      typeof response.data === 'object' &&
      'error' in response.data
    ) {
      throw new Error(response.data.error);
    }

    const predictionData: PredictionDataType = response.data;

    const result = await updateTab(newTabId, {
      status: 'ready',
      smiles: predictionData.smiles,
      inChIKey: '',
      spectrum: predictionData.spectrum,
      peaksInfos: predictionData.peaksInfos,
      metadata: {
        ...predictionData.metadata,
        nucleusType: NMR_TYPES.includes(predictionData.metadata.nucleusType)
          ? predictionData.metadata.nucleusType
          : 'Unknown',
      },
    });

    if (result) {
      setSnackbarMessages({
        severity: 'success',
        message: `Tab ${newTabId} : Prediction result received`,
      });
    }

    return predictionData;
  } catch (error: unknown) {
    if (newTabId !== null) {
      await closeTab(newTabId, true);
    }

    if (error instanceof AxiosError) {
      const errorData = error.response?.data.error;
      if (errorData) {
        console.error('Error during the prediction:', errorData);
        setSnackbarMessages({
          severity: 'error',
          message: errorData,
        });
        return null;
      }
    } else {
      console.error('Unknown error during the prediction:', error);
    }

    let message = 'Unknown error during the prediction.';
    if (error instanceof Error) {
      message = error.message;
    }

    setSnackbarMessages({
      severity: 'error',
      message: `Error during the prediction : ${message}`,
    });
    return null;
  }
};

export async function startPredictionAuto(
  newTab: (data: Omit<TabDataType, 'id'>) => Promise<number>,
  updateTab: (id: number, data: Omit<TabDataType, 'id'>) => Promise<boolean>,
  closeTab: (tabId: number, skipWarning?: boolean) => void,
  modelsParameters: ModelParameters,
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>,
  predictBoth: boolean,
  smilesArg?: string,
) {
  if (predictBoth) {
    startPrediction(
      newTab,
      updateTab,
      closeTab,
      modelsParameters,
      setSnackbarMessages,
      smilesArg,
      '1H',
    );
    startPrediction(
      newTab,
      updateTab,
      closeTab,
      modelsParameters,
      setSnackbarMessages,
      smilesArg,
      '13C',
    );
  } else {
    await startPrediction(
      newTab,
      updateTab,
      closeTab,
      modelsParameters,
      setSnackbarMessages,
      smilesArg,
    );
  }
}
