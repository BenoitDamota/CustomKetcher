import { GeneralSettings } from './GeneralSettingsType';
import { ModelParameters } from './ModelParametersType';
import { SnackbarMessage } from './SnackbarMessage';
import { TabDataType } from './TabDataType';

export type ModalName =
  | 'ExportProject'
  | 'PredictionParameters'
  | 'ManagePredictionModels'
  | 'GeneralSettings'
  | 'About'
  | null;

export type AppContextType = {
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
  closeTab: (tabId: number, skipWarning?: boolean) => void;
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
