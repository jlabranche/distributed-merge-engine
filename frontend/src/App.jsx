import { useState } from 'react';
import './styles/global.css';
import './styles/layout.css';

import Editor from './components/editor';
import Result from './components/result';

const DEFAULT_BASELINE = {
  id: 1,
  mood: 'Neutral',
  notes: [],
};

const DEFAULT_PATCHES = [
  { timestamp: 600, deviceId: 'alice', patch: { mood: 'Happy' } },
  { timestamp: 605, deviceId: 'bob', patch: { mood: 'Sad' } },
  { timestamp: 602, deviceId: 'alice', patch: { notes: ['Great session'] } },
  { timestamp: 606, deviceId: 'bob', patch: { notes: ['Client seemed tired'] } },
];

function App() {
  const [baselineText, setBaselineText] = useState(
    JSON.stringify(DEFAULT_BASELINE, null, 2),
  );
  const [patchesText, setPatchesText] = useState(
    JSON.stringify(DEFAULT_PATCHES, null, 2),
  );
  const [conflictWindowMs, setConflictWindowMs] = useState('6');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setResult(null);

    let baseline;
    let patches;

    try {
      baseline = JSON.parse(baselineText);
    } catch (e) {
      setError('[Baseline] Invalid JSON: ' + e.message);
      return;
    }

    try {
      patches = JSON.parse(patchesText);
    } catch (e) {
      setError('[Patches] Invalid JSON: ' + e.message);
      return;
    }

    if (!Array.isArray(patches)) {
      setError('"patches" must be an array.');
      return;
    }

    const body = { baseline, patches };
    const cw = Number(conflictWindowMs);
    if (cw > 0) {
      body.conflictWindowMs = cw;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Server error');
      } else {
        setResult(json);
      }
    } catch (err) {
      setError('Network failure: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="app-root">
      <h1>Distributed Conflict Resolution Demo</h1>

      <div className="editor-grid">
        <Editor
          label="Baseline"
          value={baselineText}
          onChange={setBaselineText}
        />
        <Editor
          label="Patches"
          value={patchesText}
          onChange={setPatchesText}
        />
      </div>

      <div className="conflict-window">
        <label>
          Conflict window (ms):{' '}
          <input
            type="number"
            value={conflictWindowMs}
            onChange={(e) => setConflictWindowMs(e.target.value)}
          />
        </label>

        <div>
          <button
            className="merge-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Merging…' : 'Send to /merge'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">Error: {error}</div>}

      {result && <Result data={result} />}
    </div>
  );
}

export default App;
