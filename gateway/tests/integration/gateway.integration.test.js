const express = require('express');
const http = require('http');
const request = require('supertest');

describe('Gateway → Aggregator integration', () => {
  let server, port, app;

  beforeAll((done) => {
    const stub = express();
    stub.use(express.json());
    stub.post('/merge', (req, res) => res.json({ ok: true, ...req.body }));

    server = http.createServer(stub);
    server.listen(0, () => {
      port = server.address().port;
      process.env.AGGREGATOR_URL = `http://127.0.0.1:${port}`;
      process.env.API_KEY = 'test-key';

      jest.resetModules();
      app = require('../../app');
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
    delete process.env.AGGREGATOR_URL;
    delete process.env.API_KEY;
  });

  it('forwards /merge to the aggregator', async () => {
    const body = {
      baseline: { id: 1 },
      patches: [{ timestamp: 1, deviceId: 'x', patch: { mood: 'Happy' } }],
    };

    const res = await request(app)
      .post('/merge')
      .set('x-api-key', 'test-key')
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      baseline: { id: 1 },
      patches: [{ timestamp: 1, deviceId: 'x', patch: { mood: 'Happy' } }],
    });
  });
});
