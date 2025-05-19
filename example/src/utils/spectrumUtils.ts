import axios from 'axios';
import { SnackbarMessage } from '../types/SnackbarMessage';
import { SpectrumDataPoint, SpectrumRegion } from '../types/SpectrumDataType';

const apiUrl = process.env.REACT_APP_INTERN_API_PATH || '';

export const getSpectrumRegions = async (
  spectrum: SpectrumDataPoint[],
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>,
): Promise<SpectrumRegion[] | null> => {
  if (spectrum.length === 0) {
    return [];
  }

  try {
    const response = await axios.post(`${apiUrl}/api/detectSpectrumRegions`, {
      spectrum,
    });

    const regions: SpectrumRegion[] = response.data?.regions;

    if (!regions || regions.length === 0) {
      setSnackbarMessages({
        severity: 'warning',
        message: 'No regions detected in the spectrum data.',
      });
      return null;
    }

    return regions;
  } catch (error: unknown) {
    console.error('Error fetching spectrum regions:', error);
    setSnackbarMessages({
      severity: 'error',
      message: 'Failed to fetch spectrum regions from backend.',
    });
    return null;
  }
};
