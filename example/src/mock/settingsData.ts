import { Category } from '../types/settingsTypes';

export const mockSettingsCategories: Category[] = [
  {
    categoryName: 'General',
    settings: [
      {
        key: 'maxRetries',
        label: 'Maximum Retries',
        type: 'number',
        default: 3,
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
      },
    ],
  },
  {
    categoryName: 'Notifications',
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
