import Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import { Path, createPathBuilder, getPath } from "./path_builder.js";

export type PathBuilder<T, C, U> = (data: Path<T>, context: Path<C>) => Path<U>;

export class TypedModel<T extends object, C extends object = never> {
  readonly name: string | undefined;
  readonly model: JSONModel;
  readonly context?: Context;

  constructor(data: T);
  constructor(model: JSONModel);
  constructor(name: string | undefined, data: T);
  constructor(name: string | undefined, model: JSONModel, context?: Context);
  constructor(...args: unknown[]) {
    if (args.length === 1) args = [undefined, args[0]];

    const [name, data, context] = args as [
      name: string | undefined,
      data: T | JSONModel,
      context?: Context
    ];

    this.name = name;
    this.model = data instanceof JSONModel ? data : new JSONModel(data);
    this.context = context;
  }

  setOn(obj: { setModel(model: JSONModel, name?: string): void }): this {
    obj.setModel(this.model, this.name);
    return this;
  }

  createContextModel<U extends object>(
    f: PathBuilder<T, C, U>
  ): TypedModel<T, U> {
    const path = getPath(f(createPathBuilder("/"), createPathBuilder("")));
    const newContext = this.model.createBindingContext(path, this.context)!;
    const model = new TypedModel<T, U>(this.name, this.model, newContext);

    return model;
  }

  path<U>(f: PathBuilder<T, C, U>): string {
    return getPath(f(createPathBuilder("/"), createPathBuilder("")));
  }

  get<U>(f: PathBuilder<T, C, U>): U {
    const path = this.path(f);
    return this.model.getProperty(path, this.context);
  }

  set<U>(f: PathBuilder<T, C, U>, value: U): this {
    const path = this.path(f);
    this.model.setProperty(path, value, this.context);
    return this;
  }

  getData(): T {
    return this.model.getData();
  }

  setData(data: T, merge?: boolean): this {
    this.model.setData(data, merge);
    return this;
  }
}
