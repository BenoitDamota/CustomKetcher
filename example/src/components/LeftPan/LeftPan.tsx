import KetcherEditor from './KetcherEditor';
import { LeftPanController } from '../../types/LeftPanController';
import { useAppContext } from '../../context/AppContext';

export default function LeftPane(props: { isLeftPanReduced: boolean }) {
  const appCtx = useAppContext();

  const leftPanController: LeftPanController = {
    minimizeLeftPan: appCtx.minimizeLeftPan,
  };

  return (
    <div style={{ height: '100%' }}>
      {props.isLeftPanReduced && (
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
          onClick={() => appCtx.expandPanel('LEFT')}
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
          display: props.isLeftPanReduced ? 'none' : 'flex',
          flexDirection: 'column',
        }}
      >
        <KetcherEditor leftPanController={leftPanController} />
      </div>
    </div>
  );
}
