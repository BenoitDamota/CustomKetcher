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
  SxProps,
  Theme,
} from '@mui/material';
import { SpectrumDataPoint } from '../../../types/SpectrumDataType';
import { useAppContext } from '../../../context/AppContext';
import { SnackbarMessage } from '../../../types/SnackbarMessage';
import { TabDataType } from '../../../types/TabDataType';
import {
  exportJSON,
  exportMolIMG,
  exportSpectrumIMG,
  exportZIP,
} from '../../../utils/exportUtils';
import JSZip from 'jszip';
import { PeaksInfosData } from '../../../types/PeaksInfos';
import { MetadataNRM } from '../../../types/metadataNRM';

const errorBoxSx: SxProps<Theme> = {
  backgroundColor: '#fdecea',
  borderRadius: 2,
  border: '1px solid #f44336',
};

const jsonPreviewBoxSx: SxProps<Theme> = {
  backgroundColor: '#f5f5f5',
  borderRadius: 2,
};

const jsonPreviewTypographyStyle: React.CSSProperties = {
  maxHeight: '350px',
  overflowY: 'auto',
};

const zipPreviewBoxSx: SxProps<Theme> = {
  backgroundColor: '#f5f5f5',
  borderRadius: 2,
};

const imagePreviewBoxSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
};

const imagePreviewStyle: React.CSSProperties = {
  maxWidth: '100%',
  height: 'auto',
  borderRadius: 8,
  border: '1px solid #ccc',
};

const stackSx: SxProps<Theme> = { mt: 3 };

interface Props {
  onClose: () => void;
}

const ExportProjectModalTemplate: React.FC<Props> = ({ onClose }) => {
  const { plotlyRef, setSnackbarMessages, tabs, activeTab } = useAppContext();

  const [exportType, setExportType] = useState<
    'json' | 'spectrum-image' | 'molecule-image' | 'zip'
  >('json');
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
      const currentTab: TabDataType | undefined = tabs.current.find(
        (tab) => tab.id === activeTab.current,
      );

      if (!currentTab) {
        setError('Could not find the current tab data');
        return;
      }

      const spectrumData: SpectrumDataPoint[] = currentTab.spectrum;
      const peaksInfos: PeaksInfosData = currentTab.peaksInfos;
      const metadata: MetadataNRM = currentTab.metadata;

      setError(null);
      if (exportType === 'json') {
        const result = await exportJSON(
          spectrumData,
          peaksInfos,
          metadata,
          setSnackbarMessages,
        );
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
      } else if (exportType === 'spectrum-image') {
        setPreviewData('');
        const result = await exportSpectrumIMG(spectrumData, getSpectrumImage);
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
      } else if (exportType === 'molecule-image') {
        setPreviewData('');
        const result = await exportMolIMG(setSnackbarMessages);
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
      } else if (exportType === 'zip') {
        setPreviewData('');
        const result = await exportZIP(
          spectrumData,
          peaksInfos,
          metadata,
          getSpectrumImage,
          setSnackbarMessages,
        );
        if ('error' in result) {
          setError(result.error);
          setPreviewData('');
          setExportBlob(null);
          return;
        }

        const zip = await JSZip.loadAsync(result.blob);
        const fileNames: string[] = [];
        zip.forEach((relativePath, _) => {
          fileNames.push(relativePath);
        });

        setPreviewData(
          `The ZIP contains the following files :\n - ${fileNames.join(
            '\n - ',
          )}`,
        );
        setExportBlob(result.blob);
        setFilename(result.filename);
      }
    },
    [tabs, exportType, activeTab, getSpectrumImage],
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
          onChange={(e) =>
            setExportType(
              e.target.value as
                | 'json'
                | 'spectrum-image'
                | 'molecule-image'
                | 'zip',
            )
          }
          label="Type d'export"
        >
          <MenuItem value="json">JSON</MenuItem>
          <MenuItem value="spectrum-image">Spectrum Image</MenuItem>
          <MenuItem value="molecule-image">Molecule Image</MenuItem>
          <MenuItem value="zip">ZIP (All Formats)</MenuItem>
        </Select>
      </FormControl>

      <Box mt={2}>
        <Typography variant="subtitle1">Preview :</Typography>

        {error ? (
          <Box mt={2} p={2} sx={errorBoxSx}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : exportType === 'json' ? (
          <Box p={2} sx={jsonPreviewBoxSx}>
            <Typography
              variant="body2"
              component="pre"
              style={jsonPreviewTypographyStyle}
            >
              {/* Use formatJsonContent to format the JSON for display */}
              <span
                dangerouslySetInnerHTML={{
                  __html: formatJsonContent(previewData),
                }}
              />
            </Typography>
          </Box>
        ) : exportType === 'zip' ? (
          <Box p={2} sx={zipPreviewBoxSx}>
            <Typography variant="body2">
              {previewData.startsWith('The ZIP') &&
                previewData.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
            </Typography>
          </Box>
        ) : (
          <Box p={2} sx={imagePreviewBoxSx}>
            {previewData.startsWith('data:image') ||
            previewData.startsWith('blob:') ? (
              <img
                src={previewData}
                alt="Export Preview"
                style={imagePreviewStyle}
              />
            ) : null}
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={stackSx}>
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
