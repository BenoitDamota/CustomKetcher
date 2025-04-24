// src/components/SettingsModalTemplate.tsx

import React, { useState } from 'react';
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
} from '@mui/material';
import { Category, Setting } from '../../types/settingsTypes';
import { mockSettingsCategories } from '../../mock/settingsData'; // Import mock data

interface Props {
  onClose: () => void;
  onApply?: (settings: Record<string, string | number | boolean>) => void;
}

const SettingsModalTemplate: React.FC<Props> = ({ onClose, onApply }) => {
  const categories: Category[] = mockSettingsCategories;

  const [values, setValues] = useState<
    Record<string, string | number | boolean>
  >(() => {
    const initial: Record<string, string | number | boolean> = {};
    categories.forEach((category) =>
      category.settings.forEach((setting) => {
        initial[setting.key] = setting.default;
      }),
    );
    return initial;
  });

  const handleChange = (key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (setting: Setting) => {
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
                checked={values[setting.key] as boolean} // Explicitly cast to boolean
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
              value={values[setting.key] as string} // Explicitly cast to string
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
      {categories.map((category) => (
        <Accordion key={category.categoryName}>
          <AccordionSummary
            expandIcon={
              <span className="material-symbols-outlined">
                keyboard_arrow_down
              </span>
            }
          >
            <Typography>{category.categoryName}</Typography>
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
        justifyContent="flex-end"
        sx={{ mt: 3 }}
      >
        <Button variant="outlined" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onApply?.(values)}
        >
          Appliquer
        </Button>
      </Stack>
    </DialogContent>
  );
};

export default SettingsModalTemplate;
