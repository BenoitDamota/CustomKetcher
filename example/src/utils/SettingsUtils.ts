import axios from 'axios';
import { GeneralSettings } from '../types/GeneralSettingsType';
import { ModelParameters } from '../types/ModelParametersType';

const apiUrl = process.env.REACT_APP_INTERN_API_PATH || '';

export const loadGeneralSettings =
  async (): Promise<GeneralSettings | null> => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/loadSettings/GeneralSettings`,
      );

      return response.data as GeneralSettings;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error loading GeneralSettings:', error.message);
      } else {
        console.error('Unknown error loading GeneralSettings:', error);
      }
      return null;
    }
  };

export const saveGeneralSettings = async (
  settings: GeneralSettings,
): Promise<boolean> => {
  try {
    await axios.post(`${apiUrl}/api/saveSettings/GeneralSettings`, settings);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error saving GeneralSettings:', error.message);
    } else {
      console.error('Unknown error saving GeneralSettings:', error);
    }
    return false;
  }
};

export const resetGeneralSettingsToDefault =
  async (): Promise<GeneralSettings | null> => {
    try {
      await axios.post(`${apiUrl}/api/resetToDefault/GeneralSettings`);

      const response = await axios.get(
        `${apiUrl}/api/loadSettings/GeneralSettings`,
      );

      return response.data as GeneralSettings;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error resetting GeneralSettings:', error.message);
      } else {
        console.error('Unknown error resetting GeneralSettings:', error);
      }
      return null;
    }
  };

export const loadModelParameters =
  async (): Promise<ModelParameters | null> => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/loadSettings/ModelParameters`,
      );

      return response.data as ModelParameters;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error loading ModelParameters:', error.message);
      } else {
        console.error('Unknown error loading ModelParameters:', error);
      }
      return null;
    }
  };

export const saveModelParameters = async (
  parameters: ModelParameters,
): Promise<boolean> => {
  try {
    await axios.post(`${apiUrl}/api/saveSettings/ModelParameters`, parameters);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error saving ModelParameters:', error.message);
    } else {
      console.error('Unknown error saving ModelParameters:', error);
    }
    return false;
  }
};

export const resetModelParametersToDefault =
  async (): Promise<ModelParameters | null> => {
    try {
      await axios.post(`${apiUrl}/api/resetToDefault/ModelParameters`);

      const response = await axios.get(
        `${apiUrl}/api/loadSettings/ModelParameters`,
      );

      return response.data as ModelParameters;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error resetting ModelParameters:', error.message);
      } else {
        console.error('Unknown error resetting ModelParameters:', error);
      }
      return null;
    }
  };
