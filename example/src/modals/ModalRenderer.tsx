import React from 'react';
import { useAppContext } from '../context/AppContext';
import ModalTemplate from './ModalTemplate';
import GeneralSettingsModalTemplate from './templates/GeneralSettingsModalTemplate';
import AboutModalTemplate from './templates/AboutModalTemplate';
import PredictionSettingsTemplate from './templates/PredictionSettingsModalTemplate';

const ModalRenderer: React.FC = () => {
  const { activeModal, closeModal } = useAppContext();

  const renderModalContent = () => {
    switch (activeModal) {
      case 'PredictionSettings':
        return <PredictionSettingsTemplate onClose={closeModal} />;
      case 'GeneralSettings':
        return <GeneralSettingsModalTemplate onClose={closeModal} />;
      case 'About':
        return <AboutModalTemplate onClose={closeModal} />;
      default:
        return null;
    }
  };

  if (!activeModal) return null;

  return (
    <ModalTemplate onClose={closeModal}>{renderModalContent()}</ModalTemplate>
  );
};

export default ModalRenderer;
