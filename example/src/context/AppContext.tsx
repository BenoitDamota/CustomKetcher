import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { GeneralSettings } from '../types/GeneralSettingsType';
import { ModelParameters } from '../types/ModelParametersType';

import {
  loadGeneralSettings,
  loadModelParameters,
} from '../utils/SettingsUtils';
import { SnackbarMessage } from '../types/SnackbarMessage';
import { TabDataType } from '../types/TabDataType';
import { getKekuleSmilesFromKetcher } from '../utils/MoleculesUtils';

type ModalName =
  | 'ExportProject'
  | 'PredictionParameters'
  | 'ManagePredictionModels'
  | 'GeneralSettings'
  | 'About'
  | null;

type AppContextType = {
  ketcherRef: React.MutableRefObject<unknown>;
  plotlyRef: React.MutableRefObject<Plotly.PlotlyHTMLElement | null>;
  generalSettings: GeneralSettings;
  setGeneralSettings: React.Dispatch<React.SetStateAction<GeneralSettings>>;
  predictionParameters: ModelParameters;
  setPredictionParameters: React.Dispatch<
    React.SetStateAction<ModelParameters>
  >;
  tabs: React.MutableRefObject<TabDataType[]>;
  activeTab: React.MutableRefObject<number>;
  changeTab: (newTabId: number) => Promise<void>;
  clearActiveTab: () => void;
  newTab: (data: Omit<TabDataType, 'id'>) => Promise<number>;
  updateTab: (id: number, data: Omit<TabDataType, 'id'>) => Promise<boolean>;
  closeTab: (tabId: number) => void;
  openAlert: React.MutableRefObject<(title: string, content: string) => void>;
  openConfirm: React.MutableRefObject<
    | ((
        title: string,
        content: string,
        htmlContent?: React.ReactNode,
      ) => Promise<boolean>)
    | null
  >;
  openModal: (name: ModalName) => void;
  closeModal: () => void;
  activeModal: ModalName;
  snackbarMessages: SnackbarMessage;
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>;
  getSpectrumImage?: () => Promise<string | null>;
  setGetSpectrumImage: (fn: () => Promise<string | null>) => void;
  renderVersion: number;
};

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

  const nextTabId = useRef(2);

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
    const newTabId = nextTabId.current++;

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

  const closeTab = async (tabId: number) => {
    const tabIndex = tabs.current.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    if (!window.ketcher) {
      setSnackbarMessages({
        severity: 'error',
        message: 'Could not find Ketcher when opening a new tab',
      });
      return;
    }

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
          : `Tab ${tabId} contains unsaved molecular or spectrum data.`;

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

    tabs.current.splice(tabIndex, 1);

    if (tabs.current.length === 0) {
      const emptyTab: TabDataType = {
        id: nextTabId.current++,
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

  useEffect(() => {
    let isMounted = true;

    const fetchGeneralSettingsWithRetry = async () => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const retryInterval = 3000;
      const maxRetries = 10;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const settings = await loadGeneralSettings();
        if (settings && isMounted) {
          setGeneralSettings(settings);
          console.log('settings loaded', settings);
          return;
        }

        if (!isMounted) return;

        console.warn(
          `Tentative ${attempt} échouée. Nouvelle tentative dans ${
            retryInterval / 1000
          } secondes...`,
        );

        await delay(retryInterval);
      }

      if (isMounted) {
        console.error(
          'Impossible de charger les paramètres après 10 tentatives.',
        );
      }
    };

    fetchGeneralSettingsWithRetry();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchModelParametersWithRetry = async () => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const retryInterval = 3000;
      const maxRetries = 10;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const parameters = await loadModelParameters();
        if (parameters && isMounted) {
          setPredictionParameters(parameters);
          console.log('parameters loaded', parameters);
          return;
        }

        if (!isMounted) return;

        console.warn(
          `Tentative ${attempt} échouée. Nouvelle tentative dans ${
            retryInterval / 1000
          } secondes...`,
        );

        await delay(retryInterval);
      }

      if (isMounted) {
        console.error(
          'Impossible de charger les paramètres du modèle après 10 tentatives.',
        );
      }
    };

    fetchModelParametersWithRetry();

    return () => {
      isMounted = false;
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
