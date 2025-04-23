import { useApp } from '../../context/AppContext';

export default function RightPane(props: { isRightPanReduced: boolean }) {
  const appCtx = useApp();

  return (
    <div style={{ height: '100%' }}>
      {props.isRightPanReduced ? (
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
      ) : (
        <div>
          <p>Right Pan</p>
          <button onClick={() => appCtx.minimizeRightPan()}>
            Reduce Right Pan
          </button>
        </div>
      )}
    </div>
  );
}
