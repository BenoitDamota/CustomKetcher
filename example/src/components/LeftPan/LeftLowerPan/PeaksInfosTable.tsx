import React, { useEffect, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { PeaksInfosData } from '../../../types/PeaksInfos';
import { useAppContext } from '../../../context/AppContext';

interface Props {
  tableData: PeaksInfosData;
}

const PeaksInfosTable: React.FC<Props> = ({ tableData }) => {
  const {
    setSnackbarMessages,
    spectrumInterfaceRef,
    registerPeaksInfosTableInterface,
  } = useAppContext();

  const [selectedAtoms, setSelectedAtoms] = useState<number[]>([]);

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // expose interface
  useEffect(() => {
    const api = {
      selectAtoms: (atoms: number[]) => {
        setSelectedAtoms(atoms);
      },
    };
    registerPeaksInfosTableInterface(api);
  }, [registerPeaksInfosTableInterface]);

  useEffect(() => {
    setSelectedAtoms([]);
  }, [tableData]);

  // Scroll vers la ligne visible quand les selectedAtoms changent
  useEffect(() => {
    if (!selectedAtoms.length) return;

    const indexToScroll = tableData.findIndex((row) =>
      row.assignement?.some((a) => selectedAtoms.includes(a)),
    );

    if (indexToScroll >= 0 && rowRefs.current[indexToScroll]) {
      rowRefs.current[indexToScroll]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedAtoms, tableData]);

  const handleRowClick = (assignments: number[]) => {
    setSelectedAtoms(assignments);

    spectrumInterfaceRef.current?.selectAtoms(assignments);

    const ketcher = window.ketcher;
    if (!ketcher) return;

    ketcher
      .layout()
      .then(() => {
        // Delay to let ketcher render the layout action before selecting the atoms
        setTimeout(() => {
          ketcher.editor.selection({ atoms: assignments });
        }, 200);
      })
      .catch((error) => {
        console.error('Error during Ketcher layout:', error);
        setSnackbarMessages({
          severity: 'error',
          message: 'An error occurred while trying to layout the molecule',
        });
      });
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 0,
      }}
    >
      <Table
        aria-label="peaks info table"
        sx={{
          '& .MuiTableHead-root': {
            '& .MuiTableCell-root': {
              backgroundColor: '#525252',
              color: '#fff',
              fontWeight: 'bold',
            },
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ borderRight: '1px solid #ccc' }}>
              Assignment
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid #ccc' }}>
              Delta (ppm)
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid #ccc' }}>
              Nb Atoms
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid #ccc' }}>Mult</TableCell>
            <TableCell>J (Hz)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                sx={{ borderBottom: 'none' }}
              >
                <Typography variant="body2" color="textSecondary">
                  No data available
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            tableData.map((infos, index) => {
              const isHighlighted = infos.assignement?.some((a) =>
                selectedAtoms.includes(a),
              );

              return (
                <TableRow
                  key={index}
                  ref={(el) => (rowRefs.current[index] = el)}
                  onClick={() => handleRowClick(infos.assignement || [])}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: isHighlighted
                      ? '#FFFF7F'
                      : index % 2 === 0
                      ? '#fff'
                      : '#f0f0f0',
                    '&:hover': {
                      '& td': {
                        color: '#167782',
                      },
                      filter: 'brightness(90%)',
                      transition: 'filter 0.2s ease, color 0.2s ease',
                    },
                  }}
                >
                  <TableCell sx={{ borderRight: '1px solid #ccc' }}>
                    {infos.assignement?.join(', ') || ''}
                  </TableCell>
                  <TableCell sx={{ borderRight: '1px solid #ccc' }}>
                    {typeof infos.delta === 'number'
                      ? infos.delta.toFixed(3)
                      : infos.delta || ''}
                  </TableCell>
                  <TableCell sx={{ borderRight: '1px solid #ccc' }}>
                    {infos.nbAtoms || ''}
                  </TableCell>
                  <TableCell sx={{ borderRight: '1px solid #ccc' }}>
                    {infos.multiplicity || ''}
                  </TableCell>
                  <TableCell>
                    {infos.coupling?.length
                      ? infos.coupling
                          .map((j) =>
                            typeof j === 'number' ? j.toFixed(2) : j,
                          )
                          .join(' ')
                      : ''}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PeaksInfosTable;
