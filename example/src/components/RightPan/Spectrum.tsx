import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';
import MinimizeButton from './MinimizeRightPanButton';
import { useAppContext } from '../../context/AppContext';
import { SpectrumDataPoint } from '../../types/SpectrumDataType';
import AutoZoomOnRegionButton from './AutomZoomOnRegionButton';
import { FormControl, MenuItem, Select } from '@mui/material';
import './Spectrum.module.css';

const customButtonsDivStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '16px',
  gap: '4px',
};

const fullWidthAndHeightStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

interface PlotlyHTMLElementWithFullLayout extends Plotly.PlotlyHTMLElement {
  _fullLayout: Plotly.Layout & {
    xaxis: {
      _offset: number;
      _length: number;
      p2c: (px: number) => number;
    };
    yaxis: {
      _offset: number;
      _length: number;
      p2c: (px: number) => number;
    };
  };
}

interface RelayoutEvent {
  'xaxis.range[0]'?: number;
  'xaxis.range[1]'?: number;
  'xaxis.autorange'?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type SpectrumRegion = {
  regionId: string;
  atomIds: number[];
  ppmMin: number;
  ppmMax: number;
  intensityMax: number;
  highestPpm: number;
};

interface Props {
  minimizeRightPan: () => void;
}

const Spectrum: React.FC<Props> = ({ minimizeRightPan }) => {
  const {
    openAlert,
    plotlyRef,
    setSnackbarMessages,
    tabs,
    activeTab,
    renderVersion,
  } = useAppContext();

  const [modebarContainerIsReady, setIsModebarContainerReady] = useState(false);
  const [regions, setRegions] = useState<SpectrumRegion[]>([]);
  const [autoZoomOnRegion, setAutoZoomOnRegion] = useState<boolean>(false);
  const [showPeaksLabels, setShowPeaksLabels] = useState<
    'none' | 'atomsIds' | 'ppm'
  >('atomsIds');

  const containerRef = useRef<HTMLDivElement>(null);

  const spectrumData = useMemo(() => {
    return (tabs.current.find((tab) => tab.id === activeTab.current)
      ?.spectrum || []) as SpectrumDataPoint[];
    // Use the renderVersion to detect the rerender between tabs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tabs, renderVersion]);

  const [layout, _] = useState({
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

  useEffect(() => {
    const grouped = new Map<string, SpectrumDataPoint[]>();

    spectrumData.forEach((point: SpectrumDataPoint) => {
      const key = point.atomID?.sort((a, b) => a - b).join(',') || '';
      if (!key) return;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(point);
    });

    const regionList: SpectrumRegion[] = [];
    grouped.forEach((group: SpectrumDataPoint[], index: string) => {
      const ppms = group.map((p) => p.ppm);
      const intensities = group.map((p) => p.intensity);

      // Find the ppm associted with the maximal intenisty of this peaks
      const maxIntensity = Math.max(...intensities);
      const indexOfMax = intensities.findIndex((i) => i === maxIntensity);
      const highestPpm = ppms[indexOfMax];

      regionList.push({
        regionId: index,
        atomIds: group[0].atomID,
        ppmMin: Math.min(...ppms),
        ppmMax: Math.max(...ppms),
        intensityMax: maxIntensity,
        highestPpm,
      });
    });

    setRegions(regionList);
  }, [spectrumData]);

  // Observer that detect when the modebar-container is ready for modification
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const modebarContainer = document.querySelector('.modebar-container');
      if (modebarContainer) {
        setIsModebarContainerReady(true);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handlePlotReady = useCallback(
    (_: unknown, graphDiv: Plotly.PlotlyHTMLElement | null) => {
      plotlyRef.current = graphDiv;
    },
    [plotlyRef],
  );

  // Detection of clicks everywhere on the pyplot instead of the default click on points only
  useEffect(() => {
    const plotDiv = containerRef.current?.querySelector(
      '.js-plotly-plot',
    ) as HTMLDivElement | null;

    if (!plotDiv) {
      console.warn('Plotly div not ready');
      return;
    }

    const handleClick = (e: MouseEvent) => {
      if (!plotlyRef.current) return;

      const bbox = plotDiv.getBoundingClientRect();
      const xPx = e.clientX - bbox.left;
      const yPx = e.clientY - bbox.top;

      const fullLayout = (plotlyRef.current as PlotlyHTMLElementWithFullLayout)
        ._fullLayout;

      const xaxis = fullLayout.xaxis;
      const yaxis = fullLayout.yaxis;

      const inPlotArea =
        xPx >= xaxis._offset &&
        xPx <= xaxis._offset + xaxis._length &&
        yPx >= yaxis._offset &&
        yPx <= yaxis._offset + yaxis._length;

      if (inPlotArea) {
        const xCoord = xaxis.p2c(xPx - xaxis._offset);

        // Find the region with the nearest center (x only) of the click
        let closestRegion: SpectrumRegion | null = null;
        let closestDistance = Infinity;

        for (const region of regions) {
          const regionCenter = (region.ppmMin + region.ppmMax) / 2;
          const distance = Math.abs(xCoord - regionCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestRegion = region;
          }
        }

        if (closestRegion) {
          const ketcher = window.ketcher;

          if (!ketcher) {
            setSnackbarMessages({
              severity: 'error',
              message:
                'Ketcher is not available, the associated atoms will not be shown in the editor',
            });
          } else {
            ketcher
              .layout()
              .then(() => {
                // Delay to let ketcher render the layout action before selecting the atoms
                setTimeout(() => {
                  if (!closestRegion) return;
                  ketcher.editor.selection({ atoms: closestRegion.atomIds });
                }, 200);
              })
              .catch((error) => {
                console.error('Error during Ketcher layout:', error);
                setSnackbarMessages({
                  severity: 'error',
                  message:
                    'An error occurred while trying to layout the molecule',
                });
              });
          }

          if (autoZoomOnRegion) {
            const margin = 0.025;

            Plotly.relayout(plotlyRef.current, {
              xaxis: {
                range: [
                  closestRegion.ppmMax + margin,
                  closestRegion.ppmMin - margin,
                ],
              },
              yaxis: {
                range: [
                  0,
                  closestRegion.intensityMax +
                    closestRegion.intensityMax * 0.05,
                ],
              },
            });
          }
        } else {
          console.log('Spectrum : No closest region found');
        }
      }
    };

    plotDiv.addEventListener('click', handleClick);

    return () => {
      plotDiv.removeEventListener('click', handleClick);
    };
  }, [autoZoomOnRegion, openAlert, plotlyRef, regions, setSnackbarMessages]);

  // Build region lookup for mousemove highlight
  const buildRegionLookup = useCallback((regions: SpectrumRegion[]) => {
    if (regions.length === 0) return [];
    const sorted = [...regions].sort(
      (a, b) => (a.ppmMin + a.ppmMax) / 2 - (b.ppmMin + b.ppmMax) / 2,
    );
    return sorted.map((r, idx) => {
      const center = (r.ppmMin + r.ppmMax) / 2;
      const prevCenter =
        idx > 0
          ? (sorted[idx - 1].ppmMin + sorted[idx - 1].ppmMax) / 2
          : -Infinity;
      const nextCenter =
        idx < sorted.length - 1
          ? (sorted[idx + 1].ppmMin + sorted[idx + 1].ppmMax) / 2
          : Infinity;
      return {
        start: idx === 0 ? -Infinity : (center + prevCenter) / 2,
        end: idx === sorted.length - 1 ? Infinity : (center + nextCenter) / 2,
        regionId: r.regionId,
      };
    });
  }, []);

  const [regionLookup, setRegionLookup] = useState<
    { start: number; end: number; regionId: string }[]
  >([]);

  useEffect(() => {
    setRegionLookup(buildRegionLookup(regions));
  }, [buildRegionLookup, regions]);

  useEffect(() => {
    const plotEl = containerRef.current?.querySelector(
      '.js-plotly-plot',
    ) as HTMLDivElement | null;
    if (!plotEl || !plotlyRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = plotEl.getBoundingClientRect();
      const xPx = e.clientX - rect.left;
      const yPx = e.clientY - rect.top;

      if (!plotlyRef.current) return;

      const { xaxis, yaxis } = plotlyRef.current._fullLayout;
      const inPlot =
        xPx >= xaxis._offset &&
        xPx <= xaxis._offset + xaxis._length &&
        yPx >= yaxis._offset &&
        yPx <= yaxis._offset + yaxis._length;

      if (!inPlot) {
        return;
      }

      const xValue = xaxis.p2c(xPx - xaxis._offset);

      let closestRegionId: string | null = null;

      for (const { start, end, regionId } of regionLookup) {
        if (xValue > start && xValue <= end) {
          closestRegionId = regionId;
          break;
        }
      }

      if (closestRegionId) {
        const closestRegion = regions.find(
          (region) => region.regionId === closestRegionId,
        );

        if (closestRegion) {
          Plotly.relayout(plotlyRef.current, {
            shapes: [
              {
                type: 'rect',
                xref: 'x',
                yref: 'paper',
                x0: closestRegion.ppmMin,
                x1: closestRegion.ppmMax,
                y0: 0,
                y1: 1,
                line: { color: '#FFFF7F', width: 4 },
                fillcolor: '#FFFF7F',
                layer: 'below',
              },
            ],
          });
        }
      }
    };

    plotEl.addEventListener('mousemove', handleMouseMove);

    const handleMouseLeave = () => {
      if (!plotlyRef.current) return;

      Plotly.relayout(plotlyRef.current, {
        shapes: [],
      });
    };

    plotEl.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      plotEl.removeEventListener('mousemove', handleMouseMove);
      plotEl.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [plotlyRef, regionLookup, regions]);

  const handleRelayout = useCallback(
    (event: RelayoutEvent) => {
      const range0 = event['xaxis.range[0]'];
      const range1 = event['xaxis.range[1]'];

      if (
        range0 !== undefined &&
        range1 !== undefined &&
        range0 < range1 &&
        plotlyRef.current
      ) {
        Plotly.relayout(plotlyRef.current, {
          'xaxis.range': [range1, range0],
        });
      }
    },
    [plotlyRef],
  );

  const truncateDecimalsStr = useCallback((num: number, digits: number) => {
    const [intPart, decPart = ''] = String(num).split('.');
    const truncatedDec = decPart.slice(0, digits).padEnd(digits, '0');
    return `${intPart}.${truncatedDec}`;
  }, []);

  return (
    <div ref={containerRef} style={fullWidthAndHeightStyle}>
      <Plot
        data={[
          {
            x: spectrumData.map((d: SpectrumDataPoint) => d.ppm),
            y: spectrumData.map((d: SpectrumDataPoint) => d.intensity),
            type: 'scatter',
            mode: 'lines',
            line: { color: '#167782' },
            name: 'NMR Spectrum',
          },
        ]}
        layout={{
          ...layout,
          annotations:
            showPeaksLabels === 'atomsIds'
              ? regions.map((region) => {
                  const text = region.atomIds
                    .map((id) => id.toLocaleString())
                    .join('<br />');

                  const lines = region.atomIds.length;
                  const textHeight = lines * 14;

                  return {
                    x: (region.ppmMin + region.ppmMax) / 2,
                    y: region.intensityMax,
                    yshift: textHeight,
                    text,
                    showarrow: false,
                    font: { size: 14, color: '#000000' },
                    align: 'center',
                  };
                })
              : showPeaksLabels === 'ppm'
              ? regions.map((region) => ({
                  x: (region.ppmMin + region.ppmMax) / 2,
                  y: region.intensityMax,
                  yshift: 14,
                  text: `${truncateDecimalsStr(region.highestPpm, 3)}`,
                  showarrow: false,
                  font: { size: 14, color: '#000000' },
                  align: 'center',
                }))
              : [],
        }}
        config={{
          displayModeBar: true,
          displaylogo: false,
          responsive: true,
          modeBarButtonsToRemove: ['resetScale2d'],
        }}
        style={fullWidthAndHeightStyle}
        useResizeHandler={true}
        onInitialized={handlePlotReady}
        onUpdate={handlePlotReady}
        onRelayout={handleRelayout}
      />

      {modebarContainerIsReady &&
        ReactDOM.createPortal(
          <div style={customButtonsDivStyle}>
            <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
              <Select
                labelId="demo-simple-select-filled-label"
                id="demo-simple-select-filled"
                value={showPeaksLabels}
                onChange={(e) => {
                  const value = e.target.value as 'none' | 'atomsIds' | 'ppm';
                  setShowPeaksLabels(value);
                }}
              >
                <MenuItem value="none">No Labels</MenuItem>
                <MenuItem value="atomsIds">Atoms Ids</MenuItem>
                <MenuItem value="ppm">PPM</MenuItem>
              </Select>
            </FormControl>
            <AutoZoomOnRegionButton
              autoZoomOnRegion={autoZoomOnRegion}
              setAutoZoomOnRegion={setAutoZoomOnRegion}
            />
            <MinimizeButton minimizeRightPan={minimizeRightPan} />
          </div>,
          document.querySelector('.modebar-container') as Element,
        )}
    </div>
  );
};

export default Spectrum;
