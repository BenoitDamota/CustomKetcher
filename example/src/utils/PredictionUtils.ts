import axios from 'axios';
import { ModelParameters } from '../types/ModelParametersType';
import { PredictionDataType } from '../types/PredictionDataType';
import { SnackbarMessage } from '../types/SnackbarMessage';

const apiUrl = process.env.REACT_APP_INTERN_API_PATH || '';

export const startPrediction = async (
  modelsParameters: ModelParameters,
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>,
): Promise<PredictionDataType | null> => {
  try {
    if (!window.ketcher) {
      console.error('Ketcher is not loaded.');
      setSnackbarMessages({
        severity: 'error',
        message: 'Ketcher is not loaded.',
      });
      return null;
    }

    const smiles = await window.ketcher.getSmiles();

    if (!smiles) {
      console.warn('No SMILES found in Ketcher.');
      setSnackbarMessages({
        severity: 'warning',
        message: 'No molecules found in Ketcher.',
      });
      return null;
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

    const response = await axios.post(`${apiUrl}/api/predict`, {
      smiles,
      endpoint: modelParameters.endpoint,
      ...modelParameters.parameters,
    });

    const predictionData: PredictionDataType = response.data;

    return predictionData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error during the prediction:', error.message);
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
