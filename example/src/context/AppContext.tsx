import { createContext, useContext, useRef, useState } from 'react';
import { GeneralSettingsCategoryType } from '../types/GeneralSettingsType';
import { ModelParametersType } from '../types/ModelParametersType';
import { SpectrumDataPoint } from '../types/SpectrumDataType';
import { mockPredictionParameters } from '../mock/modelParametersData';
import { mockSettingsCategories } from '../mock/generalSettingsData';

type ModalName = 'GeneralSettings' | 'About' | 'PredictionParameters' | null;

type AppContextType = {
  ketcherRef: React.RefObject<unknown>;
  generalSettings: GeneralSettingsCategoryType[];
  setGeneralSettings: React.Dispatch<
    React.SetStateAction<GeneralSettingsCategoryType[]>
  >;
  predictionParameters: ModelParametersType[];
  setPredictionParameters: React.Dispatch<
    React.SetStateAction<ModelParametersType[]>
  >;
  spectrumData: SpectrumDataPoint[];
  setSpectrumData: React.Dispatch<React.SetStateAction<SpectrumDataPoint[]>>;
  openAlert: React.MutableRefObject<(title: string, content: string) => void>;
  openConfirm: React.MutableRefObject<
    (title: string, content: string, onConfirm: () => void) => void
  >;
  openModal: (name: ModalName) => void;
  closeModal: () => void;
  activeModal: ModalName;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const ketcherRef = useRef<unknown>(null);

  const openAlert = useRef<(title: string, content: string) => void>(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  });
  const openConfirm = useRef<
    (title: string, content: string, onConfirm: () => void) => void
  >(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  });

  // Load mock spectrum data
  const [spectrumData, setSpectrumData] = useState<SpectrumDataPoint[]>([]);

  const [generalSettings, setGeneralSettings] = useState<
    GeneralSettingsCategoryType[]
  >(mockSettingsCategories);

  const [predictionParameters, setPredictionParameters] = useState<
    ModelParametersType[]
  >(mockPredictionParameters);

  const [activeModal, setActiveModal] = useState<ModalName>(null);

  const openModal = (name: ModalName) => {
    setActiveModal(name);
  };
  const closeModal = () => setActiveModal(null);

  return (
    <AppContext.Provider
      value={{
        ketcherRef,
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
