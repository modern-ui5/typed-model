const pathSym = Symbol("path");

interface PathType<out T> {
  [pathSym]: string;
}

type U<T> = Exclude<T, undefined>;

export type Path<T> = PathType<T extends never ? never : T> &
  (U<T> extends unknown[]
    ? {
        [K in Extract<keyof U<T>, number>]: Path<U<T>[K] | undefined>;
      }
    : U<T> extends object
    ? {
        [K in Extract<keyof U<T>, string | number>]: Path<
          U<T>[K] | Extract<T, undefined>
        >;
      }
    : {});

/**
 * A function with which a property path can be constructed using dot-notation.
 *
 * ## Example
 *
 * The following corresponds to `/members/0/msg`:
 *
 * ```ts
 * (data) => data.members[0].msg
 * ```
 *
 * Relative paths are supported through the `context` argument:
 *
 * ```ts
 * (_, context) => context.contact.email
 * ```
 *
 * corresponds to the relative path `contact/email`.
 *
 * @template T The type of the model data.
 * @template C The type of the context data.
 * @template U The type of the selected property.
 */
export type PathBuilder<T, C, U> = Exclude<C, undefined> extends never
  ? (data: Path<T>) => Path<U>
  : (data: Path<T>, context: Path<C>) => Path<U>;

export function createPathBuilder<T>(
  path: string,
  root: boolean = true
): Path<T> {
  return new Proxy(
    { [pathSym]: path },
    {
      get(target, name) {
        return typeof name === "symbol"
          ? target[pathSym]
          : createPathBuilder(root ? path + name : `${path}/${name}`, false);
      },
    }
  ) as Path<T>;
}

export function getPath<T>(path: Path<T>): string {
  return path[pathSym];
}
