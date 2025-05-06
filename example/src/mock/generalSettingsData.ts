import { GeneralSettings } from '../types/GeneralSettingsType';

export const mockSettingsCategories: GeneralSettings = [
  {
    settingsCategoryName: 'General',
    settings: [
      {
        key: 'confirmOnInputSMILES',
        label:
          'Show confirmation before prediction if input bar contains a SMILES',
        type: 'boolean',
        default: true,
        value: true,
      },
      {
        key: 'maxRetries',
        label: 'Maximum Retries',
        type: 'number',
        default: 3,
        value: 8,
      },
      {
        key: 'theme',
        label: 'Theme',
        type: 'select',
        default: 'Light',
        options: ['Light', 'Dark'],
      },
      {
        key: 'enableFeatureX',
        label: 'Enable Feature X',
        type: 'boolean',
        default: true,
        value: false,
      },
    ],
  },
  {
    settingsCategoryName: 'Notifications',
    settings: [
      {
        key: 'emailNotifications',
        label: 'Email Notifications',
        type: 'boolean',
        default: true,
      },
      {
        key: 'smsNotifications',
        label: 'SMS Notifications',
        type: 'boolean',
        default: false,
      },
    ],
  },
];
