type FunctionLike = (...arguments_: never[]) => unknown;

export type DeepPartialObject<T extends object> = {
  [P in keyof T]?: DeepPartial<T[P]>;
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
