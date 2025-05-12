import React, { useState } from 'react';
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
import { startPrediction } from '../../utils/PredictionUtils';
import { saveGeneralSettings } from '../../utils/SettingsUtils';
import DontShowAgainPartial from '../../overlays/dialogs/partials/DontShowAgainPartial';

const Toolbar: React.FC = () => {
  const {
    openConfirm,
    openModal,
    generalSettings,
    setSnackbarMessages,
    predictionParameters,
    tabs,
    newTab,
    clearActiveTab,
  } = useAppContext();

  const isBelow850 = useMediaQuery('(max-width:850px)');
  const isBelow700 = useMediaQuery('(max-width:700px)');

  const [anchorElLoad, setAnchorElLoad] = useState<null | HTMLElement>(null);
  const [anchorElSettings, setAnchorElSettings] = useState<null | HTMLElement>(
    null,
  );

  const openLoadMenu = Boolean(anchorElLoad);
  const openSettingsMenu = Boolean(anchorElSettings);

  const [inputSmilesBar, setInputSmilesBar] = useState('');

  const hideTabBarWhenSingleTab =
    (generalSettings
      .find((cat) => cat.settingsCategoryName === 'General')
      ?.settings.find((setting) => setting.key === 'hideTabBarWhenSingleTab')
      ?.value as boolean) || false;

  function handlePrediction() {
    if (inputSmilesBar) {
      const confirmOnInputSMILES = generalSettings
        .find((category) => category.settingsCategoryName === 'General')
        ?.settings.find((setting) => setting.key === 'confirmOnInputSMILES');
      if (
        confirmOnInputSMILES !== undefined &&
        confirmOnInputSMILES.value === true
      ) {
        openConfirm.current(
          'Confirmation',
          'The input bar contains a SMILES.\n\nAre you sure you want to start the prediction based on this molecule?',
          () => {
            saveGeneralSettings(generalSettings);

            startPrediction(
              predictionParameters,
              setSnackbarMessages,
              inputSmilesBar,
            ).then((predResult) => {
              if (!predResult) return;

              newTab({
                smiles: predResult.smiles,
                spectrum: predResult.spectrum,
              });
            });
          },
          <DontShowAgainPartial
            settingsCategory="General"
            settingsKey={'confirmOnInputSMILES'}
          />,
        );
      } else {
        startPrediction(
          predictionParameters,
          setSnackbarMessages,
          inputSmilesBar,
        ).then((predResult) => {
          if (!predResult) return;
          if (!window.ketcher) return;

          newTab({
            smiles: predResult.smiles,
            spectrum: predResult.spectrum,
          });
        });
      }
    } else {
      startPrediction(predictionParameters, setSnackbarMessages).then(
        (predResult) => {
          if (!predResult) return;
          if (!window.ketcher) return;

          newTab({
            smiles: predResult.smiles,
            spectrum: predResult.spectrum,
          });
        },
      );
    }
  }

  const handleClearProject = () => {
    const confirmOnClear = generalSettings
      .find((category) => category.settingsCategoryName === 'General')
      ?.settings.find((setting) => setting.key === 'confirmOnClear');
    if (confirmOnClear !== undefined && confirmOnClear.value === true) {
      openConfirm.current(
        'Confirmation',
        'This action will permanently delete all molecule sketches and spectrum data from the current tab.\n\nAre you sure you want to proceed?',
        () => {
          if (!window.ketcher) {
            setSnackbarMessages({
              severity: 'error',
              message: 'Failed to clear project: Ketcher instance not found.',
            });
            return;
          }

          window.ketcher.editor.clear();
          clearActiveTab();

          setSnackbarMessages({
            severity: 'success',
            message: 'Successfully cleared the current project',
          });
        },
        <DontShowAgainPartial
          settingsCategory="General"
          settingsKey="confirmOnClear"
        />,
      );
    } else {
      if (!window.ketcher) {
        setSnackbarMessages({
          severity: 'error',
          message: 'Failed to clear project: Ketcher instance not found.',
        });
        return;
      }

      window.ketcher.editor.clear();
      clearActiveTab();

      setSnackbarMessages({
        severity: 'success',
        message: 'Successfully cleared the current project',
      });
    }
  };

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
        borderBottom:
          hideTabBarWhenSingleTab && tabs.current.length <= 1
            ? 'solid #525252 3px'
            : 'none',
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
              alt="logo"
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
              title="Open Project"
              className="material-symbols-outlined"
              onClick={() => openModal('OpenProject')}
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
                title="Clear Project"
                onClick={handleClearProject}
                className="material-symbols-outlined"
              >
                scan_delete
              </button>
              <button
                title="Export Project"
                onClick={() => openModal('ExportProject')}
                className="material-symbols-outlined"
              >
                file_export
              </button>
            </>
          )}
        </div>
      </div>
      <Menu
        anchorEl={anchorElLoad}
        open={openLoadMenu}
        onClose={() => setAnchorElLoad(null)}
      >
        <Stack direction="column" spacing={1} padding={1}>
          <MenuItem
            onClick={handleClearProject}
            title="Clear Project"
            sx={{
              justifyContent: 'center',
              '&:hover': {
                color: '#188794',
              },
            }}
          >
            <span className="material-symbols-outlined">scan_delete</span>
          </MenuItem>
          <MenuItem
            onClick={() => openModal('ExportProject')}
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
          title="Launch Prediction"
          className="material-symbols-outlined"
          onClick={() => handlePrediction()}
        >
          send
        </button>
        <InputBarSMILES input={inputSmilesBar} setInput={setInputSmilesBar} />
        <button
          title="Prediction Parameters"
          onClick={() => openModal('PredictionParameters')}
          className="material-symbols-outlined"
        >
          manufacturing
        </button>
      </div>

      {/* Right Controls */}
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
              title="About"
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
};

export default Toolbar;
