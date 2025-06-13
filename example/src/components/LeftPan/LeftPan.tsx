import React, { useEffect, useRef } from 'react';
import {
  MIN_HEIGHT_LEFT_LOWER_PAN,
  MIN_HEIGHT_LEFT_UPPER_PAN,
  MINIMIZED_BAR_WIDTH,
  NAVBAR_HEIGHT,
  RESIZE_BAR_WIDTH,
  TABBAR_HEIGHT,
} from '../ResizableLayout';
import LeftLowerPan from './LeftLowerPan/LeftLowerPan';
import LeftUpperPan from './LeftUpperPan/LeftUpperPan';

const leftPanDivStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '100%',
  position: 'relative',
};

const minimizedButtonsParentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '30px',
  maxWidth: '30px',
};

const iconStyleTop: React.CSSProperties = {
  position: 'absolute',
  top: '6px',
  left: '50%',
  transform: 'translateX(-50%)',
};

const iconStyleBottom: React.CSSProperties = {
  position: 'absolute',
  bottom: '6px',
  left: '50%',
  transform: 'translateX(-50%)',
};

const iconStyleCenter: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};

const minimizedButtonSeparatorStyle: React.CSSProperties = {
  height: '6px',
  backgroundColor: 'grey',
};

const panelsParentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
};

const panelSeparatorStyle: React.CSSProperties = {
  height: '6px',
  width: '100%',
  cursor: 'row-resize',
  background: '#525252',
  zIndex: 39,
};

interface Props {
  leftUpperHeight: number;
  setLeftUpperHeight: React.Dispatch<React.SetStateAction<number>>;
  isLeftPanReduced: boolean;
  isLeftUpperPanReduced: boolean;
  isLeftLowerPanReduced: boolean;
  minimizeLeftUpperPan: () => void;
  minimizeLeftLowerPan: () => void;
  expandPanel: (target: 'LEFT' | 'RIGHT' | 'LEFT_UPPER' | 'LEFT_LOWER') => void;
}

const LeftPan: React.FC<Props> = ({
  leftUpperHeight,
  setLeftUpperHeight,
  isLeftPanReduced,
  isLeftUpperPanReduced,
  isLeftLowerPanReduced,
  minimizeLeftUpperPan,
  minimizeLeftLowerPan,
  expandPanel,
}) => {
  const minimizedBarStyle: React.CSSProperties = {
    all: 'unset',
    display: 'block',
    width: `${MINIMIZED_BAR_WIDTH}px`,
    backgroundColor: '#525252',
    color: 'white',
    position: 'relative',
    cursor: 'pointer',
  };

  const isResizingRef = useRef(false);

  const aPanIsReduced = isLeftUpperPanReduced || isLeftLowerPanReduced;

  const handleMouseDown = () => {
    if (aPanIsReduced) return;
    isResizingRef.current = true;
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newHeight = e.clientY;
    if (
      newHeight > MIN_HEIGHT_LEFT_UPPER_PAN &&
      newHeight <
        window.innerHeight -
          NAVBAR_HEIGHT -
          TABBAR_HEIGHT -
          MIN_HEIGHT_LEFT_LOWER_PAN
    ) {
      console.log({ newHeight });
      console.log({
        lowerH: window.innerHeight - RESIZE_BAR_WIDTH - newHeight,
      });
      console.log('---');
      setLeftUpperHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={leftPanDivStyle}>
      {aPanIsReduced && (
        <div style={minimizedButtonsParentStyle}>
          {isLeftUpperPanReduced && (
            <button
              className="hover-brightness-115 hover-primary"
              style={{
                ...minimizedBarStyle,
                height: isLeftPanReduced ? '50%' : '100%',
              }}
              onClick={() => {
                expandPanel('LEFT_UPPER');
              }}
            >
              <span className="material-symbols-outlined" style={iconStyleTop}>
                edit
              </span>
              <span
                className="material-symbols-outlined"
                style={iconStyleCenter}
              >
                chevron_right
              </span>
            </button>
          )}
          {isLeftPanReduced && (
            <div style={minimizedButtonSeparatorStyle}></div>
          )}
          {isLeftLowerPanReduced && (
            <button
              className="hover-brightness-115 hover-primary"
              style={{
                ...minimizedBarStyle,
                ...(isLeftPanReduced ? { flexGrow: 1 } : { height: '100%' }),
              }}
              onClick={() => expandPanel('LEFT_LOWER')}
            >
              <span
                className="material-symbols-outlined"
                style={iconStyleCenter}
              >
                chevron_right
              </span>
              <span
                className="material-symbols-outlined"
                style={iconStyleBottom}
              >
                table
              </span>
            </button>
          )}
        </div>
      )}
      <div style={panelsParentStyle}>
        <LeftUpperPan
          leftUpperHeight={leftUpperHeight}
          isLeftUpperPanReduced={isLeftUpperPanReduced}
          minimizeLeftUpperPan={minimizeLeftUpperPan}
        />
        {!aPanIsReduced && (
          <span
            role="separator"
            aria-hidden="true"
            style={panelSeparatorStyle}
            onMouseDown={handleMouseDown}
          />
        )}
        <LeftLowerPan
          isLeftLowerPanReduced={isLeftLowerPanReduced}
          minimizeLeftLowerPan={minimizeLeftLowerPan}
          leftUpperHeight={leftUpperHeight}
        />
      </div>
    </div>
  );
};

export default LeftPan;
