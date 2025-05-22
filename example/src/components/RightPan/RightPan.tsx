import { MINIMIZED_BAR_WIDTH } from '../ResizableLayout';
import Spectrum from './Spectrum';

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
  isRightPanReduced: boolean;
  minimizeRightPan: () => void;
  expandPanel: (target: 'LEFT' | 'RIGHT') => void;
}

const RightPan: React.FC<Props> = ({
  isRightPanReduced,
  minimizeRightPan,
  expandPanel,
}) => {
  const handleExpandRight = () => expandPanel('RIGHT');

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

  const spectrumDivStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: isRightPanReduced ? 'none' : 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={{ height: '100%' }}>
      {isRightPanReduced && (
        <button style={minimizedBarStyle} onClick={handleExpandRight}>
          <span className="material-symbols-outlined" style={iconStyleTop}>
            search_insights
          </span>
          <span className="material-symbols-outlined" style={iconStyleCenter}>
            chevron_left
          </span>
        </button>
      )}

      <div style={spectrumDivStyle}>
        <Spectrum minimizeRightPan={minimizeRightPan} />
      </div>
    </div>
  );
};

export default RightPan;
