type FunctionLike = (...arguments_: never[]) => unknown;

/**
 * Every property is optional and can be given as `undefined`.
 *
 * The `undefined` is written out rather than left to the optional marker so
 * that overriding a property with `undefined` is allowed in projects using
 * `exactOptionalPropertyTypes`. That setting is checked where the override is
 * written, against the type declared here, so the union has to be part of the
 * published type for those projects to be able to ask for `undefined` at all.
 */
export type DeepPartialObject<T extends object> = {
  [P in keyof T]?: DeepPartial<T[P]> | undefined;
};

export type DeepPartial<T> = T extends FunctionLike
  ? T
  : T extends Date
    ? T
    : T extends (infer U)[]
      ? DeepPartial<U>[]
      : T extends readonly (infer U)[]
        ? readonly DeepPartial<U>[]
        : T extends object
          ? DeepPartialObject<T>
          : T;
