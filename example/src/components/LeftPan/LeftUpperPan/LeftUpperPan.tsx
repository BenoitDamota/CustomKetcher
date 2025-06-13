import KetcherEditor from './KetcherEditor';
import { LeftPanController } from '../../../types/LeftPanController';

interface Props {
  leftUpperHeight: number;
  isLeftUpperPanReduced: boolean;
  minimizeLeftUpperPan: () => void;
}

const LeftUpperPan: React.FC<Props> = ({
  leftUpperHeight,
  isLeftUpperPanReduced,
  minimizeLeftUpperPan,
}) => {
  const leftPanController: LeftPanController = {
    minimizeLeftPan: minimizeLeftUpperPan,
  };

  const ketcherDivStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: isLeftUpperPanReduced ? 'none' : 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ height: '100%', maxHeight: `${leftUpperHeight}px` }}>
      <div style={ketcherDivStyle}>
        <KetcherEditor leftPanController={leftPanController} />
      </div>
    </div>
  );
};

export default LeftUpperPan;
