import type { DeepPartialObject } from "../partial/deep-partial.js";
import { override } from "../partial/override.js";
import type { ItemFactory, ItemMaker } from "../factory.js";

/**
 * Creates complete items from a function that builds default values.
 *
 * Use this factory when defaults should be generated fresh for each item,
 * such as when values need to be unique, random, or based on the requested
 * overrides. The default maker receives the same overrides passed to `make`,
 * then the overrides are applied to the generated defaults.
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   active: boolean;
 * }
 *
 * const userFactory = new DynamicFactory<User>(() => ({
 *   id: crypto.randomUUID(),
 *   name: "Test User",
 *   active: true,
 * }));
 *
 * const defaultUser = userFactory.make();
 * // { id: "...", name: "Test User", active: true }
 *
 * const inactiveUser = userFactory.make({ active: false });
 * // { id: "...", name: "Test User", active: false }
 * ```
 */
export class DynamicFactory<T extends object> implements ItemFactory<T> {
  constructor(private readonly makeDefaults: ItemMaker<T>) {}

  /**
   * Create an item by building defaults and applying overrides.
   */
  make(overrides: DeepPartialObject<T> = {}): T {
    return override(this.makeDefaults(overrides), overrides);
  }
}
