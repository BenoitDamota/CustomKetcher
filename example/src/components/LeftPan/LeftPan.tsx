import KetcherEditor from './KetcherEditor';
import { LeftPanController } from '../../types/LeftPanController';
import { MINIMIZED_BAR_WIDTH } from '../ResizableLayout';

const iconStyleTop: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
};

const iconStyleCenter: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};

interface Props {
  isLeftPanReduced: boolean;
  minimizeLeftPan: () => void;
  expandPanel: (target: 'LEFT' | 'RIGHT') => void;
}

const LeftPan: React.FC<Props> = ({
  isLeftPanReduced,
  minimizeLeftPan,
  expandPanel,
}) => {
  const leftPanController: LeftPanController = {
    minimizeLeftPan,
  };

  const minimizedBarStyle: React.CSSProperties = {
    all: 'unset',
    display: 'block',
    width: `${MINIMIZED_BAR_WIDTH}px`,
    height: '100%',
    backgroundColor: '#525252',
    color: 'white',
    position: 'relative',
    cursor: 'pointer',
  };

  const ketcherDivStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: isLeftPanReduced ? 'none' : 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ height: '100%' }}>
      {isLeftPanReduced && (
        <button style={minimizedBarStyle} onClick={() => expandPanel('LEFT')}>
          <span className="material-symbols-outlined" style={iconStyleTop}>
            edit
          </span>
          <span className="material-symbols-outlined" style={iconStyleCenter}>
            chevron_right
          </span>
        </button>
      )}

      <div style={ketcherDivStyle}>
        <KetcherEditor leftPanController={leftPanController} />
      </div>
    </div>
  );
};

export default LeftPan;
