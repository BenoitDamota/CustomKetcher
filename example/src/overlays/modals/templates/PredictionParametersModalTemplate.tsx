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
  Stack,
  Typography,
  SxProps,
  Theme,
} from '@mui/material';
import { useAppContext } from '../../../context/AppContext';
import { saveModelParameters } from '../../../utils/SettingsUtils';

const requiredAsteriskStyle: React.CSSProperties = {
  color: 'red',
  verticalAlign: 'middle',
};

const menuItemManageSpanStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const manageIconStyle: React.CSSProperties = {
  marginRight: 8,
};

const dividerStyle: React.CSSProperties = {
  margin: '1rem 0px',
  backgroundColor: '#cccccc',
};

const formControlStackSx: SxProps<Theme> = { mt: 3 };

const buttonsStackSx: SxProps<Theme> = { mt: 3 };

interface Props {
  onClose: () => void;
}

const PredictionParametersModalTemplate: React.FC<Props> = ({ onClose }) => {
  const {
    predictionParameters,
    setPredictionParameters,
    setSnackbarMessages,
    openModal,
  } = useAppContext();

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelValues, setModelValues] = useState<{
    [key: string]: string | number | boolean | undefined;
  }>({});

  const [errorMessages, setErrorMessages] = useState<{
    [key: string]: string;
  }>({});

  const selectedModelEndpoint = predictionParameters.models.find(
    (model) => model.modelName === selectedModel,
  )?.endpoint;

  useEffect(() => {
    const modelExists = predictionParameters.models.some(
      (model) => model.modelName === predictionParameters.currentModel,
    );

    if (!modelExists) {
      setSelectedModel('');
    } else {
      setSelectedModel(predictionParameters.currentModel);
    }
  }, [predictionParameters.currentModel, predictionParameters.models]);

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
    const value = event.target.value;
    if (value === '__manage__') {
      openModal('ManagePredictionModels');
    } else {
      setSelectedModel(value);
    }
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

    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      setSnackbarMessages({
        severity: 'error',
        message:
          'Please fill in the required field: ' +
          Object.values(errors).join(', '),
      });
    }

    return isValid;
  };

  const handleApply = () => {
    if (selectedModel === '') {
      setSnackbarMessages({ severity: 'error', message: 'No model selected' });
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
        setSnackbarMessages({
          severity: 'success',
          message: 'Parameters successfully applied',
        });
        onClose();
      } else {
        setSnackbarMessages({
          severity: 'error',
          message: 'Failed to save model parameters. Please try again.',
        });
      }
    });
  };

  const handleUseModel = () => {
    if (!selectedModel) {
      setSnackbarMessages({
        severity: 'warning',
        message: 'Please select a model before proceeding',
      });
      return;
    }

    if (!validateRequiredFields()) {
      return;
    }

    const newParameters = {
      ...predictionParameters,
      currentModel: selectedModel,
    };

    setPredictionParameters(newParameters);

    saveModelParameters(newParameters).then((ok) => {
      if (ok) {
        setSnackbarMessages({
          severity: 'success',
          message: `Prediction model '${selectedModel}' selected successfully`,
        });
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

  return (
    <>
      <DialogContentText>
        <strong>Prediction Model Settings</strong>
      </DialogContentText>

      {/* Select Model */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="model-select-label">
          Choose A Prediction Model
          <span style={requiredAsteriskStyle}>{' *'}</span>
        </InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={selectedModel || predictionParameters.currentModel}
          label="Choose Prediction A Model *"
          onChange={handleModelChange}
        >
          <MenuItem value="__manage__">
            <span style={menuItemManageSpanStyle}>
              <span
                className="material-symbols-outlined"
                style={manageIconStyle}
              >
                edit_note
              </span>
              Manage Prediction Models
            </span>
          </MenuItem>

          <MenuItem disabled>
            <div
              style={{
                borderTop: '1px solid #ccc',
                width: '100%',
              }}
            />
          </MenuItem>

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

          <Divider style={dividerStyle} />

          {/* Dynamic Parameters */}
          {predictionParameters.models.find(
            (model) => model.modelName === selectedModel,
          )?.parameters.length === 0 ? (
            <Typography variant="body1" color="textSecondary">
              No parameters
            </Typography>
          ) : (
            predictionParameters.models
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
                            <span style={requiredAsteriskStyle}>{' *'}</span>
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
                            <span style={requiredAsteriskStyle}>{' *'}</span>
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
                        errorMessage
                          ? `Please fil the field ${errorMessage}`
                          : ''
                      }
                    />
                  );
                }
              })
          )}
        </>
      )}

      <Divider style={dividerStyle} />

      {/* Buttons */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        sx={formControlStackSx}
      >
        <Button onClick={handleUseModel} color="secondary" variant="contained">
          Use this model
        </Button>
        <Stack
          display={'flex'}
          direction="row"
          spacing={'16px'}
          justifyContent="flex-end"
          sx={buttonsStackSx}
        >
          <Button onClick={handleApply} color="primary" variant="contained">
            Apply
          </Button>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
        </Stack>
      </Stack>
    </>
  );
};

export default PredictionParametersModalTemplate;
