/**
 * Returns true if value is a plain object (not an array, not null).
 */
function isPlainObject(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * Deep clone JSON-like values (objects, arrays, primitives).
 */
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

module.exports = {
  isPlainObject,
  deepClone,
};
