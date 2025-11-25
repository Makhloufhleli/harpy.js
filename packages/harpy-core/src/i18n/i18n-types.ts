/**
 * Type utilities for type-safe translations
 */

/**
 * Extract nested keys from an object type with dot notation
 * @example
 * type Dict = { user: { name: string; age: number }; welcome: string };
 * type Keys = NestedKeyOf<Dict>; // 'user.name' | 'user.age' | 'welcome'
 */
export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & string]: ObjectType[Key] extends object
    ? ObjectType[Key] extends Array<any>
      ? Key
      : `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : Key;
}[keyof ObjectType & string];

/**
 * Extract the value type at a given key path
 * @example
 * type Dict = { user: { name: string }; count: number };
 * type Value = DeepValue<Dict, 'user.name'>; // string
 */
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

/**
 * Extract variable names from a translation string
 * @example
 * type Vars = ExtractVariables<"Hello {{name}}, you have {{count}} messages">;
 * // { name: string | number; count: string | number }
 */
export type ExtractVariables<T extends string> =
  T extends `${string}{{${infer Var}}}${infer Rest}`
    ? { [K in Var | keyof ExtractVariables<Rest>]: string | number }
    : Record<string, never>;

/**
 * Check if a translation string requires variables
 */
export type RequiresVariables<T> = T extends string
  ? T extends `${string}{{${string}}}${string}`
    ? true
    : false
  : false;
