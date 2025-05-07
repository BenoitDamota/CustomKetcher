import { Checkbox, FormControlLabel } from '@mui/material';
import React from 'react';
import { useAppContext } from '../../../context/AppContext';

interface Props {
  settingsCategory: string;
  settingsKey: string;
}

const DontShowAgainPartial: React.FC<Props> = ({
  settingsCategory,
  settingsKey,
}) => {
  const { generalSettings } = useAppContext();

  const [dontShowAgain, setDontShowAgain] = React.useState<boolean>(
    (!generalSettings
      .find((cat) => cat.settingsCategoryName === settingsCategory)
      ?.settings.find((setting) => setting.key === settingsKey)
      ?.value as boolean) || false,
  );

  const handleChange = (checked: boolean) => {
    const confirmOnInputSMILES = generalSettings
      .find((cat) => cat.settingsCategoryName === settingsCategory)
      ?.settings.find((setting) => setting.key === settingsKey);
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

export default DontShowAgainPartial;
