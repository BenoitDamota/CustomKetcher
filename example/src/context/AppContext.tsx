import { createContext, useContext, useEffect, useRef, useState } from 'react';

type AppContextType = {
  ketcherRef: React.RefObject<unknown>;
  spectreRef: React.RefObject<unknown>;
  leftWidth: number;
  isLeftPanReduced: boolean;
  isRightPanReduced: boolean;
  setLeftWidth: (width: number) => void;
  resetLeftWidth: () => void;
  minimizeLeftPan: () => void;
  minimizeRightPan: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const ketcherRef = useRef<unknown>(null);
  const spectreRef = useRef<unknown>(null);

  const initialLeftWidth = window.innerWidth / 2;
  const [leftWidth, setLeftWidth] = useState<number>(initialLeftWidth);

  const [isLeftPanReduced, reduceLeftPan] = useState(false);
  const [isRightPanReduced, reduceRightPan] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (!isLeftPanReduced && !isRightPanReduced) {
        setLeftWidth(window.innerWidth / 2);
      } else if (isRightPanReduced) {
        setLeftWidth(window.innerWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLeftPanReduced, isRightPanReduced]);

  function resetLeftWidth() {
    setLeftWidth(initialLeftWidth);
    reduceLeftPan(false);
    reduceRightPan(false);
  }

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

  return (
    <AppContext.Provider
      value={{
        ketcherRef,
        spectreRef,
        leftWidth,
        isLeftPanReduced,
        isRightPanReduced,
        setLeftWidth,
        resetLeftWidth,
        minimizeLeftPan,
        minimizeRightPan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
