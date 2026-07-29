import type { DeepPartialObject } from "../partial/deep-partial.js";
import { override } from "../partial/override.js";
import type { DependencyArguments } from "../factory.js";

/**
 * Creates one entity in a system supplied by the caller.
 *
 * Use this factory when the entity has to be created in something, such as a
 * client or a simulator, so that creating it is asynchronous. Each call to
 * `create` builds the input defaults, applies deep partial overrides, and
 * passes the completed input to a function that creates the entity.
 *
 * The overrides describe what is asked for, and the return value is what comes
 * back, so the two are separate types in the same way as `MappedFactory`.
 *
 * Whatever the entity is created in is passed as a dependency at call time
 * rather than held by the factory, which keeps the factory free of state.
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
 * const user = await userFactory.create({}, { database });
 * // { id: "...", name: "Test User", email: "test.user@example.com" }
 *
 * const namedUser = await userFactory.create({ name: "Foo" }, { database });
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
    private readonly createOutput: (
      input: Input,
      ...dependencies: DependencyArguments<Dependencies>
    ) => Promise<Output>,
  ) {}

  /**
   * Create an entity by building input defaults, applying input overrides, and
   * passing the completed input to the creating function.
   */
  create(
    overrides: DeepPartialObject<Input> = {},
    ...dependencies: DependencyArguments<Dependencies>
  ): Promise<Output> {
    return this.createOutput(
      override(this.makeInput(), overrides),
      ...dependencies,
    );
  }
}
