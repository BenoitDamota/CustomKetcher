// import { useApp } from "../AppContext";

import { useState } from 'react';
import logoIMG from '../assets/logo.png';
import InputBarSMILES from './InputBarSmiles';

export default function Toolbar() {
  const [inputSmilesBar, setInputSmilesBar] = useState('');

  //   const { ketcherRef, spectreRef } = useApp();

  //   const handlePrediction = async () => {
  //     const smile = ketcherRef.current.getSMILES();
  //     const prediction = await apiPrediction(smile);
  //     spectreRef.current.setData(prediction.x, prediction.y, prediction.z);
  //   };

  //   const handleLoad = async (file: any) => {
  //     const { spectre, molecules } = await loadFile(file);
  //     spectreRef.current.setData(spectre.x, spectre.y, spectre.z);
  //     ketcherRef.current.loadMolecules(molecules);
  //   };

  //   const handleExport = () => {
  //     const img1 = ketcherRef.current.exportImage();
  //     const img2 = spectreRef.current.exportImage();
  //     exportFile(img1, img2);
  //   };

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
      {/* Gauche */}
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
            className="material-symbols-outlined"
            onClick={() => handleLoad()}
          >
            file_open
          </button>
          <span className="material-symbols-outlined">save_as</span>
          <button
            className="material-symbols-outlined"
            onClick={() => handleExport}
          >
            file_export
          </button>
        </div>
      </div>

      {/* Milieu (centré absolument) */}
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
          className="material-symbols-outlined"
          onClick={() => handlePrediction()}
        >
          send
        </button>
        <InputBarSMILES input={inputSmilesBar} setInput={setInputSmilesBar} />
        <span className="material-symbols-outlined">manufacturing</span>
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
        <span className="material-symbols-outlined">settings</span>
        <span className="material-symbols-outlined">help</span>
        <span className="material-symbols-outlined">info</span>
      </div>
    </nav>
  );
}

// // Simulé pour l’exemple
// const apiPrediction = async (smile: string) => {
//   console.log("API Prediction for", smile);
//   return { x: [1, 2], y: [10, 20], z: [100, 200] };
// };

// const loadFile = async (file: any) => {
//   console.log("Load file", file);
//   return {
//     spectre: { x: [0], y: [1], z: [2] },
//     molecules: "moleculeData",
//   };
// };

// const exportFile = (img1: string, img2: string) => {
//   console.log("Exporting images:", img1, img2);
// };
