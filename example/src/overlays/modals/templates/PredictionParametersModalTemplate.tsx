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
  Stack,
} from '@mui/material';
import { useAppContext } from '../../../context/AppContext';
import { saveModelParameters } from '../../../utils/SettingsUtils';

interface Props {
  onClose: () => void;
  timeoutRef?: React.MutableRefObject<NodeJS.Timeout | null>;
}

const PredictionParametersModalTemplate: React.FC<Props> = ({
  onClose,
  timeoutRef,
}) => {
  const { predictionParameters, setPredictionParameters, setSnackbarMessages } =
    useAppContext();

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelValues, setModelValues] = useState<{
    [key: string]: string | number | boolean | undefined;
  }>({});
  const [errorMessages, setErrorMessages] = useState<{
    [key: string]: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const selectedModelEndpoint = predictionParameters.models.find(
    (model) => model.modelName === selectedModel,
  )?.endpoint;

  useEffect(() => {
    setSelectedModel(predictionParameters.currentModel);
  }, [predictionParameters.currentModel]);

  useEffect(() => {
    const selectedModelParams = predictionParameters.models.find(
      (model) => model.modelName === selectedModel,
    );

    if (selectedModelParams) {
      const defaultValues: {
        [key: string]: string | number | boolean | undefined;
      } = {};

      selectedModelParams.parameters.forEach((param) => {
        if (param.type === 'boolean') {
          defaultValues[param.key] =
            param.value !== undefined
              ? param.value
              : param.default !== undefined
              ? param.default
              : false;
        } else {
          defaultValues[param.key] = param.value || param.default || undefined;
        }
      });

      setModelValues(defaultValues);
    }
  }, [predictionParameters, selectedModel]);

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
    const selectedModelParams = predictionParameters.models.find(
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

  const handleApply = () => {
    if (selectedModel === '') {
      setErrorMessages((prevErrors) => ({
        ...prevErrors,
        noModel: 'No model selected',
      }));
      return;
    }

    if (!validateRequiredFields()) {
      return;
    }

    // Update only the selected model's parameters
    const updatedModels = predictionParameters.models.map((model) => {
      if (model.modelName === selectedModel) {
        return {
          ...model,
          parameters: model.parameters.map((param) => ({
            ...param,
            value: modelValues[param.key],
          })),
        };
      }
      return model;
    });

    const newParameters = {
      ...predictionParameters,
      models: updatedModels,
    };

    setPredictionParameters(newParameters);

    saveModelParameters(newParameters).then((ok) => {
      if (ok) {
        setSuccessMessage('Parameters successfully applied');

        if (timeoutRef) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setSuccessMessage('');
            onClose();
          }, 3000);
        }
      } else {
        setSnackbarMessages({
          severity: 'error',
          message: 'Failed to save model parameters. Please try again.',
        });
      }
    });
  };

  const handleUseModel = () => {
    const newParameters = {
      ...predictionParameters,
      currentModel: selectedModel,
    };

    setPredictionParameters(newParameters);

    saveModelParameters(newParameters).then((ok) => {
      if (ok) {
        setSuccessMessage('Prediction model selected successfully.');

        if (timeoutRef) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setSuccessMessage('');
            onClose();
          }, 3000);
        }
      } else {
        setPredictionParameters((prevPredictionParameters) => {
          return {
            ...prevPredictionParameters,
            currentModel: '',
          };
        });

        setSnackbarMessages({
          severity: 'error',
          message: 'Failed to select this prediction model. Please try again.',
        });
      }
    });
  };

  const customOnClose = () => {
    if (timeoutRef) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    onClose();
  };

  return (
    <>
      <DialogContentText>
        <strong>Prediction Model Settings</strong>
      </DialogContentText>

      {/* Select Model */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="model-select-label">
          Choose A Prediction Model
          <span style={{ color: 'red', verticalAlign: 'middle' }}>{' *'}</span>
        </InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={selectedModel || predictionParameters.currentModel}
          label="Choose Prediction A Model *"
          onChange={handleModelChange}
        >
          {predictionParameters.models.map((model) => (
            <MenuItem key={model.modelName} value={model.modelName}>
              {model.modelName === predictionParameters.currentModel ? (
                <span>
                  {model.modelName}{' '}
                  <strong className="text-primary">(current)</strong>
                </span>
              ) : (
                model.modelName
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedModel && (
        <>
          <TextField
            key="endpoint"
            id="endpoint"
            label="Model Endpoint"
            type="text"
            value={
              selectedModelEndpoint?.startsWith('/')
                ? `${selectedModelEndpoint} (localhost)`
                : selectedModelEndpoint
            }
            fullWidth
            margin="normal"
            disabled={true}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Divider style={{ margin: '1rem 0px', backgroundColor: '#cccccc' }} />

          {/* Dynamic Parameters */}
          {predictionParameters.models
            .find((model) => model.modelName === selectedModel)
            ?.parameters.map((param, index) => {
              const fieldId = `${selectedModel}-${param.key}`;
              const errorMessage = errorMessages[param.key];
              if (param.type === 'boolean') {
                return (
                  <FormControlLabel
                    key={index}
                    control={
                      <Switch
                        checked={
                          (modelValues[param.key] as boolean) !== undefined
                            ? (modelValues[param.key] as boolean)
                            : false
                        }
                        onChange={handleSwitchChange(param.key)}
                        name={param.key}
                        color="primary"
                      />
                    }
                    label={
                      <>
                        {param.label}
                        {param.required && (
                          <span
                            style={{ color: 'red', verticalAlign: 'middle' }}
                          >
                            {' *'}
                          </span>
                        )}
                      </>
                    }
                  />
                );
              } else {
                return (
                  <TextField
                    key={index}
                    id={fieldId}
                    label={
                      <>
                        {param.label}
                        {param.required && (
                          <span
                            style={{ color: 'red', verticalAlign: 'middle' }}
                          >
                            {' *'}
                          </span>
                        )}
                      </>
                    }
                    type={param.type}
                    value={modelValues[param.key] || ''}
                    onChange={handleInputChange(param.key)}
                    fullWidth
                    margin="normal"
                    error={!!errorMessage}
                    helperText={
                      errorMessage ? `Fil the field : ${errorMessage}` : ''
                    }
                  />
                );
              }
            })}
        </>
      )}

      <Divider style={{ margin: '1rem 0px', backgroundColor: '#cccccc' }} />

      {/* Buttons */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        sx={{ mt: 3 }}
      >
        <Button onClick={handleUseModel} color="secondary" variant="contained">
          Use this model
        </Button>
        <Stack
          display={'flex'}
          direction="row"
          spacing={'16px'}
          justifyContent="flex-end"
          sx={{ mt: 3 }}
        >
          <Button onClick={handleApply} color="primary" variant="contained">
            Apply
          </Button>
          <Button onClick={customOnClose} color="secondary" variant="outlined">
            Cancel
          </Button>
        </Stack>
      </Stack>

      {/* Error Snackbar */}
      <Snackbar
        open={Object.keys(errorMessages).length > 0}
        autoHideDuration={6000}
        onClose={() => setErrorMessages({})}
      >
        <Alert onClose={() => setErrorMessages({})} severity="error">
          {errorMessages.noModel
            ? errorMessages.noModel
            : 'Please fill in the required field: ' +
              Object.values(errorMessages).join(', ')}
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
    </>
  );
};

export default PredictionParametersModalTemplate;
