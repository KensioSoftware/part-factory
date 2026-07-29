import type { DeepPartialObject } from "../partial/deep-partial.js";
import { override } from "../partial/override.js";
import type { DependencyArguments, ItemFactory } from "../factory.js";

/**
 * Creates complete items from another factory with preset overrides.
 *
 * Use this factory to describe a named variation of a base factory without
 * duplicating all the base defaults. The preset overrides are applied first,
 * then any overrides passed to `make` can further customize the final item.
 *
 * Any dependencies the base factory declares are forwarded to it, so a variant
 * of a factory with dependencies is made in the same way as any other variant.
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
export class VariantFactory<
  T extends object,
  Dependencies = undefined,
> implements ItemFactory<T, Dependencies> {
  constructor(
    private readonly factory: ItemFactory<T, Dependencies>,
    private readonly presetOverrides: DeepPartialObject<T>,
  ) {}

  /**
   * Create an item by applying preset variant overrides for the base factory.
   */
  make(
    overrides: DeepPartialObject<T> = {},
    ...dependencies: DependencyArguments<Dependencies>
  ): T {
    return this.factory.make(
      override<T>(this.presetOverrides, overrides),
      ...dependencies,
    );
  }
}
