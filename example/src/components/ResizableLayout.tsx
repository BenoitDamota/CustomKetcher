import { useEffect, useRef, useState } from 'react';
import LeftPane from './LeftPan/LeftPan';
import RightPan from './RightPan/RightPan';

export const MIN_WIDTH_LEFT_PAN = 550;
export const MIN_WIDTH_RIGHT_PAN = 315;

export default function ResizableLayout() {
  const initialLeftWidth = window.innerWidth / 2;
  const [leftWidth, setLeftWidth] = useState<number>(initialLeftWidth);

  const [isLeftPanReduced, reduceLeftPan] = useState(false);
  const [isRightPanReduced, reduceRightPan] = useState(false);

  const isResizingRef = useRef(false);

  const aPanIsReduced = isLeftPanReduced || isRightPanReduced;

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

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;

      // Si les deux panneaux sont affichés
      if (!isLeftPanReduced && !isRightPanReduced) {
        const newLeftWidth = newWidth / 2;

        // Vérifie si le leftPanel devient trop petit
        if (newLeftWidth < MIN_WIDTH_LEFT_PAN) {
          minimizeLeftPan();
        } else {
          setLeftWidth(newLeftWidth);
        }
      } else if (isRightPanReduced) {
        setLeftWidth(newWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLeftPanReduced, isRightPanReduced]);

  function expandPanel(target: 'LEFT' | 'RIGHT') {
    const totalWidth = window.innerWidth;
    const desiredLeftWidth = totalWidth / 2;

    if (
      desiredLeftWidth > MIN_WIDTH_LEFT_PAN &&
      desiredLeftWidth > MIN_WIDTH_RIGHT_PAN
    ) {
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
      newWidth < window.innerWidth - MIN_WIDTH_RIGHT_PAN
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
    <div style={{ display: 'flex', height: '100%' }}>
      <div className="menu-clair" style={{ width: leftWidth, minWidth: 30 }}>
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
            width: 6,
            cursor: 'col-resize',
            background: '#525252',
            zIndex: 10,
          }}
          onMouseDown={handleMouseDown}
        />
      )}

      <div className="menu-clair" style={{ flexGrow: 1 }}>
        <RightPan
          isRightPanReduced={isRightPanReduced}
          minimizeRightPan={minimizeRightPan}
          expandPanel={expandPanel}
        />
      </div>
    </div>
  );
}
