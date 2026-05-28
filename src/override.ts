import _ from "lodash";

import type { DeepPartialObject } from "./deep-partial.js";

/** Override a base object with partial overrides. */
export function override<T extends object>(
  base: T,
  overrides: DeepPartialObject<T>,
): T {
  return _.defaultsDeep(overrides, base) as T;
}
