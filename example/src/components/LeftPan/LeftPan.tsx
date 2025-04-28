import KetcherEditor from './KetcherEditor';
import { LeftPanController } from '../../types/LeftPanController';
import { MINIMIZED_BAR_WIDTH } from '../ResizableLayout';

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

  return (
    <div style={{ height: '100%' }}>
      {isLeftPanReduced && (
        <button
          style={{
            all: 'unset',
            width: `${MINIMIZED_BAR_WIDTH}px`,
            height: '100%',
            backgroundColor: '#525252',
            color: 'white',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={() => expandPanel('LEFT')}
        >
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            edit
          </span>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            chevron_right
          </span>
        </button>
      )}

      <div
        style={{
          width: '100%',
          height: '100%',
          display: isLeftPanReduced ? 'none' : 'flex',
          flexDirection: 'column',
        }}
      >
        <KetcherEditor leftPanController={leftPanController} />
      </div>
    </div>
  );
};

export default LeftPan;
