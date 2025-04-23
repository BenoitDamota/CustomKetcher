import {
  useApp,
  MIN_WIDTH_LEFT_PAN,
  MIN_WIDTH_RIGHT_PAN,
} from '../context/AppContext';
import { useRef, useState } from 'react';
import LeftPane from './LeftPan/LeftPan';
import RightPane from './RightPan/RightPan';

export default function ResizableLayout() {
  const { leftWidth, setLeftWidth, isLeftPanReduced, isRightPanReduced } =
    useApp();
  const isResizingRef = useRef(false);

  const aPanIsReduced = isLeftPanReduced || isRightPanReduced;

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
        <LeftPane isLeftPanReduced={isLeftPanReduced} />
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
        <RightPane isRightPanReduced={isRightPanReduced} />
      </div>
    </div>
  );
}
