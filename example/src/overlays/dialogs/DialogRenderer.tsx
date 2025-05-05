import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import CustomAlertDialog from './CustomAlertDialog';
import CustomConfirmDialog from './CustomConfirmDialog';

const DialogRenderer: React.FC = () => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertData, setAlertData] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    content: string;
    onConfirm: () => void;
  } | null>(null);

  const { openAlert, openConfirm } = useAppContext();

  // Functions to control the dialog opening and closing
  const openAlertDialog = (title: string, content: string) => {
    setAlertData({ title, content });
    setAlertOpen(true);
  };

  const openConfirmDialog = (
    title: string,
    content: string,
    onConfirm: () => void,
  ) => {
    setConfirmData({ title, content, onConfirm });
    setConfirmOpen(true);
  };

  const closeAlertDialog = () => {
    setAlertOpen(false);
    setAlertData(null);
  };

  const closeConfirmDialog = (confirmed: boolean) => {
    setConfirmOpen(false);
    if (confirmed && confirmData?.onConfirm) {
      confirmData.onConfirm();
    }
    setConfirmData(null);
  };

  // Set the functions for openAlert and openConfirm in the context on mount
  useEffect(() => {
    openAlert.current = openAlertDialog;
    openConfirm.current = openConfirmDialog;
  }, [openAlert, openConfirm]);

  return (
    <>
      <CustomAlertDialog
        open={alertOpen}
        title={alertData?.title || ''}
        content={alertData?.content || ''}
        onClose={closeAlertDialog}
      />

      <CustomConfirmDialog
        open={confirmOpen}
        title={confirmData?.title || ''}
        content={confirmData?.content || ''}
        onClose={closeConfirmDialog}
      />
    </>
  );
};

export default DialogRenderer;
