import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useAppContext } from '../../context/AppContext';

const closeButtonStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  background: 'transparent',
  border: 'none',
  position: 'absolute',
  top: 8,
  right: 16,
  cursor: 'pointer',
};

interface ModalTemplateProps {
  children: React.ReactNode;
  onClose: () => void;
}

const ModalTemplate: React.FC<ModalTemplateProps> = ({ children, onClose }) => {
  const { activeModal } = useAppContext();

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth={activeModal === 'ManagePredictionModels' ? 'md' : 'sm'}
    >
      <DialogTitle>
        <button
          onClick={onClose}
          className="material-symbols-outlined hover-red"
          style={closeButtonStyle}
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
