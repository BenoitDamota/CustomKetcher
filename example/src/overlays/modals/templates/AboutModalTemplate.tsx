import React from 'react';
import { DialogContentText } from '@mui/material';

interface Props {
  onClose: () => void;
}

const AboutModalTemplate: React.FC<Props> = () => {
  return (
    <>
      <DialogContentText>
        <strong>Name:</strong> PredictionRMN
        <br />
        <strong>Version:</strong> 1.0.0
        <br />
        <strong>Creator:</strong> Leria
        <br />
        <br />
        <strong>GitHub:</strong>{' '}
        <a
          href="https://github.com/KreeZeG123/PredictionRMN"
          target="_blank"
          rel="noopener noreferrer"
        >
          KreeZeG123/PredictionRMN
        </a>
        <br />
        <strong>Technologies:</strong> React, Ketcher, Plotly, Python, Flask,
        RDKit, SciPy, Jcamp, Waitress
        <br />
        <br />
        <strong>Description:</strong> PredictionRMN is an application for
        visualizing and predicting NMR spectra from a sketch for molecular
        analysis.
      </DialogContentText>
    </>
  );
};

export default AboutModalTemplate;
