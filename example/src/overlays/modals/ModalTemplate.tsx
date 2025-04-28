import React, { useRef } from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

interface ModalTemplateProps {
  children: React.ReactNode;
  onClose: () => void;
}

const ModalTemplate: React.FC<ModalTemplateProps> = ({ children, onClose }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const customOnClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onClose();
  };

  return (
    <Dialog open onClose={customOnClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <button
          onClick={customOnClose}
          className="material-symbols-outlined hover-red"
          style={{
            fontSize: '1.5rem',
            background: 'transparent',
            border: 'none',
            position: 'absolute',
            top: 8,
            right: 16,
            cursor: 'pointer',
          }}
        >
          close
        </button>
        {/* Titre dynamique ajouté ici */}
      </DialogTitle>
      <DialogContent>
        {React.cloneElement(children as React.ReactElement, {
          timeoutRef,
        })}
      </DialogContent>
    </Dialog>
  );
};

export default ModalTemplate;
