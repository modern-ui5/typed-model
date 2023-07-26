const pathSym = Symbol("path");

export type Path<T> = {
  [pathSym]: string;
} & {
  [K in Extract<keyof T, string | number>]: Path<T[K]>;
};

export function createPathBuilder<T>(path: string): Path<T> {
  return new Proxy(
    {
      [pathSym]: path,
    } as Path<T>,
    {
      get(target, name) {
        return typeof name === "symbol"
          ? target[pathSym]
          : createPathBuilder(`${path}/${name}`);
      },
    }
  );
}

export function getPath<T>(builder: Path<T>): string {
  return builder[pathSym];
}
