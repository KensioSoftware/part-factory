import type { DeepPartialObject } from "../partial/deep-partial.js";
import { override } from "../partial/override.js";
import type { DependencyArguments } from "../factory.js";

/**
 * Creates output values asynchronously by mapping a completed input object.
 *
 * Use this factory when producing the value is asynchronous, such as when the
 * entity has to be created in a database, a client or a simulator, or when the
 * value has to be fetched, signed or encoded by something that returns a
 * promise. Each call to `make` builds the input defaults, applies deep partial
 * overrides, and passes the completed input to the mapper function.
 *
 * The overrides describe what is asked for, and the return value is what comes
 * back, so the two are separate types in the same way as `MappedFactory`.
 *
 * The mapper function can also declare dependencies, which are passed to `make`
 * after the overrides. Only the mapper function is awaited, so anything that
 * has to be fetched first is fetched before `make` is called and passed in as
 * an override or a dependency.
 * @example
 * ```typescript
 * interface NewUser {
 *   name: string;
 *   email: string;
 * }
 *
 * interface User extends NewUser {
 *   id: string;
 * }
 *
 * interface UserDatabase {
 *   insertUser(newUser: NewUser): Promise<User>;
 * }
 *
 * const userFactory = new AsyncMappedFactory<
 *   NewUser,
 *   User,
 *   { database: UserDatabase }
 * >(
 *   () => ({
 *     name: "Test User",
 *     email: "test.user@example.com",
 *   }),
 *   (newUser, { database }) => database.insertUser(newUser),
 * );
 *
 * const user = await userFactory.make({}, { database });
 * // { id: "...", name: "Test User", email: "test.user@example.com" }
 *
 * const namedUser = await userFactory.make({ name: "Foo" }, { database });
 * // { id: "...", name: "Foo", email: "test.user@example.com" }
 * ```
 */
export class AsyncMappedFactory<
  Input extends object,
  Output,
  Dependencies = undefined,
> {
  constructor(
    private readonly makeInput: () => Input,
    private readonly map: (
      input: Input,
      ...dependencies: DependencyArguments<Dependencies>
    ) => Promise<Output>,
  ) {}

  /**
   * Create an output by building input defaults, applying input overrides, and
   * mapping the completed input asynchronously.
   */
  make(
    overrides: DeepPartialObject<Input> = {},
    ...dependencies: DependencyArguments<Dependencies>
  ): Promise<Output> {
    return this.map(override(this.makeInput(), overrides), ...dependencies);
  }
}
