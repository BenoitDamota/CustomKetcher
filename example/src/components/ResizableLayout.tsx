import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import LeftPan from './LeftPan/LeftPan';
import RightPan from './RightPan/RightPan';
import { useAppContext } from '../context/AppContext';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';

export const MIN_WIDTH_LEFT_PAN = 550;
export const RESIZE_BAR_WIDTH = 6;
export const MIN_WIDTH_RIGHT_PAN = 380;
export const MINIMIZED_BAR_WIDTH = 30;
export const NAVBAR_HEIGHT = 57;
export const TABBAR_HEIGHT = 40;
export const MIN_HEIGHT_LEFT_UPPER_PAN = 300;
export const MIN_HEIGHT_LEFT_LOWER_PAN = 150;

const resizableLayoutDivStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  height: '100%',
  position: 'relative',
};

const separatorStyle: React.CSSProperties = {
  width: RESIZE_BAR_WIDTH,
  height: '100%',
  cursor: 'col-resize',
  background: '#525252',
  zIndex: 39,
};

const rightPanDivStyle: React.CSSProperties = { flexGrow: 1, height: '100%' };

const ResizableLayout: React.FC = () => {
  const { tabs, activeTab } = useAppContext();

  const tabIsWaiting =
    tabs.current.find((t) => t.id === activeTab.current)?.status ===
      'waiting' || false;

  const initialLeftWidth = window.innerWidth / 2;
  const [leftWidth, setLeftWidth] = useState<number>(initialLeftWidth);
  const initialLeftUpperHeight =
    (window.innerHeight - NAVBAR_HEIGHT - TABBAR_HEIGHT) * 0.7;
  const [leftUpperHeight, setLeftUpperHeight] = useState<number>(
    initialLeftUpperHeight,
  );

  const [isLeftUpperPanReduced, reduceLeftUpperPan] = useState(false);
  const [isLeftLowerPanReduced, reduceLeftLowerPan] = useState(false);
  const [isRightPanReduced, reduceRightPan] = useState(false);

  const isLeftPanReduced = isLeftUpperPanReduced && isLeftLowerPanReduced;

  const isResizingRef = useRef(false);

  const leftOrRightPanIsReduced = isLeftPanReduced || isRightPanReduced;

  const reduceLeftPan = (reduce: boolean) => {
    reduceLeftUpperPan(reduce);
    reduceLeftLowerPan(reduce);
  };

  const adjustPanel = useCallback(() => {
    const totalWidth = window.innerWidth;
    if (!isLeftPanReduced && !isRightPanReduced) {
      if (
        totalWidth >=
        MIN_WIDTH_LEFT_PAN +
          MIN_WIDTH_RIGHT_PAN +
          RESIZE_BAR_WIDTH +
          Number(isLeftUpperPanReduced || isLeftLowerPanReduced) *
            MINIMIZED_BAR_WIDTH
      ) {
        const desiredLeftWidth =
          MIN_WIDTH_LEFT_PAN +
          (totalWidth -
            (MIN_WIDTH_LEFT_PAN +
              MIN_WIDTH_RIGHT_PAN +
              RESIZE_BAR_WIDTH +
              Number(isLeftUpperPanReduced || isLeftLowerPanReduced) *
                MINIMIZED_BAR_WIDTH)) /
            2;

        reduceRightPan(false);
        setLeftWidth(desiredLeftWidth);
      } else {
        if (
          totalWidth >=
          MIN_WIDTH_LEFT_PAN +
            Number(isLeftUpperPanReduced || isLeftLowerPanReduced) *
              MINIMIZED_BAR_WIDTH +
            MINIMIZED_BAR_WIDTH
        ) {
          if (isLeftPanReduced) reduceLeftPan(false);
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
  }, [
    isLeftLowerPanReduced,
    isLeftPanReduced,
    isLeftUpperPanReduced,
    isRightPanReduced,
  ]);

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

  function minimizeLeftUpperPan() {
    setLeftUpperHeight(0);
    reduceLeftUpperPan(true);
  }

  function minimizeLeftLowerPan() {
    setLeftUpperHeight(window.innerHeight);
    reduceLeftLowerPan(true);
  }

  function minimizeRightPan() {
    setLeftWidth(window.innerWidth);
    reduceRightPan(true);
    if (isLeftPanReduced) reduceLeftPan(false);
    setLeftUpperHeight(initialLeftUpperHeight);
  }

  useEffect(() => {
    if (isLeftLowerPanReduced && isLeftUpperPanReduced && isRightPanReduced) {
      reduceRightPan(false);
    }
  }, [isLeftLowerPanReduced, isLeftUpperPanReduced, isRightPanReduced]);

  function expandPanel(target: 'LEFT' | 'RIGHT' | 'LEFT_UPPER' | 'LEFT_LOWER') {
    const totalWidth = window.innerWidth;
    const totalHeight = window.innerHeight;

    const availableHeight =
      totalHeight - RESIZE_BAR_WIDTH - MINIMIZED_BAR_WIDTH;

    const preferredLeftUpperHeight =
      (window.innerHeight - NAVBAR_HEIGHT - TABBAR_HEIGHT) * 0.7;

    switch (target) {
      case 'LEFT':
      case 'RIGHT': {
        const desiredLeftWidth =
          MIN_WIDTH_LEFT_PAN +
          (totalWidth -
            (RESIZE_BAR_WIDTH + MIN_WIDTH_LEFT_PAN + MIN_WIDTH_RIGHT_PAN)) /
            2;

        const enoughRoom =
          totalWidth >=
          MIN_WIDTH_LEFT_PAN + MIN_WIDTH_RIGHT_PAN + RESIZE_BAR_WIDTH;

        if (enoughRoom) {
          reduceRightPan(false);
          setLeftWidth(desiredLeftWidth);
        } else {
          if (target === 'LEFT') {
            reduceRightPan(true);
            reduceLeftUpperPan(false);
            reduceLeftLowerPan(false);
            setLeftWidth(totalWidth);
            setLeftUpperHeight(preferredLeftUpperHeight);
          } else {
            reduceLeftPan(true);
            reduceRightPan(false);
            setLeftWidth(0);
          }
        }
        break;
      }

      case 'LEFT_UPPER':
      case 'LEFT_LOWER': {
        const isOtherReduced =
          target === 'LEFT_UPPER'
            ? isLeftLowerPanReduced
            : isLeftUpperPanReduced;

        const enoughRoom =
          availableHeight >=
          MIN_HEIGHT_LEFT_UPPER_PAN +
            MIN_HEIGHT_LEFT_LOWER_PAN +
            RESIZE_BAR_WIDTH;

        if (enoughRoom || isOtherReduced) {
          if (target === 'LEFT_UPPER') {
            reduceLeftUpperPan(false);
            if (!isLeftLowerPanReduced) {
              setLeftUpperHeight(preferredLeftUpperHeight);
            }
          } else {
            reduceLeftLowerPan(false);
            if (!isLeftUpperPanReduced) {
              setLeftUpperHeight(preferredLeftUpperHeight);
            }
          }
        } else {
          if (target === 'LEFT_UPPER') {
            reduceLeftLowerPan(true);
            reduceLeftUpperPan(false);
          } else {
            reduceLeftUpperPan(true);
            reduceLeftLowerPan(false);
          }
        }
        break;
      }

      default:
        break;
    }
  }

  const handleMouseDown = () => {
    if (leftOrRightPanIsReduced) return;
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

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const leftPanDivStyle = useMemo<React.CSSProperties>(
    () => ({
      width: leftWidth,
      height: '100%',
      minWidth: '30px',
      position: 'relative',
    }),
    [leftWidth],
  );

  return (
    <div style={resizableLayoutDivStyle}>
      <div className="menu-clair" style={leftPanDivStyle}>
        <LeftPan
          leftUpperHeight={leftUpperHeight}
          setLeftUpperHeight={setLeftUpperHeight}
          isLeftPanReduced={isLeftPanReduced}
          isLeftUpperPanReduced={isLeftUpperPanReduced}
          isLeftLowerPanReduced={isLeftLowerPanReduced}
          minimizeLeftUpperPan={minimizeLeftUpperPan}
          minimizeLeftLowerPan={minimizeLeftLowerPan}
          expandPanel={expandPanel}
        />
      </div>

      {!leftOrRightPanIsReduced && (
        <span
          role="separator"
          aria-hidden="true"
          style={separatorStyle}
          onMouseDown={handleMouseDown}
        />
      )}

      <div className="menu-clair" style={rightPanDivStyle}>
        <RightPan
          isRightPanReduced={isRightPanReduced}
          minimizeRightPan={minimizeRightPan}
          expandPanel={expandPanel}
        />
      </div>

      {tabIsWaiting && (
        <Backdrop
          open
          sx={{
            position: 'absolute',
            zIndex: 40,
            color: '#fff',
            backdropFilter: 'blur(2px)',
          }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <CircularProgress />
            <Typography
              variant="h6"
              sx={{ mt: 2, textAlign: 'center' }}
              color="secondary"
            >
              This tab is waiting for the prediction result
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ mt: 3 }}
              color="text.secondary"
            >
              SMILES sent to prediction
              {tabs.current.find((t) => t.id === activeTab.current)?.metadata
                .nucleusType &&
              tabs.current.find((t) => t.id === activeTab.current)?.metadata
                .nucleusType !== 'Unknown' ? (
                <>
                  {' ('}
                  <span style={{ color: '#167782' }}>
                    {
                      tabs.current.find((t) => t.id === activeTab.current)
                        ?.metadata.nucleusType
                    }
                  </span>
                  {')'}
                </>
              ) : null}{' '}
              :
            </Typography>

            <Typography
              variant="body1"
              sx={{ mt: 1, wordBreak: 'break-word', fontFamily: 'monospace' }}
              color="primary"
            >
              {tabs.current.find((t) => t.id === activeTab.current)?.smiles ||
                ''}
            </Typography>
          </Box>
        </Backdrop>
      )}
    </div>
  );
};

export default ResizableLayout;
