import { useRef, useEffect } from 'react';
import MinimizeIcon from '../../assets/minimize.svg';
import { useAppContext } from '../../context/AppContext';

const MinimizeButton = () => {
  const appCtx = useAppContext();

  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    if (!document.getElementById('minimize-btn-style')) {
      const style = document.createElement('style');
      style.id = 'minimize-btn-style';
      document.head.appendChild(style);
    }
  }, []);

  return (
    <>
      <button
        className="minimize-btn"
        onClick={() => appCtx.minimizeRightPan()}
      >
        <MinimizeIcon />
      </button>
      <style>
        {`
        .minimize-btn {
          border-radius: 4px;
          padding: 2px;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #333;
          transition: fill 0.2s ease;
          margin-right: 11px;
        }

        .minimize-btn > svg {
          width: 24px;
          height: 24px;
        }

        .minimize-btn:hover {
          color: #167782;
        }
      `}
      </style>
    </>
  );
};

export default MinimizeButton;
