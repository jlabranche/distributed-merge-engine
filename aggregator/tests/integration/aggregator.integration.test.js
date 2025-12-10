const request = require('supertest');
const app = require('../../app');

describe('aggregator HTTP API', () => {
  it('POST /merge returns merged state and conflicts', async () => {
    const body = {
      baseline: { id: 1, mood: 'Neutral', notes: [] },
      patches: [
        { timestamp: 600, deviceId: 'alice', patch: { mood: 'Happy' } },
        { timestamp: 605, deviceId: 'bob', patch: { mood: 'Sad' } },
        {
          timestamp: 602,
          deviceId: 'alice',
          patch: { notes: ['Great session'] },
        },
        {
          timestamp: 606,
          deviceId: 'bob',
          patch: { notes: ['Client seemed tired'] },
        },
      ],
      conflictWindowMs: 6,
    };

    const res = await request(app)
      .post('/merge')
      .send(body);

    expect(res.body).toHaveProperty('finalState');
    expect(res.body).toHaveProperty('conflicts');

    expect(res.body.finalState).toEqual({
      id: 1,
      mood: 'Sad',
      notes: ['Great session', 'Client seemed tired'],
    });

    const moodConflicts = res.body.conflicts.filter(
      (c) => c.fieldPath === 'mood'
    );
    expect(moodConflicts.length).toBeGreaterThan(0);
  });

  it('POST /merge returns 400 for invalid body', async () => {
    const res = await request(app)
      .post('/merge')
      .send({ foo: 'bar' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      'error',
      'Request body must contain baseline (object) and patches (array)'
    );
  });
});
