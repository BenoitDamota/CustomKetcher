import { defaultGeneralSettings } from '../defaults/GeneralSettingsDefault';
import { defaultModelParameters } from '../defaults/ModelParametersDefault';
import { ModelParameters } from '../types/ModelParametersType';
import {
  GeneralSettings,
  GeneralSettingType,
} from '../types/GeneralSettingsType';

const STORAGE_KEYS = {
  general: 'local::PredictionRMN::GeneralSettings',
  modelParams: 'local::PredictionRMN::ModelParameters',
};

export const loadGeneralSettings =
  async (): Promise<GeneralSettings | null> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.general);
      if (!raw) return defaultGeneralSettings;
      return JSON.parse(raw) as GeneralSettings;
    } catch (error) {
      console.error('Error loading GeneralSettings:', error);
      return null;
    }
  };

export const saveGeneralSettings = async (
  settings: GeneralSettings,
): Promise<boolean> => {
  try {
    localStorage.setItem(STORAGE_KEYS.general, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving GeneralSettings:', error);
    return false;
  }
};

export const resetGeneralSettingsToDefault =
  async (): Promise<GeneralSettings | null> => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.general,
        JSON.stringify(defaultGeneralSettings),
      );
      return defaultGeneralSettings;
    } catch (error) {
      console.error('Error resetting GeneralSettings:', error);
      return null;
    }
  };

export const loadModelParameters =
  async (): Promise<ModelParameters | null> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.modelParams);
      if (!raw) return defaultModelParameters;
      return JSON.parse(raw) as ModelParameters;
    } catch (error) {
      console.error('Error loading ModelParameters:', error);
      return null;
    }
  };

export const saveModelParameters = async (
  parameters: ModelParameters,
): Promise<boolean> => {
  try {
    localStorage.setItem(STORAGE_KEYS.modelParams, JSON.stringify(parameters));
    return true;
  } catch (error) {
    console.error('Error saving ModelParameters:', error);
    return false;
  }
};

export const resetModelParametersToDefault =
  async (): Promise<ModelParameters | null> => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.modelParams,
        JSON.stringify(defaultModelParameters),
      );
      return defaultModelParameters;
    } catch (error) {
      console.error('Error resetting ModelParameters:', error);
      return null;
    }
  };

export function getSetting(
  settings: GeneralSettings,
  categoryName: string,
  key: string,
): GeneralSettingType | undefined {
  return settings
    .find((category) => category.settingsCategoryName === categoryName)
    ?.settings.find((setting) => setting.key === key);
}
