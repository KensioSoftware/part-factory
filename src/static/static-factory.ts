import type { DeepPartialObject } from "../partial/deep-partial.js";
import { override } from "../partial/override.js";
import type { ItemFactory } from "../factory.js";

/**
 * Creates complete items from one static set of default values.
 *
 * Use this factory when the default object can be reused for every item.
 * Each call to `make` starts with the configured defaults and applies any
 * deep partial overrides provided for that item.
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   active: boolean;
 * }
 *
 * const userFactory = new StaticFactory<User>({
 *   name: "Test User",
 *   active: true,
 * });
 *
 * const defaultUser = userFactory.make();
 * // { name: "Test User", active: true }
 *
 * const inactiveUser = userFactory.make({ active: false });
 * // { name: "Test User", active: false }
 * ```
 */
export class StaticFactory<T extends object> implements ItemFactory<T> {
  constructor(private readonly defaults: T) {}

  /**
   * Create an item by applying overrides to static defaults.
   *
   * The merge copies the plain objects and arrays it finds, so each item gets
   * its own copy of the nested structure and the defaults held here are left
   * alone.
   */
  make(overrides: DeepPartialObject<T> = {}): T {
    return override(this.defaults, overrides);
  }
}
