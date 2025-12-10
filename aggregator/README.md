# Aggregator Service

This service implements the distributed merge engine responsible for resolving
conflicting offline edits from multiple clients using deterministic Last-Write-Wins logic,
deep JSON merging, and array append semantics.

## Files

### lib/mergeEngine.js
Contains the core merge algorithm:
- Sorts patches deterministically
- Applies deep merges recursively
- Appends arrays instead of overwriting
- Logs conflict metadata when writes occur close together

### helpers/objectHelpers.js
Utility functions used by the merge engine:

#### isPlainObject(value)
Returns true if the value is a plain object (non-null, non-array).
Used to decide whether the merge should recurse.

#### deepClone(value)
Creates a deep copy of nested objects, arrays, and primitives.
Ensures the merge engine does not mutate the original baseline or patches.

```js
function isPlainObject(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function deepClone(value) {
  if (Array.isArray(value)) {
    return value.map(deepClone);
  }
  if (isPlainObject(value)) {
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = deepClone(value[key]);
    }
    return result;
  }
  return value;
}
```

## How It Works
1. The aggregator receives:
   - `baseline` object
   - Array of `patch` operations `{ timestamp, deviceId, patch }`

2. Patches are sorted deterministically:
   - Timestamp → device → original index

3. Each field is merged using:
   - Deep merge for objects
   - Append for arrays
   - Replace for primitives
   - Conflict detection window (default 60 seconds)

4. The final resolved state and conflict list are returned.

## Running Locally
```
npm install
npm start
```

## Testing
Unit and integration tests verify:
- LWW correctness
- Deep merge behavior
- Array append semantics
- Conflict detection
