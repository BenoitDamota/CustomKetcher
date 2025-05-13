import { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';
import MinimizeButton from './MinimizeRightPanButton';
import { useAppContext } from '../../context/AppContext';
import { SpectrumDataPoint } from '../../types/SpectrumDataType';
import AutoZoomOnRegionButton from './AutomZoomOnRegionButton';
import { FormControl, MenuItem, Select } from '@mui/material';

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
    return (tabs.current.find((tab) => tab.id === activeTab)?.spectrum ||
      []) as SpectrumDataPoint[];
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
    grouped.forEach((group, index) => {
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

  const handlePlotReady = (
    _: unknown,
    graphDiv: Plotly.PlotlyHTMLElement | null,
  ) => {
    plotlyRef.current = graphDiv;
  };

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
                    'An error occurred while trying to layout the molecule.',
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

  const buildRegionLookup = (
    regions: SpectrumRegion[],
  ): { start: number; end: number; regionId: string }[] => {
    const sortedRegions = regions.sort((a, b) => {
      const centerA = (a.ppmMin + a.ppmMax) / 2;
      const centerB = (b.ppmMin + b.ppmMax) / 2;
      return centerA - centerB;
    });

    const lookup: { start: number; end: number; regionId: string }[] = [];

    sortedRegions.forEach((r, idx) => {
      let startValue: number;
      let endValue: number;

      let centerA: number;
      let centerB: number;

      if (idx === 0) {
        startValue = -Infinity;
      } else {
        const prevRegion = sortedRegions[idx - 1];
        centerA = (r.ppmMin + r.ppmMax) / 2;
        centerB = (prevRegion.ppmMin + prevRegion.ppmMax) / 2;
        startValue = (centerA + centerB) / 2;
      }

      if (idx === sortedRegions.length - 1) {
        endValue = Infinity;
      } else {
        const nextRegion = sortedRegions[idx + 1];
        centerA = (r.ppmMin + r.ppmMax) / 2;
        centerB = (nextRegion.ppmMin + nextRegion.ppmMax) / 2;
        endValue = (centerA + centerB) / 2;
      }

      lookup.push({
        start: startValue,
        end: endValue,
        regionId: r.regionId,
      });
    });

    return lookup;
  };

  const [regionLookup, setRegionLookup] = useState<
    { start: number; end: number; regionId: string }[]
  >([]);

  useEffect(() => {
    setRegionLookup(buildRegionLookup(regions));
  }, [regions]);

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

  const handleRelayout = (event: RelayoutEvent) => {
    const range0 = event['xaxis.range[0]'];
    const range1 = event['xaxis.range[1]'];

    const plotDiv = plotlyRef.current;

    if (!plotDiv) return;

    if (range0 !== undefined && range1 !== undefined && range0 < range1) {
      Plotly.relayout(plotDiv, {
        'xaxis.range': [range1, range0],
      });
    }
  };

  return (
    <div ref={containerRef} style={{ height: '100%' }}>
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
                  text: `${region.ppmMax.toFixed(3)}`,
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
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        onInitialized={handlePlotReady}
        onUpdate={handlePlotReady}
        onRelayout={handleRelayout}
      />

      {modebarContainerIsReady &&
        ReactDOM.createPortal(
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '16px',
              gap: '4px',
            }}
          >
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

      {/* Custom UI style */}
      <style>{`
        .modebar-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 0px;
          height: 36px;
          background-color: #ffffff;
          box-shadow: 0px 2px 5px rgba(103, 104, 132, 0.15);
        }

        .js-plotly-plot .plotly .modebar {
          position: unset !important;
        }

        .js-plotly-plot .plotly .modebar .modebar-btn {
          font-size: 18px;
        }

        .js-plotly-plot .plotly .modebar .modebar-btn > svg > path {
          fill: #333 !important;
        }

        .js-plotly-plot .plotly .modebar .modebar-btn.active > svg > path,
        .js-plotly-plot .plotly .modebar .modebar-btn:hover > svg > path {
          fill: #167782 !important;
        }

        .js-plotly-plot .plotly .modebar .modebar-btn.active:hover > svg > path {
          filter: brightness(1.3);
        }

        /* Change the tooltip style so it match the global style */
        .plotly .modebar-btn[data-title]:hover::after {
          content: attr(data-title);
          background-color: rgb(255, 255, 255);  /* Fond clair avec transparence */
          color: #333;
          padding: 5px 10px;
          border-radius: 2px;
          border: 1px solid #333;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: none;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
        .plotly .modebar-btn[data-title]:hover::after {
          opacity: 1;
        }

        /* Change order so that the tooltip fit */
        .modebar {
          display: flex;
          flex-direction: row;
        }
        .modebar-group:nth-child(1) {
          order: 2;
        }
        .modebar-group:nth-child(2) {
          order: 1;
        }
        .modebar-group:nth-child(3) {
          order: 3;
        }
      `}</style>
    </div>
  );
};

export default Spectrum;
