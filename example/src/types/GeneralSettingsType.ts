export interface GeneralSettingType {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  default: string | number | boolean;
  options?: string[];
  value?: string | number | boolean;
}

export interface GeneralSettingsCategoryType {
  settingsCategoryName: string;
  settings: GeneralSettingType[];
}

export type GeneralSettings = GeneralSettingsCategoryType[];
