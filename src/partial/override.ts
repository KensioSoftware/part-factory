import type { DeepPartialObject } from "./deep-partial.js";

/**
 * Assigning this key would set the prototype of the object being built, so an
 * override carrying it is skipped rather than applied.
 */
const prototypeKey = "__proto__";

/**
 * Whether a value is an ordinary object literal, as opposed to a class
 * instance, a `Date`, a `Map` or anything else with its own prototype.
 *
 * Only plain objects are merged into. Anything else is treated as a single
 * value and replaced whole, which keeps its prototype and its internal state
 * intact.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const prototype: unknown = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

/**
 * Copy the plain objects and arrays within a value, so that made items never
 * share mutable structure with the factory defaults or with each other.
 *
 * Values that are not plain objects or arrays are used as they are. A stub, a
 * class instance or a `Date` held in the defaults is passed through to the made
 * item rather than copied, because copying it would either fail or quietly
 * produce something that no longer behaves like the original.
 */
function copy(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((element: unknown) => copy(element));
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};

    for (const [key, property] of Object.entries(value)) {
      result[key] = copy(property);
    }

    return result;
  }

  return value;
}

/**
 * Merge overrides onto a base value, building a new value from both.
 *
 * A key present in the overrides wins, whatever its value. Presence is what
 * decides, so `{ foo: undefined }` sets `foo` to `undefined`, and leaving the
 * default in place is done by omitting the key.
 *
 * Two plain objects are merged key by key. Everything else, including arrays,
 * is replaced whole, so overriding a list of two items with a list of one item
 * gives a list of one item.
 */
function merge(base: unknown, overrides: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(overrides)) {
    return copy(overrides);
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(base)) {
    result[key] = copy(value);
  }

  // Object.entries lists a key whose value is undefined, which is the whole
  // point here: an override says what to set by naming the key, not by giving
  // a value that happens to be defined.
  for (const [key, value] of Object.entries(overrides)) {
    if (key === prototypeKey) {
      continue;
    }

    result[key] = Object.hasOwn(base, key)
      ? merge(base[key], value)
      : copy(value);
  }

  return result;
}

/** Override a base object with partial overrides. */
export function override<T extends object>(
  base: T,
  overrides: DeepPartialObject<T>,
): T;

export function override<T extends object>(
  base: DeepPartialObject<T>,
  overrides: DeepPartialObject<T>,
): DeepPartialObject<T>;

export function override(base: object, overrides: object): object {
  return merge(base, overrides) as object;
}
