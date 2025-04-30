/*
 * Type declarations for Plotly elements used in the app.
 * These help provide IDE support and suppress type warnings for Plotly-related code.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-use-before-define */
declare namespace Plotly {
  export interface PlotlyHTMLElement {
    _fullLayout: Layout & {
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

  export interface Layout {
    autosize: boolean;
    margin: {
      t: number;
      r: number;
      b: number;
      l: number;
    };
    responsive: boolean;
    xaxis: {
      title: string;
      autorange?: 'reversed' | 'normal';
    };
    yaxis: {
      title: string;
    };
    showlegend: boolean;
  }

  export interface Data {
    x: number[];
    y: number[];
    type: 'scatter' | 'bar' | 'line';
    mode: string;
    line?: {
      color: string;
    };
    name?: string;
    fill?: string;
    fillcolor?: string;
    hoverinfo?: string;
    customdata?: any[];
  }

  export interface Config {
    displayModeBar: boolean;
    displaylogo: boolean;
    responsive: boolean;
  }

  export function relayout(graphDiv: any, update: any): void;

  export function toImage(
    graphDiv: Plotly.PlotlyHTMLElement | null,
    options?: {
      format?: 'png' | 'jpeg' | 'webp' | 'svg';
      width?: number;
      height?: number;
      scale?: number;
      filename?: string;
    },
  ): Promise<string>;
}
