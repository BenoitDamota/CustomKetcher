import axios from 'axios';
import { SnackbarMessage } from '../types/SnackbarMessage';
import { apiUrl } from './api';

export const getKekuleSmilesFromKetcher = async (
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>,
): Promise<string | null> => {
  try {
    if (!window.ketcher) {
      console.error('Ketcher is not loaded');
      return null;
    }

    const smiles = await window.ketcher.getSmiles();

    if (!smiles) {
      console.log('getKekuleSmilesFromKetcher : No SMILES found in Ketcher');
      setSnackbarMessages({
        severity: 'warning',
        message: 'No molecules found in Ketcher',
      });
      return null;
    }

    const response = await axios.post(`${apiUrl}/api/convertToKekuleSmiles`, {
      SMILES: smiles,
    });

    const kekulizedSMILES = response.data.kekule_smiles || null;
    console.log('convertToKekuleSmiles', {
      smiles,
      kekulizedSMILES,
    });

    return kekulizedSMILES;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error during SMILES conversion:', error.message);
    } else {
      console.error('Unknown error during SMILES conversion:', error);
    }
    setSnackbarMessages({
      severity: 'error',
      message: 'Error during SMILES conversion',
    });
    return null;
  }
};
