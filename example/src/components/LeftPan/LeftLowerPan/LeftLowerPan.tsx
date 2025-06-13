import React, { useMemo, useState } from 'react';
import MinimizeButton from '../../Buttons/MinimizeButton/MinimizeButton';
import PeaksInfosTable from './PeaksInfosTable';
import {
  MIN_HEIGHT_LEFT_LOWER_PAN,
  NAVBAR_HEIGHT,
  TABBAR_HEIGHT,
} from '../../ResizableLayout';
import { PeaksInfosData } from '../../../types/PeaksInfos';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useAppContext } from '../../../context/AppContext';
import { NMRType } from '../../../types/metadataNRM';

const TOOLBAR_HEIGHT = 36;

interface Props {
  isLeftLowerPanReduced: boolean;
  minimizeLeftLowerPan: () => void;
  leftUpperHeight: number;
}

const LeftLowerPan: React.FC<Props> = ({
  isLeftLowerPanReduced,
  minimizeLeftLowerPan,
  leftUpperHeight,
}) => {
  const { tabs, activeTab, renderVersion } = useAppContext();

  const [isDialogOpen, setDialogOpen] = useState(false);

  const peaksInfos = useMemo(() => {
    return (tabs.current.find((tab) => tab.id === activeTab.current)
      ?.peaksInfos || []) as PeaksInfosData;
    // Use the renderVersion to detect the rerender between tabs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderVersion]);

  const nucleusType = useMemo(() => {
    return (tabs.current.find((tab) => tab.id === activeTab.current)?.metadata
      .nucleusType || 'Unknown') as NMRType;
    // Use the renderVersion to detect the rerender between tabs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderVersion]);

  const nmrString = useMemo(() => {
    let atomLetter = '?';
    switch (nucleusType) {
      case '1H':
        atomLetter = 'H';
        break;
      case '13C':
        atomLetter = 'C';
        break;
      default:
        atomLetter = '?';
        break;
    }

    const peaks = peaksInfos.map((peak) => {
      const delta = typeof peak.delta === 'number' ? peak.delta.toFixed(3) : '';

      const mult = peak.multiplicity || '';
      const jVals =
        peak.coupling && peak.coupling.length > 0
          ? `J = ${peak.coupling
              .map((num) => (typeof num === 'number' ? num.toFixed(3) : num))
              .join(', ')} Hz`
          : '';

      const nH =
        typeof peak.nbAtoms === 'number'
          ? `${peak.nbAtoms.toFixed(0)}${atomLetter}`
          : `?${atomLetter}`;

      const infos = [nH, mult, jVals].filter(Boolean).join(', ');

      return `${delta} (${infos})`;
    });

    return peaks.length !== 0
      ? `${nucleusType} NMR: δ ${peaks.join(', ')}.`
      : 'No data';
  }, [nucleusType, peaksInfos]);

  const maxHeightTab =
    window.innerHeight -
    NAVBAR_HEIGHT -
    TABBAR_HEIGHT -
    TOOLBAR_HEIGHT -
    leftUpperHeight;
  console.log({ maxHeightTab });

  return (
    <div
      style={{
        display: isLeftLowerPanReduced ? 'none' : 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: MIN_HEIGHT_LEFT_LOWER_PAN,
        backgroundColor: '#FFF',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: '0',
          height: TOOLBAR_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: '16px',
          paddingTop: '2px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 5px rgba(103, 104, 132, 0.15)',
          borderBottom: '3px solid #525252',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <p>
            Peaks infos table
            {nucleusType !== 'Unknown' ? ` (${nucleusType} NMR)` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            title="Afficher Inline NMR"
            className="material-symbols-outlined hover-primary"
            style={{
              transition: 'color 0.2s ease',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => setDialogOpen(true)}
          >
            description
          </button>
          <MinimizeButton minimize={minimizeLeftLowerPan} />
        </div>
      </div>

      <div
        style={{
          overflowY: 'auto',
          maxHeight: maxHeightTab,
        }}
      >
        <PeaksInfosTable tableData={peaksInfos} />
      </div>

      <Dialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Inline NMR Notation</DialogTitle>
        <DialogContent>
          <p style={{ whiteSpace: 'pre-line' }}>{nmrString}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeftLowerPan;
