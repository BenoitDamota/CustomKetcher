import axios, { AxiosError } from 'axios';
import { ModelParameters } from '../types/ModelParametersType';
import { PredictionDataType } from '../types/PredictionDataType';
import { SnackbarMessage } from '../types/SnackbarMessage';
import { TabDataType } from '../types/TabDataType';

const apiUrl = process.env.REACT_APP_INTERN_API_PATH || '';

const PREDICTION_MODEL_TIMEOUT = 300000;

export const startPrediction = async (
  newTab: (data: Omit<TabDataType, 'id'>) => Promise<number>,
  updateTab: (id: number, data: Omit<TabDataType, 'id'>) => Promise<boolean>,
  modelsParameters: ModelParameters,
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>,
  smilesArg?: string,
): Promise<PredictionDataType | null> => {
  let newTabId: number | null = null;

  try {
    let smiles = smilesArg || '';

    if (!smilesArg) {
      if (!window.ketcher) {
        console.error('Ketcher is not loaded.');
        setSnackbarMessages({
          severity: 'error',
          message: 'Ketcher is not loaded.',
        });
        return null;
      }

      smiles = await window.ketcher.getSmiles();

      if (!smiles) {
        console.warn('No SMILES found in Ketcher.');
        setSnackbarMessages({
          severity: 'warning',
          message: 'No molecules found in Ketcher.',
        });
        return null;
      }
    }

    const modelParameters = modelsParameters.models.find(
      (model) => model.modelName === modelsParameters.currentModel,
    );

    if (!modelParameters) {
      console.error(
        'Could not find parameters for the selected prediction model.',
      );
      setSnackbarMessages({
        severity: 'error',
        message:
          'Unable to find the prediction parameters. Please ensure you have selected a prediction model.',
      });
      return null;
    }

    newTabId = await newTab({
      status: 'waiting',
      smiles,
      spectrum: [],
    });

    // Molecule SMILES is kekulized in the backend via RDKIT
    const response = await axios.post(
      `${apiUrl}/api/predict`,
      {
        smiles,
        endpoint: modelParameters.endpoint,
        ...modelParameters.parameters,
      },
      {
        timeout: PREDICTION_MODEL_TIMEOUT,
      },
    );

    const predictionData: PredictionDataType = response.data;

    const result = await updateTab(newTabId, {
      status: 'ready',
      smiles: predictionData.smiles,
      spectrum: predictionData.spectrum,
    });

    if (result) {
      setSnackbarMessages({
        severity: 'success',
        message: `Tab ${newTabId} : Prediction result received.`,
      });
    }

    return predictionData;
  } catch (error: unknown) {
    if (newTabId !== null) {
      await updateTab(newTabId, {
        status: 'ready',
        smiles: '',
        spectrum: [],
      });
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
    setSnackbarMessages({
      severity: 'error',
      message: 'Error during the prediction.',
    });
    return null;
  }
};
