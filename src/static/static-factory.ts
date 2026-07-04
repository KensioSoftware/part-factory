import type { DeepPartialObject } from "../partial/deep-partial.js";
import { override } from "../partial/override.js";
import type { ItemFactory } from "../factory.js";

/**
 * Creates complete items from static default values and optional overrides.
 */
export class StaticFactory<T extends object> implements ItemFactory<T> {
  constructor(private readonly defaults: T) {}

  /**
   * Create an item by applying overrides to static defaults.
   */
  make(overrides: DeepPartialObject<T> = {}): T {
    return override(this.defaults, overrides);
  }
}
