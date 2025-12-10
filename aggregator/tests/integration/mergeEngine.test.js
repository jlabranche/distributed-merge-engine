const { mergePatches } = require('../../lib/mergeEngine');

describe('mergePatches (scenario)', () => {
  it('handles the classic Alice / Bob mood and notes example', () => {
    const baseline = { id: 1, mood: 'Neutral', notes: [] };

    const patches = [
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
    ];

    const { finalState, conflicts } = mergePatches(baseline, patches);

    expect(finalState).toEqual({
      id: 1,
      mood: 'Sad',
      notes: ['Great session', 'Client seemed tired'],
    });

    const fields = new Set(conflicts.map((c) => c.fieldPath));
    expect([...fields]).toEqual(['mood', 'notes']);
  });
});
