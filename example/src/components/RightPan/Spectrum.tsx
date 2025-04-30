import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';
import MinimizeButton from './MinimizeRightPanButton';
import { useAppContext } from '../../context/AppContext';
import { SpectrumDataPoint } from '../../types/SpectrumDataType';

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

export type SpectrumRegion = {
  atomIds: number[];
  ppmMin: number;
  ppmMax: number;
  intensityMax: number;
};

interface Props {
  minimizeRightPan: () => void;
}

const Spectrum: React.FC<Props> = ({ minimizeRightPan }) => {
  const { openAlert, spectrumData, plotlyRef } = useAppContext();

  const [isReady, setIsReady] = useState(false);
  const [regions, setRegions] = useState<SpectrumRegion[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const [layout, _] = useState({
    autosize: true,
    margin: { t: 50, r: 40, b: 40, l: 40 },
    responsive: true,
    xaxis: {
      title: 'ppm',
      autorange: 'reversed', // Axe ppm en décroissant
    },
    yaxis: {
      title: 'Intensity',
    },
    showlegend: false,
  });

  // Regrouper les données selon atomID
  useEffect(() => {
    const grouped = new Map<string, SpectrumDataPoint[]>();

    spectrumData.forEach((point: SpectrumDataPoint) => {
      const key = point.atomID?.sort((a, b) => a - b).join(',') || '';
      if (!key) return;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(point);
    });

    const regionList: SpectrumRegion[] = [];
    grouped.forEach((group) => {
      const ppms = group.map((p) => p.ppm);
      const intensities = group.map((p) => p.intensity);
      regionList.push({
        atomIds: group[0].atomID,
        ppmMin: Math.min(...ppms),
        ppmMax: Math.max(...ppms),
        intensityMax: Math.max(...intensities),
      });
    });

    setRegions(regionList);
  }, [spectrumData]);

  // Observer that detect when the modebar-container is ready for modification
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const modebarContainer = document.querySelector('.modebar-container');
      if (modebarContainer) {
        setIsReady(true);
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
        let closestRegion = null;
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
          openAlert.current(
            'Associated atoms',
            closestRegion.atomIds.join(','),
          );

          // Zoom on this region
          const margin = 0.5;

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
                closestRegion.intensityMax + closestRegion.intensityMax * 0.05,
              ],
            },
          });
        } else {
          openAlert.current('No region found', '');
        }
      }
    };

    plotDiv.addEventListener('click', handleClick);

    return () => {
      plotDiv.removeEventListener('click', handleClick);
    };
  }, [openAlert, plotlyRef, regions]);

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
          ...regions.map((region, i) => ({
            x: [region.ppmMin, region.ppmMax, region.ppmMax, region.ppmMin],
            y: [0, 0, region.intensityMax, region.intensityMax],
            type: 'scatter',
            fill: 'toself',
            fillcolor: `rgba(22, 119, 130, 0.2)`,
            line: { width: 0 },
            hoverinfo: 'skip',
            name: `Region ${i + 1}`,
            customdata: [region.atomIds],
            label: 'test',
          })),
        ]}
        layout={layout}
        config={{
          displayModeBar: true,
          displaylogo: false,
          responsive: true,
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        onInitialized={handlePlotReady}
        onUpdate={handlePlotReady}
      />

      {isReady &&
        ReactDOM.createPortal(
          <MinimizeButton minimizeRightPan={minimizeRightPan} />,
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
      `}</style>
    </div>
  );
};

export default Spectrum;
