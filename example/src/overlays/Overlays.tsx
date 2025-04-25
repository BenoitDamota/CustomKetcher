import DialogRenderer from './dialogs/DialogRenderer';
import ModalRenderer from './modals/ModalRenderer';

const Overlays: React.FC = () => {
  return (
    <>
      <DialogRenderer />
      <ModalRenderer />
    </>
  );
};

export default Overlays;
