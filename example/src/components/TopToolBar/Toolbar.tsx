import { useState } from 'react';
import logoIMG from '../../assets/logo.png';
import InputBarSMILES from './InputBarSmiles';
import { useAppContext } from '../../context/AppContext';
import {
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
  Stack,
} from '@mui/material';

export default function Toolbar() {
  const { openAlert, openConfirm, openModal } = useAppContext();

  const isBelow850 = useMediaQuery('(max-width:850px)');
  const isBelow700 = useMediaQuery('(max-width:700px)');

  const [anchorElLoad, setAnchorElLoad] = useState<null | HTMLElement>(null);
  const [anchorElSettings, setAnchorElSettings] = useState<null | HTMLElement>(
    null,
  );

  const openLoadMenu = Boolean(anchorElLoad);
  const openSettingsMenu = Boolean(anchorElSettings);

  const [inputSmilesBar, setInputSmilesBar] = useState('');

  function handlePrediction() {
    if (inputSmilesBar) {
      openConfirm.current(
        'Confirmation',
        'A molecule is entered in the SMILES bar. Do you want to start the prediction based on this molecule?',
        () => {
          openAlert.current(
            'Prediction Started',
            `Starting prediction with: ${inputSmilesBar}`,
          );
        },
      );
    } else {
      if (window.ketcher) {
        window.ketcher.getSmiles(false).then((SMILES: string) => {
          if (SMILES) {
            openAlert.current(
              'Prediction Started',
              `Starting prediction with: ${SMILES}`,
            );
          } else {
            openAlert.current('Error', 'No molecule is drawn.');
          }
        });
      } else {
        openAlert.current('Error', 'Ketcher is not available.');
      }
    }
  }

  function handleLoad() {
    openAlert.current('Loading', 'Loading file...');
  }

  function handleExport() {
    openAlert.current('Exporting', 'Exporting data...');
  }

  function handleSaveAs() {
    openAlert.current('Save', 'Saving file...');
  }

  return (
    <nav
      className="menu-clair"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '57px',
        borderBottom: 'solid #525252 3px',
        paddingInline: '16px',
        position: 'relative',
      }}
    >
      {/* Left Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {!isBelow850 && (
          <div style={{ marginRight: '40px' }}>
            <img
              style={{ display: 'block', height: '40px', width: 'auto' }}
              src={logoIMG}
              alt="vite img"
            />
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
            }}
          >
            <button
              title="Open File"
              className="material-symbols-outlined"
              onClick={() => handleLoad()}
              style={{ fontSize: isBelow700 ? '35px' : '' }}
            >
              file_open
            </button>

            {isBelow700 && (
              <IconButton
                onClick={(e) => setAnchorElLoad(e.currentTarget)}
                title="Dropdown Options"
                style={{
                  padding: 0,
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  color: '#333',
                  transform: 'translate(40%, 40%)',
                  cursor: 'pointer',
                }}
                size="small"
                className="hover-primary"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '20px' }}
                >
                  arrow_drop_down
                </span>
              </IconButton>
            )}
          </div>

          {!isBelow700 && (
            <>
              <button
                title="Save As"
                onClick={handleSaveAs}
                className="material-symbols-outlined"
              >
                save_as
              </button>
              <button
                title="Export"
                onClick={handleExport}
                className="material-symbols-outlined"
              >
                file_export
              </button>
            </>
          )}
        </div>
      </div>
      {/* Load Menu dropdown */}
      <Menu
        anchorEl={anchorElLoad}
        open={openLoadMenu}
        onClose={() => setAnchorElLoad(null)}
      >
        <Stack direction="column" spacing={1} padding={1}>
          <MenuItem
            onClick={handleSaveAs}
            title="Save As"
            sx={{
              justifyContent: 'center',
              '&:hover': {
                color: '#188794',
              },
            }}
          >
            <span className="material-symbols-outlined">save_as</span>
          </MenuItem>
          <MenuItem
            onClick={handleExport}
            title="Export"
            sx={{
              justifyContent: 'center',
              '&:hover': {
                color: '#188794',
              },
            }}
          >
            <span className="material-symbols-outlined">file_export</span>
          </MenuItem>
        </Stack>
      </Menu>
      {/* Middle Controls (absolute - center) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FCFCFC',
        }}
      >
        <button
          title="Start Prediction"
          className="material-symbols-outlined"
          onClick={() => handlePrediction()}
        >
          send
        </button>
        <InputBarSMILES input={inputSmilesBar} setInput={setInputSmilesBar} />
        <button
          title="Prediction Settings"
          onClick={() => openModal('PredictionParameters')}
          className="material-symbols-outlined"
        >
          manufacturing
        </button>
      </div>
      {/* Droite */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
          }}
        >
          <button
            title="General Settings"
            onClick={() => openModal('GeneralSettings')}
            className="material-symbols-outlined"
            style={{ fontSize: isBelow700 ? '35px' : '' }}
          >
            settings
          </button>
          {isBelow700 && (
            <IconButton
              onClick={(e) => setAnchorElSettings(e.currentTarget)}
              title="Dropdown Options"
              style={{
                padding: 0,
                position: 'absolute',
                bottom: 0,
                right: 0,
                color: '#333',
                transform: 'translate(40%, 40%)',
                cursor: 'pointer',
              }}
              size="small"
              className="hover-primary"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px' }}
              >
                arrow_drop_down
              </span>
            </IconButton>
          )}
        </div>

        {!isBelow700 && (
          <>
            <button
              title="Visit Help Documentation"
              onClick={() =>
                window.open(
                  'https://github.com/KreeZeG123/PredictionRMN',
                  '_blank',
                )
              }
              className="material-symbols-outlined"
            >
              help
            </button>
            <button
              title="About The App"
              onClick={() => openModal('About')}
              className="material-symbols-outlined"
            >
              info
            </button>
          </>
        )}
      </div>
      <Menu
        anchorEl={anchorElSettings}
        open={openSettingsMenu}
        onClose={() => setAnchorElSettings(null)}
      >
        <Stack direction="column" spacing={1} padding={1}>
          <MenuItem
            title="Visit Help Documentation"
            onClick={() =>
              window.open(
                'https://github.com/KreeZeG123/PredictionRMN',
                '_blank',
              )
            }
            sx={{
              justifyContent: 'center',
              '&:hover': {
                color: '#188794',
              },
            }}
          >
            <span className="material-symbols-outlined">help</span>
          </MenuItem>
          <MenuItem
            title="About The App"
            onClick={() => openModal('About')}
            sx={{
              justifyContent: 'center',
              '&:hover': {
                color: '#188794',
              },
            }}
          >
            <span className="material-symbols-outlined">info</span>
          </MenuItem>
        </Stack>
      </Menu>
    </nav>
  );
}
