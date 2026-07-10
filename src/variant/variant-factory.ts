import type { DeepPartialObject } from "../partial/deep-partial.js";
import { override } from "../partial/override.js";
import type { ItemFactory } from "../factory.js";

/**
 * Creates complete items from another factory with preset overrides.
 *
 * Use this factory to describe a named variation of a base factory without
 * duplicating all the base defaults. The preset overrides are applied first,
 * then any overrides passed to `make` can further customize the final item.
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   role: "user" | "admin";
 *   active: boolean;
 * }
 *
 * const userFactory = new StaticFactory<User>({
 *   name: "Test User",
 *   role: "user",
 *   active: true,
 * });
 *
 * const adminFactory = new VariantFactory<User>(userFactory, {
 *   role: "admin",
 * });
 *
 * const admin = adminFactory.make();
 * // { name: "Test User", role: "admin", active: true }
 *
 * const inactiveAdmin = adminFactory.make({ active: false });
 * // { name: "Test User", role: "admin", active: false }
 * ```
 */
export class VariantFactory<T extends object> implements ItemFactory<T> {
  constructor(
    private readonly factory: ItemFactory<T>,
    private readonly presetOverrides: DeepPartialObject<T>,
  ) {}

  /**
   * Create an item by applying preset variant overrides for the base factory.
   */
  make(overrides: DeepPartialObject<T> = {}): T {
    return this.factory.make(override<T>(this.presetOverrides, overrides));
  }
}
