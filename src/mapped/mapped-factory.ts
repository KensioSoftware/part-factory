import type { DeepPartialObject } from "../partial/deep-partial.js";
import { override } from "../partial/override.js";

/**
 * Creates output values by mapping a completed input object.
 *
 * Use this factory when the values you want to override are easiest to model
 * as an object, but the final value should be a different shape or type. Each
 * call to `make` builds the input defaults, applies deep partial overrides,
 * and passes the completed input to the mapper function.
 * @example
 * ```typescript
 * interface UrlParts {
 *   protocol: "https";
 *   host: string;
 *   path: string;
 * }
 *
 * const urlFactory = new MappedFactory<UrlParts, string>(
 *   () => ({
 *     protocol: "https",
 *     host: "example.com",
 *     path: "/users",
 *   }),
 *   (parts) => `${parts.protocol}://${parts.host}${parts.path}`,
 * );
 *
 * const defaultUrl = urlFactory.make();
 * // "https://example.com/users"
 *
 * const apiUrl = urlFactory.make({ path: "/api/users" });
 * // "https://example.com/api/users"
 * ```
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
