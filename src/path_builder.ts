const typeSym = Symbol("type");
const pathSym = Symbol("path");

export type Path<T> = T extends never
  ? never
  : {
      [typeSym]?: T;
      [pathSym]: string;
    } & (T extends unknown[]
      ? {
          [K in Extract<keyof T, number>]: Path<T[K]>;
        }
      : T extends object
      ? {
          [K in Extract<keyof T, string | number>]: Path<T[K]>;
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
