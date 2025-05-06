import { Snackbar, Alert } from '@mui/material';
import DialogRenderer from './dialogs/DialogRenderer';
import ModalRenderer from './modals/ModalRenderer';
import { useAppContext } from '../context/AppContext';

const Overlays: React.FC = () => {
  const { snackbarMessages, setSnackbarMessages } = useAppContext();

  return (
    <>
      <DialogRenderer />
      <ModalRenderer />
      {/* Error Snackbar */}
      {snackbarMessages.message && (
        <Snackbar
          open={!!snackbarMessages.message}
          autoHideDuration={3500}
          onClose={() =>
            setSnackbarMessages({
              severity: undefined,
              message: '',
            })
          }
        >
          <Alert
            onClose={() =>
              setSnackbarMessages({
                severity: undefined,
                message: '',
              })
            }
            severity={snackbarMessages.severity}
          >
            {snackbarMessages.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default Overlays;
