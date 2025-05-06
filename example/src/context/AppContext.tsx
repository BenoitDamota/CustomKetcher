import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { GeneralSettings } from '../types/GeneralSettingsType';
import { ModelParameters } from '../types/ModelParametersType';
import { SpectrumDataPoint } from '../types/SpectrumDataType';

import {
  loadGeneralSettings,
  loadModelParameters,
} from '../utils/SettingsUtils';
import { SnackbarMessage } from '../types/SnackbarMessage';

type ModalName =
  | 'GeneralSettings'
  | 'About'
  | 'ConfirmPredictionInputBar'
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
  spectrumData: SpectrumDataPoint[];
  setSpectrumData: React.Dispatch<React.SetStateAction<SpectrumDataPoint[]>>;
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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const ketcherRef = useRef<unknown>(null);
  const plotlyRef = useRef<Plotly.PlotlyHTMLElement | null>(null);

  const openAlert = useRef<(title: string, content: string) => void>(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  });
  const openConfirm = useRef<
    (title: string, content: string, onConfirm: () => void) => void
  >(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  });

  const [spectrumData, setSpectrumData] = useState<SpectrumDataPoint[]>([]);

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>([]);

  const [predictionParameters, setPredictionParameters] =
    useState<ModelParameters>([]);

  const [activeModal, setActiveModal] = useState<ModalName>(null);
  const openModal = (name: ModalName) => {
    setActiveModal(name);
  };
  const closeModal = () => setActiveModal(null);

  const [snackbarMessages, setSnackbarMessages] = useState<SnackbarMessage>({
    severity: undefined,
    message: '',
  });

  const [getSpectrumImage, setGetSpectrumImage] = useState<
    () => Promise<string | null>
  >(() => async () => null);

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
        spectrumData,
        setSpectrumData,
        openAlert,
        openConfirm,
        openModal,
        closeModal,
        activeModal,
        snackbarMessages,
        setSnackbarMessages,
        getSpectrumImage,
        setGetSpectrumImage,
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
