import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  DialogContent,
  DialogContentText,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
  Snackbar,
  Alert,
  FormLabel,
} from '@mui/material';
import {
  GeneralSettings,
  GeneralSettingType,
} from '../../../types/GeneralSettingsType';
import { useAppContext } from '../../../context/AppContext';
import {
  loadGeneralSettings,
  loadModelParameters,
  resetGeneralSettingsToDefault,
  resetModelParametersToDefault,
  saveGeneralSettings,
} from '../../../utils/SettingsUtils';
import { ModelParameters } from '../../../types/ModelParametersType';

interface Props {
  onClose: () => void;
  timeoutRef?: React.MutableRefObject<NodeJS.Timeout | null>;
}

const SettingsModalTemplate: React.FC<Props> = ({ onClose, timeoutRef }) => {
  const {
    generalSettings,
    setGeneralSettings,
    openConfirm,
    setPredictionParameters,
  } = useAppContext();

  const [errorMessages, setErrorMessages] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Init values with stocked values or default
  const [values, setValues] = useState<
    Record<string, string | number | boolean>
  >(() => {
    const initial: Record<string, string | number | boolean> = {};
    generalSettings.forEach((category) =>
      category.settings.forEach((setting) => {
        initial[setting.key] =
          setting.value !== undefined ? setting.value : setting.default;
      }),
    );
    return initial;
  });

  useEffect(() => {
    const initial: Record<string, string | number | boolean> = {};
    generalSettings.forEach((category) =>
      category.settings.forEach((setting) => {
        initial[setting.key] =
          setting.value !== undefined ? setting.value : setting.default;
      }),
    );
    setValues(initial);
  }, [generalSettings]);

  // Function to handle settings changes
  const handleChange = (key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // Function to reset the all settings to default values
  const handleResetToDefault = () => {
    const initial: Record<string, string | number | boolean> = {};
    generalSettings.forEach((category) =>
      category.settings.forEach((setting) => {
        initial[setting.key] = setting.default;
      }),
    );
    setValues(initial);
  };

  const handleFactoryReset = () => {
    openConfirm.current(
      'Factory Reset',
      'This will erase all your saved Model Parameters and General Settings. Are you sure you want to continue?',
      async () => {
        try {
          await resetGeneralSettingsToDefault();
          const settings: GeneralSettings | null = await loadGeneralSettings();
          if (settings) {
            setGeneralSettings(settings);
          }

          await resetModelParametersToDefault();
          const parameters: ModelParameters | null =
            await loadModelParameters();
          if (parameters) {
            setPredictionParameters(parameters);
          }
        } catch (error) {
          console.error('Error during factory reset:', error);
          setErrorMessages('Error during factory reset');
        }
      },
    );
  };

  const handleApply = async () => {
    const updatedCategories = generalSettings.map((category) => ({
      ...category,
      settings: category.settings.map((setting) => ({
        ...setting,
        value: values[setting.key],
      })),
    }));

    setGeneralSettings(updatedCategories);
    const saveResult = await saveGeneralSettings(updatedCategories);
    if (!saveResult) {
      setErrorMessages(
        'An error occurred while saving the settings. Please try again.',
      );
      return;
    }

    setSuccessMessage('Settings successfully applied');

    if (timeoutRef) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 3000);
    }
  };

  const customOnClose = () => {
    if (timeoutRef) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    onClose();
  };

  // Dynamic render of the fields according to their types
  const renderField = (setting: GeneralSettingType) => {
    const label = setting.label || setting.key;

    switch (setting.type) {
      case 'text':
      case 'number':
        return (
          <TextField
            fullWidth
            label={label}
            type={setting.type}
            value={values[setting.key]}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            margin="normal"
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={values[setting.key] as boolean}
                onChange={(e) => handleChange(setting.key, e.target.checked)}
              />
            }
            label={label}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>{label}</InputLabel>
            <Select
              value={values[setting.key] as string}
              label={label}
              onChange={(e) => handleChange(setting.key, e.target.value)}
            >
              {setting.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <DialogContent>
      <DialogContentText>
        <strong>General Settings</strong>
      </DialogContentText>
      <br />
      {generalSettings.map((category) => (
        <Accordion key={category.settingsCategoryName}>
          <AccordionSummary
            expandIcon={
              <span className="material-symbols-outlined">
                keyboard_arrow_down
              </span>
            }
          >
            <Typography>{category.settingsCategoryName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {category.settings.map((setting) => (
              <div key={setting.key}>{renderField(setting)}</div>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
      <Accordion key="advancedSettings">
        <AccordionSummary
          expandIcon={
            <span className="material-symbols-outlined">
              keyboard_arrow_down
            </span>
          }
        >
          <Typography>Advanced Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2} marginBottom={4}>
            <FormLabel>Reset to factory settings</FormLabel>
            <Button
              variant="contained"
              color="error"
              onClick={handleFactoryReset}
            >
              Factory Reset
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        sx={{ mt: 3 }}
      >
        <Button variant="text" color="primary" onClick={handleResetToDefault}>
          Reset To Default
        </Button>
        <Stack direction="row-reverse" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" color="secondary" onClick={customOnClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleApply}>
            Apply
          </Button>
        </Stack>
      </Stack>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessages}
        autoHideDuration={3500}
        onClose={() => setErrorMessages('')}
      >
        <Alert onClose={() => setErrorMessages('')} severity="error">
          {errorMessages}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      {successMessage && (
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3500}
          onClose={() => setSuccessMessage('')}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      )}
    </DialogContent>
  );
};

export default SettingsModalTemplate;
