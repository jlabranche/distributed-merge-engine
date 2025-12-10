// gateway/app.js
//
// Gateway = public-facing API edge.
// - Terminates CORS for the frontend
// - Validates incoming payload shape
// - Enforces an optional API key
// - Forwards valid requests to the internal Aggregator service
// - Central place for logging / observability / future auth

const express = require('express');
const app = express();

const AGGREGATOR_URL = process.env.AGGREGATOR_URL || 'http://localhost:4000';
const REQUIRED_API_KEY = process.env.API_KEY || null;

// Parse JSON with a sane size limit so one client cannot blow up the service.
app.use(express.json({ limit: '1mb' }));

// CORS: allow the React frontend (Vite dev) to talk to the gateway.
// In a real system this would be stricter and environment-specific.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    // Preflight requests end here.
    return res.sendStatus(204);
  }

  next();
});

// Simple request timing + status logging for observability.
app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - started;
    console.log(
      `[gateway] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ service: 'gateway', status: 'ok' });
});

app.post('/merge', async (req, res) => {
  const { baseline, patches, conflictWindowMs } = req.body || {};

  // Basic shape validation at the edge so bad requests never reach internal services.
  if (typeof baseline !== 'object' || baseline === null || !Array.isArray(patches)) {
    return res.status(400).json({
      error: 'Request body must contain baseline (object) and patches (array)',
    });
  }

  // Optional API key validation. If API_KEY is not set, this is disabled.
  if (REQUIRED_API_KEY) {
    const apiKey = req.header('x-api-key');
    if (!apiKey || apiKey !== REQUIRED_API_KEY) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
  }

  try {
    const response = await fetch(`${AGGREGATOR_URL}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseline,
        patches,
        // probably shouldn't allow conflictWindowMs but it's good for the Demo.
        ...(typeof conflictWindowMs === 'number' ? { conflictWindowMs } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error('Error forwarding /merge to aggregator:', err);
    return res
      .status(502)
      .json({ error: 'Failed to reach aggregator service' });
  }
});

module.exports = app;
