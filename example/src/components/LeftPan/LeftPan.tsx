import KetcherEditor from './KetcherEditor';
import { LeftPanController } from '../../LeftPanController';
import { useApp } from '../../context/AppContext';

export default function LeftPane(props: { isLeftPanReduced: boolean }) {
  const appCtx = useApp();

  const leftPanController: LeftPanController = {
    minimizeLeftPan: appCtx.minimizeLeftPan,
  };

  return (
    <div style={{ height: '100%' }}>
      {props.isLeftPanReduced ? (
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
      ) : (
        <KetcherEditor leftPanController={leftPanController} />
      )}
    </div>
  );
}
