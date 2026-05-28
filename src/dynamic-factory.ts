import type { DeepPartialObject } from "./deep-partial.js";
import { override } from "./override.js";
import type { ItemFactory, ItemMaker } from "./factory.js";

/**
 * Creates complete items from a default item maker and optional overrides.
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
