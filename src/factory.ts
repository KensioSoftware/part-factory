import type { DeepPartialObject } from "./partial/deep-partial.js";

/**
 * The dependency arguments a factory takes after its overrides.
 *
 * A factory declaring no dependencies takes no dependency argument, so
 * factories without dependencies keep the call signature they always had.
 */
export type DependencyArguments<Dependencies> = [Dependencies] extends [
  undefined,
]
  ? []
  : [dependencies: Dependencies];

export type ItemMaker<T extends object, Dependencies = undefined> = (
  overrides?: DeepPartialObject<T>,
  ...dependencies: DependencyArguments<Dependencies>
) => T;

export interface ItemFactory<T extends object, Dependencies = undefined> {
  make: ItemMaker<T, Dependencies>;
}
