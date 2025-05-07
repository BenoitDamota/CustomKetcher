import { Checkbox, FormControlLabel } from '@mui/material';
import React from 'react';
import { useAppContext } from '../../../context/AppContext';

const ConfirmPredictionInputBaPartial: React.FC = () => {
  const { generalSettings } = useAppContext();

  const [dontShowAgain, setDontShowAgain] = React.useState<boolean>(
    (!generalSettings
      .find((category) => category.settingsCategoryName === 'General')
      ?.settings.find((setting) => setting.key === 'confirmOnInputSMILES')
      ?.value as boolean) || false,
  );

  const handleChange = (checked: boolean) => {
    const confirmOnInputSMILES = generalSettings
      .find((category) => category.settingsCategoryName === 'General')
      ?.settings.find((setting) => setting.key === 'confirmOnInputSMILES');
    if (confirmOnInputSMILES) {
      confirmOnInputSMILES.value = !checked;
    }
    setDontShowAgain(checked);
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={dontShowAgain}
          onChange={(e) => handleChange(e.target.checked)}
        />
      }
      label="Do not show this confirmation again"
      sx={{ mt: 2 }}
    />
  );
};

export default ConfirmPredictionInputBaPartial;
