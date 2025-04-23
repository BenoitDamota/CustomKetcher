import { useAppContext } from '../../context/AppContext';
import Spectrum from './Spectrum';

export default function RightPane(props: { isRightPanReduced: boolean }) {
  const appCtx = useAppContext();

  return (
    <div style={{ height: '100%' }}>
      {props.isRightPanReduced && (
        <button
          style={{
            all: 'unset',
            width: '30px',
            height: '100%',
            backgroundColor: '#525252',
            color: 'white',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={() => appCtx.expandPanel('RIGHT')}
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
          display: props.isRightPanReduced ? 'none' : 'flex',
          flexDirection: 'column',
        }}
      >
        <Spectrum />
      </div>
    </div>
  );
}
