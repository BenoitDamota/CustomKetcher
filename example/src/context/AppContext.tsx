import { createContext, useContext, useEffect, useRef, useState } from 'react';

export const MIN_WIDTH_LEFT_PAN = 550;
export const MIN_WIDTH_RIGHT_PAN = 315;

type AppContextType = {
  ketcherRef: React.RefObject<unknown>;
  spectreRef: React.RefObject<unknown>;
  leftWidth: number;
  isLeftPanReduced: boolean;
  isRightPanReduced: boolean;
  setLeftWidth: (width: number) => void;
  minimizeLeftPan: () => void;
  minimizeRightPan: () => void;
  expandPanel: (target: 'LEFT' | 'RIGHT') => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const ketcherRef = useRef<unknown>(null);
  const spectreRef = useRef<unknown>(null);

  const initialLeftWidth = window.innerWidth / 2;
  const [leftWidth, setLeftWidth] = useState<number>(initialLeftWidth);

  const [isLeftPanReduced, reduceLeftPan] = useState(false);
  const [isRightPanReduced, reduceRightPan] = useState(false);

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

  return (
    <AppContext.Provider
      value={{
        ketcherRef,
        spectreRef,
        leftWidth,
        isLeftPanReduced,
        isRightPanReduced,
        setLeftWidth,
        minimizeLeftPan,
        minimizeRightPan,
        expandPanel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
};
