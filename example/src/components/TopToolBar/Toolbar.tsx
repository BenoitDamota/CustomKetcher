import { useState } from 'react';
import logoIMG from '../../assets/logo.png';
import InputBarSMILES from './InputBarSmiles';
import { useAppContext } from '../../context/AppContext';

export default function Toolbar() {
  const { openAlert, openConfirm, openModal } = useAppContext();

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
        <div style={{ marginRight: '40px' }}>
          <img
            style={{ display: 'block', height: '40px', width: 'auto' }}
            src={logoIMG}
            alt="vite img"
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <button
            title="Open File"
            className="material-symbols-outlined"
            onClick={() => handleLoad()}
          >
            file_open
          </button>
          <button
            title="Save As"
            onClick={() => handleSaveAs()}
            className="material-symbols-outlined"
          >
            save_as
          </button>
          <button
            title="Export"
            className="material-symbols-outlined"
            onClick={() => handleExport()}
          >
            file_export
          </button>
        </div>
      </div>

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
        <button
          title="General Settings"
          onClick={() => openModal('GeneralSettings')}
          className="material-symbols-outlined"
        >
          settings
        </button>
        <button
          title="Visit Help Documentation"
          onClick={() =>
            window.open('https://github.com/KreeZeG123/PredictionRMN', '_blank')
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
      </div>
    </nav>
  );
}
