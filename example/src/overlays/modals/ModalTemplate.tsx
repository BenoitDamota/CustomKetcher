import React from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

interface ModalTemplateProps {
  children: React.ReactNode;
  onClose: () => void;
}

const ModalTemplate: React.FC<ModalTemplateProps> = ({ children, onClose }) => {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <button
          onClick={onClose}
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
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

export default ModalTemplate;
