import _ from "lodash";

import type { DeepPartialObject } from "./deep-partial.js";

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
  return _.defaultsDeep(overrides, base) as object;
}
