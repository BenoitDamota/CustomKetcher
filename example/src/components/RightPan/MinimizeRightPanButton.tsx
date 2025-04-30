import { useRef, useEffect } from 'react';

interface Props {
  minimizeRightPan: () => void;
}

const minimizeIcon = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 28"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Minimize</title>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="
    M3 3
    h18
    a2 2 0 0 1 2 2
    v18
    a2 2 0 0 1-2 2
    H3
    a2 2 0 0 1-2-2
    V5
    a2 2 0 0 1 2-2
    z

    M7 13
    h10
    v2
    H7
    z
  "
    />
  </svg>
);

const MinimizeButton: React.FC<Props> = ({ minimizeRightPan }) => {
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
      <button className="minimize-btn" onClick={() => minimizeRightPan()}>
        {minimizeIcon}
      </button>
      <style>
        {`
        .minimize-btn {
          border-radius: 4px;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #333;
          transition: fill 0.2s ease;
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
