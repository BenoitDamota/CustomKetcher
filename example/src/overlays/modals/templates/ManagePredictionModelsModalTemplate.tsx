import React, { useEffect, useState } from 'react';
import {
  Typography,
  TextField,
  IconButton,
  Stack,
  Divider,
  Button,
  DialogContentText,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useAppContext } from '../../../context/AppContext';
import { saveModelParameters } from '../../../utils/SettingsUtils';
import { ModelParametersType } from '../../../types/ModelParametersType';

const ManagePredictionModelsModal: React.FC = () => {
  const {
    predictionParameters,
    setPredictionParameters,
    setSnackbarMessages,
    activeModal,
    openModal,
  } = useAppContext();

  const [models, setModels] = useState<ModelParametersType[]>(
    structuredClone(predictionParameters.models),
  );
  const [newModel, setNewModel] = useState({ modelName: '', endpoint: '' });

  useEffect(() => {
    if (activeModal === 'ManagePredictionModels') {
      setModels(structuredClone(predictionParameters.models));
      setNewModel({ modelName: '', endpoint: '' });
    }
  }, [activeModal, predictionParameters.models]);

  const handleAddModel = () => {
    if (!newModel.modelName || !newModel.endpoint) {
      setSnackbarMessages({
        severity: 'warning',
        message:
          'Both model name and endpoint are required to add a new model.',
      });
      return;
    }

    const exists = models.some((m) => m.modelName === newModel.modelName);
    if (exists) {
      setSnackbarMessages({
        severity: 'warning',
        message: 'A model with this name already exists.',
      });
      return;
    }

    setModels([
      ...models,
      {
        modelName: newModel.modelName,
        endpoint: newModel.endpoint,
        parameters: [],
      },
    ]);
    setNewModel({ modelName: '', endpoint: '' });
  };

  const handleRemoveModel = (index: number) => {
    setModels(
      models.filter((_: ModelParametersType, i: number) => i !== index),
    );
  };

  const handleSave = async () => {
    // Check if the parameters are valid
    for (const model of models) {
      for (const param of model.parameters) {
        // Check for default value validity
        if (param.default !== undefined && param.default !== '') {
          if (param.type === 'number' && isNaN(Number(param.default))) {
            setSnackbarMessages({
              severity: 'error',
              message: `Default value for "${param.key}" must be a number.`,
            });
            return;
          }

          if (
            param.type === 'boolean' &&
            param.default !== 'true' &&
            param.default !== 'false'
          ) {
            setSnackbarMessages({
              severity: 'error',
              message: `Default value for "${param.key}" must be "true" or "false".`,
            });
            return;
          }
        }
      }

      // Check if there are duplicate keys within the model
      const keys = model.parameters.map((param) => param.key);
      const duplicateKeys = keys.filter(
        (key, index) => keys.indexOf(key) !== index,
      );
      if (duplicateKeys.length > 0) {
        setSnackbarMessages({
          severity: 'error',
          message: `Model "${
            model.modelName
          }" has duplicate parameter keys: ${duplicateKeys.join(', ')}`,
        });
        return;
      }
    }

    // Clean models parameters: remove 'default' if it is undefined or empty
    const cleanedModels = models.map((model) => ({
      ...model,
      parameters: model.parameters.map((param) => {
        if (param.default === undefined || param.default === '') {
          const { default: _, ...rest } = param;
          return rest;
        }
        return param;
      }),
    }));

    const updatedParams = {
      ...predictionParameters,
      models: cleanedModels,
    };
    setPredictionParameters(updatedParams);

    const ok = await saveModelParameters(updatedParams);
    if (ok) {
      setSnackbarMessages({
        severity: 'success',
        message: 'Model list updated successfully.',
      });
      openModal('PredictionParameters');
    } else {
      setSnackbarMessages({
        severity: 'error',
        message: 'Failed to update models.',
      });
    }
  };

  return (
    <Stack spacing={2}>
      <DialogContentText
        style={{
          marginBottom: '8px',
        }}
      >
        <strong>Manage Prediction Model</strong>
      </DialogContentText>

      {models.map((model, index) => (
        <Accordion key={index}>
          <AccordionSummary
            expandIcon={
              <span
                style={{
                  marginLeft: '16px',
                }}
                className="material-symbols-outlined"
              >
                arrow_drop_down
              </span>
            }
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton
                onClick={() => handleRemoveModel(index)}
                color="error"
                sx={{
                  marginRight: '16px',
                }}
              >
                <span className="material-symbols-outlined">delete</span>
              </IconButton>
              <TextField
                label="Model Name"
                value={model.modelName || ''}
                onChange={(e) => {
                  const updated = [...models];
                  updated[index].modelName = e.target.value;
                  setModels(updated);
                }}
                fullWidth
              />
              <TextField
                label="Endpoint"
                value={model.endpoint || ''}
                onChange={(e) => {
                  const updated = [...models];
                  updated[index].endpoint = e.target.value;
                  setModels(updated);
                }}
                fullWidth
              />
            </Stack>
          </AccordionSummary>

          <AccordionDetails>
            {/* Parameters CRUD */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Parameters
            </Typography>
            {model.parameters.map((param, paramIndex) => (
              <Stack
                key={paramIndex}
                spacing={1}
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: '#f9f9f9',
                }}
              >
                {/* First Row */}
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Key"
                    value={param.key || ''}
                    onChange={(e) => {
                      const updated = [...models];
                      updated[index].parameters[paramIndex].key =
                        e.target.value;
                      setModels(updated);
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Label"
                    value={param.label || ''}
                    onChange={(e) => {
                      const updated = [...models];
                      updated[index].parameters[paramIndex].label =
                        e.target.value;
                      setModels(updated);
                    }}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={param.type || ''}
                      label="Type"
                      onChange={(e) => {
                        const value = e.target.value as
                          | 'text'
                          | 'number'
                          | 'boolean';
                        const updated = [...models];
                        updated[index].parameters[paramIndex].type = value;
                        setModels(updated);
                      }}
                    >
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="boolean">Boolean</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                {/* Second Row */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="Default Value"
                    value={param.default || ''}
                    onChange={(e) => {
                      const updated = [...models];
                      updated[index].parameters[paramIndex].default =
                        e.target.value;
                      setModels(updated);
                    }}
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={param.required || false}
                        onChange={(e) => {
                          const updated = [...models];
                          updated[index].parameters[paramIndex].required =
                            e.target.checked;
                          setModels(updated);
                        }}
                        color="primary"
                      />
                    }
                    label="Required"
                    sx={{ width: '200px' }}
                  />
                  <IconButton
                    onClick={() => {
                      const updated = [...models];
                      updated[index].parameters.splice(paramIndex, 1);
                      setModels(updated);
                    }}
                    color="error"
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </IconButton>
                </Stack>
              </Stack>
            ))}

            <Button
              onClick={() => {
                const updated = [...models];
                updated[index].parameters.push({
                  key: '',
                  label: '',
                  type: 'text',
                  required: false,
                });
                setModels(updated);
              }}
              variant="outlined"
              size="small"
              sx={{
                mt: 2,
                width: '100%',
              }}
            >
              Add Parameters
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider />

      {/* Add New Model */}
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="New Model Name"
          value={newModel.modelName}
          onChange={(e) =>
            setNewModel({ ...newModel, modelName: e.target.value })
          }
          fullWidth
        />
        <TextField
          label="New Model Endpoint"
          value={newModel.endpoint}
          onChange={(e) =>
            setNewModel({ ...newModel, endpoint: e.target.value })
          }
          fullWidth
        />
        <IconButton onClick={handleAddModel} color="primary">
          <span className="material-symbols-outlined">add</span>
        </IconButton>
      </Stack>

      {/* Action buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
        <Button
          onClick={() => openModal('PredictionParameters')}
          color="secondary"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save Changes
        </Button>
      </Stack>
    </Stack>
  );
};

export default ManagePredictionModelsModal;
