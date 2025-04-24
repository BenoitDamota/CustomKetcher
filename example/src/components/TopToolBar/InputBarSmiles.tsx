export default function InputBarSMILES(props: {
  input: string | number | readonly string[] | undefined;
  setInput: (arg0: string) => void;
}) {
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
        value={props.input}
        onChange={(e) => props.setInput(e.target.value)}
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
        onClick={() => props.setInput('')}
        className="material-symbols-outlined hover-red"
        style={{
          visibility: props.input ? 'visible' : 'hidden',
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
}
