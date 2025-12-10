import './main.css';

function Editor({ label, value, onChange }) {
  return (
    <div className="editor-container">
      <h2 className="editor-title">{label}</h2>
      <textarea
        className="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default Editor;
