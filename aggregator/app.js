const express = require('express');
const { mergePatches } = require('./lib/mergeEngine');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ service: 'aggregator', status: 'ok' });
});

app.post('/merge', (req, res) => {
  try {
    const { baseline, patches, conflictWindowMs } = req.body || {};

    if (!baseline || !Array.isArray(patches)) {
      return res.status(400).json({
        error: 'Request body must contain baseline (object) and patches (array)',
      });
    }

    const result = mergePatches(
      baseline,
      patches,
      typeof conflictWindowMs === 'number' ? conflictWindowMs : undefined
    );

    res.json(result);
  } catch (err) {
    console.error('Error in /merge:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
