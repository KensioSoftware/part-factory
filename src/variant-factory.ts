import type { DeepPartialObject } from "./deep-partial.js";
import { override } from "./override.js";
import type { ItemFactory } from "./factory.js";

/**
 * Creates complete items from a base factory and preset variant overrides.
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
    return this.factory.make(override(this.presetOverrides, overrides));
  }
}
