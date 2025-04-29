import { useCallback, useEffect, useRef, useState } from 'react';
import LeftPane from './LeftPan/LeftPan';
import RightPan from './RightPan/RightPan';

export const MIN_WIDTH_LEFT_PAN = 550;
export const RESIZE_BAR_WIDTH = 6;
export const MIN_WIDTH_RIGHT_PAN = 350;
export const MINIMIZED_BAR_WIDTH = 30;

export default function ResizableLayout() {
  const initialLeftWidth = window.innerWidth / 2;
  const [leftWidth, setLeftWidth] = useState<number>(initialLeftWidth);

  const [isLeftPanReduced, reduceLeftPan] = useState(false);
  const [isRightPanReduced, reduceRightPan] = useState(false);

  const isResizingRef = useRef(false);

  const aPanIsReduced = isLeftPanReduced || isRightPanReduced;

  const adjustPanel = useCallback(() => {
    const totalWidth = window.innerWidth;
    if (!isLeftPanReduced && !isRightPanReduced) {
      if (
        totalWidth >=
        MIN_WIDTH_LEFT_PAN + MIN_WIDTH_RIGHT_PAN + RESIZE_BAR_WIDTH
      ) {
        const desiredLeftWidth =
          MIN_WIDTH_LEFT_PAN +
          (totalWidth -
            (RESIZE_BAR_WIDTH + MIN_WIDTH_LEFT_PAN + MIN_WIDTH_RIGHT_PAN)) /
            2;

        reduceLeftPan(false);
        reduceRightPan(false);
        setLeftWidth(desiredLeftWidth);
      } else {
        if (totalWidth >= MIN_WIDTH_LEFT_PAN + MINIMIZED_BAR_WIDTH) {
          reduceLeftPan(false);
          reduceRightPan(true);
          setLeftWidth(totalWidth);
        } else {
          reduceRightPan(false);
          reduceLeftPan(true);
          setLeftWidth(MINIMIZED_BAR_WIDTH);
        }
      }
    } else {
      if (isLeftPanReduced) {
        setLeftWidth(0);
      } else {
        setLeftWidth(totalWidth - MINIMIZED_BAR_WIDTH);
      }
    }
  }, [isLeftPanReduced, isRightPanReduced]);

  useEffect(() => {
    adjustPanel();
  }, [adjustPanel]);

  useEffect(() => {
    const handleResize = () => {
      adjustPanel();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustPanel]);

  function minimizeLeftPan() {
    setLeftWidth(0);
    reduceLeftPan(true);
    reduceRightPan(false);
  }

  function minimizeRightPan() {
    setLeftWidth(window.innerWidth);
    reduceRightPan(true);
    reduceLeftPan(false);
  }

  function expandPanel(target: 'LEFT' | 'RIGHT') {
    const totalWidth = window.innerWidth;

    if (
      totalWidth >=
      MIN_WIDTH_LEFT_PAN + MIN_WIDTH_RIGHT_PAN + RESIZE_BAR_WIDTH
    ) {
      const desiredLeftWidth =
        MIN_WIDTH_LEFT_PAN +
        (totalWidth -
          (RESIZE_BAR_WIDTH + MIN_WIDTH_LEFT_PAN + MIN_WIDTH_RIGHT_PAN)) /
          2;

      reduceLeftPan(false);
      reduceRightPan(false);
      setLeftWidth(desiredLeftWidth);
    } else {
      if (target === 'LEFT') {
        reduceLeftPan(false);
        reduceRightPan(true);
        setLeftWidth(totalWidth);
      } else {
        reduceRightPan(false);
        reduceLeftPan(true);
        setLeftWidth(0);
      }
    }
  }

  const handleMouseDown = () => {
    if (aPanIsReduced) return;
    isResizingRef.current = true;
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newWidth = e.clientX;
    if (
      newWidth > MIN_WIDTH_LEFT_PAN &&
      newWidth < window.innerWidth - RESIZE_BAR_WIDTH - MIN_WIDTH_RIGHT_PAN
    ) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.body.style.userSelect = '';
  };

  useState(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        className="menu-clair"
        style={{ width: leftWidth, height: '100%', minWidth: '30px' }}
      >
        <LeftPane
          isLeftPanReduced={isLeftPanReduced}
          minimizeLeftPan={minimizeLeftPan}
          expandPanel={expandPanel}
        />
      </div>

      {!aPanIsReduced && (
        <span
          role="separator"
          aria-hidden="true"
          style={{
            width: RESIZE_BAR_WIDTH,
            height: '100%',
            cursor: 'col-resize',
            background: '#525252',
            zIndex: 39,
          }}
          onMouseDown={handleMouseDown}
        />
      )}

      <div className="menu-clair" style={{ flexGrow: 1, height: '100%' }}>
        <RightPan
          isRightPanReduced={isRightPanReduced}
          minimizeRightPan={minimizeRightPan}
          expandPanel={expandPanel}
        />
      </div>
    </div>
  );
}
