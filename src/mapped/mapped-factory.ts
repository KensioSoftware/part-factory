import type { DeepPartialObject } from "../partial/deep-partial.js";
import { override } from "../partial/override.js";

/**
 * Creates output values by building an input object, applying overrides,
 * and mapping the completed input into an output value.
 */
export class MappedFactory<Input extends object, Output> {
  constructor(
    private readonly makeInput: () => Input,
    private readonly map: (input: Input) => Output,
  ) {}

  /**
   * Create an output by building input defaults, applying input overrides,
   * and mapping the completed input.
   */
  make(overrides: DeepPartialObject<Input> = {}): Output {
    return this.map(override(this.makeInput(), overrides));
  }
}
