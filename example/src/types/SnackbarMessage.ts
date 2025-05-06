import { AlertColor, AlertPropsColorOverrides } from '@mui/material';
import { OverridableStringUnion } from '@mui/types';

export interface SnackbarMessage {
  severity:
    | OverridableStringUnion<AlertColor, AlertPropsColorOverrides>
    | undefined;
  message: string;
}
