import { useState } from 'react';
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
} from '@mui/material';
import { GeneralSettingType } from '../../../types/GeneralSettingsType';
import { useAppContext } from '../../../context/AppContext';

interface Props {
  onClose: () => void;
}

const SettingsModalTemplate: React.FC<Props> = ({ onClose }) => {
  const { generalSettings, setGeneralSettings } = useAppContext();

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
        console.log(setting.key, setting.value, setting.default);
      }),
    );
    return initial;
  });

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

  const handleApply = () => {
    const updatedCategories = generalSettings.map((category) => ({
      ...category,
      settings: category.settings.map((setting) => ({
        ...setting,
        value: values[setting.key],
      })),
    }));

    setGeneralSettings(updatedCategories);

    setSuccessMessage('Settings successfully applied');
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 3000);
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
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApply()}
          >
            Appliquer
          </Button>
        </Stack>
      </Stack>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </DialogContent>
  );
};

export default SettingsModalTemplate;
