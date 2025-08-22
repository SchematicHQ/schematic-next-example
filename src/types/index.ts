export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object | undefined
      ? DeepPartial<T[K]>
      : T[K];
};
