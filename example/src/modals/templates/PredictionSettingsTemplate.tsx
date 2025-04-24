import { useState, useEffect } from 'react';
import {
  DialogContentText,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Divider,
  SelectChangeEvent,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { ModelParametersType } from '../../types/ModelParametersType';
import { ModelParameters } from '../../mock/modelParametersData';

interface Props {
  onClose: () => void;
}

const PredictionSettingsTemplate: React.FC<Props> = ({ onClose }) => {
  const modelParams: ModelParametersType[] = ModelParameters;

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelValues, setModelValues] = useState<{
    [key: string]: string | number | boolean | undefined;
  }>({});
  const [errorMessages, setErrorMessages] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const selectedModelParams = modelParams.find(
      (model) => model.modelName === selectedModel,
    );

    if (selectedModelParams) {
      const defaultValues: {
        [key: string]: string | number | boolean | undefined;
      } = {};

      selectedModelParams.parameters.forEach((param) => {
        if (param.type === 'boolean') {
          defaultValues[param.key] = param.value || param.default || false;
        } else {
          defaultValues[param.key] = param.value || param.default || undefined;
        }
      });

      setModelValues(defaultValues);
    }
  }, [modelParams, selectedModel]);

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    setSelectedModel(event.target.value);
  };

  const handleInputChange =
    (param: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setModelValues({ ...modelValues, [param]: event.target.value });
    };

  const handleSwitchChange =
    (param: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setModelValues({ ...modelValues, [param]: event.target.checked });
    };

  const validateRequiredFields = (): boolean => {
    const selectedModelParams = modelParams.find(
      (model) => model.modelName === selectedModel,
    );

    const errors: { [key: string]: string } = {};

    if (selectedModelParams) {
      for (const param of selectedModelParams.parameters) {
        if (param.required) {
          const value = modelValues[param.key];
          if (value === undefined || value === '' || value === null) {
            errors[param.key] = param.label;
          }
        }
      }
    }

    setErrorMessages(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (selectedModel === '') {
      setErrorMessages((prevErrors) => ({
        ...prevErrors,
        noModel: 'No model selected',
      }));
      return;
    }

    if (validateRequiredFields()) {
      console.log('Model Settings:', modelValues);
      // Logic to save the model settings
    }
  };

  // Utiliser useEffect pour observer les changements dans errorMessages
  useEffect(() => {
    console.log('Updated errorMessages:', errorMessages);
  }, [errorMessages]);

  return (
    <>
      <DialogContentText>
        <strong>Prediction Model Settings</strong>
      </DialogContentText>

      {/* Select Model */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="model-select-label">
          Choose A Prediction Model
        </InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={selectedModel}
          label="Choose Prediction A Model"
          onChange={handleModelChange}
        >
          <MenuItem value="modelA">Model A</MenuItem>
          <MenuItem value="modelB">Model B</MenuItem>
        </Select>
      </FormControl>

      {selectedModel && (
        <>
          <Divider style={{ margin: '1rem 0px', backgroundColor: '#cccccc' }} />

          {/* Dynamic Parameters */}
          {modelParams
            .find((model) => model.modelName === selectedModel)
            ?.parameters.map((param, index) => {
              const fieldId = `${selectedModel}-${param.key}`;
              const errorMessage = errorMessages[param.key]; // Get specific error for the field
              if (param.type === 'boolean') {
                return (
                  <FormControlLabel
                    key={index}
                    control={
                      <Switch
                        checked={(modelValues[param.key] as boolean) || false}
                        onChange={handleSwitchChange(param.key)}
                        name={param.key}
                        color="primary"
                      />
                    }
                    label={param.label}
                  />
                );
              } else {
                return (
                  <TextField
                    key={index}
                    id={fieldId}
                    label={param.label}
                    type={param.type}
                    value={modelValues[param.key] || ''}
                    onChange={handleInputChange(param.key)}
                    fullWidth
                    margin="normal"
                    error={!!errorMessage} // Show error if there's an error for this field
                    helperText={errorMessage || ''}
                  />
                );
              }
            })}
        </>
      )}

      <Divider style={{ margin: '1rem 0px', backgroundColor: '#cccccc' }} />

      {/* Submit and Close Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
        }}
      >
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Apply
        </Button>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
      </div>

      {/* Error Snackbar */}
      <Snackbar
        open={Object.keys(errorMessages).length > 0} // Only show if there are errors
        autoHideDuration={6000}
        onClose={() => setErrorMessages({})} // Close the error when the snackbar closes
      >
        <Alert onClose={() => setErrorMessages({})} severity="error">
          {errorMessages.noModel
            ? errorMessages.noModel
            : 'Please fill in the required field: ' +
              Object.values(errorMessages).join(', ')}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PredictionSettingsTemplate;
