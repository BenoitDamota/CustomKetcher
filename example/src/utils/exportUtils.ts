import axios from 'axios';
import JSZip from 'jszip';
import { SnackbarMessage } from '../types/SnackbarMessage';
import { SpectrumDataPoint } from '../types/SpectrumDataType';
import { convertProjectToJSON } from './fileUtils';
import { getKekuleSmilesFromKetcher } from './MoleculesUtils';
import { PeaksInfosData } from '../types/PeaksInfos';
import { MetadataNRM } from '../types/metadataNRM';
import { apiUrl } from './api';

// Fonctions to export the project in JSON format
export const exportJSON = async (
  spectrumData: SpectrumDataPoint[],
  peaksInfos: PeaksInfosData,
  metadata: MetadataNRM,
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>,
): Promise<
  { data: string; blob: Blob; filename: string } | { error: string }
> => {
  try {
    if (!window.ketcher) {
      throw new Error('Ketcher is not available');
    }

    let smiles: string | null = null;

    smiles = await getKekuleSmilesFromKetcher(setSnackbarMessages);

    if (!smiles) {
      smiles = '';
    }

    const json = convertProjectToJSON(
      'SMILES',
      smiles,
      spectrumData,
      peaksInfos,
      metadata,
    );
    const blob = new Blob([json], { type: 'application/json' });

    return {
      data: json,
      blob,
      filename: 'export_project.json',
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'An unknown error occurred while generating the JSON' };
  }
};

// Function to export the project spectrum in an image
export const exportSpectrumIMG = async (
  spectrumData: SpectrumDataPoint[],
  getSpectrumImage: (() => Promise<string | null>) | undefined,
): Promise<
  { data: string; blob: Blob; filename: string } | { error: string }
> => {
  try {
    if (spectrumData && spectrumData.length === 0) {
      throw new Error('No spectrum data loaded');
    }

    if (getSpectrumImage === undefined)
      throw new Error(
        'The function to generate the spectrum image is not initialized',
      );

    const base64Image = await getSpectrumImage();
    if (!base64Image) throw new Error('Failed to generate image');

    const res = await fetch(base64Image);
    const blob = await res.blob();

    return { data: base64Image, blob, filename: 'export_spectrum.png' };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Unknown error during image export' };
  }
};

// Function to export the project molecule in an image
export const exportMolIMG = async (
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>,
): Promise<
  { data: string; blob: Blob; filename: string } | { error: string }
> => {
  try {
    if (!window.ketcher) {
      throw new Error('Ketcher is not available');
    }

    if (!(await window.ketcher.getSmiles())) {
      return { error: 'No molecules found in Ketcher' };
    }

    const smiles: string | null = await getKekuleSmilesFromKetcher(
      setSnackbarMessages,
    );

    if (!smiles) {
      throw new Error('No molecules obtained after kekulization');
    }

    const response = await axios.post(
      `${apiUrl}/api/getMolImageWithIds`,
      { SMILES: smiles },
      {
        responseType: 'blob',
      },
    );

    const blob = response.data;
    const objectURL = URL.createObjectURL(blob);

    return { data: objectURL, blob, filename: 'export_molecule.png' };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error during molecule image export:', error.message);
      setSnackbarMessages({
        severity: 'error',
        message:
          error.response?.data?.error ||
          'Error from backend while generating molecule image',
      });
    } else {
      console.error('Unknown error during molecule image export:', error);
      setSnackbarMessages({
        severity: 'error',
        message: 'Unknown error during molecule image export',
      });
    }
    return { error: 'Molecule image export failed' };
  }
};

// Fonction to export the project files in a ZIP file (JSON, SpectrumImage, MoleculeImage)
export const exportZIP = async (
  spectrumData: SpectrumDataPoint[],
  peaksInfosData: PeaksInfosData,
  metadata: MetadataNRM,
  getSpectrumImage: (() => Promise<string | null>) | undefined,
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>,
): Promise<
  { data: string; blob: Blob; filename: string } | { error: string }
> => {
  try {
    const zip = new JSZip();

    const jsonResult = await exportJSON(
      spectrumData,
      peaksInfosData,
      metadata,
      setSnackbarMessages,
    );
    if ('error' in jsonResult) {
      return { error: jsonResult.error };
    }
    const { blob: jsonBlob, filename: jsonFilename } = jsonResult;

    zip.file(jsonFilename, jsonBlob);

    const spectrumImageResult = await exportSpectrumIMG(
      spectrumData,
      getSpectrumImage,
    );
    if ('error' in spectrumImageResult) {
      return { error: spectrumImageResult.error };
    }
    const { blob: spectrumBlob, filename: spectrumFilename } =
      spectrumImageResult;

    zip.file(spectrumFilename, spectrumBlob);

    const moleculeImageResult = await exportMolIMG(setSnackbarMessages);
    if ('error' in moleculeImageResult) {
      return { error: moleculeImageResult.error };
    }
    const { blob: moleculeBlob, filename: moleculeFilename } =
      moleculeImageResult;

    zip.file(moleculeFilename, moleculeBlob);

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const zipData = URL.createObjectURL(zipBlob);
    const zipFilename = 'exported_project.zip';

    return {
      data: zipData,
      blob: zipBlob,
      filename: zipFilename,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'An unknown error occurred while generating the ZIP' };
  }
};
