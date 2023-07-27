declare const typeSym: unique symbol;
const pathSym = Symbol("path");

interface PathType<T> {
  [typeSym]?: [T];
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

export function getPath<T>(builder: Path<T>): string {
  return builder[pathSym];
}
