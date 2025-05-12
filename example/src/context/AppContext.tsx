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
  | 'GeneralSettings'
  | 'About'
  | 'PredictionParameters'
  | 'ExportProject'
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
  activeTab: number;
  changeTab: (newTabId: number) => Promise<void>;
  clearActiveTab: () => void;
  newTab: (data: Omit<TabDataType, 'id'>) => void;
  closeTab: (tabId: number) => void;
  openAlert: React.MutableRefObject<(title: string, content: string) => void>;
  openConfirm: React.MutableRefObject<
    (
      title: string,
      content: string,
      onConfirm: () => void,
      htmlContent?: JSX.Element | string,
    ) => void
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
    (title: string, content: string, onConfirm: () => void) => void
  >(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  });

  const tabs = useRef<TabDataType[]>([
    {
      id: 1,
      smiles: '',
      spectrum: [],
    },
  ]);

  const nextTabId = useRef(2);

  const [activeTab, setActiveTab] = useState<number>(1);

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
    if (newTabId === activeTab) return;

    const tabIndex = tabs.current.findIndex((tab) => tab.id === newTabId);
    if (tabIndex === -1) return;

    const lastActiveTab = activeTab;
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

    setActiveTab(newTabId);
    const activeSmile = tabs.current[tabIndex]?.smiles || '';
    await window.ketcher.setMolecule(activeSmile);
    rerender();
  };

  const clearActiveTab = () => {
    const tabIndex = tabs.current.findIndex((tab) => tab.id === activeTab);
    if (tabIndex === -1) return;

    tabs.current[tabIndex] = {
      ...tabs.current[tabIndex],
      smiles: '',
      spectrum: [],
    };
    rerender();
  };

  const newTab = async (data: Omit<TabDataType, 'id'>) => {
    const newTab: TabDataType = {
      ...data,
      id: nextTabId.current++,
    };

    tabs.current.push(newTab);
    await changeTab(newTab.id);
    rerender();
  };

  const closeTab = async (tabId: number) => {
    if (!window.ketcher) {
      setSnackbarMessages({
        severity: 'error',
        message: 'Could not find Ketcher when opening a new tab',
      });
      return;
    }

    const tabIndex = tabs.current.findIndex((tab) => tab.id === tabId);
    if (tabIndex === -1) return;

    tabs.current.splice(tabIndex, 1);

    if (tabs.current.length === 0) {
      const emptyTab = { id: nextTabId.current++, smiles: '', spectrum: [] };
      tabs.current = [emptyTab];
      setActiveTab(emptyTab.id);
      await window.ketcher.setMolecule('');
      rerender();
      return;
    }

    const isActiveClosed = activeTab === tabId;
    let newActiveTabId = activeTab;

    if (isActiveClosed) {
      const newTab =
        tabs.current[tabIndex] || tabs.current[tabs.current.length - 1];
      newActiveTabId = newTab.id;
    }

    setActiveTab(newActiveTabId);
    const newActiveTab = tabs.current.find((tab) => tab.id === newActiveTabId);
    if (newActiveTab) {
      await window.ketcher.setMolecule(newActiveTab.smiles || '');
    }

    rerender();
  };

  useEffect(() => {
    let isMounted = true;

    const fetchGeneralSettingsWithRetry = async () => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const retryInterval = 3000; // ms
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

      // Si on sort de la boucle sans succès
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
      const retryInterval = 3000; // 3 secondes
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

      // Si on sort de la boucle sans succès
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
