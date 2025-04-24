import { useState } from 'react';
import logoIMG from '../../assets/logo.png';
import InputBarSMILES from './InputBarSmiles';
import { useAppContext } from '../../context/AppContext';

export default function Toolbar() {
  const appCtx = useAppContext();

  const [inputSmilesBar, setInputSmilesBar] = useState('');

  function handlePrediction() {
    if (inputSmilesBar) {
      // eslint-disable-next-line no-alert
      const conf = confirm(
        'Une molécule est renseignée dans la barre de SMILES. Souhaitez-vous lancer la prédiction à partir de celle-ci ?',
      );

      if (conf) {
        // eslint-disable-next-line no-alert
        alert('Lancement de la prédiction avec : ' + inputSmilesBar);
      }
    } else {
      if (window.ketcher) {
        window.ketcher.getSmiles(false).then((SMILES) => {
          if (SMILES) {
            // eslint-disable-next-line no-alert
            alert('Lancement de la prédiction sur : ' + SMILES);
          } else {
            // eslint-disable-next-line no-alert
            alert("Aucune molécule n'est déssinée");
          }
        });
      } else {
        // eslint-disable-next-line no-alert
        alert('Ketcher n’est pas disponible.');
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  function handleLoad() {
    // eslint-disable-next-line no-alert
    alert('Load');
  }
  function handleExport() {
    // eslint-disable-next-line no-alert
    alert('Export');
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
            onClick={() => {
              // eslint-disable-next-line no-alert
              alert('save');
            }}
            className="material-symbols-outlined"
          >
            save_as
          </button>
          <button
            title="Export"
            className="material-symbols-outlined"
            onClick={() => handleExport}
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
          onClick={() => appCtx.openModal('PredictionSettings')}
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
          onClick={() => appCtx.openModal('GeneralSettings')}
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
          onClick={() => appCtx.openModal('About')}
          className="material-symbols-outlined"
        >
          info
        </button>
      </div>
    </nav>
  );
}
