import type { DeepPartialObject } from "./deep-partial.js";

export type ItemMaker<T extends object> = (
  overrides?: DeepPartialObject<T>,
) => T;

export interface ItemFactory<T extends object> {
  make: ItemMaker<T>;
}
