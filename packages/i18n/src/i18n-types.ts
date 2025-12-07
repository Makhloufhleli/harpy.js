export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & string]: ObjectType[Key] extends object
    ? ObjectType[Key] extends Array<any>
      ? Key
      : `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : Key;
}[keyof ObjectType & string];

export type DeepValue<
  T,
  K extends string,
> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? Rest extends string
      ? DeepValue<T[First], Rest>
      : never
    : never
  : K extends keyof T
    ? T[K]
    : never;

export type ExtractVariables<T extends string> =
  T extends `${string}{{${infer Var}}}${infer Rest}`
    ? { [K in Var | keyof ExtractVariables<Rest>]: string | number }
    : Record<string, never>;

export type RequiresVariables<T> = T extends string
  ? T extends `${string}{{${string}}}${string}`
    ? true
    : false
  : false;
