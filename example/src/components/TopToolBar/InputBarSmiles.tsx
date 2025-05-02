import React from 'react';

interface Props {
  input: string;
  setInput: (arg0: string) => void;
}

const Spectrum: React.FC<Props> = ({ input, setInput }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && input && input.trim()) {
      if (window.ketcher) {
        window.ketcher.setMolecule(input.trim());
      } else {
        console.error('Ketcher is not ready');
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '2px 5px',
        width: '100%',
        height: '30px',
        maxWidth: '500px',
        backgroundColor: '#fff',
      }}
    >
      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a SMILES"
        style={{
          flexGrow: 1,
          border: 'none',
          outline: 'none',
          fontSize: '16px',
          padding: '8px',
          backgroundColor: 'transparent',
        }}
      />

      {/* Clear icon */}
      <button
        title="Clear SMILES"
        onClick={() => setInput('')}
        className="material-symbols-outlined hover-red"
        style={{
          visibility: input ? 'visible' : 'hidden',
          marginLeft: '10px',
          fontSize: '24px',
          cursor: 'pointer',
          color: '#757575',
        }}
      >
        close
      </button>
    </div>
  );
};

export default Spectrum;
