import React from 'react';
import {
  DialogTitle,
  DialogContent,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { useAppContext } from '../../../context/AppContext';
import {
  loadProjectFile,
  openFileInput,
  ProjectFileParsedContentJSON,
} from '../../../utils/fileUtils';

interface Props {
  onClose: () => void;
}

const OpenProjectModalTemplate: React.FC<Props> = ({ onClose }) => {
  const { newTab, setSnackbarMessages } = useAppContext();

  // Function to load a project file
  function handleLoad() {
    openFileInput((fileContent: string) => {
      const result = loadProjectFile(fileContent);

      if (result.success) {
        const data: ProjectFileParsedContentJSON = result.data;

        const moleculeFormat = data.molecules.format;
        const moleculeData = data.molecules.data;
        const spectrumData = data.spectrum;

        if (moleculeFormat === 'SMILES') {
          newTab({
            smiles: moleculeData,
            spectrum: spectrumData,
          });
        }
        setSnackbarMessages({
          severity: 'success',
          message: `Project file successfuly loaded ${
            moleculeFormat === 'SMILES' ? ` : ${moleculeData}` : ''
          }`,
        });
      }

      if (result.errors) {
        setSnackbarMessages({
          severity: 'error',
          message: `Failed to load project file : ${result.errors}`,
        });
      }
    });
  }

  return (
    <>
      <DialogTitle>Open a Project</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'grey.100' },
              }}
              onClick={() => {
                newTab({
                  smiles: '',
                  spectrum: [],
                });
                onClose();
              }}
            >
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: 'xxx-large' }}
              >
                note_add
              </span>

              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                New Blank Project
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'grey.100' },
              }}
              onClick={() => {
                handleLoad();
                onClose();
              }}
            >
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: 'xxx-large' }}
              >
                folder_open
              </span>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Open Existing Project
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
};

export default OpenProjectModalTemplate;
