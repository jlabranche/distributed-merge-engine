const request = require('supertest');

let app;

describe('gateway', () => {
  beforeAll(() => {
    process.env.API_KEY = 'test-api-key';
    jest.resetModules();
    app = require('../../app');
  });

  afterAll(() => {
    delete process.env.API_KEY;
  });

  beforeEach(() => {
    global.fetch = undefined;
  });

  it('GET /health returns service status', async () => {
    const res = await request(app).get('/health');

    expect(res.body).toEqual({ service: 'gateway', status: 'ok' });
  });

  it('POST /merge forwards to aggregator when request and API key are valid', async () => {
    const body = {
      baseline: { id: 1, mood: 'Neutral', notes: [] },
      patches: [{ timestamp: 600, deviceId: 'alice', patch: { mood: 'Happy' } }],
      conflictWindowMs: 60000,
    };

    const aggregatorResponse = {
      finalState: { id: 1, mood: 'Happy', notes: [] },
      conflicts: [],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => aggregatorResponse,
    });

    const res = await request(app)
      .post('/merge')
      .set('x-api-key', 'test-api-key')
      .send(body);

    expect(res.body).toEqual(aggregatorResponse);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('http://localhost:4000/merge');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      baseline: body.baseline,
      patches: body.patches,
      conflictWindowMs: body.conflictWindowMs,
    });
  });

  it('POST /merge returns 502 if aggregator call fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .post('/merge')
      .set('x-api-key', 'test-api-key')
      .send({
        baseline: { id: 1 },
        patches: [],
      });

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error', 'Failed to reach aggregator service');

    errorSpy.mockRestore();
  });

  it('POST /merge returns 400 for invalid body shape', async () => {
    const res = await request(app)
      .post('/merge')
      .set('x-api-key', 'test-api-key')
      .send({ foo: 'bar' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      'error',
      'Request body must contain baseline (object) and patches (array)'
    );
  });

  it('POST /merge returns 401 when API key is missing or incorrect', async () => {
    const validBody = {
      baseline: { id: 1, mood: 'Neutral' },
      patches: [],
    };

    // missing key
    const resMissing = await request(app)
      .post('/merge')
      .send(validBody);

    expect(resMissing.status).toBe(401);
    expect(resMissing.body).toHaveProperty('error', 'Invalid or missing API key');

    // wrong key
    const resWrong = await request(app)
      .post('/merge')
      .set('x-api-key', 'wrong-key')
      .send(validBody);

    expect(resWrong.status).toBe(401);
    expect(resWrong.body).toHaveProperty('error', 'Invalid or missing API key');
  });
});
