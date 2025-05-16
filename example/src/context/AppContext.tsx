import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { GeneralSettings } from '../types/GeneralSettingsType';
import { ModelParameters } from '../types/ModelParametersType';
import { SnackbarMessage } from '../types/SnackbarMessage';
import { TabDataType } from '../types/TabDataType';
import { AppContextType, ModalName } from '../types/AppContextType';
import {
  loadGeneralSettings,
  loadModelParameters,
} from '../utils/SettingsUtils';
import { getKekuleSmilesFromKetcher } from '../utils/MoleculesUtils';
import { Mutex } from '../utils/mutex';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const ketcherRef = useRef<unknown>(null);
  const plotlyRef = useRef<Plotly.PlotlyHTMLElement | null>(null);

  const [snackbarMessages, setSnackbarMessages] = useState<SnackbarMessage>({
    severity: undefined,
    message: '',
  });

  const openAlert = useRef<(title: string, content: string) => void>(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  });
  const openConfirm = useRef<
    (
      title: string,
      content: string,
      htmlContent?: React.ReactNode,
    ) => Promise<boolean>
  >(() => Promise.resolve(true));

  const tabs = useRef<TabDataType[]>([
    {
      id: 1,
      status: 'ready',
      smiles: '',
      spectrum: [],
    },
  ]);

  const mutexRef = useRef(new Mutex());
  const nextTabId = useRef(2);

  const getNextTabId = async (): Promise<number> => {
    const unlock = await mutexRef.current.lock();
    try {
      const id = nextTabId.current;
      nextTabId.current++;
      return id;
    } finally {
      unlock();
    }
  };

  const activeTab = useRef<number>(1);

  const [renderVersion, forceRender] = useState(0);

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>([]);

  const [predictionParameters, setPredictionParameters] =
    useState<ModelParameters>({
      currentModel: '',
      models: [],
    });

  const [activeModal, setActiveModal] = useState<ModalName>(null);
  const openModal = (name: ModalName) => {
    setActiveModal(name);
  };
  const closeModal = () => setActiveModal(null);

  const [getSpectrumImage, setGetSpectrumImage] = useState<
    () => Promise<string | null>
  >(() => async () => null);

  const rerender = () => forceRender((v) => v + 1);

  useEffect(() => rerender(), [generalSettings]);

  const changeTab = async (newTabId: number) => {
    if (newTabId === activeTab.current) return;

    const tabIndex = tabs.current.findIndex((tab) => tab.id === newTabId);
    if (tabIndex === -1) return;

    const lastActiveTab = activeTab.current;
    const lastActiveTabIndex = tabs.current.findIndex(
      (tab) => tab.id === lastActiveTab,
    );

    if (!window.ketcher) {
      setSnackbarMessages({
        severity: 'error',
        message: 'Could not find Ketcher when switching tabs',
      });
      return;
    }

    let currentSmiles: string | null = await window.ketcher.getSmiles();
    if (currentSmiles) {
      currentSmiles = await getKekuleSmilesFromKetcher(setSnackbarMessages);
    }
    if (currentSmiles === null) {
      setSnackbarMessages({
        severity: 'error',
        message: 'Could not obtain the SMILES of the current tab',
      });
      return;
    }

    if (lastActiveTabIndex !== -1) {
      tabs.current[lastActiveTabIndex].smiles = currentSmiles;
    }

    activeTab.current = newTabId;
    const activeSmile = tabs.current[tabIndex]?.smiles || '';
    await window.ketcher.setMolecule(activeSmile);
    rerender();
  };

  const clearActiveTab = () => {
    const tabIndex = tabs.current.findIndex(
      (tab) => tab.id === activeTab.current,
    );
    if (tabIndex === -1) return;

    tabs.current[tabIndex] = {
      ...tabs.current[tabIndex],
      smiles: '',
      spectrum: [],
    };
    rerender();
  };

  const newTab = async (data: Omit<TabDataType, 'id'>): Promise<number> => {
    const newTabId = await getNextTabId();

    const newTab: TabDataType = {
      ...data,
      id: newTabId,
      status: data.status ?? 'ready',
    };

    tabs.current.push(newTab);
    await changeTab(newTab.id);
    rerender();

    return newTabId;
  };

  const updateTab = async (
    id: number,
    data: Omit<TabDataType, 'id'>,
  ): Promise<boolean> => {
    const index = tabs.current.findIndex((tab) => tab.id === id);
    if (index === -1) {
      console.warn(
        `Failed to update tab (id: ${id}): tab not found. It may have been closed.`,
      );
      return false;
    }

    const updatedTab: TabDataType = {
      smiles: data.smiles,
      spectrum: data.spectrum,
      status: data.status ?? 'ready',
      id,
    };

    tabs.current[index] = updatedTab;

    // Update app if showing the updated tab
    if (activeTab.current === id) {
      if (!window.ketcher) {
        setSnackbarMessages({
          severity: 'error',
          message: 'Could not find Ketcher when updating tabs',
        });
        return false;
      }
      window.ketcher?.setMolecule(tabs.current[index].smiles);
    }
    rerender();
    return true;
  };

  const closeTab = async (tabId: number, skipWarning = false) => {
    const tabIndex = tabs.current.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    if (!window.ketcher) {
      setSnackbarMessages({
        severity: 'error',
        message: 'Could not find Ketcher when opening a new tab',
      });
      return;
    }

    if (!skipWarning) {
      const tab = tabs.current[tabIndex];
      let confirmState: 'none' | 'waiting' | 'notBlank' = 'none';

      if (tab.status === 'waiting') {
        confirmState = 'waiting';
      } else if (
        tab.smiles ||
        tab.spectrum.length !== 0 ||
        (tabId === activeTab.current &&
          (await window.ketcher.getSmiles()).trim() !== '')
      ) {
        confirmState = 'notBlank';
      }

      if (confirmState !== 'none') {
        const confirmMessage =
          confirmState === 'waiting'
            ? `Tab ${tabId} is currently awaiting a prediction result. Closing it now means you won't receive the result.`
            : `Tab ${tabId} contains molecular or spectrum data.`;

        const confirmed = openConfirm.current
          ? await openConfirm.current(
              'Confirmation',
              `${confirmMessage}\n\nAre you sure you want to continue?`,
            )
          : true;

        if (!confirmed) {
          return;
        }
      }
    }

    tabs.current.splice(tabIndex, 1);

    if (tabs.current.length === 0) {
      const emptyTab: TabDataType = {
        id: await getNextTabId(),
        status: 'ready',
        smiles: '',
        spectrum: [],
      };
      tabs.current = [emptyTab];
      activeTab.current = emptyTab.id;
      await window.ketcher.setMolecule('');
      rerender();
      return;
    }

    const isActiveClosed = activeTab.current === tabId;
    if (isActiveClosed) {
      const fallbackTab =
        tabs.current[tabIndex] || tabs.current[tabs.current.length - 1];
      activeTab.current = fallbackTab.id;
      await window.ketcher.setMolecule(fallbackTab.smiles || '');
    }

    rerender();
  };

  const fetchWithRetry = async <T extends GeneralSettings | ModelParameters>(
    fetchFn: () => Promise<T | null>,
    setter: React.Dispatch<React.SetStateAction<T>>,
    label: string,
    isMounted: () => boolean,
    maxRetries = 10,
    interval = 3000,
  ): Promise<void> => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (!isMounted()) return;
      try {
        const data = await fetchFn();
        if (data !== null) {
          if (!isMounted()) return;
          setter(data);
          console.log(`${label} loaded`, data);
          return;
        }
        console.warn(`Attempt ${attempt} failed for ${label}. Retrying...`);
      } catch (error) {
        console.error(`Error while loading ${label}:`, error);
      }
      await delay(interval);
    }
    console.error(`Failed to load ${label} after ${maxRetries} attempts.`);
  };

  useEffect(() => {
    let mounted = true;

    fetchWithRetry(
      loadGeneralSettings,
      setGeneralSettings,
      'generalSettings',
      () => mounted,
    );
    fetchWithRetry(
      loadModelParameters,
      setPredictionParameters,
      'modelParameters',
      () => mounted,
    );

    return () => {
      mounted = false;
    };
  }, []);

  // Ask a confirmation before quitting
  useEffect(() => {
    const handleBeforeUnload = (event: {
      preventDefault: () => void;
      returnValue: string;
    }) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        ketcherRef,
        plotlyRef,
        generalSettings,
        setGeneralSettings,
        predictionParameters,
        setPredictionParameters,
        tabs,
        activeTab,
        changeTab,
        newTab,
        updateTab,
        clearActiveTab,
        closeTab,
        openAlert,
        openConfirm,
        openModal,
        closeModal,
        activeModal,
        snackbarMessages,
        setSnackbarMessages,
        getSpectrumImage,
        setGetSpectrumImage,
        renderVersion,
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
