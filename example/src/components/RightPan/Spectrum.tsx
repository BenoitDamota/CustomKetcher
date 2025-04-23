import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';
import MinimizeButton from './MinimizeRightPanButton';

const Spectrum = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const modebarContainer = document.querySelector('.modebar-container');
      if (modebarContainer) {
        setIsReady(true);
        observer.disconnect(); // Stoppe l'observation une fois que l'élément est trouvé
      }
    });

    // Démarre l'observation sur tout le body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div style={{ height: '100%' }}>
      <Plot
        data={[
          {
            x: [1, 2, 3, 4],
            y: [10, 15, 13, 17],
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'red' },
          },
        ]}
        layout={{
          autosize: true,
          margin: { t: 50, r: 40, b: 40, l: 40 },
          responsive: true,
        }}
        config={{
          displayModeBar: true, // Active la mode bar
          displaylogo: false, // Cache le logo Plotly
          responsive: true,
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />

      {isReady &&
        ReactDOM.createPortal(
          <MinimizeButton />,
          document.querySelector('.modebar-container') as Element,
        )}

      <style>{`
        /* New style for Plotly modebar */
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

        .js-plotly-plot .plotly .modebar .modebar-btn > svg > path{
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
