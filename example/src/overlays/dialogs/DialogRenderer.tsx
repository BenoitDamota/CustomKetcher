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
    htmlContent?: React.ReactNode;
    resolve: (value: boolean) => void;
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
    htmlContent?: React.ReactNode,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmData({ title, content, htmlContent, resolve });
      setConfirmOpen(true);
    });
  };

  const closeAlertDialog = () => {
    setAlertOpen(false);
    setAlertData(null);
  };

  const closeConfirmDialog = (confirmed: boolean) => {
    setConfirmOpen(false);
    confirmData?.resolve(confirmed);
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
        htmlContent={confirmData?.htmlContent}
      />
    </>
  );
};

export default DialogRenderer;
