import React, { useState, useEffect, useCallback } from 'react';
import {
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import { convertProjectToJSON } from '../../../utils/fileUtils';
import { SpectrumDataPoint } from '../../../types/SpectrumDataType';
import { useAppContext } from '../../../context/AppContext';
import { getKekuleSmilesFromKetcher } from '../../../utils/MoleculesUtils';
import { SnackbarMessage } from '../../../types/SnackbarMessage';

interface Props {
  onClose: () => void;
}

// Fonctions to export the project in JSON format
const exportJSON = async (
  spectrumData: SpectrumDataPoint[],
  setSnackbarMessages: React.Dispatch<React.SetStateAction<SnackbarMessage>>,
): Promise<
  { data: string; blob: Blob; filename: string } | { error: string }
> => {
  try {
    if (!window.ketcher || typeof window.ketcher.getSmiles !== 'function') {
      throw new Error('Ketcher is not available.');
    }

    const smiles: string | null = await getKekuleSmilesFromKetcher(
      setSnackbarMessages,
    );

    if (!smiles) {
      throw new Error('No molecules obtained from Ketcher');
    }

    const json = convertProjectToJSON('SMILES', smiles, spectrumData);
    const jsonString = JSON.stringify(json, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    return {
      data: jsonString,
      blob,
      filename: 'export_project.json',
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Erreur inconnue lors de la génération du JSON.' };
  }
};

const exportIMG = async (
  getSpectrumImage: (() => Promise<string | null>) | undefined,
): Promise<
  { data: string; blob: Blob; filename: string } | { error: string }
> => {
  try {
    if (getSpectrumImage === undefined)
      throw new Error(
        'The function to generate the spectrum image is not initialized',
      );

    const base64Image = await getSpectrumImage();
    if (!base64Image) throw new Error('Failed to generate image.');

    const res = await fetch(base64Image);
    const blob = await res.blob();

    return { data: base64Image, blob, filename: 'export_spectrum.png' };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Unknown error during image export.' };
  }
};

const ExportProjectModalTemplate: React.FC<Props> = ({ onClose }) => {
  const { spectrumData, plotlyRef, setSnackbarMessages } = useAppContext();

  const [exportType, setExportType] = useState<'json' | 'image'>('json');
  const [previewData, setPreviewData] = useState<string>('');
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState<string>('export');
  const [error, setError] = useState<string | null>(null);

  const getSpectrumImage = useCallback(async (): Promise<string | null> => {
    if (!plotlyRef?.current) return null;

    try {
      Plotly.relayout(plotlyRef.current, {
        autosize: true,
        margin: { t: 50, r: 40, b: 40, l: 40 },
        responsive: true,
        xaxis: {
          title: 'ppm',
          autorange: 'reversed',
        },
        yaxis: {
          title: 'Intensity',
        },
        showlegend: false,
      });

      const imageUrl = await Plotly.toImage(plotlyRef.current, {
        format: 'png',
        width: 800,
        height: 600,
        scale: 2,
      });

      return imageUrl;
    } catch (err) {
      console.error('Failed to generate image preview:', err);
      return null;
    }
  }, [plotlyRef]);

  const generatePreview = useCallback(
    async (
      setSnackbarMessages: React.Dispatch<
        React.SetStateAction<SnackbarMessage>
      >,
    ) => {
      setError(null);
      if (exportType === 'json') {
        const result = await exportJSON(spectrumData, setSnackbarMessages);
        if ('error' in result) {
          setError(result.error);
          setPreviewData('');
          setExportBlob(null);
          return;
        }
        const { data, blob, filename } = result;
        setPreviewData(data);
        setExportBlob(blob);
        setFilename(filename);
      } else if (exportType === 'image') {
        setPreviewData('');

        const result = await exportIMG(getSpectrumImage);
        if ('error' in result) {
          setError(result.error);
          setPreviewData('');
          setExportBlob(null);
          return;
        }
        const { data, blob, filename } = result;
        setPreviewData(data);
        setExportBlob(blob);
        setFilename(filename);
      }
    },
    [exportType, spectrumData, getSpectrumImage],
  );

  useEffect(() => {
    generatePreview(setSnackbarMessages);
  }, [exportType, generatePreview, setSnackbarMessages]);

  useEffect(() => {
    return () => {
      if (previewData.startsWith('blob:')) {
        URL.revokeObjectURL(previewData);
      }
    };
  }, [previewData]);

  const handleDownload = () => {
    if (!exportBlob || !filename) return;

    const url = URL.createObjectURL(exportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onClose();
  };

  // Function to format JSON content with proper line breaks and escaping
  const formatJsonContent = (jsonString: string) => {
    const formattedString = jsonString
      .replace(/\\n/g, '<br />')
      .replace(/\\"/g, '&quot;');

    return formattedString;
  };

  return (
    <>
      <DialogContentText>
        <strong>Export Project</strong>
      </DialogContentText>

      <FormControl fullWidth margin="normal">
        <InputLabel id="export-type-label">Export format</InputLabel>
        <Select
          labelId="export-type-label"
          value={exportType}
          onChange={(e) => setExportType(e.target.value as 'json' | 'image')}
          label="Type d'export"
        >
          <MenuItem value="json">JSON</MenuItem>
          <MenuItem value="image">Image</MenuItem>
        </Select>
      </FormControl>

      <Box mt={2}>
        <Typography variant="subtitle1">Preview :</Typography>

        {error ? (
          <Box
            mt={2}
            p={2}
            sx={{
              backgroundColor: '#fdecea',
              borderRadius: 2,
              border: '1px solid #f44336',
            }}
          >
            <Typography color="error">{error}</Typography>
          </Box>
        ) : exportType === 'json' ? (
          <Box p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: 2 }}>
            <Typography
              variant="body2"
              component="pre"
              style={{
                maxHeight: '350px',
                overflowY: 'auto',
              }}
            >
              {/* Use formatJsonContent to format the JSON for display */}
              <span
                dangerouslySetInnerHTML={{
                  __html: formatJsonContent(previewData),
                }}
              />
            </Typography>
          </Box>
        ) : (
          <Box p={2}>
            {previewData && (
              <img
                src={previewData.startsWith('data:image') ? previewData : ''}
                alt="Export Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '380px',
                  borderRadius: 8,
                  border: '1px solid #ccc',
                }}
              />
            )}
          </Box>
        )}
      </Box>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ mt: 3 }}
      >
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleDownload}>
          Export
        </Button>
      </Stack>
    </>
  );
};

export default ExportProjectModalTemplate;
