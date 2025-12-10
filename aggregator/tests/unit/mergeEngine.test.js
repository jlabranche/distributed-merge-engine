const { mergePatches } = require('../../lib/mergeEngine');

describe('mergePatches', () => {
  it('uses last write wins on a single field', () => {
    const baseline = { id: 1, mood: 'Neutral' };
    const patches = [
      { timestamp: 600, deviceId: 'alice', patch: { mood: 'Happy' } },
      { timestamp: 605, deviceId: 'bob', patch: { mood: 'Sad' } },
    ];

    const { finalState, conflicts } = mergePatches(baseline, patches);

    expect(finalState.mood).toBe('Sad');
    expect(conflicts.map((c) => c.fieldPath)).toEqual(['mood']);
  });

  it('merges nested objects from different devices', () => {
    const baseline = { id: 1, mood: 'Neutral', details: { energy: 'Medium' } };

    const patches = [
      {
        timestamp: 600,
        deviceId: 'alice',
        patch: { details: { energy: 'High' } },
      },
      {
        timestamp: 605,
        deviceId: 'bob',
        patch: { details: { appetite: 'Low' } },
      },
    ];

    const { finalState } = mergePatches(baseline, patches);

    expect(finalState.details).toEqual({
      energy: 'High',
      appetite: 'Low',
    });
  });

  it('concatenates array values instead of overwriting', () => {
    const baseline = { id: 1, notes: [] };

    const patches = [
      {
        timestamp: 600,
        deviceId: 'alice',
        patch: { notes: ['Great session'] },
      },
      {
        timestamp: 605,
        deviceId: 'bob',
        patch: { notes: ['Client seemed tired'] },
      },
    ];

    const { finalState } = mergePatches(baseline, patches);

    expect(finalState.notes).toEqual([
      'Great session',
      'Client seemed tired',
    ]);
  });

  it('is stable when timestamps match', () => {
    const baseline = { flag: 'base' };
    const patches = [
      { timestamp: 600, deviceId: 'b', patch: { flag: 'b' } },
      { timestamp: 600, deviceId: 'a', patch: { flag: 'a' } },
    ];

    const { finalState } = mergePatches(baseline, patches);

    expect(finalState.flag).toBe('b');
  });
});
