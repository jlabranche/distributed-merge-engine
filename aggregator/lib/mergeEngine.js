const { isPlainObject, deepClone } = require('../helpers/objectHelpers');

const DEFAULT_CONFLICT_WINDOW_MS = 6;

function mergePatches(baseline, patches, conflictWindowMs = DEFAULT_CONFLICT_WINDOW_MS) {
  if (!Array.isArray(patches) || patches.length === 0) {
    return { finalState: deepClone(baseline), conflicts: [] };
  }

  const patchesWithIndex = patches.map((p, index) => ({ ...p, _idx: index }));

  // Deterministic ordering: timestamp, deviceId, original index
  patchesWithIndex.sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    if (a.deviceId !== b.deviceId) {
      return String(a.deviceId).localeCompare(String(b.deviceId));
    }
    return a._idx - b._idx;
  });

  const state = deepClone(baseline);
  const lastWriteByPath = new Map();
  const conflicts = [];

  for (const p of patchesWithIndex) {
    applyPatch(
      state,
      p.patch || {},
      p.timestamp,
      '',
      lastWriteByPath,
      conflicts,
      conflictWindowMs,
      p.deviceId
    );
  }

  return { finalState: state, conflicts };
}

/**
 * Recursively apply a patch object into target.
 */
function applyPatch(
  target,
  patchObj,
  patchTs,
  pathPrefix,
  lastWriteByPath,
  conflicts,
  conflictWindowMs,
  deviceId
) {
  for (const key of Object.keys(patchObj)) {
    const value = patchObj[key];
    const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;

    if (isPlainObject(value)) {
      if (!isPlainObject(target[key])) {
        target[key] = {};
      }
      applyPatch(
        target[key],
        value,
        patchTs,
        fullPath,
        lastWriteByPath,
        conflicts,
        conflictWindowMs,
        deviceId
      );
    } else {
      applyLeafValue(
        target,
        key,
        value,
        fullPath,
        patchTs,
        deviceId,
        lastWriteByPath,
        conflicts,
        conflictWindowMs
      );
    }
  }
}

/**
 * Handle non-object leaf values (arrays and primitives) with LWW + array append semantics.
 */
function applyLeafValue(
  target,
  key,
  value,
  fullPath,
  patchTs,
  deviceId,
  lastWriteByPath,
  conflicts,
  conflictWindowMs
) {
  recordConflictIfNeeded(
    fullPath,
    patchTs,
    deviceId,
    lastWriteByPath,
    conflicts,
    conflictWindowMs
  );

  if (Array.isArray(value)) {
    // Arrays: append items rather than overwrite
    const current = target[key];
    if (Array.isArray(current)) {
      target[key] = current.concat(value);
    } else {
      target[key] = deepClone(value);
    }
  } else {
    // Primitive or null → LWW overwrite
    target[key] = value;
  }
}

function recordConflictIfNeeded(
  path,
  currentTs,
  currentDeviceId,
  lastWriteByPath,
  conflicts,
  conflictWindowMs
) {
  const previous = lastWriteByPath.get(path);
  if (previous) {
    const delta = currentTs - previous.ts;
    if (delta >= 0 && delta < conflictWindowMs) {
      conflicts.push({
        fieldPath: path,
        previousWriteTs: previous.ts,
        currentWriteTs: currentTs,
        previousDeviceId: previous.deviceId,
        currentDeviceId,
      });
    }
  }
  lastWriteByPath.set(path, { ts: currentTs, deviceId: currentDeviceId });
}

module.exports = {
  mergePatches,
};
