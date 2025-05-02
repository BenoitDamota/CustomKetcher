import React from 'react';
import {
  DialogContent,
  DialogContentText,
  Typography,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useAppContext } from '../../../context/AppContext';

interface Props {
  onClose: () => void;
}

const ConfirmPredictionInputBarModalTemplate: React.FC<Props> = ({
  onClose,
}) => {
  const { generalSettings } = useAppContext();

  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  const onConfirm = () => {
    // Change the settings in the context
    const confirmOnInputSMILES = generalSettings
      .find((category) => category.settingsCategoryName === 'General')
      ?.settings.find((setting) => setting.key === 'confirmOnInputSMILES');
    if (confirmOnInputSMILES) {
      confirmOnInputSMILES.value = false;
    }
    // TODO : Logic to save the settings on computer

    onClose();
  };

  return (
    <DialogContent>
      <Typography variant="h6" gutterBottom>
        Confirm Prediction
      </Typography>
      <DialogContentText>
        The input bar contains a SMILES.
        <br />
        Are you sure you want to start the prediction based on this molecule?
      </DialogContentText>

      <FormControlLabel
        control={
          <Checkbox
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
        }
        label="Do not show this confirmation again"
        sx={{ mt: 2 }}
      />

      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ mt: 3 }}
      >
        <Button onClick={() => onClose()} color="secondary">
          Cancel
        </Button>
        <Button onClick={() => onConfirm()} color="primary" variant="contained">
          Confirm
        </Button>
      </Stack>
    </DialogContent>
  );
};

export default ConfirmPredictionInputBarModalTemplate;
