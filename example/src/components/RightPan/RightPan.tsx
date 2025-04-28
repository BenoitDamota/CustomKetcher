import { MINIMIZED_BAR_WIDTH } from '../ResizableLayout';
import Spectrum from './Spectrum';

interface Props {
  isRightPanReduced: boolean;
  minimizeRightPan: () => void;
  expandPanel: (target: 'LEFT' | 'RIGHT') => void;
}

const RightPan: React.FC<Props> = ({
  isRightPanReduced,
  minimizeRightPan,
  expandPanel,
}) => {
  return (
    <div style={{ height: '100%' }}>
      {isRightPanReduced && (
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
          onClick={() => expandPanel('RIGHT')}
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
            search_insights
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
            chevron_left
          </span>
        </button>
      )}

      <div
        style={{
          width: '100%',
          height: '100%',
          display: isRightPanReduced ? 'none' : 'flex',
          flexDirection: 'column',
        }}
      >
        <Spectrum minimizeRightPan={minimizeRightPan} />
      </div>
    </div>
  );
};

export default RightPan;
